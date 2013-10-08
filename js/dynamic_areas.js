var KBDynamicArea;

(function($) {

    KBDynamicArea = {
        init: function() {
            KB.blockCreate = KBDynamicArea.blockCreate;
            KB.blockDelete = KBDynamicArea.blockDelete;
            KB.resort = KBDynamicArea.resort;
            KB.blockStatus = KBDynamicArea.blockStatus;
            KB.duplicateBlock = KBDynamicArea.duplicateBlock;
        },
        blockStatus: function(caller)
        {
            $('#' + activeBlock + ' .kb-ajax-status').show();
            var object = $(caller);
            var this_id = activeBlock;

            KB.ajax(
                    {
                        action: 'kb_change_status_dynamic',
                        block_id: this_id,
                        area_id: activeArea
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
        duplicateBlock: function()
        {
            KB.confirm(
                    kontentblocks.l18n.block_duplicate,
                    function()
                    {
                        KB.duplicate = activeBlock;
                        KB.postContext = false;
                        KB.blockCreate($('#' + activeBlock));
                    },
                    function()
                    {
                        KB.notice(kontentblocks.l18n.block_duplicate_success);
                    }
            );

        },
        resort: function() {
            data = {};

            jQuery('.kb_sortable').each(function() {
                data[this.id] = jQuery('#' + this.id).sortable('serialize', {
                    attribute: 'rel'
                });
            })

            KB.ajax(
                    {
                        action: 'resortModules', //'kb_sort_blocks_dynamic',
                        data: data,
                        area_id: activeArea
                    },
            function(response)
            {

                KB.notice(kontentblocks.l18n.block_resorting);
            })
        },
        blockCreate: function(caller)
        {
            var kb_type = ($(caller).attr('data-value')) ? $(caller).attr('data-value') : $(caller).attr('data-blockclass'),
                    kb_count = $('#kb_all_blocks').val();
            template = ($(caller).attr('data-instance_id')) ? $(caller).attr('data-instance_id') : false;
            master = ($(caller).attr('data-master')) ? $(caller).attr('data-master') : false;
            // block limit
            list_limit = $('#' + activeArea).attr('data-limit');
            list_children = $('#' + activeArea + ' li.kb_block').length;

            if (list_limit != 0 && list_children == list_limit) {
                KB.alert(kontentblocks.l18n.area_create_full);
                return false;
            }
            $(this).parent().fadeOut('fast');
            var spinner = $(caller).closest('.kb_area_head').find('.kb-ajax-status');
            $(spinner).show();
            // fire ajax request, gets the block html and append it the "stage"

            var data = {
                type: kb_type,
                count: kb_count,
                area: activeArea,
                template: template,
                master: master,
                duplicate: KB.duplicate,
                post_id: -1,
                context: $('#area_context').val()
            };

            KB.ajax(
                    {
                        action: 'kb_generate_blocks',
                        data: data
                    },
            function(response)
            {
                KB.duplicate = false;
                result = response;
                // #kb_main, should get rid of this rigid structure
                $('#' + activeArea).append(result.html);
                $(spinner).hide();

                // ugly way, sets the global var latestBlock to the id of the new generated block
                latestBlock = result.id;
                // update count
                kb_count = parseInt(kb_count) + 1;
                $('#kb_all_blocks').val(kb_count);

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
                                    action: 'kb_remove_block_dynamic',
                                    block_id: this_id,
                                    area_id: activeArea
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
                            $('#' + activeBlock).slideUp(750, function() {
                                $(this).remove();
                            });
                        })
                    },
                    function()
                    {
                        KB.notice('Allright, lets keep it then');
                    }

            );

        }
    }

})(jQuery);

jQuery(document).ready(function($) {
    $('body').on('module::opened', function() {
        $('.nano').nanoScroller();
    });
    // init KB
    KBDynamicArea.init();
    $('.nano').nanoScroller();

});