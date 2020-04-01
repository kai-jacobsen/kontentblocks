var Utilities = require('common/Utilities');
module.exports = Backbone.View.extend({

  initialize: function (options) {
    var that = this;
    this.$toggle = options.$toggle;
    this.uid = options.uid;
    // setup local storage
    var testStorage = Utilities.store.get(this.uid);
    if (window.store.enabled) {
      if (_.isUndefined(testStorage)) {
        Utilities.store.set(this.uid, {open: true});
      }
      this.bindHandlers();
      _.defer(function () {
        that.initialState();
      });
    }


  },
  bindHandlers: function () {
    var that = this;
    this.$toggle.on('click', function () {
      that.toggle();
    });
  },
  toggle: function () {
    var state = Utilities.store.get(this.uid) || {open:true};
    this.$el.slideToggle(250);
    state = !state.open;
    Utilities.store.set(this.uid, {open: state});
    this.$toggle.toggleClass('kb-toggle-open');
  },
  initialState: function () {
    var state = Utilities.store.get(this.uid);
    if (state && !_.isUndefined(state.open) && state.open === false) {
      this.$el.slideUp(200);
      this.$toggle.removeClass('kb-toggle-open');
      return null;
    }
    this.$toggle.addClass('kb-toggle-open');

  }

});