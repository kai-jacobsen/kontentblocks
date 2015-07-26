var Check = require('common/Checks');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.visible = false;
    this.options = options || {};
    this.Parent = options.parent;
    this.listenTo(KB.Events, 'window.change', this.reposition);

  },
  className: 'kb-inline-control kb-inline--edit-image',
  events: {
    'click': 'openFrame',
    'mouseenter': 'mouseenter',
    'mouseleave': 'mouseleave'
  },
  openFrame: function () {
    this.Parent.openFrame();
  },
  render: function () {
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