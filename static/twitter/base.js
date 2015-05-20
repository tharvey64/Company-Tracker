$(document).ready(function(){    
    $("#footer").on("submit", "#twitterForm", function(event){
        event.preventDefault();
        var startDate = $("#twitterForm input[name='start date']").val();
        
        $.post($(this).attr("action") + $("#path").val(),
            $("#twitterForm").serialize(),
            function(data) {
                if (data['error']){
                    $('#mariner h3').remove()
                    return $('#mariner').append("<h3>"+data['error']+"<h3>");
                }
                $('#mariner h3').remove()
                $(".tooltip").remove();
                $(".tweet").remove();
                if (data.hasOwnProperty("tweets")){
                    $("body").remove(".tooltip");
                    var parseDate = d3.time.format("%Y-%m-%d %X%Z").parse;
                    var start = d3.time.format("%B-%e-%Y").parse(startDate);
                    $("#graph").trigger("drawGraph",[data.tweets, parseDate, start, "tweet", "circle:not(.stock)", 3, [5,25], false]);
                    d3.selectAll(".tweet").style("fill", "yellow");
                }else{
                    console.log("twitter view error")
                }
        });
    });
    $('#footer').on("change", "#path", function(event){ 
        if (($("#path option:selected").val()) == 'random'){
            $("#listForm").slideUp(1000);   
        }
        else{
           $("#listForm").slideDown(1000);   
        }
    });
});
