var KBOnSiteEditing;

(function($) {

    KBOnSiteEditing = {
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
                data.kbEditWatcher = 'Peter is here';
            });

            $(document).on('heartbeat-tick', function(e, data){
                console.log(data);
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
            $(caller).parent('li').toggleClass('os-edit-off');
            $('body').toggleClass('onsite-editing');
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

            vex.close(openedModal.data().vex.id);
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


