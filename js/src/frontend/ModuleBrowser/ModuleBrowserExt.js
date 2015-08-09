/**
 * Override module browser success method
 */
var ModuleBrowser = require('shared/ModuleBrowser/ModuleBrowserController');
var ModuleModel = require('frontend/Models/ModuleModel');
var TinyMCE = require('common/TinyMCE');
module.exports = ModuleBrowser.extend({
  success : function (res) {
    var model;
    if (this.dropZone) {
      this.dropZone.$el.after(res.data.html);
      this.dropZone.removeDropZone();
    } else {
      this.options.area.$el.append(res.data.html).removeClass('kb-area__empty');
    }
    KB.ObjectProxy.add(model = KB.Modules.add(res.data.module));

    this.parseAdditionalJSON(res.data.json);
    KB.Fields.trigger('newModule', KB.Views.Modules.lastViewAdded);
    this.options.area.trigger('kb.module.created');
    setTimeout(function () {
      model.View.openOptions();
    }, 300);

  },
  close: function(){
    delete this.dropZone;
    ModuleBrowser.prototype.close.apply(this, arguments);
  }
});