let d;
let margin = { top: 20, right: 20, bottom: 110, left: 40 },
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

let margin2 = { top: 330, right: 20, bottom: 30, left: 40 },
    height2 = 400 - margin2.top - margin2.bottom;

var resolution = "6h-avg";
var units = "kVarh";

//let metric = 'WITS_13_Jubilee_Road_kVarh';
let metrics = [];
let end = ('2018/09/01 00:00');
let start = ('2018/01/01 00:00');

$(document).ready(function() {

    //getData(metric, start, end, increment);
});

function extractMetrics(JSONresponse) {
    for (let i = 0; i < JSONresponse.length; i++) {
        if (JSONresponse[i].includes(units)) {
            metrics.push(JSONresponse[i]);
        }
    }
    console.log(metrics)
    getBuildingData(metrics, start, end, resolution);
}

function drawMultiLineGraph(JSONresponse) {
    console.log(JSONresponse)

    var clear = d3.select('#my-visualisation');
    clear.selectAll("*").remove();

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
        let selection = d3.event.selection;
        x.domain(selection.map(x2.invert, x2));
        focus.selectAll(".line").attr("d", line);
        focus.select(".axis--x").call(d3.axisBottom(x));
    }

}

// *************   Dropdowns   *******************

function createDropdown(Metrics) {
    let dropdownContainer = document.getElementById("buildingDropdown");

    for (let i = 0; i < Metrics.length; i++) {
        let link = document.createElement("a");
        link.className = "dropdownLink";
        link.ID = "dropdownLink";
        link.innerHTML = Metrics[i];

        dropdownContainer.appendChild(link);
    }
}


function buildings(ID) {
    document.getElementById("buildingDropdown").classList.toggle("show");
    hideYearDropdown();
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        if (event.target.parentNode.id.includes('incrementDropdown')) {
            resolution = event.target.id;
        }
        if (event.target.parentNode.id.includes('unitsDropdown')) {
            units = event.target.id;
        }
        hideDropdown();
    }
}

function unitsSelector() {
    document.getElementById("unitsDropdown").classList.toggle("show");
}

function hideDropdown() {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
        }
    }
}

function increments() {
    document.getElementById("incrementDropdown").classList.toggle("show");
}

function submitParameters() {
    let graphNumber = 1;
    getMetrics(graphNumber);
}