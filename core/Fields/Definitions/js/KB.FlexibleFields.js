KB.Fields.register('FlexibleFields', (function ($) {
    return {
        init: function (modalView) {
            _K.log('FF init called');
            // find all instances on load
            $('.flexible-fields--stage', $('body')).each(function (index, el) {
                var view = modalView || KB.Views.Modules.get($(el).data('module'));
                var key = $(el).data('fieldkey');
                var fid = $(el).closest('.kb-js-field-identifier').attr('id');

                // attach a new FF instance to the view
                if (!view.FlexibleFields) {
                    view.FlexibleFields = new KB.FlexibleFields(view, fid, key, el);
                }

            });
        },
        update: function () {
            _K.log('Fields shall update');
            this.init();
        },
        frontUpdate: function (modalView) {
            _K.log('Field shall update on front');
            this.init(modalView);
        }
    };
}(jQuery)));


KB.FlexibleFields = function (view, fid, key, el) {
    this.$el = jQuery(el);
    this.view = view;
    this.moduleId = view.model.get('instance_id');
    this.fid = fid;
    this.fieldKey = key;
    this.config = KB.payload.Fields[fid].config;

    if (this.config.length > 0) {

        this.setupConfig();
        this.setupElements();
        this.initialSetup();

        this.$list.sortable({
            start: function(){
                KB.TinyMCE.removeEditors();
            },
            stop: function(){
                KB.TinyMCE.restoreEditors();
            }
        });
    }

};

_.extend(KB.FlexibleFields.prototype, {

    initialSetup: function () {
        var that = this;
        var data = null;
        var moduleId = this.view.model.get('instance_id');
        var payload = KB.payload;

        // bail if no fieldData was set on page creation
        if (!payload.fieldData) {
            return false;
        }


        if (payload.fieldData['flexible-fields'] && payload.fieldData['flexible-fields'][moduleId]) {
            data = KB.payload.fieldData['flexible-fields'][moduleId];
        }

        if (_.toArray(data).length > 0) {
            _.each(data, function (item) {
                that.addItem(item);
            });
        }


    },
    setupElements: function () {
        var that = this;
        this.$list = jQuery('<ul class="flexible-fields--item-list"></ul>').appendTo(this.$el);

        this.$addButton = jQuery('<a class="button button-primary">Add Item</a>').appendTo(this.$el);

        this.$addButton.on('click', function () {
            that.addItem({});
        });
    },

    addItem: function (data) {
        var that = this;
        var $item, $toggleBox, $tabs, $tabnav, uid, name, value, hidden;

        // bail if no data is set
        if (_.isNull(data) || _.isUndefined(data)) {
            return;
        }

        // take uid from existing data or create new one
        uid = (data && data.uid) ? data._uid : _.uniqueId('ffid');
        // input name for item titel
        name = this.moduleId + '[' + this.fieldKey + '][' + uid + ']' + '[tab][title]';
        // hidden input name for unique item identifier
        hidden = this.moduleId + '[' + this.fieldKey + '][' + uid + ']' + '[_uid]';
        // item title value from existing data or new generic one
        value = (data && data.tab) ? data.tab.title : 'Item #' + uid;
        // create new item node
        $item = jQuery('<li class="flexible-fields--list-item"><input type="hidden" name="' + hidden + '" value="' + uid + '"> </li>').appendTo(this.$list);
        // append new title/toggletitle to item
        jQuery('<div class="flexible-fields--toggle-title">' +
        '<h3><div class="dashicons dashicons-arrow-right flexible-fields--js-toggle"></div><div class="dashicons dashicons-trash flexible-fields--js-trash"></div><input type="text" value="' + value + '" name="' + name + '" ></h3>' +
        '</div>').appendTo($item);
        // append toggle container
        $toggleBox = jQuery('<div class="flexible-fields--toggle-box kb-hide"></div>').appendTo($item);
        // add tabholder to inner (toggle)container
        $tabs = jQuery('<div class="kb-field--tabs kb_fieldtabs"></div>').appendTo($toggleBox);
        // append tab nav holder to tabcontainer
        $tabnav = jQuery('<ul class="flexible-field--tab-nav"></ul>').appendTo($tabs);
        // actual create the items from existing data / new empty item
        _.each(this.config, function (tab) {
            // tab nav item
            $tabnav.append('<li><a href="#tab-' + that.fid + '-' + tab.id + uid + '">' + tab.label + '</a></li>');
            // corresponding tab container
            var $con = jQuery('<div id="tab-' + that.fid + '-' + tab.id + uid + '"></div>').appendTo($tabs);
            // render fields and append to tab container
            that.renderFields(tab, $con, uid, data);
        });

        // initialize tabs
        $tabs.tabs();
    },

    renderFields: function (tab, $con, uid, data) {
        var fieldInstance;

        _.each(tab.fields, function (field) {
            fieldInstance = KB.FieldsAPI.get(field);
            if (data && data[fieldInstance.get('key')]) {
                fieldInstance.setValue(data[fieldInstance.get('key')]);
            }
            $con.append(fieldInstance.render(uid));
            $con.append('<input type="hidden" name="' + fieldInstance.baseId + '[' + uid + '][type]" value="'+ fieldInstance.get('type') +'" >');
            $con.append('<input type="hidden" name="' + fieldInstance.baseId + '[' + uid + '][key]" value="'+ fieldInstance.get('key') +'" >');
            fieldInstance.$container = $con;

            if (fieldInstance.postRender) {
                fieldInstance.postRender.call(fieldInstance);
            }
        });

    },

    setupConfig: function () {
        var that = this;
        _.each(this.config, function (tab) {
            if (!tab.fields) {
                return;
            }
            tab.fields = that.setupFields(tab.fields);
        });
    },
    setupFields: function (fields) {
        var that = this;
        _.each(fields, function (field, key) {
            field.moduleId = that.view.model.get('instance_id');
            field.fieldKey = that.fieldKey;
            field.fieldId = that.fid;
            field.key = key;
            field.$parent = that.$el;
            fields[key] = field;
        });
        return fields;
    }


});

jQuery('body').on('click', '.flexible-fields--js-toggle', function () {
    jQuery(this).toggleClass('dashicons-arrow-right dashicons-arrow-down')
    jQuery(this).parent().parent().next('div').slideToggle(450, function () {

        if (KB.FrontendEditModal) {
            KB.FrontendEditModal.trigger('recalibrate');
        }
    });


});

jQuery('body').on('click', '.flexible-fields--js-trash', function () {
    jQuery(this).closest('.flexible-fields--list-item').remove();
});