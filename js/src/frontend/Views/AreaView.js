//KB.Backbone.AreaView
var ModuleBrowser = require('frontend/ModuleBrowser/ModuleBrowserExt');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var tplPlaceholder = require('templates/frontend/area-empty-placeholder.hbs');
module.exports = Backbone.View.extend({
  isSorting: false,
  events: {
    'click .kb-area__empty-placeholder': 'openModuleBrowser'
  },
  initialize: function () {
    this.attachedModuleViews = {};
    this.renderSettings = this.model.get('renderSettings');
    this.listenTo(KB.Events, 'editcontrols.show', this.showPlaceholder);
    this.listenTo(KB.Events, 'editcontrols.hide', this.removePlaceholder);
    this.listenToOnce(KB.Events, 'frontend.init', this.setupUi);
    this.listenTo(this, 'kb.module.deleted', this.removeModule);
    this.model.View = this;

  },
  showPlaceholder: function () {
    if (_.size(this.attachedModuleViews) === 0) {
      this.$el.append(tplPlaceholder());
    }
  },
  removePlaceholder: function () {
    this.$('.kb-area__empty-placeholder').remove();
  },
  setupUi: function () {
    // Sortable
    if (this.model.get('sortable')) {
      this.setupSortables();
    }
  },
  openModuleBrowser: function () {
    if (!this.ModuleBrowser) {
      this.ModuleBrowser = new ModuleBrowser({
        area: this
      });
    }
    this.ModuleBrowser.render();
    return this.ModuleBrowser;
  },
  attachModuleView: function (moduleModel) {
    this.attachedModuleViews[moduleModel.get('mid')] = moduleModel; // add module
    this.listenTo(moduleModel, 'change:area', this.removeModule); // add listener

    if (this.getNumberOfModules() > 0) {
      this.removePlaceholder();
      this.$el.removeClass('kb-area__empty');
    }
    this.trigger('kb.module.created', moduleModel);
  },

  getNumberOfModules: function () {
    return _.size(this.attachedModuleViews);
  },
  getAttachedModules: function () {
    return this.attachedModuleViews;
  },
  setupSortables: function () {
    var that = this;
    this.$el.sortable(
      {
        handle: ".kb-module-control--move",
        items: ".module",
        helper: "clone",
        cursorAt: {
          top: 5,
          left: 5
        },
        delay: 150,
        forceHelperSize: true,
        forcePlaceholderSize: true,
        placeholder: "kb-front-sortable-placeholder",
        start: function (e, ui) {
          that.isSorting = true;
        },
        receive: function (e, ui) {
          // model is set in the sidebar areaList single module item
          var module = ui.item.data('module');
          // callback is handled by that view object
          that.isSorting = false;
          module.create(ui);
        },
        stop: function () {
          if (that.isSorting) {
            that.isSorting = false;
            that.resort(that.model)
            KB.Events.trigger('content.change');
          }
        },
        change: function () {
          that.applyClasses();
        }
      });
  },
  removeModule: function (ModuleView) {
    var id = ModuleView.model.get('mid');
    if (this.attachedModuleViews[id]) {
      delete this.attachedModuleViews[id];
    }
    if (this.getNumberOfModules() < 1) {
      this.$el.addClass('kb-area__empty');
      this.showPlaceholder();
    }
  },
  resort: function (area) {
    var serializedData = {};
    serializedData[area.get('id')] = area.View.$el.sortable('serialize', {
      attribute: 'rel'
    });

    return Ajax.send({
      action: 'resortModules',
      postId: area.get('envVars').postId,
      data: serializedData,
      _ajax_nonce: Config.getNonce('update')
    }, function () {
      Notice.notice('Order was updated successfully', 'success');
      area.trigger('area.resorted');
    }, null);
  },
  applyClasses: function () {
    var $parent, prev;
    var $modules = this.AreaView.$el.find('.module');
    $modules.removeClass('first-module last-module repeater');
    for (var i = 0; i < $modules.length; i++) {
      var View = jQuery($modules[i]).data('ModuleView');
      if (_.isUndefined(View)) {
        continue;
      }

      if (i === 0) {
        View.$el.addClass('first-module');
      }

      if (i === $modules.length - 1) {
        View.$el.addClass('last-module');
      }

      // add repeater class if current module equals previous one in type
      if (prev && View.model.get('settings').id === prev) {
        View.$el.addClass('repeater');
      }

      // cache for next iteration for comparison
      prev = View.model.get('settings').id;

      /**
       * copy rel attribute to wrapper, which is the actual sortable element
       */
      $parent = View.$el.parent();
      if ($parent.hasClass('kb-wrap')) {
        $parent.attr('rel', View.$el.attr('rel'));
      }

    }
  }


});