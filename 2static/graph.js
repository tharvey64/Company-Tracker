// function Qwarg(options){
//     // tag for tweets should be the query
//     // "default" type is not supported
//     this.type = options.type || "default";
//     this.data = options.data;
//     this.tag = options.tag;
//     this.parseDate = options.praseDate || d3.time.format("%Y-%m-%d %X").parse;
//     // Check hasOwnProperty for show 
//     this.show = options.show || false;
//     this.fill = options.fill || "black";
//     this.radiusRange = options.radiusRange || [5,5];
//     this.radiusScale = function(){
//         var scale = d3.scale.linear();
//         if (!this.radiusRange ||  !(this.radiusRange instanceof Array) || (this.radiusRange.length != 2)){
//             throw "Invalid value for radiusRange. Must Be [min,max]"
//         }
//         else if (this.radiusRange[0] == this.radiusRange[1]){
//             scale.range(this.radiusRange);
//             return scale;
//         }
//         // Need this in Collections
//         var radiusHigh = d3.max(this.data, function(d){return parseFloat(d.radius);});
//         var radiusLow = d3.min(this.data, function(d){return parseFloat(d.radius);});
//         scale.domain([radiusLow,radiusHigh]);
//         scale.range(this.radiusRange);
//         return scale;
//     }
// }

(function(){
    var myapp = this;
    myapp.Graph = function Graph(settings){
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
                // make sure context is not a copy
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
                    // Domain values will come from the Qwargset
                    'setDomain': function(domain){
                            // var max, min;
                            // min = parseFloat(domain[0]*0.95);
                            // max = parseFloat(domain[1]*1.05);
                            // // max = d3.max(qwarg.data, function(d){return (parseFloat(d.height*1.05))});
                            // // min = d3.min(qwarg.data, function(d){return (parseFloat(d.height*0.95))});
                            // this.high = (max > this.high || !Number(this.high) ? max:this.high);
                            // this.low = (min < this.low || !Number(this.low) ? min:this.low); 
                            this.low = parseFloat(domain[0] * 0.95);
                            this.high = parseFloat(domain[1] * 1.05);
                        },
                    'setRange': function(top){
                            this.range = [context.display['height']-context.display['padding'],top];
                        },
                    'get': function(settings){
                            var top = settings['topPadding'] || 10;
                            this.setRange(top);
                            // if (!settings['resize']) this.setDomain(settings['qwarg']);
                            return d3.scale.linear().domain([this.low,this.high]).range(this.range)
                        }
                };
            })(this);
        // Data 
        this.dataInterfaceTest = MyApplication["MyInterface"]() || {};
    }
    myapp.Graph.prototype.sentimentScale = function(){
        return d3.scale.linear().domain([-1,1]).range([this.display['height'] - this.display['padding'], this.display['padding']]);
    }
    myapp.Graph.prototype.drawXAxis = function(translateString){
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
    myapp.Graph.prototype.drawYAxis = function(currentScale,translateString){
        var yAxis = d3.svg.axis();
        yAxis.scale(currentScale).orient("left");

        d3.select("svg").append("g")
            .attr("class", "axis")
            .attr("transform", translateString)
            .call(yAxis);
    }
    myapp.Graph.prototype.createSvg = function(){
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
    myapp.Graph.prototype.draw = function(resize, start, end){
        var price, sentiment;
        this.createSvg();
        // New Code
        var groups = this.dataInterfaceTest.allSets();
        for (var name in groups){ 
            if (name === "price"){
                price = true;
                var domain = groups[name].getCollectionRange('height');
                this.priceScale['setDomain'](domain);
                console.log(domain);
            }
            else if (name === "sentiment"){
                sentiment = true;
            }
        };
        // Draw y-Axis
        if (sentiment) this.drawYAxis(this.sentimentScale(), "translate(" + (this.display['width']-this.display['padding']) + ",0)");
        if (price) this.drawYAxis(this.priceScale['get']({}), "translate(" + this.display['padding'] +",0)");
        // Sets Domain Values For dateScale
        this.dateScale['setDomain'](start, end);
        // Draw x-Axis
        this.drawXAxis("translate(0," + (this.display['height'] - this.display['padding']) +")");
        // Plotting Data
        // New Code
        for (var name in groups){
            if (name === "price"){
                var current = groups[name];
                for(var idx = current.collection.length; idx--;){
                    // console.log(current.collection[idx]);
                    if (!current.collection[idx].show) continue;
                    this.plotPrices(current.collection[idx]);  
                }
            }
            // Inactive
            // else if (name === "sentiment"){
            //     this.plotTweets(something here);
            // }
        };
    }
    myapp.Graph.prototype.plotTweets = function(qwarg){
        $(".tooltip").remove();
        var yScale;
        // radius scale not added
        var rScale = qwarg.radiusScale();
        var xScale = this.dateScale['get']();
        var checkDate = this.dateScale['checkDate'];
        var svg = d3.select("svg");
        // Not Sure If The Below Expression Does Anything
        if (!svg[0][0]) throw "No SVG";
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
    myapp.Graph.prototype.plotPrices = function(qwarg){
        // Clear
        var yScale = this.priceScale['get']({});
        // ???? Don't Need This
        // var rScale = qwarg.radiusScale();
        // Clear
        var xScale = this.dateScale['get']();
        // Clear
        var checkDate = this.dateScale['checkDate'];
        var dateFormat = d3.time.format(qwarg.parseDate);
        var svg = d3.select("svg");



        var line = d3.svg.line()
            .interpolate("monotone")
            .x(function(d){return xScale(dateFormat.parse(d.date));})
            .y(function(d){return yScale(parseFloat(d.height));});

        var path = svg.append("path")
            .attr("d", line(qwarg.data))
            .attr("stroke", qwarg.fill)
            .attr("stroke-width", "2")
            .attr("fill", "none");
        var totalLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
                .duration(0)
                .ease("linear")
                .attr("stroke-dashoffset", 0);
    }
    myapp.Graph.prototype.clear = function(setString){
        // This does not do anything to the Path
        // $(".tooltip").remove();
        $(setString).remove();
        // $("circle").tooltips();
    }
}).apply(MyApplication);