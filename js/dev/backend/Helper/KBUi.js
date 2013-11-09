/**
 * 
 * These is a collection of helper functions to handle
 * the user interface / user interaction such as 
 * - Sorting
 * - TinyMCE De-/Initialization
 * - Tabs initialization
 * - UI repainting / updating
 * 
 * @package Kontentblocks
 * @subpackage Backend/UI
 * @type @exp; KB
 */

var KB = KB || {};

KB.Ui = (function($) {

    return {
        init: function(){
            var that = this;
            // init Sortable
            this.initSortable();
            
            // Bind AjaxComplete, restoring TinyMCE after global MEtaBox reordering
            jQuery(document).ajaxComplete(function(e, o, settings)
            {
                that.metaBoxReorder(e, o, settings, 'restore');
            });

            // Bind AjaxSend to remove TinyMCE before global MetaBox reordering
            jQuery(document).ajaxSend(function(e, o, settings)
            {
                that.metaBoxReorder(e, o, settings, 'remove');
            });
            
        },
        initTabs: function() {

            $('.kb_fieldtabs').tabs({
                activate: function() {
//                       var $window = $(window).height();
//                        $('.content').height($window - 250);
                    // re-init nano scroller
                    $('.nano').nanoScroller();
                }
            });

            $('.kb_fieldtabs').each(function() {

                var length = $('.kb_fieldtabs li').length;
                if (length === 1)
                {
                    $(this).find('.ui-tabs-nav').css('display', 'none');
                }
            });
        },
        initSortable: function() {

            var currentModule, areaOver;
            var validModule = false;
            var that = this;

            /*
             * Test if the current sorted module
             * is allowed in (potentially) new area
             * Checks if either the module limit of the area
             * has been reached or if the current module
             * type is not in the array of assigned modules
             * of the area
             */
            function isValidModule() {
                if (_.indexOf(areaOver.get('assignedModules'), currentModule.get('settings').class) === -1 &&
                        areaOver.get('limit') <= filterModulesByArea(areaOver.get('id')).length) {
                    KB.Notice.notice('Not allowed here', 'error');
                    return false;
                } else {
                    return true;
                }
            }

            /**
             * Get an array of modules by area id 
             * @param id string
             * @returns array of all found modules in that area
             */
            function filterModulesByArea(id) {
                return _.filter(KB.Modules.models, function(model) {
                    return model.get('area').get('id') === id;
                });
            }

            // handles sorting of the blocks.
            $('.kb_sortable').sortable({
                //settings
                placeholder: "ui-state-highlight",
                ghost: true,
                connectWith: ".kb_connect",
                handle: '.kb-move',
                cancel: 'li.disabled, li.cantsort',
                tolerance: 'pointer',
                delay: 150,
                revert: 350,
                // start event
                start: function(event, ui)
                {
                    // set current model 
                    currentModule = KB.Modules.get(ui.item.attr('id'));
                    currentModule.view.$body.hide();
                    // close open modules, sorting on open container
                    // doesn't work very well
                    $('.kb-open').toggleClass('kb-open');
                    $('.kb_inner').hide();

                    // tinyMCE doesn't like to be moved in the DOM
                    KB.TinyMCE.removeEditors();

                    // Add a global trigger to sortable.start, maybe other Blocks might need it
                    $(document).trigger('kb_sortable_start', [event, ui]);
                },
                stop: function(event, ui)
                {
                    var serializedData = [];

                    // restore TinyMCE editors 
                    KB.TinyMCE.restoreEditors();

                    // global trigger when soprtable is done		
                    $(document).trigger('kb_sortable_stop', [event, ui]);

                },
                over: function(event, ui)
                {
                    // keep track of target area
                    areaOver = KB.Areas.get(this.id);
                },
                receive: function(event, ui) {

                    if (!isValidModule()) {
                        // inform the user
                        KB.Notice.notice('Module not allowed in this area');
                        // cancel sorting
                        $(ui.sender).sortable('cancel');
                    }
                },
                update: function(ev, ui) {

                    // update will fire twice when modules are
                    // moved between two areas, once for each list
                    // this makes sure that the right action(s) are only done once
                    if (this === ui.item.parent('ul')[0] && !ui.sender) {
                        // function call applies when target area == orign
                        $.when(that.resort(ui.sender)).done(function() {
                            KB.Notice.notice('Order was updated successfully', 'success');
                        });
                    } else if (ui.sender) {
                        // function call applies when target area != origin
                        // chain reordering and change of area
                        $.when(that.changeArea(areaOver, currentModule)).
                                then(function() {
                                    that.resort(ui.sender);
                                }).
                                done(function() {
                                    KB.Notice.notice('Area change and order were updated successfully', 'success');
                                });
                    }
                }
            });
        },
        /**
         * Handles saving of new module order per area
         * @param sender jQueryUI sortable sender list
         * @returns {jqXHR}
         */
        resort: function(sender) {
            // serialize data
            var serializedData = {};
            $('.kb_sortable').each(function() {
                serializedData[this.id] = $('#' + this.id).sortable('serialize', {
                    attribute: 'rel'
                });
            });

            return KB.Ajax.send({
                action: 'resortModules',
                data: serializedData
            });
        },
        /**
         * 
         * @param object targetArea
         * @param object module
         * @returns {jqXHR}
         */
        changeArea: function(targetArea, module) {
            return KB.Ajax.send({
                action: 'changeArea',
                block_id: module.get('instance_id'),
                area_id: targetArea.get('id')
            });
        },
        toggleModule: function() {
            
            $('body').on('click', '.kb-toggle', function() {
                if (KB.isLocked() && !KB.userCan('lock_kontentblocks'))
                {
                    KB.notice(kontentblocks.l18n.gen_no_permission, 'alert');
                }
                else
                {
                    $(this).parent().nextAll('.kb_inner:first').slideToggle('fast', function() {
                        $('body').trigger('module::opened');
                    });
                    $('#' + activeBlock).toggleClass('kb-open', 1000);
                }
            });
        },
        metaBoxReorder: function(e, o ,settings, action) {
            
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
        }

    };

}(jQuery));