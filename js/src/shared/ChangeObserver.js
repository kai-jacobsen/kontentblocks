var Notice = require('common/Notice');
var tplChangeObserver = require('templates/frontend/change-observer.hbs');
var I18n = require('common/I18n');
var Config = require('common/Config');
module.exports = Backbone.View.extend({
  models: new Backbone.Collection(),
  className: 'kb-change-observer',
  initialize: function () {
    this.listenTo(KB.Modules, 'add', this.attachHandler);
    //this.listenTo(KB.Panels, 'add', this.attachHandler);
    this.render();
  },
  events: {
    'click .kb-button': 'saveAll'
  },
  render: function () {
    this.$el.append(tplChangeObserver({
      strings: I18n.getString('UI.changeObserver')
    }));
    this.$el.appendTo('body');
  },
  attachHandler: function (model) {
    this.listenTo(model, 'change:entityData', this.add);
    this.listenTo(model, 'module.model.updated', this.remove);
    this.listenTo(model, 'module.model.clean', this.remove);
  },
  add: function (model) {
    this.models.add(model);
    this.trigger('change');
    this.handleState();
  },
  remove: function (model) {
    this.models.remove(model, {silent: true});
    this.trigger('change');
    this.handleState();
  },
  getModels: function () {
    return this.models;
  },
  saveAll: function () {
    tinyMCE.triggerSave();
    _.each(this.models.models, function (model) {
      model.sync(true);
    });
    if (!Config.isAdmin()) {
      Notice.notice('Data is safe.', 'success');
    }
    this.trigger('change');
  },
  handleState: function () {
    var l = this.models.models.length;
    if (l > 0) {
      this.$el.addClass('show');
    } else {
      this.$el.removeClass('show');
    }
  }


});