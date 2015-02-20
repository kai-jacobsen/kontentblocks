KB.Fields.registerObject('date', KB.Fields.BaseView.extend({

  initialize: function () {
    var that = this;
    this.defaults = {
      format: 'd M Y',
      offset: [0, 250],
      onSelect: function (selected, machine, Date, $el) {
        that.$machineIn.val(machine);
        that.$unixIn.val(Math.round(Date.getTime() / 1000));
      }
    };
    this.settings = this.model.get('options') || {};
    this.render();
  },
  render: function () {
    this.$machineIn = this.$('.kb-date-machine-format', this.$el);
    this.$unixIn = this.$('.kb-date-unix-format', this.$el);

    this.$('.kb-datepicker').Zebra_DatePicker(_.extend(this.defaults, this.settings));
  },
  derender: function () {

  }
}));