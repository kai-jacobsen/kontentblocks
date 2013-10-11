var KBApp = KBApp || {};


var KBApp = (function($) {
    var app = {};

    var Views = [];

    var Collection = new KB.ModulesCollection(Konfig, {
        model: KB.ModuleModel
    });

    _.each(Collection.models, function(model) {
        Views.push(new KB.ModuleView({
            el: '#' + model.get('instance_id'),
            model: model
        }));
    });
    
    $('body').append(KB.Templates.render('fe_iframe', {}));

    app.Collection = Collection;
    app.Views = Views;
    return app;
}(jQuery));