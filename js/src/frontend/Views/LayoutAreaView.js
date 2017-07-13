//KB.Backbone.AreaView
var AreaView = require('frontend/Views/AreaView');
var ModuleBrowser = require('frontend/ModuleBrowser/ModuleBrowserExt');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var tplPlaceholder = require('templates/frontend/area-empty-placeholder.hbs');
module.exports = AreaView.extend({
  isSorting: false,
  events: {},
  initialize: function () {
    this.attachedModules = {};
    this.renderSettings = this.model.get('renderSettings');
    this.listenTo(KB.Events, 'editcontrols.show', this.showPlaceholder);
    this.listenTo(KB.Events, 'editcontrols.hide', this.removePlaceholder);
    this.listenToOnce(KB.Events, 'frontend.init', this.setupUi);
    this.listenTo(this, 'kb.module.deleted', this.removeModule);
    this.listenTo(this, 'kb.module.created', this.refreshPlaceholder);
    this.model.View = this;
    this.$placeholder = jQuery(tplPlaceholder({i18n: KB.i18n}));
    this.extendElements()
  },
  extendElements: function () {
    var data = this.model.get('layoutData');
    var slots = data.slots;
    if (slots) {
      _.each(slots, function (data, key) {
        if (data.mid && data.mid !== '') {
          var $el = this.$('#' + data.mid);
          $el.attr('data-slot', key);
          $el.addClass('kbml-slot-ref');
        }
      }, this)
    }

    // this.initDraggable();

  },
  initDraggable: function () {
    var $source, $target, $sourcecontainer, $targetcontainer;
    var that = this;
    this.$('.kbml-slot-ref').draggable({
      revert: 'invalid',
      helper: 'clone',
      revertDuration: 200,
      start: function () {
        $source = jQuery(this);
      },
      stop: function () {
        $source = null;
        jQuery(this).removeClass('being-dragged');
      }
    });

    this.$('.kbml-slot-ref').droppable({
      hoverClass: 'drop-hover',
      over: function (event, ui) {
        $target = jQuery(event.target);
      },
      drop: function (event, ui) {

        var from = $source.data('slot');
        var fromId = $source.attr('id');
        var to = $target.data('slot');
        var toId = $target.attr('id');
        var data = that.model.get('layoutData');
        var slots = data.slots;

        slots[from].mid = toId;
        slots[to].mid = fromId;


        alert(JSON.stringify(slots));
        return false;
      }
    });
  },
  showPlaceholder: function () {
    return this;
  },
  removePlaceholder: function () {
    return this;
  },
  refreshPlaceholder: function () {
    return this;
  },
  setupUi: function () {
    return false;
  },

  setupSortables: function () {

  },
  resort: function (area) {
  }

});