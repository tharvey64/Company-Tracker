$(document).ready(function(){
    $("#stories").on("getStories", function(event, symbol){
        event.preventDefault();
        $.getJSON("/article_feeds/yahoo/" + symbol + "/", function(data){
            var template = $('#story-template').html();
            var info = Mustache.render(template, data);
            $("#stories").html(info);       
        });

    });
    $("#stories").on("click", "button", function(event){
        event.preventDefault();
        var url = $(this).val();
        var p = $(this).parent();
        $(this).replaceWith("<p>...</p>");
        
        $.getJSON("/article_feeds/article_sentiment/",{"url":url},function(data){
            p.replaceWith("<p> Score: " + data.score +", Type: " + data.type + "</p>");
        });
    });
});