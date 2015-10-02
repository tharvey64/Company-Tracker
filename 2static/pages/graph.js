// Is This The Model or the Presentor
MyApplication.presenter = MyApplication.presenter || {};

(function(temp1){
    // Move sentiment scale increments to right side
    // Consider Not Exposing This To The Rest Of The App
    temp1.Scale = function Scale(settings){
        // type = "time"/"scale",subType="scale"/"linear"
        this.type = settings.type;
        this.subType = settings.subType;
        // change max min to domain = [min,max]
        this.domain = settings.domain;
        this.range = settings.range;
        // Remove Context
        this.context = settings.context;
    };
    temp1.Scale.prototype.inScale = function(value){
        return (value > this.domain[0]) && (value < this.domain[1]);
    };
    temp1.Scale.prototype.setDomain = function(domain, undefined){
        if (domain === undefined && this.domain === undefined){
            return false
        }
        else if (domain === undefined && this.domain){
            return true
        }

        if (this.type === "time"){
            domain[0].setHours(9);
            // domain[1].setHours(17);
            // Do This Somewhere Else
            domain[1] = new Date();
            domain[1].setHours(domain[1].getHours()+1);
        }
        else if (this.type === "scale"){
            var cushion = (domain[1] - domain[0]) * 0.1;
            domain[0] = parseFloat(domain[0] - cushion);
            domain[1] = parseFloat(domain[1] + cushion);
        }
        else{
            return false;
        }
        this.domain = domain;
        return true;
    };
    temp1.Scale.prototype.getRange = function(settings){
        var paddingKey = settings.paddingKey || "padding";
        var axisKey = settings.axisKey;
        var defaultRange = [this.context.display[paddingKey], this.context.display[axisKey]-this.context.display[paddingKey]];
        return [defaultRange[this.range[0]], defaultRange[this.range[1]]]
    };
    temp1.Scale.prototype.getScale = function(settings){
        var currentRange = this.getRange(settings);
        return d3[this.type][this.subType]().range(currentRange).domain(this.domain);
    };

    temp1.Graph = function Graph(settings){
        // Page Settings
        this.display = {
            'container': settings.container,
            'padding': settings.padding || 100,
            // 'height': settings.containerHeight,
            // 'width': settings.containerWidth
        };
        // Date Scale
        var dateSettings = {'context':this, 'type':'time', 'subType':'scale','range':[0,1]};
        this.dateScale = new temp1.Scale(dateSettings);
        // Price Scale
        var priceSettings = {'context':this, 'type':'scale', 'subType':'linear', 'range':[1,0]};
        this.priceScale = new temp1.Scale(priceSettings);
        // Data 
        this.dataInterface = MyApplication.models.Interface() || {};
    };
    temp1.Graph.prototype.sentimentScale = function(){
        // Move this to init and make it an instance of the scale class
        return d3.scale.linear().domain([-1,1]).range([this.display['height'] - this.display['padding'], this.display['padding']]);
    };
    temp1.Graph.prototype.drawXAxis = function(translateString){
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
    };
    temp1.Graph.prototype.drawYAxis = function(options){
        var yAxis = d3.svg.axis();
        yAxis.scale(options.scale).orient(options.orient);
        var svg = d3.select("svg");
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", options.translateString)
            .call(yAxis);
    };
    temp1.Graph.prototype.axisLabel = function(options){
        options.svg.append("text")
            .attr("transform", options.transform)
            .attr("y", options.y)
            .attr("x", options.x)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(options.content);
    };
    temp1.Graph.prototype.drawAxisLabels = function(flags){
        var margin = this.display.padding;
        var width = parseInt($(this.display.container).css("width"));
        var height = parseInt($(this.display.container).css("height"));
        var labels = [];
        if (flags.sentiment){
            this.drawYAxis({
                'orient':'right',
                'scale':this.sentimentScale(), 
                'translateString':"translate(" + (this.display['width']-this.display['padding']) + ",0)"
            });
            labels.push({
                'svg': flags.svg,
                'transform':'rotate(90)',
                'y':(margin/3)-width,
                'x':(height/2),
                'content':'Sentiment'
            });
        };
        if (flags.price){
            this.drawYAxis({
                'orient':'left',
                'scale':this.priceScale.getScale({'axisKey':'height'}), 
                'translateString':"translate(" + this.display['padding'] +",0)"
            });
            labels.push({
                'svg': flags.svg,
                'transform':'rotate(-90)',
                'y':margin/3,
                'x':0-(height/2),
                'content':'Closing Price'
            });
        };
        if (flags.sentiment || flags.price){
            this.drawXAxis("translate(0," + (this.display['height'] - this.display['padding']) +")");
            labels.push({
                'svg': flags.svg,
                'y':height-(margin/2),
                'x':(width/2)-(margin/2),
                'content':'Date'
            });
            labels.push({
                'svg': flags.svg,
                'y':(margin/2),
                'x':(width/2)-(margin/2),
                'content':'The Mutha Fuckin Graph'
            });
        };
        for (var idx = labels.length; idx--;) this.axisLabel(labels[idx]);
    };
    temp1.Graph.prototype.createSvg = function(){
        var $container = $(this.display['container']);
        $container.empty();
        // $(".tooltip").remove();
        this.display['height'] = parseFloat($container.css("height"));
        this.display['width'] = parseFloat($container.css("width"));

        d3.select(this.display['container'])
            .append("svg")
            .attr("width",this.display['width'])
            .attr("height",this.display['height']);

        return d3.select("svg");
    };
    temp1.Graph.prototype.draw = function(resize, dateRange){
        // Clean This Up
        var price, sentiment, domain, labelOptions, current;
        var groups = this.dataInterface.allGroups();

        var svg = this.createSvg();
        this.dateScale.setDomain(dateRange);
        for (var name in groups){ 
            if (name === "price"){
                domain = groups[name].getCollectionRange('height');
                if (domain.length !== 2 || !domain[0]) continue;
                this.priceScale.setDomain(domain);
                current = groups[name];
                for(var idx = current.collection.length; idx--;){
                    if (!current.collection[idx].show) continue;
                    this.plotPrices(current.collection[idx]);
                    price = true;  
                };
            }
            else if (name === "sentiment"){
                current = groups[name];
                for(var idx = current.collection.length; idx--;){
                    if (!current.collection[idx].show) continue;
                    this.plotTweets(current.collection[idx]);
                    sentiment = true;
                    // this.plotPrices(current.collection[idx],"sentiment");
                };
            };
        };
        this.drawAxisLabels({
            'svg':svg,
            'price':price,
            'sentiment':sentiment
        });
    };
    temp1.Graph.prototype.plotTweets = function(qwarg){
        $(".tooltip").remove();
        var yScale = this.sentimentScale();
        // radius scale not added
        var radius_range = d3.extent(qwarg.data, function(d){
            return d.radius;
        });
        var rScale = d3.scale.linear().range([10,75]).domain(radius_range);
        // clear
        var xScale = this.dateScale.getScale({'axisKey':'width'});
        var dateFormat = d3.time.format(qwarg.parseDate);
        var checkDate = this.dateScale;
        var svg = d3.select("svg");
        // does not bind tag or title to this circle
        svg.selectAll("circle")
            .data(qwarg.data)
            .enter()
            .append("circle")
            .attr("cx", function(d){
                return xScale(dateFormat.parse(d.date));
            })
            .attr("cy", function(d){
                return yScale(parseFloat(d.height));
            })
            .attr("r", function(d){
                return rScale(parseInt(d.radius));
            })
            .attr("title", function(d){
                return d.title;
            })
            .style("fill", qwarg.fill)
            .style("display", function(d){
                if (checkDate.inScale(dateFormat.parse(d.date))){
                    return "initial";
                }
                else{
                    return "none";
                }
            });
    };
    temp1.Graph.prototype.plotPrices = function(qwarg, note){
        // Clear
        var yScale = this.priceScale.getScale({'axisKey':'height'});
        if (note){
            yScale = this.sentimentScale();
        }
        var xScale = this.dateScale.getScale({'axisKey':'width'});
        // Clear
        var checkDate = this.dateScale.inScale;
        var dateFormat = d3.time.format(qwarg.parseDate);
        var svg = d3.select("svg");
        var line = d3.svg.line()
            .x(function(d){return xScale(dateFormat.parse(d.date));})
            .y(function(d){return yScale(parseFloat(d.height));})
            .interpolate("basis");

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
                .attr("stroke-dashoffset", 0);
    };
    temp1.Graph.prototype.clear = function(setString){
        // This does not do anything to the Path
        // $(".tooltip").remove();
        $(setString).remove();
        // $("circle").tooltips();
    };
})(MyApplication.presenter);