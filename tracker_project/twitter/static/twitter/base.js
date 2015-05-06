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
            var parseDate = d3.time.format("%Y-%m-%d-%H-%M-S").parse                
            var h = parseInt($("#graph").css('height'));
            var graphWidth = parseInt($("#graph").css('width'));
            var w = dataset.length/5 * graphWidth;                
            var svg = d3.select("body")
                        .append("svg")
                        .attr("width", w)
                        .attr("heigh", h)  
            svg.selectAll("circle")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    return parseDate(d[0]);
                })
                .attr("cy", function(d){
                    return d[1]
                })
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