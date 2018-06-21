var Ajax = require('common/Ajax');
var Config = require('common/Config');
var ViewsList = require('./ViewsList');
var Controls = require('./Controls');
var tplEDitor = require('templates/backend/template-editor/wrap.hbs');

module.exports = Backbone.View.extend({
  className: 'kb-codemirror-overlay',
  currentView: null,
  initialize: function (options) {
    this.viewfile = options.viewfile;
    this.$wrap = jQuery(tplEDitor()).appendTo(this.$el);
    this.$sidebar = this.$('.kb-template-editor-sidebar');
    this.$content = this.$('.kb-template-editor-content');
    this.moduleModel = options.module;
    this.views = options.views;
    this.open();
  },
  events: {
    'click .kb-tpled--close': 'close'
  },
  open: function () {
    this.$backdrop = jQuery('<div class="kb-fullscreen-backdrop"></div>').appendTo('body');
    this.$el.width(jQuery(window).width() * 0.7);
    jQuery('#wpwrap').addClass('module-browser-open');
    this.$el.appendTo('body');
    this.trigger('open');
    this.editor = CodeMirror(document.getElementById('codemirror'), {
      mode: "twig",
      theme: 'dracula',
      lineNumbers: true,
      lineWrapping: true,
      tabMode: "indent",
      indentUnit: 4
    });
    this.render();
  },
  close: function () {
    this.$backdrop.remove();
    jQuery('#wpwrap').removeClass('module-browser-open');
    this.$el.detach();
    this.trigger('close');

  },
  render: function () {
    var list = new ViewsList({
      $container: this.$('[data-views]'),
      views: this.views,
      controller: this
    }).render();
    var controls = new Controls({
      $container: this.$('[data-controls]'),
      controller: this
    }).render();
    this.load(list.getActiveView());
  },
  load: function (viewfile) {
    var that = this;

    if (this.currentView) {
      this.currentView.deselect();
    }

    Ajax.send({
      viewfile: viewfile.model.toJSON(),
      action: 'getTemplateString',
      _ajax_nonce: Config.getNonce('read')
    }, function (res) {
      that.editor.setValue(res.data);
      that.currentView = viewfile;
      that.currentView.select();
    }, this);
  },
  getCurrentView: function () {
    return this.currentView;
  }

});