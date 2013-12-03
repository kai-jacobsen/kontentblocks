var KB = KB || {};


	KB.Frontend = (function($) {
    var api = {};

    var Views = [];

    var Collection = new KB.ModulesCollection(KB.PageModules, {
        model: KB.ModuleModel
    });

    _.each(Collection.models, function(model) {
        Views.push(new KB.ModuleView({
            el: '#' + model.get('instance_id'),
            model: model
        }));
    });
    
    $('body').append(KB.Templates.render('fe_iframe', {}));

    api.Collection = Collection;
    api.Views = Views;
    return api;
}(jQuery));