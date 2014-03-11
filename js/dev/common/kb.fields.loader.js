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
    register: function (id, object) {
        // Backbone Events for field object
        _.extend(object, Backbone.Events);
        this.fields[id] = object;

        // call init method if available
        if (object.hasOwnProperty('init')) {
            object.init();
        }

        // call field objects init method on 'update' event
        // fails gracefully if there is no update method
        object.listenTo(this, 'update', object.update);

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