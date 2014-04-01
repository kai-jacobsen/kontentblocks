KB.Fields.register('FlexibleFields', (function ($) {
    return {
        init: function (modalView) {
            _K.log('FF init called');
            $('.flexible-fields--stage', $('body')).each(function (index, el) {
                var view = modalView || KB.Views.Modules.get($(el).data('module'));
                var key = $(el).data('fieldkey');
                var fid = $(el).closest('.kb-js-field-identifier').attr('id');

                _K.log('FF init called: ', view);

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

        this.$list.sortable();
    }


};

_.extend(KB.FlexibleFields.prototype, {


    initialSetup: function () {
        var that = this;
        var data = null;

        if (!KB.payload.fieldData) {
            return false;
        }

        if (KB.payload.fieldData['flexible-fields'] && KB.payload.fieldData['flexible-fields'][this.view.model.get('instance_id')]) {
            data = KB.payload.fieldData['flexible-fields'][this.view.model.get('instance_id')];
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
            that.addItem();
        });
    },

    addItem: function (data) {
        var that = this;

        if (_.isNull(data)) {
            return
        }

        var index, $item, $toggletitle, $toggleBox, $tabs, $tabnav, uid;
//        index = '_' + jQuery('li.flexible-fields--list-item', this.$list).length;
        uid = (data && data.uid) ? data._uid : _.uniqueId('ffid');
        var name = this.moduleId + '[' + this.fieldKey + '][' + uid + ']' + '[tab][title]';
        var hidden = this.moduleId + '[' + this.fieldKey + '][' + uid + ']' + '[_uid]';
        var value = (data && data.tab) ? data.tab.title : 'Item #' + uid;
        $item = jQuery('<li class="flexible-fields--list-item"><input type="hidden" name="' + hidden + '" value="' + uid + '"> </li>').appendTo(this.$list);
        $toggletitle = jQuery('<div class="flexible-fields--toggle-title">' +
            '<h3><div class="dashicons dashicons-arrow-right flexible-fields--js-toggle"></div><div class="dashicons dashicons-trash flexible-fields--js-trash"></div><input type="text" value="' + value + '" name="' + name + '" ></h3>' +
            '</div>').appendTo($item);

        $toggleBox = jQuery('<div class="flexible-fields--toggle-box kb-hide"></div>').appendTo($item);
        $tabs = jQuery('<div class="kb-field--tabs kb_fieldtabs"></div>').appendTo($toggleBox);
        $tabnav = jQuery('<ul class="flexible-field--tab-nav"></ul>').appendTo($tabs);
        _.each(this.config, function (tab) {
            $tabnav.append('<li><a href="#tab-' + that.fid + '-' + tab.id + uid + '">' + tab.label + '</a></li>');
            var $con = jQuery('<div id="tab-' + that.fid + '-' + tab.id + uid + '"></div>').appendTo($tabs);
            that.renderFields(tab, $con, uid, data);
        });
        $tabs.tabs();
    },

    renderFields: function (tab, $con, index, data) {
        _.each(tab.fields, function (field) {


            if (data && data[field.config.key]) {
                field.setValue(data[field.config.key]);
            }


            $con.append(field.render(index));
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
            fields[key] = KB.FieldsAPI.get(field);
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