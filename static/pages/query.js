$(document).ready(function(){
    $("#tab2").on("submit", "#searchForm", function(event) {
        $("#loading").css("display", "block"); 
    });


    $("body").on("dataLoad", function(){      
        $("#loading").css("display", "none");
        $("#backButton").css("display", "block");             
        $("#graph").css("display", "inline-block"); 
        $("#forms").slideUp(1800);
        $(".navButs").animate({
            opacity: 0
        }, 2000);               
    });

    $("#tab1").on("submit", "#stockForm", function(event) {
        $("#loading").css("display", "block"); 
    });

    $("#backButton").on("click", function(event) { 
        $("#backButton").css("display", "none");       
        $(".returned").css("display", "none");  
        $("#selectorButton").css("display", "none"); 
        $('#fillSelector').css('display', 'none');
        $('#tweetFill').css('display', 'none');               
        $("#stories, #graph").empty();
        $('#mariner h3').remove()
        $(".navButs").animate({
            opacity: 1
        }, 2000);  
        $("#forms").slideDown(1800);    
    }); 
    $("#twitterPath").on("click", function(event){
        $("#stories").css("display", "none");
        $("#footer").css("display", "block");
        $("#graph").css("display", "block");        
    });
    $("#storyPath").on("click", function(event){
        $("#stories").css("display", "block");
        $("#graph").css("display", "none");  
        $("#footer").css("display", "none");              
    });    
    $("#graph").on("click", "button.search-result", function(event){
        $("#backButton").css("display", "none");  
        $(".returned").css("display", "none");  
        $("#selectorButton").css("display", "none");    
        $('#fillSelector').css('display', 'none')       
        $(".navButs").animate({
            opacity: 1
        }, 2000);            
        $("#forms").slideDown(1800); 

        $('.tabs #tab1').show().siblings().hide();

        $("[href='#tab1']").parent('li').addClass('active').siblings().removeClass('active');               
    });
    $("#color-form").on("submit", function(event){
        event.preventDefault();
        var color = $('#colorSelection').val()
        $('.stock').css('fill', color);
    });
    $('#footer').on("click", '#colorTweetBut', function(event){
        event.preventDefault();
        var color = $('#colorTweetSelection').val()
        $('.tweet').css('fill', color);
    })
});









