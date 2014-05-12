KB.Fields.register('FlexibleFields', (function ($) {
    return {
        init: function (modalView) {
            // find all instances on load
            $('.flexible-fields--stage', $('body')).each(function (index, el) {
                var view = modalView || KB.Views.Modules.get($(el).data('module'));
                var key = $(el).data('fieldkey');
                var arrayKey = $(el).data('arraykey');
                var fid = $(el).closest('.kb-js-field-identifier').attr('id');

                // attach a new FF instance to the view
                if (!view.hasField(key, arrayKey)) {
                    var obj = new KB.FlexibleFields.Controller({moduleView: view, fid: fid, key: key, arrayKey: arrayKey, el: el});
                    view.addField(key, obj, arrayKey);
                } else {
                    view.getField(key, arrayKey).bootstrap.call(view.getField(key, arrayKey));
                }

            });
        },
        update: function () {
            this.init();
        },
        frontUpdate: function (modalView) {
            this.init(modalView);
        }
    };
}(jQuery)));


// namespace
KB.FlexibleFields = {};

KB.FlexibleFields.Controller = Backbone.View.extend({

    initialize: function (params) {
        this.params = params;
        this.fieldArgs = KB.Payload.getFieldArgs(params.fid);
        this.parentModuleId = params.moduleView.model.get('instance_id');
        this._frame = null; // media modal instance
        this.subviews = []; // image items
        this.bootstrap(); // run forrest run
        this._initialized = false; // init flag to prevent multiple inits

    },
    bootstrap: function () {
        if (!this._initialized) {
            this.setupConfig();
            this.setupElements();
            this.initialSetup();
            this._initialized = true;
            _K.log('Fields: FlexibleFields instance created and initialized');
        } else {
            _K.log('Fields: FlexibleFields instance was already initialized. Doing nothing.')
        }
    },
    events: {
        'click .kb-flexible-fields--js-add-item': 'addItem'
    },
    setupConfig: function () {
        var that = this;
        _.each(this.fieldArgs.config, function (tab) {
            if (!tab.fields) {
                return;
            }
            tab.fields = that.setupFields(tab.fields);
        });
    },
    setupFields: function (fields) {
        var that = this;
        _.each(fields, function (field, key) {
            field.moduleId = that.params.moduleView.model.get('instance_id');
            field.fieldId = that.params.fid;
            field.fieldKey = that.params.key;
            field.arrayKey = that.params.arrayKey;
            field.key = key;
            field.$parent = that.$el;
            fields[key] = field;
        });
        return fields;
    },
    setupElements: function () {
        this.$list = jQuery('<ul class="flexible-fields--item-list"></ul>').appendTo(this.$el);
        this.$addButton = jQuery('<a class="button button-primary kb-flexible-fields--js-add-item">Add Item</a>').appendTo(this.$el);
    },
    addItem: function () {
        var model = new Backbone.Model({});
        var Item = new KB.FlexibleFields.Item({model: model, parent: this});
        this.subviews.push(Item);
        this.$list.append(Item.render());
        KB.Ui.initTabs();

    },
    initialSetup: function () {
        var that = this;
        var payload = KB.Payload.getFieldData('flexible-fields', this.params.moduleView.model.get('instance_id'), this.params.key, this.params.arrayKey) || [];

        _.each(payload, function(item){
            var model = new Backbone.Model(item);
            var Item = new KB.FlexibleFields.Item({model: model, parent: that});
            that.subviews.push(Item);
            that.$list.append(Item.render());

        });

        KB.Ui.initTabs();
        this.$list.sortable({
            handle: '.flexible-fields--js-drag-handle'
        });
    }
});

KB.FlexibleFields.Item = Backbone.View.extend({

    tagName: 'li',
    className: 'kb-flexible-fields--item-wrapper',
    initialize: function (params) {
        this.parentView = params.parent;
        this.config = params.parent.fieldArgs.config;
        this.uid = this.model.get('uid') || _.uniqueId('ff');

        if (!this.model.get('tab')){
            var tabDef = {
                title: this.uid
            };
            this.model.set('tab', tabDef);
        }
    },
    events: {
        'click .flexible-fields--js-toggle' : 'toggleItem'
    },
    toggleItem: function(){
        jQuery('.flexible-fields--toggle-title', this.$el).next().slideToggle();
    },
    render: function () {
        var inputName = this.createInputName(this.uid);
        var item = this.model.toJSON();
        var $skeleton = this.$el.append(KB.Templates.render('fields/FlexibleFields/single-item', {item: item, inputName: inputName, uid: this.uid}));

        this.renderTabs($skeleton);
        return $skeleton;
    },
    renderTabs: function ($skeleton) {
        var that = this;
        var tabNavEl = Handlebars.compile("<li><a href='#tab-{{ uid }}-{{ index }}'>{{ tab.label }}</a></li>");
        var tabCon = Handlebars.compile("<div id='tab-{{ uid }}-{{ index }}'></div>");
        // nav
        _.each(this.config, function (tab, index) {
            jQuery('.flexible-field--tab-nav', $skeleton).append(tabNavEl({uid: that.uid, tab: tab, index:index}));
            var $tabsContainment = jQuery('.kb-field--tabs', $skeleton);
            var $con = jQuery(tabCon({uid: that.uid, index: index})).appendTo($tabsContainment);
            that.renderFields(tab, $con);
        });
    },
    renderFields: function (tab, $con) {
        var fieldInstance;
        var that = this, data;

        _.each(tab.fields, function (field) {

            fieldInstance = KB.FieldsAPI.get(field);
            data = that.model.get(field.key);
            console.log(that.model.get(field.key));
            if (!_.isUndefined(data)){
                fieldInstance.setValue(data);
            }
            $con.append(fieldInstance.render(that.uid));
            $con.append('<input type="hidden" name="' + fieldInstance.baseId + '[' + that.uid + '][_mapping][' + fieldInstance.get('key') + ']" value="' + fieldInstance.get('type') + '" >');
            fieldInstance.$container = $con;

            if (fieldInstance.postRender) {
                fieldInstance.postRender.call(fieldInstance);
            }
        });
    },
    createInputName: function (uid) {
        return this.createBaseId() + '[' + this.parentView.params.key + ']' + '[' + uid + ']';
    },
    createBaseId: function () {
        if (!_.isEmpty(this.parentView.params.arrayKey)) {
            return this.parentView.parentModuleId + '[' + this.parentView.params.arrayKey + ']';
        } else {
            return this.parentView.parentModuleId;
        }
    }

});


//KB.FlexibleFields = function (view, fid, key, el) {
//    _K.info('New FF Instance created');
//    this.$el = jQuery(el);
//    this.view = view;
//    this.moduleId = view.model.get('instance_id');
//    this.fid = fid;
//    this.fieldKey = key;
//    this.config = KB.payload.Fields[fid].config;
//
//    this.init();
//
//};
//
//_.extend(KB.FlexibleFields.prototype, {
//
//    init: function () {
//
//        if (this.config.length > 0 && !this.initialized) {
//            this.setupConfig();
//            this.setupElements();
//            this.initialSetup();
//
//            this.$list.sortable({
//                start: function () {
//                    KB.TinyMCE.removeEditors();
//                },
//                stop: function () {
//                    KB.TinyMCE.restoreEditors();
//                },
//                handle: '.flexible-fields--js-drag-handle'
//            });
//            this.initialized = true;
//        } else {
//            _K.log('FF instance was initialized');
//        }
//    },
//
//    initialSetup: function () {
//        var that = this;
//        var data = null;
//        var moduleId = this.view.model.get('instance_id');
//        var payload = KB.payload;
//        // bail if no fieldData was set on page creation
//        if (!payload.fieldData) {
//            return false;
//        }
//
//        if (payload.fieldData['flexible-fields'] && payload.fieldData['flexible-fields'][moduleId]) {
//            data = KB.payload.fieldData['flexible-fields'][moduleId][this.fieldKey];
//        }
//        if (_.toArray(data).length > 0) {
//            _.each(data, function (item) {
//                if (_.isObject(item)) {
//                    that.addItem(item);
//                }
//            });
//        }
//
//
//    },
//
//    addItem: function (data) {
//        var that = this;
//        var $item, $toggleBox, $tabs, $tabnav, uid, name, value, hidden;
//
//        // bail if no data is set
//        if (_.isNull(data) || _.isUndefined(data)) {
//            return;
//        }
//
//        input name for item titel
//        name = this.moduleId + '[' + this.fieldKey + '][' + uid + ']' + '[tab][title]';


//        // hidden input name for unique item identifier
//        hidden = this.moduleId + '[' + this.fieldKey + '][' + uid + ']' + '[_uid]';

//        // item title value from existing data or new generic one
//        value = (data && data.tab) ? data.tab.title : 'Item #' + uid;

//        // create new item node
//        $item = jQuery('<li class="flexible-fields--list-item"><input type="hidden" name="' + hidden + '" value="' + uid + '"> </li>').appendTo(this.$list);

//        // append new title/toggletitle to item
//        jQuery('<div class="flexible-fields--toggle-title">' +

//        '<h3><span class="genericon genericon-draggable flexible-fields--js-drag-handle"></span><div class="genericon genericon-expand flexible-fields--js-toggle"></div><div class="dashicons dashicons-trash flexible-fields--js-trash"></div><input type="text" value="' + value + '" name="' + name + '" ></h3>' +
//        '</div>').appendTo($item);
//        // append toggle container
//        $toggleBox = jQuery('<div class="flexible-fields--toggle-box kb-hide"></div>').appendTo($item);
//        // add tabholder to inner (toggle)container

//        $tabs = jQuery('<div class="kb-field--tabs kb_fieldtabs"></div>').appendTo($toggleBox);
//        // append tab nav holder to tabcontainer

//        $tabnav = jQuery('<ul class="flexible-field--tab-nav"></ul>').appendTo($tabs);

//        // actual create the items from existing data / new empty item
//        _.each(this.config, function (tab) {
//            // tab nav item
//            $tabnav.append('<li><a href="#tab-' + that.fid + '-' + tab.id + uid + '">' + tab.label + '</a></li>');
//            // corresponding tab container
//            var $con = jQuery('<div id="tab-' + that.fid + '-' + tab.id + uid + '"></div>').appendTo($tabs);
//            // render fields and append to tab container
//            that.renderFields(tab, $con, uid, data);
//        });
//
//        // initialize tabs
//        $tabs.tabs();
//    },
//
//    renderFields: function (tab, $con, uid, data) {
//        var fieldInstance;
//        _.each(tab.fields, function (field) {
//            fieldInstance = KB.FieldsAPI.get(field);
//            if (data && data[fieldInstance.get('key')]) {
//                fieldInstance.setValue(data[fieldInstance.get('key')]);
//            }
//            $con.append(fieldInstance.render(uid));
//
//            $con.append('<input type="hidden" name="' + fieldInstance.baseId + '[' + uid + '][_mapping][' + fieldInstance.get('key') + ']" value="' + fieldInstance.get('type') + '" >');
//            fieldInstance.$container = $con;
//
//            if (fieldInstance.postRender) {
//                fieldInstance.postRender.call(fieldInstance);
//            }
//        });
//
//    },
//
//
//
//});
//
//jQuery('body').on('click', '.flexible-fields--js-toggle', function () {
//    jQuery(this).toggleClass('genericons-expand genericons.collapse')
//    jQuery(this).parent().parent().next('div').slideToggle(450, function () {
//
//        if (KB.FrontendEditModal) {
//            KB.FrontendEditModal.trigger('recalibrate');
//        }
//    });
//
//
//});
//
//jQuery('body').on('click', '.flexible-fields--js-trash', function () {
//    jQuery(this).closest('.flexible-fields--list-item').remove();
//});