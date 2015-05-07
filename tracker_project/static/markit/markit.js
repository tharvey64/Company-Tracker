function timestamp(time_string){
    var x = time_string.lastIndexOf(":");
    time_string = time_string.slice(0,x) + time_string.substring(x+1)
    return time_string.replace("UTC","");
}

$(document).ready(function(){
    // get dataset with a getJSON
    var dataset = [];

    setInterval(function(){
        $.getJSON("/markit/live_stock/",function(data){
            if (data["Error"]){
                console.log(data["Error"]);
            }
            else{

                dataset.push([timestamp(data["Timestamp"]),data["LastPrice"]]);
                var parseDate = d3.time.format("%a %B %e %X %Z %Y").parse
                var h = parseInt($(".container").css('height'));
                var w; 
                var containerWidth = parseInt($(".container").css('width'));

                if ((dataset.length/2) > (containerWidth*2)){
                    w = dataset.length/2;
                }
                else{
                    w = containerWidth * 2;
                }
                $(".container").empty()

                d3.select(".container")
                .append("svg")
                .attr("width",w)
                .attr("height",h);

                var svg = d3.select("svg")

                var low = d3.min(dataset,function(d){return d[1]});
                var high = d3.max(dataset,function(d){return d[1]}) * 1.25;
                
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
                }).attr("r", 1).style("fill","blue");

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
    }, 20000);
});