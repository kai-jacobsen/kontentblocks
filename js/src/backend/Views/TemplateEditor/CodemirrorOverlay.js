var Ajax = require('common/Ajax');
var Config = require('common/Config');
var ViewsList = require('./ViewsList');
var Controls = require('./Controls');
var Fields = require('./FieldsList');
var tplEDitor = require('templates/backend/template-editor/wrap.hbs');

module.exports = Backbone.View.extend({
  className: 'kb-codemirror-overlay',
  currentView: null,
  initialize: function (options) {
    this.viewfile = options.viewfile;
    this.moduleView = options.moduleView;
    this.$wrap = jQuery(tplEDitor()).appendTo(this.$el);
    this.$sidebar = this.$('.kb-tpled--sidebar');
    this.$content = this.$('.kb-tpled--content');
    this.moduleModel = options.module;
    this.views = this.prepareViews(this.moduleModel.get('views'));
    this.open();
  },
  events: {
    'click .kb-tpled--close': 'close'
  },
  open: function () {
    this.$backdrop = jQuery('<div class="kb-fullscreen-backdrop"></div>').appendTo('body');
    // this.$el.width(jQuery(window).width() * 0.9);
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
    this.List = new ViewsList({
      $container: this.$('[data-views]'),
      views: this.views,
      controller: this
    }).render();
    this.Controls = new Controls({
      $container: this.$('[data-controls]'),
      controller: this
    }).render();
    this.Fields = new Fields({
      $container: this.$('[data-fields]'),
      controller: this
    });
    this.load(this.List.getActiveView());
  },
  load: function (viewfile) {
    var that = this;

    if (this.currentView) {
      this.currentView.deselect();
    }
    Ajax.send({
      viewfile: viewfile.model.toJSON(),
      action: 'getTemplateString',
      module: this.moduleModel.toJSON(),
      _ajax_nonce: Config.getNonce('read')
    }, function (res) {
      that.editor.setValue(res.data.string);
      that.currentView = viewfile;
      that.currentView.select();
      that.Fields.setFields(res.data.fields).render();
    }, this);
  },
  getCurrentView: function () {
    return this.currentView;
  },
  prepareViews: function (views) {
    return _.map(views, function (view) {
      view.selected = (view.filename === this.moduleModel.get('viewfile')) ? 'selected="selected"' : '';
      view.isActive = (view.filename === this.moduleModel.get('viewfile'));
      return view;
    }, this);
  }

});