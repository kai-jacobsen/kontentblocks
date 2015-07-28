var Check = require('common/Checks');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.visible = false;
    this.options = options || {};
    this.Parent = options.parent;
  },
  className: 'kb-inline-control kb-inline--edit-text',
  events: {
    'click': 'focusEditor',
    'mouseenter': 'mouseenter',
    'mouseleave': 'mouseleave'
  },
  focusEditor: function (e) {
    if (!this.Parent.editor){
      this.Parent.activate(e);
    }
  },
  render: function () {
    return this.$el;
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  },
  mouseenter: function () {
    this.Parent.$el.addClass('kb-field--outline');
    _.each(this.model.get('linkedFields'), function(linkedModel){
      linkedModel.FieldView.$el.addClass('kb-field--outline-link');
    })
  },
  mouseleave: function(){
    this.Parent.$el.removeClass('kb-field--outline');
    _.each(this.model.get('linkedFields'), function(linkedModel){
      linkedModel.FieldView.$el.removeClass('kb-field--outline-link');
    })
  }
});