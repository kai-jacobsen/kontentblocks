var KB = KB || {};

/*
    Simple Get/Set implementation to set and get views
    No magic here
 */
KB.ViewsCollection = function() {
    this.views = {};

    this.add = function(id, view) {
        this.views[id] = view;
        
    };

    this.remove = function(id) {
        var view = this.get(id);
        view.$el.fadeOut(500, function() {
            view.remove();
        });
        delete this.views[id];
    };

    this.get = function(id) {
        if (this.views[id]) {
            return this.views[id];
        }
    };

};