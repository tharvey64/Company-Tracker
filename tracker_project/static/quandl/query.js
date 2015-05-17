$(document).ready(function(){
    $("#tab2").on("submit", "#searchForm", function(event) {
        $("#loading").css("display", "block");          
        setTimeout(function(){      
        $("#logout").css("display", "none");
        $("#loading").css("display", "none");
        $("#backButton").css("display", "block")       
        $("#graph").css("display", "inline-block"); 
        $("#results").css("display", "block");  
        $("h1").slideUp(1500);              
        $("#forms").slideUp(1500);
        }, 4000);               
    });
    $("#tab1").on("submit", "#stockForm", function(event) {
            $("#loading").css("display", "block");          
        setTimeout(function(){ 
            $("#logout").css("display", "none");
            $("#loading").css("display", "none");
            $("#backButton").css("display", "block")       
            $("#graph").css("display", "inline-block"); 
            $("#stories").css("display", "inline-block");             
            $("#results").css("display", "block");  
            $("h1").slideUp(1500);              
            $("#forms").slideUp(1500); 
        }, 4000);       
    });
    $("#twitterForm").on("submit", function(event) {
            $("#loading").css("display", "block");          
        setTimeout(function(){ 
            $("#logout").css("display", "none");
            $("#loading").css("display", "none");
            $("#backButton").css("display", "block");
            $("#results").css("display", "block"); 
            $("#graph").css("display", "inline-block"); 
            $("h1").slideUp(1500); 
            $("#forms").slideUp(1500); 
        }, 3000);       
    }); 
    $("#backButton").on("click", function(event) { 
        $("#backButton").css("display", "none");       
        $(".returned").css("display", "none");  
        $("#results").css("display", "none"); 
        $("#logout").css("display", "block");
        $("#stories, #graph").empty();
        $("h1").slideDown(1500); 
        $("#forms").slideDown(1500);    
    }); 
    $("#graph").on("click", "button.search-result", function(event){
        $("#backButton").css("display", "none");  
        $(".returned").css("display", "none");  
        $("#results").css("display", "none"); 
        $("#logout").css("display", "block");
        $("h1").slideDown(1500); 
        $("#forms").slideDown(1500); 

        $('.tabs #tab1').show().siblings().hide();

        $("[href='#tab1']").parent('li').addClass('active').siblings().removeClass('active');               
    });
});
