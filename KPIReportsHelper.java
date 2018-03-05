package com.netcracker.solutions.titalia.sparkle.kpiReports;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.jsp.PageContext;
//import com.netcracker.ejb.attribute.Attribute;
//import com.netcracker.ejb.core.AttributeValue;
//import com.netcracker.ejb.core.ILoadingService;
//import com.netcracker.ejb.core.NCObject;
import com.netcracker.jsp.JSONUtils;
import com.netcracker.framework.query.*;
//import java.math.BigInteger;
import java.util.*;


//import org.apache.commons.lang.ObjectUtils;
//import org.apache.commons.logging.Log;
//import org.apache.commons.logging.LogFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.json.*;

//import com.netcracker.solutions.titalia.sparkle.kpi.KPISheetHelper;
import com.netcracker.solutions.titalia.sparkle.kpiReports.KPISQLData;

public class KPIReportsHelper extends com.netcracker.jsp.JsonDispatcherPage
{
    public static final String SQLFILE_GET_ORDER_BY_STATUS_T_HEAD  = "GET_ORDER_BY_STATUS_T_HEAD";
    public static final String SQLFILE_GET_ORDER_BY_STATUS_T_DATA  = "GET_ORDER_BY_STATUS_T_DATA";

    public static final String SQLFILE_GET_ORDER_BY_STATUS_G_DATA  = "GET_ORDER_BY_STATUS_G_DATA";

    public static final String SQLFILE_GET_ERR_T_HEAD  = "GET_ERR_ORDER_T_HEAD";
    public static final String SQLFILE_GET_ERR_T_DATA  = "GET_ERR_ORDER_T_DATA";

    public static final String SQLFILE_GET_START_DATE_DATA  = "GET_START_DATE_DATA";
    public static final String SQLFILE_GET_END_DATE_DATA  = "GET_END_DATE_DATA";

    private static final Logger LOG = LoggerFactory.getLogger(KPIReportsHelper.class);

    public KPIReportsHelper(PageContext pageContext){
        setPageContext(pageContext);
    }

    public KPIReportsHelper(){}

    public static String findSQL(String sqlName) {
        String query = QueryFinder.findQuery(sqlName, KPISQLData.class);
        return query;
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
                sqlCode = SQLFILE_GET_START_DATE_DATA;
            }
            else if ("ED".equals(dateParam)) {
                sqlCode = SQLFILE_GET_END_DATE_DATA;
            }
            else {
                LOG.debug("dateParam wasnt recognized");
                result.put("exeption", "dateParam wasnt recognized:"+dateParam);
                return result;
            }

            //outputString = getDateFieldModel(sqlCode);

            /* ************************************ Start Constructing model ************************************ */
            outputString.append("{\n");

            List<KPISQLData> getDateModel = KPISQLData.getData(findSQL(sqlCode));
            if (getDateModel.size() == 1) {
                outputString.append(getDateModel.get(0).data + "\n");
            }
            else {
                //NO DATA
                //return new StringBuilder();
            }

            outputString.append("};");
            /* ************************************ End Constructing model ************************************ */

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

            //outputString = getTableModel(SQLFILE_GET_ORDER_BY_STATUS_T_HEAD, SQLFILE_GET_ORDER_BY_STATUS_T_DATA, tableFilter);

            /* ************************************ Start Constructing model ************************************ */
            boolean existRows = true;

            outputString.append(
                    "{\n" +
                    "  \"model\": {\n" +
                    "    \"header\": {\n" +
                    "      \"rows\": ["
            );

            List<KPISQLData> getTableHeader = KPISQLData.getData(findSQL(SQLFILE_GET_ORDER_BY_STATUS_T_HEAD));
            if (getTableHeader.size() == 1) {
                outputString.append(getTableHeader.get(0).data + "\n");
            }
            else {
                //NO DATA
                //return new StringBuilder();
            }

            // Close header
            outputString.append(
                    "      ]\n" +
                    "    }"
            );

            // Model body
            List<KPISQLData> rows;
            rows = KPISQLData.getData(findSQL(SQLFILE_GET_ORDER_BY_STATUS_T_DATA),tableFilter);

            if (rows.size() < 1) {existRows = false;}

            if (existRows) {
                outputString.append(
                        ", \"body\": {\n" +
                        "    \"rows\": [\n"
                );
            }

            int i = 0;
            for (KPISQLData sqlData : rows) {
                outputString.append(sqlData.data + "\n");
                if (i < (rows.size() - 1)) {
                    outputString.append(", ");
                }
                i++;
            }

            outputString.append(
                    "\n    ]\n" +
                    "    }\n" +
                    "  }\n"+
                    "};"
            );

            /* ************************************ End Constructing model ************************************ */

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

            //outputString = getGraphModel(SQLFILE_GET_ORDER_BY_STATUS_G_DATA, graphFilter);

            /* ************************************ Start Constructing model ************************************ */
            outputString.append("{\"series\": [");
            List<KPISQLData> getData = KPISQLData.getData(findSQL(SQLFILE_GET_ORDER_BY_STATUS_G_DATA),graphFilter);
            if (getData.size() == 1) {
                outputString.append(getData.get(0).data + "\n");
            }
            else {
                //NO DATA
                //return new StringBuilder();
            }
            outputString.append("\n]};\n");
            /* ************************************ End Constructing model ************************************ */

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

