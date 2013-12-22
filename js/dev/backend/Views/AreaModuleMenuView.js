var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.AreaModuleMenuView = Backbone.View.extend({
    tilesViews: [],
    initialize: function() {
        var that = this;
        var $tiles = jQuery('.block-nav-item', this.$el);

        if ($tiles.length > 0) {
            _.each($tiles, function(tile) {
                that.tilesViews.push(new KB.Backbone.ModuleMenuTileView({
                    model: new KB.Backbone.ModuleMenuTileModel(
                            jQuery(tile).data()
                            ),
                    el: tile,
                    area: that.options.area,
                    parentView: that.options.parentView
                }));
            });
        }


    }

});