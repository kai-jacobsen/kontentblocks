//KB.Backbone.Frontend.ModuleMove
var ModuleMenuItem = require('frontend/Views/ModuleControls/modulecontrols/ControlsBaseView');
module.exports = ModuleMenuItem.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
    this.$el.append('<div>Draft! Only visible while logged in</div>');
    this.listenTo(this.Parent.model, 'change:state', this.recheck);
    this.recheck(this.Parent.model.get('state'));
  },
  className: 'kb-module-control kb-module-control--draft',
  isValid: function () {
    return true;
  },
  recheck: function(state){
    if (!state.draft){
      this.$el.hide();
    } else{
      this.$el.show();
    }
  }
});