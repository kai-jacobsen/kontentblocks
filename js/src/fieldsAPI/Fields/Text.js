KB.FieldsAPI.Text = function (config) {
    var defaults;

    defaults = {
        std: 'some textvalue',
        label: 'Field label',
        description: 'A description',
        value: '',
        key: null
    };

    this.templatePath = 'fields/Text';

    this.config = _.defaults(config, defaults);
    this.baseId = this.prepareBaseId();
};

_.extend(KB.FieldsAPI.Text.prototype, {


    prepareBaseId: function(){
        return this.config.moduleId + '[' + this.config.fieldKey + ']';
    },
    render: function(index){
        return KB.Templates.render(this.templatePath, {config: this.config, baseId: this.baseId, index:index});
    },
    setValue: function(value){
        this.config.value = value;
    }

});

KB.FieldsAPI.register('text', KB.FieldsAPI.Text);



