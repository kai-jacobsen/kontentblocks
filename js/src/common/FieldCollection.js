KB.FieldCollection = Backbone.View.extend({
  attachedFields: [],
  addField: function (key, obj, arrayKey) {
    if (!_.isEmpty(arrayKey)) {
      this.attachedFields[arrayKey][key] = obj;
    } else {
      this.attachedFields[key] = obj;
    }
  },
  hasField: function (key, arrayKey) {
    if (!_.isEmpty(arrayKey)) {
      if (!this.attachedFields[arrayKey]) {
        this.attachedFields[arrayKey] = {};
      }
      return key in this.attachedFields[arrayKey];
    } else {
      return key in this.attachedFields;
    }

  },
  getField: function (key, arrayKey) {
    if (!_.isEmpty(arrayKey)) {
      return this.attachedFields[arrayKey][key];
    } else {
      return this.attachedFields[key];
    }
  },
  clearFields: function () {
    this.attachedFields = {};
  }
});