KB.Backbone.ModuleBrowserModuleDescription = Backbone.View.extend({
    initialize: function (options) {
        this.options = options || {};
        this.options.browser.on('browser:close', this.close, this);
    },
    update: function () {
        var that = this;
        this.$el.empty();

        if (this.model.get('template')){
            this.$el.html(KB.Templates.render('backend/modulebrowser/module-template-description', {module: this.model.toJSON()}));
        } else {
            this.$el.html(KB.Templates.render('backend/modulebrowser/module-description', {module: this.model.toJSON()}));
        }
        if (this.model.get('settings').helpfile !== false) {
            this.$el.append(KB.Templates.render(this.model.get('settings').helpfile, {module: this.model.toJSON()}));
        }

    },
    close: function () {
//        this.unbind();
//        this.remove();
//        delete this.$el;
//        delete this.el;
    }
});
