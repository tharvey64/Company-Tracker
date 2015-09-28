MyApplication.models = MyApplication.models || {};
(function(){
    var myapp = this;
    myapp.Scale = function Scale(settings){
        // type = "time"/"scale",subType="scale"/"linear"
        this.type = settings.type;
        this.subType = settings.subType;
        // change max min to domain = [min,max]
        this.domain = settings.domain;
        this.range = settings.range;
        // Remove Context
        this.context = settings.context;

    };
    myapp.Scale.prototype.inScale = function(value){
        return (value > this.domain[0]) && (value < this.domain[1]);
    };
    myapp.Scale.prototype.setDomain = function(domain, undefined){
        if (domain === undefined && this.domain === undefined){
            return false
        }
        else if (domain === undefined && this.domain){
            return true
        }

        if (this.type === "time"){
            // console.log(domain);
            domain[0].setHours(8);
            domain[1].setHours(18);
        }
        else if (this.type === "scale"){
            domain[0] = parseFloat(domain[0] * 0.95);
            domain[1] = parseFloat(domain[1] * 1.05);
        }
        else{
            return false;
        }
        this.domain = domain;
        return true;
    };
    myapp.Scale.prototype.getRange = function(settings){
        var paddingKey = settings.paddingKey || "padding";
        var axisKey = settings.axisKey;
        var temp = [this.context.display[paddingKey], this.context.display[axisKey]-this.context.display[paddingKey]];
        return [temp[this.range[0]], temp[this.range[1]]]
    };
    myapp.Scale.prototype.getScale = function(settings){
        var currentRange = this.getRange(settings);
        return d3[this.type][this.subType]().range(currentRange).domain(this.domain);
    };

    myapp.Graph = function Graph(settings){
        // Page Settings
        this.display = {
            'container': settings.container,
            'padding': settings.padding || 70,
            'height': settings.containerHeight,
            'width': settings.containerWidth
        };
        // Date Scale
        var dateSettings = {'context':this, 'type':'time', 'subType':'scale','range':[0,1]};
        this.dateScale = new myapp.Scale(dateSettings);
        // Price Scale
        var priceSettings = {'context':this, 'type':'scale', 'subType':'linear', 'range':[1,0]};
        this.priceScale = new myapp.Scale(priceSettings);
        // Data 
        this.dataInterface = MyApplication.models.Interface() || {};
    }
    myapp.Graph.prototype.sentimentScale = function(){
        // Move this to init and make it an instance of the scale class
        return d3.scale.linear().domain([-1,1]).range([this.display['height'] - this.display['padding'], this.display['padding']]);
    }
    myapp.Graph.prototype.drawXAxis = function(translateString){
        // Make Sure These are Drawn Once And Only Once
        var xAxis = d3.svg.axis();
        xAxis.scale(this.dateScale.getScale({'axisKey':'width'})).orient("bottom");

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
    myapp.Graph.prototype.draw = function(resize, dateRange){
        var price, sentiment;
        this.createSvg();
        // New Code
        var groups = this.dataInterface.allGroups();
        for (var name in groups){ 
            if (name === "price"){
                price = true;
                var domain = groups[name].getCollectionRange('height');
                this.priceScale.setDomain(domain);
                // console.log(this.priceScale);
            }
            else if (name === "sentiment"){
                sentiment = true;
            }
        };
        // Draw y-Axis
        if (sentiment) this.drawYAxis(this.sentimentScale(), "translate(" + (this.display['width']-this.display['padding']) + ",0)");
        
        if (price) this.drawYAxis(this.priceScale.getScale({'axisKey':'height'}), "translate(" + this.display['padding'] +",0)");
        // Sets Domain Values For dateScale
        this.dateScale.setDomain(dateRange);
        // Draw x-Axis
        this.drawXAxis("translate(0," + (this.display['height'] - this.display['padding']) +")");
        // Plotting Data
        // New Code
        for (var name in groups){
            if (name === "price"){
                var current = groups[name];
                for(var idx = current.collection.length; idx--;){
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
        // clear
        var xScale = this.dateScale.getScale({'axisKey':'width'});
        var dateFormat = d3.time.format(qwarg.parseDate);
        var checkDate = this.dateScale.inScale;
        var svg = d3.select("svg");
        // Not Sure If The Below Expression Does Anything
        if (!svg[0][0]) throw "No SVG";
        if (qwarg.type == "price"){
            yScale = this.priceScale.getScale({'axisKey':'height'});
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
                return xScale(dateFormat(d.date));
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
                if (checkDate(dateFormat(d.date))){
                    return "initial";
                }
                else{
                    return "none";
                }
            });
    }
    myapp.Graph.prototype.plotPrices = function(qwarg){
        // Clear
        var yScale = this.priceScale.getScale({'axisKey':'height'});
        // ???? Don't Need This
        // var rScale = qwarg.radiusScale();
        // Clear
        var xScale = this.dateScale.getScale({'axisKey':'width'});
        // Clear
        var checkDate = this.dateScale.inScale;
        var dateFormat = d3.time.format(qwarg.parseDate);
        var svg = d3.select("svg");

        var line = d3.svg.line()
            .interpolate("linear")
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
}).apply(MyApplication.models);