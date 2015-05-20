function Qwarg(qwargType, qwargData, classString){
    this.qwargType = qwargType;
    this.qwargData = qwargData;
    this.classString = classString;
    this.parseDate;
    this.fill;
    // this.yScale;
    // this.radiusRange;
        // radiusScale.range(radiusRange)
        // .domain([radiusLow,radiusHigh]);
}
// Qwarg Type = 'price', 'sentiment' 
// Qwarg Format
// qwargData = {"date":, "heightValue":, "radiusValue":, "titleValue":}

function Graph(startDate, endDate){
    this.startDate = startDate;
    this.endDate = endDate;
    this.highPrice;
    this.yScale;
    // Duplicates?
    // this.xScale;
    this.dateScale;
    this.qwargSet = {};
}
Graph.prototype.setDateScale = function(){
    // adds date padding
    // currently you would have to call this to set the 
    // the dateScale after setting the startDate and endDate
    this.startDate.setDate(this.startDate.getDate()-1);
    this.endDate.setDate(this.endDate.getDate()+1);
    var scale = d3.time.scale().domain([this.startDate, this.endDate]);
    this.dateScale = scale;
}
Graph.prototype.setPriceScale = function(high){
    // the range should be set after calling this function
    if (!this.yScale){
        this.highPrice = high;
        this.yScale = d3.scale.linear();
        this.yScale.domain([0 ,high]);
    }
    else{
        if (high > this.highPrice){
            this.yScale.domain([0, high])
            this.highPrice = high
        }
    }
}
Graph.prototype.sentimentScale = function(){
    return d3.scale.linear().domain([-1,1]);
}
Graph.prototype.drawXAxis = function(){
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
}
Graph.prototype.drawYAxis = function(translateString){
    // if you tag the axis you can delete it
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", translateString)
        .call(yAxis);
}

Graph.prototype.drawGraph = function(qwarg){
    // Determine the conditions underwhich one would have to 
    // redraw the graph
    $("body").remove(".tooltip");
    var h = parseInt($("#graph").css("height"));
    var w = parseInt($("#graph").css("width"));
    if (newGraph){
        createSvg(h,w);
    }
    var translate;
    if (qwarg.qwargType == 'price'){
        // var low = d3.min(dataset,function(d){return  (parseFloat(d[1]) * 0.8)});
        var high = d3.max(dataset,function(d){return (parseFloat(d[1]) * 1.2)});
        this.yScale = this.setPriceScale(high)
        translate = "translate(" + padding +",0)";
    }
    else if (qwarg.qwargType == 'sentiment'){
        this.yScale = this.sentimentScale()
        translate = "translate(" + (w-padding) +",0)";
    }
    else{
        throw "Missing Qwarg Type";
    }

    var padding = 50;
    var svg = d3.select("svg");
    
    this.yScale.range([h - padding, padding]);
    

    var yAxis = d3.svg.axis();
    yAxis.scale(this.yScale).orient("left");

    this.setDateScale()
    this.xScale = this.dateScale
    this.xScale = d3.time.scale().range([padding, w-padding]);

    var radiusHigh = d3.max(dataset,function(d){return parseFloat(d[2])});
    var radiusLow = d3.min(dataset,function(d){return parseFloat(d[2])});
    var radiusScale = d3.scale.linear()
    radiusScale.range(qwarg.radiusRange)


    var xAxis = d3.svg.axis();
    xAxis.scale(this.xScale).orient("bottom");
    
    svg.selectAll("circle" + qwarg.classString)
        .data(dataset)
        .enter()
        .append("circle")
        .attr("class", qwarg.classString)
        .attr("cx", function(d){
            return this.xScale(qwarg.parseDate(d["date"]));
        })
        .attr("cy", function(d){
            return this.yScale(parseFloat(d["height"]));
        }).attr("r", function(d){
            return radiusScale(d["radius"]);
        }).attr("title", function(d){
            return d["title"];
        });
    
    this.drawYAxis(translate);

    // Put tooltips somewhere else
    $("circle").tooltips();
}