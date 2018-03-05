package com.netcracker.solutions.titalia.sparkle.kpi;

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

import java.sql.Timestamp;
import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;
import com.netcracker.mediation.common.spring.CommonContextProvider;
import com.netcracker.framework.query.*;
import javax.script.*;

public class TestSheet extends UniSheet {

    private final Logger LOG = LoggerFactory.getLogger(TestSheet.class);

    @Override
    public void printWindowContent() throws Exception {
        new PersistenceUtils().doInPersistenceContext(
                new AbstractPersistenceAction() {
                    public Object run() throws Exception {
                        //initData();
                        printData();
                        return null;
                    }
                }, AIDAConstants.BASE_PERSISTENCE_CONFIG_ALIAS);

    }

    private void printData() throws Exception {
        printUXHeader();
    }

    private void printUXHeader() throws IOException {
        out.print(
                "<html>\n" +
                        "  <head>\n" +
                        "    <meta charset=\"UTF-8\"/>\n" +
                        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>\n" +
                        "    <title>Webpack Bundle Analyzer</title>\n" +
                        "  </head>\n" +
                        "<body>\n"
        );

        //out.print("<script type='text/javascript' src='/solutions/titalia/sparkle/kpi/newsheet.js'></script>\n");

        out.print("<div id=\"aidaAttachments\"><div "
                + "id=\"KPIButtonContent\" style=\"display: none;\">");

        out.print("</div></div>");
        out.print("<div id=\"attachTest\"></div>\n");

        //out.print("<button type=\"button\" onclick=\"attachInit();\">Ok</button>");

        out.print("<script>jQuery.getScript(\"/solutions/"
                + "titalia/sparkle/kpi/getparams.js\", function(){"
                + "attachInit();});</script>");

    }

}
