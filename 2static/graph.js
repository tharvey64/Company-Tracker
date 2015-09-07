function Qwarg(qwargType, qwargData, qwargClassString, options){
    // Change The Parameters to options
    // something = options.something || default
    // Tweets should be stored with some reference to their Query
    this.qwargType = qwargType;
    this.qwargData = qwargData;
    this.qwargClassString = qwargClassString;
    this.qwargParseDate = options.praseDate || d3.time.format("%Y-%m-%d %X").parse;
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
        var radiusHigh = d3.max(this.qwargData,function(d){return parseFloat(d.radius);});
        var radiusLow = d3.min(this.qwargData,function(d){return parseFloat(d.radius);});
        scale.domain([radiusLow,radiusHigh]);
        scale.range(this.radiusRange);
        return scale;
    }
}

function Graph(container){
    this.container = container;
    this.startDate;
    this.endDate;
    this.highPrice = 0;
    this.lowPrice = 0;
    this.padding = 70;
    this.graphHeight = parseInt($(this.container).css("height"));
    this.graphWidth = parseInt($(this.container).css("width"));
    this.priceScale;
    this.dateScale;
    this.qwargSet = {};
}
Graph.prototype.sentimentScale = function(){
    return d3.scale.linear().domain([-1,1]).range([this.graphHeight - this.padding, this.padding]);
}
Graph.prototype.setDateScale = function(){
    if (!this.dateScale){
        this.startDate.setHours(this.startDate.getHours()+9);
        this.endDate.setHours(this.endDate.getHours()+2);
    }
    this.dateScale = d3.time.scale()
    this.dateScale.domain([this.startDate, this.endDate]);
    this.dateScale.range([this.padding, this.graphWidth-this.padding]);
}
Graph.prototype.setPriceScale = function(qwarg, resize){
    var high = d3.max(qwarg.qwargData, function(d){return (parseFloat(d.height)*1.05)});
    var low = d3.min(qwarg.qwargData, function(d){return (parseFloat(d.height)*0.95)});
    if (!this.priceScale || resize){
        this.highPrice = high;
        this.lowPrice = low;
        this.priceScale = d3.scale.linear();
        // default padding for top of graph = 10
        this.priceScale.range([this.graphHeight - this.padding, 10]);
        this.priceScale.domain([low ,high]);
        return true;
    }
    else if (high > this.highPrice || low < this.lowPrice){
        if (high > this.highPrice){
            this.highPrice = high;
        }
        if (low < this.lowPrice){
            this.lowPrice = low;   
        }
        this.priceScale.domain([this.lowPrice, this.highPrice]);
        return true;
    }
    return false;
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
    $(this.container).empty();
    // $(".tooltip").remove();
    this.graphHeight = parseInt($(this.container).css("height"));
    this.graphWidth = parseInt($(this.container).css("width"));

    d3.select(this.container)
        .append("svg")
        .attr("width",this.graphWidth)
        .attr("height",this.graphHeight);

    return d3.select("svg");
}
Graph.prototype.draw = function(resize){
    this.createSvg();
    var price = false; 
    var sentiment = false;
    // Setting Scales
    // console.log(this.qwargSet)
    for (q in this.qwargSet){
        if (this.qwargSet[q].qwargType == "price"){
            this.setPriceScale(this.qwargSet[q], resize);
            price = true;
        }
        else if (this.qwargSet[q].qwargType == "sentiment"){
            sentiment = true;
        }
    }
    if (!this.dateScale || resize){
        this.setDateScale();
    }
    // Drawing Axis
    if (sentiment){
        this.drawYAxis(this.sentimentScale(), "translate(" + (this.graphWidth-this.padding) +",0)");
    }
    if (price){
        this.drawYAxis(this.priceScale, "translate(" + this.padding +",0)");
    }
    this.drawXAxis("translate(0," + (this.graphHeight - this.padding) +")");
    // console.log(this.priceScale)
    // Plotting Data
    for (q in this.qwargSet){
        // Move this to upper function
        if (this.qwargSet[q].qwargType == "price"){
            this.plotPrices(this.qwargSet[q]);
        }
        else if (this.qwargSet[q].qwargType == "sentiment"){
            this.plotTweets(this.qwargSet[q]);
        }
    }

    // $("circle").tooltips(); 
}
Graph.prototype.plotTweets = function(qwarg){
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
Graph.prototype.plotPrices = function(qwarg){
    // console.log(arguments);
    // if (arguments.length == 2){
    //     dataset = arguments[0].qwargData.concat(arguments[1].qwargData);
    // } 
    // else {
    //     dataset = qwarg.qwargData;
    // }
    var start = this.startDate, 
    end = this.endDate,
    yScale,
    rScale = qwarg.radiusScale(),
    xScale = this.dateScale,
    checkDate = this.checkDate,
    svg = d3.select("svg");
    
    var yScale = this.priceScale;

    // .attr("cx", function(d){
    //     return xScale(qwarg.qwargParseDate(d.date));
    // })
    // .attr("cy", function(d){
    //     return yScale(parseFloat(d.height));
    // })

    var line = d3.svg.line()
        .interpolate("monotone")
        .x(function(d){return xScale(qwarg.qwargParseDate(d.date));})
        .y(function(d){return yScale(parseFloat(d.height));});

    var path = svg.append("path")
        .attr("d", line(qwarg.qwargData))
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

// function intraDay(ticker, graph){
//     $.get('/quandl/current/',{'ticker':ticker},function(data){
//         graph.qwargSet[ticker].qwargData[graph.qwargSet[ticker].qwargData.length] = data.prices[0];
//         graph.qwargSet[ticker].qwargData = graph.qwargSet[ticker].qwargData.concat(data.prices);
//         graph.draw();
//     });
// }

// $(document).ready(function(){
//     var endDate = new Date(),
//     graph = new Graph(),
//     stockQwarg,
//     currentInterval;
//     $(this.container).on("drawGraph", function(event, startDate, qwarg){
//         if (qwarg.qwargType == "price" && stockQwarg != qwarg.qwargClassString){
//             // Evaluate If This Is Needed 
//             delete graph.qwargSet[stockQwarg]
//             delete graph.qwargSet["tweet"]
//             graph.dateScale = false;
//             stockQwarg = qwarg.qwargClassString;
//             graph.highPrice = 0; 
//         }
//         if(qwarg.qwargType == "tweet"){
//             delete graph.qwargSet["tweet"]
//         }
//         graph.endDate = endDate;
//         graph.startDate = startDate;
//         // qwarg.qwargData is newest to oldest
//         graph.qwargSet[qwarg.qwargClassString] = qwarg;
//         // Might be a bad way to do this
//         // intraDay(stockQwarg, graph);
//         graph.draw();
//     });
//     $("#fillSelector").on("submit", "#color-form",function(event){
//         event.preventDefault();
//         var color = $('#colorSelection').val()
//         $('path').attr('stroke', color);
//     });
//     $('#footer').on("click", '#colorTweetBut', function(event){
//         event.preventDefault();
//         var color = $('#colorTweetSelection').val()
//         $('.tweet').css('fill', color);
//     });
//     $("body").on("addToDataSet", function(event, dataSetName, dataToAdd){
//         // Add this for intraday
//         if (graph.qwargSet[dataSetName]){
//             graph.qwargSet[dataSetName].qwargData.push(dataToAdd);
//             graph.draw();
//         }
//         else{
//             console.log("Invalid dataSetName");
//         }
//     });
//     $("body").on("click", "#backButton", function(event){
//         graph = new Graph();
//     });
// });