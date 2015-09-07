function Qwarg(options){
    // tag for tweets should be the query
    // "default" type is not supported
    this.type = options.type || "default";
    this.data = options.data;
    this.tag = options.tag;
    this.parseDate = options.praseDate || d3.time.format("%Y-%m-%d %X").parse;
    // Check hasOwnProperty for show 
    this.show = options.show || false;
    this.fill = options.fill || "black";
    this.radiusRange = options.radiusRange || [5,5];
    this.radiusScale = function(){
        var scale = d3.scale.linear();
        if (!this.radiusRange ||  !(this.radiusRange instanceof Array) || (this.radiusRange.length != 2)){
            throw "Invalid value for radiusRange. Must Be [min,max]"
        }
        else if (this.radiusRange[0] == this.radiusRange[1]){
            scale.range(this.radiusRange);
            return scale;
        }
        var radiusHigh = d3.max(this.data,function(d){return parseFloat(d.radius);});
        var radiusLow = d3.min(this.data,function(d){return parseFloat(d.radius);});
        scale.domain([radiusLow,radiusHigh]);
        scale.range(this.radiusRange);
        return scale;
    }
}

function Graph(settings){
    // Page Settings
    this.display = {
        'container': settings.container,
        'padding': settings.padding || 70,
        'height': settings.containerHeight,
        'width': settings.containerWidth
    };
    // Date Scale
    this.dateScale = (function(context, settings){
            var range, start, end;
            return {
                'checkDate': function(date){
                        return (date > this.start) && (date < this.end)
                    },
                'setDomain': function(start, end){
                        this.start = start || settings['startDate'] || new Date();
                        this.end = end || settings['endDate'] || new Date();
                        this.start.setHours(9);
                        this.end.setHours(4);
                    },
                'setRange': function(){
                        this.range = [context.display['padding'], context.display['width']-context.display['padding']];
                    },
                'get': function(){
                        this.setRange();
                        return d3.time.scale().domain([this.start,this.end]).range(this.range);
                    }
            };
        })(this, settings);
    // Price Scale
    this.priceScale = (function(context){
            var high, low, range;
            return {
                'setDomain': function(qwarg){
                        var max, min;
                        max = d3.max(qwarg.data, function(d){return (parseFloat(d.height*1.05))});
                        min = d3.min(qwarg.data, function(d){return (parseFloat(d.height*0.95))});
                        this.high = (max > this.high || !Number(this.high) ? max:this.high);
                        this.low = (min < this.low || !Number(this.low) ? min:this.low); 
                    },
                'setRange': function(top){
                        this.range = [context.display['height']-context.display['padding'],top];
                    },
                'get': function(settings){
                        var top = settings['topPadding'] || 10;
                        this.setRange(top);
                        // if (!settins['resize']) this.setDomain(settings['qwarg']);
                        return d3.scale.linear().domain([this.low,this.high]).range(this.range)
                    }
            };
        })(this);
    // Data
    this.qwargSet = settings.qwargSet || {};
}
Graph.prototype.sentimentScale = function(){
    return d3.scale.linear().domain([-1,1]).range([this.display['height'] - this.display['padding'], this.display['padding']]);
}
Graph.prototype.drawXAxis = function(translateString){
    // Make Sure These are Drawn Once And Only Once
    var xAxis = d3.svg.axis();
    xAxis.scale(this.dateScale['get']()).orient("bottom");

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
    var yAxis = d3.svg.axis();
    yAxis.scale(currentScale).orient("left");

    d3.select("svg").append("g")
        .attr("class", "axis")
        .attr("transform", translateString)
        .call(yAxis);
}
Graph.prototype.createSvg = function(){
    $(this.display['container']).empty();
    // $(".tooltip").remove();
    this.display['height'] = parseInt($(this.display['container']).css("height"));
    this.display['width'] = parseInt($(this.display['container']).css("width"));

    d3.select(this.display['container'])
        .append("svg")
        .attr("width",this.display['width'])
        .attr("height",this.display['height']);

    return d3.select("svg");
}
Graph.prototype.draw = function(resize){
    var price, sentiment;
    this.createSvg();
    // Setting Scales
    for (q in this.qwargSet){
        if (this.qwargSet[q].type == "price"){
            this.priceScale['setDomain'](this.qwargSet[q]);
            price = true;
        }
        else if (this.qwargSet[q].type == "sentiment"){
            sentiment = true;
        }
    };
    // Draw y-Axis
    if (sentiment) this.drawYAxis(this.sentimentScale(), "translate(" + (this.display['width']-this.display['padding']) + ",0)");
    if (price) this.drawYAxis(this.priceScale['get']({}), "translate(" + this.display['padding'] +",0)");
    // Sets Domain Values For dateScale
    this.dateScale['setDomain']();
    // Draw x-Axis
    this.drawXAxis("translate(0," + (this.display['height'] - this.display['padding']) +")");
    // Plotting Data
    for (q in this.qwargSet){
        if (this.qwargSet[q].type == "price"){
            this.plotPrices(this.qwargSet[q]);
        }
        else if (this.qwargSet[q].type == "sentiment"){
            this.plotTweets(this.qwargSet[q]);
        }
    };
}
Graph.prototype.plotTweets = function(qwarg){
    $(".tooltip").remove();
    var yScale;
    var rScale = qwarg.radiusScale();
    var xScale = this.dateScale['get']();
    var checkDate = this.dateScale['checkDate'];
    var svg = d3.select("svg");
    // Not Sure If The Below Expression Does Anything
    if (!svg[0][0]){
        throw "No SVG";
    }
    if (qwarg.type == "price"){
        yScale = this.priceScale;
    }
    else if (qwarg.type == "sentiment"){
        yScale = this.sentimentScale();
    }
    else{
        return "Missing Qwarg Type";
    };
    
    svg.selectAll("circle" + (qwarg.tag ? "." + qwarg.tag:""))
        .data(qwarg.data)
        .enter()
        .append("circle")
        .attr("class", qwarg.tag)
        .attr("cx", function(d){
            return xScale(qwarg.parseDate(d.date));
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
            if (checkDate(qwarg.parseDate(d.date))){
                return "initial";
            }
            else{
                return "none";
            }
        });
}
Graph.prototype.plotPrices = function(qwarg){
    var yScale = this.priceScale['get']({});
    var rScale = qwarg.radiusScale();
    var xScale = this.dateScale['get']();
    var checkDate = this.dateScale['checkDate'];
    var svg = d3.select("svg");

    var line = d3.svg.line()
        .interpolate("monotone")
        .x(function(d){return xScale(qwarg.parseDate(d.date));})
        .y(function(d){return yScale(parseFloat(d.height));});

    var path = svg.append("path")
        .attr("d", line(qwarg.data))
        .attr("stroke", qwarg.fill)
        .attr("stroke-width", "2")
        .attr("fill", "none");
    var totalLength = path.node().getTotalLength();
    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
            .duration(0)
            .ease("linear")
            .attr("stroke-dashoffset", 0);
}
Graph.prototype.clear = function(setString){
    // This does not do anything to the Path
    // $(".tooltip").remove();
    $(setString).remove();
    // $("circle").tooltips();
}