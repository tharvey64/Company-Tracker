$(document).ready(function(){    
    $('#searchTwitter').on('submit', function(event){
        event.preventDefault();
        $.post($(this).attr('action'),
            {'search': ($('#search')).val(), csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value, 'type' :$('[name=filter]').val() },
            function(data) {
                var dataset = []
                var dates = data['dates'] 
                var favorites = data['favorites']
                var feelings = data['feelings']
                for (i=0; i < dates.length; i++) {
                    if (feelings[i]['feeling']['docSentiment'] != undefined){
                        dataset.push([dates[i]['date'], feelings[i]['feeling']['docSentiment']['score'], favorites[i]['favorite']])
                    }
                    else{
                        continue
                    }
                }   
                console.log(dataset)
        //         var template = $('#sentimentTemplate').html();
        //         Mustache.parse(template);
        //         var info = Mustache.render(template, data);
        //         $('#postedSearch').html(info);
        //         var template = $('#tweetTemplate').html();
        //         Mustache.parse(template);
        //         var info = Mustache.render(template, data);
        //         $('#postedTweets').html(info); 
        //         var template = $('#hashTemplate').html();
        //         Mustache.parse(template);
        //         var info = Mustache.render(template, data);
        //         $('#postedHashes').html(info);                                 
            }
        )
    
    })
});