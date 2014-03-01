var KB = KB || {};

KB.TinyMCE = (function ($) {

    return {
        removeEditors: function () {
            // do nothing if it is the native editor
            $('.wp-editor-area').each(function () {
                if ($(this).attr('id') === 'wp-content-wrap') {
                    // do nothing
                } else {
                    // get the id
                    var textarea = this.id;
                    console.log(textarea, 'removeEd');
                    // remove controls
                    tinyMCE.execCommand('mceRemoveEditor', false, textarea);
                }
            });
        },
        restoreEditors: function () {
            $('.wp-editor-wrap').each(function () {
//                // find all textareas with tinymce support
//                var textarea = $(this).find('textarea').attr('id');
//                // add controls back
//                tinyMCE.execCommand('mceAddEditor', false, textarea);
//                //
//                // if instance was in html mode, we have to switch manually back to visual mode
//                // will look ugly otherwise, and don't see an alternative
//                if ($(this).hasClass('html-active')) {
//                    $(this).removeClass('html-active').addClass('tmce-active');
//                }
                var settings = tinyMCEPreInit.mceInit.content;

                var id = $(this).find('textarea').attr('id');

                // add new editor id to settings
                settings.elements = id;
                settings.selector = '#'+id;
                settings.id = id;
                settings.height = 350;
                settings.setup = function (ed) {
                    ed.on('init', function () {
                        jQuery(document).trigger('newEditor', ed);
                    });
                };

                var ed = tinymce.init(settings);
            });
        },
        addEditor: function ($el, quicktags) {
            // get settings from native WP Editor
            // Editor may not be initialized and is not accesible throught
            // the tinymce api, thats why we take the settings from preInit
            var settings = tinyMCEPreInit.mceInit.content;
            if (!$el) {
                $el = KB.lastAddedModule.view.$el;
            }

            $('.wp-editor-area', $el).each(function () {
                var id = this.id;
                // add new editor id to settings
                settings.elements = id;
                settings.selector = '#'+id;
                settings.id = id;
                settings.height = 350;
                settings.setup = function (ed) {
                    ed.on('init', function () {
                        jQuery(document).trigger('newEditor', ed);
                    });
                };

                var ed = tinymce.init(settings);

                // doesn't wok without, but don't really know what this does
                var qtsettings = {
                    'buttons': '',
                    'disabled_buttons': '',
                    'id': id
                };
                new QTags(qtsettings);


            });

            setTimeout(function () {
                $('.wp-editor-wrap', $el).removeClass('html-active').addClass('tmce-active');
                QTags._buttonsInit();
            }, 1500);

<<<<<<< HEAD
=======

>>>>>>> 6d9c53884e992cd60fc3f2ce815da2e506b10933

        },
        remoteGetEditor: function ($el, name, content, post_id) {
            var pid = post_id || KB.Screen.post_id;
            var id = $el.attr('id');
            KB.Ajax.send({
                action: 'getRemoteEditor',
                editorId: id + '_ed',
                editorName: name,
                post_id: pid,
                editorContent: content,
                _ajax_nonce: kontentblocks.nonces.read

            }, function(data){

                $el.empty().append(data);
                this.addEditor($el);
            },this);
        }

    };

}(jQuery));