var Check = require('common/Checks');
var Config = require('common/Config');
var Logger = require('common/Logger');
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
    'click': 'syncFieldModel',
    'mouseenter': 'mouseenter',
    'mouseleave': 'mouseleave'
  },
  render: function () {
    //this.Parent.parentView.$el.append(this.$el);
    //this.$el.hide();
  },
  syncFieldModel: function (context) {
    var dfr = this.model.sync(this);
    dfr.done(function(res){
     if(res.success){
       this.model.getClean();
     }
    })
  },
  syncModuleModel: function(){
    this.model.get('ModuleModel').sync(true);
    this.Toolbar.getClean();
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  },
  mouseenter: function () {

  }
});