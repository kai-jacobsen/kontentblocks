module.exports = Backbone.View.extend({

  initialize: function (options) {
    this.controller = options.controller;
    this.types = this.model.get('fields');
  },
  factorNewItem: function (data, obj) {
    var uid = obj['_meta'].uid || null;
    var title = obj['_meta'].title || null;
    var type = obj['_meta'].type;
    var status = obj['_meta'].status || 'visible';
    var itemId = uid || _.uniqueId('ff2');
    var text = this.model.get('newitemtext') || 'Enter a title : ';
    var ask = this.model.get('requesttitle') || false;


    if (ask) {
      title = title || prompt(text, '');
    } else {
      title = title || '#' + this.controller.subviews.length;
    }
    var typesections = this.types[type].sections || [];
    var types = _.clone(this.types);
    _.each(typesections, function (section) {
      _.each(section.fields, function (field) {
        var fielddata = (data && data[field.key]) ? data[field.key] : field.std;
        var itemData = _.extend(field, {
          value: fielddata || '',
          arrayKey: this.model.get('arrayKey'),
          fieldkey: this.model.get('fieldkey'),
          relId: this.model.get('relId'),
          primeKey: field.key,
          fieldId: this.model.get('fieldId'),
          index: itemId,
          type: field.type
        });
        field.view = KB.FieldsAPI.getRefByType(field.type, itemData);

        if (!fielddata) {
          field.view.setDefaults();
        }
      }, this)
    }, this);

    return {
      itemId: itemId,
      fftype: type,
      title: title,
      status: status,
      sections: typesections
    }
  }

});