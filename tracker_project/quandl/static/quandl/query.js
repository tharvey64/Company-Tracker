$(document).ready(function(){
	$('.tab-content').on('submit', function(event) {
		event.preventDefault();
			$('#loading').css("display", "block");			
		setInterval(function(){ 
			$('#loading').css("display", "none");
			$('.mainInfo').css("display", "block");			
			$('.returned').css("display", "inline-block");			
			$("#slideBlock").slideUp(1500); 
			$("#title").animate({'margin-top': '1em'}, {'duration':1500});
		}, 4000)		
	})
});