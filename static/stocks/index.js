// REFACTOR BEFORE YOU ADD ANYTHING ELSE
// Graph Needs An info Bar at the Top That displays information
// about the current state of the graph
// Make Tabes in Left Column to Add Twitter Search
// Make 2 divs in Left Column
$( document ).ready(function(){
    var toolkit = MyApplication.utils;
    var presenter = MyApplication.presenter;
    // Set Up Page
    (function($){
        var templateOptions, htmlString;
        templateOptions = {'tag': '#stock-search'};
        htmlString = toolkit.renderTemplate(templateOptions);
        templateOptions = {
            'tag': '#date-range-form',
            'data': {'today':(new Date()).toJSON().substring(0,10)}
        };
        htmlString += toolkit.renderTemplate(templateOptions);
        $("#topBox").html("<div>"+htmlString+"</div>");
    })(jQuery);
    
    // graphBoxWidth, resizeTimeout
    var graphRelatedItems = {
        '$graphBox': $('#graphBox')
    };
    var loadingImageRendered = toolkit.renderTemplate({'tag':'#loading-image'});
    var stockSearchAjaxTracker = {
        'count': 0,
        'last': 0
    };
    var eventElements = {
        '$dateChange': $('#topBox'),
        '$dataInterface': $('#graphInterfaceRight,#graphInterfaceLeft'),
        '$findCompany': $('#topBox, #middleBox'),
        '$getData': $('#middleBox')
    };
    // Check Company Buttons With New Date
    eventElements.$dateChange.on('input', 'input[type="date"]', function(event){
        var range = toolkit.scrapeDateRange();
        if (range[0] && range[1]){
            $('.validDateRequired').prop('disabled',false);
            var options = {
                'tag': '.companyButton',
                'range': range,
                'valid': true
            };
            toolkit.buttonDateValidation(options);
        }
        else{
            // handle invalid date here
            // Needs Message
            $('.validDateRequired').prop('disabled',true);
            var $companyButtons = $('.companyButton');
            $companyButtons.removeClass('list-group-item-success');
            $companyButtons.addClass('list-group-item-danger disabled');
        }
    });
    // Edit Data Set 
    eventElements.$dataInterface.on('change','.graphDataRow',function(event){
        var options, $target, $parent, type;
        $target = $(event.target);
        $parent = $(event.delegateTarget);
        type = $parent.data('type');
        options = {
            'show' : {'change':$target.attr('type')==='checkbox', 'value': $target.is(':checked')},
            'fill': {'change':$target.attr('type')==='color', 'value':$target.val()},
            'remove': {'change':$target.attr('type')==='radio', 'value':true}
        };

        graphRelatedItems['graph'].dataInterface.updateQwarg(type, this.dataset.name, options);
        graphRelatedItems['graph'].draw(false, toolkit.scrapeDateRange());
        if (options['remove'].change){
            var group = graphRelatedItems['graph'].dataInterface.getCollection(type);
            var title = $parent.children('h4').html();
            toolkit.dataDisplay(group, title, $parent);
        };
    });

    // This Event Is Expecting One of these Four
    //'input[name="input_string"], #stockForm, #previousResults, #nextResults'
    eventElements.$findCompany.on('input submit', '.companySearch', function(event){
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
            var htmlString = toolkit.renderTemplate({'tag':'#search-result', 'data':data});
            $middleBox.html(htmlString);
            // Check Company Buttons
            // This Is Not Dry
            var range = toolkit.scrapeDateRange();
            if (range[0] && range[1]){
                var options = {
                    'tag': '.companyButton',
                    'range': range,
                    'valid': true
                };
                toolkit.buttonDateValidation(options);
            }
        });
    });

    eventElements.$getData.on('click', 'button.companyButton', function(event){
        var fullCode, startDate, elementValue, input, $el, $target;
        $target = graphRelatedItems['$graphBox'];
        $target.append(loadingImageRendered);
        // Add Tabs
        $el = $(this);
        // GLOBAL
        var tempData = this.dataset;
        elementValue = $el.val();
        fullCode = $el.val().split("/");
        startDate = $('input[name="start_date"]').val();
        input = {
            'company_name': $el.html(),
            'start_date': startDate,
            'source_code': fullCode[0],
            'code': fullCode[1]
        };

        var graph, settings, options;
        graphRelatedItems['graphBoxWidth'] = $target.css('width');
        if (!graphRelatedItems['graph']) {
            settings = {
                'container': '#graphBox'
            };
            graphRelatedItems['graph'] = new presenter.Graph(settings);
        };
        graph = graphRelatedItems['graph'];
        options = {
            'graph':graphRelatedItems['graph'],
            'type':'price',
            'title':'Stocks',
            '$graphUI': $('#graphInterfaceLeft'),
            'parseDate':"%Y-%m-%d %X",
            'tag': elementValue
        };
        $.get('stocks/current/', input, toolkit.buildCallback(options));
        
        input = {
            'search': '$' + fullCode[1],
            'filter': 'popular'
        };
        options = {
            'graph': graphRelatedItems['graph'],
            'type': 'sentiment',
            'title': 'Twitter',
            '$graphUI': $('#graphInterfaceRight'),
            'parseDate': "%Y-%m-%d %X%Z",
            'tag': '$' + fullCode[1]
        };
        $.post('sentiment/search/random', input, toolkit.buildCallback(options));
        // $.post('twitter/search/random', input, function(data){
        //     console.log(data);
        // });
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
                access.resizeTimeout = undefined;
            }, 600);
        };
    });
});