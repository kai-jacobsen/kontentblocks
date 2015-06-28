var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.parent = options.parent;
  },
  attributes: {
    "data-tipsy": 'Move area inside context'
  },
  className: 'genericon genericon-draggable kb-area-move-handle',

  isValid: function () {
    return true;
  }
});