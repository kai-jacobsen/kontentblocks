//KB.Backbone.PanelModel
module.exports = Backbone.Model.extend({
  idAttribute: 'id',
  attachedFields: {},
  attachField: function (FieldModel) {
    this.attachedFields[FieldModel.id] = FieldModel;
    this.listenTo(FieldModel, 'remove', this.removeAttachedField);
  },
  removeAttachedField: function(FieldModel){
    if (this.attachedFields[FieldModel.id]){
      delete this.attachedFields[FieldModel.id];
    }
  }
});