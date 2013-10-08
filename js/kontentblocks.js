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

    KB = {
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

            // init chosen
            //KB.initChzn();

            // init title toggle
            KB.titleToggle();

            // init sortable
            if (KB.userCan('sort_kontentblocks'))
            {
                KB.kbSortable();
            }

            // Bind block delete
            $(kbMetaBox).on('click', '.kb_delete_block', function(e)
            {
                if (KB.isDisabled())
                {
                    KB.notice(kontentblocks.l18n.block_disabled_delete, 'alert');
                }
                else
                {
                    KB.blockDelete();
                }
            });

            $(kbMetaBox).on('click', '.modules-link', function(e) {
                e.preventDefault();

                activeArea = $(this).attr('data-area');
                openedModal = vex.open({
                    content: $('#' + activeArea + '-nav').html(),
                    afterOpen: function() {
                        KB.menutabs();
                        var $el = $('#' + activeArea + '-nav');
//                        if ($el.find('.ui-tabs-panel').length > 0) {
//                            $el.find('.ui-tabs-panel').jScrollPane();
//                        }
                    },
                    contentClassName: 'modules-menu'
                });

            });


            $(kbMetaBox).on('click', '.kb-duplicate', function(e)
            {
                KB.duplicateBlock();
            });

            // Bind set status
            $(kbMetaBox).on('click', '.kb_set_status', function(e) {
                $caller = $(this);
                if (KB.isDisabled())
                {
                    KB.notice(kontentblocks.l18n.block_disabled_delete, 'alert');
                }
                else
                {
                    KB.blockStatus($caller);
                }
            });


            // Bind locking
            $(kbMetaBox).on('click', '.kb-lock', function(e)
            {
                $caller = $(this);
                e.preventDefault();
                if (KB.userCan('lock_kontentblocks'))
                {
                    KB.blockLock($caller);
                }
                else if (!KB.userCan('lock_kontentblocks'))
                {
                    KB.notice(kontentblocks.l18n.sec_no_permission, 'alert');
                }
            });



            // Bind AjaxComplete, restoring TinyMCE after global MEtaBox reordering
            jQuery(document).ajaxComplete(function(e, o, settings)
            {
                KB.metaBoxReorder(e, o, settings, 'restore');
            });

            // Bind AjaxSend to remove TinyMCE before global MetaBox reordering
            jQuery(document).ajaxSend(function(e, o, settings)
            {
                KB.metaBoxReorder(e, o, settings, 'remove');
            });

            // Overrides the WP original function to keep an eye on dynamically generated editors
            $(kbMetaBox).on('mousedown', '.wp-editor-wrap', function(e) {
                wpActiveEditor = this.id.slice(3, -5);
            });

            $(kbMetaBox).on('mousedown', '.quicktags', function(e) {
                wpActiveEditor = $(this).find('textarea').attr('id');
            });




            // set the global activeBlock variable dynamically
            $('body').on('mousedown', '.kb_block', function(e) {
                activeBlock = this.id;
            });

            // set the global activeField variable dynamically
            $('body').on('mousedown', '.kb_field', function(e) {
                activeField = this;
            });


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
        titleToggle: function()
        {
            $(kbMetaBox).on('click', '.kb-toggle', function() {
                if (KB.isLocked() && !KB.userCan('lock_kontentblocks'))
                {
                    KB.notice(kontentblocks.l18n.gen_no_permission, 'alert');
                }
                else
                {


                    $(this).parent().nextAll('.kb_inner:first').slideToggle('fast', function(){
                        $('body').trigger('module::opened');
                    });
                    $('#' + activeBlock).toggleClass('kb-open', 1000);
                }
            });

            // initially toggle all blocks
            $(' .kb_inner').hide();
        },
        initChzn: function()
        {
            //$('.chzn').chosen();
        },
        // handles dynamic creation of TinyMCE instances
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
                        }},
                ],
                closable: false,
                timeout: false
            });
        },
        /* Wrapper for generic ajax requests
         * handles nonce as well, so no need to do the same things over and over again
         */

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
        metaBoxReorder: function(e, o, settings, action)
        {
            if (settings.data)
            {
                var a = settings.data;
                var b = a.split('&');
                var result = {};
                $.each(b, function(x, y) {
                    var temp = y.split('=');
                    result[temp[0]] = temp[1];
                });

                if (result.action === 'meta-box-order') {
                    if (action === 'restore')
                    {
                        KB.restore_tinymce();
                    }
                    else if (action === 'remove')
                    {
                        KB.remove_tinymce();
                    }
                }
            }
        },
        kbSortable: function()
        {
            // to do: get rid of stage inner
            // handles sorting of the blocks.
            $('.kb_sortable').sortable(
                    {
                        //settings
                        placeholder: "ui-state-highlight",
                        ghost: true,
                        connectWith: ".kb_connect",
                        handle: '.kb-move',
                        cancel: 'li.disabled, li.cantsort',
                        // start event
                        start: function(event, ui)
                        {
                            $(ui.item).find('.kb_inner').hide();
                            $('.kb-open').toggleClass('kb-open');
                            $('.kb_inner').hide();
                            KB.remove_tinymce();
                            // Add a global trigger to sortable.start, maybe other Blocks might need it
                            $(document).trigger('kb_sortable_start', [event, ui]);
                        },
                        stop: function(event, ui)
                        {
                            KB.restore_tinymce();
                            // global trigger when soprtable is done		
                            $(document).trigger('kb_sortable_stop', [event, ui]);
                        },
                        over: function(event, ui)
                        {
                            var area_id = this.id;
                            // type blacklist
                            var blacklist = $('#' + area_id).attr('data-blacklist');
                            if (blacklist !== '')
                            {
                                blackblocks = blacklist.split(' ');
                            }
                            else
                            {
                                blackblocks = {};
                            }
                            // ''
                            itemclass = ui.item[0].dataset.blockclass;
                            blacklisted = $.inArray(itemclass, blackblocks);

                            if (blacklisted === -1)
                            {
                                //$(ui.helper).addClass('disabled');
                                console.log('line 544:' + ui.helper);
                            }
                            else
                            {
                                //$(ui.helper).removeClass('disabled');
                                console.log('line 548:' + ui.helper);

                            }
                        },
                        receive: function(event, ui) {

                            var area_id = this.id;
                            var block_id = activeBlock;

                            // block limit
                            var block_limit = $('#' + area_id).attr('data-limit');

                            var present_blocks = $('#' + area_id + ' .kb_block').length;

                            // type blacklist
                            var blacklist = $('#' + area_id).attr('data-blacklist');
                            if (blacklist !== '')
                            {
                                blackblocks = blacklist.split(' ');
                            }
                            else
                            {
                                blackblocks = {};
                            }
                            // ''
                            itemclass = ui.item[0].dataset.blockclass;
                            blacklisted = $.inArray(itemclass, blackblocks);

                            // first check if block is blacklisted and throw alert, else check for block limit

                            if (blacklisted === -1)
                            {
                                KB.alert(kontentblocks.l18n.area_block_not_allowed,
                                        function()
                                        {
                                            $(ui.sender).sortable('cancel');
                                            return;
                                        });
                            }
                            else if (block_limit !== '0' && present_blocks > block_limit) {

                                KB.alert(kontentblocks.l18n.area_sort_full,
                                        function()
                                        {
                                            $(ui.sender).sortable('cancel');
                                            return;
                                        });
                            } else
                            {

                                KB.ajax(
                                        {
                                            action: 'kb_save_area',
                                            block_id: block_id,
                                            area_id: area_id
                                        },
                                function(response)
                                {
                                    // revert back if response is not valid, due to verification
                                    if (false == response)
                                    {
                                        $(ui.sender).sortable('cancel');
                                        return;
                                    }
                                    else
                                    {

                                        KB.notice('Area change saved', 'alert');
                                        KB.resort();
                                    }



                                })
                            }

                        },
                        update: function(ev, ui) {
                            // var post_id = jQuery('#post_ID').val();
                            data = {};

                            jQuery('.kb_sortable').each(function() {
                                data[this.id] = jQuery('#' + this.id).sortable('serialize', {
                                    attribute: 'rel'
                                });
                            })

                            if (this === ui.item.parent('ul')[0] && !ui.sender) {
                                KB.resort();

                            } else if (ui.sender) {
                                // do nothing
                            }
                        }
                    });
        },
        duplicateBlock: function()
        {
            KB.confirm(
                    kontentblocks.l18n.block_duplicate,
                    function()
                    {
                        KB.duplicate = activeBlock;
                        KB.blockCreate($('#' + activeBlock));
                    },
                    function()
                    {
                        KB.notice(kontentblocks.l18n.block_duplicate_success);
                    }
            );

        },
        blockCreate: function(caller)
        {
            var data = {};

            data.type = ($(caller).attr('data-value')) ? $(caller).attr('data-value') : $(caller).attr('data-blockclass'),
                    data.template = ($(caller).attr('data-instance_id')) ? $(caller).attr('data-instance_id') : false;
            data.master = ($(caller).attr('data-master')) ? true : false;
            data.page_template = $('#' + activeArea).attr('data-page_template');
            data.post_type = $('#' + activeArea).attr('data-post_type') ? $('#' + activeArea).attr('data-post_type') : false;
            data.post_id = $('#post_ID').val(),
                    data.count = $('#kb_all_blocks').val();
            data.duplicate = KB.duplicate;
            data.area = activeArea;
            data.context = $('#' + activeArea).attr('data-context');

            // block limit
            list_limit = $('#' + activeArea).attr('data-limit');
            list_children = $('#' + activeArea + ' li.kb_block').length;


            if (list_limit !== 0 && list_children === list_limit) {
                KB.alert(kontentblocks.l18n.area_create_full);

                return false;
            }
            $(this).parent().fadeOut('fast');
            var spinner = $(caller).closest('.kb_area_head').find('.kb-ajax-status');
            $(spinner).show();
            // fire ajax request, gets the block html and append it the "stage"

            KB.ajax(
                    {
                        action: 'kb_generate_blocks',
                        data: data
                    },
            function(response)
            {
                KB.duplicate = false;

                result = response
                // #kb_main, should get rid of this rigid structure
                $('#' + activeArea).append(result.html);
                $(spinner).hide();
                // ugly way, sets the global var latestBlock to the id of the new generated block
                latestBlock = result.id;
                // update count
                data.count = parseInt(data.count) + 1;

                $('#kb_all_blocks').val(data.count);

                // hides the advanced options panel
                $('.kb_properties_title').nextAll('.kb_properties').hide();

                // see top of file, re-initiate fancy select boxes
                //KB.initChzn();

                // Handles initiation of newly added instances of the Wordpress Editor.
                // Includes TinyMce and Quicktag Buttons

                // find the ID of the textarea, should use @latestBlock instead		
                textareas = jQuery('#' + latestBlock).find('.wp-editor-wrap textarea');

                $(textareas).each(function() {
                    var daddy = $(this).closest('.wp-editor-wrap');
                    var newid = $(this).attr('id');

                    // add tiny mce
                    KB.tinymce(newid, daddy);

                })

                // add / trigger global event
                $(document).trigger('kb_block_added');

            })
        },
        blockDelete: function()
        {
            KB.confirm(
                    kontentblocks.l18n.block_delete,
                    function()
                    {
                        $('#' + activeBlock + ' .kb-ajax-status').show();
                        var this_id = activeBlock;

                        KB.ajax(
                                {
                                    action: 'kb_remove_block',
                                    block_id: this_id
                                },
                        function(response)
                        {
                            if (response == 1)
                            {
                                KB.notice(kontentblocks.l18n.block_deleted_and_data, 'alert');
                            } else if (response == 0)
                            {
                                KB.notice(kontentblocks.l18n.block_delete_error, 'error');
                            } else if (response == 2)
                            {
                                KB.notice(kontentblocks.l18n.block_deleted, 'alert')
                            }
                            $('#' + activeBlock).slideUp(350, function() {
                                $(this).remove();
                            });
                        })
                    },
                    function()
                    {
                        KB.notice('Allright, lets keep it then');
                    }
            );

        },
        blockStatus: function(caller)
        {
            $('#' + activeBlock + ' .kb-ajax-status').show();
            var object = $(caller);
            var this_id = activeBlock;

            KB.ajax(
                    {
                        action: 'kb_change_status',
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
                    KB.notice(kontentblocks.l18n.block_deactivated, 'alert');
                } else if (response == 2) {
                    KB.notice(kontentblocks.l18n.block_reactivated, 'alert');
                }

                $('#' + activeBlock).toggleClass('kb_inactive');
                $(object).toggleClass('kb_inactive');
                $('.kb-ajax-status').hide();
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
        userCan: function(cap)
        {
            check = $.inArray(cap, kontentblocks.caps);
            if (check != -1)
            {
                return true;
            }
            else
            {
                return false;
            }
        },
        isLocked: function()
        {
            return $('#' + activeBlock).hasClass('locked');
        },
        isDisabled: function()
        {
            return $('#' + activeBlock).hasClass('disabled');
        }
    }
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


    var mouse_inside_menu = false;
    var kb_menu_open = false;


    $('body').on('click', '.kb_dd_menu', function(data, handler) {
        data.preventDefault();
        if (data.target == this)
        {
            menus = $('.kb_open');
            $(menus).each(function() {
                if ($(this).hasClass('kb_open')) {
                    $(this).fadeOut('fast').toggleClass('kb_open');

                }
            })
            menu = $(this).parent().find('.kb_dd_list');
            $(menu).slideToggle('fast').toggleClass('kb_open');

        }

    });

    $('.kb_dd_menu, .kb_dd_list').hover(function() {
        mouse_inside_menu = true;
    }, function() {
        mouse_inside_menu = false;
    });

    $('body').mouseup(function() {
        if (mouse_inside_menu == false) {
            menus = $('.kb_open');
            $(menus).each(function() {
                if ($(this).hasClass('kb_open')) {
                    $(this).fadeOut('fast').toggleClass('kb_open');

                }
            })
        }
    });

    $('.kb_area_head').mousedown(function() {
        activeArea = $(this).next().attr('id');
    });

    // Create new Block from Menu
    /*$('.kb_the_menu li').click(function(){
     caller = $(this);
     if (KB.userCan('create_kontentblocks'))
     {
     KB.blockCreate(caller);
     menus = $('.kb_open');
     $(menus).each(function(){
     if ($(this).hasClass('kb_open')){
     $(this).fadeOut('fast').toggleClass('kb_open');
     
     }
     })
     }
     else
     {
     KB.notice(kontentblocks.l18n.sec_no_permission, 'alert');
     }
     
     });*/

    $('body').on('click', '.blocks-menu li', function() {
        caller = $(this);
        
        if (KB.userCan('create_kontentblocks'))
        {
            vex.close(openedModal.data().vex.id);

            KB.blockCreate(caller);
            menus = $('.kb_open');
            $(menus).each(function() {
                if ($(this).hasClass('kb_open')) {
                    $(this).fadeOut('fast').toggleClass('kb_open');
                }
            });
        }
        else
        {
            KB.notice(kontentblocks.l18n.sec_no_permission, 'alert');
        }

    });

}); // end document ready