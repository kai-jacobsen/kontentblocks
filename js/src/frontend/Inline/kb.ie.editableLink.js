KB.IEdit.Link = (function ($) {
    var $form, $linkTarget, $linktext, $body, $href, $title;

    return {
        selector: '.editable-link',
        oWpLink: null,
        $anchor: null,
        init: function () {
            var that = this;
            $body = $('body');
            $body.on('click', this.selector, function (e) {
                e.stopPropagation();
                if (e.ctrlKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    that.$anchor = $(this);
                    that.open();
                }
            });

            $body.on('click', '#wp-link-close', function () {
                that.close();
            });
        },
        open: function () {
            var that = this;

            if (!window.wpLink) {
                return false;
            }

            // store the original function
            this.restore_htmlUpdate = wpLink.htmlUpdate;
            this.restore_isMce = wpLink.isMCE;
            this.restore_close = wpLink.close;

            // it's not tinymce, ovverride the original
            wpLink.isMCE = function () {
                return false;
            };

            wpLink.open();

            this.addLinktextField();
            this.customizeDialog();
            this.setValues();

            // magic happens here,override the original function
            wpLink.htmlUpdate = function () {
                var attrs, html, start, end, cursor,
                    textarea = wpLink.textarea, result;

                if (!textarea)
                    return;

                // get contents of dialog
                attrs = wpLink.getAttrs();

                if ($linktext) {
                    attrs.linktext = $('input', $linktext).val();
                }

                // If there's no href, return.
                if (!attrs.href || attrs.href == 'http://')
                    return;

                that.$anchor.attr('href', attrs.href);
                that.$anchor.html(attrs.linktext);
                that.$anchor.attr('target', attrs.target);
                that.updateModel(attrs);

                //restore the original function
                // close dialog and put the cursor inside the textarea
                that.close();
                wpLink.close();
            };

        },
        addLinktextField: function () {
            $form = $('form#wp-link');
            $linkTarget = $('.link-target', $form);

            $linktext = $('<div><label><span>LinkText</span><input type="text" value="hello" name="linktext" ></label></div>').insertBefore($linkTarget);
        },
        customizeDialog: function () {
            $('#wp-link-wrap').addClass('kb-customized');
        },
        setValues: function () {
            $href = $('#url-field', $form);
            $title = $('#link-title-field', $form);
            //$linktext already set

            var data = this.$anchor.data();
            var mId = data.module; // module id
            var moduleData = KB.Modules.get(mId).get('moduleData'); // module model data
            var lData = {};
            console.log('moduleData', moduleData);
            lData = KB.Util.getIndex(moduleData, data.kpath);

            $href.val(lData.link);
            $title.val(lData.title);
            $linktext.find('input').val(lData.linktext);

            if (lData.target === '_blank') {
                $('#link-target-checkbox').prop('checked', true);
            }

        },
        close: function () {
            // restore the original functions to wpLink
            wpLink.isMCE = this.restore_isMce;
            wpLink.htmlUpdate = this.restore_htmlUpdate;
            wpLink.close = this.restore_close;
            $linktext.remove();
        },
        updateModel: function (attrs) {

            var data = this.$anchor.data();
            var mId = data.module; // module id
            var cModule = KB.Modules.get(mId); // module model

            var value = {
                link: attrs.href,
                title: attrs.title,
                target: attrs.target,
                linktext: attrs.linktext
            };

            // clone model data
            var moduleData = _.clone(cModule.get('moduleData'));
            var path = data.kpath;
            KB.Util.setIndex(moduleData, path, value);

            // set data back on module model
            cModule.set('moduleData', moduleData);
        }
    };

})(jQuery);