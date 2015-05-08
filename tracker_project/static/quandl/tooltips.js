// https://css-tricks.com/bubble-point-tooltips-with-css3-jquery/
(function( $ ) {

  // Create plugin
  $.fn.tooltips = function(el) {

    var $tooltip,
      $body = $('body'),
      $el;

    // Ensure chaining works
    return this.each(function(i, el) {

      $el = $(el).attr("data-tooltip", i);
      // $el.attr('class')
      // el.__data__[1]
      // Make DIV and append to page 
      var $tooltip = $('<div class="tooltip" data-tooltip="' + i + '">' + el.__data__[0] + '<div class="arrow"></div></div>').appendTo("body");

      // Position right away, so first appearance is smooth
      // The above statement is False 
      
      // var linkPosition = $el.position();

      // $tooltip.css({
      //   top: linkPosition.top - $tooltip.outerHeight() - 13,
      //   left: linkPosition.left - ($tooltip.width()/2)
      // });

      $el
      // Get rid of yellow box popup
      .removeAttr("title")

      // Mouseenter
      .hover(function() {

        $el = $(this);

        $tooltip = $('div[data-tooltip=' + $el.data('tooltip') + ']');

        // Reposition tooltip, in case of page movement e.g. screen resize                 
        var linkPosition = $el.position();

        $tooltip.css({
          top: linkPosition.top - $tooltip.outerHeight() - 13,
          left: linkPosition.left - ($tooltip.width()/2)
        });

        // Adding class handles animation through CSS
        $tooltip.addClass("active");

        // Mouseleave
      }, function() {

        $el = $(this);

        // Temporary class for same-direction fadeout
        $tooltip = $('div[data-tooltip=' + $el.data('tooltip') + ']').addClass("out");

        // Remove all classes
        setTimeout(function() {
          $tooltip.removeClass("active").removeClass("out");
          }, 300);

        });

      });

    }

})(jQuery);