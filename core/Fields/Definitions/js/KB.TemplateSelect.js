KB.Fields.register('TemplateSelect', (function($) {
    var view;

    return {
        init: function() {
            $('body').on('change.template-select','.kb-template-select', function(){
                if (KB.focusedModule){
                    console.log(KB.focusedModule);
                    KB.focusedModule.set('viewfile', $(this).val());
                    KB.focusedModule.view.trigger('template::changed');
                }
            })
        },
        update: function() {
        }
    };

}(jQuery)));