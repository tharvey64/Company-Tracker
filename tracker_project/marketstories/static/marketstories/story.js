$(document).ready(function(){
	$.getJSON("/stories/",function(data){
	    var template = $('#storyTemplate').html();
	    Mustache.parse(template);
        var info = Mustache.render(template, data);
        $('#stories').html(info); 	    
	})
});