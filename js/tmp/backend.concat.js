'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.AreasCollection = Backbone.Collection.extend({
}); 
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModulesCollection = Backbone.Collection.extend({}); 
var KB = KB || {};

KB.Ajax = (function($) {

    return {
        send: function(data, callback) {


            var nonce = $('#_kontentblocks_ajax_nonce').val();
            var postID = $('#post_ID').val();

            data._kb_nonce = nonce;
            data.post_id = postID;
            data.kbajax = 'true';



            $(kbMetaBox).addClass('kb_loading');
            $('#publish').attr('disabled', 'disabled');

            $.ajax({
                url: ajaxurl,
                data: data,
                type: 'POST',
                dataType: 'json',
                success: function(data) {
                    if (data) {
                        callback;
                    }


                },
                error: function() {
                    // generic error message
                    KB.notice('<p>Generic Ajax Error</p>', 'error');
                },
                complete: function() {
                    $(kbMetaBox).removeClass('kb_loading');
                    $('#publish').removeAttr('disabled');
                }
            })
        }

    };
}(jQuery));
'use strict';

var KB = KB || {};

KB.Caps = (function($) {

    return {
        userCan: function(cap) {
            var check = $.inArray(cap, kontentblocks.caps);
            if (check !== -1)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    };

}(jQuery));
'use strict';

var KB = KB || {};

KB.Notice = (function($) {

    return {
        notice: function(msg, type) {
            alertify.log(msg, type, 3500);
        },
        confirm: function(msg, yes, no) {
            alertify.confirm(msg, function(e) {
                if (e) {
                    yes();
                } else {
                    no();
                }
            });
        }
    };

}(jQuery));
var KB = KB || {};
KB.Templates = (function($) {

    var tmpl_cache = {};

    function getTmplCache(){
        return tmpl_cache;
    }

    function render(tmpl_name, tmpl_data) {
        
        if (!tmpl_cache[tmpl_name]) {
            var tmpl_dir = kontentblocks.config.url + 'js/templates';
            var tmpl_url = tmpl_dir + '/' + tmpl_name + '.html';

            var tmpl_string;
            $.ajax({
                url: tmpl_url,
                method: 'GET',
                async: false,
                success: function(data) {
                    tmpl_string = data;
                }
            });

            tmpl_cache[tmpl_name] = _.template(tmpl_string);
        }
        return tmpl_cache[tmpl_name](tmpl_data);
    }
    

    return {
        render: render
    };
}(jQuery));
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.AreaModel = Backbone.Model.extend({
    idAttribute: 'id'
});
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleModel = Backbone.Model.extend({
    idAttribute: 'instance_id',
    destroy: function() {
        var that = this;
        KB.Ajax.send({
            action: 'removeModules',
            instance_id: that.get('instance_id')
        }, that.destroyed);
    },
    destroyed: function(){
        console.log(this);
    }
});
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
'use strict';

var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleDelete = KB.Backbone.ModuleMenuItemView.extend({
    className: 'kb-delete block-menu-icon',
    initialize: function() {
        _.bindAll(this, "yes", "no");
    },
    events: {
        'click': 'deleteModule'
    },
    deleteModule: function() {
        KB.Notice.confirm('Really?', this.yes, this.no);
    },
    isValid: function() {
        if (!this.model.get('predefined') &&
                !this.model.get('disabled') &&
                KB.Caps.userCan('delete_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    },
    yes: function() {
        KB.Ajax.send({
            action: 'removeModules',
            module: this.model.get('instance_id')
        }, this.success.call(this));
    },
    no: function() {
        return false;
    },
    success: function() {
        
        KB.Notice.notice('Good bye', 'success');
        this.options.parent.$el.hide(500);
    }
}); 
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleDuplicate = KB.Backbone.ModuleMenuItemView.extend({
    className: 'kb-duplicate block-menu-icon',
    events: {
        'click': 'duplicateModule'
    },
    duplicateModule: function() {
        KB.Notice.notice('Duplicate Module', 'success', 4500);
    },
    isValid: function() {
        if (!this.model.get('predefined') &&
                !this.model.get('disabled') &&
                KB.Caps.userCan('edit_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    }
}); 
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleStatus = KB.Backbone.ModuleMenuItemView.extend({
    initialize: function(){
        var that = this;
        this.options.parent.$el.on('click', '.js-module-status', function(event){
            that.changeStatus();
        });
    },
    className: 'module-status block-menu-icon',
    events: {
        'click': 'changeStatus'
    },
    changeStatus: function() {
        this.options.parent.$head.toggleClass('module-inactive');
        this.options.parent.$el.toggleClass('kb_inactive');
        
        KB.Ajax.send({
            action: 'changeModuleStatus',
            module: this.model.get('instance_id')
        }, this.success.call(this));
        
    },
    isValid: function() {
        
        if (!this.model.get('disabled') &&
                KB.Caps.userCan('deactivate_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    },
    success: function(){
        console.log(this.model);
        KB.Notice.notice('Status changed', 'success');
    }
}); 
'use strict';

var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleMenuView = Backbone.View.extend({
    $menuWrap: null,
    $menuList: null,
    events: {
        
    },
    initialize: function() {
        this.$menuWrap = jQuery('.menu-wrap', this.$el);
        this.$menuWrap.append(KB.Templates.render('be_moduleMenu', {}));

        this.$menuList = jQuery('.kb_the_menu', this.$menuWrap);
    },
    addItem: function(view, model) {
        
        if (view.isValid && view.isValid() === true){
            var $liItem = jQuery('<li></li>').appendTo(this.$menuList);
            var $menuItem = $liItem.append(view.el);
            this.$menuList.append($menuItem);
        }
        
    }
});
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleView = Backbone.View.extend({
    $head: null,
    $body: null,
    ModuleMenu: null,
    initialize: function() {

        // Setup Elements
        this.$head = jQuery('.block-head', this.$el);
        this.$body = jQuery('.kb_inner', this.$el);
        this.ModuleMenu = new KB.Backbone.ModuleMenuView({
            el: this.$head,
            parent: this
        });
        
        // Setup View
        this.setupDefaultMenuItems();
    },
    setupDefaultMenuItems: function() {
        this.ModuleMenu.addItem(new KB.Backbone.ModuleStatus({model: this.model, parent: this}));
        this.ModuleMenu.addItem(new KB.Backbone.ModuleDelete({model: this.model, parent: this}));
        this.ModuleMenu.addItem(new KB.Backbone.ModuleDuplicate({model: this.model, parent: this}));
    }

});
'use strict';
var KB = KB || {};
KB.Views = {};
KB.Modules = new KB.Backbone.ModulesCollection([],{
    model: KB.Backbone.ModuleModel
});
KB.Areas = new KB.Backbone.AreasCollection(_.toArray(KB.RawAreas), {
    model: KB.Backbone.AreaModel
});
KB.App = (function($) {

    function init() {
        KB.Modules.on('add', createViews );
        
        addModules();
    }

    function addModules() {
        _.each(KB.RawAreas, function(area) {
            if (area.modules) {
                _.each(area.modules, function(module) {
                    KB.Modules.add(new KB.Backbone.ModuleModel(module));
                });
            }
        });
    }
    
    function createViews(module){
        KB.Views[module.get('instance_id')] =  new KB.Backbone.ModuleView({
            model: module,
            el: '#' + module.get('instance_id')
        });
    }
    
    return {
        init: init
    };

}(jQuery));
KB.App.init();