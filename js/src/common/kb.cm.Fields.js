// include Backbone events handler
_.extend(KB.Fields, Backbone.Events);
// include custom functions
_.extend(KB.Fields, {
    fields: {}, // 'collection' of fields
    /**
     * Register a fieldtype
     * @param id string Name of field
     * @param object field object
     */
    addEvent: function () {
        this.listenTo(KB, 'kb:ready', this.init);
        this.listenTo(this, 'newModule', this.newModule);


    },
    register: function (id, object) {
        // Backbone Events for field object
        _.extend(object, Backbone.Events);
        this.fields[id] = object;

    },

    init: function () {
        var that = this;
        console.log('init');
        _.each(_.toArray(this.fields), function (object) {
            // call init method if available
            if (object.hasOwnProperty('init')) {
                object.init();
            }

            // call field objects init method on 'update' event
            // fails gracefully if there is no update method
            object.listenTo(that, 'update', object.update);

            object.listenTo(that, 'frontUpdate', object.frontUpdate);

        });

    },

    newModule:function(object){
        _K.log('new Module added for Fields');
        var that = this;
        // call field objects init method on 'update' event
        // fails gracefully if there is no update method
        object.listenTo(this, 'update', object.update);
        object.listenTo(this, 'frontUpdate', object.frontUpdate);

        setTimeout(function(){
            that.trigger('update');
            console.log('triggered');
        },750);
    },

    /**
     * Get method
     * @param id string fieldtype
     * @returns mixed field object or null
     */
    get: function (id) {
        if (this.fields[id]) {
            return this.fields[id];
        } else {
            return null;
        }
    }
});
KB.Fields.addEvent();