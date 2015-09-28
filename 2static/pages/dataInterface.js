// Refactor Graph.js First
MyApplication.models = MyApplication.models || {};
(function(models){
    models.Interface = function Interface(exposed, container){
        exposed = exposed || {};
        container = container || {};

        // These will be data within DataGroup
        function Qwarg(options){
            // add min/max that updates on init or data update
            this.tag = options.tag;
            this.title = options.title;
            this.data = options.data;
            // string representing expected date format
            this.parseDate = options.parseDate;
            this.fill = options.fill || "#000000";
            this.show = options.show || false;
        };
        Qwarg.prototype.findQwargRange = function(key){
            var high, low;
            high = low = this.data[0];

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

        function DataGroup(options){
            // :parameters:
            // type = price or sentiment (Expand To Ratios Later)
            // add property that specifies what graph method 
            // to use when plotting this DataGroup
            this.type = options.type;
            this.title = options.title;
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

                currentSet = temp.findQwargRange(key);
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

        // Replace With Lodash
        // Most Of this Could be Replaced with Lodash
        function getQwarg(type, tag){
            var group, location;
            group = container[type];
            if(group){
                location = group.searchCollection(tag);
                if (location === -1) return false;
                return group.collection[location];
            }
            else {
                return false;
            }
        };
        // Some Of this Might Be Presenter Logic
        exposed['allGroups'] = function(){
            return container;
        };
        exposed['getKeys'] = function(){
            keys = [];
            for(prop in container){
                keys.push(prop);
            }
            return keys;
        };
        // Rename
        exposed['getCollection'] = function(type){
            return container[type];
        };
        // Rename
        exposed['createCollection'] = function(type){
            // Check if a collection of this type already exists 
            if (container.hasOwnProperty(type)) return false; 

            var group = new DataGroup({'type':type}); 
            container[type] = group;
            return group;
        };
        exposed['createQwarg'] = function(options){
            return new Qwarg(options);
        };
        exposed['addQwarg'] = function(type, qwarg){
            var collection = container[type];
            if(collection){
                collection.newDataSet(qwarg);
            }
        };
        // exposed['updateCollection'] = function(type){
        //     // takes stock tag and updates date range
        //     // Updates all qwargs in a collection
        //     // this.createCollection(type)
        // };
        exposed['updateQwarg'] = function(type, tag, options){
            var target, group, location;
            target = getQwarg(type, tag);
            if (!target) return false;
            if (options['remove'].change === true){
                exposed['deleteQwarg'](type, tag);
                return true;
            }
            // Color Changes, Show/Hide, data updates
            // iterates over options setting the values for the qwarg
            for (var item in options){
                if (item === 'remove' || options[item].change === false){
                    continue;
                }
                else{
                    target[item] = options[item].value;
                };
            };
            return true;
        };
        // Should The Delete Methods Be Exposed
        exposed['deleteCollection'] = function(type) {
            delete container[type];
        };
        exposed['deleteQwarg'] = function(type, tag){
            if (!container[type]) return false;
            var idx = container[type].searchCollection(tag);
            if(idx !== -1){
                container[type].collection.splice(idx,1);
            }
        };

        return exposed;
    };
})(MyApplication.models);