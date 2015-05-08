$(document).ready(function(){
    $("#stockForm").on("submit", function(event){
        event.preventDefault();

        var symbol = $("input[name='company_symbol']").val();
        $.getJSON("/article_feeds/yahoo/" + symbol + "/", function(data){
            var template = $('#storyTemplate').html();
            Mustache.parse(template);
            var info = Mustache.render(template, data);
            $('#stories').html(info);       
        });

    });
});