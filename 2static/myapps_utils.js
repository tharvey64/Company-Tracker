MyApplication.utils = MyApplication.utils || {};
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
        startDate = new Date($('input[name="start_date"]').val()) || new Date();
        startDate.setDate(startDate.getDate()-1);
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
        // Change obj_list to the collection obj
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
        var group = options.graph.dataInterface.getCollection(options.type);
        if (!group){
            group = options.graph.dataInterface.createCollection(options.type);
        }
        var q = options.graph.dataInterface.createQwarg(options.build);
        options.graph.dataInterface.addQwarg(options.type, q);
        this.dataDisplay(group.collection, options.title, options["userInterface"]);
    };

    myapp.scrapeDateRange = function scrapDateRange(){
        var dates = $("#leftColumn").find("input.dateRanges");
        var range = [];
        dates.each(function(idx, el){
            // console.log($(el).val());
            var dateString = $(el).val().replace(/-/g, "/");
            range.push(new Date(dateString));   
        });
        return range;
    };
}).apply(MyApplication.utils);