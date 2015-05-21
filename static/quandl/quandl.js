function renderForms(){
    var dateTemplate = $("#date-form").html();
    Mustache.parse(dateTemplate);
    var info = Mustache.render(dateTemplate);
    $("#tab1").html(info);

    var searchTemplate = $("#search-form").html();
    Mustache.parse(searchTemplate);
    var info = Mustache.render(searchTemplate);
    $("#tab2").html(info);

    var template = $('#login-form').html();
    Mustache.parse(template);
    var info = Mustache.render(template);
    $('#tab3').html(info);

    var template = $('#oauth-form').html();
    Mustache.parse(template);
    var info = Mustache.render(template);
    $('#tab4').html(info); 
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

        $.post("/quandl/stock_history/" + symbol + "/" + date,{'csrfmiddlewaretoken':token},function(data){
            if (data.stocks){
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
                // Symbol needs to be Capital
                $("#stories").trigger("getStories", [symbol]);

                $("#graph").empty();

                var company = new Qwarg("price", data.close, "." + symbol.toUpperCase());
                company.qwargParseDate = d3.time.format("%Y-%m-%d").parse;
                company.fill = "red";
                company.radiusRange = [5,5];
                company.show = true;
                $("#graph").trigger("drawGraph",[d3.time.format("%B-%e-%Y").parse(date), company]);

                $("#graph").css("display", "block"); 
                $("#footer").css("display", "block");                
                $("#selectorButton").css("display", "block");
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
                var companyInfo = data.company;
                $.post("/quandl/stock_history/" + companyInfo.symbol + "/" + date, input, function(data){
                    if (data.close){
                        $("#stories").empty();
                        $("#stories").trigger("getStories", [companyInfo.symbol]);

                        $("#graph").empty();

                        var company = new Qwarg("price", data.close, "." + companyInfo.symbol);
                        company.qwargParseDate = d3.time.format("%Y-%m-%d").parse;
                        company.fill = "red";
                        company.radiusRange = [5,5];
                        company.show = true;
                        var start = d3.time.format("%B-%e-%Y").parse(date);
                        $("#graph").trigger("drawGraph",[start, company]);

                        $("#graph").css("display", "block"); 
                        $("#footer").css("display", "block");                
                        $("#selectorButton").css("display", "block");
                    }
                    else{
                        console.log(data.error);
                    }
                });
            }
            else{
                console.log(data)
            }
        });
    });
    $('#loginEmail, #loginPassword').on('click', function(event){
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

