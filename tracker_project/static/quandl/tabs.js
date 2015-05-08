$(document).ready(function(){
    $('.tabs .tab-links a').on('click', function(event){
    	console.log('hi')
        var currentAttrValue = $(this).attr('href');

        $('.tabs ' + currentAttrValue).show().siblings().hide();

        $(this).parent('li').addClass('active').siblings().removeClass('active');
        event.preventDefault();
    });
});