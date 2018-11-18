var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    var that = this;
    this.defaults = {
      format: 'd.m.Y H:i',
      inline: false,
      mask: true,
      lang: 'de',
      allowBlank: true,
      onChangeDateTime: function (current, $input) {
        that.$unixIn.val(current.dateFormat('unixtime'));
        that.$sqlIn.val(current.dateFormat('Y-m-d H:i:s'));
      }
    };
    this.settings = this.model.get('settings') || {};
    this.render();
  },
  render: function () {
    this.$unixIn = this.$('.kb-datetimepicker--js-unix');
    this.$sqlIn = this.$('.kb-datetimepicker--js-sql');
    this.$('.kb-datetimepicker').kbdatetimepicker(_.extend(this.defaults, this.settings));
  },
  derender: function () {
    this.$('.kb-datetimepicker').kbdatetimepicker('destroy');
  }
});