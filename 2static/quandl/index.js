function renderForms(){
    var stockSearchTemplate = $("#stock-search").html();
    Mustache.parse(stockSearchTemplate);
    var today = new Date();
    var rendered = Mustache.render(stockSearchTemplate,{'today': today.toJSON().substring(0,10)});
    $('#topBox').html(rendered);
};

$( document ).ready(function(){
    var global = (function () {
        return this || (1, eval)('this');
    }());
    renderForms();
    // Tracks Ajax Requests for stock search
    var ajaxCount = 0;
    var lastAjax = 0;

    // Load Animation
    $( document ).ajaxStart(function(){
        console.log(arguments[0]);
        console.log(arguments[0]);
    });
    $( document ).ajaxStop(function(){
        console.log("done");
    });

    $('#topBox, #middleBox').on('input submit', 'input[name="input_string"], #stockForm, #previousResults, #nextResults', function(event){
        event.preventDefault();
        // Start Animation Here
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
        // Searches for results
        ajaxCount += 1;
        $.get(url,$el.serialize()+"&ajaxCount="+ajaxCount,function(data){
            if (ajaxCount > data.ajaxCount && data.ajaxCount < lastAjax) return;
            // Stop Animation Here
            lastAjax = data.ajaxCount;
            // -Find A Way to Filter Results
            // -Currently The Next Option Wont be available if the list length is 0
            // -provide some amount of handling for errors
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
        });
    });

    $('#middleBox').on('click', 'button', function(event){
        // Start Animation Here
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

});