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

function getData(loggerName, startDate, endDate, increments) {
    var payload = {
        loggerName: loggerName,
        startDate: startDate,
        endDate: endDate,
        increments: increments
    };
    $.ajax({
        url: "/getData",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        async: true,
        success: function(resp) {
            drawLineGraph(resp);
        }
    });
}

function getTimeData(loggerName, startDate, endDate, increments) {
    var payload = {
        loggerName: loggerName,
        startDate: startDate,
        endDate: endDate,
        increments: increments
    };
    $.ajax({
        url: "/getTimeData",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        async: true,
        success: function(resp) {
            drawLineGraph(resp);
        }
    });
}