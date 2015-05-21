// NOW how to create this
function Qwarg(qwargType, qwargData, qwargClassString){
    this.qwargType = qwargType;
    this.qwargData = qwargData;
    this.qwargClassString = qwargClassString;
    this.qwargParseDate;
    this.show;
    this.fill;
    this.radiusRange;
}
// Make Functions That perform select alls on the element
// Qwarg Type = 'price', 'sentiment' 
// Qwarg Format
// qwargData = {"date":, "height":, "radius":, "title":}

function Graph(){
    // date range would require scaling the dateSet
    this.startDate;
    this.endDate;
    this.highPrice;
    this.padding = 50;
    // Set the below with a method so they can adjust
    this.graphHeight = parseInt($("#graph").css("height"));
    this.graphWidth = parseInt($("#graph").css("width"));
    this.priceScale;
    this.dateScale;
    this.qwargSet = {};
}
Graph.prototype.setDateScale = function(){
    // adds date padding
    // THERE SHOULD BE A FUNCTION TO RESET THE STARTDATE AND ENDDATE
    // IF THE X SCALE CHANGES REDRAW THE GRAPH
    this.startDate.setDate(this.startDate.getDate()-1);
    this.endDate.setDate(this.endDate.getDate()+1);
    this.dateScale = d3.time.scale()
    this.dateScale.domain([this.startDate, this.endDate]);
    this.dateScale.range([this.padding, this.graphWidth-this.padding]);
}
Graph.prototype.setPriceScale = function(qwarg){
    // the range should be set after calling this function
    // IF THE Y SCALE CHANGES REDRAW THE GRAPH
    var high = d3.max(qwarg.qwargData, function(d){return (parseFloat(d.height) * 1.2)});
    if (!this.priceScale){
        this.highPrice = high;
        this.priceScale = d3.scale.linear();
        this.priceScale.range([this.graphHeight - this.padding, this.padding]);
        this.priceScale.domain([0 ,high]);
        return true;
    }
    else{
        if (high > this.highPrice){
            this.priceScale.domain([0, high]);
            this.highPrice = high;
            return true;
        }
        return false;
    }
}
Graph.prototype.sentimentScale = function(){
    return d3.scale.linear().domain([-1,1]);
}
Graph.prototype.drawXAxis = function(translateString){
    var xAxis = d3.svg.axis();
    xAxis.scale(this.dateScale).orient("bottom");

    d3.select("svg").append("g")
    .attr("class", "axis")
    .attr("transform", translateString)
    .call(xAxis)
    .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(){
            return "rotate(-65)";
        });
}
Graph.prototype.drawYAxis = function(currentScale,translateString){
    // if you tag the axis you can delete it
    var yAxis = d3.svg.axis();
    yAxis.scale(currentScale).orient("left");

    d3.select("svg").append("g")
        .attr("class", "axis")
        .attr("transform", translateString)
        .call(yAxis);
}
Graph.prototype.createSvg = function(){
    $("#graph").empty();

    d3.select("#graph")
        .append("svg")
        .attr("width",this.graphWidth)
        .attr("height",this.graphHeight);

    return d3.select("svg");
}
Graph.prototype.draw = function(){
    // set Scales before plotting
    for (q in this.qwargSet){
        if (this.qwargSet[q].qwargType == "price"){
            this.setPriceScale(this.qwargSet[q]);
        } 
    }
    this.setDateScale();
    for (q in this.qwargSet){
        this.plot(this.qwargSet[q]);
    }
    $("circle").tooltips();
}
Graph.prototype.clear =function(setString){
    $(".tooltip").remove();
    $(setString).remove();
    $("circle").tooltips();
}
Graph.prototype.plot = function(qwarg){
    // Determine the conditions underwhich one would have to 
    // redraw the graph
    $(".tooltip").remove();
    var translate,
    yScale,
    xScale = this.dateScale,
    checkDate = this.checkDate,
    svg = d3.select("svg");

    if (!svg[0][0]){
        svg = this.createSvg();
        // Drawing the xAxis here prevents duplication
        this.drawXAxis("translate(0," + (this.graphHeight - this.padding) +")");
    }
    if (qwarg.qwargType == "price"){
        yScale = this.priceScale;
        translate = "translate(" + this.padding +",0)";
    }
    else if (qwarg.qwargType == "sentiment"){
        yScale = this.sentimentScale();
        translate = "translate(" + (this.graphWidth-this.padding) +",0)";
    }
    else{
        throw "Missing Qwarg Type";
    }
    
    this.drawYAxis(yScale, translate);

    var radiusHigh = d3.max(qwarg.qwargData,function(d){return parseFloat(d.radius)});
    var radiusLow = d3.min(qwarg.qwargData,function(d){return parseFloat(d.radius)});
    var radiusScale = d3.scale.linear();
    radiusScale.domain([radiusLow,radiusHigh]);
    radiusScale.range(qwarg.radiusRange);

    var start = this.startDate, 
    end = this.endDate;

    svg.selectAll("circle" + qwarg.qwargClassString)
        .data(qwarg.qwargData)
        .enter()
        .append("circle")
        .attr("class", qwarg.qwargClassString)
        .attr("cx", function(d){
            return xScale(qwarg.qwargParseDate(d.date));
        }).attr("cy", function(d){
            return yScale(parseFloat(d.height));
        }).attr("r", function(d){
            return radiusScale(d.radius);
        }).attr("title", function(d){
            return d.title;
        }).style("fill", qwarg.fill)
        .style("display", function(d){
            date = qwarg.qwargParseDate(d.date);
            start.valueOf();
            if ((date > start) && (date < end)){
                return "initial";
            }
            else{
                return "none";
            }
        });
    // Put tooltips somewhere else
}
$(document).ready(function(){
    var endDate = new Date();
    var graph = new Graph();
    $("#graph").on("drawGraph", function(event, startDate, qwarg){
        for (q in graph.qwargSet){
            graph.clear(graph.qwargSet[q].qwargClassString)
        }
        graph.clear(".AAPL");
        graph.endDate = endDate;
        graph.startDate = startDate;
        graph.qwargSet[qwarg.qwargClassString] = qwarg;
        graph.draw();
    });
});