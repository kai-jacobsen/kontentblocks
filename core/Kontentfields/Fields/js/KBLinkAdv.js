var KBLinkAdv;

(function($) {

    var inputs = {}, restore_htmlUpdate, restore_isMce;

    KBLinkAdv =
            {
                href: null,
                title: null,
                target: false,
                init: function()
                {
                    $('body').on('click', '.kb-add-link-adv', function(e) {
                        e.preventDefault();
                        KBLinkAdv.href = $('.key-href', $(activeField));
                        KBLinkAdv.title = $('.key-title', $(activeField));
                        KBLinkAdv.start();
                    });
                },
                start: function()
                {
                    $('#wp-link').find('.link-target').hide();

                    // set activeEditor, in this caseour textfield, dialog won't open if not set
                    wpActiveEditor = KBLinkAdv.href.attr('id');
                    //open the dialog
                    wpLink.open();

                    KBLinkAdv.title.empty();

                    // store the orignal function
                    restore_htmlUpdate = wpLink.htmlUpdate;
                    restore_isMce = wpLink.isMCE;

                    // it's not tinymce, ovverride the original
                    wpLink.isMCE = function() {
                        return false
                    };


                    // magic happens here,override the original function
                    wpLink.htmlUpdate = function() {
                        var attrs, html, start, end, cursor,
                                textarea = wpLink.textarea, result;

                        if (!textarea)
                            return;

                        // get contents of dialog
                        attrs = wpLink.getAttrs();
                        // If there's no href, return.
                        if (!attrs.href || attrs.href == 'http://')
                            return;

                        // Clear textarea
                        jQuery(textarea).empty();

                        //Append the Url to the textarea
                        textarea.value = attrs.href;
                        KBLinkAdv.title.val(attrs.title);
                        //restore the original function


                        // close dialog and put the cursor inside the textarea


                        wpLink.close();
                        KBLinkAdv.close();
                        textarea.focus();

                    }


                },
                remove: function() {

                    $('#' + activeBlock).find('input').each(function(i) {
                        $(this).val('');
                    });
                },
                close: function() {

                    // restore the original functions to wpLink
                    wpLink.isMCE = restore_isMce;
                    wpLink.htmlUpdate = restore_htmlUpdate;

                }

            }


    $(document).ready(KBLinkAdv.init);
})(jQuery);