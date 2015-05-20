$(document).ready(function(){    
    $("#footer").on("submit", "#twitterForm", function(event){
        event.preventDefault();
        var startDate = $("#twitterForm input[name='start date']").val();
        
        $.post($(this).attr("action") + $("#path").val(),
            $("#twitterForm").serialize(),
            function(data) {
                console.log(data)
                $(".tweet").remove();
                if (data.hasOwnProperty("tweets")){
                    
                    // var tweets = new Qwarg("sentiment", data.tweets, ".tweet");
                    // tweets.parseDate = d3.time.format("%Y-%m-%d %X%Z").parse;
                    // tweets.fill = "yellow";
                    // tweets.raduisRange = [5,25];

                    var parseDate = d3.time.format("%Y-%m-%d %X%Z").parse;
                    var start = d3.time.format("%B-%e-%Y").parse(startDate);
                    $("#graph").trigger("drawGraph",[data.tweets, parseDate, start, "tweet", "circle:not(.stock)", 3, [5,25], false]);
                    d3.selectAll(".tweet").style("fill", "yellow");
                }else{
                    console.log("twitter view error")
                }
        });
    });
});