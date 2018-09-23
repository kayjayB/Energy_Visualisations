$(document).ready(function() {
    console.log("Ready freddy")

    var margin = { top: 20, right: 20, bottom: 110, left: 50 },
        margin2 = { top: 430, right: 20, bottom: 30, left: 40 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        height2 = 500 - margin2.top - margin2.bottom;

    var svg = d3.select('#my-visualisation')
        .append('svg')
        .attr('height', 500)
        .attr('width', 900),
        margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleTime()
        .rangeRound([0, width]);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var line = d3.line()
        .x(function(d) { return x(d.ValueTimestamp); })
        .y(function(d) { return y(d.WITS_WC_Barnato_Sub_Residence_A___D_kWh); });

    var parseTime = d3.timeParse("%Y-%m-%d %H:%M");

    d3.csv("/cdn/scripts/WITS_WC_Barnato_Sub_Residence_A___D_kWh.csv").then(function(d) {
        console.log(d[0]);

        d.forEach(function(data) {
            data.ValueTimestamp = parseTime(data.ValueTimestamp);
            //console.log(data.ValueTimestamp);
            data.WITS_WC_Barnato_Sub_Residence_A___D_kWh = +data.WITS_WC_Barnato_Sub_Residence_A___D_kWh; // Use the + operator as a type conversion
            //console.log(data.WITS_WC_Barnato_Sub_Residence_A___D_kWh);
        });

        x.domain(d3.extent(d, function(data) { return data.ValueTimestamp; }));
        y.domain(d3.extent(d, function(data) { return data.WITS_WC_Barnato_Sub_Residence_A___D_kWh; }));

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))

        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Energy (kWh)");

        g.append("path")
            .datum(d)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line);
    });

});

function brushed() {
    var selection = d3.event.selection;
    x.domain(selection.map(x2.invert, x2));
    focus.selectAll(".dot")
        .attr("cx", function(d) { return x(d.ValueTimestamp); })
        .attr("cy", function(d) { return y(d.WITS_WC_Barnato_Sub_Residence_A___D_kWh); });
    focus.select(".axis--x").call(d3.axisBottom(x));
}