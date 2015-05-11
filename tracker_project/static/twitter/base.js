$(document).ready(function(){    
    $('#twitterForm').on('submit', function(event){
        event.preventDefault();
        // $('#graph').empty()
        $.post($(this).attr('action'),
            {'search': ($('#search')).val(), csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value, 'type' :$('[name=filter]').val() },
            function(data) {
                $('#postedSearch').empty();
                $('.tooltip').remove();
                var dataset = []
                var dates = data['dates']  
                var favorites = data['favorites']
                var tweets = data['tweets']
                // var feelings = data['feelings']
                for (i=0; i < dates.length; i++) {
                    if (tweets[i] != undefined){
                        dataset.push([tweets[i]['content'], favorites[i]['favorite'], Math.random(1), dates[i]['date']]) //feelings[i]['feeling']['docSentiment']['score']])
                    }
                    else{
                        continue
                    }
                } 
            var padding = 60;
            var high = d3.max(dataset,function(d){return d[1]});            
            var verticalTicks = high/10;
            var graphHeight = parseInt($("#graph").css('height'));
            var h = graphHeight
            var graphWidth = parseInt($("#graph").css('width'));
            var w = graphWidth; 
            var parseDate = d3.time.format("%a %B %e %X %Z %Y").parse; 
            var horizontalTicks = w/100;                            

            var yScale = d3.scale.linear()
                .domain([0, d3.max(dataset,function(d){return d[2]})])
                .range([h - padding, padding]);    

            var xScale = d3.time.scale()
                .domain(d3.extent(dataset, function(d){
                    return parseDate(d[3]);
                }))
                .range([padding, w - padding]);

            var xAxis = d3.svg.axis();
            xAxis.scale(xScale).orient("bottom");
            xAxis.ticks(horizontalTicks);   

            var yAxis = d3.svg.axis();
            yAxis.scale(yScale).orient("left");
            yAxis.ticks(10);

            var svg = d3.select("#postedSearch")
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h)  
            svg.selectAll("circle")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    return xScale(parseDate(d[3]));
                })
                .attr("cy", function(d){
                    return yScale(d[2]);
                })
                .attr("r", function(d) {
                    return Math.sqrt(d[1] / 25);
                })
                .attr("title", function(d){
                    return d[0];
                })
                .attr("class", "tweet")
                .attr("fill", "gold");
                // .attr("fill", function(d) {
                //     return d3.rgb((d[2] * -255),(d[2] * 255),0);
                // });
                svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + (h - padding) + ")")
                    .call(xAxis);
                svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(" + padding +",0)")
                    .call(yAxis);
                $('svg > circle').tooltips();
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
