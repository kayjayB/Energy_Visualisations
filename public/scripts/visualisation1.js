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
    //console.log(JSONresponse)
    let labelText;
    if (units.match("kWh")) {
        labelText = "Energy (kWh)"
    } else if (units.match("kVarh")) {
        labelText = "Reactive Power (kVarh)"
    }

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
        .rangeRound([0, width - 40]);
    var x2 = d3.scaleTime()
        .rangeRound([0, width - 40]);

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

    var line = d3.line().curve(d3.curveBasis)
        .x(function(data) { return x(data.date); })
        .y(function(data) { return y(data.consumption); });

    var line2 = d3.line().curve(d3.curveBasis)
        .x(function(data) { return x2(data.date); })
        .y(function(data) { return y2(data.consumption); });

    // d = JSONresponse;
    // d = d[0].dps;

    let d = [];
    for (let index = 0; index < JSONresponse.length; index++) {
        d.push(JSONresponse[index][0]);
    }

    d.forEach(function(data) {
        data.dps.forEach(function(e) { // Make every date in the csv data a javascript date object format
            e[0] = new Date(e[0]);
        });
    });

    var colour = d3.scaleOrdinal().range(d3.schemeCategory10);
    colour.domain(d3.keys(metrics).filter(function(key) {
        return key;
    }));

    let formattedData = colour.domain().map(function(funcData) { // Nest the data into an array of objects with new keys
        return {
            buildingName: metrics[funcData],
            values: d.find(function(element) { return element.metric == metrics[funcData]; }).dps.map(function(data) { // "values": which has an array of the dates and ratings
                return {
                    date: data[0],
                    consumption: +data[1],
                };
            }),
            //visible: (funcData === requiredYears[1] ? true : false)
            visible: true
        };
    });

    x.domain(d3.extent(d[0].dps, function(data) { return data[0]; }));
    y.domain([0, d3.max(formattedData, function(c) { return d3.max(c.values, function(v) { return v.consumption; }); })]);
    x2.domain(x.domain());
    y2.domain(y.domain());

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
        .text(labelText);

    var issue = focus.selectAll(".issue")
        .data(formattedData) // Select nested data and append to new svg group elements
        .enter().append("g")
        .attr("class", "issue");

    issue.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .style("pointer-events", "none") // Stop line interferring with cursor
        .attr("d", function(data) {
            return line(data.values); // If array key "visible" = true then draw line, if not then don't 
        })
        .style("stroke", function(data) { return colour(data.buildingName); });

    // draw legend
    let legendSpace = (380 - margin.top - margin.bottom) / metrics.length;

    issue.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("x", width + (margin.right / 3) - 35)
        .attr("y", function(d, i) { return (legendSpace) + i * (legendSpace) - 8; }) // spacing
        .attr("fill", function(data) {
            return colour(data.buildingName); // If array key "visible" = true then color rect, if not then make it grey 
        })
        .attr("class", "legend-box")

    issue.append("text")
        .attr("x", width + (margin.right / 3) - 20)
        .attr("y", function(d, i) { return (legendSpace) + i * (legendSpace); })
        .style("font", "10px sans-serif")
        .text(function(data) { return data.buildingName; });

    svg.append("text")
        .attr("transform",
            "translate(" + ((width + margin.right + margin.left) / 2) + " ," +
            (height + margin.top + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .text("Date");

    context.append("path")
        .data(formattedData)
        .attr("class", "line")
        .attr("d", function(data) {
            return line2(data.values); // If array key "visible" = true then draw line, if not then don't 
        })

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
        focus.selectAll(".line").attr("d", function(data) {
            return line(data.values); // If array key "visible" = true then draw line, if not then don't 
        })
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