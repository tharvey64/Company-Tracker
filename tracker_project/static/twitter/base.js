function timestamp(time_string){
    var x = time_string.lastIndexOf(":");
    time_string = time_string.slice(0,x) + time_string.substring(x+1)
    return time_string;
}

$(document).ready(function(){    
    $("#footer").on("submit", "#twitterForm", function(event){
        event.preventDefault();
        var startDate = $("#twitterForm input[name='start date']").val();
        // $('#graph').empty()

        $.post($(this).attr('action'),
            {'search': ($('#search')).val(), csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value, 'type' :$('[name=filter]').val() },
            function(data) {
                $(".tooltip").remove();
                $(".tweet").remove();
                var dataset = []
                var dates = data['dates']  
                var favorites = data['favorites']
                var tweets = data['tweets']
                var scores = data['scores']
                for (i=0; i < dates.length; i++) {
                    if (tweets[i] != undefined){
                        dataset.push([timestamp(dates[i]['date']), scores[i]['score'], favorites[i]['favorite'], tweets[i]['content']]) //feelings[i]['feeling']['docSentiment']['score']])
                    }
                    else{
                        continue
                    }
                } 
                $("body").remove(".tooltip");
                var parseDate = d3.time.format("%Y-%m-%d %X%Z").parse;
                var start = d3.time.format("%B-%e-%Y").parse(startDate);
                $("#graph").trigger("drawGraph",[dataset, parseDate, start, "tweet", "circle:not(.stock)", 3, [5,25], false]);
                d3.selectAll(".tweet").style("fill", "yellow");
        });
    });
});
        //         var template = $('#sentimentTemplate').html();
        //         Mustache.parse(template);
        //         var info = Mustache.render(template, data);
        //         $('#postedSearch').html(info);
        //         var template = $('#tweetTemplate').html();
        //         Mustache.parse(template);
        //         var info = Mustache.render(template, data);
        //         $('#postedTweets').html(info); 
                // var template = $('#hashTemplate').html();
                // Mustache.parse(template);
                // var info = Mustache.render(template, data);
                // $('#postedHashes').html(info);                                 