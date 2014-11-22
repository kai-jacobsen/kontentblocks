KB.FieldsAPI = (function () {

  return {
    fields: {},

    register: function (id, obj) {
      this.fields[id] = obj;
    },
    get: function (field) {
      return new this.fields[field.type](field);
    }

  }

}());