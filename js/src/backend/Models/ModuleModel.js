KB.Backbone.ModuleModel = Backbone.Model.extend({
  idAttribute: 'mid',
  initialize: function () {
    this.listenToOnce(this, 'change:envVars', this.subscribeToArea);
    this.listenTo(this, 'change:envVars', this.areaChanged);
    this.subscribeToArea();
  },
  destroy: function () {
    this.unsubscribeFromArea();
    this.stopListening(); // remove all listeners
  },
  setArea: function (area) {
    this.setEnvVar('area', area);
  },
  areaChanged: function () {
    // @see backend::views:ModuleView.js
    //var envVars = this.get('envVars');
    //envVars.areaContext = this.get('areaContext');
    this.View.updateModuleForm();
  },
  subscribeToArea: function (AreaModel) {
    if (!AreaModel){
      AreaModel = KB.Areas.get(this.get('area'));
    }
    AreaModel.View.attachModuleView(this);
    this.Area = AreaModel;
  },
  unsubscribeFromArea: function () {
    this.Area.View.removeModule(this);
  },
  setEnvVar: function (attr, value) {
    var ev = _.clone(this.get('envVars'));
    ev[attr] = value;
    this.set('envVars', ev);
  }
});