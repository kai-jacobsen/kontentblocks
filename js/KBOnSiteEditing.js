var KBOnSiteEditing;

(function($) {

    KBOnSiteEditing = {
        init: function() {

            $('#wpadminbar').on('click', 'li.os-edit a', function(e) {

                e.preventDefault();
            });


            $('body').on('click', 'a.os-edit-block', function() {
                container = $(this).closest('.os-edit-container');
            });


            $('body').on('mousedown', 'textarea', function()
            {
                wpActiveEditor = $(this).attr('id');
            });

            callbacks = new Object();
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
    vex.defaultOptions.className = 'vex-theme-flat-attack';

    KBOnSiteEditing.init();

    $("body").on('click', '.reveal', function(e) {
        e.preventDefault();
        target = $(this).attr('data-url');
        height = $(window).height();
        $('#osframe').attr('src', target).attr('height', height - 200);

//        $("#onsite-modal").reveal({animation: 'fade'});
       openedModal = vex.open({
            content: $('#onsite-modal').html(),
            contentClassName: 'onsite',
            afterOpen: function(){
                
            }
        });
        $(window).resize(function() {
            height = $(window).height();
            $('#osframe').attr('height', height - 200);
        });

    });

});


