var KB = KB || {};
KB.Ext = KB.Ext || {};

KB.Ext.Backup = (function($) {

    return {
        el: $('#backup-inspect'),
        init: function() {
            this.listEl = $('<ul></ul>').appendTo(this.el);
            if (this.listEl.length > 0) {
                this.update();
            }
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