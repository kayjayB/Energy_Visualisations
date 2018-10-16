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
        var targetWidth = parseInt(container.style("width")) - 120;
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspectRatio));
    }
}

function clearGraph() {
    var clear = d3.select('#dashboardAnimation');
    clear.selectAll("*").remove();
}