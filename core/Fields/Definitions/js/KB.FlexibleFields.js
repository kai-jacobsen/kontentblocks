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
        this._initialized = false; // init flag to prevent multiple inits on same object

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
        'click .flexible-fields--js-toggle' : 'toggleItem',
        'click .flexible-fields--js-trash' : 'deleteItem'
    },
    toggleItem: function(){
        jQuery('.flexible-fields--toggle-title', this.$el).next().slideToggle();
    },
    deleteItem: function(){
        this.$el.remove();
        KB.Notice.notice('Please click update to save the changes', 'success');
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
