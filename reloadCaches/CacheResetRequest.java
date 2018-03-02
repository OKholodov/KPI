package com.netcracker.solutions.titalia.sparkle.pmdesktop;

import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

import java.io.Serializable;
import java.math.BigInteger;
import java.util.HashSet;
import java.util.Set;

public class CacheResetRequest implements Serializable {
    private static final long serialVersionUID = -4772388220931545618L;

    public boolean resetWebCache;
    public Boolean disableWebCache;
    public Boolean enableInMemoryLoggingForWebCache;
    public String acceptRegExpForInMemoryLogs;
    public boolean resetInMemoryLogs;
    public Boolean logCookiesForWebCache;
    public Boolean logSessionDataForWebCache;

    public boolean resetQueryFinder;
    public boolean resetNcProperties;
    public boolean resetNlsResources;
    public boolean runGC;
    public boolean resetTuiMenus;
    public boolean resetGlobalResourceBundle;
    public boolean resetOeConfigProvider;

    public boolean resetNcdo;
    public boolean resetCustomListValuesCache;
    public boolean resetNcdoLegacyL2Cache;

    public boolean reloadPluginCaches;
    public final Set<String> pluginsToReload = new HashSet<>();

    public final Set<BigInteger> objectIdsToLoadToLegacyL2Cache = new HashSet<>();
    public String queryForObjectsToLoadToLegacyL2Cache;
    public String persistenceConfigName;
    public String scenario;

    public final Set<BigInteger> objectIdsToRefreshInLegacyL2Cache = new HashSet<>();
    public String queryForObjectsToRefreshInLegacyL2Cache;
    public boolean withDescendants;

    @Override
    public String toString() {
        return ReflectionToStringBuilder.toString(this, ToStringStyle.NO_CLASS_NAME_STYLE);
    }
}