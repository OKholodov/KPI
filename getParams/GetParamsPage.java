package com.netcracker.solutions.titalia.sparkle.kpi;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.jsp.PageContext;
import com.netcracker.ejb.attribute.Attribute;
import com.netcracker.ejb.core.AttributeValue;
import com.netcracker.ejb.core.ILoadingService;
import com.netcracker.ejb.core.NCObject;
import com.netcracker.jsp.JSONUtils;
import java.math.BigInteger;
import java.util.*;

import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.json.*;

import com.netcracker.solutions.titalia.sparkle.kpi.KPISheetHelper;
import com.netcracker.solutions.titalia.sparkle.kpi.KPISQLData;

public class GetParamsPage extends com.netcracker.jsp.JsonDispatcherPage
{
    //private static final long serialVersionUID = -1275948158807908790L;
    private final Log log = LogFactory.getLog("com.netcracker.solutions.titalia.sparkle.kpi.getparams.jsp");
    private static final Logger LOG = LoggerFactory.getLogger(GetParamsPage.class);

    public GetParamsPage(PageContext pageContext){
        LOG.debug("GetParamsPage constructor!");
        LOG.debug("pageContext="+pageContext);
        setPageContext(pageContext);
        LOG.debug("GetParamsPage after constructor!");
    }

    public GetParamsPage(){
        LOG.debug("GetParamsPage null constructor!");
    }

    String query = "select object_id, name from nc_objects where parent_id = ? and object_type_id = ? order by object_id";

    public String getValue(AttributeValue av) throws Exception
    {
        if(av.getAttributeType() == Attribute.ATTR_TYPE_REFERENCE)
        {
            if(av.isMultiple())
            {
                ArrayList<AttributeValue> items = (ArrayList<AttributeValue>)av.getItems();
                ArrayList<String> values = new ArrayList<String>();
                for(AttributeValue item : items)
                {
                    values.add(item.getValue() + "-" + item.getRefName());
                }
                Collections.sort(values);
                return values.toString();
            }
            else
                return av.getValue() + "-" + av.getRefName();
        }
        else if(av.isMultiple())
        {
            ArrayList<String> values = (ArrayList<String>)av.readMultipleValues();
            Collections.sort(values);
            return values.toString();
        }
        else
            return av.getValue();
    }

    public ArrayList<BigInteger> parseIds(String value) throws Exception {
        Collection strIds = JSONUtils.fromJSON(new JSONArray(value));
        ArrayList<BigInteger> ids = new ArrayList<BigInteger>(strIds.size());
        for ( Object o : strIds ) {
            ids.add(new BigInteger(o.toString()));
        }
        return ids;
    }

    public Map getParams(Map params) throws Exception
    {
        LOG.debug("getParams start");
        Map<String, String> result = new HashMap<String, String>();
        ArrayList<BigInteger> objectIds = parseIds((String) params.get("objects"));
        ArrayList<BigInteger> attrIds = parseIds((String) params.get("attrs"));
        ArrayList<BigInteger> childrenTypeIds = parseIds((String) params.get("childrenTypes"));
        try
        {
            for ( BigInteger objectId : objectIds ) {
                NCObject obj = ILoadingService.LIGHT.findByID(objectId,
                        attrIds.toArray(new BigInteger[attrIds.size()]) );
//                result.put(objectId+"_name", ObjectUtils.toString(obj.getName(), ""));
//                result.put(objectId+"_description", ObjectUtils.toString(obj.getDescription(), ""));
//                result.put(objectId+"_type", obj.getObjectTypeID().toString() );
                for(BigInteger attrId : attrIds)
                {
                    if(obj.ifParameterExists(attrId))
                    {
                        AttributeValue av = obj.getParameter(attrId);
                        result.put(objectId+"_"+attrId, getValue(av) );
                    }
                    else {
                        result.put(objectId+"_"+attrId, "");
                    }
                }
                for(BigInteger typeId : childrenTypeIds)
                {
                    Collection<NCObject> children = obj.getChildren(typeId);
                    long referenceCache = 0;
                    for ( NCObject child : children ) {
                        referenceCache += child.getID().longValue();
                        referenceCache += child.getName().hashCode();
                    }
                    result.put(objectId+"_"+typeId, referenceCache + "");
                }
            }
        }
        catch (Exception ex)
        {
            LOG.debug("getParams ex");
            result.put("text", ex.getMessage());
        }
        finally
        {
            LOG.debug("log.isTraceEnabled()="+log.isTraceEnabled());
            if(log.isTraceEnabled()) log.trace("result=" + result);
            LOG.debug("result123= "+result);
            return result;
        }
    }

    public Map getDateFieldModel(Map params) throws Exception
    {
        LOG.debug("getDateFieldModel start");

        Map<String, Object> result = new LinkedHashMap<String, Object>();
        StringBuilder outputString = new StringBuilder();
        String dateParam;
        String sqlCode;

        try
        {
            dateParam = (String) params.get("DATE");
            LOG.debug("dateParam="+dateParam);

            if ("SD".equals(dateParam)) {
                sqlCode = KPISheetHelper.SQLFILE_GET_START_DATE_DATA;
            }
            else if ("ED".equals(dateParam)) {
                sqlCode = KPISheetHelper.SQLFILE_GET_END_DATE_DATA;
            }
            else {
                LOG.debug("dateParam wasnt recognized");
                result.put("exeption", "dateParam wasnt recognized:"+dateParam);
                return result;
            }

            outputString = KPISheetHelper.getDateFieldModel(sqlCode);

            LOG.debug("outputString="+outputString);
            LOG.debug("outputString.toString()="+outputString.toString());

            JSONObject jsonObj = new JSONObject(outputString.toString());
            //JSONObject jsonObj = new JSONObject(res);

            //result.put("model", outputString.toString());
            result.put("model", jsonObj);

        }
        catch (Exception ex)
        {
            LOG.debug("getDateFieldModel Exception = " + ex.getMessage());
            result.put("exeption", ex.getMessage());
        }
        finally
        {
            LOG.debug("resultJson from getDateFieldModel = " + result);
            return result;
        }
    }

    public Map getTableModel(Map params) throws Exception
    {
        LOG.debug("getTableModel start");
        //Map<String, Object> result = new HashMap<String, Object>();

        Map<String, Object> result = new LinkedHashMap<String, Object>();
        String SD;
        String ED;

        //LinkedHashMap<String, LinkedHashMap<String, Object>> res = new LinkedHashMap<String, LinkedHashMap<String, Object>>();

        /*
        ArrayList<BigInteger> objectIds = parseIds((String) params.get("objects"));
        ArrayList<BigInteger> attrIds = parseIds((String) params.get("attrs"));
        ArrayList<BigInteger> childrenTypeIds = parseIds((String) params.get("childrenTypes"));
        */

        try
        {
            SD = ((String) params.get("SD")).replace("\"","");
            ED = ((String) params.get("ED")).replace("\"","");
            LOG.debug("SD = " + SD);
            LOG.debug("ED = " + ED);

            Object[] tableFilter = new Object[]{SD, ED};
            StringBuilder outputString = new StringBuilder();

            outputString = KPISheetHelper.getTableModel(KPISheetHelper.SQLFILE_GET_ORDER_BY_STATUS_T_HEAD, KPISheetHelper.SQLFILE_GET_ORDER_BY_STATUS_T_DATA, tableFilter);
            //res = KPISheetHelper.getTableModelMap(KPISheetHelper.SQLFILE_GET_ORDER_BY_STATUS_T_HEAD, KPISheetHelper.SQLFILE_GET_ORDER_BY_STATUS_T_DATA, tableFilter);

            LOG.debug("outputString="+outputString);
            LOG.debug("outputString.toString()="+outputString.toString());

            JSONObject jsonObj = new JSONObject(outputString.toString());
            //JSONObject jsonObj = new JSONObject(res);

            //result.put("model", outputString.toString());
            result.put("model", jsonObj);

        }
        catch (Exception ex)
        {
            LOG.debug("getTableModel Exception = " + ex.getMessage());
            result.put("exeption", ex.getMessage());
        }
        finally
        {
            LOG.debug("resultJson from getTableModel = " + result);
            return result;
        }
    }

    public Map getGraphModel(Map params) throws Exception
    {
        LOG.debug("getGraphModel start");
        //Map<String, Object> result = new HashMap<String, Object>();

        Map<String, Object> result = new LinkedHashMap<String, Object>();
        String SD;
        String ED;

        try
        {
            SD = ((String) params.get("SD")).replace("\"","");
            ED = ((String) params.get("ED")).replace("\"","");
            LOG.debug("SD = " + SD);
            LOG.debug("ED = " + ED);

            Object[] graphFilter = new Object[]{SD, ED};
            StringBuilder outputString = new StringBuilder();

            outputString = KPISheetHelper.getGraphModel(KPISheetHelper.SQLFILE_GET_ORDER_BY_STATUS_G_DATA, graphFilter);
            //res = KPISheetHelper.getTableModelMap(KPISheetHelper.SQLFILE_GET_ORDER_BY_STATUS_T_HEAD, KPISheetHelper.SQLFILE_GET_ORDER_BY_STATUS_T_DATA, tableFilter);

            LOG.debug("outputString="+outputString);
            LOG.debug("outputString.toString()="+outputString.toString());

            JSONObject jsonObj = new JSONObject(outputString.toString());
            //JSONObject jsonObj = new JSONObject(res);

            //result.put("model", outputString.toString());
            result.put("data", jsonObj);

        }
        catch (Exception ex)
        {
            LOG.debug("getGraphModel Exception = " + ex.getMessage());
            result.put("exeption", ex.getMessage());
        }
        finally
        {
            LOG.debug("resultJson from getGraphModel = " + result);
            return result;
        }
    }
}


//import com.netcracker.jsp.JsonDispatcherPage;
////import com.netcracker.solutions.ccsc.rm.sonet.view.pages.dialog.FindDialogFacade;
//
//import org.apache.commons.logging.Log;
//import org.apache.commons.logging.LogFactory;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//
//public class NewSheetData extends JsonDispatcherPage{
//
//    public NewSheetData(PageContext pageContext){
//        setPageContext(pageContext);
//    }
//
//    private static final Logger LOG = LoggerFactory.getLogger(NewSheetData.class);
//
//    public Map getFindDialog(final Map params) throws IOException{
//
//        LOG.debug("getFindDialog start");
//        Map<String, String> ret=new HashMap<String, String>();
//
//        //Parse parameters
//        String ctxObjects=(String) params.get("context_objects");
//
//        LOG.debug("context_objects="+ctxObjects);
//
//        if(ctxObjects==null || ctxObjects.isEmpty()){
//            LOG.debug("ERR123");
//            ret.put("ERROR", "Invalid input params");
//            return ret;
//        }
///*
//        String[] contextObjects=ctxObjects.split(",");
//        FindDialogFacade dlg=new FindDialogFacade(this.getRequest().getSession());
//        String dlgHTML=dlg.getDialog(contextObjects);
//
//        ret.put("dialog", dlgHTML);
//*/
//        ret.put("dialog", "datadatadialog");
//        return ret;
//    }
//}


//
//
//import com.netcracker.applications.om.opf.OrderManagerConst;
//import com.netcracker.applications.om.opf.manager.OPFManagerConst;
//import com.netcracker.applications.om.utils.PersistenceUtils;
//import com.netcracker.applications.spfpp.common.core.NCDataObjectManager;
//import com.netcracker.jsp.JsonDispatcherPage;
//import com.netcracker.mediation.dataflow.api.SessionHandler;
//import com.netcracker.platform.core.ncdo.model.dataobject.MutableNCDataObject;
//import com.netcracker.platform.core.ncdo.model.dataobject.NCMetaDataTools;
//import com.netcracker.solutions.titalia.sparkle.ff.utils.AIDAConstants;
//import com.netcracker.solutions.titalia.sparkle.ff.utils.OrderUtils;
//import org.apache.commons.lang.exception.ExceptionUtils;
//import org.apache.commons.logging.Log;
//import org.apache.commons.logging.LogFactory;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//
//import java.math.BigInteger;
//import java.util.*;
//import java.util.concurrent.Callable;
//
//import org.json.JSONObject;
//
//public class NewSheetData extends JsonDispatcherPage {
//
//    private static final String CURRENT_OBJECT = "currentObject";
//    private static final Logger LOG = LoggerFactory.getLogger(NewSheetData.class);
//    public NewSheetData() {
//    }
//
//    public Map<String, Object> getAttachments(final Map parameters) {
//        final Map<String, Object> resultMap = new HashMap<String, Object>();
//        try {
//            return PersistenceUtils.doInPersistenceContext(new Callable<Map<String, Object>>() {
//                public Map<String, Object> call() throws Exception {
//                    LOG.debug("AttachmentsHelper START");
//                    /*
//                    BigInteger orderId = new BigInteger(parameters.get(CURRENT_OBJECT).toString());
//                    MutableNCDataObject order = NCDataObjectManager.findObjectByID(orderId);
//                    order.setValue(AIDAConstants.Attributes.ATTACHMENT_LINKS, null);
//                    LOG.debug("order "+order);
//                    MutableNCDataObject compositeOrder = order.getReference(OrderManagerConst.ORDER_TO_COMPOSITE_ATTR_ID);
//                    String quoteID = (String) compositeOrder.getValue(AIDAConstants.Attributes.QUOTE_EXTERNAL_ID);
//                    String coExtId = (String) compositeOrder.getValue(OPFManagerConst.COMPOSITE_ORDER_EXTERNAL_ID_ATTR);
//                    */
//                    String linksJson = null;
//                    /*Set<MutableNCDataObject> orders = new HashSet<>();
//                    orders.add(order);
//                    if(quoteID != null && !quoteID.isEmpty()) {
//                        Map<String, String> params = new HashMap<>();
//                        params.put("quoteID", quoteID);
//                        params.put("coExtId", coExtId);
//                        SessionHandler session = IntegrationUtils.startDataFlow(
//                                AIDAConstants.Objects.ATTACHMENT_LINKS_DATAFLOW,
//                                params);
//                        LOG.debug("getSessionProperties "+session.getSessionProperties());
//                        linksJson = IntegrationUtils.getAttachmentLinksResponse(session.getSessionID());
//                        Collection<BigInteger> orderIds = OrderUtils.getOrdersByQuoteID(quoteID);
//                        orders.addAll(NCDataObjectManager.findObjectsByID(orderIds));
//                    }*/
//                    linksJson = "JSSS";
//                    LOG.debug("linksJson " + linksJson);
//                    /*
//                    for(MutableNCDataObject cfsOrder : orders) {
//                        if(NCMetaDataTools.ifAttributeExists(cfsOrder, AIDAConstants.Attributes.ATTACHMENT_LINKS)) {
//                            cfsOrder.setValue(AIDAConstants.Attributes.ATTACHMENT_LINKS, linksJson);
//                        }
//                    }
//                    */
//                    resultMap.put("linksJson", linksJson);
//                    resultMap.put("result", true);
//                    return resultMap;
//                }
//            });
//        } catch (Exception e) {
//            LOG.error("{}", e);
//            resultMap.put("result", false);
//            return resultMap;
//        }
//    }
//
//    public Map getUpdatedValue(final Map parameters) {
//        final Map<String, String> resultMap = new HashMap<String, String>();
//        try {
//            //return PersistenceUtils.doInPersistenceContext(new Callable<Map<String, Object>>() {
//                //public Map<String, Object> call() throws Exception {
//                    LOG.debug("AttachmentsHelper START");
//                    BigInteger orderId = new BigInteger(parameters.get(CURRENT_OBJECT).toString());
//                    MutableNCDataObject order = NCDataObjectManager.findObjectByID(orderId);
//                    LOG.debug("order "+order);
//                    String linksJson = (String) order.getValue(BigInteger.valueOf(61));
//                    resultMap.put("result", "true");
//                    resultMap.put("linksJson", linksJson);
//
//                    LOG.debug("resultMap "+resultMap);
//                    return resultMap;//resultMap;
//               // }
//            //});
//        } catch (Exception e) {
//            LOG.error("error mfk",e);
//            resultMap.put("result", "false");
//            //return resultMap;
//            return resultMap;
//        }
//
//    }
//
//    /*
//    private static final String CURRENT_OBJECT = "currentObject";
//    private static final Logger LOG = LoggerFactory.getLogger(NewSheetData.class);
//    public NewSheetData() {
//    }
//
//    public Map<String, Object> getAttachments(final Map parameters) {
//        final Map<String, Object> resultMap = new HashMap<String, Object>();
//        try {
//            return PersistenceUtils.doInPersistenceContext(new Callable<Map<String, Object>>() {
//                public Map<String, Object> call() throws Exception {
//                    LOG.debug("AttachmentsHelper START");
//                    BigInteger orderId = new BigInteger(parameters.get(CURRENT_OBJECT).toString());
//                    MutableNCDataObject order = NCDataObjectManager.findObjectByID(orderId);
//                    order.setValue(AIDAConstants.Attributes.ATTACHMENT_LINKS, null);
//                    LOG.debug("order "+order);
//                    MutableNCDataObject compositeOrder = order.getReference(OrderManagerConst.ORDER_TO_COMPOSITE_ATTR_ID);
//					String quoteID = (String) compositeOrder.getValue(AIDAConstants.Attributes.QUOTE_EXTERNAL_ID);
//					String coExtId = (String) compositeOrder.getValue(OPFManagerConst.COMPOSITE_ORDER_EXTERNAL_ID_ATTR);
//					String linksJson = null;
//					Set<MutableNCDataObject> orders = new HashSet<>();
//					orders.add(order);
//					if(quoteID != null && !quoteID.isEmpty()) {
//						Map<String, String> params = new HashMap<>();
//						params.put("quoteID", quoteID);
//						params.put("coExtId", coExtId);
//						SessionHandler session = IntegrationUtils.startDataFlow(
//								AIDAConstants.Objects.ATTACHMENT_LINKS_DATAFLOW,
//								params);
//	                    LOG.debug("getSessionProperties "+session.getSessionProperties());
//	                    linksJson = IntegrationUtils.getAttachmentLinksResponse(session.getSessionID());
//	                    Collection<BigInteger> orderIds = OrderUtils.getOrdersByQuoteID(quoteID);
//	                    orders.addAll(NCDataObjectManager.findObjectsByID(orderIds));
//					}
//                    LOG.debug("linksJson " + linksJson);
//                    for(MutableNCDataObject cfsOrder : orders) {
//                    	if(NCMetaDataTools.ifAttributeExists(cfsOrder, AIDAConstants.Attributes.ATTACHMENT_LINKS)) {
//                    		cfsOrder.setValue(AIDAConstants.Attributes.ATTACHMENT_LINKS, linksJson);
//                    	}
//                    }
//                    resultMap.put("linksJson", linksJson);
//                    resultMap.put("result", true);
//                    return resultMap;
//                }
//            });
//        } catch (Exception e) {
//            LOG.error("{}", e);
//            resultMap.put("result", false);
//            return resultMap;
//        }
//    }
//
//    public Map<String, Object> getUpdatedValue(final Map parameters) {
//        final Map<String, Object> resultMap = new HashMap<String, Object>();
//        try {
//            return PersistenceUtils.doInPersistenceContext(new Callable<Map<String, Object>>() {
//                public Map<String, Object> call() throws Exception {
//                    LOG.debug("AttachmentsHelper START");
//                    BigInteger orderId = new BigInteger(parameters.get(CURRENT_OBJECT).toString());
//                    MutableNCDataObject order = NCDataObjectManager.findObjectByID(orderId);
//                    LOG.debug("order "+order);
//                    String linksJson = (String) order.getValue(AIDAConstants.Attributes.ATTACHMENT_LINKS);
//                    resultMap.put("result", true);
//                    resultMap.put("linksJson", linksJson);
//                    return resultMap;
//                }
//            });
//        } catch (Exception e) {
//            LOG.error("{}",e);
//            resultMap.put("result", false);
//            return resultMap;
//        }
//
//    }
//    */
//}
