$(document).ready(function(){
	$('#stockForm').on('submit', function(event) {
		event.preventDefault();
			$('#loading').css("display", "block");			
		setTimeout(function(){ 
			$('#loading').css("display", "none");
			$('.btn').css('display', 'block')		
			$('.returned').css("display", "inline-block");			
			$("#forms").slideUp(1500); 
		}, 4000)		
	})
	$('#twitterForm').on('submit', function(event) {
		event.preventDefault();
			$('#loading').css("display", "block");			
		setTimeout(function(){ 
			$('#loading').css("display", "none");
			$('.btn').css('display', 'block')		
			$('#postedSearch').css("display", "inline-block");	
			$("h1").slideUp(2000); 
			$("#forms").slideUp(2000); 
		}, 3000)		
	})	
	$('.btn').on('click', function(event) {	
		$('.btn').css('display', 'none');		
		$('.returned').css("display", "none");	
		$("h1").slideDown(2000); 
		$("#forms").slideDown(2000); 	
	})	
});