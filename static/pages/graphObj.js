function Qwarg(qwargType, qwargData, classString){
    this.qwargType = qwargType;
    this.qwargData = qwargData;
    this.classString = classString;
    this.parseDate;
    this.radius;
    this.fill;
}
// Qwarg Type = 'price', 'sentiment' 
// Qwarg Format
// qwargData = {"date":, "heightValue":, "radiusValue":, "titleValue":}
function Graph(startDate, endDate){
    this.startDate = startDate;
    this.endDate = endDate;
    this.priceScale;
    this.sentimentScale;
    this.xScale;
    this.qwargSet = {};
}
Graph.prototype.dateScale = function(width, padding){
    // adds date padding
    this.startDate.setDate(this.startDate.getDate()-1);
    this.endDate.setDate(this.endDate.getDate()+1);
    var scale = d3.time.scale().domain([this.startDate, this.endDate]);
    this.xScale = scale;
}
Graph.prototype.priceScale = function(low, high){
    if (!yScale){
        yScale = d3.scale.linear();
        yScale.range([h - padding, padding]);
        yScale.domain([low, high]);
    }
    else{
        if high
    }
}
Graph.prototype.sentimentScale = function(){};

Graph.prototype.drawAxis = function(){};
Graph.prototype. = function(){};