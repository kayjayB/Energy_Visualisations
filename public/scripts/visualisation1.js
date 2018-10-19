var resolution = "12h-avg";
var units = "kVarh";

//let metric = 'WITS_13_Jubilee_Road_kVarh';
let metrics = [];

var requiredDateRange = "2018";


function extractMetrics(JSONresponse) {
    metrics = [];
    for (let i = 0; i < JSONresponse.length; i++) {
        if (JSONresponse[i].includes(units)) {
            metrics.push(JSONresponse[i]);
        }
    }
    console.log(start)
    getBuildingData(metrics, start, end, resolution);

}

function formatNames(metricName) {
    metricName = metricName.replace("WITS_", "");
    metricName = metricName.replace("WC_", "");
    metricName = metricName.replace("_kVarh", "");
    metricName = metricName.replace("_kWh", "");
    metricName = metricName.split('_').join(" ");
    return metricName;
}

function drawMultiLineGraph(JSONresponse) {
    var clear = d3.select('#dashboardAnimation');
    clear.selectAll("*").remove();

    let labelText;
    if (units.match("kWh")) {
        labelText = "Energy (kWh)"
    } else if (units.match("kVarh")) {
        labelText = "Reactive Power (kVarh)"
    }
    let widthNew = width - 70;

    var svg = d3.select('#dashboardAnimation').append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(makeResponsive);

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", widthNew)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    var x = d3.scaleTime()
        .rangeRound([0, widthNew]);
    var x2 = d3.scaleTime()
        .rangeRound([0, widthNew]);

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
            [widthNew, height2]
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
        .attr("width", 7)
        .attr("height", 7)
        .attr("x", width + (margin.right / 3) - 80)
        .attr("y", function(d, i) { return (legendSpace) + i * (legendSpace) - 6; }) // spacing
        .attr("fill", function(data) {
            return colour(data.buildingName); // If array key "visible" = true then color rect, if not then make it grey 
        })
        .attr("class", "legend-box")

    issue.append("text")
        .attr("x", width + (margin.right / 3) - 70)
        .attr("y", function(d, i) { return (legendSpace) + i * (legendSpace); })
        .style("font", "7px sans-serif")
        .text(function(data) { return formatNames(data.buildingName); });

    svg.append("text")
        .attr("transform",
            "translate(" + ((width + margin.right + margin.left) / 2) + " ," +
            (height + margin.top + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .text("Date");

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "none")
        .text(requiredDateRange);

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

function submitParameters1() {
    //let graphNumber = 1;
    if (requiredDateRange == "2013-2018") {
        end = ('2018/12/31 23:59');
        start = ('2013/01/01 00:00');
    } else {
        start = requiredDateRange.toString() + '/01/01 00:00'; // start of the year
        console.log("start is 33:", start)
        end = requiredDateRange.toString() + '/12/31 23:59'; //end of the year
    }
    console.log("start is 2:", start)
    console.log("graph number is :", graphNumber)
    getMetrics(graphNumber);
}

function years() {
    document.getElementById("yearDropdown2").classList.toggle("show");
}