var margin = { top: 20, right: 20, bottom: 110, left: 40 },
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var selectedBuilding = "";
var resolution = "1h-avg";
var end = ('2018/09/01 00:00');
var start = ('2017/08/30 00:00');

let requiredYears = [];

var margin2 = { top: 330, right: 20, bottom: 30, left: 40 },
    height2 = 400 - margin2.top - margin2.bottom;

$(document).ready(function() {

    var checkboxes = document.getElementsByTagName('input');

    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].type == 'checkbox') {
            checkboxes[i].checked = false;
        }
    }

    getMetrics();
});

function submitParameters() {
    if (selectedBuilding == "") {
        alert("Please select a building");
        return;
    }
    let dropdown = document.getElementById("yearDropdown");
    let children = dropdown.childNodes;
    requiredYears = [];
    children.forEach(function(item) {
        if (item.checked == true) {
            requiredYears.push(item.value);
        }
    });
    hideYearDropdown();
    let startDate = [];
    let endDate = [];
    for (let i = 0; i < requiredYears.length; i++) {
        startDate.push(requiredYears[i].toString() + '/01/01 00:00'); // start of the year
        endDate.push(requiredYears[i].toString() + '/12/31 23:59'); //end of the year
    }
    //let increment = '1h-avg';
    console.log(endDate);
    getTimeData(selectedBuilding, startDate, endDate, resolution);
}

function drawLineGraph(JSONresponse) {
    var clear = d3.select('#visualisation2');
    clear.selectAll("*").remove();

    let labelTextIndex = selectedBuilding.lastIndexOf("_");
    let labelText = selectedBuilding.substring(labelTextIndex);
    if (labelText.match("kWh")) {
        labelText = "Energy (kWh)"
    } else if (labelText.match("kVarh")) {
        labelText = "Reactive Power (kVarh)"
    }
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

    var line = d3.line().curve(d3.curveBasis)
        .x(function(data) { return x(data.date); })
        .y(function(data) { return y(data.consumption); });
    var line2 = d3.line().curve(d3.curveBasis)
        .x(function(data) { return x2(data.date); })
        .y(function(data) { return y2(data.consumption); });

    let d = [];
    for (let index = 0; index < JSONresponse.length; index++) {
        d.push(JSONresponse[index][0]);
        d[index].metric = requiredYears[index]; // Replace the metric name with the year
    }
    //console.log(d)

    var color = d3.scaleOrdinal().range(d3.schemeCategory10);
    color.domain(d3.keys(requiredYears).filter(function(key) { // Set the domain of the color ordinal scale to be all the csv headers except "date", matching a color to an issue
        return key;
    }));

    let formattedData = color.domain().map(function(funcData) { // Nest the data into an array of objects with new keys
        // console.log(funcData);
        // console.log(requiredYears[funcData]);
        // console.log(d);
        return {
            year: funcData,
            values: d.find(function(element) { return element.metric == requiredYears[funcData]; }).dps.map(function(data) { // "values": which has an array of the dates and ratings
                return {
                    date: data[0],
                    consumption: data[1],
                };
            }),
            visible: (funcData === requiredYears[1] ? true : false)
        };
    });

    console.log(formattedData);

    x.domain(d3.extent(d[0].dps, function(data) { return data[0]; }));
    y.domain(d3.extent(d[0].dps, function(data) { return data[1]; }));
    //z.domain(formattedData.map(function(c) { return c.year; }));

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

    // focus.append("path")
    //     .data(formattedData)
    //     .attr("fill", "none")
    //     .attr("stroke", "steelblue")
    //     .attr("stroke-linejoin", "round")
    //     .attr("stroke-linecap", "round")
    //     .attr("stroke-width", 1.5)
    //     .attr("class", "line")
    //     .attr("d", line);

    var issue = focus.selectAll(".issue")
        .data(formattedData) // Select nested data and append to new svg group elements
        .enter().append("g")
        .attr("class", "issue");

    issue.append("path")
        .attr("class", "line")
        .style("pointer-events", "none") // Stop line interferring with cursor
        .attr("id", function(d) {
            return "line-" + d.year.replace(" ", "").replace("/", ""); // Give line id of line-(insert issue name, with any spaces replaced with no spaces)
        })
        .attr("d", function(d) {
            return d.visible ? line(d.values) : null; // If array key "visible" = true then draw line, if not then don't 
        })
        .attr("clip-path", "url(#clip)") //use clip path to make irrelevant part invisible
        .style("stroke", function(d) { return color(d.year); });

    svg.append("text")
        .attr("transform",
            "translate(" + ((width + margin.right + margin.left) / 2) + " ," +
            (height + margin.top + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .text("Date");

    context.append("path")
        .data(formattedData)
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
        if (event.target.parentNode.id.includes('buildingDropdown')) {
            selectedBuilding = event.target.innerHTML;
        } else if (event.target.parentNode.id.includes('incrementDropdown')) {
            resolution = event.target.id;
        }
        hideDropdown();
    }
}

function years() {
    document.getElementById("yearDropdown").classList.toggle("show");
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

function hideYearDropdown() {
    var dropdowns = document.getElementsByClassName("dropdown-content2");
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