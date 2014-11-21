KB.Backbone.ModuleDefinition = Backbone.Model.extend({
    initialize: function () {
        var that = this;
        this.id = (function () {
            if (that.get('settings').category === 'template') {
                return that.get('instance_id');
            } else {
                return that.get('settings').class;
            }
        }());
    }
});