KB.Fields.register('TemplateSelect', (function($) {
    var view;

    return {
        init: function() {
            $('body').on('change.template-select','.kb-template-select', function(){
                if (KB.focusedModule){
                    KB.focusedModule.set('viewfile', $(this).val());
                    KB.trigger('template::changed', KB.focusedModule);
                }
            })
        },
        update: function() {
        }
    };

}(jQuery)));