var KB = KB || {};

KB.TinyMCE = (function($) {

    return {
        removeEditors: function() {
            // do nothing if it is the native editor
            $('.wp-editor-wrap').each(function() {
                if ($(this).attr('id') === 'wp-content-wrap')
                {
                    // do nothing
                } else
                {
                    // get the id
                    var textarea = jQuery(this).find('textarea').attr('id');
                    // remove controls
                    tinyMCE.execCommand('mceRemoveControl', false, textarea);
                }
            });
        },
        restoreEditors: function() {
            $('.wp-editor-wrap').each(function()
            {
                // find all textareas with tinymce support
                var textarea = $(this).find('textarea').attr('id');
                // add controls back
                tinyMCE.execCommand('mceAddControl', false, textarea);
                // 
                // if instance was in html mode, we have to switch manually back to visual mode
                // will look ugly otherwise, and don't see an alternative
                if ($(this).hasClass('html-active'))
                {
                    $(this).removeClass('html-active').addClass('tmce-active');
                }
            });
        },
        addEditor: function() {
            // get settings from native WP Editor
            // Editor may not be initialized and is not accesible throught
            // the tinymce api, thats why we take the settings from preInit
            var settings = tinyMCEPreInit.mceInit['content'];

            $('.wp-editor-area', KB.lastAddedModule.view.$el).each(function() {
                var id = this.id;

                // add new editor id to settings
                settings['elements'] = id;
                settings['height'] = 350;
                settings['setup'] = function(ed){
                    ed.onInit.add(function(){
                        jQuery(document).trigger('newEditor', ed);
                    });
                };
//                new tinymce.Editor(id, settings).render();
                tinyMCE.init(settings);
                // doesn't wok without, but don't really know what this does
                var qtsettings = {
                    'buttons': '',
                    'disabled_buttons': '',
                    'id': id
                };
                new QTags(qtsettings);


            });

            setTimeout(function() {
                $('.wp-editor-wrap', KB.lastAddedModule.view.$el).removeClass('html-active').addClass('tmce-active');
                QTags._buttonsInit();
            }, 1500);

//
//            // add qt settings for the new instance as well
//            tinyMCEPreInit.qtInit[newid] = qtsettings;

//            // create new instance
//            ed = new tinymce.Editor(newid, settings);
//
//            // render new instance
//            ed.render();

//            // add quicktags
//            var qt = new QTags(qtsettings);

            // hackish..set a short delay to reset the new editor to visual mode and hide qt buttons
            // this is necessary :/


        }

    };

}(jQuery));