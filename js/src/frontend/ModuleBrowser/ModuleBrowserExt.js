/**
 * Override module browser success method
 */
KB.Backbone.ModuleBrowser.prototype.success = function (data) {
    var model;

    if (this.dropZone) {
        this.dropZone.$el.after(data.html);
        this.dropZone.removeDropZone();
    } else {
        this.options.area.$el.append(data.html).removeClass('kb-area__empty');
    }

    KB.lastAddedModule = new KB.Backbone.ModuleModel(data.module);
    model = KB.Modules.add(KB.lastAddedModule);

    //this.options.area.addModuleView(model.view);
    _K.info('new module created', {view: model.view});

    this.parseAdditionalJSON(data.json);
    KB.TinyMCE.addEditor();
    KB.Fields.trigger('newModule', KB.Views.Modules.lastViewAdded);

    // update the reference counter, used as base number
    // for new modules
    KB.Environment.moduleCount++;

    this.options.area.trigger('kb.module.created');

    setTimeout(function () {
        model.view.openOptions();
        model.view.renderPlaceholder();
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