package com.netcracker.solutions.titalia.sparkle.kpiReports;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;
import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;
import com.netcracker.mediation.common.spring.CommonContextProvider;
import com.netcracker.framework.query.*;

public class KPISQLData {
    private final Logger LOG = LoggerFactory.getLogger(KPISQLData.class);

    public final String data;
    public KPISQLData(String data) {
        this.data = data;
    }

    public static List<KPISQLData> getData(String sqlText){
        List<KPISQLData> sqlData = CommonContextProvider.provide().jdbc().query(sqlText,
                new RowMapper<KPISQLData>() {
                    public KPISQLData mapRow(ResultSet resultSet, int i) throws SQLException {
                        return new KPISQLData(resultSet.getString("data"));
                    }
                }
        );
        return sqlData;
    }

    public static List<KPISQLData> getData(String sqlText, Object[] filter){
        List<KPISQLData> sqlData = CommonContextProvider.provide().jdbc().query(sqlText, filter,
                new RowMapper<KPISQLData>() {
                    public KPISQLData mapRow(ResultSet resultSet, int i) throws SQLException {
                        return new KPISQLData(resultSet.getString("data"));
                    }
                }
        );
        return sqlData;
    }


}
