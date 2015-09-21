// Build The Event Handlers for The Graph Here
// Refactor Graph.js First
// This Is Not A Graph Interface It Is a Data Interface
// Rename This And Namespace This
(function(){
    var myapp = this;
    myapp.MyInterface = function MyInterface(exposed, container){
        exposed = exposed || {};
        container = container || {};

        (function(extend, existingGroups){
            // These will be data within DataGroup
            function Qwarg(options){
                // add min/max that updates on init or data update
                this.tag = options.tag;
                this.title = options.title;
                this.data = options.data;
                // string representing expected date format
                this.parseDate = options.parseDate;
                // Check hasOwnProperty for show 
                this.fill = options.fill || "#000000";
                this.show = options.show || false;
            };
            Qwarg.prototype.findDataRange = function(key){
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

            // Replace With Lodash
            // Most Of this Could be Replaced with Lodash
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
            extend['allSets'] = function(){
                return existingGroups;
            };
            extend['getKeys'] = function(){
                keys = [];
                for(prop in existingGroups){
                    keys.push(prop);
                }
                return keys;
            };
            extend['getCollection'] = function(type){
                return existingGroups[type];
            };
            extend['createCollection'] = function(type){
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
            // extend['updateCollection'] = function(type){
            //     // takes stock tag and updates date range
            //     // Updates all qwargs in a collection
            //     // this.createCollection(type)
            // };
            extend['updateQwarg'] = function(type, tag, options){
                var target, group, location;
                target = getQwarg(type, tag);
                if (!target) return false;
                if (Object.prototype.hasOwnProperty.call(options,'delete')){
                    if (options['delete'] === true){
                        extend['deleteQwarg'](type, tag);
                        return true;
                    }
                }
                // Color Changes, Show/Hide, data updates
                // iterates over options setting the values for the qwarg
                for (var item in options){
                    if (item === 'delete') continue;
                    target[item] = options[item];
                };
                return true;
            };
            // Should The Delete Methods Be Exposed
            extend['deleteCollection'] = function(type) {
                delete existingGroups[type];
            };
            extend['deleteQwarg'] = function(type, tag){
                if (!existingGroups[type]) return false;
                var idx = existingGroups[type].searchCollection(tag);
                if(idx !== -1){
                    existingGroups[type].collection.splice(idx,1);
                }
            };
        })(exposed, container);

        return exposed;
    };
}).apply(MyApplication);