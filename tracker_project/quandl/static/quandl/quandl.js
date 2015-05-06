function drawGraph(dataset){
    var parseDate = d3.time.format("%Y-%m-%d").parse
    var h = parseInt($("#graph").css('height'));
    var graphWidth = parseInt($("#graph").css('width'));
    var w = dataset.length/5 * graphWidth;

    d3.select("#graph")
    .append("svg")
    .attr("width",w)
    .attr("height",h);

    var svg = d3.select("svg");

    var low = d3.min(dataset,function(d){return parseFloat(d[1])});
    var high = d3.max(dataset,function(d){return parseFloat(d[1])});
    
    // Need To be Refactored

    var padding = 30;

    var yScale = d3.scale.linear();
    yScale.range([h - padding, padding]);
    yScale.domain([0,high]);

    var yAxis = d3.svg.axis();
    yAxis.scale(yScale).orient("left");

    var xScale = d3.time.scale().range([padding, w-padding]);

    var input = d3.extent(dataset,function(d){ 
        return parseDate(d[0]);
    });

    input[0].setDate(input[0].getDate()-1);
    input[1].setDate(input[1].getDate()+1);
    xScale.domain(input);

    var xAxis = d3.svg.axis();
    xAxis.scale(xScale).orient("bottom");
    xAxis.ticks(d3.time.day, 1);

    svg.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", function(d){
        return xScale(parseDate(d[0]));
    })
    .attr("cy", function(d){
        return yScale(d[1]);
    }).attr("r", 3)
    .attr("class", function(d){
        return d[0]
    }).style("fill","blue");
    
    svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (h - padding) +")")
    .call(xAxis);

    svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + padding +",0)")
    .call(yAxis);


    // tooltips are initially misplaced
    $("svg > circle").tooltips();
}

$(document).ready(function(){
    // get dataset with a getJSON
    $("#stockForm").on("submit", function(event){
        event.preventDefault();
        var symbol = $("input[name='company']").val();
        $.getJSON("/quandl/stock_history/" + symbol + "/", function(data){
            if (data["errors"]){
                console.log("Error");
            }
            else{
                $("#graph").empty();
                $(".tooltips").remove();
                drawGraph(data["close"]);
            }
        });
    });


    // $("#graph").on("mouseenter","circle", function(){
    //     console.log($(this)[0].__data__[1])
    // });

    // $("#graph").on("mouseleave","circle", function(){
    //     console.log($(this).attr("class")+"Leave");
    // });
});