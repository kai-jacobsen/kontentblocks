/**
 * Creates the individual module-actions controls
 * like: sortable, delete, update
 */
//KB.Backbone.Frontend.ModuleControlsView
var ModuleEdit = require('./modulecontrols/EditControl');
var ModuleUpdate = require('./modulecontrols/UpdateControl');
var ModuleDelete = require('./modulecontrols/DeleteControl');
var ModuleMove = require('./modulecontrols/MoveControl');

var tplModuleControls = require('templates/frontend/module-controls.hbs');
module.exports = Backbone.View.extend({


  ModuleView: null,
  $menuList: null, // ul item

  initialize: function (options) {
    // assign parent View
    this.ModuleView = options.ModuleView;
    this.renderControls();

    this.EditControl = this.addItem(new ModuleEdit({
      model: this.ModuleView.model,
      parent: this.ModuleView
    }));
    this.UpdateControl = this.addItem(new ModuleUpdate({
      model: this.ModuleView.model,
      parent: this.ModuleView
    }));
    this.DeleteControl = this.addItem(new ModuleDelete({
      model: this.ModuleView.model,
      parent: this.ModuleView
    }));
    this.MoveControl = this.addItem(new ModuleMove({
      model: this.ModuleView.model,
      parent: this.ModuleView
    }));
  },

  renderControls: function () {
    // append wrapper element
    this.ModuleView.$el.append(tplModuleControls({
      model: this.ModuleView.model.toJSON(),
      i18n: KB.i18n.jsFrontend
    }));

    // cache the actual controls $el
    this.$el = jQuery('.kb-module-controls', this.ModuleView.$el);

    //append ul tag, holder for single action items
    this.$menuList = jQuery('<div class="controls-wrap"></div>').appendTo(this.$el);
  },
  addItem: function (view) {
    // actually happens in ModuleView.js
    // this functions validates action by calling 'isValid' on menu item view
    // if isValid render the menu item view
    // see /ModuleMenuItems/ files for action items
    if (view.isValid && view.isValid() === true) {
      var $liItem = jQuery('<div class="controls-wrap-item"></div>').appendTo(this.$menuList);
      var $menuItem = $liItem.append(view.render());
      this.$menuList.append($menuItem);
      return view;
    }
  }

});