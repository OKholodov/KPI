package com.netcracker.solutions.titalia.sparkle.pmdesktop;

import com.netcracker.applications.spfpp.common.core.PersistenceUtils;
import com.netcracker.applications.spfpp.common.core.AbstractPersistenceAction;
import com.netcracker.applications.spfpp.common.core.NCDataObjectManager;
import com.netcracker.ejb.attribute.Attribute;
import com.netcracker.ejb.attribute.AttributeConst;
import com.netcracker.ejb.core.eventnotifications.listeners.ModificationListenerConst;
import com.netcracker.jsp.UniSheet;
import com.netcracker.platform.core.ncdo.model.dataobject.MutableNCDataObject;
import com.netcracker.platform.core.ncdo.model.dataobject.NCMetaDataTools;
import com.netcracker.solutions.titalia.sparkle.ff.pmdesktop.DateFilter;
import com.netcracker.solutions.titalia.sparkle.ff.pmdesktop.ListFilter;
import com.netcracker.solutions.titalia.sparkle.ff.pmdesktop.PMDesktopHelper;
import com.netcracker.solutions.titalia.sparkle.ff.utils.AIDAConstants;
import com.netcracker.solutions.titalia.sparkle.ff.utils.OrderUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.math.BigInteger;
import java.rmi.RemoteException;
import java.text.ParseException;
import java.util.*;

public class NewSheet extends UniSheet {

    private final Logger LOG = LoggerFactory.getLogger(NewSheet.class);
    private List<MutableNCDataObject> infConfigItems;
    private List<MutableNCDataObject> infProjects;
    private List<MutableNCDataObject> orderConfigItems;
    private List<MutableNCDataObject> orders;
    private Map<BigInteger, String> users;
    private Map<String, String> sortingParams = new HashMap<>();
    private List<DateFilter> ordersDateFilteringParams = new ArrayList<>();
    private List<ListFilter> ordersListFilteringParams = new ArrayList<>();
    private List<DateFilter> infDateFilteringParams = new ArrayList<>();
    private List<ListFilter> infListFilteringParams = new ArrayList<>();
    private static final String OBJECT_PARAM = "object";


    @Override
    public void printWindowContent() throws Exception {
        new PersistenceUtils().doInPersistenceContext(
                new AbstractPersistenceAction() {
                    public Object run() throws Exception {
                        initData();
                        printData();
                        return null;
                    }
                }, AIDAConstants.BASE_PERSISTENCE_CONFIG_ALIAS);

    }

    private void initData() throws IOException, ParseException {
        BigInteger userId = new BigInteger(getValidParameter(OBJECT_PARAM));
        MutableNCDataObject parent = NCDataObjectManager.findObjectByID(AIDAConstants.Objects.PM_DESKTOP_CONFIGURATION_PROJECT);
        infConfigItems = new ArrayList<>(parent.getChildrenByObjType(AIDAConstants.ObjectTypes.PM_DESKTOP_INFRASTRUCTURE_CONFIGURATION_ITEM, false));
        orderConfigItems = new ArrayList<>(parent.getChildrenByObjType(AIDAConstants.ObjectTypes.PM_DESKTOP_ORDER_CONFIGURATION_ITEM, false));
        parseSortingParams();
        parseFilteringParams();
        Collections.sort(infConfigItems, PMDesktopHelper.getConfigComparator());
        Collections.sort(orderConfigItems, PMDesktopHelper.getConfigComparator());
        users = OrderUtils.getAllCustomUsers();
        infProjects = PMDesktopHelper.getInfProjects(userId, infDateFilteringParams, infListFilteringParams, getInfDateComparator());
        orders = PMDesktopHelper.getOrders(userId,ordersDateFilteringParams, ordersListFilteringParams, getOrdersComparator());
    }

    private void printData() throws Exception {
        printInclude();
        printOrders();
        printInfrastructureProjects();
        printHiddenForm();
    }

    private void parseSortingParams() throws RemoteException {
        String ordersSorting = PMDesktopHelper.getOrdersSortingItem(getParameter(PMDesktopHelper.ORDERS_SORTING_ITEM), orderConfigItems);
        addSortingParams(ordersSorting, PMDesktopHelper.ORDERS_SORTING_ITEM);
        String infSorting = PMDesktopHelper.getInfSortingAttr(getParameter(PMDesktopHelper.INFRASTRUCTURE_SORTING_ATTR), infConfigItems);
        addSortingParams(infSorting, PMDesktopHelper.INFRASTRUCTURE_SORTING_ATTR);
        parseTypeParam(PMDesktopHelper.INFRASTRUCTURE_SORTING_TYPE);
        parseTypeParam(PMDesktopHelper.ORDERS_SORTING_TYPE);
    }

    private void addSortingParams(String sorting, String key){
        if(sorting!=null){
            sortingParams.put(key, sorting);
        }
    }

    private void parseFilteringParams() throws IOException, ParseException{
        Map<String, String[]> allParams = getCtx().getRequest().getParameterMap();
        for(Map.Entry<String, String[]> entry: allParams.entrySet()){
            parseOrdersFilteringParams(entry);
            parseInfFilteringParams(entry);
        }
    }

    private void parseOrdersFilteringParams(Map.Entry<String, String[]> entry) throws IOException, ParseException {
        if(entry.getKey().contains(PMDesktopHelper.ORDERS_DATE_FILTER_POSTFIX)){
            ordersDateFilteringParams.add(PMDesktopHelper.parseOrdersDateFilter(entry));
        }else if(entry.getKey().contains(PMDesktopHelper.ORDERS_LIST_FILTER_POSTFIX)){
            ordersListFilteringParams.add(PMDesktopHelper.parseOrdersListFilter(entry));
        }
    }

    private void parseInfFilteringParams(Map.Entry<String, String[]> entry) throws IOException, ParseException {
        if(entry.getKey().contains(PMDesktopHelper.INF_DATE_FILTER_POSTFIX)){
            infDateFilteringParams.add(PMDesktopHelper.parseInfDateFilter(entry));
        }else if(entry.getKey().contains(PMDesktopHelper.INF_LIST_FILTER_POSTFIX)){
            infListFilteringParams.add(PMDesktopHelper.parseInfListFilter(entry));
        }
    }

    private void parseTypeParam(String key) throws RemoteException {
        String value = getParameter(key);
        if (value == null) {
            value = PMDesktopHelper.DEFAULT_SORTING;
        }
        sortingParams.put(key, value);
    }

    private void printOrders() throws IOException {
        printHeader("My Orders");
        printOrdersForm();
        printOrdersTableHeader();
        printProjectItems();
        printFooter(orders.size());
    }

    private void printInfrastructureProjects() throws Exception {
        LOG.debug("TestSheet START");
        printHeader("My Infrastructure Processes");
        printInfrForm();
        printInfrTableHeader();
        printInfrItems();
        printFooter(infProjects.size());
    }

    private void printOrdersTableHeader() throws IOException {
        out.print("<table class=\"mainControl\">" +
                "<thead><tr>\n" +
                "    <th class=\"firstCheckbox\"></th>\n" +
                "    <th><table class=\"HeadLine\"><tr><td><a href=\"#\">Composite Orders</a></td></tr></table></th>" +
                "    <th><table class=\"HeadLine\"><tr><td><a href=\"#\">Service Orders</a></td></tr></table></th>");
        for (MutableNCDataObject config : orderConfigItems) {
            out.print("<th><table class=\"HeadLine\"><tr><td><a href=\"#\" ");
            if(PMDesktopHelper.isDateConfigItem(config)){
                out.print("onClick=\"ordersSorting('" + config.getId() + "');\"");
            }
            out.print(" >" + config.getName() + "</a></td>");
            if (PMDesktopHelper.isFilterApplicableColumn(config)) {
                BigInteger attrId = (BigInteger) config.getValue(AIDAConstants.Attributes.PM_DESKTOP_CONFIG_ATTRIBUTE);
                out.print("<td style=\"width: 30px;\"><div class=\"tab-menu-holder\"");
                if(PMDesktopHelper.isFiltered(ordersDateFilteringParams, ordersListFilteringParams, attrId)){
                    out.print(" style=\"background-image:url('/skins/cambridge/img/m2/icon_filter_f.gif');\" ");
                }
                out.print(" onclick=\"togglePopup('"+config.getId().toString()+"')\">");
                if(config.getId().toString().equals(sortingParams.get(PMDesktopHelper.ORDERS_SORTING_ITEM))){
                    out.print("<div class=\"sorting-icon\" style=\"background-image:url('");
                    if(PMDesktopHelper.DEFAULT_SORTING.equals(sortingParams.get(PMDesktopHelper.ORDERS_SORTING_TYPE))){
                        out.print("/skins/cambridge/img/m2/sorting_a.gif");
                    }else{
                        out.print("/skins/cambridge/img/m2/sorting_d.gif");
                    }
                    out.print("');\"></div>");
                }
                if(PMDesktopHelper.isDateConfigItem(config)) {
                    out.print("</div><div class=\"popup\">" +
                            "<span class=\"popupSpan\" id=\"" + config.getId().toString() + "\">From " +
                            "<input type=\"text\" id=\"" + config.getId().toString() + "_from\" class=\"datepickerClass\"> To " +
                            "<input type=\"text\" id=\"" + config.getId().toString() + "_to\" class=\"datepickerClass\">" +
                            "<button type=\"button\" onclick=\"proceedOrdersDateFilter('" + config.getId().toString() + "');\">Ok</button>" +
                            "</span></div></td>");
                }else if(PMDesktopHelper.isListConfigItem(config)){
                    out.print("</div><div class=\"popup\">" +
                            "<span class=\"popupSpan\" id=\"" + config.getId().toString() + "\">");
                    HashMap<BigInteger,String> listValues = PMDesktopHelper.getListValues(orders, config);
                    for(Map.Entry<BigInteger, String> entry:listValues.entrySet()){
                        out.print("<p><input type=\"checkbox\" class=\""+config.getId().toString()+ PMDesktopHelper.JS_ORDER_LIST_FILTER_POSTFIX+"\" value=\""+entry.getKey()+"\"/> "+entry.getValue()+"</p>");
                    }
                    out.print("<button type=\"button\" onclick=\"proceedListFilter('"+config.getId().toString()+ PMDesktopHelper.JS_ORDER_LIST_FILTER_POSTFIX+"');\">Ok</button>&emsp;" +
                            "<button type=\"button\" onclick=\"resetListFilter('"+config.getId().toString()+ PMDesktopHelper.JS_ORDER_LIST_FILTER_POSTFIX+"');\">Reset</button>" +
                            "</span></div></td>");
                }
            }
            out.print("</tr></table></th>");
        }
        out.print("</tr></thead>");
    }

    private void printInfrTableHeader() throws IOException {
        out.print("<table class=\"mainControl\">" +
                "<thead><tr>\n" +
                "    <th class=\"firstCheckbox\"></th>\n" +
                "    <th><table class=\"HeadLine\"><tr><td><a href=\"#\">Infrastructure Processes</a></td></tr></table></th>");
        for (MutableNCDataObject config : infConfigItems) {
            BigInteger attrId = (BigInteger) config.getValue(AIDAConstants.Attributes.PM_DESKTOP_CONFIG_ATTRIBUTE);
            out.print("<th><table class=\"HeadLine\"><tr><td><a href=\"#\" ");
            if (PMDesktopHelper.isDateConfigItem(config)) {
                out.print("onClick=\"infSorting('" + attrId + "');\"");
            }
            out.print(" >" + config.getName() + "</a></td>");
            if (PMDesktopHelper.isFilterApplicableColumn(config)) {
                out.print("<td style=\"width: 30px;\"><div class=\"tab-menu-holder\"");
                if(PMDesktopHelper.isFiltered(infDateFilteringParams, infListFilteringParams, attrId)){
                    out.print(" style=\"background-image:url('/skins/cambridge/img/m2/icon_filter_f.gif');\" ");
                }
                out.print(" onclick=\"togglePopup('"+attrId+"')\">");
                if(attrId.toString().equals(sortingParams.get(PMDesktopHelper.INFRASTRUCTURE_SORTING_ATTR))){
                    out.print("<td style=\"width: 30px;\"><div class=\"sorting-icon\" style=\"background-image:url('");
                    if(PMDesktopHelper.DEFAULT_SORTING.equals(sortingParams.get(PMDesktopHelper.INFRASTRUCTURE_SORTING_TYPE))){
                        out.print("/skins/cambridge/img/m2/sorting_a.gif");
                    }else{
                        out.print("/skins/cambridge/img/m2/sorting_d.gif");
                    }
                    out.print("');\"></div>");
                }
                if(PMDesktopHelper.isDateConfigItem(config)) {
                    out.print("</div><div class=\"popup\">" +
                            "<span class=\"popupSpan\" id=\"" + attrId + "\">From\n" +
                            "<input type=\"text\" id=\"" + attrId + "_from\" class=\"datepickerClass\"> To " +
                            "<input type=\"text\" id=\"" + attrId + "_to\" class=\"datepickerClass\">" +
                            "<button type=\"button\" onclick=\"proceedInfDateFilter('" + attrId + "');\">Ok</button>\n" +
                            "</span></div></td>");
                }else if(PMDesktopHelper.isListConfigItem(config)){
                    out.print("</div><div class=\"popup\">" +
                            "<span class=\"popupSpan\" id=\"" + attrId + "\">");
                    HashMap<BigInteger,String> listValues = PMDesktopHelper.getListValues(infProjects, config);
                    for(Map.Entry<BigInteger, String> entry:listValues.entrySet()){
                        out.print("<p><input type=\"checkbox\" class=\""+attrId+ PMDesktopHelper.JS_INF_LIST_FILTER_POSTFIX+"\" value=\""+entry.getKey()+"\"/> "+entry.getValue()+"</p>");
                    }
                    out.print("<button type=\"button\" onclick=\"proceedListFilter('"+attrId+PMDesktopHelper.JS_INF_LIST_FILTER_POSTFIX+"');\">Ok</button>&emsp;" +
                            "<button type=\"button\" onclick=\"resetListFilter('"+attrId+ PMDesktopHelper.JS_INF_LIST_FILTER_POSTFIX+"');\">Reset</button>" +
                            "</span></div></td>");
                }
            }
            out.print("</tr></table></th>");
        }
        out.print("</tr></thead>");
    }

    private void printProjectItems() throws IOException {
        for (MutableNCDataObject co : orders) {
            ArrayList<MutableNCDataObject> cfses = new ArrayList<>(OrderUtils.filterCFSOrdersUnderCompositeOrder(co.getId()));
            int cfsCount = cfses.size();
            MutableNCDataObject firstCfs = cfses.iterator().next();

            out.print(
                    "<tr class=\"hoverable\">\n" +
                            "    <td class=\"Vertical itemCheckboxAlign Center\" rowspan=" + cfsCount + "><input type=\"checkbox\" name=\"items\" value=\"" + co.getId() + "\"></p></td>\n" +
                            "    <td class=\"Vertical Center\" rowspan=" + cfsCount + "><a href=\"/ncobject.jsp?id=" + co.getId() + "\">" + co.getName() + "</a></td>\n" +
                            "    <td class=\"Vertical\"><a href=\"/ncobject.jsp?id=" + firstCfs.getId() + "\">" + firstCfs.getName() + "</a></td>\n");

            for (MutableNCDataObject config : orderConfigItems) {
                BigInteger source = (BigInteger) config.getValue(AIDAConstants.Attributes.PM_DESKTOP_CONFIG_SOURCE);
                BigInteger attrId = (BigInteger) config.getValue(AIDAConstants.Attributes.PM_DESKTOP_CONFIG_ATTRIBUTE);
                if (AIDAConstants.ListValues.SOURCE_COMPOSITE_ORDER.equals(source)) {
                    printValueOfAttr(co, attrId, cfsCount);
                } else if (AIDAConstants.ListValues.SOURCE_SERVICE_ORDER.equals(source)) {
                    printValueOfAttr(firstCfs, attrId, 0);
                }
            }
            out.print("</tr>");
            for (int i = 1; i < cfses.size(); i++) {
                out.print(
                        "<tr class=\"hoverable\">\n" +
                                "    <td class=\"Vertical\"><a href=\"/ncobject.jsp?id=" + cfses.get(i).getId() + "\">" + cfses.get(i).getName() + "</a></td>\n");
                for (MutableNCDataObject config : orderConfigItems) {
                    BigInteger source = (BigInteger) config.getValue(AIDAConstants.Attributes.PM_DESKTOP_CONFIG_SOURCE);
                    BigInteger attrId = (BigInteger) config.getValue(AIDAConstants.Attributes.PM_DESKTOP_CONFIG_ATTRIBUTE);
                    if (AIDAConstants.ListValues.SOURCE_SERVICE_ORDER.equals(source)) {
                        printValueOfAttr(cfses.get(i), attrId, 0);
                    }
                }
            }
            out.print("</tr>");
        }
    }

    private void printInfrItems() throws IOException {
        for (MutableNCDataObject project : infProjects) {
            out.print(
                    "<tr class=\"hoverable\">\n" +
                            "    <td class=\"Vertical itemCheckboxAlign\"><input type=\"checkbox\" name=\"infr\" value=\"" + project.getId() + "\"></p></td>" +
                            "    <td class=\"Vertical\"><a href=\"/ncobject.jsp?id=" + project.getId() + "\">" + project.getName() + "</a></td>");
            for (MutableNCDataObject config : infConfigItems) {
                BigInteger attrId = (BigInteger) config.getValue(AIDAConstants.Attributes.PM_DESKTOP_CONFIG_ATTRIBUTE);
                printValueOfAttr(project, attrId, 0);
            }
            out.print("</tr>");
        }
    }

    private void printValueOfAttr(MutableNCDataObject obj, BigInteger attrId, int rowspan) throws IOException {
        Attribute attr = NCMetaDataTools.getAttribute(attrId);
        int attrTypeId = attr.getTypeID();
        switch (attrTypeId) {
            case AttributeConst.ATTR_TYPE_LIST:
                BigInteger valueId = (BigInteger) obj.getValue(attrId);
                out.print("<td class=\"Vertical\" ");
                if (rowspan != 0) {
                    out.print("rowspan=\"" + rowspan + "\"");
                }
                out.print("<td class=\"Vertical\" rowspan=\"" + rowspan + "\">" + PMDesktopHelper.getListValueName(attrId, valueId) + "</td>");
                break;
            case AttributeConst.ATTR_TYPE_REFERENCE:
                MutableNCDataObject ref = obj.getReference(attrId);
                out.print("<td class=\"Vertical\" ");
                if (rowspan != 0) {
                    out.print("rowspan=\"" + rowspan + "\"");
                }
                out.print("><a href=\"/ncobject.jsp?id=" + ref.getId() + "\">" + ref.getName() + "</a></td>");
                break;
            case AttributeConst.ATTR_TYPE_DATE:
                Date date = (Date) obj.getValue(attrId);
                out.print("<td class=\"Vertical\" ");
                if (rowspan != 0) {
                    out.print("rowspan=\"" + rowspan + "\"");
                }
                out.print(">" + PMDesktopHelper.getFormattedDate(attrId, date) + "</td>");
                break;
            default:
                Object value = obj.getValue(attrId);
                value = value == null ? "" : value;
                out.print("<td class=\"Vertical\" ");
                if (rowspan != 0) {
                    out.print("rowspan=\"" + rowspan + "\"");
                }
                out.print(">" + value + "</td>");

        }
    }

    private void printInclude() throws IOException {
        out.print("<script src=\"/solutions/titalia/sparkle/pmdesktop/pmdesktop.js\"></script>");
    }

    private void printHeader(String name) throws IOException {
        out.print("<div class=\"TitleTabLeft\"><div class=\"TitleTabRight\">\n" +
                "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" class=\"TitleTab\"><tbody>\n" +
                "<tr><td></td><td class=\"nowrap\">" + name + "</td></tr>\n" +
                "</tbody></table><div class=\"titleCorner\"></div></div></div>");
    }

    private void printFooter(int count) throws IOException {
        out.print("</table>");
        out.print("<div class=\"pager\">\n" +
                "<div class=\"greyline\"></div>\n" +
                "<div class=\"pagerPageShow\">Showing " + count + " items</div></div>");
        out.print("</td></tr></table>" +
                "</form>");
    }

    private void printInfrForm() throws IOException {
        out.print("<form id=\"infrForm\" target=\"_blank\" action=\"/solutions/titalia/sparkle/buttons/bulkCancelInfrastructureProcess.jsp\" method = \"post\">");
        out.print("<table class=\"mainControlContainer\"><tr><td>" +
                "<table class=\"ControlPanel\"><tr><td class=\"withoutBorder\">" +
                "<a href=\"#\" onclick=\"if(!jQuery('input[name=infr]').is(':checked')){alert('Please, select Infrastructure Project');}else{document.getElementById('infrForm').submit();}\" style=\"background-image:url('/skins/cambridge/img/ico/ico_delete.gif');\" class=\"IconButton\">Cancel</a>" +
                "</td>" +
                "<td style=\"width:100%\">&nbsp;</td>" +
                "</tr></table>"
        );
    }

    private Comparator<MutableNCDataObject> getOrdersComparator() {
        final String type = sortingParams.get(PMDesktopHelper.ORDERS_SORTING_TYPE);
        MutableNCDataObject configItem = null;
        for (MutableNCDataObject config : orderConfigItems) {
            if (config.getId().toString().equals(sortingParams.get(PMDesktopHelper.ORDERS_SORTING_ITEM))) {
                configItem = config;
            }
        }
        if (configItem == null) {
            return PMDesktopHelper.getOrdersComparator(AIDAConstants.ListValues.SOURCE_COMPOSITE_ORDER,
                    ModificationListenerConst.CREATED_WHEN_ATTR_ID,
                    type);
        }
        final BigInteger source = (BigInteger) configItem.getValue(AIDAConstants.Attributes.PM_DESKTOP_CONFIG_SOURCE);
        final BigInteger attrId = (BigInteger) configItem.getValue(AIDAConstants.Attributes.PM_DESKTOP_CONFIG_ATTRIBUTE);
        return PMDesktopHelper.getOrdersComparator(source, attrId, type);
    }

    private void printOrdersForm() throws IOException {
        out.print("<form id=\"ordForm\" target=\"_blank\" action=\"/solutions/titalia/sparkle/buttons/pmDesktopOrdersOperationsButton.jsp\" method = \"post\">");
        out.print("<table class=\"mainControlContainer\"><tr><td>" +
                "<table class=\"ControlPanel\"><tr>" +
                "<input type=\"hidden\" id = \"action\" name = \"action\" value=\"suspend\">" +
                "<td class=\"withoutBorder\">" +
                "<a href=\"#\" onclick=\"if(!jQuery('input[name=items]').is(':checked')){alert('Please, select Order');}else{document.getElementById('action').value = 'suspend'; document.getElementById('ordForm').submit();}\" style=\"background-image:url('/skins/cambridge/img/ico/ico_complete.gif');\" class=\"IconButton\">Suspend</a>" +
                "</td>" +
                "<td class=\"withoutBorder\">" +
                "<a href=\"#\" onclick=\"if(!jQuery('input[name=items]').is(':checked')){alert('Please, select Order');}else{document.getElementById('action').value = 'resume'; document.getElementById('ordForm').submit();}\" style=\"background-image:url('/skins/cambridge/img/ico/ico_startworkingat.gif');\" class=\"IconButton\">Resume</a>" +
                "</td>" +

                "<td class=\"withoutBorder\">" +
                "<a href=\"#\" onclick=\"togglePopup('assignPopup');\" style=\"background-image:url('/skins/cambridge/img/ico/ico_wf_reassign.gif');\" class=\"IconButton\">Re-Assign</a>" +
                "<div class=\"popup\">" +
                "<span class=\"popupSpan\" id=\"assignPopup\">Select user\n" +
                "      <select id=\"combobox\" name=userId>\n");

        for (Map.Entry<BigInteger, String> entry : users.entrySet()) {
            out.print("<option value=\"" + entry.getKey() + "\">" + entry.getValue() + "</option>");
        }
        out.print("</select>\n" +
                "<button type=\"button\" onclick=\"if(!jQuery('input[name=items]').is(':checked')){alert('Please, select Order');}else{document.getElementById('action').value = 'reassign'; document.getElementById('ordForm').submit();}\">Ok</button>\n" +
                "</span></div>" +
                "</td>" +
                "<td style=\"width:100%\">&nbsp;</td>" +
                "</tr></table>");
    }

    private void printHiddenForm() throws IOException {
        out.print("<form id=\"hiddenForm\" action=\"/admin/users/groups.jsp\" method = \"post\">" +

                "<input type=\"hidden\" name = \"tab\" value=\"_My Projects\">" +
                "<input type=\"hidden\" name = \"group\" value=\"" + PMDesktopHelper.getCurrentUser().getPrimaryGroupID() + "\">" +
                "<input type=\"hidden\" name = \"object\" value=\"" + PMDesktopHelper.getCurrentUser().getID() + "\">" +

                "<input type=\"hidden\" id = \"" + PMDesktopHelper.INFRASTRUCTURE_SORTING_ATTR + "\" name = \"" + PMDesktopHelper.INFRASTRUCTURE_SORTING_ATTR + "\" " +
                "value=\"" + sortingParams.get(PMDesktopHelper.INFRASTRUCTURE_SORTING_ATTR) + "\">" +
                "<input type=\"hidden\" id = \"" + PMDesktopHelper.INFRASTRUCTURE_SORTING_TYPE + "\" name = \"" + PMDesktopHelper.INFRASTRUCTURE_SORTING_TYPE + "\" " +
                "value=\"" + sortingParams.get(PMDesktopHelper.INFRASTRUCTURE_SORTING_TYPE) + "\">" +

                "<input type=\"hidden\" id = \"" + PMDesktopHelper.ORDERS_SORTING_ITEM + "\" name = \"" + PMDesktopHelper.ORDERS_SORTING_ITEM + "\" " +
                "value=\"" + sortingParams.get(PMDesktopHelper.ORDERS_SORTING_ITEM) + "\">" +
                "<input type=\"hidden\" id = \"" + PMDesktopHelper.ORDERS_SORTING_TYPE + "\" name = \"" + PMDesktopHelper.ORDERS_SORTING_TYPE + "\" " +
                "value=\"" + sortingParams.get(PMDesktopHelper.ORDERS_SORTING_TYPE) + "\">");
        Map<String, String[]> allParams = getCtx().getRequest().getParameterMap();
        for(Map.Entry<String, String[]> entry: allParams.entrySet()) {
            if (entry.getKey().contains(PMDesktopHelper.COMMON_DATE_FILTER_POSTFIX)) {
                out.print("<input type=\"hidden\" class = \"dateFilter\" id=\""+entry.getKey()+"\" name = \""+entry.getKey()+"\" value=\""+entry.getValue()[0]+"\">");
            } else if(entry.getKey().contains(PMDesktopHelper.COMMON_LIST_FILTER_POSTFIX)){
                String[] values = entry.getValue();
                for(String str: values){
                    out.print("<input type=\"hidden\" id=\""+entry.getKey()+"_"+str+"\" name = \""+entry.getKey()+"\" value=\""+str+"\">");
                }
            }
        }
        out.print("</form>");
    }

    private Comparator<MutableNCDataObject> getInfDateComparator() {
        String attr = sortingParams.get(PMDesktopHelper.INFRASTRUCTURE_SORTING_ATTR);
        String type = sortingParams.get(PMDesktopHelper.INFRASTRUCTURE_SORTING_TYPE);
        if (attr == null) {
            return PMDesktopHelper.getInfDateComparator(ModificationListenerConst.CREATED_WHEN_ATTR_ID,
                    type);
        }
        return PMDesktopHelper.getInfDateComparator(new BigInteger(attr), type);
    }
}