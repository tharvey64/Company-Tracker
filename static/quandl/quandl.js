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
    renderForms()

    $("#tab1").on("submit", "#stockForm",function(event){
        event.preventDefault();
        var symbol = $("input[name='company_symbol']").val(),
        date = [$("#month_start").val(),$("#day_start").val(),$("#year_start").val()].join("-");

        $.getJSON("/markit/search/",{'input_string': symbol},function(data){
            // console.log(data);
            var resultLength = data.list.length
            for (var i = 0; i < resultLength; i++){
            // do this loop in python
                data.list[i]['startDate'] = date;
            }
            $("#graph").empty();
            var template = $("#company-form").html();
            Mustache.parse(template);
            var info = Mustache.render(template,{"result":data.list})
            $("#graph").html(info);
            $("body").trigger("dataLoad");
        });
    });

    $("#graph").on("submit", ".company-list form", function(event){
        event.preventDefault();
        var date = $(this).children('input[name="start date"]').val();
        var dateObj = new Date(date);
        // check date
        $.getJSON($(this).attr("action"), $(this).serialize(), function(data){
            // console.log(data);
            if (data.close){
                $("#stories").empty();
                $("#stories").trigger("getStories", [data.symbol]);

                $("#graph").empty();
                // Creates DataSet
                var company = new Qwarg("price", data.close, data.symbol);
                company.qwargParseDate = d3.time.format("%Y-%m-%d %X").parse;
                company.fill = "red";
                company.radiusRange = [5,5];
                company.show = true;
                var start = d3.time.format("%B-%e-%Y").parse(date);
                $("#graph").trigger("drawGraph",[start, company]);

                $("#graph, #footer, #selectorButton, #fillSelector").css("display", "block"); 
                // This Adds The Twitter Form
                var template = $('#twitter-form').html();
                Mustache.parse(template);
                var info = Mustache.render(template, {'startDate' : date});
                $('#footer').html(info);
                // --------------------------------------------------
                $("body").trigger("dataLoad");
            }
            else{

                $("body").trigger("serverError",[{"error":"Company Not Found."}]);
            }
        });
    });
    $('#loginEmail, #loginPassword').on('click', function(event){
        setTimeout(function(){      
            $('#login').addClass('open');
        }, 1);               
    });
});