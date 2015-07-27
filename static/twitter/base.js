$(document).ready(function(){    
    $("#footer").on("submit", "#twitterForm", function(event){
        event.preventDefault();
        var startDate = $("#twitterForm input[name='start date']").val();
        var token = $(this).children('input[name="csrfmiddlewaretoken"]').val();
        $('#tweetFill').css('display', 'block');
        $.post($(this).attr("action") + $("#path").val(),
            $("#twitterForm").serialize(),
            function(data){
                if (data['error']){
                    $('#mariner h3').remove()
                    setTimeout(function(){
                        $('#mariner').append("<h3>"+data['error']+"<h3>");
                    },3000);
                    $('#mariner h3').remove();
                }
                else if (data.hasOwnProperty("tweets")){
                    // Graph Data Setup
                    var tweets = new Qwarg("sentiment", [], "tweet");
                    tweets.qwargParseDate = d3.time.format("%Y-%m-%d %X%Z").parse;
                    if ($('#colorTweetSelection').val() == undefined){
                       tweets.fill = "yellow"; 
                    }
                    else{
                       tweets.fill = $('#colorTweetSelection').val() 
                    }
                    tweets.radiusRange = [5,25];
                    tweets.show = true;
                    var start = d3.time.format("%B-%e-%Y").parse(startDate);

                    var tweetsFound = JSON.parse(data.tweets);
                    var tweetsLength = tweetsFound.length;
                    for (i = 0; i < tweetsLength; i++){
                        // send tweet to sentiment eval
                        tweetsFound[i]['csrfmiddlewaretoken'] = token;
                        $.post('/sentiment/text/',tweetsFound[i],function(data){
                            if (!data.hasOwnProperty('error')){
                                tweets.qwargData.push(data);
                                $("#graph").trigger("drawGraph",[start, tweets]);
                                // $("#graph").trigger("addToDataSet",["tweet",data]);
                            }
                        });
                    }
                    // $("#graph").trigger("drawGraph",[start, tweets]);
                }
                else{
                    $('#mariner h3').remove()
                    $('#mariner').append("<h3>Search Error<h3>");
                    // $("body").trigger("serverError",[{"error":"Your Tweeter Search Could Not Be Processed."}]);  
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
