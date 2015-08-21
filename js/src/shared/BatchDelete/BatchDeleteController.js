var tplBatchDelete = require('templates/backend/batch-delete.hbs');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var TinyMCE = require('common/TinyMCE');
var BatchDeleteController = Backbone.View.extend({
  collection: {},
  visible: false,
  className: 'kb-batch-delete-wrap',
  events: {
    'click .kb-batch-delete--action-delete': 'process',
    'click .kb-batch-delete--action-reset': 'reset'
  },
  initialize: function () {
    this.render();
  },
  render: function () {
    this.$el.append(tplBatchDelete());
    jQuery('body').append(this.$el);
  },
  add: function (control) {
    this.collection[control.model.id] = control;
    this.refresh();
  },
  remove: function (control) {
    if (this.collection[control.model.id]) {
      delete this.collection[control.model.id];
    }
    this.refresh();
  },
  refresh: function () {
    var size = _.size(this.collection);
    if (size > 0) {
      this.show();
    } else {
      this.hide();
    }
  },
  reset: function () {
    _.each(this.collection, function (model) {
      model.unmark();
      this.remove(model);
    }, this);
  },
  process: function () {
    var keys = [];
    _.each(this.collection, function (val, key, index) {
      keys.push(key);
    });
    Ajax.send({
      action: 'batchRemoveModules',
      _ajax_nonce: Config.getNonce('delete'),
      modules: keys
    }, this.success, this);
  },
  success: function (res) {
    if (res.data.modules) {
      _.each(res.data.modules, function (value, key) {
        if (value) {
          var control = this.collection[key];
          TinyMCE.removeEditors(control.model.View.$el);
          KB.Modules.remove(control.model);
          wp.heartbeat.interval('fast', 2);
          control.model.destroy();
        }
      },this)
    }
  },
  show: function () {
    this.$el.addClass('visible');
  },
  hide: function () {
    this.$el.removeClass('visible');

  }
});

module.exports = new BatchDeleteController();