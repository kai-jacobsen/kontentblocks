'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleMenuItemView = Backbone.View.extend({
    tagName: 'div',
    className: '',
    isValid: function() {
        return true;
    }
});