var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    var attributes = this.model.get('attributes');
    this.$textarea = this.$('textarea');
    this.$textarea.on('change', function () {
      that.update(that.$textarea.val());
    });

    if (attributes && attributes.maxlength) {
      this.$count = jQuery("<span class='charcount kb-field--bubble'></span>").insertAfter(this.$textarea);
      this.$textarea.on('keyup change', function () {
        that.charcount(that.$textarea.val(), that.$count, attributes.maxlength);
      }).trigger('keyup');

    }

  },
  derender: function () {
    this.$textarea.off();

    if (this.$count){
      this.$count.off().remove();
    }
  },
  update: function (val) {
    this.model.set('value', val);
  },
  toString: function () {
    return this.$textarea.val();
  },
    charcount: function (content, $charlimit, limit) {
      var max = limit;
      var len = content.length;
      var charCount = max - len;
      $charlimit.html(charCount + " chars left");
    }
});