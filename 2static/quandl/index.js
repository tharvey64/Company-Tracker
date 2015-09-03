function renderForms(){
    var stockSearchTemplate = $("#stock-search").html();
    Mustache.parse(stockSearchTemplate);
    var today = new Date();
    var rendered = Mustache.render(stockSearchTemplate,{'today': today.toJSON().substring(0,10)});
    $('#topBox').html(rendered);
}

$(document).ready(function(){
    var global = (function () {
        return this || (1, eval)('this');
    }());
    renderForms();

    $('#topBox').on('input', 'input[name="input_string"]', function(event){
        var url = $(this).parents('#stockForm').attr('action');
        // Searches for results
        $.get(url,$(this).serialize(),function(data){
            // Find A Way to Filter Results
            // Add A More Button to Load Next Page Of Results
            var code, name;
            var results = data['list'];
            var htmlString = "<div class='list-group'>";
            var max = results.length;
            // Places the results in an unordered list
            for(var i=0; i<max;i++){
                code = results[i].source_code +"/"+ results[i].code
                name = results[i].name.substr(0,results[i].name.length-1).trim()
                htmlString += "<button type='button' class='list-group-item btn-block' value='"+ code +"'>"+ name +"</button>";
            };
            htmlString += "</div>";
            $('#middleBox').html(htmlString);
        });
    });

    $('#middleBox').on('click', 'button', function(event){
        var input = {};
        var fullCode = $(this).val().split("/");
        var startDate = $('input[name="start date"]').val();
        input['company_name'] = $(this).html();
        input['start date'] = startDate;
        input['source_code'] = fullCode[0];
        input['code'] = fullCode[1];

        $.get('quandl/current/', input,function(data){
            // Wrap this in a function
            console.log(data);
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