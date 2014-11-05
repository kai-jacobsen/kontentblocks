/**
 * Override module browser prototype
 */

KB.Backbone.ModuleBrowser.prototype.success = function(data){
    var model;
    this.options.area.$el.append(data.html).removeClass('kb-area__empty');
    KB.lastAddedModule = new KB.Backbone.ModuleModel(data.module);
    model = KB.Modules.add(KB.lastAddedModule);

    //this.options.area.addModuleView(model.view);
    _K.info('new module created', {view: model.view});

    //this.parseAdditionalJSON(data.json);

    KB.TinyMCE.addEditor();
    KB.Fields.trigger('newModule', KB.Views.Modules.lastViewAdded);
    KB.Views.Modules.lastViewAdded.$el.addClass('kb-open');

    // update the reference counter, used as base number
    // for new modules
    KB.Environment.moduleCount++;

    KB.Views.Modules.lastViewAdded.openOptions();

    // repaint
    // add module to collection
};