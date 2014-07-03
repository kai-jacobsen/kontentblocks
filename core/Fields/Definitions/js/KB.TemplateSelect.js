KB.Fields.register('TemplateSelect', (function($) {
    return {
        init: function() {
            $('body').on('change','.kb-template-select', function(){

                if (KB.focusedModule){
                    KB.focusedModule.set('viewfile', $(this).val());
                    KB.focusedModule.view.trigger('template::changed');

                }
            })
        },
        update: function() {
        }
    };

}(jQuery)));