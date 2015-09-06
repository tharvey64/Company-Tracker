function renderForms(){
    var stockSearchTemplate = $("#stock-search").html();
    Mustache.parse(stockSearchTemplate);
    var stockFormRendered = Mustache.render(stockSearchTemplate);
    $('#topBox').html(stockFormRendered);
    
    var today = new Date();
    var dateRangeTemplate = $("#date-range").html();
    Mustache.parse(dateRangeTemplate);
    var dateRangeFormRendered = Mustache.render(dateRangeTemplate,{'today': today.toJSON().substring(0,10)});
    $('#bottomBox').html(dateRangeFormRendered);
};

function buttonDateValidation(tag){
    var to_date, $el;
    var $collection = $(tag);
    var startDate = new Date($('input[name="start date"]').val());
    var endDate = new Date($('input[name="end date"]').val());
    // console.log($('input[name="end date"]').val() instanceof Date);
    $collection.each(function(index, el){
        $el = $(el);
        to_date = new Date(el.dataset.to_date);
        if (to_date.getTime() < startDate.getTime()){
            $el.removeClass('list-group-item-success');
            $el.addClass('list-group-item-danger disabled');
            $el.attr("disabled","disabled");
        }else{
            $el.addClass('list-group-item-success');
            $el.removeClass('list-group-item-danger disabled');
            $el.removeAttr("disabled");
        }
    });
};

// REFACTOR BEFORE YOU ADD ANYTHING ELSE
// use more objects
// Move date out of search form
$( document ).ready(function(){
    var global = (function () {
        return this || (1, eval)('this');
    }());
    
    renderForms();

    var stockSearchAjaxTracker = {
        'count': 0,
        'last': 0
    };
    // This Event Is Expecting One of these Four
    //'input[name="input_string"], #stockForm, #previousResults, #nextResults'
    $('#topBox, #middleBox').on('input submit', '.companySearch', function(event){
        event.preventDefault();
        event.stopPropagation();
        var url, search;
        var $el = $(this);
        if (this.nodeName==='FORM'){
            url = $el.attr('action');
            search = $el.children('input[name="input_string"]').val();
        }else if (this.nodeName==='INPUT'){
            url = $el.parents('#stockForm').attr('action');
            search = $el.val();
        }else{
            // Dont Make The Ajax Request if this is not a form or input tag
            return;
        };
        // Start Animation Here
        $('#middleBox').addClass('loading');
        // Searches for results
        stockSearchAjaxTracker['count'] += 1;
        $.get(url,$el.serialize()+"&ajaxCount="+stockSearchAjaxTracker['count'],function(data){
            if (stockSearchAjaxTracker['count'] > data.ajaxCount && data.ajaxCount < stockSearchAjaxTracker['last']) return;
            
            stockSearchAjaxTracker['last'] = data.ajaxCount;
            // Stop Animation Here
            $('#middleBox').removeClass('loading');

            // -Find A Way to Filter Results
            // ^^^^^ Each Result Has A from_date And to_date prop that says the date range of the info 
            // ^^^^^ I should Include these with the buttons and have the buttons respond based on that
            // -Currently The Next Option Wont be available if the list length is 0
            // -provide some amount of handling for errors
            // console.log(data);
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
            var template = $('#search-result').html();
            Mustache.parse(template);
            var rendered = Mustache.render(template,data);
            $('#middleBox').html(rendered);
            // Check Buttons
            buttonDateValidation('.companyButton');
        });
    });

    $('#middleBox').on('click', 'button', function(event){
        // Start Animation Here
        // This Needs an Id or another div
        $('.rightContent').addClass('loading');
        // Build out right side of page
        // Add Tabs to Right or Left side

        var input = {};
        var $el = $(this);
        var fullCode = $el.val().split("/");
        var startDate = $('input[name="start date"]').val();
        input['company_name'] = $el.html();
        input['start date'] = startDate;
        input['source_code'] = fullCode[0];
        input['code'] = fullCode[1];

        $.get('quandl/current/', input,function(data){
            // Stop Animation
            // Wrap this in a function
            $('.rightContent').removeClass('loading');

            if (!data.close.length){
                // Trigger something here
                // Return to Prevent Graph from Drawing when No prices are returned
                return;
            };
            stockPrices = new global.Qwarg("price", data.close, data.symbol);
            // Make This An Object Literal called 'options'
            stockPrices.qwargParseDate = d3.time.format("%Y-%m-%d %X").parse;
            stockPrices.fill = "blue";
            stockPrices.radiusRange = [5,5]
            stockPrices.show = true;

            graph = new global.Graph(".rightContent");
            graph.endDate = new Date();
            graph.startDate = d3.time.format("%Y-%m-%d").parse(startDate);
            graph.qwargSet[stockPrices.qwargClassString] = stockPrices;
            graph.draw();
        });
    });
    
    $('#bottomBox').on('input', 'input[type="date"]', function(event){
        buttonDateValidation('.companyButton');
    });
});