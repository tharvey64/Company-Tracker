// NOW how to create this
function Qwarg(qwargType, qwargData, qwargClassString){
    this.qwargType = qwargType;
    this.qwargData = qwargData;
    this.qwargClassString = qwargClassString;
    this.qwargParseDate;
    this.show;
    
    this.fill;
    // this.yScale;
    this.radiusRange;
}
// Make Functions That perform select alls on the element
// Qwarg Type = 'price', 'sentiment' 
// Qwarg Format
// qwargData = {"date":, "height":, "radius":, "title":}

function Graph(startDate, endDate){
    // date range would require scaling the dateSet
    this.startDate = startDate;
    this.endDate = endDate;
    this.highPrice;
    this.padding = 50;
    // Set the below with a method so they can adjust
    this.graphHeight = parseInt($("#graph").css("height"));
    this.graphWidth = parseInt($("#graph").css("width"));
    this.yScale;
    this.xScale;
    this.qwargSet = {};
}
Graph.prototype.setDateScale = function(){
    // adds date padding
    // THERE SHOULD BE A FUNCTION TO RESET THE STARTDATE AND ENDDATE
    // IF THE X SCALE CHANGES REDRAW THE GRAPH
    this.startDate.setDate(this.startDate.getDate()-1);
    this.endDate.setDate(this.endDate.getDate()+1);
    this.xScale = d3.time.scale().domain([this.startDate, this.endDate]);
    this.xScale.range([this.padding, this.graphWidth-this.padding]);
}
Graph.prototype.setPriceScale = function(high){
    // the range should be set after calling this function
    // IF THE Y SCALE CHANGES REDRAW THE GRAPH
    if (!this.yScale){
        this.highPrice = high;
        this.yScale = d3.scale.linear();
        this.yScale.range([this.graphHeight - this.padding, this.padding]);
        this.yScale.domain([0 ,high]);
        return true;
    }
    else{
        if (high > this.highPrice){
            this.yScale.domain([0, high]);
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
    xAxis.scale(this.xScale).orient("bottom");

    d3.select("svg").append("g")
    .attr("class", "axis")
    .attr("transform", translateString)
    .call(axis)
    .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(){
            return "rotate(-65)";
        });
}
Graph.prototype.drawYAxis = function(translateString){
    // if you tag the axis you can delete it
    var yAxis = d3.svg.axis();
    yAxis.scale(this.yScale).orient("left");

    d3.select("svg").append("g")
        .attr("class", "axis")
        .attr("transform", translateString)
        .call(axis);
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
    for (q in this.qwargSet){
        this.plot(this.qwargSet[q]);
    }
}
Graph.prototype.plot = function(qwarg){
    // Determine the conditions underwhich one would have to 
    // redraw the graph
    $("body").remove(".tooltip");

    var translate,
    var svg = d3.select("svg");

    if (!svg[0][0]){
        svg = this.createSvg();
    }
    if (qwarg.qwargType == "price"){
        // var low = d3.min(qwarg.qwargData,function(d){return  (parseFloat(d[1]) * 0.8)});
        var high = d3.max(qwarg.qwargData, function(d){return (parseFloat(d.height) * 1.2)});
        this.setPriceScale(high);
        translate = "translate(" + this.padding +",0)";
    }
    else if (qwarg.qwargType == "sentiment"){
        this.yScale = this.sentimentScale();
        translate = "translate(" + (this.graphWidth-this.padding) +",0)";
    }
    else{
        throw "Missing Qwarg Type";
    }
    
    this.setDateScale();

    this.drawYAxis(translate);
    this.drawXAxis("translate(0," + (this.graphHeight - this.padding) +")");

    var radiusHigh = d3.max(qwarg.qwargData,function(d){return parseFloat(d.radius)});
    var radiusLow = d3.min(qwarg.qwargData,function(d){return parseFloat(d.radius)});
    var radiusScale = d3.scale.linear();
    radiusScale.range(qwarg.radiusRange).domain([radiusLow,radiusHigh]);
    
    // qwarg.qwargClassString must start with a period
    svg.selectAll("circle" + qwarg.qwargClassString)
        .data(qwarg.qwargData)
        .enter()
        .append("circle")
        .attr("class", qwarg.qwargClassString)
        .attr("cx", function(d){
            return this.xScale(qwarg.qwargParseDate(d.date));
        }).attr("cy", function(d){
            return this.yScale(parseFloat(d.height));
        }).attr("r", function(d){
            return radiusScale(d.radius);
        }).attr("title", function(d){
            return d.title;
        });
        // .style("display", function(d){
        //     date = qwarg.qwargParseDate(d.date);
        //     if (date < this.startDate || date > this.endDate){
        //         return "none";
        //     }
        //     else{
        //         return "initial";
        //     }
        // });
    // Put tooltips somewhere else
    $("circle").tooltips();
}
$(document).ready(function(){
    var graph;
    $("body").on("submit", ".company-list form, #stockForm", function(event){
        var endDate = new Date()
        $("#input[name='start date']").val()
        graph = new Graph(, endDate)

    });
});