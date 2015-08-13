$(document).ready(function(){
    $("body").on("dataLoad", function(){      
        $("#backButton").css("display", "block");             
        $("#graph").css("display", "inline-block"); 
        $("#forms, #intro").slideUp(1800);
        $(".navButs").animate({
            opacity: 0
        }, 2000);
        });

    $("body").on("serverError", function(event, message){
        var template = $("#error-template").html();
        Mustache.parse(template);
        var info = Mustache.render(template, message);
        $("#super-secretDivBam").html(info);

        $("#super-secretDivBam").css("display", "block");
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
        $("#forms, #intro").slideDown(1800);  
        setTimeout(function(){ 
            $("#super-secretDivBam").css("display", "none"); 
            $("#super-secretDivBam").css("display", "none"); 
        }, 3000);
    });
    // Clear #super-secretDivBam Here
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
        $("#forms, #intro").slideDown(1800);    
    }); 
    $("#twitterPath").on("click", function(event){
        $("#stories").css("display", "none");
        $("#footer").css("display", "block");
        $("#graph").css("display", "block");  
        $("#color-form").css("display", "block");              
    });
    $("#storyPath").on("click", function(event){
        $("#stories").css("display", "block");
        $("#graph").css("display", "none");  
        $("#footer").css("display", "none");
        $("#color-form").css("display", "none");              
    });    
    $("#graph").on("click", "button.search-result", function(event){
        $("#backButton").css("display", "none");  
        $(".returned").css("display", "none");  
        $("#selectorButton").css("display", "none");    
        $('#fillSelector').css('display', 'none')      
        $(".navButs").animate({
            opacity: 1
        }, 2000);     
        $("#forms, #intro").slideDown(1800); 

        $('.tabs #tab1').show().siblings().hide();

        $("[href='#tab1']").parent('li').addClass('active').siblings().removeClass('active');               
    });
});










