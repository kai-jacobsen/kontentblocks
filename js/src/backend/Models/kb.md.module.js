KB.Backbone.ModuleModel = Backbone.Model.extend({
	idAttribute: 'instance_id',
    initialize:function(){
        this.listenTo(this, 'change:area', this.subscribeToArea);
        this.listenTo(this, 'change:area', this.areaChanged);

    },
    destroy: function() {
        this.unsubscribeFromArea();
        this.stopListening(); // remove all listeners
    },
    setArea: function(area){
        this.set('area', area);
    },
    areaChanged: function() {
        // @see backend::views:ModuleView.js
        var envVars = this.get('envVars');
        envVars.areaContext = this.get('areaContext');
        this.view.updateModuleForm();
   },
    subscribeToArea: function(model, value){
        var area;
        area = KB.Areas.get(value);
        area.view.addModuleView(model.view);
    },
    unsubscribeFromArea: function(){
        var area;
        area = KB.Areas.get(this.get('area'));
        area.view.removeModule(this);
    }
});