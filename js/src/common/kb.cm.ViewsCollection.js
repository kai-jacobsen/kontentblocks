/*
 Simple Get/Set implementation to set and get views
 No magic here
 */
KB.ViewsCollection = function () {
    this.views = {};
    this.lastViewAdded = null;
    this.add = function (id, view) {

        console.log('add',id);
        if (!this.views[id]){
            this.views[id] = view;
            KB.trigger('kb:'+view.model.get('class')+':added', view);
            this.lastViewAdded = view;
        }
        console.log(this);
        return view;

    };

    this.ready = function () {
        _.each(this.views, function (view) {
            view.trigger('kb:'+view.model.get('class'), view);
            KB.trigger('kb:'+view.model.get('class')+':loaded', view);
        });
        KB.trigger('kb:ready');
    };

    this.readyOnFront = function () {
        _.each(this.views, function (view) {
            view.trigger('kb:'+view.model.get('class'), view);
            KB.trigger('kb:'+view.model.get('class')+':loadedOnFront', view);
        });
        KB.trigger('kb:ready');
    };


    this.remove = function (id) {
        var V = this.get(id);
        console.log('remove', V);

        V.Area.trigger('kb.module.deleted', V);
        this.trigger('kb.modules.view.deleted', V);

//        view.removeControls();
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