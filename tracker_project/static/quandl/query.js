$(document).ready(function(){
	$('#stockForm, #searchForm').on('submit', function(event) {
		event.preventDefault();
			$('#loading').css("display", "block");			
		setTimeout(function(){ 
			$('#loading').css("display", "none");
			$('.btn').css('display', 'block')		
			$('#graph').css("display", "inline-block");	
            $('#stories').css("display", "inline-block");             
            $('#results').css("display", "block");	
            $("h1").slideUp(1500);             	
			$("#forms").slideUp(1500); 
		}, 4000);		
	});
	$('#twitterForm').on('submit', function(event) {
		event.preventDefault();
			$('#loading').css("display", "block");			
		setTimeout(function(){ 
			$('#loading').css("display", "none");
			$('.btn').css('display', 'block')
            $('#postedSearch').css("display", "block");  
            $('#results').css("display", "block");              
			$("h1").slideUp(1500); 
			$("#forms").slideUp(1500); 
		}, 3000);		
	});	
	$('.btn').on('click', function(event) {	
		$('.tooltip').empty()
		$('.btn').css('display', 'none');		
		$('.returned').css("display", "none");	
        $('#results').css("display", "none");  
		$("h1").slideDown(1500); 
		$("#forms").slideDown(1500); 	
	});	
});