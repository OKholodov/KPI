package com.netcracker.solutions.titalia.sparkle.kpi;

import com.netcracker.solutions.titalia.sparkle.kpi.KPISQLData;
import com.netcracker.framework.query.*;

import java.util.*;
import org.json.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class KPISheetHelper {

    public static final String SQLFILE_GET_ORDER_BY_STATUS_T_HEAD  = "GET_ORDER_BY_STATUS_T_HEAD";
    public static final String SQLFILE_GET_ORDER_BY_STATUS_T_DATA  = "GET_ORDER_BY_STATUS_T_DATA";

    public static final String SQLFILE_GET_ORDER_BY_STATUS_G_HEAD  = "GET_ORDER_BY_STATUS_G_HEAD";
    public static final String SQLFILE_GET_ORDER_BY_STATUS_G_DATA  = "GET_ORDER_BY_STATUS_G_DATA";

    public static final String SQLFILE_GET_ERR_T_HEAD  = "GET_ERR_ORDER_T_HEAD";
    public static final String SQLFILE_GET_ERR_T_DATA  = "GET_ERR_ORDER_T_DATA";

    public static final String SQLFILE_GET_START_DATE_DATA  = "GET_START_DATE_DATA";
    public static final String SQLFILE_GET_END_DATE_DATA  = "GET_END_DATE_DATA";

    private static final Logger LOG = LoggerFactory.getLogger(KPISheetHelper.class);

    public static String findSQL(String sqlName) {
        String query = QueryFinder.findQuery(sqlName, KPISQLData.class);
        return query;
    }

    public static StringBuilder getTableModel(String headSql, String bodySql, Object[] tableFilter) {

        StringBuilder outputString = new StringBuilder();
        boolean existRows = true;

        outputString.append(
                "{\n" +
                "  \"model\": {\n" +
                "    \"header\": {\n" +
                "      \"rows\": ["
        );

        List<KPISQLData> getTableHeader = KPISQLData.getData(findSQL(headSql));
        if (getTableHeader.size() == 1) {
            outputString.append(getTableHeader.get(0).data + "\n");
        }
        else {
            //NO DATA
            return new StringBuilder();
        }

        // Close header
        outputString.append(
                "      ]\n" +
                "    }"
        );

        // Model body
        List<KPISQLData> rows;
        rows = KPISQLData.getData(findSQL(bodySql),tableFilter);

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

        return outputString;

    }

    public static StringBuilder getGraphModel(String headSql, String bodySql, Object[] tableFilter) {

        StringBuilder outputString = new StringBuilder();
        boolean existRows = true;

        outputString.append(
                "{\n" +
                "  \"model\": {\n" +
                "    \"header\": {\n" +
                "      \"rows\": ["
        );

        List<KPISQLData> getTableHeader = KPISQLData.getData(findSQL(headSql));
        if (getTableHeader.size() == 1) {
            outputString.append(getTableHeader.get(0).data + "\n");
        }
        else {
            //NO DATA
            return new StringBuilder();
        }

        // Close header
        outputString.append(
                "      ]\n" +
                "    }"
        );

        // Model body
        List<KPISQLData> rows;
        rows = KPISQLData.getData(findSQL(bodySql),tableFilter);

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

        return outputString;

    }

    public static StringBuilder getDateFieldModel(String sqlModel) {
        StringBuilder outputString = new StringBuilder();
        outputString.append("{\n");

        List<KPISQLData> getDateModel = KPISQLData.getData(KPISheetHelper.findSQL(sqlModel));
        if (getDateModel.size() == 1) {
            outputString.append(getDateModel.get(0).data + "\n");
        }
        else {
            //NO DATA
            return new StringBuilder();
        }

        outputString.append("};");

        return outputString;
    }

    public static LinkedHashMap getTableModelMap(String headSql, String bodySql, Object[] tableFilter) {

        StringBuilder outputString = new StringBuilder();

        LinkedHashMap<String, Object> head = new LinkedHashMap<String, Object>();
        LinkedHashMap<String, Object> body = new LinkedHashMap<String, Object>();

        LinkedHashMap<String, LinkedHashMap<String, Object>> res = new LinkedHashMap<String, LinkedHashMap<String, Object>>();

        boolean existRows = true;

        /*
        outputString.append(
                "{\n" +
                        "  \"model\": {\n" +
                        "    \"header\": {\n" +
                        "      \"rows\": ["
        );
*/
        List<KPISQLData> getTableHeader = KPISQLData.getData(findSQL(headSql));
        if (getTableHeader.size() == 1) {
            //outputString.append(getTableHeader.get(0).data + "\n");
            head.put("rows",getTableHeader.get(0).data);
        }
        else {
            //NO DATA
            return new LinkedHashMap<String, Object>(); //StringBuilder();
        }

        // Close header
        /*
        outputString.append(
                "      ]\n" +
                        "    }"
        );
        */

        // Model body
        List<KPISQLData> rows;
        rows = KPISQLData.getData(findSQL(bodySql),tableFilter);

        if (rows.size() < 1) {existRows = false;}

        if (existRows) {
            //String[] stringArray = rows.toArray(new String[0]);

            String[] stringArray = new String[rows.size()];
            int index = 0;
            for (KPISQLData sqlData : rows) {
                stringArray[index] = (String) sqlData.data;
                index++;
            }

            body.put("rows", stringArray);
        }

        /*
        if (existRows) {
            outputString.append(
                    ", \"body\": {\n" +
                            "    \"rows\": [\n"
            );
        }
        */

        /*
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
        */

        /*
        JSONObject jsonHead = new JSONObject(head);
        JSONObject jsonBody = new JSONObject(body);

        LOG.debug("jsonHead="+jsonHead.toString());
        LOG.debug("jsonBody="+jsonBody.toString());
*/
        res.put("header", head);
        res.put("body", body);

        return res;

    }

}
