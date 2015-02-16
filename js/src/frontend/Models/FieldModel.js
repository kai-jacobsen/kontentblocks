KB.Backbone.Frontend.FieldConfigModel = Backbone.Model.extend({
  idAttribute: "uid",
  initialize: function () {
    var module = this.get('baseId'), Model;
    if (module && (Model = KB.Modules.get(module))) {
      this.set('ModuleModel', Model);
    }
    this.listenToOnce(Model, 'remove', this.remove);
    this.setupType();
  },
  setupType: function () {
    var type = this.get('type');
    if (type === 'EditableText'){
      if (!KB.Checks.userCan('edit_kontentblocks')) {
        return;
      }
      new KB.Backbone.Inline.EditableText({
        el: jQuery('*[data-kbfuid="' + this.get('uid') + '"]')[0],
        model: this
      });
    }

    if (type === 'EditableImage'){
      if (!KB.Checks.userCan('edit_kontentblocks')) {
        return;
      }
      new KB.Backbone.Inline.EditableImage({
        el: jQuery('*[data-kbfuid="' + this.get('uid') + '"]')[0],
        model: this
      });
    }
  },
  remove: function(){
    this.collection.remove(this);
  }
});