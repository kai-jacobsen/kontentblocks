//KB.Backbone.ModuleModel
module.exports = Backbone.Model.extend({
  idAttribute: 'mid',
  initialize: function(){
    this.subscribeToArea();

  },
  subscribeToArea: function (AreaModel) {
    if (!AreaModel){
      AreaModel = KB.Areas.get(this.get('area'));
    }
    AreaModel.View.attachModuleView(this);
    this.Area = AreaModel;
  },
  //destroy: function () {
  //  var that = this;
  //  KB.Ajax.send({
  //    action: 'removeModules',
  //    instance_id: that.get('instance_id')
  //  }, that.destroyed);
  //},
  dispose: function () {
    this.stopListening()
  }

});