function Qwarg(qwargType, qwargData, qwargClassString){
    this.qwargType = qwargType;
    this.qwargData = qwargData;
    this.qwargClassString = qwargClassString;
    this.qwargParseDate;
    this.show;
    this.fill;
    this.radiusRange;
    this.radiusScale = function(){
        var scale = d3.scale.linear();
        if (!this.radiusRange ||  !(this.radiusRange instanceof Array) || (this.radiusRange.length != 2)){
            console.log(this.radiusRange);
            throw "Invalid value for radiusRange. Must Be [min,max]"
        }
        else if (this.radiusRange[0] == this.radiusRange[1]){
            scale.range(this.radiusRange);
            return scale;
        }
        var radiusHigh = d3.max(this.qwargData,function(d){return parseFloat(d.radius);});
        var radiusLow = d3.min(this.qwargData,function(d){return parseFloat(d.radius);});
        scale.domain([radiusLow,radiusHigh]);
        scale.range(this.radiusRange);
        return scale;
    }
}

function Graph(){
    this.startDate;
    this.endDate;
    this.highPrice = 0;
    this.padding = 50;
    this.graphHeight = parseInt($("#graph").css("height"));
    this.graphWidth = parseInt($("#graph").css("width"));
    this.priceScale;
    this.dateScale;
    this.qwargSet = {};
}
Graph.prototype.sentimentScale = function(){
    return d3.scale.linear().domain([-1,1]).range([this.graphHeight - this.padding, this.padding]);
}
Graph.prototype.setDateScale = function(){
    this.startDate.setDate(this.startDate.getDate()-1);
    this.endDate.setDate(this.endDate.getDate()+1);
    this.dateScale = d3.time.scale()
    this.dateScale.domain([this.startDate, this.endDate]);
    this.dateScale.range([this.padding, this.graphWidth-this.padding]);
}
Graph.prototype.setPriceScale = function(qwarg){
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
Graph.prototype.drawXAxis = function(translateString){
    // Make Sure These are Drawn Once And Only Once
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
    // Make Sure These are Drawn Once And Only Once
    var yAxis = d3.svg.axis();
    yAxis.scale(currentScale).orient("left");

    d3.select("svg").append("g")
        .attr("class", "axis")
        .attr("transform", translateString)
        .call(yAxis);
}
Graph.prototype.createSvg = function(){
    $("#graph").empty();
    $(".tooltip").remove();
    this.graphHeight = parseInt($("#graph").css("height"));
    this.graphWidth = parseInt($("#graph").css("width"));

    d3.select("#graph")
        .append("svg")
        .attr("width",this.graphWidth)
        .attr("height",this.graphHeight);

    return d3.select("svg");
}
Graph.prototype.draw = function(){
    this.createSvg();
    var price = false, 
    sentiment = false;
    // Setting Scales
    for (q in this.qwargSet){
        if (this.qwargSet[q].qwargType == "price"){
            this.setPriceScale(this.qwargSet[q]);
            price = true;
        }
        else if (this.qwargSet[q].qwargType == "sentiment"){
            sentiment = true;
        }
    }
    this.setDateScale();
    // Drawing Axis
    if (sentiment){
        this.drawYAxis(this.sentimentScale(), "translate(" + (this.graphWidth-this.padding) +",0)");
    }
    if (price){
        this.drawYAxis(this.priceScale, "translate(" + this.padding +",0)");
    }
    this.drawXAxis("translate(0," + (this.graphHeight - this.padding) +")");
    // Plotting Data
    for (q in this.qwargSet){
        this.plot(this.qwargSet[q]);
    }
    $("circle").tooltips();
}
Graph.prototype.plot = function(qwarg){
    $(".tooltip").remove();
    
    var start = this.startDate, 
    end = this.endDate,
    yScale,
    rScale = qwarg.radiusScale(),
    xScale = this.dateScale,
    checkDate = this.checkDate,
    svg = d3.select("svg");

    if (!svg[0][0]){
        throw "No SVG";
    }
    if (qwarg.qwargType == "price"){
        yScale = this.priceScale;
    }
    else if (qwarg.qwargType == "sentiment"){
        yScale = this.sentimentScale();
    }
    else{
        return "Missing Qwarg Type";
    }
    
    svg.selectAll("circle" + (qwarg.qwargClassString ? "." + qwarg.qwargClassString:""))
        .data(qwarg.qwargData)
        .enter()
        .append("circle")
        .attr("class", qwarg.qwargClassString)
        .attr("cx", function(d){
            return xScale(qwarg.qwargParseDate(d.date));
        })
        .attr("cy", function(d){
            return yScale(parseFloat(d.height));
        })
        .attr("r", function(d){
            return rScale(d.radius);
        })
        .attr("title", function(d){
            return d.title;
        })
        .style("fill", qwarg.fill)
        .style("display", function(d){
            date = qwarg.qwargParseDate(d.date);
            if ((date > start) && (date < end)){
                return "initial";
            }
            else{
                return "none";
            }
        });
}
Graph.prototype.clear = function(setString){
    $(".tooltip").remove();
    $(setString).remove();
    $("circle").tooltips();
}
// All Date Adjustments Must Query the DB For All Stocks Selected
// Construct Another table for Index Info

$(document).ready(function(){
    var endDate = new Date(),
    graph = new Graph(),
    stockQwarg;
    $("#graph").on("drawGraph", function(event, startDate, qwarg){
        if (stockQwarg && qwarg.qwargType == "price"){
            delete graph.qwargSet[stockQwarg]
            graph.highPrice = 0; 
        }
        if(qwarg.qwargType == "price"){
            stockQwarg = qwarg.qwargClassString;
        }
        graph.endDate = endDate;
        graph.startDate = startDate;
        graph.qwargSet[qwarg.qwargClassString] = qwarg;
        graph.draw();
    });
    $("#fillSelector").on("submit", "#color-form",function(event){
        event.preventDefault();
        var color = $('#colorSelection').val()
        $("."+ stockQwarg).css('fill', color);
    });
    $('#footer').on("click", '#colorTweetBut', function(event){
        event.preventDefault();
        var color = $('#colorTweetSelection').val()
        $('.tweet').css('fill', color);
    });
});