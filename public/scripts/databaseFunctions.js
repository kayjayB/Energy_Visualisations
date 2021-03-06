function getMetrics(graphNumber) {
    $.ajax({
        url: "/getAllMetrics",
        type: "GET",
        contentType: "application/json",
        processData: false,
        async: true,
        success: function(resp) {
            if (graphNumber == 2)
                createDropdown(resp);
            else if (graphNumber == 1)
                extractMetrics(resp);
        }
    });
}

// function getData(loggerName, startDate, endDate, increments) {
//     var payload = {
//         loggerName: loggerName,
//         startDate: startDate,
//         endDate: endDate,
//         increments: increments
//     };
//     $.ajax({
//         url: "/getData",
//         type: "POST",
//         contentType: "application/json",
//         processData: false,
//         data: JSON.stringify(payload),
//         async: true,
//         success: function(resp) {
//             drawLineGraph(resp);
//         }
//     });
// }

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
            // console.log(resp)
            drawLineGraph(resp);
        }
    });
}

function getBuildingData(loggerName, startDate, endDate, increments) {
    var payload = {
        loggerName: loggerName,
        startDate: startDate,
        endDate: endDate,
        increments: increments
    };
    $.ajax({
        url: "/getBuildingData",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        async: true,
        success: function(resp) {
            // console.log(resp)
            drawMultiLineGraph(resp);
        }
    });
}