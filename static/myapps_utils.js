MyApplication.utils = MyApplication.utils || {};
(function(utils){
    utils.renderTemplate = function renderTemplate(options){
        var template = $(options.tag).html();
        Mustache.parse(template);
        return Mustache.render(template, options.data);
    };
    // Consider Changing the Way These Are Implemented
    utils.buttonDateValidation = function buttonDateValidation(options){
        var dateRange, to_date, validDate, $el, $collection;
        $collection = $(options.tag);
        validDate = options.valid;
        dateRange = options.range;

        var startDate, endDate;

        if (validDate) {
            startDate = dateRange[0];
            startDate.setDate(startDate.getDate()-1);
            // var endDate = ;
        }
        $collection.each(function(index, el){
            $el = $(el);
            to_date = new Date(el.dataset.to_date.replace(/-/g,"/"));
            if (!validDate || to_date.getTime() < startDate.getTime()){
                $el.removeClass('list-group-item-success');
                $el.addClass('list-group-item-danger disabled');
                $el.prop('disabled',true);
            }else{
                $el.addClass('list-group-item-success');
                $el.removeClass('list-group-item-danger disabled');
                $el.prop('disabled',false);
            };
        });
    };

    // Html Location Referenced
    utils.dataDisplay = function dataDisplay(dataGroup, title, $target){
        var templateSchema = {};
        var collection = dataGroup.collection;
        templateSchema['title'] = title;
        templateSchema['tableId'] = title.toLowerCase() + 'Table';  
        templateSchema['content'] = [];

        for (var idx = collection.length; idx--;){
            var current = {
                'color': collection[idx]['fill'],
                'name': collection[idx]['title'],
                'tag': collection[idx]['tag'],
                'visible': collection[idx]['show']
            };
            templateSchema['content'].push(current);
        };
        var rendered = utils.renderTemplate({'tag':'#graph-data-table', 'data':templateSchema});
        $target.data('type', dataGroup.type);
        $target.html(rendered);
    };

    utils.addData = function addData(options){
        var graph = options.graph;
        var type = options.type;
        var group = graph.dataInterface.getCollection(type);
        if (!group){
            group = graph.dataInterface.createCollection(type);
        }
        var qwarg = graph.dataInterface.createQwarg(options.build);
        graph.dataInterface.addQwarg(type, qwarg);
        
        utils.dataDisplay(group, options.title, options.$graphUI);
    };

    utils.validateDateFormat = function validateDateFormat(dateString){
        var checkDate;
        var pattern = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
        //Replacing dashes makes dateString more predictable
        dateString = dateString.replace(/-/g, "/");
        if (pattern.test(dateString)){
            checkDate = new Date(dateString);
            if (checkDate < Date.now()){
                return true;
            }
        }
        return false;
    };
    // Html Location Referenced
    utils.scrapeDateRange = function scrapeDateRange(){ 
        var dates = $("#leftColumn").find("input.dateRanges");
        var range = [];
        dates.each(function(idx, el){
            var dateString = $(el).val();
            if (utils.validateDateFormat(dateString)){
                range.push(new Date(dateString.replace(/-/g, "/")));   
            }
            else{
                range.push(false);
            }
        });
        return range;
    };
    // Html Location Referenced
    utils.buildCallback = function buildCallback(options){
        var newData;
        newData = {
            'graph': options.graph,
            'type': options.type,
            'title': options.title, 
            '$graphUI': options.$graphUI
        };
        return function callback(data){
            
            if (data.error || !data.values){
                // Pass These Elements To The Function
                $('#loadingImage').remove();
                $('#bottomBox').html('<h2>No Results Found For '+ data.search+'</h2>');
                // Return to Prevent Drawing of Graph
                console.log("search",data.search);
                console.log("type", options.type);
                console.log("data", data);
                return;
            };

            newData['build'] = {
                'parseDate': options.parseDate,
                'data': data.values,
                'title': data.search,
                'tag': options.tag,
                'fill': options.fill || '#0000ff',
                'show': true
            };
            utils.addData(newData);
            // Draw Should Take Object
            options.graph.draw(false, utils.scrapeDateRange());
        };
    };

})(MyApplication.utils);