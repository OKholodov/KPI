package com.netcracker.solutions.titalia.sparkle.pmdesktop;


import com.netcracker.ejb.core.NCCoreInternals;
import com.netcracker.ejb.framework.NCPrivilegedExceptionAction;
import com.netcracker.ejb.framework.NCProperties;
import com.netcracker.ejb.nls.NLSTools;
import com.netcracker.framework.cluster.ClusterService;
import com.netcracker.framework.command.ICommand;
import com.netcracker.framework.command.IExecutor;
import com.netcracker.framework.jdbc.JDBCTemplates;
import com.netcracker.framework.jdbc.JDBCTypeConverters;
import com.netcracker.framework.query.QueryFinder;
import com.netcracker.framework.transactions.TxUtils;
import com.netcracker.platform.core.ncdo.persistence.PersistenceConfigurationManager;
import com.netcracker.platform.core.ncdo.persistence.cache.CacheFacade;
import com.netcracker.platform.core.ncdo.persistence.cache.LegacyL2CacheProvider;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigInteger;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.Callable;

/**
 * Everything should be logged as ERROR or higher to trace the usage on prod/UAT â€“ cache reset should not be normally used
 */
public class CacheResetSupport {
    private static final Logger LOG = LoggerFactory.getLogger(CacheResetSupport.class);

    /**
     * This is to reset caches available only from the WEB class loader
     */
    public static volatile CacheResetSupportWeb cacheResetSupportWeb = new NullCacheResetSupportWeb();


    public void reset(final CacheResetRequest request) {
        LOG.error("reset: start request={}", request);

        try {

            TxUtils.doTxRequiresNew(new Callable<Void>() { // new tx to immediately send CacheResetCommand to other nodes
                @Override
                public Void call() throws Exception {
                    NCCoreInternals.doAsSystem(new NCPrivilegedExceptionAction() {
                        @Override
                        public Object run() throws Exception {
                            resetOnAllNodes(request); // reset caches via API which already sends JMS messages to other nodes
                            executeCommandAsync(new CacheResetCommand(request));

                            return null;
                        }
                    });

                    return null;
                }
            });

            resetLocal(request);

        } catch (RuntimeException exc) {
            LOG.error(exc.getMessage(), exc);
            throw exc;
        }

        LOG.error("reset: end");
    }

    protected void resetOnAllNodes(CacheResetRequest request) {
        // the methods below already send reset JMS messages to other cluster nodes
        long start = System.currentTimeMillis();

        if (request.resetNcdo) {
            // this will reset NCDO config caches, plugin caches and legacy l2 cache
            PersistenceConfigurationManager.getInstance().resetAll();
            PersistenceConfigurationManager.getInstance().resetObjectsCache();
        } else if (request.resetNcdoLegacyL2Cache) {
            // this will only reset legacy L2 cache
            PersistenceConfigurationManager.getInstance().resetObjectsCache();
        } else {
            // Reset Legacy L2 caches
            if (!request.objectIdsToLoadToLegacyL2Cache.isEmpty() ||
                    StringUtils.isNotBlank(request.queryForObjectsToLoadToLegacyL2Cache)) {

                loadObjectsToLegacyL2Cache(
                        resolveObjects(request.objectIdsToLoadToLegacyL2Cache, request.queryForObjectsToLoadToLegacyL2Cache),
                        request.persistenceConfigName, request.scenario);
            }

            if (!request.objectIdsToRefreshInLegacyL2Cache.isEmpty() ||
                    StringUtils.isNotBlank(request.queryForObjectsToRefreshInLegacyL2Cache)) {
                refreshObjectsInLegacyL2Cache(
                        resolveObjects(request.objectIdsToRefreshInLegacyL2Cache, request.queryForObjectsToRefreshInLegacyL2Cache),
                        request.withDescendants);
            }
        }

        cacheResetSupportWeb.resetOnAllNodes(request);

        long end = System.currentTimeMillis();
        LOG.error("resetOnAllNodes: request={} time={}ms", request, end-start);

    }

    public void resetLocal(final CacheResetRequest request) {
        LOG.error("resetLocal: start request={}", request);

        try {
            TxUtils.doTxRequired(new Callable<Void>() {
                @Override
                public Void call() throws Exception {
                    NCCoreInternals.doAsSystem(new NCPrivilegedExceptionAction() {
                        @Override
                        public Object run() throws Exception {
                            resetLocalInTx(request);
                            return null;
                        }
                    });

                    return null;
                }
            });

        } catch (RuntimeException exc) {
            LOG.error(exc.getMessage(), exc);
            throw new RuntimeException(exc);
        }

        LOG.error("resetLocal: end");
    }

    protected void resetLocalInTx(CacheResetRequest request) {
        long start = System.currentTimeMillis();

        if (request.resetNcProperties) {
            resetNcProperties();
        }

        if (request.resetQueryFinder) {
            resetQueryFinder();
        }

        if (request.resetNlsResources) {
            resetNlsResources();
        }

        resetLocalNcdoCaches(request);

        cacheResetSupportWeb.resetLocalInTx(request);

        // should be executed as a last statement
        if (request.runGC) {
            runGC();
        }

        long end = System.currentTimeMillis();
        LOG.error("resetLocalInTx: request={} time={}ms", request, end - start);
    }

    protected void resetNlsResources() {
        NLSTools.reloadNLSCaches();
    }

    protected void resetLocalNcdoCaches(CacheResetRequest request) {
        // if NCDO reset is requested, all NCDO caches will be reloaded anyway
        if (request.resetNcdo) {
            return;
        }

        // Reset plugin caches (Eh-Cache)
        if (request.reloadPluginCaches) {
            reloadPluginCaches();
        } else if (!request.pluginsToReload.isEmpty()) {
            reloadPluginCaches(request.pluginsToReload);
        }
    }

    protected void reloadPluginCaches() {
        CacheFacade.getPluginCachesReloader().reloadCaches(true);
    }

    protected void reloadPluginCaches(Collection<String> pluginIds) {
        for (String pluginId : pluginIds) {
            CacheFacade.getPluginCachesReloader().reloadCache(pluginId, true);
        }
    }

    protected void loadObjectsToLegacyL2Cache(Collection<BigInteger> objectIds, String persistenceConfigName, String scenario) {
        new LegacyL2CacheProvider().get().load(objectIds, persistenceConfigName, scenario);
    }

    protected void refreshObjectsInLegacyL2Cache(Collection<BigInteger> objectIds, boolean withDescendants) {
        new LegacyL2CacheProvider().get().refresh(objectIds, withDescendants);
    }

    protected void executeCommandAsync(ICommand command) {
        IExecutor executor = ClusterService.asyncGateway();
        executor.execute(command);
    }

    protected void resetQueryFinder() {
        QueryFinder.resetCache();
    }

    protected void resetNcProperties() {
        NCProperties.getInstance().cleanupCache();
    }

    protected void runGC() {
        System.gc();
    }

    @SuppressWarnings("unchecked")
    protected Collection<BigInteger> resolveObjects(Collection<BigInteger> ids, String selectQuery) {
        LOG.error("resolveObjects: ids.size={} query={}", ids.size(), selectQuery);

        Set<BigInteger> result = new HashSet<>(ids);
        if (StringUtils.isNotBlank(selectQuery)) {
            result.addAll(getTemplates().selectForList(selectQuery, JDBCTypeConverters.NUMBER_CONVERTER, new Object[][]{}));
        }

        return result;
    }

    protected JDBCTemplates getTemplates() {
        return NCCoreInternals.jdbcInstance();
    }

    public static final class CacheResetCommand implements ICommand {
        private static final long serialVersionUID = -6643771302775576812L;

        private final CacheResetRequest request;

        public CacheResetCommand(CacheResetRequest request) {
            this.request = request;
        }

        @Override
        public Object execute() {
            new CacheResetSupport().resetLocal(request);

            return null;
        }
    }

    public interface CacheResetSupportWeb {
        void resetOnAllNodes(CacheResetRequest request);
        void resetLocalInTx(CacheResetRequest request);
    }

    public static final class NullCacheResetSupportWeb implements CacheResetSupportWeb {
        @Override
        public void resetOnAllNodes(CacheResetRequest request) {
            LOG.error("NullCacheResetSupportWeb.resetOnAllNodes: request={}", request);
        }

        @Override
        public void resetLocalInTx(CacheResetRequest request) {
            LOG.error("NullCacheResetSupportWeb.resetLocalInTx: request={}", request);
        }
    }
}