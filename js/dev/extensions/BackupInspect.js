var KB = KB || {};
KB.Ext = KB.Ext || {};

KB.Ext.Backup = (function($) {

    return {
        el: $('#backup-inspect'),
        lastItem: null,
        firstRun: true,
        init: function() {
            var that = this;
            this.listEl = $('<ul></ul>').appendTo(this.el);
            if (this.listEl.length > 0) {
                this.update();

            }

            // Heartbeat send data
            $(document).on('heartbeat-send', function(e, data){
                data.kbBackupWatcher = that.lastItem;
                data.post_id = KB.Screen.post_id;
            });

            // Heartbeat receive data
            $(document).on('heartbeat-tick', function(e, data){
                if (data.kbHasNewBackups && data.kbHasNewBackups !== false){
                   that.renderList(data.kbHasNewBackups);
                }
            })
        },
        update: function() {
            var that = this;


            KB.ajax(
                    {
                        action: 'get_backups'
                    },
            function(response)
            {
                that.items = response;
                that.renderList(response);
            });

        },
        renderList: function(items) {
            var that = this;
            this.listEl.empty();


            _.each(items, function(item, key) {
                that.lastItem = key;
                that.listEl.append(_.template("\
                <li>\n\
                    <details>\n\
                        <summary>\n\
                            <%= data.time %>\n\
                        </summary>\n\
                    <div class='actions' data-id='<%= key %>'>\n\
                        <span class='js-review'>Review</span>\n\
                        <span class='js-restore'>Restore</span>\n\
                        <p class='description'><b>Comment:</b> <%= item.msg %></p>\n\
                    </details>\n\
                </li>", {data: {time: new moment.unix(key).format('HH:mm:ss / DD.MMM')}, item: item, key: key}))
            });


            // no notice on first run
            if (!this.firstRun){
                KB.Notice.notice('<h3>Message from the Back.Up.Joe!</h3><p>New Backups were created</p>', 'success');
            }
            this.firstRun = false;

            this.listEl.on('click', '.js-restore', function(e) {
                var id = $(this).parent().attr('data-id');
                that.restore(id);
            })
        },
        restore: function(id) {
            var that = this;
            var location = window.location.href + '&restore_backup=' + id + '&post_id=' + $('#post_ID').val();
            window.location = location;
        }



    };


}(jQuery));
KB.Ext.Backup.init();