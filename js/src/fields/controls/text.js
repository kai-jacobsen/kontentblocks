var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    var attributes = this.model.get('attributes');

    this.$input = this.$('.kb-field--text input');
    this.$input.on('change', function () {
      that.update(that.$input.val());
    });

    if (attributes && attributes.maxlength) {
      this.$count = jQuery("<span class='charcount kb-field--bubble'></span>").insertAfter(this.$input);
      this.$input.on('keyup change', function () {
        that.charcount(that.$input.val(), that.$count, attributes.maxlength);
      }).trigger('keyup');

    }
  },
  derender: function () {
    this.$input.off();
    if (this.$count) {
      this.$count.off().remove();
    }

  },
  update: function (val) {
    this.model.set('value', val);
  },
  toString: function () {
    return this.$input.val();
  },
  charcount: function (content, $charlimit, limit) {
    var max = limit;
    var len = content.length;
    var charCount = max - len;
    $charlimit.html(charCount + " chars left");
  }
});