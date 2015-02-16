/**
 * Override module browser success method
 */
KB.Backbone.ModuleBrowser.prototype.success = function (res) {
  var model;

  if (this.dropZone) {
    this.dropZone.$el.after(res.data.html);
    this.dropZone.removeDropZone();
  } else {
    this.options.area.$el.append(res.data.html).removeClass('kb-area__empty');
  }

  console.log(res.data.module);

  model = KB.Modules.add(new KB.Backbone.ModuleModel(res.data.module));

  //this.options.area.addModuleView(model.view);
  _K.info('new module created', {view: model.view});

  this.parseAdditionalJSON(res.data.json);
  KB.TinyMCE.addEditor(model.view.$el);
  KB.Fields.trigger('newModule', KB.Views.Modules.lastViewAdded);

  this.options.area.trigger('kb.module.created');

  setTimeout(function () {
    model.view.openOptions();
  }, 300);

  // repaint
  // add module to collection
};

/**
 * 'extending' the original close method to remove dynamical set property 'dropZone'
 * see http://stackoverflow.com/questions/11381437/extending-prototype-function-without-overwriting-it
 */
(function (close) {
  KB.Backbone.ModuleBrowser.prototype.close = function () {
    delete this.dropZone;
    close.call(this);
  };
}(KB.Backbone.ModuleBrowser.prototype.close));