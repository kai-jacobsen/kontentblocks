var KB = KB || {};

KB.ModuleModel = Backbone.Model.extend({
    idAttribute: 'instance_id',
    save:function(model){
        console.log(model.get('editable'));
    }
});