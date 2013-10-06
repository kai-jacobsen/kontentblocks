var KBApp = KBApp || {};

KB.Templates = (function($) {

    var tmpl_cache = {};

    function getTmplCache(){
        return tmpl_cache;
    };

    function render(tmpl_name, tmpl_data) {
        
        if (!tmpl_cache[tmpl_name]) {
            var tmpl_dir = KBAppConfig.url + 'js/templates';
            var tmpl_url = tmpl_dir + '/' + tmpl_name + '.html';

            var tmpl_string;
            $.ajax({
                url: tmpl_url,
                method: 'GET',
                async: false,
                success: function(data) {
                    tmpl_string = data;
                }
            });

            tmpl_cache[tmpl_name] = _.template(tmpl_string);
        }

        return tmpl_cache[tmpl_name](tmpl_data);
    }
    

    return {
        render: render
    };
}(jQuery));

var KBApp = (function() {
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

    app.Collection = Collection;
    app.Views = Views;
    return app;
}());