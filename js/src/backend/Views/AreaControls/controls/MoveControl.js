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
  },
  className: 'genericon genericon-draggable kb-area-move-handle',

  isValid: function () {
    if (KB.Environment && KB.Environment.postType === 'kb-dyar'){
      return false;
    }
    return true;
  }
});