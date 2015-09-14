// Rename This
var Collection = {};
(function(namespace){
    // needs Function That Builds D3 scales
    // Needs to Store range
    // function Scale(scaleType){
    //     this.scaleType = scaleType;
    //     this.low;
    //     this.high;
    // };
    // Scale.prototype.getScale = function(range){
    //     return this.scaleType.range(range);
    // };
    function DataGroup(options){
        // :parameters: 
        // type = price or sentiment (Expand To Ratios Later)
        this.type = options.type;
        // Consider makeing collection an object literal
        this.collection = options.collection || [];
    };
    DataGroup.prototype.searchCollection = function(tag){
        for (var idx = this.collection.length; idx--;){
            if(this.collection[idx].tag === tag){
                return idx;
            }
        };
        return -1;
    };
    DataGroup.prototype.newDataSet = function(qwarg){
        var check = this.searchCollection(qwarg.tag);
        if (check === -1){
            this.collection.push(qwarg);
            return true;
        }
        else if (qwarg.tag){
            this.collection[check] = qwarg;
            return true;
        }
        return false;
    };
    DataGroup.prototype.getCollectionRange = function(key, all, undefined){
        // Iterates over datasets in the collection, except datasets that have show=false,
        // to determine the lowest and highest values in the entire collection.
        // If parameter show=False this ignores datasets that have show=False.
        // The Expectation is that these will be numeric values

        var max, min, currentSet, temp;
        for (var i=this.collection.length; i--;){
            temp = this.collection[i];
            if (!all && !temp.show) continue;

            currentSet = temp.findDataRange(key);
            // console.log(i);
            if (max === undefined && min === undefined){
                max = currentSet['high'];
                min = currentSet['low'];
            }
            else{
                if (max < currentSet['high']) max = currentSet['high'];
                if (min > currentSet['low']) min = currentSet['low'];
            }
        };
        return [min,max];
    };

    // These will be data within DataGroup
    function Qwarg(options){
        // add min/max
        this.tag = options.tag;
        this.data = options.data;
        // string representing expected date format
        this.parseDate = options.parseDate;
        // Check hasOwnProperty for show 
        this.fill = options.fill || "black";
        this.show = options.show || false;
    }
    Qwarg.prototype.findDataRange = function(key){
        var high = low = this.data[0];

        for (var idx = this.data.length-1; idx > 0; idx--){
            // console.log(this);
            if (this.data[idx][key] > high[key]){
                high = this.data[idx];
                // console.log('high',this.data[idx]);
            }
            else if (this.data[idx][key] < low[key]){
                low = this.data[idx];
                // console.log('low', this.data[idx]);
            }
        };
        return {'high':high[key],'low':low[key]};
    };

    // Consider What Should be Exposed
    // namespace['scale'] = Scale;
    namespace['dataGroup'] = DataGroup;
    namespace['qwarg'] = Qwarg;
})(Collection);


var CollectionInterface = {};
(function(namespace, helper){
    var existingGroups = {};
    function getQwarg(type, tag){
        var group, location;
        group = existingGroups[type];
        if(group){
            location = group.searchCollection(tag);
            if (location === -1) return false;
            return group.collection[location];
        }
        else {
            return false
        }
    };

    namespace['listGroups'] = function(){
        for(var item in existingGroups){
            console.log(item);
        }
    };
    namespace['createCollection'] = function(type) {
        // consider Splitting this into two methods add and create
        // Check if a collection of this type already exists 
        var existingDataGroup = existingGroups[type];
        if (existingDataGroup) {
            return existingDataGroup; 
        } 
        else {
            // if not, let's create a new instance of it and store it
            var group = new helper['dataGroup']({'type':type}); 
            existingGroups[type] = group;
            return group;
        } 
    };
    namespace['createQwarg'] = function(options){
        return new helper['qwarg'](options);
    };
    namespace['addQwarg'] = function(type, qwarg){
        var collection = existingGroups[type];
        if(collection){
            collection.newDataSet(qwarg);
        }
    };
    // namespace['updateCollection'] = function(type){
    //     // takes stock tag and updates date range
    //     // Updates all qwargs in a collection
    //     // this.createCollection(type)
    // };
    namespace['updateQwarg'] = function(type, tag, options){
        var target, group, location;
        target = getQwarg(type, tag);
        if (!target) return false;
        // Color Changes, Show/Hide, data updates
        // iterates over options setting the values for the qwarg
        for (var item in options){
            target[item] = options[item];
        };
        return true;
    };
    namespace['deleteCollection'] = function(type) {
        delete existingGroups[type];
    };
    namespace['deleteQwarg'] = function(type, tag){
        if(getQwarg(type, tag)){
            delete existingGroups[type][tag];
        }
    };
})(CollectionInterface, Collection);



// console.log(Collection);

// options = {'type': 'price'};
// options['collection'] = [
//     new Qwarg({'show':true, 'data':[{'height':40},{'height':36},{'height':45},{'height':48}]}),
//     new Qwarg({'show':false, 'data':[{'height':4},{'height':6},{'height':73},{'height':91}]}),
//     new Qwarg({'show':true, 'data':[{'height':90},{'height':36},{'height':31},{'height':27}]}),
//     new Qwarg({'show':true, 'data':[{'height':7},{'height':29},{'height':43},{'height':26}]}),
//     new Qwarg({'show':true, 'data':[{'height':47},{'height':3},{'height':9},{'height':89}]}),
//     new Qwarg({'show':false, 'data':[{'height':65},{'height':7},{'height':59},{'height':0}]})
// ];
// m = new Collection['dataGroup'](options);
// console.log(m.getCollectionRange('height', true));


