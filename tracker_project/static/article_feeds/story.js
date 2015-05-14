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
        // $(this).attr("disabled");
        var url = $(this).val();
        var p = $(this).parent();
        
        $.getJSON("/article_feeds/article_sentiment/",{"url":url},function(data){
            console.log(data);
            p.replaceWith("<p> Score: " + data.docSentiment.score +", Type: " + data.docSentiment.type + "</p>");
        });
    });
});