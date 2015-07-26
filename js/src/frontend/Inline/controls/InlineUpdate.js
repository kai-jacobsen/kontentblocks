var Check = require('common/Checks');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.visible = false;
    this.options = options || {};
    this.Parent = options.parent;
    if (this.isValid()) {
      this.render();
    }
  },
  className: 'kb-inline-control kb-inline--update',
  events: {
    'click': 'syncModel',
    'mouseenter': 'mouseenter',
    'mouseleave': 'mouseleave'
  },
  focusEditor: function (e) {
    if (!this.Parent.editor){
      this.Parent.activate(e);
    }
  },
  render: function () {
    //this.Parent.parentView.$el.append(this.$el);
    //this.$el.hide();
  },
  syncModel: function(){
    this.model.get('ModuleModel').sync(true);
    this.Toolbar.getClean();
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  },
  mouseenter: function () {

  }
});