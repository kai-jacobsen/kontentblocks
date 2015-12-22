module.exports = Backbone.Model.extend({

  initialize: function () {
    var LayoutConfigurations = require('extensions/LayoutConfigurations').init();
    this.set('backup-ui', require('extensions/BackupUI'));
    this.set('clipboard', require('extensions/Clipboard').init());
    this.set('yoast', require('extensions/YoastSeo'));

  }

});