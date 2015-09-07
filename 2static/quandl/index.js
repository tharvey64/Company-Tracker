function renderTemplate(tag, templateData){
    var template = $(tag).html();
    Mustache.parse(template);
    return Mustache.render(template,templateData);
}
function renderForms(){
    var htmlString;
    htmlString = renderTemplate('#stock-search');
    $('#topBox').html(htmlString);

    var today = new Date();
    htmlString = renderTemplate('#date-range', {'today': today.toJSON().substring(0,10)});
    $('#bottomBox').html(htmlString);
};

function buttonDateValidation(tag){
    var startDate, to_date, $el, $collection;
    startDate = new Date($('input[name="start date"]').val()) || new Date();
    $collection = $(tag);
    // var endDate = new Date($('input[name="end date"]').val());

    $collection.each(function(index, el){
        $el = $(el);
        to_date = new Date(el.dataset.to_date);
        if (to_date.getTime() < startDate.getTime()){
            $el.removeClass('list-group-item-success');
            $el.addClass('list-group-item-danger disabled');
            $el.attr('disabled','disabled');
        }else{
            $el.addClass('list-group-item-success');
            $el.removeClass('list-group-item-danger disabled');
            $el.removeAttr('disabled');
        };
    });
};

// REFACTOR BEFORE YOU ADD ANYTHING ELSE
$( document ).ready(function(){
    var global = (function () {
        return this || (1, eval)('this');
    }());
    
    renderForms();
    // polluting the fucking namespace
    // graphBoxWidth, resizeInterval
    var graphRelatedItems = {
        '$graphBox': $('#graphBox')
    };
    var $graphBox = $('#graphBox');
    var loadingImageRendered = renderTemplate('#loading-image');
    var stockSearchAjaxTracker = {
        'count': 0,
        'last': 0
    };
    // This Event Is Expecting One of these Four
    //'input[name="input_string"], #stockForm, #previousResults, #nextResults'
    $('#topBox, #middleBox').on('input submit', '.companySearch', function(event){
        event.preventDefault();
        event.stopPropagation();

        var url, search, serialized, $el, $middleBox;
        
        $el = $(this);
        if ($el.is('form')){
            url = $el.attr('action');
            search = $el.children('input[name="input_string"]').val();
        }else if ($el.is('input')){
            url = $el.parents('#stockForm').attr('action');
            search = $el.val();
        }else{
            // End Callback if tag is not form or input
            return;
        };
        // Start Loading Animation Here
        $middleBox = $('#middleBox');
        $middleBox.append(loadingImageRendered);
        $('.disableOnLoad').attr('disabled','disabled');
        // Searches for results
        stockSearchAjaxTracker['count'] += 1;
        serialized = $el.serialize()+'&ajaxCount='+stockSearchAjaxTracker['count']

        $.get(url, serialized, function(data){
            if (stockSearchAjaxTracker['count'] > data.ajaxCount && data.ajaxCount < stockSearchAjaxTracker['last']) return;
            
            stockSearchAjaxTracker['last'] = data.ajaxCount;
            if (data['error']){
                $('#middleBox > .loadingImage').remove();
                // load some error message
                return;
            };
            // -Next Button does not appear when list length is 0
            // ^^^ This However does not mean that there are no more results
            if (data['list'].length && data['start']+data['per_page']-1 < data['total_count']){
                data['next'] = {
                    'search':search,
                    'page': data['current_page'] + 1
                };
            };
            if (data['start'] > 1){
                data['previous'] = {
                    'search': search,
                    'page': data['current_page'] - 1
                };
            };

            var htmlString = renderTemplate('#search-result', data);
            $middleBox.html(htmlString);
            // Check Company Buttons
            buttonDateValidation('.companyButton');
        });
    });

    $('#middleBox').on('click', 'button', function(event){
        var fullCode, startDate, input, $el, $target;
        $target = graphRelatedItems['$graphBox'];
        $target.append(loadingImageRendered);
        // Add Tabs
        $el = $(this);
        fullCode = $el.val().split("/");
        startDate = $('input[name="start date"]').val();
        input = {
            'company_name': $el.html(),
            'start date': startDate,
            'source_code': fullCode[0],
            'code': fullCode[1]
        };

        $.get('quandl/current/', input,function(data){

            if (!data.close.length){
                $target.html('<h2>No Results Found For '+ data.symbol +'</h2>');
                // Return to Prevent Drawing of Graph
                return;
            };
            var options, stockPrices, settings;
            // Make UI for the Graph
            // Wrap this in a function
            options = {
                'type': 'price',
                'data': data.close,
                'tag': data.symbol,
                'fill': 'blue',
                'show': true
            };
            stockPrices = new global.Qwarg(options);
            // var settings = {'container':,'padding':,'startDate':,'endDate':,'qwargSet':};
            settings = {
                'container': '#graphBox',
                'padding': 60,
                'startDate': new Date(startDate),
                'qwargSet': {}
            };
            settings['qwargSet'][stockPrices.tag] = stockPrices;
            graphRelatedItems['graph'] = new global.Graph(settings);
            graphRelatedItems['graph'].draw();
            // Move This To index.css
            $target.css('background-color','grey');
            graphRelatedItems['graphBoxWidth'] = $target.css('width');
        });
    });
    // Check Company Buttons With New Date
    $('#bottomBox').on('input', 'input[type="date"]', function(event){
        buttonDateValidation('.companyButton');
    });

    // I DO NOT LIKE THIS SOLUTION
    $(window).on('resize', function(event){
        if(graphRelatedItems['graph'] && !graphRelatedItems['resizeInterval'] && (graphRelatedItems['$graphBox'].css('width') != graphRelatedItems['graphBoxWidth'])){
            graphRelatedItems['graphBoxWidth'] = graphRelatedItems['$graphBox'].css('width');
            graphRelatedItems['graph'].draw(true);
            graphRelatedItems['resizeInterval'] = setInterval(function(){
                graphRelatedItems['graph'].draw(true);
            }, 600);
            setTimeout(function(){
                clearInterval(graphRelatedItems['resizeInterval']);
                graphRelatedItems['resizeInterval'] = undefined;
            },2000);
        };
    });
});