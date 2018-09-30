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

    drawDashboard();
});

function drawDashboard() {

    var svg = d3.select("#dashboardAnimation").append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(makeResponsive);

    var radius = 40;

    d3.json("/cdn/data/graphNames.json").then(function(data) {
        var circles = d3.range(10).map(function() {
            return {
                x: Math.round(Math.random() * (width - radius * 2) + radius),
                y: Math.round(Math.random() * (height - radius * 2) + radius),
            };
        });

        JSONdata = data.children;

        let resultObject = circles;
        $.extend(true, resultObject, JSONdata);

        var color = d3.scaleOrdinal(d3.schemeCategory10);

        var elem = svg.selectAll("g")
            .data(resultObject);

        var elemEnter = elem.enter()
            .append("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("click", function(d) {
                window.open(d.address, "_self");
            });

        elemEnter.append("circle")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", radius)
            .style("fill", function(d, i) { return color(i); })
            .attr("cursor", "pointer");

        elemEnter.append('text')
            .attr("x", function(d) { return d.x - radius / 1.5; })
            .attr("y", function(d) { return d.y; })
            .text(function(d) { return d.name })
            .attr({
                "font-size": function(d) {
                    return 8;
                },
                "dx": function(d) {
                    return -20;
                },
                "cursor": "pointer"
            });
    });
}

function dragstarted(d) {
    d3.select(this).raise().classed("active", true);
}

function dragged(d) {
    d3.select(this).select("text").attr("x", d.x = d3.event.x - 40 / 1.5).attr("y", d.y = d3.event.y);
    d3.select(this).select("circle").attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
    d3.select(this).classed("active", false);
}