$(document).ready(function(){
    $("#tab2").on("submit", "#searchForm", function(event) {
        $("#loading").css("display", "block");          
        setTimeout(function(){      
        $("#loading").css("display", "none");
        $("#backButton").css("display", "block");
        $("#forms").animate({
            opacity: 0
        }, 1000);          
        $(".navButs").animate({
            opacity: 0
        }, 2000);       
        $("#graph").css("display", "inline-block"); 
        $("#results").css("display", "block");
        $("#forms").slideUp(2000);
        }, 4000);               
    });
    $("#tab1").on("submit", "#stockForm", function(event) {
            $("#loading").css("display", "block");          
        setTimeout(function(){ 
            $("#loading").css("display", "none");
            $("#forms").animate({
                opacity: 0
            }, 1000);               
            $("#forms").slideUp(2000);             
            $(".navButs").animate({
                opacity: 0
            }, 2000);                      
            $("#backButton").css("display", "block")       
            $("#graph").css("display", "inline-block"); 
            $("#selectorButton").css("display", "block");
        }, 4000);       
    });
    $("#backButton").on("click", function(event) { 
        $("#backButton").css("display", "none");       
        $(".returned").css("display", "none");  
        $("#selectorButton").css("display", "none"); 
        $("#forms").animate({
            opacity: 1
        }, 1000);                 
        $("#stories, #graph").empty();
        $(".navButs").animate({
            opacity: 1
        }, 2000);  
        $("#forms").slideDown(2000);    
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
        $("#forms").animate({
            opacity: 1
        }, 1000);            
        $(".navButs").animate({
            opacity: 1
        }, 2000);            
        $("#forms").slideDown(2000); 

        $('.tabs #tab1').show().siblings().hide();

        $("[href='#tab1']").parent('li').addClass('active').siblings().removeClass('active');               
    });
});
