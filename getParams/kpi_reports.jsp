<%@ page
    import = "com.netcracker.jsp.*,
    com.netcracker.ejb.core.users.*,
    com.netcracker.ejb.session.security.*"
%><%!
class ThisPage extends ModernPage
{
    protected void execute() throws Exception
    {
        SecurityBase ssession = new SecurityBase();
        User u = UserFacade.getInstance().getUserByPrincipal(ssession.getPrincipal());

        
    }
}
%><%
ThisPage thePage = new ThisPage();
thePage.setPageContext( pageContext );
try
{
    thePage.debugSecureService();
}
finally
{
}
%>