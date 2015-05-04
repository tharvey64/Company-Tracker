$(document).ready(function(){
    // get dataset with a getJSON
    var dataset;
    $.getJSON("/quandl/stock_history/",function(data){
        if (data["errors"]){
            console.log("Error");
        }
        else{
            dataset = data["close"];
            var parseDate = d3.time.format("%Y-%m-%d").parse
            var h = parseInt($(".container").css('height'));
            // Width needs to be related to the dataset length
            var w; 
            var containerWidth = parseInt($(".container").css('width'));

            if ((dataset.length/2) > (containerWidth*2)){
                w = dataset.length/2;
            }
            else{
                w = containerWidth * 2;
            }
            
            d3.select(".container")
            .append("svg")
            .attr("width",w)
            .attr("height",h);

            var svg = d3.select("svg")

            var low = d3.min(dataset,function(d){return d[1]});
            var high = d3.max(dataset,function(d){return d[1]});
            
            // Need To be Refactored
            var verticalTicks = high/10;
            var horizontalTicks = w/100;

            var padding = 30;

            var yScale = d3.scale.linear();
            yScale.range([h - padding, padding]);
            yScale.domain([0,high]);

            var yAxis = d3.svg.axis();
            yAxis.scale(yScale).orient("left");
            yAxis.ticks(verticalTicks)

            var xScale = d3.time.scale().range([padding, w-padding]);
            xScale.domain(d3.extent(dataset,function(d){ 
                return parseDate(d[0]);
            }));

            var xAxis = d3.svg.axis();
            xAxis.scale(xScale).orient("bottom");
            xAxis.ticks(horizontalTicks);

            svg.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("cx", function(d){
                return xScale(parseDate(d[0]));
            })
            .attr("cy", function(d){
                return yScale(d[1]);
            }).attr("r", 1)
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
        }
    });

    $(".container").on("mouseenter","circle", function(){
        console.log($(this).attr("class"));
    });

    $(".container").on("mouseleave","circle", function(){
        console.log($(this).attr("class")+"Leave");
    });
});