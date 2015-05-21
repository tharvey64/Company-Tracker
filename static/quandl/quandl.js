function renderForms(){
    var dateTemplate = $("#date-form").html();
    Mustache.parse(dateTemplate);
    var info = Mustache.render(dateTemplate);
    $("#tab1").html(info);

    var searchTemplate = $("#search-form").html();
    Mustache.parse(searchTemplate);
    var info = Mustache.render(searchTemplate);
    $("#tab2").html(info);

    var loginTemplate = $('#login-form').html();
    Mustache.parse(template);
    var info = Mustache.render(loginTemplate);
    $('#tab3').html(info);

    var template = $('#oauth-form').html();
    Mustache.parse(template);
    var info = Mustache.render(template);
    $('#tab4').html(info); 

    var colorTemplate = $('#color-form').html();
    Mustache.parse(template);
    var info = Mustache.render(colorTemplate);
    $('#fillSelector').html(info);
}

$(document).ready(function(){
    var stockPrices = [];

    renderForms()

    $("#tab1").on("submit", "#stockForm",function(event){
        event.preventDefault();
        var symbol = $("input[name='company_symbol']").val(),
        token = $("input[name='csrfmiddlewaretoken']").val(),
        date = $("#month_start").val() + "-" + $("#day_start").val() + "-" + $("#year_start").val();
        if (symbol.length == 0){
            $('#mariner h3').remove()
            setTimeout(function(){ 
            return $('#mariner').append("<h3>No results found</h3>"); 
            }, 2800);       
        }
        var template = $('#twitter-form').html();
        Mustache.parse(template);
        var info = Mustache.render(template, {'startDate' : date});
        $('#footer').html(info);   

        $.post("/quandl/stock_history/" + symbol + "/" + date,{'csrfmiddlewaretoken':token},function(data){
            if (data.stocks){
                if (data.stocks.length == 0){
                    $('#mariner h3').remove()
                    setTimeout(function(){ 
                    return $('#mariner').append("<h3>No results found</h3>");
                }, 2800);
                }
                for (i in data.stocks){
                    // do this loop in python
                    data.stocks[i]['startDate'] = date;
                }

                $("#graph").empty();
                var template = $("#company-form").html();
                Mustache.parse(template);
                var info = Mustache.render(template,{"result":data.stocks})
                $("#graph").html(info);

            }
            else if (data.close){
                $("#stories").empty();
                $("#stories").trigger("getStories", [symbol]);
                $("#graph").empty();
                stockPrices = data.close;
                var parseDate = d3.time.format("%Y-%m-%d").parse;
                var start = d3.time.format("%B-%e-%Y").parse(date);
                $("#graph").trigger("drawGraph",[stockPrices, parseDate, start, "stock", "circle", 0, [5,5], true]);
                d3.selectAll(".stock").style("fill", "red");
            }
        });
    });

    $("#graph").on("submit", ".company-list form", function(event){
        event.preventDefault();
        var url = $(this).attr("action"),
        tag = $(this).attr("id"),
        date = $("#"+tag+" input[name='start date']").val(),
        input = $(this).serialize()
        $.post(url, input, function(data){

            if (data.company){
                var company = data.company
                $.post("/quandl/stock_history/" + company.symbol + "/" +  date, input, function(data){
                    if (data.close){
                        $("#stories").empty();
                        $("#stories").trigger("getStories", [company.symbol]);
                        $("#graph").empty();
                        stockPrices = data.close;
                        var parseDate = d3.time.format("%Y-%m-%d").parse;
                        var start = d3.time.format("%B-%e-%Y").parse(date);
                        $("#graph").trigger("drawGraph",[stockPrices, parseDate, start, "stock", "circle", 0, [5,5], true]);
                        d3.selectAll(".stock").style("fill", "red");
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
    $('#loginEmail, #loginPassword').on('click', function(event){
        console.log('hi');
        setTimeout(function(){      
        $('#login').addClass('open');
        }, 1);               
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

