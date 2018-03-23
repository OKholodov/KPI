package com.netcracker.solutions.titalia.sparkle.kpiReports;

import com.netcracker.applications.spfpp.common.core.PersistenceUtils;
import com.netcracker.applications.spfpp.common.core.AbstractPersistenceAction;
import com.netcracker.jsp.UniSheet;
import com.netcracker.solutions.titalia.sparkle.ff.utils.AIDAConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.util.*;

public class KPIReportSheets extends UniSheet {
    private final Logger LOG = LoggerFactory.getLogger(KPIReportSheets.class);
    private String htmlPage;

    public KPIReportSheets(String htmlPage) {
        this.htmlPage = htmlPage;
    }

    @Override
    public void printWindowContent() throws Exception {
        new PersistenceUtils().doInPersistenceContext(
                new AbstractPersistenceAction() {
                    public Object run() throws Exception {
                        printData();
                        return null;
                    }
                }, AIDAConstants.BASE_PERSISTENCE_CONFIG_ALIAS);
    }

    private void printData() throws Exception {
        //printPrototypeFix();
        //printUXHeader();

		
		
        out.print("<html> \n" +
                "  <head> \n" +
                "    <script src=\"/scripts/jquery.js\"></script> \n" +
                "    <script> \n" +
                "    $(function(){\n" +
                "      $(\"#includedContent\").load(\"/solutions/titalia/sparkle/kpiReports/" + htmlPage + "\"); \n" +
                "    });\n" +
                "    </script> \n" +
                "  </head> \n" +
                "\n" +
                "  <body> \n" +
                "     <div id=\"includedContent\"></div>\n" +
                "  </body> \n" +
                "</html>");
		

/*
        out.print("<script>jQuery.getScript(\"/solutions/"
                + "titalia/sparkle/kpiReports/getparams.js\", function(){"
                + "pageInit();});</script>");
*/

    }

    private void printUXHeader() throws IOException {
        out.print(
                "<html>\n" +
                        "  <head>\n" +
                        "    <meta charset=\"UTF-8\"/>\n" +
                        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>\n" +
                        "    <title>Webpack Bundle Analyzer</title>\n" +
                        "    <link rel=\"stylesheet\" id=\"themeStyleSheet\" href=\"/ux-ng2-embedded-components/0.0.2/assets/base.css\">\n" +
                        "  </head>\n" +
                        "<body>\n"
        );

        out.print("<script type='text/javascript' src='/ux-ng2-embedded-components/0.0.2/ng-app.js'></script>\n");
        out.print("<script type='text/javascript' src='/solutions/titalia/sparkle/kpiReports/getparams.js'></script>\n");
        //out.print("<script type='text/javascript' src='https://code.jquery.com/jquery-1.10.2.js'></script>\n");

        out.print("<div id=\"aidaAttachments\"><div "
                + "id=\"KPIButtonContent\" style=\"display: none;\">");

        out.print("</div></div>");
        out.print("<div id=\"attachTest\"></div>\n");

        /*
        out.print("<script>jQuery.getScript(\"/solutions/"
                + "titalia/sparkle/kpiReports/getparams.js\", function(){"
                + "attachInit();});</script>");
        */

    }

    private void printPrototypeFix() throws IOException {
		
		out.print("<script src=\"/scripts/prototype.js\"></script>");
		
        StringBuilder outputString = new StringBuilder();
        outputString.append(
                "<script>\n" +
                        "  Function.prototype.bind = function(oThis) {\n" +
                        "    if (typeof this !== 'function') {\n" +
                        "        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');\n" +
                        "    }\n" +
                        "    var aArgs = Array.prototype.slice.call(arguments, 1),\n" +
                        "         fToBind = this,\n" +
                        "         fNOP    = function() {},\n" +
                        "         fBound  = function() {\n" +
                        "         return fToBind.apply(this instanceof fNOP\n" +
                        "                       ? this\n" +
                        "                       : oThis,\n" +
                        "               aArgs.concat(Array.prototype.slice.call(arguments)));\n" +
                        "         };\n" +
                        "    if (this.prototype) {\n" +
                        "      // Function.prototype doesn't have a prototype property\n" +
                        "      fNOP.prototype = this.prototype;\n" +
                        "    }\n" +
                        "    fBound.prototype = new fNOP();\n" +
                        "    return fBound;\n" +
                        "  };\n" +
                        "</script>\n"
        );

        out.print(outputString.toString());
		
		out.print("<script src=\"/ux-ng2-embedded-components/uxNg2_embeddded_0.05/dist/main.bundle.js\"></script>");
        //out.print("<script src=\"/scripts/prototype.js\"></script>");
        //out.print("<script src=\"/scripts/rjRPC.js\"></script>");
    }

}
