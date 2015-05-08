$(document).ready(function(){
    $("#tab1, #graph").on("submit", "form", function(event){
        event.preventDefault();
        var symbol = $("input[name='company_symbol']").val();
        $.getJSON("/article_feeds/yahoo/" + symbol + "/", function(data){
            var template = $('#story-template').html();
            console.log()
            var info = Mustache.render(template, data);
            $("#stories").html(info);       
        });

    });
});