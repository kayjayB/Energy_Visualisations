function getMetrics() {
    $.ajax({
        url: "/getAllMetrics",
        type: "GET",
        contentType: "application/json",
        processData: false,
        async: true,
        success: function(resp) {
            createDropdown(resp);
        }
    });
}

function getData(loggerName, startDate, endDate) {
    var payload = {
        loggerName: loggerName,
        startDate: startDate,
        endDate: endDate
    };
    $.ajax({
        url: "/getData",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        async: true,
        success: function(resp) {
            // console.log(resp);
            // return data;
            drawLineGraph(resp);
        }
    });
}