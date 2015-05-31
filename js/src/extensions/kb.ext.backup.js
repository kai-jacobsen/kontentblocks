var KB = window.KB || {};
KB.Ext = KB.Ext || {};
KB.Ext.Backup = (function ($) {

  return {
    el: $('#backup-inspect'),
    lastItem: null,
    firstRun: true,
    init: function () {

      if (KB.appData.config.frontend) {
        return false;
      }

      var that = this;
      this.listEl = $('<ul></ul>').appendTo(this.el);
      if (this.listEl.length > 0) {
        this.update();

      }

      // Heartbeat send data
      $(document).on('heartbeat-send', function (e, data) {
        data.kbBackupWatcher = that.lastItem;
        data.post_id = KB.Environment.postId || 0;
      });

      // Heartbeat receive data
      $(document).on('heartbeat-tick', function (e, data) {
        if (data.kbHasNewBackups && _.isObject(data.kbHasNewBackups)) {
          that.renderList(data.kbHasNewBackups);
        }
      })
    },
    update: function () {
      var that = this;

      KB.Ajax.send(
        {
          action: 'get_backups',
          _ajax_nonce: KB.Config.getNonce('read')
        },
        function (response) {
          that.items = response;
          that.renderList(response);
        });

    },
    renderList: function (items) {
      var that = this;
      this.listEl.empty();

      _.each(items, function (item, key) {
        that.lastItem = key;
        that.listEl.append(_.template("\
                <li>\n\
                    <details>\n\
                        <summary>\n\
                            <%= data.time %>\n\
                        </summary>\n\
                    <div class='actions' data-id='<%= key %>'>\n\
                        <span class='js-restore'>Restore</span>\n\
                        <p class='description'><b>Comment:</b> <%= item.msg %></p>\n\
                    </details>\n\
                </li>", {data: {time: new moment.unix(key).format('HH:mm:ss / DD.MMM')}, item: item, key: key}))
      });
      // no notice on first run
      if (!this.firstRun) {
        KB.Notice.notice('<p>' + KB.i18n.Extensions.backups.newBackupcreated + '</p>', 'success');
      }
      this.firstRun = false;

      this.listEl.on('click', '.js-restore', function (e) {
        var id = $(this).parent().attr('data-id');
        that.restore(id);
      })
    },
    restore: function (id) {
      var that = this;
      var location = window.location.href + '&restore_backup=' + id + '&post_id=' + $('#post_ID').val();
      window.location = location;
    }


  };


}(jQuery));
KB.Ext.Backup.init();