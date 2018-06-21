var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/DateTime',
  template: require('templates/fields/Datetime.hbs'),
  type: 'datetime',
  render: function () {
    var el = this.template({
      model: this.model.toJSON()
    });
    this.setElement(el);
    return this.$el;
  },
  postRender: function(){
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
    this.$unixIn = this.$('.kb-datetimepicker--js-unix');
    this.$sqlIn = this.$('.kb-datetimepicker--js-sql');
    this.$('.kb-datetimepicker').datetimepicker(_.extend(this.defaults, this.settings));
  }
  
});




