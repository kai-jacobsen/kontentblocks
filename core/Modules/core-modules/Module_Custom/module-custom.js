KB.CustomModule = function (view) {
    this.view = view;
    console.log(this);
}

var CustomModule = (function ($) {

    return{

        defaults: {
            content: '',
            imgid: null,
            imgsrc: null
        },
        elCount: 0,
        $wrapper: null,
        $list: null,
        instance_id: null,
        $parentEl: null,
        selector: '.kb-js--generic-create-item',
        template: null,
        $imgid: null,
        $imgwrap: null,
        $item: null,
        moduleData: null,
        init: function () {
            var that = this;

            var views = KB.Views.Modules.filterByModelAttr('class', 'Module_Custom');
            _.each(views, function (view) {
                view.CM = new KB.CustomModule(view);
                view.on('kb:frontend::viewLoaded', that.listen);
                view.on('kb:backend::viewUpdated', that.listen);
            });

            KB.Views.Modules.on('kb:viewAdded', function(view){
               console.log('ViewAdded', view);
            });

        },
        listen: function () {
            alert('listen');
        }

    }


}(jQuery));
CustomModule.init();