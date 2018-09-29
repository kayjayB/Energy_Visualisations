var d;
var margin = { top: 20, right: 20, bottom: 110, left: 40 },
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var margin2 = { top: 330, right: 20, bottom: 30, left: 40 },
    height2 = 400 - margin2.top - margin2.bottom;

$(document).ready(function() {

    var end = ('2018/09/01 00:00');
    var start = ('2017/08/30 00:00');
    var metric = 'WITS_13_Jubilee_Road_kVarh';

    getMetrics();
});

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

function createDropdown(Metrics) {
    let dropdownContainer = document.getElementById("buildingDropdown");

    for (let i = 0; i < Metrics.length; i++) {
        let link = document.createElement("a");
        link.className = "dropdownLink";
        link.id = "dropdownLink_" + i.toString();
        link.innerHTML = Metrics[i];

        dropdownContainer.appendChild(link);
    }
}

function drawLineGraph(JSONresponse) {

    var svg = d3.select('#visualisation2').append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(makeResponsive);

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    var x = d3.scaleTime()
        .rangeRound([0, width]);
    var x2 = d3.scaleTime()
        .rangeRound([0, width]);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);
    var y2 = d3.scaleLinear()
        .rangeRound([height, 0]);

    var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y);

    var brush = d3.brushX()
        .extent([
            [0, 0],
            [width, height2]
        ])
        .on("brush", brushed);

    var line = d3.line()
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y(d[1]); });
    var line2 = d3.line()
        .x(function(d) { return x2(d[0]); })
        .y(function(d) { return y2(d[1]); });

    d = JSONresponse;
    d = d[0].dps;

    x.domain(d3.extent(d, function(data) { return data[0]; }));
    y.domain(d3.extent(d, function(data) { return data[1]; }));

    x2.domain(x.domain());
    y2.domain(y.domain());


    focus.append("path")
        .datum(d)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("class", "line")
        .attr("d", line);

    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    focus.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Energy (kWh)");

    svg.append("text")
        .attr("transform",
            "translate(" + ((width + margin.right + margin.left) / 2) + " ," +
            (height + margin.top + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .text("Date");

    context.append("path")
        .datum(d)
        .attr("class", "line")
        .attr("d", line2)

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    function brushed() {
        var selection = d3.event.selection;
        x.domain(selection.map(x2.invert, x2));
        focus.selectAll(".line").attr("d", line);
        focus.select(".axis--x").call(d3.axisBottom(x));
    }

}

function makeResponsive(svg) {
    var container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspectRatio = width / height;

    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMid")
        .call(resize);

    d3.select(window).on("resize." + container.attr("id"), resize);


    function resize() {
        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspectRatio));
    }
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
            // return data;'
            drawLineGraph(resp);
        }
    });
}

function myFunction() {
    document.getElementById("buildingDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {

        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}