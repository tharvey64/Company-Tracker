$(document).ready(function(){
    $("#tab1, #graph").on("submit", "#stockForm, .company-list form", function(event){
        event.preventDefault();
        var tag = $(this).attr("id"),
        symbol;
        if (tag == "stockForm"){
            symbol = $("input[name='company_symbol']").val();
        }
        else{
            symbol = $($("#"+tag+" button ul li input")[1]).val();
        }
        $.getJSON("/article_feeds/yahoo/" + symbol + "/", function(data){
            var template = $('#story-template').html();
            console.log()
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