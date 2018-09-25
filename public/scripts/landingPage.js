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

    //getData(metric, start, end);
    drawDashboard();
});

function drawLineGraph(JSONresponse) {

    var svg = d3.select('#my-visualisation').append('svg')
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
// Nav bar stuff
// Hide submenus
$('#body-row .collapse').collapse('hide');

// Collapse/Expand icon
$('#collapse-icon').addClass('fa-angle-double-left');

// Collapse click
$('[data-toggle=sidebar-colapse]').click(function() {
    SidebarCollapse();
});

function SidebarCollapse() {
    $('.menu-collapsed').toggleClass('d-none');
    $('.sidebar-submenu').toggleClass('d-none');
    $('.submenu-icon').toggleClass('d-none');
    $('#sidebar-container').toggleClass('sidebar-expanded sidebar-collapsed');

    // Treating d-flex/d-none on separators with title
    var SeparatorTitle = $('.sidebar-separator-title');
    if (SeparatorTitle.hasClass('d-flex')) {
        SeparatorTitle.removeClass('d-flex');
    } else {
        SeparatorTitle.addClass('d-flex');
    }

    // Collapse/Expand icon
    $('#collapse-icon').toggleClass('fa-angle-double-left fa-angle-double-right');
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

function drawDashboard() {

    var svg = d3.select("#dashboardAnimation").append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(makeResponsive);

    var radius = 40;

    d3.json("/cdn/data/graphNames.json").then(function(data) {
        //    console.log(error);
        var circles = d3.range(10).map(function() {
            return {
                x: Math.round(Math.random() * (width - radius * 2) + radius),
                y: Math.round(Math.random() * (height - radius * 2) + radius),
            };
        });

        JSONdata = data.children;
        console.log(JSONdata)
        let dataCopy = JSONdata;
        //var resultObject = Object.assign(dataCopy, circles);

        let resultObject = circles;
        $.extend(true, resultObject, JSONdata);
        console.log(resultObject)

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
                console.log("im clicked")
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