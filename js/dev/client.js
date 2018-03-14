/*! Kontentblocks DevVersion 2018-03-14 */
window.KBF = {
    groupedCallbacks: {},
    initCallbacks: [],
    registerInitCallback: function(name, fn, scope) {
        var scope = scope || fn;
        if (name === "always") {
            this.initCallbacks.push({
                fn: fn,
                scope: scope
            });
        } else {
            if (!this.groupedCallbacks[name]) {
                this.groupedCallbacks[name] = [];
            }
            this.groupedCallbacks[name].push({
                fn: fn,
                scope: scope
            });
        }
        jQuery(document).ready(function() {
            fn.call(scope);
        });
    },
    fireInitCallbacks: function() {
        _.each(this.initCallbacks, function(callback) {
            callback.fn.call(callback.scope);
        });
    },
    fireNamedCallback: function(id, View) {
        if (this.groupedCallbacks[id]) {
            _.each(this.groupedCallbacks[id], function(callback) {
                callback.fn.call(callback.scope);
            });
        }
    }
};

jQuery(window).on("kb.refresh", function(event) {
    window.KBF.fireInitCallbacks();
});

jQuery(window).on("kb.module-update", function(event, id, View) {
    window.KBF.fireNamedCallback(id, View);
});