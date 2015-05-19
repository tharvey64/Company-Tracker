function createSvg(height, width){
    $("#graph").empty();

    d3.select("#graph")
        .append("svg")
        .attr("width",width)
        .attr("height",height);
}
// Could Make the parameter a json
// This Function Should only Handle One Dataset At a Time
function drawGraph(dataset, parseDate, startDate, circleClass, selector, titleIndex, radiusRange, newGraph){
    $("body").remove(".tooltip");
    var h = parseInt($("#graph").css("height"));
    var w = parseInt($("#graph").css("width"));
    if (newGraph){
        createSvg(h,w);
    }
    var svg = d3.select("svg");
    
    // Needs To be Refactored

    var padding = 50;

    // THIS SHOULD NOT SCALE FOR SENTIMENT
    var low = d3.min(dataset,function(d){return  (parseFloat(d[1]) < 1 ? -1:parseFloat(d[1]) * 0.8)});
    var high = d3.max(dataset,function(d){return (parseFloat(d[1]) < 1 ? 1:parseFloat(d[1]) * 1.2)});
    var yScale = d3.scale.linear();
    yScale.range([h - padding, padding]);
    yScale.domain([low, high]);

    var yAxis = d3.svg.axis();
    yAxis.scale(yScale).orient("left");

    var xScale = d3.time.scale().range([padding, w-padding]);

    startDate.setDate(startDate.getDate()-1);
    var endDate = new Date()
    endDate.setDate(endDate.getDate()+1);
    xScale.domain([startDate, endDate]);

    var radiusHigh = d3.max(dataset,function(d){return parseFloat(d[2])});
    var radiusLow = d3.min(dataset,function(d){return parseFloat(d[2])});
    var radiusScale = d3.scale.linear()
    
    radiusScale.range(radiusRange)
        .domain([radiusLow,radiusHigh]);

    var xAxis = d3.svg.axis();
    xAxis.scale(xScale).orient("bottom");
    
    svg.selectAll("circle" + circleClass)
        .data(dataset)
        .enter()
        .append("circle")
        .attr("class", circleClass)
        .attr("cx", function(d){
            return xScale(parseDate(d[0]));
        })
        .attr("cy", function(d){
            return yScale(parseFloat(d[1]));
        }).attr("r", function(d){
            return radiusScale(d[2]);
        }).attr("title", function(d){
            return d[titleIndex];
        });
    
    // New Function To Attach Axis 
    var translate = "translate(" + (w-padding) +",0)";
    if (newGraph){
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (h - padding) +")")
            .call(xAxis)
            .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(){
                    return "rotate(-65)";
                });

        translate = "translate(" + padding +",0)";
    }

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    $("circle").tooltips();
}

// var graphData = {
//     "dataset":[], 
//     "parseDate" = function(d){}, 
//     "circleClass":"", 
//     "title" = function(d){}, 
//     "radiusRange":[1,1]
// }

$(document).ready(function(){

    // var graph = {
    //     "datasets":[],
    //     "startDate": undefined
    // }

    $("#graph").on("drawGraph", function(event, graphData, dateFormat, start, className, selector, titleIndex,radiusRange, newGraph){
        drawGraph(graphData, dateFormat, start, className, selector, titleIndex, radiusRange, newGraph);
        $("#footer").css("display", "block");
    });   
});