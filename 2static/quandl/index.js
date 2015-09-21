(function(){
    var myapp = this;
    myapp.renderTemplate = function renderTemplate(tag, templateData){
        var template = $(tag).html();
        Mustache.parse(template);
        return Mustache.render(template,templateData);
    };

    myapp.renderForms = function renderForms(){
        var htmlString;
        htmlString = myapp.renderTemplate('#stock-search');
        // $('#topBox').html(htmlString);
        var today = new Date();
        htmlString += myapp.renderTemplate('#date-range', {'today': today.toJSON().substring(0,10)});
        $('#topBox').html(htmlString);
    };

    myapp.buttonDateValidation = function buttonDateValidation(tag){
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

    myapp.dataDisplay = function dataDisplay(obj_list, title, $target){
        var templateSchema = {};
        templateSchema['title'] = title;
        templateSchema['listId'] = title.toLowerCase() + 'Table';  
        templateSchema['content'] = [];
        for (var idx = obj_list.length; idx--;){
            var current = {
                'color': obj_list[idx]['fill'],
                'name': obj_list[idx]['title'],
                'tag': obj_list[idx]['tag'],
                'visible': obj_list[idx]['show']
            };
            templateSchema['content'].push(current);
        };
        var rendered = myapp.renderTemplate('#graph-data-table', templateSchema);
        $target.html(rendered);
    };

    myapp.addData = function addData(options){
        var group = options.graph.dataInterfaceTest.getCollection(options.type);
        if (!group){
            group = options.graph.dataInterfaceTest.createCollection(options.type);
        }
        var q = options.graph.dataInterfaceTest.createQwarg(options.build);
        options.graph.dataInterfaceTest.addQwarg(options.type, q);
        this.dataDisplay(group.collection, options.title, options["userInterface"]);
    };
}).apply(MyApplication);

// REFACTOR BEFORE YOU ADD ANYTHING ELSE
$( document ).ready(function(){
    var global = (function () {
        return this || (1, eval)('this');
    }());
    
    MyApplication["renderForms"]();
    // graphBoxWidth, resizeInterval
    var graphRelatedItems = {
        '$graphBox': $('#graphBox')
    };
    var loadingImageRendered = MyApplication["renderTemplate"]('#loading-image');
    var stockSearchAjaxTracker = {
        'count': 0,
        'last': 0
    };
    // Edit Data Set 
    $('#graphInterfaceLeft').on('change','.graphDataRow',function(event){
    // This Event Should Work For twitter too!!!!!
        var options, $target;
        options = {};
        $target = $(event.target);
        if ($target.attr('type')==='checkbox'){
            options['show'] = ($target.is(':checked') ? true:false);
        }
        else if ($target.attr('type')==='color'){
            options['fill'] = $target.val();
        }
        else if ($target.attr('type')==='radio'){
            options['delete'] = true;
        }
        else{
            return false;
        }
        // "price should be a variable"
        graphRelatedItems['graph'].dataInterfaceTest.updateQwarg("price", this.dataset.name, options);
        var group = graphRelatedItems['graph'].dataInterfaceTest.getCollection("price");
        // Not Flexible!!!!!
        // Try closest
        var $target = $(event.delegateTarget);
        var title = $target.children('h4').html();
        // Draw Should look at date range
        MyApplication["dataDisplay"](group, title, $target);
        var startDate = new Date($('#dateRangeForm').find('input[name="start date"]').val());
        graphRelatedItems['graph'].draw(false, startDate);
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

            var htmlString = MyApplication["renderTemplate"]('#search-result', data);
            $middleBox.html(htmlString);
            // Check Company Buttons
            MyApplication["buttonDateValidation"]('.companyButton');
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
        startDate = $('input[name="start date"]').val();
        input = {
            'company_name': $el.html(),
            'start date': startDate,
            'source_code': fullCode[0],
            'code': fullCode[1]
        };

        $.get('quandl/current/', input,function(data){
            // Make This Uniform 
            // If data.close.length == 0 return an error
            if (data.error || !data.close.length){
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
                graphRelatedItems['graph'] = new MyApplication["Graph"](settings);
            }
            var graph = graphRelatedItems['graph'];
            var newData = {
                'graph': graph,
                'type': 'price',
                'title': 'Stocks', 
                'userInterface': $('#graphInterfaceLeft'),
                'build': {
                    'parseDate': "%Y-%m-%d %X",
                    'data': data.close,
                    'title':data.symbol,
                    'tag': hold,
                    'fill': '#0000ff',
                    'show': true
                }
            };
            MyApplication["addData"](newData);
            // Draw Should Take Object
            graph.draw(false, new Date(startDate));
        });
    });
    // Check Company Buttons With New Date
    $('#topBox').on('input', 'input[type="date"]', function(event){
        MyApplication["buttonDateValidation"]('.companyButton');
    });

    // I DO NOT LIKE THIS SOLUTION
    // Change This To setTimeout
    // Use Debounce
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
            }, 2000);
        };
    });
});