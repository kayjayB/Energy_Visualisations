$(document).ready(function() {
    console.log("Ready freddy")

    var margin = { top: 20, right: 20, bottom: 110, left: 50 },
        margin2 = { top: 430, right: 20, bottom: 30, left: 40 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        height2 = 500 - margin2.top - margin2.bottom;

    var svg = d3.select('#my-visualisation').append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

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
        .x(function(d) { return x(d.ValueTimestamp); })
        .y(function(d) { return y(d.WITS_WC_Barnato_Sub_Residence_A___D_kWh); });
    var line2 = d3.line()
        .x(function(d) { return x2(d.ValueTimestamp); })
        .y(function(d) { return y2(d.WITS_WC_Barnato_Sub_Residence_A___D_kWh); });

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
        // g.append("g")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(d3.axisBottom(x))
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

        // g.append("g")
        //     .call(d3.axisLeft(y))
        //     .append("text")
        //     .attr("fill", "#000")
        //     .attr("transform", "rotate(-90)")
        //     .attr("y", 6)
        //     .attr("dy", "0.71em")
        //     .attr("text-anchor", "end")
        //     .text("Energy (kWh)");
    });

    function brushed() {
        var selection = d3.event.selection;
        x.domain(selection.map(x2.invert, x2));
        focus.selectAll(".line").attr("d", line);
        // .attr("cx", function(d) { return x(d.ValueTimestamp); })
        //     .attr("cy", function(d) { return y(d.WITS_WC_Barnato_Sub_Residence_A___D_kWh); });
        focus.select(".axis--x").call(d3.axisBottom(x));
    }

});