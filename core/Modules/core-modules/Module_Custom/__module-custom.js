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

            $('body').on('mouseover', '.kb-generic--list-item', function () {
                that.$item = $(this);

            });
            $('body').on('click', this.selector, function () {
                that.setup();
                that.addItem();
            });

            $('body').on('click', '.kb-js-add-custom', function () {

                that.$imgid = $('.kb-js-generic--imgid', that.$item);
                that.$imgwrap = $('.kb-generic--image-wrapper', that.$item);

                new KB.Utils.MediaWorkflow({
                    select: _.bind(that.select, that)
                })
            });

            this.initialSetup();
        },
        initialSetup: function () {
            var that = this;
            var views = KB.Views.Modules.filterByModelAttr('class', 'Module_Custom');
            _.each(views, function(view){
                var model = view.model;
                var moduleData = KB.fromServer.moduleData[model.get('instance_id')];
                var $list = $('.kb-generic--list', view.$el);
                var htmltemplate = $('.template', view.$el).html();
                var counter = 0;
                _.each(moduleData, function(dataset){
                    var unique = _.clone(dataset);
                    var def = _.clone(that.defaults);
                    unique.base = model.get('instance_id');
                    unique.counter = counter;
                    $list.append(_.template(htmltemplate, _.extend(def, unique)));
                    counter++;
                });

                $listItems = $('.kb-generic--list-item', $list);
                _.each($listItems, function(item){
                    var $el = $('.kb-remote-editor', $(item));
                    var editorName = $el.attr('data-name');
                    KB.TinyMCE.remoteGetEditor($el, editorName, $el.html());
                });


            });

        },
        setup: function () {

            this.instance_id = KB.focusedModule.get('instance_id');
            this.$parentEl = KB.focusedModule.view.$el;
            this.$wrapper = $('.kb-field--wrap', this.$parentEl);
            this.$list = $('.kb-generic--list', this.$wrapper);
            this.template = $('.template', this.$wrapper).html();


        },
        addItem: function () {
            this.count = $('.kb-generic--list-item', this.$list).length;
            this.$list.append(_.template(this.template, _.extend({base: this.instance_id, counter: this.count}, this.defaults)));
            var $el = $('.kb-generic--list-item', this.$list).last().find('.kb-remote-editor');
            var editorName = $el.attr('data-name');
            KB.TinyMCE.remoteGetEditor($el, editorName, $el.html());

        },
        select: function (modal) {
            var attachment = modal.get('selection').first();
            var url = attachment.get('sizes').thumbnail;
            this.$imgid.val(attachment.get('id'));
            this.$imgwrap.empty().append('<img src="' + url.url + '" >');
        },
        onLoad: function () {
            alert('load');
        }

    }


}(jQuery));
CustomModule.init();