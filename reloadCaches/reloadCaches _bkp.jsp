<%@ page import="com.netcracker.ejb.cluster.NodeManager" %>
<%@ page import="com.netcracker.ejb.core.users.UserFacade" %>
<%@ page import="com.netcracker.jsp.NotAuthorizedException" %>
<%@ page import="com.netcracker.jsp.UniPage" %>
<%@ page import="com.netcracker.solutions.tfnfs.toms.admin.CacheResetRequest" %>
<%@ page import="com.netcracker.solutions.tfnfs.toms.admin.CacheResetSupport" %>
<%@ page import="org.apache.commons.lang.StringUtils" %>
<%@ page import="java.io.IOException" %>
<%@ page import="java.io.PrintWriter" %>
<%@ page import="java.io.StringWriter" %>
<%@ page import="java.math.BigInteger" %>
<%@ page import="java.util.*" %>
<%@ page import="com.netcracker.jsp.BasicDesign" %>
<%

    class ThisPage extends UniPage {
        final String OPTION_HTML = "<div class=\"line\"><label for=\"@id\"><input id=\"@id\" name=\"@id\" type=\"checkbox\" checked/>@label</label></div>";
        final String TEXT_AREA_HTML = "<div class=\"line\"><label for=\"@id\">@label</label><textarea rows=\"3\" cols=\"100\" id=\"@id\" name=\"@id\">@value</textarea></div>";
        final String SELECT_HTML = "<div class=\"line\"><label for=\"@id\">@label</label><select id=\"@id\" name=\"@id\">@options</select></div>";
        final String SELECT_OPTION_HTML = "<option value=\"@value\" selected>@value</option>";
        final String EMPTY_SELECT_OPTION_HTML = "<option value=\"\"></option>";
        final String RESET_DETAILS_HTML = "<div class=\"line\">Finished in @time ms, request:<div>@request</div></div>";
        final String EXCEPTION_HTML = "<div class=\"line exception\" style=\"position: absolute; height: 150px; bottom: 0; right: 0; left: 0; overflow: auto; background:white;\">" +
                "<b>@message</b><pre>@stacktrace</pre></div>";
        final String RUNNING_NODES_HTML = "<div class=\"line\">Running nodes:<pre>@value</pre></div>";


        long start;
        long end;

        boolean resetLocal;
        boolean reset;

        CacheResetRequest request = new CacheResetRequest();

        Throwable exc;

        public ThisPage() {
            super();

            ((BasicDesign)idesign).setDocumentTitle("Reload Caches");
        }

        public void parseParameters() {
            resetLocal = "on".equalsIgnoreCase(getValidParameter("resetLocal"));
            reset = "post".equalsIgnoreCase(getRequest().getMethod());


            request.resetQueryFinder = "on".equalsIgnoreCase(getValidParameter("resetQueryFinder"));
            request.resetNcProperties = "on".equalsIgnoreCase(getValidParameter("resetNcProperties"));
            request.resetNlsResources = "on".equalsIgnoreCase(getValidParameter("resetNlsResources"));
            request.resetTuiMenus = "on".equalsIgnoreCase(getValidParameter("resetTuiMenus"));
            request.resetGlobalResourceBundle = "on".equalsIgnoreCase(getValidParameter("resetGlobalResourceBundle"));
            request.resetOeConfigProvider = "on".equalsIgnoreCase(getValidParameter("resetOeConfigProvider"));
            request.resetCustomListValuesCache = "on".equalsIgnoreCase(getValidParameter("resetCustomListValuesCache"));

            request.resetNcdo = "on".equalsIgnoreCase(getValidParameter("resetNcdo"));
            request.resetNcdoLegacyL2Cache = "on".equalsIgnoreCase(getValidParameter("resetNcdoLegacyL2Cache"));

            request.reloadPluginCaches = "on".equalsIgnoreCase(getValidParameter("reloadPluginCaches"));
            request.pluginsToReload.clear();
            String[] pluginsToReload = getRequest().getParameterValues("pluginsToReload");
            if (pluginsToReload != null && pluginsToReload.length > 0) {
                request.pluginsToReload.addAll(Arrays.asList(pluginsToReload));
            }

            request.objectIdsToLoadToLegacyL2Cache.clear();
            request.objectIdsToLoadToLegacyL2Cache.addAll(parseIds(getValidParameter("objectIdsToLoadToLegacyL2Cache")));
            request.queryForObjectsToLoadToLegacyL2Cache = getValidParameter("queryForObjectsToLoadToLegacyL2Cache");
            String persistenceConfigNameToScenario = getValidParameter("persistenceConfigName_scenario");
            if (StringUtils.isNotEmpty(persistenceConfigNameToScenario)) {
                int atIdx = persistenceConfigNameToScenario.indexOf('@');
                request.persistenceConfigName = persistenceConfigNameToScenario.substring(0, atIdx);
                request.scenario = persistenceConfigNameToScenario.substring(atIdx + 1);
            }

            request.objectIdsToRefreshInLegacyL2Cache.clear();
            request.objectIdsToRefreshInLegacyL2Cache.addAll(parseIds(getValidParameter("objectIdsToRefreshInLegacyL2Cache")));
            request.queryForObjectsToRefreshInLegacyL2Cache = getValidParameter("queryForObjectsToRefreshInLegacyL2Cache");
            request.withDescendants = "on".equalsIgnoreCase(getValidParameter("withDescendants"));

            request.runGC = "on".equalsIgnoreCase(getValidParameter("runGC"));
        }

        protected Collection<BigInteger> parseIds(String input) {
            if (StringUtils.isBlank(input)) {
                return Collections.emptySet();
            }

            Set<BigInteger> ids = new HashSet<BigInteger>();
            for (String token : input.split("\\D")) {
                if (token.matches("^\\d+$")) {
                    ids.add(new BigInteger(token));
                }
            }

            return ids;
        }

        public void execute() throws Exception {
            if (UserFacade.getInstance().getActiveUserData().isAdmin()) {

                if (reset) {
                    doReset();
                }

            } else {
                throw new NotAuthorizedException();
            }
        }

        protected void doReset() {
            start = System.currentTimeMillis();

            try {
                validateResetRequest();

                if (resetLocal) {
                    new CacheResetSupport().resetLocal(request);
                } else {
                    new CacheResetSupport().reset(request);
                }
            } catch (RuntimeException exc) {
                this.exc = exc;
            }

            end = System.currentTimeMillis();
        }

        protected void validateResetRequest() {
            if (!request.objectIdsToLoadToLegacyL2Cache.isEmpty() ||
                    StringUtils.isNotBlank(request.queryForObjectsToLoadToLegacyL2Cache)) {

                if (StringUtils.isBlank(request.persistenceConfigName)) {
                    throw new RuntimeException("Please select Persistence Configuration @ Scenario");
                }
            }
        }

        public void printWindowContent() throws Exception {
            printStyle();
            out.println("<form method=\"POST\" action=\"#\">");

            renderOption("resetQueryFinder", "Reset QueryFinder cache", request.resetQueryFinder);
            renderOption("resetNcProperties", "Reset NC_DIRECTORY cache", request.resetNcProperties);
            renderOption("resetNlsResources", "Reset NC_RESOURCES and NC_NLS_RESOURCES caches", request.resetNlsResources);
            renderOption("resetTuiMenus", "Reset TUI menus (see /ncobject.jsp?id=5052753262013996556)", request.resetTuiMenus);
            renderOption("resetGlobalResourceBundle", "Reset Global Resource Bundle (see /ncobject.jsp?id=9137875777613721407)", request.resetGlobalResourceBundle);
            renderOption("resetOeConfigProvider", "Reset OE Config Provider (ConfigurationProjectConfigProvider)", request.resetOeConfigProvider);
            renderOption("resetNcdoLegacyL2Cache", "Reset NCDO L2 legacy cache", request.resetNcdoLegacyL2Cache);
            renderOption("resetNcdo", "Full NCDO reset (configuration, plugin caches, L2 legacy cache)", request.resetNcdo);
            renderOption("resetCustomListValuesCache", "Reset Customizable List Values cache", request.resetCustomListValuesCache);


            out.println("<div class=\"group\"><div class=\"note\">To reset POC or PLM caches</div>");
            renderOption("reloadPluginCaches", "Reset ALL NCDO plugin caches", request.reloadPluginCaches);
            renderSelect("pluginsToReload", "Reset selected NCDO plugin cache", getPluginCaches(), request.pluginsToReload);
            out.println("</div>");

            out.println("<div class=\"group\"><div class=\"note\">To load new objects (i.e. not yet loaded into l2 cache) to NCDO L2 cache. [Persistence Configuration @ Scenario] is mandatory. For widgets use woob.persistence.configuration</div>");
            renderSelect("persistenceConfigName_scenario", "Persistence Configuration @ Scenario (*)", getPersistenceConfigToScenario(),
                    Collections.singleton("" + request.persistenceConfigName + '@' + request.scenario));
            renderTextArea("objectIdsToLoadToLegacyL2Cache", "Object ids to load to NCDO L2 cache", request.objectIdsToLoadToLegacyL2Cache.toString());
            renderTextArea("queryForObjectsToLoadToLegacyL2Cache", "Query for objects to load to NCDO L2 cache", request.queryForObjectsToLoadToLegacyL2Cache);
            out.println("</div>");

            out.println("<div class=\"group\"><div class=\"note\">To refresh the objects already loaded into NCDO L2 cache</div>");
            renderTextArea("objectIdsToRefreshInLegacyL2Cache", "Object ids to refresh in NCDO L2 cache", request.objectIdsToRefreshInLegacyL2Cache.toString());
            renderTextArea("queryForObjectsToRefreshInLegacyL2Cache", "Query for objects to refresh in NCDO L2 cache", request.queryForObjectsToRefreshInLegacyL2Cache);
            renderOption("withDescendants", "Refresh the objects with descendants?", request.withDescendants);
            out.println("</div>");

            out.println("<div class=\"group\"><div class=\"note\"></div>");
            renderOption("runGC", "Run GC (do not use)", request.runGC);
            out.println("</div>");


            out.println("<div><input type=\"submit\" value=\"Reset\"/></div>");
            out.println("</form>");

            printRunningNodes();

            if (reset) {
                printResetRequestDetails();
            }

            if (exc != null) {
                printException(exc);

                exc = null;
            }
        }

        protected void renderOption(String id, String label, boolean value) throws IOException {
            out.println(replace(OPTION_HTML, "@id", id, "@label", label, "checked", value ? "checked" : ""));
        }

        protected void renderTextArea(String id, String label, String value) throws IOException {
            out.println(replace(TEXT_AREA_HTML, "@id", id, "@label", label, "@value", value == null ? "" : value));
        }

        protected void renderSelect(String id, String label, Collection<String> options, Collection<String> selectedOptions) throws IOException {
            StringBuilder optionsHtml = new StringBuilder();
            optionsHtml.append(EMPTY_SELECT_OPTION_HTML);
            for (String option : options) {
                boolean selected = selectedOptions.contains(option);
                optionsHtml.append(replace(SELECT_OPTION_HTML, "@value", option, "selected", selected ? "selected" : ""));
            }

            out.println(replace(SELECT_HTML, "@id", id, "@label", label, "@options", optionsHtml.toString()));
        }

        protected void printException(Throwable exc) throws IOException {
            StringWriter stacktrace = new StringWriter();
            exc.printStackTrace(new PrintWriter(stacktrace));

            out.println(replace(EXCEPTION_HTML, "@message", exc.getMessage(), "@stacktrace", stacktrace.toString()));
        }

        protected void printResetRequestDetails() throws IOException {
            out.println(replace(RESET_DETAILS_HTML, "@time", Long.toString(end-start), "@request", request.toString()));
        }

        protected void printRunningNodes() throws IOException {
            out.println(replace(RUNNING_NODES_HTML, "@value", StringUtils.join(NodeManager.getInstance().getRunningNodes(), '\n')));
        }

        protected String replace(String text, String... searchAndReplace) {
            String result = text;
            for (int idx = 0; idx < searchAndReplace.length - 1; idx+=2) {
                result = StringUtils.replace(result, searchAndReplace[idx], searchAndReplace[idx+1]);
            }

            return result;
        }

        protected Collection<String> getPluginCaches() {
            // there is no public API - so the list is hardcoded
            return Arrays.asList("product-offering-catalog.plugin",
                    "product-lifecycle-management.plugin");
        }

        protected Collection<String> getPersistenceConfigToScenario() {
            // there is no public API - so the list is hardcoded
            return Arrays.asList(
                    "pom.persistence.configuration@scenario_for_order_management",
                    "woob.persistence.configuration@woob_widgetconfig",
                    "wfrm.persistence.configuration@widgetconfig",
                    "mapping_tool.persistence.configuration@scenario_for_mapping_tool",
                    "sore.persistence.configuration@default",
                    "product-offering-catalog-load.persistence.configuration@loadBusinessCatalogToCache",
                    "tfnfs.om.persistence.configuration@scenario_for_inventory_projects",
                    "spfpp.persistence.configuration@scenario_for_order_management",
                    "opf.persistence.configuration@scenario_for_order_management",
                    "opf.persistence.configuration@scenario_for_inventory_projects",
                    "opf.persistence.configuration@scenario_for_mapping_tables",
                    "tfnfs_csrdesktop.persistence.configuration@accessToCSRD");
        }
        
        protected void printStyle() throws IOException {
            out.println("<style>\n" +
                    "    form, div, input, select {" +
                    "        font: 13px Tahoma, Arial, sans-serif;" +
                    "    }\n" +
                    "    label {" +
                    "        margin-right: 5px;" +
                    "        min-width: 300px;" +
                    "        display: inline-block;" +
                    "    }\n" +
                    "    textarea {" +
                    "        vertical-align: top;" +
                    "    }\n" +
                    "    .line {" +
                    "        margin: 3px;" +
                    "    }\n" +
                    "    .group {" +
                    "        border-top: outset gray 1px;" +
                    "    }\n" +
                    "    .note {" +
                    "        padding: 3px 0 3px 7px;" +
                    "        font-weight: bold;" +
                    "    }\n" +
                    "    .group .line {" +
                    "        margin-left: 15px;" +
                    "    }\n" +
                    "</style>");
        }
    }
%>
<%

    ThisPage thePage = new ThisPage();
    thePage.setPageContext(pageContext);
    try {
        thePage.debugSecureService();
    } finally {
    }
%>