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
  },
  derender: function(){
    this.$el.detach();
  },
  rerender:function(){
    var that = this;
    this.ModuleView.$el.append(this.$el);
    _.defer(function(){
      that.reposition();
    })
  },
  render: function () {
    // append wrapper element
    this.ModuleView.$el.append(tplModuleControls({
      model: this.ModuleView.model.toJSON(),
      i18n: KB.i18n.jsFrontend
    }));

    // cache the actual controls $el
    this.$el = jQuery('[data-kb-mcontrols="'+ this.model.get('mid') +'"]', this.ModuleView.$el);
    console.log(this.$el);
    //append ul tag, holder for single action items
    this.$menuList = this.$('.kb-controls-wrap');

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
  addItem: function (view) {
    // actually happens in ModuleView.js
    // this functions validates action by calling 'isValid' on menu item view
    // if isValid render the menu item view
    // see /ModuleMenuItems/ files for action items
    if (view.isValid && view.isValid() === true) {
      //var $liItem = jQuery('<div class="kb-controls-wrap-item"></div>').appendTo(this.$menuList);
      this.$menuList.append(view.render());
      view.listenToOnce(this, 'controls.remove', view.remove);
      //this.$menuList.append($menuItem);
      return view;
    }
  },
  dispose: function () {
    this.trigger('controls.remove');
    this.remove();
  },
  reposition: function () {
    var elpostop, elposleft, mSettings, submodule, pos, height;
    elpostop = 0;
    elposleft = 0;
    mSettings = this.model.get('settings');
    submodule = this.model.get('submodule');
    pos = this.ModuleView.$el.offset();
    height = this.ModuleView.$el.height();

    if (mSettings.controls && mSettings.controls.toolbar) {
      pos.top = mSettings.controls.toolbar.top;
      pos.left = mSettings.controls.toolbar.left;
    }

    // small item with enough space above
    // position is at top outside of the element (headlines etc)
    if (this.ModuleView.$el.css('overflow') !== 'hidden' && pos.top > 60 && height < 119) {
      elpostop = -25;
    }

    // enough space on the left side
    // menu will be rendered vertically on the left
    if (this.ModuleView.$el.css('overflow') !== 'hidden' && pos.left > 100 && height > 120 && this.ModuleView.$el.class) {
      elpostop = 0;
      elposleft = -30;
      this.ModuleView.$el.addClass('kb-module-nav__vertical');
    }

    if (pos.top < 20) {
      elpostop = 10;
    }

    if (elpostop == 0) {
      elpostop = 20;
    }

    if (elposleft == 0) {
      elposleft = 20;
    }

    if (submodule) {
      elpostop = elpostop + 50;
    }
    this.$el.css({'top': elpostop + 'px', 'left': elposleft});
  }

});