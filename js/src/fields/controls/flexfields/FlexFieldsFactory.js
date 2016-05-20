module.exports = Backbone.View.extend({

  initialize: function (options) {
    this.controller = options.controller;
    this.sections = this.model.get('fields');
  },
  factorNewItem: function (data, uid, title) {
    var itemId = uid || _.uniqueId('ff2');
    title = title || prompt("Enter a title : ", itemId);

    var sections = _.clone(this.sections);
    _.each(sections, function (section) {
      _.each(section.fields, function (field) {
        var fielddata = (data && data[field.key]) ? data[field.key] : field.std;
        var itemData = _.extend(field, {
          value: fielddata || '',
          arrayKey: this.model.get('arrayKey'),
          fieldkey: this.model.get('fieldkey'),
          primeKey: field.key,
          fieldId: this.model.get('fieldId'),
          index: itemId,
          type: field.type
        });
        field.view = KB.FieldsAPI.getRefByType(field.type, itemData);
      }, this)
    }, this);

    return {
      itemId: itemId,
      title: title,
      sections: sections
    }
  }

});