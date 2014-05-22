var KB = KB || {};
KB.Backbone = {};
KB.Fields = {};
KB.Utils = {};
KB.Ext = {};
KB.OSConfig = {};
KB.IEdit = {};

_.extend(KB, Backbone.Events);

KB.Ajax = (function($) {

    return {
        send: function(data, callback, scope) {
            var pid = (KB.Screen && KB.Screen.post_id) ? KB.Screen.post_id : false;
            var sned = _.extend( {
                supplemental: data.supplemental || {},
            count: parseInt($('#kb_all_blocks').val(), 10),
            nonce: $('#_kontentblocks_ajax_nonce').val(),
            post_id: pid,
            kbajax: true
            }, data);

            $('#publish').attr('disabled', 'disabled');

            return $.ajax({
                url: ajaxurl,
                data: sned,
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
                    $('#publish').removeAttr('disabled');
                }
            });
        }

    };
}(jQuery));
KB.Checks = (function($) {
    return {
        blockLimit: function(areamodel) {
            var limit = areamodel.get('limit');
            // todo potentially wrong, yeah it's wrong
            var children = $('#' + areamodel.get('id') + ' li.kb_block').length;

            if (limit !== 0 && children === limit) {
                console.log('asdf');
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
// include Backbone events handler
_.extend(KB.Fields, Backbone.Events);
// include custom functions
_.extend(KB.Fields, {
    fields: {}, // 'collection' of fields
    /**
     * Register a fieldtype
     * @param id string Name of field
     * @param object field object
     */
    addEvent: function () {
        this.listenTo(KB, 'kb:ready', this.init);
        this.listenTo(this, 'newModule', this.newModule);


    },
    register: function (id, object) {
        // Backbone Events for field object
        _.extend(object, Backbone.Events);
        this.fields[id] = object;

    },

    init: function () {
        var that = this;
        _.each(_.toArray(this.fields), function (object) {
            // call init method if available
            if (object.hasOwnProperty('init')) {
                object.init();
            }

            // call field objects init method on 'update' event
            // fails gracefully if there is no update method
            object.listenTo(that, 'update', object.update);
            object.listenTo(that, 'frontUpdate', object.frontUpdate);

        });

    },

    newModule:function(object){
        _K.info('new Module added for Fields');
        var that = this;
        // call field objects init method on 'update' event
        // fails gracefully if there is no update method
        object.listenTo(this, 'update', object.update);
        object.listenTo(this, 'frontUpdate', object.frontUpdate);

        setTimeout(function(){
            that.trigger('update');
        },750);
    },

    /**
     * Get method
     * @param id string fieldtype
     * @returns mixed field object or null
     */
    get: function (id) {
        if (this.fields[id]) {
            return this.fields[id];
        } else {
            return null;
        }
    }
});
KB.Fields.addEvent();
Logger.useDefaults();
var _K = Logger.get('_K');
_K.setLevel(_K.INFO);
if (!kontentblocks.config.dev){
    _K.setLevel(Logger.OFF);
}

KB.Utils.MediaWorkflow = function (args) {
    var _frame, options;

    var defaults = {
        buttontext : 'Buttontext',
        multiple: false,
        type: 'image',
        title: '',
        select: false,
        ready:false
    }

    function frame() {
        if (_frame)
            return _frame;
        _frame = wp.media({
            title: options.title,
            button: {
                text: options.buttontext
            },
            multiple: options.multiple,
            library: {
                type: options.type
            }
        });
        _frame.on('ready', ready);
        _frame.state('library').on('select', select);

        return _frame;

    }

    function init(args) {

        if (_.isUndefined(args)){
            options = _.extend(defaults, {});
        } else {
            options = _.extend(defaults, args);
        }
        frame().open();
    }


    function ready(){
    }

    /**
     * ->this<- is set to the modal
     */
    function select(){

        if (options.select === false){
            alert('No callback given');
        }
        options.select(this);
    }

    init(args);
};


KB.Menus = (function ($) {

    return {
        loadingContainer: null,
        initiatorEl: null,
        sendButton: null,
        createSanitizedId: function (el, mode) {
            this.initiatorEl = $(el);
            this.loadingContainer = this.initiatorEl.closest('.kb-menu-field').addClass('loading');
            this.$sendButton = $('#kb-submit');

            this.disableSendButton();

            KB.Ajax.send({
                inputvalue: el.value,
                checkmode: mode,
                action: 'getSanitizedId',
                _ajax_nonce: kontentblocks.nonces.read
            }, this.insertId, this);
        },

        insertId: function (res) {

            if (res === 'translate') {
                this.initiatorEl.addClass()
                $('.kb-js-area-id').val('Please chose a different name');

            } else {
                $('.kb-js-area-id').val(res);
                this.enableSendButton();
            }

            this.loadingContainer.removeClass('loading');

        },
        disableSendButton: function () {
            this.$sendButton.attr('disabled', 'disabled').val('Disabled');
        },
        enableSendButton: function () {
            this.$sendButton.attr('disabled', false).val('Create');

        }

    }


}
    (jQuery)
    )
KB.Notice = (function($) {
	'use strict';

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
KB.Payload = (function ($) {

    return {

        getFieldData: function (type, moduleId, key, arrayKey) {
            var typeData;
            if (this._typeExists(type)) {
                typeData = KB.payload.fieldData[type];

                // no data for module id
                if (!typeData[moduleId]) {
                    return [];
                }

                // arrayKey given
                if (!_.isEmpty(arrayKey)){

                    // arrayKey not present in module data
                    if (!typeData[moduleId][arrayKey]){
                        return [];
                    }

                    // arrayKey present but key is not
                    if (!typeData[moduleId][arrayKey][key]){
                        return [];
                    }

                    // both keys are present
                    return typeData[moduleId][arrayKey][key];
                }

                // only key given, but not present
                if (!typeData[moduleId][key]) {
                    return []
                }
                // key given and present
                return typeData[moduleId][key];
            }

            return [];
        },
        _typeExists: function (type) {
            return !_.isUndefined(KB.payload.fieldData[type]);
        },
        getFieldArgs: function (key) {
            if (KB.payload.Fields && KB.payload.Fields[key]){
                return KB.payload.Fields[key];
            } else {
                return false;
            }
        }

    }


})(jQuery);
KB.Templates = (function ($) {

    var tmpl_cache = {};
    var hlpf_cache = {};

    function getTmplCache() {
        return tmpl_cache;
    }

    function render(tmpl_name, tmpl_data) {
        var tmpl_string;
        console.log(tmpl_name);
        if (!tmpl_cache[tmpl_name]) {
            var tmpl_dir = kontentblocks.config.url + 'js/templates';

            var tmpl_url = tmpl_dir + '/' + tmpl_name + '.hbs?'+ kontentblocks.config.hash;

            // if a full url is given, tmpl_url will be overwritten
            var pat = /^https?:\/\//i;
            if (pat.test(tmpl_name)) {
                tmpl_url = tmpl_name;
            }

            if (KB.Util.stex.get(tmpl_url)) {
                tmpl_string = KB.Util.stex.get(tmpl_url);
            } else {
                $.ajax({
                    url: tmpl_url,
                    method: 'GET',
                    async: false,
                    success: function (data) {
                        tmpl_string = data;
                        KB.Util.stex.set(tmpl_url, tmpl_string, 2 * 1000 * 60);
                    }
                });
            }
            tmpl_cache[tmpl_name] = Handlebars.compile(tmpl_string);
        }
        return tmpl_cache[tmpl_name](tmpl_data);
    }

    function helpfile(hlpf_url) {
        if (!hlpf_cache[hlpf_url]) {

            var hlpf_string;
            $.ajax({
                url: hlpf_url,
                method: 'GET',
                async: false,
                dataType: 'html',
                success: function (data) {
                    hlpf_string = data;
                }
            });

            hlpf_cache[hlpf_url] = hlpf_url;
        }
        return hlpf_cache[hlpf_url];
    };

    return {
        render: render,
        helpfile: helpfile
    };
}(jQuery));
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
        addEditor: function ($el, quicktags, height) {
            // get settings from native WP Editor
            // Editor may not be initialized and is not accesible throught
            // the tinymce api, thats why we take the settings from preInit
            var settings = tinyMCEPreInit.mceInit.content;
            var edHeight = height || 350;
            if (!$el) {
                $el = KB.lastAddedModule.view.$el;
            }

            $('.wp-editor-area', $el).each(function () {
                var id = this.id;

                // add new editor id to settings
                settings.elements = id;
                settings.selector = '#'+id;
                settings.id = id;
                settings.height = edHeight;
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

        },
        remoteGetEditor: function ($el, name, id, content, post_id, media) {
            var pid = post_id || KB.appData.config.post.ID;
            var id = id || $el.attr('id');
            if (!media) {
                var media = false;
            }
            console.log(id,name,pid,content);
            return KB.Ajax.send({
                action: 'getRemoteEditor',
                editorId: id + '_ed',
                editorName: name,
                post_id: pid,
                editorContent: content,
                _ajax_nonce: kontentblocks.nonces.read,
                args: {
                    media_buttons: media
                }

            }, function(data){
                $el.empty().append(data);
                this.addEditor($el, null, 150);
            },this);

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
 * @type @exp; KB
 */

KB.Ui = function ($) {

    return {
        // sorting indication
        isSorting: false,
        // boot up
        init: function () {
            var that = this;
            var $body = $('body');
            // init general ui components
            this.initTabs();
            this.initSortable();
            this.initToggleBoxes();
            this.flexContext();
            this.flushLocalStorage();
            // set the global activeField variable dynamically
            // legacy
            $body.on('mousedown', '.kb_field', function (e) {
                activeField = this;
            });

            // set the global activeBlock variable dynamically
            // legacy
            $body.on('mousedown', '.kb_block', function (e) {
                activeBlock = this.id;
            });

            // set the current field id as reference
            $body.on('mouseenter', '.kb-js-field-identifier', function () {
                KB.currentFieldId = this.id;
                _K.info('Current Field Id set to:', KB.currentFieldId);
            });

            // Bind AjaxComplete, restoring TinyMCE after global MEtaBox reordering
            jQuery(document).ajaxComplete(function (e, o, settings) {
                that.metaBoxReorder(e, o, settings, 'restore');
            });

            // Bind AjaxSend to remove TinyMCE before global MetaBox reordering
            jQuery(document).ajaxSend(function (e, o, settings) {
                that.metaBoxReorder(e, o, settings, 'remove');
            });
        },

        flexContext: function () {
            var side = $('.area-side');
            var normal = $('.area-normal');
            var stage = $('#kontentblocks_stage');
            var that = this;

//            stage.hoverIntent(function () {
//                side.removeClass('active-context non-active-context');
//                normal.removeClass('non-active-context');
//            })

            jQuery('body').on('mouseover', '.kb_inner', function () {
                var $con = $(this).closest('.kb-context-container');
                $con.addClass('active-context').removeClass('non-active-context');

                if ($con.hasClass('area-top') || $con.hasClass('area-bottom')) {
                    return false;
                }

                $('.kb-context-container').not($con).addClass('non-active-context').removeClass('active-context');
            });

            side.on('click', '.kb-toggle', function () {
                if (that.isSorting) {
                    return false;
                }
                side.addClass('active-context').removeClass('non-active-context');
                normal.addClass('non-active-context');
            });
            normal.on('click', '.kb-toggle', function () {
                if (that.isSorting) {
                    return false;
                }
                side.delay(700).removeClass('active-context').addClass('non-active-context');
                normal.delay(700).removeClass('non-active-context').addClass('active-context');
            })
        },
        repaint: function ($el) {
            this.initTabs();
            this.initToggleBoxes();
            KB.TinyMCE.addEditor($el);
        },
        initTabs: function ($cntxt) {
            var $context = $cntxt || jQuery('body');
            var selector = $('.kb_fieldtabs', $context);
            selector.tabs({
                activate: function () {
//                       var $window = $(window).height();
//                        $('.content').height($window - 250);
                    // re-init nano scroller
                    $('.nano').nanoScroller();
                    $('body').trigger('kontentblocks::tabsChange');
                }
            });

            selector.each(function () {
                // hide tab navigation if only one tab exists
                var length = $('.ui-tabs-nav li', $(this)).length;
                if (length === 1) {
                    $(this).find('.ui-tabs-nav').css('display', 'none');
                }
            });
        },
        initToggleBoxes: function () {
            $('.kb-togglebox-header').on('click', function () {
                $(this).next('div').slideToggle().toggleClass('kb-toggle-open').end().toggleClass('kb-toggle-open');
            });

            $('.kb_fieldtoggles div:first-child').trigger('click');
        },
        initSortable: function ($cntxt) {
            var $context = $cntxt || jQuery('body');
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
            function
                isValidModule() {

                var limit = areaOver.get('limit');
                var nom = numberOfModulesInArea(areaOver.get('id'));

                if (
                    _.indexOf(areaOver.get(
                        'assignedModules'), currentModule.get('settings').class) === -1) {
                    return false;
                } else if (limit !== 0 && limit <= nom - 1) {
                    KB.Notice.notice(
                        'Not allowed here', 'error');
                    return false;
                } else {
                    return true;
                }
            }

            /**
             *
             Get an
             array of modules by area id
             * @param
                id string
             *
             @returns array of all found modules in that area
             */
            function filterModulesByArea(id) {
                return _.filter(KB.Modules.models, function (model) {
                        return model.get('area') === id;
                    }
                );
            }

            function numberOfModulesInArea(id) {
                return $('#' + id + ' li.kb_block').length;
            }

            // handles sorting of the blocks.
            $('.kb_sortable', $context).sortable({
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
                start: function (event, ui) {

                    // set current model
                    that.isSorting = true;
                    $('#kontentblocks_stage').addClass('kb-is-sorting');
                    currentModule = KB.Modules.get(ui.item.attr('id'));
                    areaOver = KB.currentArea;
                    $(KB).trigger('kb:sortable::start');

                    // close open modules, sorting on open container
                    // doesn't work very well
                    $('.kb-open').toggleClass('kb-open');
                    $('.kb_inner').hide();

                    // tinyMCE doesn't like to be moved in the DOM
                    KB.TinyMCE.removeEditors();

                    // Add a global trigger to sortable.start, maybe other Blocks might need it
                    $(document).trigger('kb_sortable_start', [event, ui]);
                },
                stop: function (event, ui) {
                    that.isSorting = false;
                    $('#kontentblocks_stage').removeClass('kb-is-sorting');

                    var serializedData = [];

                    // restore TinyMCE editors
                    KB.TinyMCE.restoreEditors();

                    // global trigger when sortable is done
                    $(document).trigger('kb_sortable_stop', [event, ui]);
                    if (currentModule.get('open')) {
                        currentModule.view.toggleBody(155);
                    }
                },
                over: function (event, ui) {
                    // keep track of target area
                    areaOver = KB.Areas.get(this.id);
                },
                receive: function (event, ui) {

                    if (!isValidModule()) {
                        // inform the user
                        KB.Notice.notice('Module not allowed in this area', 'error');
                        // cancel sorting
                        $(ui.sender).sortable('cancel');
                    }
                },
                update: function (ev, ui) {

                    if (!isValidModule()) {
                        return false;
                    }

                    // update will fire twice when modules are
                    // moved between two areas, once for each list
                    // this makes sure that the right action(s) are only done once
                    if (this === ui.item.parent('ul')[0] && !ui.sender) {
                        // function call applies when target area == origin
                        $.when(that.resort(ui.sender)).done(function () {
                            $(KB).trigger('kb:sortable::update');
                            KB.Notice.notice('Order was updated successfully', 'success');
                        });
                    } else if (ui.sender) {

                        // do nothing if the receiver rejected the request
                        if (ui.item.parent('ul')[0].id === ui.sender.attr('id')) {
                            return false;
                        }

                        // function call applies when target area != origin
                        // chain reordering and change of area
                        $.when(that.changeArea(areaOver, currentModule)).
                            then(function () {
                                that.resort(ui.sender);
                            }).
                            done(function () {
                                that.triggerAreaChange(areaOver, currentModule);
                                $(KB).trigger('kb:sortable::update');

                                // force recreation of any attached fields
                                currentModule.view.clearFields();
                                KB.Notice.notice('Area change and order were updated successfully', 'success');

                            });
                    }
                }
            });
        },
        flushLocalStorage: function(){
            var hash = kontentblocks.config.hash;
            if (store.get('kbhash') !== hash){
                store.clear();
//                store.set('kbhash', hash)
            }
        },
        /**
         * Handles saving of new module order per area
         * @param sender jQueryUI sortable sender list
         * @returns {jqXHR}
         */
        resort: function (sender) {
            // serialize data
            var serializedData = {};
            $('.kb_sortable').each(function () {
                serializedData[this.id] = $('#' + this.id).sortable('serialize', {
                    attribute: 'rel'
                });
            });

            return KB.Ajax.send({
                action: 'resortModules',
                data: serializedData,
                _ajax_nonce: kontentblocks.nonces.update
            });
        },
        /**
         *
         * @param object targetArea
         * @param object module
         * @returns {jqXHR}
         */
        changeArea: function (targetArea, module) {
            return KB.Ajax.send({
                action: 'changeArea',
                block_id: module.get('instance_id'),
                area_id: targetArea.get('id'),
                context: targetArea.get('context')
            });
        },
        triggerAreaChange: function (newArea, module) {
            module.set('areaContext', newArea.get('context'));
            module.set('area', newArea.get('id'));

        },
        toggleModule: function () {

            $('body').on('click', '.kb-toggle', function () {
                if (KB.isLocked() && !KB.userCan('lock_kontentblocks')) {
                    KB.notice(kontentblocks.l18n.gen_no_permission, 'alert');
                }
                else {
                    $(this).parent().nextAll('.kb_inner:first').slideToggle('fast', function () {
                        $('body').trigger('module::opened');
                    });
                    $('#' + activeBlock).toggleClass('kb-open', 1000);
                }
            });
        },
        metaBoxReorder: function (e, o, settings, action) {
            if (settings.data) {
                var a = settings.data;
                var b = a.split('&');
                var result = {};
                $.each(b, function (x, y) {
                    var temp = y.split('=');
                    result[temp[0]] = temp[1];
                });

                if (result.action === 'meta-box-order') {
                    if (action === 'restore') {
                        KB.TinyMCE.restoreEditors();
                    }
                    else if (action === 'remove') {
                        KB.TinyMCE.removeEditors();
                    }
                }
            }
        }

    };

}(jQuery);
KB.Ui.init();
KB.Util = function ($) {

    return {
        // store with expiration
        stex: {
            set: function (key, val, exp) {
                store.set(key, { val: val, exp: exp, time: new Date().getTime() })
            },
            get: function (key) {
                var info = store.get(key)
                if (!info) {
                    return null
                }
                if (new Date().getTime() - info.time > info.exp) {
                    return null
                }
                return info.val
            }
        }

    }

}(jQuery);
/*
 Simple Get/Set implementation to set and get views
 No magic here
 */
KB.ViewsCollection = function () {
    this.views = {};
    this.lastViewAdded = null;
    this.add = function (id, view) {
        this.views[id] = view;
        KB.trigger('kb:'+view.model.get('class')+':added', view);
        this.lastViewAdded = view;
    };

    this.ready = function () {
        _.each(this.views, function (view) {
            view.trigger('kb:'+view.model.get('class'), view);
            KB.trigger('kb:'+view.model.get('class')+':loaded', view);
        });
        KB.trigger('kb:ready');
    };

    this.readyOnFront = function () {
        _.each(this.views, function (view) {
            view.trigger('kb:'+view.model.get('class'), view);
            KB.trigger('kb:'+view.model.get('class')+':loadedOnFront', view);
        });
        KB.trigger('kb:ready');
    };


    this.remove = function (id) {
        var view = this.get(id);
        this.trigger('kb:backend::viewDeleted', view);
        delete this.views[id];
    };

    this.get = function (id) {
        if (this.views[id]) {
            return this.views[id];
        }
    };

    this.filterByModelAttr = function (attr, value) {
        return _.filter(this.views, function (view) {
            return (view.model.get(attr)) === value;
        });
    };

};

_.extend(KB.ViewsCollection.prototype, Backbone.Events);
Handlebars.registerHelper("debug", function(optionalValue) {
    console.log("Current Context");
    console.log("====================");
    console.log(this);
    if (optionalValue) {
        console.log("Value");
        console.log("====================");
        console.log(optionalValue);
    }
});

Handlebars.registerHelper("fieldName", function(base, index, key){
    return base + "[" + index + "][" + key + "]";
});