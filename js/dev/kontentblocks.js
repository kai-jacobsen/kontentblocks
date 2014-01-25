/*
 * TODO: There are still some functions which could be wrapped inside KB Object
 * Rewrite this Shit
 */

/*
 * KB - holds functionality used throughout the system
 * latestBlock - holds the id (not the whole node) of the latest added block
 * activeBlock - id of the current block where mouse has been pressed on
 * activeArea - id of current area where mouse has been pressed
 */

var KB, latestBlock, activeBlock, activeArea, activeField, kbMetaBox;

(function($) {

    _.extend(KB, {
        //indicator
        duplicate: false,
        postContext: true,
        openedModal: false,
        init: function()
        {
            vex.defaultOptions.className = 'vex-theme-flat-attack';

            // cache KB MetaBox
            kbMetaBox = $('#kontentblocks_stage');

            // init tabs used by Kontenfields
            if ($('.kb_fieldtabs'))
            {
                KB.ktftabs();
            }

            if ($('.area-blocks-menu-tabs'))
            {
                KB.menutabs();
            }

            $('.reveal-modal').bind('reveal:opened', function() {
//                if ($(this).find('.ui-tabs-panel').length > 0)
//                    $(this).find('.ui-tabs-panel').jScrollPane();
                KB.openedModal = $(this);


            });

            // preventive fix
            jQuery('#submit').mousedown(function() {
                tinyMCE.triggerSave();
            });

            // Keep 4 Kontentfields
            // Bind AjaxComplete, restoring TinyMCE after global MEtaBox reordering
//            jQuery(document).ajaxComplete(function(e, o, settings)
//            {
//                KB.metaBoxReorder(e, o, settings, 'restore');
//            });
//
//            // Keep 4 Kontentfields
//            // Bind AjaxSend to remove TinyMCE before global MetaBox reordering
//            jQuery(document).ajaxSend(function(e, o, settings)
//            {
//                KB.metaBoxReorder(e, o, settings, 'remove');
//            });

            // Keep 4 Kontentfields
            // Overrides the WP original function to keep an eye on dynamically generated editors
            $(kbMetaBox).on('mousedown', '.wp-editor-wrap', function(e) {
                wpActiveEditor = this.id.slice(3, -5);
            });

            // Keep 4 Kontentfields
            $(kbMetaBox).on('mousedown', '.quicktags', function(e) {
                wpActiveEditor = $(this).find('textarea').attr('id');
            });

            // Keep 4 Kontentfields
            // set the global activeBlock variable dynamically
            $('body').on('mousedown', '.kb_block', function(e) {
                activeBlock = this.id;
            });

            // Keep 4 Kontentfields
            // set the global activeField variable dynamically
            $('body').on('mousedown', '.kb_field', function(e) {
                activeField = this;

            });

            // Keep 4 Kontentfields
            // set activeArea dynamically
            $('.kb_area_list_item').mousedown(function() {
                activeArea = this.id;
            });

            // Listen for changes on kb_field inputs
            $(kbMetaBox).on('change', '.kb_field input, .kb_field select, .kb_field textarea', function(e) {
                $notice = $(this).closest('.kb_inner').find('.block-notice');
                $(window).trigger('input:change');
                $($notice).fadeIn(750);
            });

            $('body').on('click', '.media-modal-close, .media-modal-backdrop', function(e) {
                $('body').trigger('modal-close');
            });

            $(document).on('keyup', function(e)
            {
                if (e.which === 27) {
                    $('body').trigger('modal-close');
                }
            });
        },
        menutabs: function()
        {
            $('.area-blocks-menu-tabs').tabs({
                show: function(event, ui)
                {
//                    $(ui.panel).jScrollPane();
                }
            });
        },
        // Keep 4 Kontentfields
        ktftabs: function()
        {
            // Tabs for Kontentfields
            if ($('.kb_fieldtabs'))
            {
                var length = $('.kb_fieldtabs li').length;

                $('.kb_fieldtabs').tabs({
                    activate: function() {

                        $window = $(window).height();
//                        $('.content').height($window - 250);

                        $('.nano').nanoScroller();
                    }
                });

                $('.kb_fieldtabs').each(function() {

                    if (length === 1)
                    {
                        $(this).find('.ui-tabs-nav').css('display', 'none');
                    }

                });
            }
            // bind to custom event after a new block has been added to init tabs for Kontentfields
            $(document).on('kb_block_added', function(event)
            {
                if ($('.kb_fieldtabs'))
                {
                    $('.kb_fieldtabs').tabs();
                }
            });
        },
        // handles dynamic creation of TinyMCE instances
        // Keep 4 Kontentfields
        tinymce: function(newid, parent)
        {
            // get settings from native WP Editor
            var settings = tinyMCEPreInit.mceInit['content'];

            // add new editor id to settings
            settings['elements'] = newid;

            // add settings object to tinyMCEPreInit Object
            tinyMCEPreInit.mceInit[newid] = settings;

            // doesn't wok without, but don't really know what this does
            qtsettings = {
                'buttons': '',
                'disabled_buttons': '',
                'id': newid
            };

            // add qt settings for the new instance as well
            tinyMCEPreInit.qtInit[newid] = qtsettings;

            // create new instance
            ed = new tinymce.Editor(newid, settings);

            // render new instance
            ed.render();

            // add quicktags
            var qt = new QTags(qtsettings);

            // hackish..set a short delay to reset the new editor to visual mode and hide qt buttons
            // this is necessary :/
            setTimeout(function() {
                $(parent).removeClass('html-active').addClass('tmce-active');
                QTags._buttonsInit();
            },
                    1500);
        },
        /*
         * Handles TinyMCE removal, since TinyMCE doesn't like to be moved inside the DOM
         * this has to be called on every instance whenever sortables is working
         *
         */
        remove_tinymce: function()
        {
            // ipad / mobile condition
            if (typeof (tinyMCE) === 'undefined')
                return false;

            // do nothing if it is the native editor
            $('.wp-editor-wrap').each(function() {
                if ($(this).attr('id') === 'wp-content-wrap')
                {
                    // do nothing
                } else
                {
                    // get the id
                    textarea = jQuery(this).find('textarea').attr('id');
                    // remove controls
                    tinyMCE.execCommand('mceRemoveControl', false, textarea);
                }
            });
        },
        /*
         * When sortable is done, restore tinymce functionality to each instance
         */

        restore_tinymce: function()
        {

            if (typeof (tinyMCE) === 'undefined')
                return false;

            jQuery('#kontentblocks_stage .wp-editor-wrap').each(function()
            {
                // find all textareas with tinymce support
                textarea = jQuery(this).find('textarea').attr('id');
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
        /*
         * Handles resorting of Blocks and stores the new order via ajax
         */

        resort: function() {

            var post_id = jQuery('#post_ID').val();
            data = {};

            jQuery('.kb_sortable').each(function() {
                data[this.id] = jQuery('#' + this.id).sortable('serialize', {
                    attribute: 'rel'
                });
            })

            KB.ajax(
                    {
                        action: 'resortModules', //'kb_sort_blocks',
                        data: data,
                        post_id: post_id
                    },
            function(response)
            {
                KB.notice(kontentblocks.l18n.block_resorting);
            });
        },
        notice: function(msg, type) {
            noty(
                    {"text": msg,
                        layout: "topRight",
                        type: type,
                        textAlign: "center",
                        easing: "swing",
                        animateOpen: {"opacity": "toggle"},
                        animateClose: {"opacity": "toggle"},
                        speed: "750",
                        timeout: "2500",
                        closable: true,
                        closeOnSelfClick: true});
        },
        confirm: function(msg, pos_cb, neg_cb)
        {
            noty({
                text: msg,
                speed: "350",
                modal: true,
                layout: "center",
                buttons: [
                    {type: 'button green', text: 'Ok', click: function() {
                            if (typeof (pos_cb) == 'function') {
                                pos_cb();
                            }
                        }},
                    {type: 'button pink', text: 'Cancel', click: function() {
                            if (typeof (neg_cb) == 'function') {
                                neg_cb();
                            }
                        }}
                ],
                closable: false,
                timeout: false
            });
        },
        alert: function(msg, pos_cb, neg_cb)
        {
            noty({
                text: msg,
                speed: "350",
                modal: true,
                layout: "center",
                buttons: [
                    {type: 'button green', text: 'Ok', click: function() {
                            if (typeof (pos_cb) == 'function') {
                                pos_cb();
                            }
                        }}
                ],
                closable: false,
                timeout: false
            });
        },
        /* Wrapper for generic ajax requests
         * handles nonce as well, so no need to do the same things over and over again
         */

        // Keep 4 Kontentfields ?
        ajax: function(data, callback)
        {
            // get nonce
            nonce = $('#_kontentblocks_ajax_nonce').val();

            // post ID
            post_id = $('#post_ID').val();

            // add extra data
            data._kb_nonce = nonce;
            data.post_id = post_id;
            data.kbajax = 'true';

            $(kbMetaBox).addClass('kb_loading');
            $('#publish').attr('disabled', 'disabled');

            $.ajax({
                url: ajaxurl,
                data: data,
                type: 'POST',
                dataType: 'json',
                success: function(data) {

                    // security check failed
                    if (data == 'nonce unset')
                    {
                        KB.notice(kontentblocks.l18n.sec_nonce_failed, 'error');
                        callback(false);
                    }
                    else if (data == 'wrong nonce')
                    {
                        KB.notice(kontentblocks.l18n.sec_nonce_failed, 'error');
                        callback(false)
                    } else
                    {
                        // call callback function and pass response to it
                        callback(data);
                    }
                },
                error: function() {
                    // generic error message
                    KB.notice('<p>Generic Ajax Error</p>', 'error');
                },
                complete: function() {
                    $(kbMetaBox).removeClass('kb_loading');
                    $('#publish').removeAttr('disabled');
                }
            })

        },
        blockLock: function(caller)
        {
            $('#' + activeBlock + ' .kb-ajax-status').show();
            var $object = $(caller);
            var this_id = activeBlock;

            KB.ajax(
                    {
                        action: 'kb_lock_block',
                        block_id: this_id
                    },
            function(response)
            {
                if (response == false)
                {
                    $('.kb-ajax-status').hide();
                    return;
                }
                else if (response == 1) {
                    KB.notice(kontentblocks.l18n.block_locked, 'alert');
                } else if (response == 2) {
                    KB.notice(kontentblocks.l18n.block_unlocked, 'alert');
                }

                $('#' + activeBlock).toggleClass('locked');

                if ($object.hasClass('locked'))
                {
                    $object.removeClass('locked');
                    $object.addClass('unlocked');
                }
                else
                {
                    $object.removeClass('unlocked');
                    $object.addClass('locked');
                }

                if ($('#' + activeBlock).hasClass('kb-open'))
                {
                    $('#' + activeBlock).find('.kb_inner').slideToggle('fast');
                    $('#' + activeBlock).removeClass('kb-open');
                }

                $('.kb-ajax-status').hide();
            })
        },
        validateForm: function(form)
        {
            return !$(form).find('.form-required').filter(
                    function()
                    {
                        return $('input:visible', this).val() == '';
                    })
                    .addClass('form-invalid')
                    .find('input:visible')
                    .change(
                            function()
                            {
                                $(this).closest('.form-invalid')
                                        .removeClass('form-invalid');
                            })
                    .size();
        },
        isLocked: function()
        {
            return $('#' + activeBlock).hasClass('locked');
        },
        isDisabled: function()
        {
            return $('#' + activeBlock).hasClass('disabled');
        }
    })
})(jQuery);

jQuery(document).ready(function($) {

    // init KB
    KB.init();


    $('#stage-inner').delegate('.kb_save_area', 'click', function(e) {
        e.preventDefault();
        var area_id = $(this).prevAll('select:first').val();
        var block_id = $(this).closest('.kb_block').attr('id');
        $.post(
                ajaxurl,
                {
                    action: 'kb_save_area',
                    block_id: block_id,
                    area_id: area_id
                },
        function(response) {
            area_meta = $('#' + block_id + ' .area-meta');
            $(area_meta).fadeTo(500, 0, function() {
                $(this).empty();
                $(this).append(response).fadeTo(500, 1);
            })
        });
    });

    $('.kb_area_head').mousedown(function() {
        activeArea = $(this).next().attr('id');
    });


}); // end document ready