'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.AreasCollection = Backbone.Collection.extend({
}); 
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModulesCollection = Backbone.Collection.extend({
    
}); 
var KB = KB || {};

KB.Ajax = (function($) {

    return {
        send: function(data, callback, scope) {
            data.supplemental = data.supplemental || {};
            data.count = parseInt($('#kb_all_blocks').val());
            data.nonce = $('#_kontentblocks_ajax_nonce').val();
            data.post_id = parseInt($('#post_ID').val()) || -1;
            data.kbajax = true;

            $(kbMetaBox).addClass('kb_loading');
            $('#publish').attr('disabled', 'disabled');

            return $.ajax({
                url: ajaxurl,
                data: data,
                type: 'POST',
                dataType: 'json',
                success: function(data) {
                    if (data) {
                        if (scope && callback){ 
                            callback.call(scope, data);
                        } else if (callback) {
                            callback(data);
                        }
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
        }

    };
}(jQuery));
var KB = KB || {};

KB.Checks = (function($) {
    return {
        blockLimit: function(areamodel) {
            var limit = areamodel.get('limit');
            var children = areamodel.get('assignedModules').length;
            if (limit === 0) {
                return false;
            }

            if (children === limit) {
                return false;
            }

            return true;
        },
        userCan: function(cap) {
            var check = $.inArray(cap, kontentblocks.caps);
            if (check !== -1)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    };
}(jQuery));
'use strict';

var KB = KB || {};

KB.Notice = (function($) {

    return {
        notice: function(msg, type) {
            alertify.log(msg, type, 3500);
        },
        confirm: function(msg, yes, no) {
            alertify.confirm(msg, function(e) {
                if (e) {
                    yes();
                } else {
                    no();
                }
            });
        }
    };

}(jQuery));
var KB = KB || {};
KB.Templates = (function($) {

    var tmpl_cache = {};

    function getTmplCache(){
        return tmpl_cache;
    }

    function render(tmpl_name, tmpl_data) {
        
        if (!tmpl_cache[tmpl_name]) {
            var tmpl_dir = kontentblocks.config.url + 'js/templates';
            var tmpl_url = tmpl_dir + '/' + tmpl_name + '.html';

            var tmpl_string;
            $.ajax({
                url: tmpl_url,
                method: 'GET',
                async: false,
                success: function(data) {
                    tmpl_string = data;
                }
            });

            tmpl_cache[tmpl_name] = _.template(tmpl_string);
        }
        return tmpl_cache[tmpl_name](tmpl_data);
    }
    

    return {
        render: render
    };
}(jQuery));
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
            console.log(settings);
            $('.wp-editor-area', KB.lastAddedModule.view.$el).each(function() {
                var id = this.id;

                // add new editor id to settings
                settings['elements'] = id;
                new tinymce.Editor(id, settings).render();
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
 * @type @exp;KB
 */

var KB = KB || {};

KB.Ui = (function($) {

    return {
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
        }

    };

}(jQuery));
var KB = KB || {};

KB.ViewsCollection = function() {
    this.views = {};

    this.add = function(id, view) {
        this.views[id] = view;
        
    };

    this.remove = function(id) {
        var view = this.get(id);
        view.$el.fadeOut(500, function() {
            view.remove();
        });
        delete this.views[id];
    };

    this.get = function(id) {
        if (this.views[id]) {
            return this.views[id];
        }
    };

};
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.AreaModel = Backbone.Model.extend({
    idAttribute: 'id'
});
var KB = KB || {};
KB.Backbone.ModuleMenuTileModel = Backbone.Model.extend({
    defaults: {
        template: false,
        master: false,
        duplicate: false
    }
});
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleModel = Backbone.Model.extend({
    idAttribute: 'instance_id',
    destroy: function() {
        var that = this;
        KB.Ajax.send({
            action: 'removeModules',
            instance_id: that.get('instance_id')
        }, that.destroyed);
    },
    destroyed: function(){
        console.log(this);
    }
});
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.AreaModuleMenuView = Backbone.View.extend({
    tilesViews: [],
    initialize: function() {
        var that = this;
        var $tiles = jQuery('.block-nav-item', this.$el);

        if ($tiles.length > 0) {
            _.each($tiles, function(tile) {
                that.tilesViews.push(new KB.Backbone.ModuleMenuTileView({
                    model: new KB.Backbone.ModuleMenuTileModel(
                            jQuery(tile).data()
                            ),
                    el: tile,
                    area: that.options.area,
                    parentView: that.options.parentView
                }));
            });
        }


    }

});
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.AreaView = Backbone.View.extend({
    initialize: function() {
        this.controlsContainer = jQuery('.add-modules', this.$el);
        this.settingsContainer = jQuery('.kb-area-settings-wrapper', this.$el);
        this.modulesList = jQuery('#' + this.model.get('id'), this.$el);
        this.model.view = this;
        this.render();
        console.log(this);
    },
    events: {
        'click .modules-link': 'openModulesMenu',
        'click .js-area-settings-opener' : 'toggleSettings'
    },
    render: function() {
        this.addControls();
    },
    addControls: function() {
        this.controlsContainer.append(KB.Templates.render('be_areaAddModule', {}));
    },
    openModulesMenu: function(e) {
        e.preventDefault();
        var that = this;
        KB.openedModal = vex.open({
            content: jQuery('#' + that.model.get('id') + '-nav').html(),
            afterOpen: function() {
                KB.menutabs();
                that.menuView = new KB.Backbone.AreaModuleMenuView({
                    el: this.$vexContent,
                    area: that.model.get('id'),
                    parentView: that
                });
            },
            afterClose: function(){
                that.menuView.remove();
            },
            contentClassName: 'modules-menu'
        }) || null;
    },
    toggleSettings:function(e){
        e.preventDefault();
        this.settingsContainer.slideToggle().toggleClass('open');
        KB.currentArea = this.model;
    }

});
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleMenuItemView = Backbone.View.extend({
    tagName: 'div',
    className: '',
    isValid: function() {
        return true;
    }
});
'use strict';

var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleDelete = KB.Backbone.ModuleMenuItemView.extend({
    className: 'kb-delete block-menu-icon',
    initialize: function() {
        _.bindAll(this, "yes", "no");
    },
    events: {
        'click': 'deleteModule'
    },
    deleteModule: function() {
        KB.Notice.confirm('Really?', this.yes, this.no);
    },
    isValid: function() {
        if (!this.model.get('predefined') &&
                !this.model.get('disabled') &&
                KB.Checks.userCan('delete_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    },
    yes: function() {
        KB.Ajax.send({
            action: 'removeModules',
            module: this.model.get('instance_id')
        }, this.success, this);
    },
    no: function() {
        return false;
    },
    success: function() {
        KB.Modules.remove(this.model);
        KB.Notice.notice('Good bye', 'success');
    }
}); 
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleDuplicate = KB.Backbone.ModuleMenuItemView.extend({
    className: 'kb-duplicate block-menu-icon',
    events: {
        'click': 'duplicateModule'
    },
    duplicateModule: function() {
        KB.Ajax.send({
            action: 'duplicateModule',
            module: this.model.get('instance_id'),
            page_template: KB.Screen.page_template,
            post_type: KB.Screen.post_type,
            area_context: this.model.get('area').get('context')
        }, this.success, this);

    },
    isValid: function() {
        if (!this.model.get('predefined') &&
                !this.model.get('disabled') &&
                KB.Checks.userCan('edit_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    },
    success: function(data) {
        this.model.get('area').view.modulesList.append(data.html);
        KB.Modules.add(data.module);

    }
}); 
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleStatus = KB.Backbone.ModuleMenuItemView.extend({
    initialize: function(){
        var that = this;
        this.options.parent.$el.on('click', '.js-module-status', function(event){
            that.changeStatus();
        });
    },
    className: 'module-status block-menu-icon',
    events: {
        'click': 'changeStatus'
    },
    changeStatus: function() {
        this.options.parent.$head.toggleClass('module-inactive');
        this.options.parent.$el.toggleClass('kb_inactive');
        this.options.parent.$el.toggleClass('activated deactivated');
        
        KB.Ajax.send({
            action: 'changeModuleStatus',
            module: this.model.get('instance_id')
        }, this.success, this);
        
    },
    isValid: function() {
        
        if (!this.model.get('disabled') &&
                KB.Checks.userCan('deactivate_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    },
    success: function(){
        KB.Notice.notice('Status changed', 'success');
    }
}); 
var KB = KB || {};

KB.Backbone.ModuleMenuTileView = Backbone.View.extend({
    events: {
        'click': 'createModule'
    },
    createModule: function() {


        // check if capability is right for this action
        if (KB.Checks.userCan('create_kontentblocks')) {
            KB.Notice.notice('Yeah', 'success');
        } else {
            KB.Notice.notice('Oh well', 'error');
        }

        // check if block limit isn't reached
        var Area = KB.Areas.get(this.options.area);
        if (KB.Checks.blockLimit(Area)) {
            KB.Notice.notice('Limit for this area reached', 'error');
            return false;
        }

        vex.close(KB.openedModal.data().vex.id);

        // prepare data to send
        var data = {
            action: 'createNewModule',
            type: this.model.get('type'),
            master: this.model.get('master'),
            template: this.model.get('template'),
            duplicate: this.model.get('duplicate'),
            page_template: KB.Screen.page_template,
            post_type: KB.Screen.post_type,
            area_context: this.model.get('context'),
            area: this.options.area
        };

        KB.Ajax.send(data, this.success, this);
    },
    success: function(data) {
        this.options.parentView.modulesList.append(data.html);
        KB.lastAddedModule = new KB.Backbone.ModuleModel(data.module);
        KB.Modules.add(KB.lastAddedModule);
        KB.TinyMCE.addEditor();
        // repaint
        // add module to collection
    }

});
'use strict';

var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleMenuView = Backbone.View.extend({
    $menuWrap: null,
    $menuList: null,
    events: {
        'click .kb_menu_opener' : 'toggleMenu'
    },
    initialize: function() {
        this.$menuWrap = jQuery('.menu-wrap', this.$el);
        this.$menuWrap.append(KB.Templates.render('be_moduleMenu', {}));
        this.$menuList = jQuery('.module-actions', this.$menuWrap);
    },
    addItem: function(view, model) {

        if (view.isValid && view.isValid() === true) {
            var $liItem = jQuery('<li></li>').appendTo(this.$menuList);
            var $menuItem = $liItem.append(view.el);
            this.$menuList.append($menuItem);
        }
    },
    toggleMenu: function(){
        this.$menuList.fadeToggle(250);
    }
});
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleView = Backbone.View.extend({
    $head: null,
    $body: null,
    ModuleMenu: null,
    events:{
        'click .kb-toggle' : 'toggleBody'
    },
    initialize: function() {
        
        // Setup Elements
        this.$head = jQuery('.block-head', this.$el);
        this.$body = jQuery('.kb_inner', this.$el);
        this.ModuleMenu = new KB.Backbone.ModuleMenuView({
            el: this.$el,
            parent: this
        });
        this.model.view = this;
        
        // Setup View
        this.setupDefaultMenuItems();
    },
    setupDefaultMenuItems: function() {
        this.ModuleMenu.addItem(new KB.Backbone.ModuleDuplicate({model: this.model, parent: this}));
        this.ModuleMenu.addItem(new KB.Backbone.ModuleDelete({model: this.model, parent: this}));
        this.ModuleMenu.addItem(new KB.Backbone.ModuleStatus({model: this.model, parent: this}));
    },
    toggleBody: function(){
        if (KB.Checks.userCan('edit_kontentblocks')){
            this.$body.slideToggle();
            KB.currentModule = this.model;
        }
    }

});
'use strict';
var KB = KB || {};

KB.currentModule = {};
KB.currentArea = {};
// ---------------
// Collections 
// ---------------

/*
 * Views, not a Backbone collection
 * simple getter/setter access point to views
 */
KB.Views = {
    Modules: new KB.ViewsCollection,
    Areas: new KB.ViewsCollection
};

/*
 * All Modules are collected here
 * Get by 'id'
 */
KB.Modules = new KB.Backbone.ModulesCollection([], {
    model: KB.Backbone.ModuleModel
});

/*
 *  All Areas are collected in this Backbone Collection
 *  Get by 'instance_id'
 */
KB.Areas = new KB.Backbone.AreasCollection([], {
    model: KB.Backbone.AreaModel
});

/*
 * Init function
 * Register event listeners
 * Create Views for areas and modules
 * None of this functions is meant to be used directly
 * from outside the function itself.
 * Use events on the backbone items instead
 * handle UI specific actions
 */
KB.App = (function($) {

    function init() {
        // Register basic events
        KB.Modules.on('add', createModuleViews);
        KB.Areas.on('add', createAreaViews);
        KB.Modules.on('remove', removeModule);
        
        // Create views
        addViews();
        
        // get the UI on track
        KB.Ui.initSortable();
    }

    /**
     * Iterate and throught raw areas as they were
     * output by toJSON() method on each area upon
     * server side page creation
     * 
     * Modules are taken from the raw areas and
     * collected seperatly in their own collection
     * 
     * View generation is handled by the 'add' event callback
     * as registered above
     * @returns void
     */
    function addViews() {
        // iterate over raw areas
        _.each(KB.RawAreas, function(area) {
            // create new area model
            KB.Areas.add(new KB.Backbone.AreaModel(area));

            // create models from already attached modules
            if (area.modules) {
                _.each(area.modules, function(module) {
                    KB.Modules.add(module);
                });
            }
        });
    }


    /**
     * Create views for modules and add them
     * to the custom collection
     * @param module Backbone Model
     * @returns void
     */
    function createModuleViews(module) {
        
        // assign the full corresponding area model to the module model
        var areaModel = KB.Areas.get(module.get('area'));
        module.set('area', areaModel);
        
        // crete view
        KB.Views.Modules.add(module.get('instance_id'), new KB.Backbone.ModuleView({
            model: module,
            el: '#' + module.get('instance_id')
        }));
        
        // update the reference counter, used as base number
        // for new modules
        var count = parseInt($('#kb_all_blocks').val()) + 1;
        $('#kb_all_blocks').val(count);
        
        // re-init tabs
        // TODO: don't re-init globally
        KB.Ui.initTabs();
    }

    /**
     * 
     * @param area Backbone Model
     * @returns void
     */
    function createAreaViews(area) {
        KB.Views.Areas.add(area.get('id'), new KB.Backbone.AreaView({
            model: area,
            el: '#' + area.get('id') + '-container'
        }));
    }

    /**
     * Removes a view from the collection.
     * The collection will destroy corresponding views
     * @param model Backbone Model
     * @returns void
     */
    function removeModule(model) {
        KB.Views.Modules.remove(model.get('instance_id'));
    }

    // revealing module pattern
    return {
        init: init
    };

}(jQuery));

// get started
KB.App.init();