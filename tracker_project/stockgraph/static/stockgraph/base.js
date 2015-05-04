$( document ).ready(function() {
	$('#stockForm').on("submit", function(event){
		event.preventDefault();	
		 $.post($(this).attr('action'),
		 	{company: $("[name='company']").val(), csrfmiddlewaretoken: $("[name='csrfmiddlewaretoken']").val()},
		    function(data) {
		        var template = $('#companyTemplate').html();
		        Mustache.parse(template);
		        var info = Mustache.to_html(template, data);
		        $('#results').html(info); 
			}
		)
	})
});