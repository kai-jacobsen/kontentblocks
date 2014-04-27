KB.FieldsAPI.FieldStdModel = Backbone.Model.extend({});

KB.FieldsAPI.Field = Backbone.View.extend({
    initialize: function (config) {
        this.defaults = this.defaults || {};
        this.config = _.defaults(config, this.defaults);
        this.model = new KB.FieldsAPI.FieldStdModel({value: this.get('std')});
        this.model.view = this;
        this.baseId = this.prepareBaseId();

    },
    get: function (key) {
        if (!_.isUndefined(this.config[key])) {
            return this.config[key];
        } else {
            return null;
        }
    },
    set: function (key, value) {
        this.config[key] = value;
    },
    setValue: function(val){
        this.model.set('value', val);
    },
    prepareBaseId: function () {
        return this.config.moduleId + '[' + this.config.fieldKey + ']';
    }
});