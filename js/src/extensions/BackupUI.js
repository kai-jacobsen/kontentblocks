var Ajax = require('common/Ajax');
var Notice = require('common/Notice');
var Config = require('common/Config');
var tplSummary = require('templates/backend/extensions/backup-summary.hbs');
var BackupUi = Backbone.View.extend({
  lastItem: null,
  firstRun: true,
  initialize: function () {
    var that = this;
    this.listEl = jQuery('<ul></ul>').appendTo(this.$el);
    if (this.listEl.length > 0) {
      this.update();
    }

    // Heartbeat send data1
    jQuery(document).on('heartbeat-send', function (e, data) {
      data.kbBackupWatcher = that.lastItem;
      data.post_id = KB.Environment.postId || 0;
    });

    // Heartbeat receive data
    jQuery(document).on('heartbeat-tick', function (e, data) {
      if (data.kbHasNewBackups && _.isObject(data.kbHasNewBackups)) {
        that.renderList(data.kbHasNewBackups);
      }
    });
    return this;
  },
  update: function () {
    var that = this;
    Ajax.send(
      {
        action: 'get_backups',
        _ajax_nonce: Config.getNonce('read')
      },
      function (response) {
        that.items = response.data;
        that.renderList(response.data);
      });

  },
  renderList: function (items) {
    var that = this;
    this.listEl.empty();
    _.each(items, function (item, key) {
      that.lastItem = item;
      var data = {
        time: new Date(item.created).toGMTString(),
        item: item
      };
      that.listEl.append(tplSummary(data));
    });
    // no notice on first run
    if (!this.firstRun) {
      Notice.notice('<p>' + KB.i18n.Extensions.backups.newBackupcreated + '</p>', 'success');
    }
    this.firstRun = false;

    this.listEl.on('click', '.js-restore', function (e) {
      var id = jQuery(this).parent().attr('data-id');
      that.restore(id);
    })
  },
  restore: function (id) {
    var that = this;
    var location = window.location.href + '&restore_backup=' + id + '&post_id=' + jQuery('#post_ID').val();
    window.location = location;
  }
});
module.exports = new BackupUi({
  el: '#kb-backup-inspect .inside'
});