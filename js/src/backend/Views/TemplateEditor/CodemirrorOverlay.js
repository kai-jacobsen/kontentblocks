var Ajax = require('common/Ajax');
var Config = require('common/Config');
var ViewsList = require('./ViewsList');
var tplEDitor = require('templates/backend/template-editor/wrap.hbs');

module.exports = Backbone.View.extend({
  className: 'kb-codemirror-overlay',
  initialize: function (options) {
    this.viewfile = options.viewfile;
    this.$wrap = jQuery(tplEDitor()).appendTo(this.$el);
    this.$sidebar = this.$('.kb-template-editor-sidebar');
    this.$content = this.$('.kb-template-editor-content');
    this.moduleModel = options.module;
    this.views = options.views;
    this.open();
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
      lineNumbers: true
    });
    this.render();
  },
  render: function () {
    var list = new ViewsList({
      $container: this.$sidebar,
      views: this.views,
      controller: this
    }).render();
    this.load(list.getActiveView());

  },
  load: function (viewfile) {
    var that = this;
    Ajax.send({
      viewfile: viewfile.model.toJSON(),
      action: 'getTemplateString',
      _ajax_nonce: Config.getNonce('read')
    }, function (res) {
      that.editor.setValue(res);
    }, this);
  }
});