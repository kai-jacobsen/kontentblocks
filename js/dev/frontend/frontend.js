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

jQuery(document).ready(function(){
    tinymce.init({
        selector: "kontentblocks.editable",
        theme: "modern",
        skin: false,
        menubar: false,
        add_unload_trigger: false,
        schema: "html5",
        inline: true,
        toolbar: "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image     | print preview media",
        statusbar: false,
        setup: function(ed){
            ed.on('blur', function(){
                console.log(ed.getContent());
            });
        }
    });

});