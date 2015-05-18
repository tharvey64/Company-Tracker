function timestamp(time_string){
    var x = time_string.lastIndexOf(":");
    time_string = time_string.slice(0,x) + time_string.substring(x+1)
    return time_string;
}

$(document).ready(function(){    
    $("#footer").on("submit", "#twitterForm", function(event){
        event.preventDefault();
        var startDate = $("#twitterForm input[name='start date']").val();
        
        $.post($(this).attr('action'),
            $("#twitterForm").serialize(),
            function(data) {
                console.log(data)
                $(".tooltip").remove();
                $(".tweet").remove();
                if (data.hasOwnProperty("tweets")){
                    $("body").remove(".tooltip");
                    var parseDate = d3.time.format("%Y-%m-%d %X%Z").parse;
                    var start = d3.time.format("%B-%e-%Y").parse(startDate);
                    $("#graph").trigger("drawGraph",[data.tweets, parseDate, start, "tweet", "circle:not(.stock)", 3, [5,25], false]);
                    d3.selectAll(".tweet").style("fill", "yellow");
                }else{
                    console.log('twitter view error')
                }
        });
    });
});