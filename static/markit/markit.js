function timestamp(time_string){
    var x = time_string.lastIndexOf(":");
    time_string = time_string.slice(0,x) + time_string.substring(x+1)
    return time_string.replace("UTC","");
}

$(document).ready(function(){

    $("#searchForm").on("submit", function(event){
        event.preventDefault();

        var company = $("input[name=company_name]").val()
        $.getJSON("/markit/search/", {"input_string": company},function(data){
            $("#graph").empty();
            if (!data.list.length){
                $("body").trigger("serverError", [{"error":"No Search Results Were Found."}]);
            }
            else if (data.list.Error || data.list.Message){
                $("body").trigger("serverError", [{"error":"No Search Results Were Found."}]);
            }
            else {
                var template = $("#search-result").html();
                Mustache.parse(template);
                var info = Mustache.render(template,{"result":data.list})
                $("#graph").html(info);
                $("body").trigger("dataLoad");
            }
        });
    });
    $("#graph").on("click", "button.search-result", function(event){
        var dbCode = $(this).attr("id").split("_");
        var dateTemplate = $("#date-form").html();
        Mustache.parse(dateTemplate);
        var info = Mustache.render(dateTemplate, {"ticker": dbCode[1]});
        $("#tab1").html(info);
    });
});