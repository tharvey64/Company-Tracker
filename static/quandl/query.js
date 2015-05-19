$(document).ready(function(){
    $("#tab2").on("submit", "#searchForm", function(event) {
        $("#loading").css("display", "block");          
        setTimeout(function(){      
        $("#loading").css("display", "none");
        $("#backButton").css("display", "block")       
        $("#graph").css("display", "inline-block"); 
        $("#results").css("display", "block");
        $("#selectorButton").css("display", "block");
        $("h1").slideUp(1500);              
        $("#forms").slideUp(1500);
        }, 4000);               
    });
    $("#tab1").on("submit", "#stockForm", function(event) {
            $("#loading").css("display", "block");          
        setTimeout(function(){ 
                $("#loading").css("display", "none");
            $("#backButton").css("display", "block")       
            $("#graph").css("display", "inline-block"); 
            $("#results").css("display", "block");  
            $("#selectorButton").css("display", "block");
            $("#logout").slideDown(1500);
            $("h1").slideUp(1500);              
            $("#forms").slideUp(1500); 
        }, 4000);       
    });
    $("#backButton").on("click", function(event) { 
        $("#backButton").css("display", "none");       
        $(".returned").css("display", "none");  
        $("#results").css("display", "none"); 
        $("#selectorButton").css("display", "none");        
        $("#stories, #graph").empty();
        $("h1").slideDown(1500); 
        $("#forms").slideDown(1500);    
    }); 
    $("#twitterPath").on("click", function(event){
        $("#stories").css("display", "none");
        $("#graph").css("display", "block");        
    });
    $("#storyPath").on("click", function(event){
        $("#stories").css("display", "block");
        $("#graph").css("display", "none");        
    });    
    $("#graph").on("click", "button.search-result", function(event){
        $("#backButton").css("display", "none");  
        $(".returned").css("display", "none");  
        $("#results").css("display", "none");
        $("#selectorButton").css("display", "none");        
        $("h1").slideDown(1500); 
        $("#forms").slideDown(1500); 

        $('.tabs #tab1').show().siblings().hide();

        $("[href='#tab1']").parent('li').addClass('active').siblings().removeClass('active');               
    });
});
