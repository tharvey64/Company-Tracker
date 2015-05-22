$(document).ready(function(){    
    $("#footer").on("submit", "#twitterForm", function(event){
        event.preventDefault();
        var startDate = $("#twitterForm input[name='start date']").val();
        $('#tweetFill').css('display', 'block');
        
        $.post($(this).attr("action") + $("#path").val(),
            $("#twitterForm").serialize(),
            function(data) {
                if (data['error']){
                    $('#mariner h3').remove()
                    $('#mariner').append("<h3>"+data['error']+"<h3>");
                }
                $('#mariner h3').remove();
                $(".tooltip").remove();
                $(".tweet").remove();
                if (data.hasOwnProperty("tweets")){
                    
                    var tweets = new Qwarg("sentiment", data.tweets, "tweet");
                    tweets.qwargParseDate = d3.time.format("%Y-%m-%d %X%Z").parse;
                    tweets.fill = "yellow";
                    tweets.radiusRange = [5,25];
                    tweets.show = true;
                    var start = d3.time.format("%B-%e-%Y").parse(startDate);
                    $("#graph").trigger("drawGraph",[start, tweets]);
                }else{
                    console.log("twitter view error")
                }
        });
    });
    $('#footer').on("change", "#path", function(event){ 
        if (($("#path option:selected").val()) == 'random'){
            $("#listForm").slideUp(1000);
            $("#filterForm").slideDown(1000); 
            $('#listName').removeAttr( "required");
        }
        else{
           $("#listForm").slideDown(1000); 
           $("#filterForm").slideUp(1000); 
           $('#listName').attr("required", 'required');
        }
    });
});
