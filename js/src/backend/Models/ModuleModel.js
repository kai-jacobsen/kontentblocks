KB.Backbone.ModuleModel = Backbone.Model.extend({
	idAttribute: 'instance_id',
    initialize:function(){
        this.listenTo(this, 'change:envVars', this.subscribeToArea);
        this.listenTo(this, 'change:envVars', this.areaChanged);

    },
    destroy: function() {
        this.unsubscribeFromArea();
        this.stopListening(); // remove all listeners
    },
    setArea: function(area){
        this.setEnvVar('area', area);
    },
    areaChanged: function() {
        // @see backend::views:ModuleView.js
        //var envVars = this.get('envVars');
        //envVars.areaContext = this.get('areaContext');
        this.view.updateModuleForm();
   },
    subscribeToArea: function(model, value){
        var area;
        area = KB.Areas.get(value.area);
        area.view.addModuleView(model.view);
    },
    unsubscribeFromArea: function(){
        this.areaView.removeModule(this);
    },
    setEnvVar: function(attr, value){
        var ev = _.clone(this.get('envVars'));
        ev[attr] = value;
        this.set('envVars', ev);
    }
});