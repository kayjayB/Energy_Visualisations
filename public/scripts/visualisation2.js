var selectedBuilding = "WITS_WC_Barnato_Sub_TRF_2_kWh";
var resolution = "12h-avg";

let requiredYears = [];

function submitParameters2() {
    let counter = 0;
    if (selectedBuilding == "") {
        alert("Please select a building");
        return;
    }
    let dropdown = document.getElementById("yearDropdown");
    let children = dropdown.childNodes;
    requiredYears = [];
    children.forEach(function(item) {
        if (item.checked == true) {
            counter = counter + 1;
            if (item.value == 0) {
                requiredYears.push("2013");
                requiredYears.push("2014");
                requiredYears.push("2015");
                requiredYears.push("2016");
                requiredYears.push("2017");
                requiredYears.push("2018");
                return;
            } else
                requiredYears.push(item.value);
        }
    });
    hideYearDropdown();
    if (counter == 0) {
        requiredYears.push("2013");
        requiredYears.push("2014");
        requiredYears.push("2015");
        requiredYears.push("2016");
        requiredYears.push("2017");
        requiredYears.push("2018");
        let dropdown = document.getElementById("yearDropdown");
        let children = dropdown.childNodes;
        children.forEach(function(item) {
            if (item.value == 0) { // Check the all box
                item.checked = true;
            }
        });

    }
    let startDate = [];
    let endDate = [];
    for (let i = 0; i < requiredYears.length; i++) {
        startDate.push(requiredYears[i].toString() + '/01/01 00:00'); // start of the year
        endDate.push(requiredYears[i].toString() + '/12/31 23:59'); //end of the year
    }

    getTimeData(selectedBuilding, startDate, endDate, resolution);
}


function formatNames(metricName) {
    metricName = metricName.replace("WITS_", "");
    metricName = metricName.replace("WC_", "");
    metricName = metricName.replace("_kVarh", "");
    metricName = metricName.replace("_kWh", "");
    metricName = metricName.split('_').join(" ");
    return metricName;
}

function drawLineGraph(JSONresponse) {
    var clear = d3.select('#dashboardAnimation');
    clear.selectAll("*").remove();

    let labelTextIndex = selectedBuilding.lastIndexOf("_");
    let labelText = selectedBuilding.substring(labelTextIndex);
    if (labelText.match("kWh")) {
        labelText = "Energy (kWh)"
    } else if (labelText.match("kVarh")) {
        labelText = "Reactive Power (kVarh)"
    }

    var svg = d3.select('#dashboardAnimation').append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(makeResponsive);

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width - 40)
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
            [width - 40, height2]
        ])
        .on("brush", brushed);

    var line = d3.line().curve(d3.curveBasis)
        .x(function(data) { return x(data.date); })
        .y(function(data) { return y(data.consumption); });

    var line2 = d3.line().curve(d3.curveBasis)
        .x(function(data) { return x2(data.date); })
        .y(function(data) { return y2(data.consumption); });

    var parseTime = d3.timeFormat("%m-%d %H:%M"); // Extract date
    var formatYear = d3.timeParse("%Y"); // Extract date
    var parseYear = d3.timeFormat("%Y"); // Extract year
    var formatDate = d3.timeFormat("%Y-%m-%d %H:%M"); // Extract year
    var bisectDate = d3.bisector(function(d) { return d.date; }).left;

    let d = [];
    for (let index = 0; index < JSONresponse.length; index++) {
        d.push(JSONresponse[index][0]);
    }

    d.forEach(function(data) {
        data.dps.forEach(function(e) { // Make every date in the csv data a javascript date object format
            e[0] = new Date(e[0]);
        });
    });

    for (let index = 0; index < d.length; index++) {
        d[index].metric = parseYear(d[index].dps[0][0]); //requiredYears[index]; // Replace the metric name with the year
    }

    let year = formatYear("2016")
    year = parseYear(year);
    year = year + "-";
    d.forEach(function(data) {
        data.dps.forEach(function(e) { // Make every date in the csv data a javascript date object format
            e[0] = year + parseTime(e[0]);
            e[0] = new Date(e[0]);
        });
    });

    var colour = d3.scaleOrdinal().range(d3.schemeCategory10);
    colour.domain(d3.keys(requiredYears).filter(function(key) {
        return key;
    }));

    let formattedData = colour.domain().map(function(funcData) { // Nest the data into an array of objects with new keys
        return {
            year: requiredYears[funcData],
            values: d.find(function(element) { return element.metric == requiredYears[funcData]; }).dps.map(function(data) { // "values": which has an array of the dates and ratings
                return {
                    date: data[0],
                    consumption: +data[1],
                };
            }),
            //visible: (funcData === requiredYears[1] ? true : false)
            visible: true
        };
    });

    //console.log("formatted data is: ", formattedData);

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
        .style("stroke", function(data) { return colour(data.year); });

    // draw legend
    let legendSpace = (380 - margin.top - margin.bottom) / 6;

    issue.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("x", width + (margin.right / 3) - 35)
        .attr("y", function(d, i) { return (legendSpace) + i * (legendSpace) - 8; }) // spacing
        .attr("fill", function(data) {
            return colour(data.year); // If array key "visible" = true then color rect, if not then make it grey 
        })
        .attr("class", "legend-box")

    issue.append("text")
        .attr("x", width + (margin.right / 3) - 20)
        .attr("y", function(d, i) { return (legendSpace) + i * (legendSpace); })
        .style("font", "11px sans-serif")
        .text(function(data) { return data.year; });


    svg.append("text")
        .attr("transform",
            "translate(" + ((width + margin.right + margin.left) / 2) + " ," +
            (height + margin.top + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .text("Date");

    let graphTitle = formatNames(selectedBuilding);
    svg.append("text")
        .attr("x", (width / 2) + 20)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "none")
        .text(graphTitle);

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
        var selection = d3.event.selection;
        x.domain(selection.map(x2.invert, x2));
        focus.selectAll(".line").attr("d", function(data) {
            return line(data.values); // If array key "visible" = true then draw line, if not then don't 
        })
        focus.select(".axis--x").call(d3.axisBottom(x));
    }

}

// *************   Dropdowns   *******************

function createDropdown(Metrics) {
    let dropdownContainer = document.getElementById("unitsDropdown");

    for (let i = 0; i < Metrics.length; i++) {
        let link = document.createElement("a");
        link.className = "dropdownLink";
        link.id = "dropdownLink";
        link.innerHTML = Metrics[i];

        dropdownContainer.appendChild(link);
    }
}


function buildings(ID) {
    document.getElementById("unitsDropdown").classList.toggle("show");
    hideYearDropdown();
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        if (graphNumber == 2) {
            if (event.target.parentNode.id.includes('unitsDropdown')) {
                selectedBuilding = event.target.innerHTML;
            } else if (event.target.parentNode.id.includes('incrementDropdown')) {
                resolution = event.target.id;
            }
        } else if (graphNumber == 1) {
            if (event.target.parentNode.id.includes('incrementDropdown')) {
                resolution = event.target.id;
                console.log(event.target.id)
            }
            if (event.target.parentNode.id.includes('unitsDropdown')) {
                units = event.target.id;
                console.log(event.target.id)
            }
            if (event.target.parentNode.id.includes('yearDropdown2')) {
                console.log(event.target.id)
                requiredDateRange = event.target.id;
            }
        }
        hideDropdown();
    }
}

function years2() {
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