var KBAreaSelector;

(function($) {


    KBAreaSelector =
            {
                init: function()
                {
                    $('#existing-areas, #active-dynamic-areas').sortable({
                        connectWith: '.connect',
                        cancel: "li.ui-state-disabled",
                        placeholder: "sortable-placeholder",
                        helper: "clone",
                        receive: function(event, ui)
                        {
                            item = ui.item;
                            id = $(item).attr('id');

                            $(item).toggleClass('dynamic-area-active');

                            if (this.id == 'active-dynamic-areas')
                            {
                                action = "<span><a href=''>edit</a></span>";

                                content = "<input id='" + id + "_hidden' type='hidden' name='active_sidebar_areas[]' value='" + id + "' />";
                                $(item).append(content);
                            }
                            else
                            {
                                $('input#' + id + '_hidden').remove();

                            }
                        }
                    })
                }

            }


    $(document).ready(KBAreaSelector.init);
})(jQuery);


jQuery(document).ready(function($) {

    $("body").on('click', 'a.da-modal', function(e) {
        e.preventDefault();

        target = $(this).attr('data-url');
        height = $(window).height();
        $('#da-frame').attr('src', target).attr('height', height - 200);
        
        $(window).resize(function() {
            height = $(window).height();
            $('#da-frame').attr('height', height - 200);
        });
        var $content = $('#da-modal');
        openedModal = vex.open({
            content: $content.html(),
            contentClassName: 'editGlobalArea'
        });

    });

});