var KBOnSiteEditing;

(function($) {

    KBOnSiteEditing = {
        _active : false,
        init: function() {
        var that = this;
            $('#wpadminbar').on('click', 'li.os-edit a', function(e) {
                e.preventDefault();
            });


            $('body').on('click', 'a.os-edit-block', function() {
                container = $(this).closest('.os-edit-container');
            });

            // Heartbeat send data
            $(document).on('heartbeat-send', function(e, data){
                var id = KB.appData.config.post.ID
                data.kbEditWatcher = id; // actual user
            });

            $(document).on('heartbeat-tick', function(e, data){
                // check response
            });

            $('body').on('mousedown', 'textarea', function()
            {
                wpActiveEditor = $(this).attr('id');
            });

            callbacks = {};
            $this = this;

        },
        control: function(caller)
        {
            this._active = !this._active;
            $(caller).parent('li').toggleClass('os-edit-off');
            $('body').toggleClass('onsite-editing');
            $('.kooltip').powerTip('show');

            if (this._active){
                KB.App.init();
            } else {
                KB.App.shutdown();
            }

        },
        refresh: function(result) {

            $(container).fadeTo(350, 0, function() {
                $(this).empty().append(result.output);
                $(this).fadeTo(350, 1);
                KBOnSiteEditing.shutdown(result.callback);
            })


        },
        shutdown: function(callback)
        {
            $(window).trigger('os_refresh');

            if (callbacks[callback])
            {
                callbacks[callback]();
            }

        },
        addCallback: function(id, callback)
        {
            var identifier = id;
            callbacks[identifier] = callback;
        }

    };


})(jQuery);


jQuery(document).ready(function($) {

    KBOnSiteEditing.init();

});


