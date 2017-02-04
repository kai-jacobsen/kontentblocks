var BaseController = require('fields/MultipleControllerBase');
module.exports = BaseController.extend({
  type: 'date-multiple',
  setupData: function () {
    var data = this.model.get('value');
    data.sort(function (a, b) {
      return (a.unix < b.unix) ? -1 : 1
    });
    return data;
  }
});