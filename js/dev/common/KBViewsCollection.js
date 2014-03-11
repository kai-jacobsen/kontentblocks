/*
 Simple Get/Set implementation to set and get views
 No magic here
 */
KB.ViewsCollection = function () {
    this.views = {};

    this.add = function (id, view) {
        this.views[id] = view;
        KB.trigger('kb:'+view.model.get('class')+':added', view);
    };

    this.ready = function () {
        _.each(this.views, function (view) {
            view.trigger('kb:'+view.model.get('class'), view);
            KB.trigger('kb:'+view.model.get('class')+':loaded', view);
        });
    };

    this.readyOnFront = function () {
        _.each(this.views, function (view) {
            view.trigger('kb:'+view.model.get('class'), view);
            console.log('loadtrigger');
            KB.trigger('kb:'+view.model.get('class')+':loadedOnFront', view);
        });
    };


    this.remove = function (id) {
        var view = this.get(id);
        this.trigger('kb:backend::viewDeleted', view);
        delete this.views[id];
    };

    this.get = function (id) {
        if (this.views[id]) {
            return this.views[id];
        }
    };

    this.filterByModelAttr = function (attr, value) {
        return _.filter(this.views, function (view) {
            return (view.model.get(attr)) === value;
        });
    };

};

_.extend(KB.ViewsCollection.prototype, Backbone.Events);