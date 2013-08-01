(function($) {

    var LayoutTemplates = {
        el: $('#layout-templates'),
        init: function() {
            this.selectMenuEl = this._createSelectMenu();
            this.areaConfig = this._areaConfig();

            this.update();
        },
        _createSelectMenu: function() {
            $('<select name="layout-template"></select>').appendTo(this.el).hide();
            return $('select', this.el);
        },
        update: function() {
            var that = this;


            KB.ajax(
                    {
                        action: 'get_layout_templates',
                        post_id: kbpage.post_id,
                    },
                    function(response)
                    {
                        that.renderSelectMenu(response);
                    });

        },
        renderSelectMenu: function(data) {
            console.log('data', data);
        },
        _areaConfig: function() {

            var concat = '';

            if (kbpage.areas) {
                _.each(kbpage.areas, function(context) {
                    concat += _.pluck(context, 'id');
                });
            }
            console.log(this.hash(concat.replace(',','')));
        },
        hash: function(s) {
            return s.split("").reduce(function(a,b){
                a=((a<<5)-a)+b.charCodeAt(0); return a&a},0);
           
        }

    };

    LayoutTemplates.init();

}(jQuery));