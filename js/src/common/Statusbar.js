KB.Backbone.Frontend.StatusBar = Backbone.View.extend({
    messages: [],
    className: 'kb-statusbar kb-brand',
    initialize: function () {
        this.$statusbar = jQuery('<span class="kb-brand kb-status-bar">Kontentblocks</span>').appendTo(this.$el);
        this.interval(this.handleMsg, 500, 10000);
    },
    reset: function () {
        this.$statusbar.text('kontentblocks');
    },
    setMsg: function (msg) {
        var that = this;
        this.messages.push(msg);
    },
    printMsg: function (msg) {
        var that = this;
        this.$statusbar.fadeTo(50, 0, function () {
            that.$statusbar.text(msg);
            that.$statusbar.fadeTo(50, 1);
        });
    },
    handleMsg: function () {
        if (this.messages.length > 0) {
            this.printMsg(this.messages.shift());
        }
    },
    interval: function (func, wait, times) {
        var that = this;
        var interv = function (w, t) {
            return function () {
                if (typeof t === "undefined" || t-- > 0) {
                    setTimeout(interv, w);
                    try {
                        func.call(that);
                    }
                    catch (e) {
                        t = 0;
                        throw e.toString();
                    }
                }
            };
        }(wait, times);

        setTimeout(interv, wait);
    }
});