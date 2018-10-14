var d;

let margin = { top: 20, right: 40, bottom: 110, left: 50 },
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

let margin2 = { top: 330, right: 20, bottom: 30, left: 50 },
    height2 = 400 - margin2.top - margin2.bottom;

let end = ('2018/12/31 23:59');
let start = ('2018/01/01 00:00');

let graphNumber = 1;

$(document).ready(function() {
    var metric = 'WITS_13_Jubilee_Road_kVarh';

    setUpDashboard();

});

function setUpDashboard() {
    clearGraph();
    var link = document.getElementById('metricsButton');
    link.style.display = 'none';

    var link = document.getElementById('submitButton');
    link.style.display = 'none';

    var link = document.getElementById('resButton');
    link.style.display = 'none';

    var link = document.getElementById('yearsButton');
    link.style.display = 'none';

    drawDashboard();
}

function drawDashboard() {

    var svg = d3.select("#dashboardAnimation").append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(makeResponsive);

    var radius = 50;

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
                if (d.address == "visualisation1") {
                    visualisation1();
                } else if (d.address == "visualisation2")
                    visualisation2();
            });

        elemEnter.append("circle")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", radius)
            .style("fill", function(d, i) { return color(i); })
            .attr("cursor", "pointer");

        elemEnter.append('text')
            .attr("x", function(d) { return d.x - radius / 1.2; })
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
    d3.select(this).select("text").attr("x", d.x = d3.event.x - 50 / 1.2).attr("y", d.y = d3.event.y);
    d3.select(this).select("circle").attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
    d3.select(this).classed("active", false);
}

function visualisation1() {
    clearGraph();
    var link = document.getElementById('metricsButton');
    link.style.display = 'block';
    link.innerHTML = "Metric";
    clearChildren("unitsDropdown");
    makeUnitsDropdown();
    link.setAttribute("onclick", "unitsSelector();");

    var link = document.getElementById('submitButton');
    link.style.display = 'block';
    link.setAttribute("onclick", "submitParameters1();");

    var link = document.getElementById('resButton');
    link.style.display = 'block';

    var link = document.getElementById('yearsButton');
    link.style.display = 'block';
    link.setAttribute("onclick", "years();");

    if (document.getElementById('yearDropdown')) {
        document.getElementById("yearDropdown").id = "yearDropdown2";
    }
    clearChildren("yearDropdown2");

    makeYearSelector();

    graphNumber = 1;
    getMetrics(graphNumber);
}

function visualisation2() {
    clearGraph();
    var link = document.getElementById('metricsButton');
    link.style.display = 'block';
    link.innerHTML = "Residence";
    clearChildren("unitsDropdown");
    link.setAttribute("onclick", "buildings();");

    var link = document.getElementById('submitButton');
    link.style.display = 'block';
    link.setAttribute("onclick", "submitParameters2();");

    var link = document.getElementById('resButton');
    link.style.display = 'block';

    var link = document.getElementById('yearsButton');
    link.style.display = 'block';
    link.setAttribute("onclick", "years2();");
    if (document.getElementById('yearDropdown2')) {
        document.getElementById("yearDropdown2").id = "yearDropdown";
    }
    clearChildren("yearDropdown");

    makecheckBoxes();

    var checkboxes = document.getElementsByTagName('input');

    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].type == 'checkbox') {
            checkboxes[i].checked = false;
        }
    }
    graphNumber = 2;
    getMetrics(graphNumber);

    var selectedBuilding2 = "WITS_WC_Barnato_Sub_TRF_2_kWh";
    var resolution2 = "12h-avg";

    requiredYears = [2017, 2018];
    let startDate = [];
    let endDate = [];
    for (let i = 0; i < requiredYears.length; i++) {
        startDate.push(requiredYears[i].toString() + '/01/01 00:00'); // start of the year
        endDate.push(requiredYears[i].toString() + '/12/31 23:59'); //end of the year
    }

    getTimeData(selectedBuilding2, startDate, endDate, resolution2);
}

function clearChildren(id) {
    let dropdown = document.getElementById(id);
    while (dropdown.firstChild) {
        dropdown.removeChild(dropdown.firstChild);
    }
}

function makecheckBoxes() {
    let checkBoxContanier = document.getElementById("yearDropdown");
    checkBoxContanier.className = "dropdown-content2"
    console.log("im doing the thing")
    let input = document.createElement("input");
    input.type = "checkbox";
    input.value = 0;
    input.id = "all";
    let text = document.createTextNode("All");
    checkBoxContanier.appendChild(input);
    checkBoxContanier.appendChild(text);
    checkBoxContanier.appendChild(document.createElement("br"));

    for (let i = 2013; i < 2018; i++) {
        let input = document.createElement("input");
        input.type = "checkbox";
        input.value = i;
        input.id = i;
        let text = document.createTextNode(i);
        checkBoxContanier.appendChild(input);
        checkBoxContanier.appendChild(text);
        checkBoxContanier.appendChild(document.createElement("br"));
    }
}

function makeYearSelector() {
    let checkBoxContanier = document.getElementById("yearDropdown2");
    checkBoxContanier.className = "dropdown-content"
    console.log("im doing the thing")
    let input = document.createElement("a");
    input.id = "2013-2018";
    input.innerHTML = "All";
    checkBoxContanier.appendChild(input);

    for (let i = 2013; i < 2018; i++) {
        let input = document.createElement("a");
        input.id = i;
        input.innerHTML = i;
        checkBoxContanier.appendChild(input);

    }
}

function makeUnitsDropdown() {
    let checkBoxContanier = document.getElementById("unitsDropdown");
    checkBoxContanier.className = "dropdown-content";

    let input = document.createElement("a");
    input.id = "kWh";
    input.innerHTML = "Energy (kWh)";
    checkBoxContanier.appendChild(input);

    let input2 = document.createElement("a");
    input2.id = "kVarh";
    input2.innerHTML = "Reactive Power(kVarh)";
    checkBoxContanier.appendChild(input2);

}