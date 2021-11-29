module.exports = {
  fields: [],
  strings: [],
  getFields: function () {
    this.fields = [];
    this.strings = [];
    var $fields = jQuery('[data-kbfuid]');
    _.each($fields, function (el) {
      var id = jQuery(el).data('kbfuid');
      var field = KB.FieldControls.get(id);
      if (field) {
        this.fields.push(field);
      }
    }, this);
  },
  getStrings: function () {
    this.getFields();
    _.each(this.fields, function (field) {
      if (field.FieldControlView) {
        this.strings.push(field.FieldControlView.toString());
      }
    }, this);
  },
  concatStrings: function () {
    this.getStrings();
    var res = '';
    _.each(this.strings, function (string) {
      if (string !== ''){
        res = res + string + '\n';
      }
    });
    return res;

  }

};