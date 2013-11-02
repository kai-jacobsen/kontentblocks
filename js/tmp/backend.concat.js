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
        send: function(data, callback, scope) {



            data.supplemental = data.supplemental || {};

            
            data.count = parseInt($('#kb_all_blocks').val());
            data.nonce = $('#_kontentblocks_ajax_nonce').val();
            data.post_id = parseInt($('#post_ID').val()) || -1;
            data.kbajax = true;

            $(kbMetaBox).addClass('kb_loading');


            $('#publish').attr('disabled', 'disabled');
            $.ajax({
                url: ajaxurl,
                data: data,
                type: 'POST',
                dataType: 'json',
                success: function(data) {
                    if (data) {
                        var count =  parseInt($('#kb_all_blocks').val()) + 1;
                        $('#kb_all_blocks').val(count);

                        if (scope){
                            callback.call(scope, data);
                        } else {
                            callback(data);
                        }
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
var KB = KB || {};

KB.Checks = (function($) {
    return {
        blockLimit: function(areamodel) {
            var limit = areamodel.get('limit');
            var children = areamodel.get('assignedModules').length;
            if (limit === 0) {
                return false;
            }

            if (children === limit) {
                return false;
            }

            return true;
        },
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
var KB = KB || {};

KB.ViewsCollection = function() {
    this.views = {},
            this.add = function(id, view) {
                this.views[id] = view;
            };
    this.remove = function(id) {
        var view = this.get(id);
        view.$el.fadeOut(500,function(){
            view.remove();
        });
        delete this.views[id];
    };
    this.get = function(id) {
        if (this.views[id]) {
            return this.views[id];
        }
    };

};
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.AreaModel = Backbone.Model.extend({
    idAttribute: 'id'
});
var KB = KB || {};
KB.Backbone.ModuleMenuTileModel = Backbone.Model.extend({
    defaults: {
        template: false,
        master: false,
        duplicate: false
    }
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
'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.AreaView = Backbone.View.extend({
    initialize: function() {
        this.controlsContainer = jQuery('.add-modules', this.$el);
        this.modulesList = jQuery('#' + this.model.get('id') + '-list', this.$el);
        this.render();
    },
    events: {
        'click .modules-link': 'openModulesMenu'
    },
    render: function() {
        this.addControls();
    },
    addControls: function() {
        this.controlsContainer.append(KB.Templates.render('be_areaAddModule', {}));
    },
    openModulesMenu: function() {
        var that = this;
        KB.openedModal = vex.open({
            content: jQuery('#' + that.model.get('id') + '-nav').html(),
            afterOpen: function() {
                KB.menutabs();
                that.menuView = new KB.Backbone.AreaModuleMenuView({
                    el: this.$vexContent,
                    area: that.model.get('id'),
                    parentView: that
                });
            },
            afterClose: function(){
                that.menuView.remove();
            },
            contentClassName: 'modules-menu'
        }) || null;
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
                KB.Checks.userCan('delete_kontentblocks')) {
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
        KB.Modules.remove(this.model);
        KB.Notice.notice('Good bye', 'success');
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
        console.log(KB); 
    },
    isValid: function() {
        if (!this.model.get('predefined') &&
                !this.model.get('disabled') &&
                KB.Checks.userCan('edit_kontentblocks')) {
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
                KB.Checks.userCan('deactivate_kontentblocks')) {
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
var KB = KB || {};

KB.Backbone.ModuleMenuTileView = Backbone.View.extend({
    events: {
        'click': 'createModule'
    },
    createModule: function() {


        // check if capability is right for this action
        if (KB.Checks.userCan('create_kontentblocks')) {
            KB.Notice.notice('Yeah', 'success');
        } else {
            KB.Notice.notice('Oh well', 'error');
        }

        // check if block limit isn't reached
        var Area = KB.Areas.get(this.options.area);
        if (KB.Checks.blockLimit(Area)) {
            KB.Notice.notice('Limit for this area reached', 'error');
            return false;
        }

        vex.close(KB.openedModal.data().vex.id);

        // prepare data to send
        var data = {
            action: 'createNewModule',
            type: this.model.get('type'),
            master: this.model.get('master'),
            template: this.model.get('template'),
            duplicate: this.model.get('duplicate'),
            page_template: KB.Screen.page_template,
            post_type: KB.Screen.post_type,
            area_context: this.model.get('context'),
            area: this.options.area
        };

        KB.Ajax.send(data, this.success, this);
    },
    success: function(data) {
        this.options.parentView.modulesList.append(data.html);
        KB.Modules.add(data.module);
        // repaint
        // add module to collection
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


KB.Views = {
    Modules: new KB.ViewsCollection,
    Areas: {}
};

KB.Modules = new KB.Backbone.ModulesCollection([], {
    model: KB.Backbone.ModuleModel
});

KB.Areas = new KB.Backbone.AreasCollection([], {
    model: KB.Backbone.AreaModel
});

KB.App = (function($) {

    function init() {
        KB.Modules.on('add', createModuleViews);
        KB.Areas.on('add', createAreaViews);
        KB.Modules.on('remove', removeModule);
        addViews();
    }

    function addViews() {
        _.each(KB.RawAreas, function(area) {
            KB.Areas.add(new KB.Backbone.AreaModel(area));

            if (area.modules) {
                _.each(area.modules, function(module) {
                    KB.Modules.add(module);
                });
            }
        });
    }


    function createModuleViews(module) {
        KB.Views.Modules.add(module.get('instance_id'), new KB.Backbone.ModuleView({
            model: module,
            el: '#' + module.get('instance_id')
        })
                );
    }

    function createAreaViews(area) {
        KB.Views.Areas[area.get('id')] = new KB.Backbone.AreaView({
            model: area,
            el: '#' + area.get('id')
        });
    }

    function removeModule(model) {
        KB.Views.Modules.remove(model.get('instance_id'));
    }

    return {
        init: init
    };

}(jQuery));
KB.App.init();