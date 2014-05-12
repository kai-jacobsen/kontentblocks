KB.Fields.register('Link', (function ($) {

    var self, restore_htmlUpdate, restore_isMce, title, href;

    return {
        $input: null,
        init: function () {
            var that = this;
            $('body').on('click', '.kb-js-add-link', function (e) {
                e.preventDefault();
                that.$input = $(this).prev().attr('id');
                that.open();
            });
        },
        open: function (input) {
            var that = this;
            // set activeEditor, in this caseour textfield, dialog won't open if not set
            wpActiveEditor = this.$input;
            //open the dialog
            wpLink.open();

            // store the original function
            restore_htmlUpdate = wpLink.htmlUpdate;
            restore_isMce = wpLink.isMCE;

            // it's not tinymce, ovverride the original
            wpLink.isMCE = function () {
                return false
            };


            // magic happens here,override the original function
            wpLink.htmlUpdate = function () {
                var attrs, html, start, end, cursor,
                    textarea = wpLink.textarea, result;

                if (!textarea)
                    return;

                // get contents of dialog
                attrs = wpLink.getAttrs();

                // If there's no href, return.
                if (!attrs.href || attrs.href == 'http://')
                    return;
                // Build HTML
                href = attrs.href;
                title = attrs.title;

                // Clear textarea
                jQuery(textarea).empty();

                //Append the Url to the textarea
                textarea.value = href;
                //restore the original function
                // close dialog and put the cursor inside the textarea
                wpLink.close();
                that.close();
                textarea.focus();
            }
        },
        close: function () {
                // restore the original functions to wpLink
                wpLink.isMCE = restore_isMce;
                wpLink.htmlUpdate = restore_htmlUpdate;
        },
        update: function(){
            this.init();
        },
        updateFront: function(){
            this.init();
        }
    }

}(jQuery)));