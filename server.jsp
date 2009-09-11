<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.Random" %>
<%
    Random generator = (Random) request.getSession().getAttribute("generator");
    if (generator == null) {
        generator = new Random();
        request.getSession().setAttribute("generator", generator);
    }

    try {
        Thread.sleep(generator.nextInt(5) * 1000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
%>
<p>Hello world!!! (<%= request.getParameter("times") %>)</p>