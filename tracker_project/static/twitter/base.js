$(document).ready(function(){    
    $("#footer").on("submit", "#twitterForm", function(event){
        event.preventDefault();
        var start = $("#twitterForm input[name='start date']").val();
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
                // var feelings = data['feelings']
                for (i=0; i < dates.length; i++) {
                    if (tweets[i] != undefined){
                        dataset.push([tweets[i]['content'], favorites[i]['favorite'], Math.random(3), dates[i]['date']]) //feelings[i]['feeling']['docSentiment']['score']])
                    }
                    else{
                        continue
                    }
                } 
            var padding = 30;
            var high = d3.max(dataset,function(d){return d[1]});            
            var verticalTicks = high/10;
            var graphHeight = parseInt($("#graph").css('height'));
            var h = graphHeight
            var graphWidth = parseInt($("#graph").css('width'));
            var w = graphWidth; 
            var parseDate = d3.time.format("%a %B %e %X %Z %Y").parse; 
            var horizontalTicks = w/100;                            

            var yScale = d3.scale.linear()
                .domain([0, 2])
                .range([h - padding, padding]);    
            var startDate = d3.time.format("%B-%e-%Y").parse(start);
            var endDate = new Date();
            var input = [startDate, endDate];
            input[0].setDate(input[0].getDate()-1);
            input[1].setDate(input[1].getDate()+1);
            var xScale = d3.time.scale()
                .domain(input)
                .range([padding, w - padding]);

            var xAxis = d3.svg.axis();
            xAxis.scale(xScale).orient("bottom");
            xAxis.ticks(horizontalTicks);   

            var yAxis = d3.svg.axis();
            yAxis.scale(yScale).orient("right");
            // yAxis.ticks(10);

            // var svg = d3.select("#graph")
            //             .append("svg")
            //             .attr("width", w)
            //             .attr("height", h) 
            var svg = d3.select("svg"); 
            d3.select("svg")
            .selectAll("circle:not(.stock)")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("class", "tweet")
                .attr("cx", function(d) {
                    return xScale(parseDate(d[3]));
                })
                .attr("cy", function(d){
                    return yScale(d[2]);
                })
                .attr("r", function(d) {
                    return Math.sqrt(d[1] /15);
                })
                .attr("title", function(d){
                    return d[0];
                })
                .attr("fill", "gold");
                // .attr("fill", function(d) {
                //     return d3.rgb((d[2] * -255),(d[2] * 255),0);
                // });
                // svg.append("g")
                //     .attr("class", "axis")
                //     .attr("transform", "translate(0," + (h - padding) + ")")
                //     .call(xAxis);
                d3.select("svg")
                    .append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(" + (w - padding) + ",0)")
                        .call(yAxis);
                $("circle").tooltips();
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
            }
        )
    
    })
});
