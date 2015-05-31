//KB.Backbone.Sidebar.AreaDetails.CategoryController
var Templates = require('common/Templates');
var ModuleDragItem = require('frontend/Views/Sidebar/AreaDetails/ModuleDragItem');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar__module-category',
  initialize: function (options) {
    // ModuleListController
    this.controller = options.controller;
    this.$el.append(Templates.render('frontend/sidebar/category-list', this.model.toJSON()));
    this.$list = this.$el.find('ul');
    this.setupModuleItems();
  },
  render: function () {
    return this.$el;
  },
  setupModuleItems: function () {
    var that = this;
    _.each(this.model.get('modules'), function(module){
        var view = new ModuleDragItem({
          model: new Backbone.Model(module),
          listController: that.controller,
          controller: that
        });
      that.$list.append(view.render());
    })
  }
});