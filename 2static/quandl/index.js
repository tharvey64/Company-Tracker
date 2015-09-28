// REFACTOR BEFORE YOU ADD ANYTHING ELSE
// Graph Needs An info Bar at the Top That displays information
// about the current state of the graph
// Make Tabes in Left Column to Add Twitter Search
// Make 2 divs in Left Column
$( document ).ready(function(){
    var toolkit = MyApplication.utils;
    var models = MyApplication.models;
    toolkit.renderForms();
    // graphBoxWidth, resizeTimeout
    var graphRelatedItems = {
        '$graphBox': $('#graphBox')
    };
    var loadingImageRendered = toolkit.renderTemplate('#loading-image');
    var stockSearchAjaxTracker = {
        'count': 0,
        'last': 0
    };
    // Check Company Buttons With New Date
    $('#topBox').on('input', 'input[type="date"]', function(event){
        toolkit.buttonDateValidation('.companyButton');
    });
    // Edit Data Set 
    $('#graphInterfaceLeft').on('change','.graphDataRow',function(event){
    // This Event Should Work For twitter too!!!!!
        var options, $target;
        $target = $(event.target);
        options = {
            'show' : {'change':$target.attr('type')==='checkbox', 'value': $target.is(':checked')},
            'fill': {'change':$target.attr('type')==='color', 'value':$target.val()},
            'remove': {'change':$target.attr('type')==='radio', 'value':true}
        };
        // "price should be a variable"
        graphRelatedItems['graph'].dataInterface.updateQwarg("price", this.dataset.name, options);
        graphRelatedItems['graph'].draw(false, toolkit.scrapeDateRange());
        if (options['remove'].change){
            var group = graphRelatedItems['graph'].dataInterface.getCollection("price");
            // Not Flexible!!!!!
            // Try closest
            var $parent = $(event.delegateTarget);
            var title = $parent.children('h4').html();
            // Draw Should look at date range
            toolkit.dataDisplay(group.collection, title, $parent);
        };
    });

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
        serialized = $el.serialize()+'&ajaxCount='+stockSearchAjaxTracker['count'];

        $.get(url, serialized, function(data){
            if (stockSearchAjaxTracker['count'] > data.ajaxCount && data.ajaxCount < stockSearchAjaxTracker['last']) return;
            
            stockSearchAjaxTracker['last'] = data.ajaxCount;
            if (data['error']){
                $('#middleBox > #loadingImage').remove();
                // load some error message
                return;
            };
            // -Next Button does not appear when list length is 0
            // ^^^ This However does not mean that there are no more results
            if (data['list'].length && (data['start']+data['per_page']-1) < data['total_count']){
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

            var htmlString = toolkit.renderTemplate('#search-result', data);
            $middleBox.html(htmlString);
            // Check Company Buttons
            toolkit.buttonDateValidation('.companyButton');
        });
    });

    $('#middleBox').on('click', 'button.companyButton', function(event){
        var fullCode, startDate, input, $el, $target;
        $target = graphRelatedItems['$graphBox'];
        $target.append(loadingImageRendered);
        // Add Tabs
        $el = $(this);
        // GLOBAL
        hold = $el.val();
        fullCode = $el.val().split("/");
        startDate = $('input[name="start_date"]').val();
        input = {
            'company_name': $el.html(),
            'start_date': startDate,
            'source_code': fullCode[0],
            'code': fullCode[1]
        };

        $.get('quandl/current/', input,function(data){
            // Make This Uniform 
            // If data.close.length == 0 return an error
            if (data.error || !data.values){
                $('#loadingImage').remove();
                $('#bottomBox').html('<h2>No Results Found For '+ data.symbol +'</h2>');
                // Return to Prevent Drawing of Graph
                return;
            };
            // MOVE THIS CODE TO NEW FILE
            var options, settings;
            // var settings = {'container':,'padding':,'startDate':,'endDate':,'qwargSet':};
            settings = {
                'container': '#graphBox',
                'padding': 60,
                'startDate': new Date(startDate),
            };
            // Find Another Way to Do This
            graphRelatedItems['graphBoxWidth'] = $target.css('width');

            if (!graphRelatedItems['graph']) {
                graphRelatedItems['graph'] = new models.Graph(settings);
            }
            var graph = graphRelatedItems['graph'];
            var newData = {
                'graph': graph,
                'type': 'price',
                'title': 'Stocks', 
                'userInterface': $('#graphInterfaceLeft'),
                'build': {
                    'parseDate': "%Y-%m-%d %X",
                    'data': data.values,
                    'title':data.symbol,
                    'tag': hold,
                    'fill': '#0000ff',
                    'show': true
                }
            };
            toolkit.addData(newData);
            // Draw Should Take Object
            graph.draw(false, toolkit.scrapeDateRange());
        });
    });

    // I DO NOT LIKE THIS SOLUTION
    // Change This To setTimeout
    // Use Debounce
    $( window ).on('resize', function(event){
        var access = graphRelatedItems;
        if(access.graph && !access.resizeTimeout && (access.$graphBox.css('width') != access.graphBoxWidth)){
            access.graphBoxWidth = access.$graphBox.css('width');
            access.graph.draw(true);
            access.resizeTimeout = setTimeout(function(){
                access.graph.draw(true);
            }, 600);
        };
    });
});