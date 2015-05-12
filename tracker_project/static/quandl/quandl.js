function drawGraph(dataset, parseDate){
    $('#graph').empty();
    $('.tooltip').remove();
    var h = parseInt($("#graph").css("height"));
    var graphWidth = parseInt($("#graph").css('width'));
    var w = graphWidth;

    d3.select("#graph")
    .append("svg")
    .attr("width",w)
    .attr("height",h);

    var svg = d3.select("svg");

    var low = d3.min(dataset,function(d){return parseFloat(d[1]) * 0.8});
    var high = d3.max(dataset,function(d){return parseFloat(d[1]) * 1.2});
    
    // Needs To be Refactored

    var padding = 30;

    var yScale = d3.scale.linear();
    yScale.range([h - padding, padding]);
    yScale.domain([low, high]);

    var yAxis = d3.svg.axis();
    yAxis.scale(yScale).orient("left");

    var xScale = d3.time.scale().range([padding, w-padding]);

    var input = d3.extent(dataset,function(d){ 
        return parseDate(d[0]);
    });

    input[0].setDate(input[0].getDate()-1);
    input[1] = new Date()
    input[1].setDate(input[1].getDate()+1);
    xScale.domain(input);

    var xAxis = d3.svg.axis();
    xAxis.scale(xScale).orient("bottom");
    // xAxis.ticks(d3.time.day, 1);

    svg.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("class", "stock")
    .attr("cx", function(d){
        return xScale(parseDate(d[0]));
    })
    .attr("cy", function(d){
        return yScale(d[1]);
    }).attr("r", 4)
    .attr("title", function(d){
        return d[0]
    }).style("fill","red");
    
    svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (h - padding) +")")
    .call(xAxis);

    svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + padding +",0)")
    .call(yAxis);

    $("svg > .stock").tooltips();
}

function renderForms(){
    var dateTemplate = $("#date-form").html();
    Mustache.parse(dateTemplate);
    var info = Mustache.render(dateTemplate);
    $("#tab1").html(info);

    var searchTemplate = $("#search-form").html();
    Mustache.parse(searchTemplate);
    var info = Mustache.render(searchTemplate);
    $("#tab2").html(info);

    // var template = $('#twitter-form').html();
    // Mustache.parse(template);
    // var info = Mustache.render(template);
    // $('#tab3').html(info); 
 
}

$(document).ready(function(){
    var stockPrices = [];

    renderForms()

    $("#tab1").on("submit", "#stockForm",function(event){
        event.preventDefault();
        var symbol = $("input[name='company_symbol']").val(),
        token = $("input[name='csrfmiddlewaretoken']").val(),
        date = $("#month_start").val() + "-" + $("#day_start").val() + "-" + $("#year_start").val();
        var template = $('#twitter-form').html();
        Mustache.parse(template);
        var info = Mustache.render(template, {'startDate' : date});
        $('#footer').html(info);        
        // pass the date as hidden input to the forms
        $.post("/quandl/stock_history/" + symbol + "/" + date,{'csrfmiddlewaretoken':token},function(data){
            // wont work havent tested
            if (data.stocks){
                for (i in data.stocks){
                    data.stocks[i]['startDate'] = date;
                }
                $("#graph").empty();
                var template = $("#company-form").html();
                Mustache.parse(template);
                var info = Mustache.render(template,{"result":data.stocks})
                $("#graph").html(info);
            }
            else if (data.close){
                $("#graph").empty();
                $("svg").remove(".tooltip");
                stockPrices = data.close;
                var parseDate = d3.time.format("%Y-%m-%d").parse
                drawGraph(stockPrices, parseDate);
            }
        });
    });

    $("#graph").on("submit", ".company-list form", function(event){
        event.preventDefault();
        var url = $(this).attr("action"),
        tag = $(this).attr("id"),
        name = $("#"+tag+" input[name='name']").val(),
        symbol = $("#"+tag+" input[name='symbol']").val(),
        exchange = $("#"+tag+" input[name='exchange']").val(),
        date = $("#"+tag+" input[name='start date']").val(),
        token = $("#"+tag+" input[name='csrfmiddlewaretoken']").val();

        $.post(url, {"csrfmiddlewaretoken": token,"name": name, "symbol": symbol, "exchange": exchange}, function(data){

            if (data.company){
                // date = "January-1-2005"
                $.post("/quandl/stock_history/" + data.company.symbol + "/" +  date, {"csrfmiddlewaretoken": token, "symbol":symbol, "exchange" :data.company.exchange}, function(data){
                    if (data.close){
                        $("#graph").empty();
                        $("svg").remove(".tooltip");
                        stockPrices = data.close;
                        var parseDate = d3.time.format("%Y-%m-%d").parse
                        drawGraph(stockPrices, parseDate);
                    }
                    else{
                        console.log(data);
                    }
                });
            }
            else{
                console.log(data)
            }
        });
    });
    // more thought required
    // var dataset = []
    // setInterval(function(){
    //     $.getJSON("/markit/live_stock/",function(data){
    //         if (data["Error"]){
    //             console.log(data["Error"]);
    //         }
    //         else{

    //             dataset.push([timestamp(data["Timestamp"]),data["LastPrice"]]);
    //             var parseTimestamp = d3.time.format("%a %B %e %X %Z %Y").parse 
    //         }       
    //     });
    // },50000);
});

// $("#graph").on("mouseenter","circle", function(){
//     console.log($(this)[0].__data__[1])
// });

// $("#graph").on("mouseleave","circle", function(){
//     console.log($(this).attr("class")+"Leave");
// });

