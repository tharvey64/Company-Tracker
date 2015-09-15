// Rename This
var CollectionInterface = CollectionInterface || {};
(function(extend){

    function DataGroup(options){
        // :parameters:
        // type = price or sentiment (Expand To Ratios Later)
        this.type = options.type;
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
    };
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

    // extend['dataGroup'] = DataGroup;
    // extend['qwarg'] = Qwarg;
// })(Collection);

// // First Iteration of Collection Interface
// var CollectionInterface = {};
// (function(extend, helper){
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
            return false;
        }
    };

    extend['getCollection'] = function(type) {
        return existingGroups[type];
    };
    extend['createCollection'] = function(type) {
        // Check if a collection of this type already exists 
        if (existingGroups.hasOwnProperty(type)) return false; 

        var group = new DataGroup({'type':type}); 
        existingGroups[type] = group;
        return group;
    };
    extend['createQwarg'] = function(options){
        return new Qwarg(options);
    };
    extend['addQwarg'] = function(type, qwarg){
        var collection = existingGroups[type];
        if(collection){
            collection.newDataSet(qwarg);
        }
    };  
    extend['getCollection'] = function(type){
        return existingGroups[type];
    };
    // extend['updateCollection'] = function(type){
    //     // takes stock tag and updates date range
    //     // Updates all qwargs in a collection
    //     // this.createCollection(type)
    // };
    extend['updateQwarg'] = function(type, tag, options){
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
    extend['deleteCollection'] = function(type) {
        delete existingGroups[type];
    };
    extend['deleteQwarg'] = function(type, tag){
        if(getQwarg(type, tag)){
            delete existingGroups[type][tag];
        }
    };
})(CollectionInterface);

var test = CollectionInterface;
// console.log(test.createQwarg({}));
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


