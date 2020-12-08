(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//KB.Backbone.Backend.ModuleMenuItemView
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: '',
  isValid: function () {
    return true;
  }
});
},{}],2:[function(require,module,exports){
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.Controller = options.Controller;
    this.ContextsViews = this.setupContextsViews();
    this.isVisible = true;
    this.listenTo(this.Controller, 'columns.rendered', this.columnActivated);
    this.listenTo(this.Controller, 'columns.reset', this.reset);
  },
  setupContextsViews: function () {
    var coll = {};
    var that = this;
    var $wraps = this.$('.kb-context-container');

    _.each($wraps, function (el, index) {
      var context = el.dataset.kbcontext;
      var Model = KB.Contexts.get(context);
      coll[Model.View.cid] = Model.View;
      Model.View.isVisible = true;
      Model.View.ColumnView = that;
      that.listenTo(Model.View, 'context.activated', that.activateColumn);
    });
    return coll;
  },
  activateColumn: function () {
    this.trigger('column.activate', this);
  },
  columnActivated: function(View){
    if (View.cid !== this.cid){
      _.each(this.ContextsViews, function(con){
        con.renderProxy();
      });
    } else {
      _.each(this.ContextsViews, function(con){
        con.removeProxy();
      });
    }
  },
  reset: function(){
    _.each(this.ContextsViews, function(con){
      con.removeProxy();
    });
  }


});
},{}],3:[function(require,module,exports){
var tplContextBar = require('templates/backend/context-bar.hbs');
var ContextUiView = require('backend/Views/ContextUi/ContextUiView');
var ContextColumnView = require('backend/Views/ContextUi/ContextColumnView');
var ResetControl = require('backend/Views/ContextUi/controls/ResetControl');
var ColumnControl = require('backend/Views/ContextUi/controls/ColumnControl');
module.exports = Backbone.View.extend({
  initialize: function () {
    var that = this;
    this.columns = this.setupColumns();
    this.layoutBackup = this.createLayoutBackup();
    this.cols = _.toArray(this.columns).length;
    this.render();

    jQuery(window).resize(function () {
      that.resetLayout();
    })
  },
  setupColumns: function () {
    var that = this;
    var cols = this.$('.kb-context-col');
    return _.map(cols, function (el) {
      var View = new ContextColumnView({
        el: el,
        Controller: that
      });
      that.listenTo(View, 'column.activate', that.evalLayout);
      return View;
    });
  },
  render: function () {
    //if (this.cols > 2) {
      var $bar = jQuery(tplContextBar({}));
      this.$el.before($bar);
      this.BarView = new ContextUiView({
        el: $bar
      });
      this.setupMenuItems();
    //}
  },
  setupMenuItems: function () {
    var that = this;
    this.BarView.addItem(new ResetControl({model: this.model, parent: this}));
    _.each(this.columns, function (con) {
      that.BarView.addItem(new ColumnControl({model: that.model, parent: that, ColumnView: con}));
    });
  },
  createLayoutBackup: function () {
    var coll = {};
    _.each(this.columns, function (con, i) {
      coll[i] = con.$el.attr('class');
    });
    return coll;
  },
  resetLayout: function () {
    var that = this;
    _.each(this.columns, function (con) {
      if (!con.isVisible) {
        con.Control.switch();
      }
      con.$el.attr('class', that.layoutBackup[con.cid]);
      con.$el.width('');
    });
    this.trigger('columns.reset');

  },
  evalLayout: function (View) {
    var that = this;
    var w = this.$el.width() - ((this.cols) * 20);
    var pro = this.findProportion(this.cols);

    if ( w < 1100){
      return false;
    }

    _.each(this.columns, function (con) {
      if (con.cid === View.cid) {
        con.$el.width(Math.floor(w * pro.large));
        //con.$el.removeClass('kb-context-downsized');
      } else {
        con.$el.width(Math.floor(w * pro.small));
        //con.$el.addClass('kb-context-downsized');
        //  con.renderProxy();
      }
    });
    this.trigger('columns.rendered', View);
  },
  renderLayout: function () {
    var visible = _.filter(this.columns, function (con) {
      return con.isVisible;
    });
    var l = visible.length;
    var w = this.$el.width() - ((l) * 20);
    _.each(visible, function (con) {
      con.$el.width(Math.floor(w * ((100 / l) / 100)));
    });
  },
  findProportion: function (l) {
    switch (l) {
      case 3:
        return {small: 0.1, large: 0.8};
        break;
      case 2:
        return {small: 0.3333, large: 0.6666};
        break;

      default:
        return {small: 1, large: 1};
        break;
    }
  }
});


},{"backend/Views/ContextUi/ContextColumnView":2,"backend/Views/ContextUi/ContextUiView":4,"backend/Views/ContextUi/controls/ColumnControl":5,"backend/Views/ContextUi/controls/ResetControl":6,"templates/backend/context-bar.hbs":161}],4:[function(require,module,exports){
var ControlsView = require('backend/Views/ModuleControls/ControlsView');
module.exports = ControlsView.extend({
  initialize: function () {
    this.$menuList = jQuery('.kb-context-bar--actions', this.$el);
  }
});
},{"backend/Views/ModuleControls/ControlsView":8}],5:[function(require,module,exports){
//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Controller = options.parent;
    this.ColumnView = options.ColumnView;
    this.ColumnView.Control = this;
  },
  className: 'context-visibility',
  events: {
    'click': 'switch'
  },
  render: function(){
    this.$el.append('<span class="kb-button-small">' + this.ColumnView.$el.data('kbcolname')  +'</span>');
  },
  isValid: function () {
    return true;
  },
  switch: function(){
    this.$el.toggleClass('kb-context-hidden');
    this.ColumnView.$el.toggle();
    this.ColumnView.isVisible = !this.ColumnView.isVisible;
    this.Controller.renderLayout();
  }
});
},{"backend/Views/BaseControlView":1}],6:[function(require,module,exports){
var BaseView = require('backend/Views/BaseControlView');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Controller = options.parent;
  },
  className: 'context-reset-layout',
  events: {
    'click': 'resetLayout'
  },
  render: function(){
      this.$el.append('<span class="kb-button-small">Reset</span>');
  },
  isValid: function () {
    return true;
  },
  resetLayout: function(){
    this.Controller.resetLayout();
  }
});
},{"backend/Views/BaseControlView":1}],7:[function(require,module,exports){
var tplFullscreenInner = require('templates/backend/fullscreen-inner.hbs');
var TinyMCE = require('common/TinyMCE');
var UI = require('common/UI');
module.exports = Backbone.View.extend({
  className: 'kb-fullscreen--holder',
  initialize: function () {
    this.$parent = this.model.View.$el;
    this.$body = jQuery('.kb-module__body', this.$parent);
//     this.observer = new MutationObserver(function(mutations) {
//       mutations.forEach(function(mutation) {
//         console.log(mutation.type);
//       });
//     });
//     // configuration of the observer:
//     var config = { attributes: true, childList: true, characterData: true, subtree:true };
//
// // pass in the target node, as well as the observer options
//     this.observer.observe(this.el, config);

    return this;

  },
  events: {
    'click .kb-fullscreen-js-close': 'close',
    'change .kb-template-select': 'viewfileChange'
  },
  viewfileChange: function (e) {
    var that = this;
    this.model.View.viewfileChange(e);
    this.listenToOnce(this.model.View, 'kb:backend::viewUpdated', function () {
      UI.repaint(that.$body);
    });
  },
  open: function () {
    var that = this;
    that.model.View.open = true;
    TinyMCE.removeEditors();
    this.$backdrop = jQuery('<div class="kb-fullscreen-backdrop"></div>').appendTo('body');
    this.$fswrap = jQuery(tplFullscreenInner()).appendTo(this.$el);
    this.$el.width(jQuery(window).width() * 0.7);
    jQuery('#wpwrap').addClass('module-browser-open');
    this.$body.detach().appendTo(this.$fswrap.find('.kb-fullscreen--inner')).show().addClass('kb-module--fullscreen');
    jQuery(window).resize(function () {
      that.$fswrap.width(jQuery(window).width() * 0.7);
    });
    this.$el.appendTo('body');
    TinyMCE.restoreEditors();
    this.trigger('open');
    this.reposition();

    var height = jQuery(window).height();

    jQuery('.kb-nano', this.$el).height(height - 100);
    jQuery('.kb-nano').nanoScroller({preventPageScrolling: true, contentClass: 'kb-nano-content'});
    //jQuery(window).on('scroll', jQuery.proxy(this.reposition, this));
  },
  reposition: function(){
    var st = jQuery(window).scrollTop();
    this.$el.css('top',  st + 30 + 'px');
  },
  close: function () {
    TinyMCE.removeEditors();
    jQuery('#wpwrap').removeClass('module-browser-open');
    this.$body.detach().appendTo(this.$parent);
    this.$backdrop.remove();
    this.$fswrap.remove();
    this.$el.detach();
    jQuery(window).off('scroll', jQuery.proxy(this.reposition, this));
    this.model.View.open = false;

    setTimeout(function () {
      TinyMCE.restoreEditors();
    }, 250);
    this.trigger('close');
  }
});
},{"common/TinyMCE":28,"common/UI":29,"templates/backend/fullscreen-inner.hbs":162}],8:[function(require,module,exports){
/**
 * Creates the individual module-actions menu
 * like: duplicate, delete, status
 */
//KB.Backbone.Backend.ModuleControlsView
module.exports = Backbone.View.extend({
  id: '',
  $menuWrap: {}, // wrap container jQuery element
  $menuList: {}, // ul item
  initialize: function (options) {
    this.parent = options.parent;
    this.$menuWrap = jQuery('.menu-wrap', this.$el); //set outer element
    this.$menuWrap.append("<div class='module-actions'></div>"); // render template
    this.$menuList = jQuery('.module-actions', this.$menuWrap);
  },
  /**
   * Add an module menu action item
   * @param view view handler for item
   */
  addItem: function (view) {
    this.controls = this.controls || {};
    // var cap = this.parent.model.get('settings').cap;
    // console.log(cap);

    // 'backend' to add menu items
    // actually happens in ModuleView.js
    // this functions validates action by calling 'isValid' on menu item view
    // if isValid render the menu item view
    // see /ModuleMenuItems/ files for action items
    if (view.isValid && view.isValid() === true) {
      var $liItem = jQuery('<div class="kb-controls-item"></div>').appendTo(this.$menuList);
      var $menuItem = $liItem.append(view.el);
      this.$menuList.append($menuItem);
      view.render.call(view);
      this.controls[view.id] = view;
    }
  },
  getView: function (id) {
    if (this.controls[id]) {
      return this.controls[id];
    }
    return false;
  }
});
},{}],9:[function(require,module,exports){
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var ViewsList = require('./ViewsList');
var Controls = require('./Controls');
var Fields = require('./FieldsList');
var tplEDitor = require('templates/backend/template-editor/wrap.hbs');

module.exports = Backbone.View.extend({
  className: 'kb-codemirror-overlay',
  currentView: null,
  initialize: function (options) {
    this.viewfile = options.viewfile;
    this.moduleView = options.moduleView;
    this.$wrap = jQuery(tplEDitor()).appendTo(this.$el);
    this.$sidebar = this.$('.kb-tpled--sidebar');
    this.$content = this.$('.kb-tpled--content');
    this.moduleModel = options.module;
    this.views = this.prepareViews(this.moduleModel.get('views'));
    this.open();
  },
  events: {
    'click .kb-tpled--close': 'close'
  },
  open: function () {
    this.$backdrop = jQuery('<div class="kb-fullscreen-backdrop"></div>').appendTo('body');
    // this.$el.width(jQuery(window).width() * 0.9);
    jQuery('#wpwrap').addClass('module-browser-open');
    this.$el.appendTo('body');
    this.trigger('open');
    this.editor = CodeMirror(document.getElementById('codemirror'), {
      mode: "twig",
      theme: 'dracula',
      lineNumbers: true,
      lineWrapping: true,
      tabMode: "indent",
      indentUnit: 4
    });
    this.render();
  },
  close: function () {
    this.$backdrop.remove();
    jQuery('#wpwrap').removeClass('module-browser-open');
    this.$el.detach();
    this.trigger('close');

  },
  render: function () {
    this.List = new ViewsList({
      $container: this.$('[data-views]'),
      views: this.views,
      controller: this
    }).render();
    this.Controls = new Controls({
      $container: this.$('[data-controls]'),
      controller: this
    }).render();
    this.Fields = new Fields({
      $container: this.$('[data-fields]'),
      controller: this
    });
    this.load(this.List.getActiveView());
  },
  load: function (viewfile) {
    var that = this;

    if (this.currentView) {
      this.currentView.deselect();
    }
    Ajax.send({
      viewfile: viewfile.model.toJSON(),
      action: 'getTemplateString',
      module: this.moduleModel.toJSON(),
      _ajax_nonce: Config.getNonce('read')
    }, function (res) {
      that.editor.setValue(res.data.string);
      that.currentView = viewfile;
      that.currentView.select();
      that.Fields.setFields(res.data.fields).render();
    }, this);
  },
  getCurrentView: function () {
    return this.currentView;
  },
  prepareViews: function (views) {
    return _.map(views, function (view) {
      view.selected = (view.filename === this.moduleModel.get('viewfile')) ? 'selected="selected"' : '';
      view.isActive = (view.filename === this.moduleModel.get('viewfile'));
      return view;
    }, this);
  }

});
},{"./Controls":10,"./FieldsList":12,"./ViewsList":14,"common/Ajax":20,"common/Config":22,"templates/backend/template-editor/wrap.hbs":173}],10:[function(require,module,exports){
var Update = require('backend/Views/TemplateEditor/controls/UpdateControl');
var Create = require('backend/Views/TemplateEditor/controls/CreateControl');
var Duplicate = require('backend/Views/TemplateEditor/controls/DuplicateControl');
var Feedback = require('backend/Views/TemplateEditor/controls/FeedbackControl');
var Delete = require('backend/Views/TemplateEditor/controls/DeleteControl');
module.exports = Backbone.View.extend({
  tagName: 'ul',
  className: 'kb-tpl-editor-controls',
  initialize: function (options) {
    this.$container = options.$container;
    this.controller = options.controller;
  },
  render: function () {
    this.$container.empty().append(this.$el);
    this.createControls();
    return this;
  },
  createControls: function () {
    this.$el.append(new Update({controller: this.controller, controls:this}).render());
    this.$el.append(new Create({controller: this.controller, controls:this}).render());
    this.$el.append(new Duplicate({controller: this.controller, controls:this}).render());
    this.$el.append(new Delete({controller: this.controller, controls:this}).render());
    this.$el.append(new Feedback({controller: this.controller, controls:this}).render());
  }


});
},{"backend/Views/TemplateEditor/controls/CreateControl":15,"backend/Views/TemplateEditor/controls/DeleteControl":16,"backend/Views/TemplateEditor/controls/DuplicateControl":17,"backend/Views/TemplateEditor/controls/FeedbackControl":18,"backend/Views/TemplateEditor/controls/UpdateControl":19}],11:[function(require,module,exports){
var tplFieldItem = require('templates/backend/template-editor/field-item.hbs');
module.exports = Backbone.View.extend({
  tagName: 'li',
  initialize: function (options) {
    this.controller = options.controller;
    this.$list = options.$list
  },
  render: function () {
    console.log(this.model.toJSON());
    this.$el.append(tplFieldItem({data: this.model.toJSON()}));
    this.$list.append(this.$el);
  }
});
},{"templates/backend/template-editor/field-item.hbs":171}],12:[function(require,module,exports){
var ListItem = require('backend/Views/TemplateEditor/FieldItem');
module.exports = Backbone.View.extend({
  tagName: 'ul',
  initialize: function (options) {
    this.$container = options.$container;
    this.controller = options.controller;
  },
  render: function () {
    this.$container.empty().append(this.$el);
    this.$el.empty();
    _.each(this.fields, function (v) {
      v.render();
    });
    return this;
  },
  setFields: function (fields) {
    this.fields = this.createViews(fields);
    return this;
  },
  createViews: function (views) {
    return _.map(views, function (listItem) {
      return new ListItem({
        controller: this.controller,
        $list: this.$el,
        model: new Backbone.Model(listItem)
      });
    }, this);
  }

});
},{"backend/Views/TemplateEditor/FieldItem":11}],13:[function(require,module,exports){
var tplListItem = require('templates/backend/template-editor/list-item.hbs');
module.exports = Backbone.View.extend({
  tagName: 'li',
  initialize: function (options) {
    this.controller = options.controller;
    this.$list = options.$list
  },
  events: {
    'click': 'loadView'
  },
  render: function () {
    this.$el.append(tplListItem({data: this.model.toJSON()}));
    this.$list.append(this.$el);
  },
  loadView: function () {
    this.controller.load(this)
  },
  select: function () {
    this.$el.addClass('kb-active-template');
  },
  deselect: function () {
    this.$el.removeClass('kb-active-template');
  }
});
},{"templates/backend/template-editor/list-item.hbs":172}],14:[function(require,module,exports){
var ListItem = require('backend/Views/TemplateEditor/ListItem');
module.exports = Backbone.View.extend({
  tagName: 'ul',
  initialize: function (options) {
    this.$container = options.$container;
    this.controller = options.controller;
    this.views = this.createViews(options.views);
  },
  render: function () {
    this.$container.empty().append(this.$el);
    _.each(this.views, function (v) {
      v.render();
    });
    return this;
  },
  updateViews: function (views) {
    var prepedViews = this.controller.prepareViews(views);
    this.views = this.createViews(prepedViews);
    this.$el.empty();
    this.render();
    var tplSelect = this.controller.moduleView.ModuleStatusBar.getView('templates');
    tplSelect.render(prepedViews);

  },
  getActiveView: function () {
    return _.find(this.views, function (view) {
      return view.model.get('isActive');
    })
  },
  createViews: function (views) {
    return _.map(views, function (listItem) {
      return new ListItem({
        controller: this.controller,
        $list: this.$el,
        model: new Backbone.Model(listItem)
      });
    }, this);
  }

});
},{"backend/Views/TemplateEditor/ListItem":13}],15:[function(require,module,exports){
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var Notice = require('common/Notice');

module.exports = Backbone.View.extend({
  tagName: 'li',
  initialize: function (options) {
    this.controller = options.controller;
    this.controls = options.controls
  },
  events: {
    'click': 'ask'
  },
  render: function () {
    return this.$el.html('<span class="dashicons dashicons-welcome-add-page"></span> Create new template');
  },
  ask: function () {
    var tplName;
    Notice.prompt('Template Name', 'Please provide a unique template name', '.twig', function (evt, value) {
        tplName = value;
        this.create(tplName);
      },
      function (evt, value) {
      }, this);
  },
  create: function (tplName) {
    var view = this.controller.getCurrentView();
    Ajax.send({
      action: 'createModuleViewTemplate',
      _ajax_nonce: Config.getNonce('update'),
      module: this.controller.moduleModel.toJSON(),
      tplstring: '',
      filename: tplName
    }, this.success, this);
  },
  success: function (res) {
    if (res.success === false) {
      Notice.notice(res.message, 'error', 8);
      return;
    }
    this.controller.List.updateViews(res.data.views);
    this.controller.trigger('broadcast', res.message);

  }
});
},{"common/Ajax":20,"common/Config":22,"common/Notice":25}],16:[function(require,module,exports){
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var Notice = require('common/Notice');

module.exports = Backbone.View.extend({
  tagName: 'li',
  initialize: function (options) {
    this.controller = options.controller;
    this.controls = options.controls
  },
  events: {
    'click': 'ask'
  },
  render: function () {
    return this.$el.html('<span class="dashicons dashicons-trash"></span> Delete loaded template');
  },
  ask: function () {
    Notice.confirm('Template Name', 'Delete template?', function (evt, value) {
        this.delete();
      },
      function (evt, value) {
      }, this);
  },
  delete: function () {
    var view = this.controller.getCurrentView();
    Ajax.send({
      action: 'deleteModuleViewTemplate',
      _ajax_nonce: Config.getNonce('update'),
      module: this.controller.moduleModel.toJSON(),
      view: view.model.toJSON()
    }, this.success, this);
  },
  success: function (res) {
    if (res.success === false) {
      Notice.notice(res.message, 'error', 8);
      this.controller.trigger('broadcast', res.message);
      return
    }
    this.controller.List.updateViews(res.data.views);
    this.controller.trigger('broadcast', res.message);

  }
});
},{"common/Ajax":20,"common/Config":22,"common/Notice":25}],17:[function(require,module,exports){
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var Notice = require('common/Notice');

module.exports = Backbone.View.extend({
  tagName: 'li',
  initialize: function (options) {
    this.controller = options.controller;
    this.controls = options.controls
  },
  events: {
    'click': 'ask'
  },
  render: function () {
    return this.$el.html('<span class="dashicons dashicons-admin-page"></span> Copy');
  },
  ask: function () {
    var tplName;
    Notice.prompt('Template Name', 'Please provide a unique template name', '.twig', function (evt, value) {
        tplName = value;
        this.create(tplName);
      },
      function (evt, value) {
      }, this);
  },
  create: function (tplName) {
    var view = this.controller.getCurrentView();
    Ajax.send({
      action: 'createModuleViewTemplate',
      _ajax_nonce: Config.getNonce('update'),
      module: this.controller.moduleModel.toJSON(),
      filename: tplName,
      tplstring: this.controller.editor.getValue()
    }, this.success, this);
  },
  success: function (res) {
    if (res.success === false) {
      Notice.notice(res.message, 'error', 8);
      return;
    }
    this.controller.List.updateViews(res.data.views);
    this.controller.trigger('broadcast', res.message);

  }
});
},{"common/Ajax":20,"common/Config":22,"common/Notice":25}],18:[function(require,module,exports){
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var Notice = require('common/Notice');

module.exports = Backbone.View.extend({
  tagName: 'li',
  className: 'kb-tpled--notice',
  initialize: function (options) {
    this.controller = options.controller;
    this.controls = options.controls;
    this.listenTo(this.controller, 'broadcast', this.setMessage);
  },
  events: {
    'click': 'update'
  },
  render: function () {
    return this.$el.html('<span class="dashicons dashicons-warning"></span><div class="" data-message></div>');
  },
  setMessage: function (msg) {
    var $msg = this.$('[data-message]');
    $msg.hide().html(msg).fadeIn(1500);
    setTimeout(function () {
      $msg.fadeOut(2000);
    }, 5000);
  }
});
},{"common/Ajax":20,"common/Config":22,"common/Notice":25}],19:[function(require,module,exports){
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var Notice = require('common/Notice');

module.exports = Backbone.View.extend({
  tagName: 'li',
  initialize: function (options) {
    this.controller = options.controller;
    this.controls = options.controls
  },
  events: {
    'click': 'update'
  },
  render: function () {
    return this.$el.html('<span class="dashicons dashicons-update"></span> Update');
  },
  update: function () {
    var view = this.controller.getCurrentView();
    Ajax.send({
      action: 'updateModuleViewTemplate',
      _ajax_nonce: Config.getNonce('update'),
      view: view.model.toJSON(),
      tplstring: this.controller.editor.getValue(),
      module: this.controller.moduleModel.toJSON()
    }, this.success, this);
  },
  success: function (res) {
    if (res.success === false) {
      Notice.notice(res.message, 'error',8);
      this.controller.trigger('broadcast', res.message);
    }
    this.controller.trigger('broadcast', res.message);

  }
});
},{"common/Ajax":20,"common/Config":22,"common/Notice":25}],20:[function(require,module,exports){
//KB.Ajax
var Notice = require('common/Notice');
module.exports =
{
  send: function (data, callback, scope, options) {
    var pid;
    var addPayload = options || {};

    if (data.postId) {
      pid = data.postId;
    } else {
      pid = (KB.Environment && KB.Environment.postId) ? KB.Environment.postId : false;
    }

    var sned = _.extend({
      supplemental: data.supplemental || {},
      nonce: jQuery('#_kontentblocks_ajax_nonce').val(),
      post_id: pid,
      postId: pid,
      kbajax: true
    }, data);

    jQuery('#publish').attr('disabled', 'disabled');

    return jQuery.ajax({
      url: ajaxurl,
      data: sned,
      type: 'POST',
      dataType: 'json',
      success: function (data) {
        if (data) {
          if (scope && callback) {
            callback.call(scope, data, addPayload);
          } else if (callback) {
            callback(data, addPayload);
          }
        }
      },
      error: function () {
        // generic error message
        Notice.notice('<p>Generic Ajax Error</p>', 'error');
      },
      complete: function () {
        jQuery('#publish').removeAttr('disabled');
      }
    });
  }
};
},{"common/Notice":25}],21:[function(require,module,exports){
var Config = require('common/Config');
module.exports = {
  blockLimit: function (areamodel) {
    var limit = areamodel.get('limit');
    // todo potentially wrong, yeah it's wrong
    var children = jQuery('#' + areamodel.get('id') + ' li.kb-module').length;
    return !(limit !== 0 && children === limit);


  },
  userCan: function (cap) {

    return true;
    if (cap === '') {
      return true;
    }

    if (_.isString(cap)) {
      cap = [cap];
    }
    var valid = _.filter(cap, function (c) {

      var check = jQuery.inArray(c, Config.get('caps'));
      return check !== -1;
    })
    return valid.length ===  cap.length;

  }
}
},{"common/Config":22}],22:[function(require,module,exports){
var Config = (function ($) {
  var config = KB.appData.config || {};
  return {
    /**
     * General getter
     * Return complete config object if no key is given
     * @param key
     * @returns {*}
     */
    get: function (key) {
      if (!key) {
        return config;
      }
      if (config[key]) {
        return config[key];
      }
      return null;

    },
    /**
     * Shortcut getter to nonces
     * @param mode
     * @returns {*}
     */
    getNonce: function (mode) {
      // possible modes: update, create, delete, read
      var modes = ['update', 'create', 'delete', 'read'];

      if (_.indexOf(modes, mode) !== -1) {
        return config.nonces[mode];
      } else {
        console.error('Invalid nonce requested in kb.cm.Config.js');
        return null;
      }
    },
    isAdmin: function(){
      return !config.frontend;
    },
    inDevMode: function () {
      return config.env.dev;
    },
    getRootURL: function () {
      return config.env.rootUrl;
    },
    getFieldJsUrl: function () {
      return config.env.fieldJsUrl;
    },
    getHash: function () {
      return config.env.hash;
    },
    getLayoutMode: function(){
      return config.layoutMode || 'default-boxes';
    }


  }
})(jQuery);
module.exports = Config;
},{}],23:[function(require,module,exports){
var Utilities = require('common/Utilities');
module.exports = {
  getString: function (path) {
    if (!path || !KB || !KB.i18n) {
      return null;
    }
    return Utilities.getIndex(KB.i18n, path);
  }
};
},{"common/Utilities":30}],24:[function(require,module,exports){
var Config = require('common/Config');
if (Function.prototype.bind && window.console && typeof console.log == "object") {
  [
    "log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"
  ].forEach(function (method) {
      console[method] = this.bind(console[method], console);
    }, Function.prototype.call);
}

Logger.useDefaults();
var _K = Logger.get('_K');
var _KS = Logger.get('_KS'); // status bar only
_K.setLevel(_K.INFO);
_KS.setLevel(_KS.INFO);
if (!Config.inDevMode()) {
  _K.setLevel(Logger.OFF);
}
Logger.setHandler(function (messages, context) {
  // is Menubar exists and log message is of type INFO
  if (KB.Menubar && context.level.value === 2 && context.name === '_KS') {
    if (messages[0]) {
      KB.Menubar.StatusBar.setMsg(messages[0]);
    }
  } else {
    var console = window.console;
    var hdlr = console.log;

    // Prepend the logger's name to the log message for easy identification.
    if (context.name) {
      messages[0] = "[" + context.name + "] " + messages[0];
    }

    // Delegate through to custom warn/error loggers if present on the console.
    if (context.level === Logger.WARN && console.warn) {
      hdlr = console.warn;
    } else if (context.level === Logger.ERROR && console.error) {
      hdlr = console.error;
    } else if (context.level === Logger.INFO && console.info) {
      hdlr = console.info;
    }
    hdlr.apply(console, messages);
  }
});

module.exports = {
  Debug: _K,
  User: _KS
};
},{"common/Config":22}],25:[function(require,module,exports){
'use strict';
//KB.Notice
module.exports =
{
  notice: function (msg, type, delay) {
    var timeout = delay || 3;
    window.alertify.notify(msg, type, timeout);
  },
  confirm: function (title, msg, yes, no, scope) {
    var t = title || 'Title';
    window.alertify.confirm(t, msg, function () {
      yes.call(scope);
    }, function () {
      no.call(scope);
    });
  },
  prompt: function (title, msg, value, yes, no, scope) {
    var t = title || 'Title';
    window.alertify.prompt(t, msg, value, function (evt,value) {
      yes.call(scope, evt,value);
    }, function (evt,value) {
      no.call(scope,evt,value);
    });
  }
};

},{}],26:[function(require,module,exports){
//KB.Payload
module.exports = {
  getFieldData: function (type, moduleId, key, arrayKey) {
    var typeData;
    if (this._typeExists(type)) {
      typeData = KB.payload.fieldData[type];
      // no data for module id
      if (!typeData[moduleId]) {
        return [];
      }

      // arrayKey given
      if (!_.isEmpty(arrayKey)) {

        // arrayKey not present in module data
        if (!typeData[moduleId][arrayKey]) {
          return [];
        }

        // arrayKey present but key is not
        if (!typeData[moduleId][arrayKey][key]) {
          return [];
        }

        // both keys are present
        return typeData[moduleId][arrayKey][key];
      }

      // only key given, but not present
      if (!typeData[moduleId][key]) {
        return []
      }
      // key given and present
      return typeData[moduleId][key];
    }
    return [];
  },
  _typeExists: function (type) {
    return !_.isUndefined(KB.payload.fieldData[type]);
  },
  getFieldArgs: function (id, key) {
    if (KB.payload.Fields && KB.payload.Fields[id]) {
      if (key && KB.payload.Fields[id][key]) {
        return KB.payload.Fields[id][key];
      } else {
        return KB.payload.Fields[id];
      }
    } else {
      return null;
    }
  },
  parseAdditionalJSON: function (json) {
    var ret;

    ret = {
      Fields: []
    };

    if (json && json.Areas) {
      _.each(json.Areas, function (area) {
        KB.ObjectProxy.add(KB.Areas.add(area));
      });
    }

    if (json && json.Fields) {
      ret.Fields = KB.FieldControls.add(_.toArray(json.Fields));
    }

    return ret;
  },
  getPayload: function (key) {
    if (KB && KB.payload) {
      if (KB.payload[key]) {
        return KB.payload[key];
      }
    }
    return {};
  }
};
},{}],27:[function(require,module,exports){
function Stack() {
  this.items = [];
}

Stack.prototype.append = function (item) {
  this.items.push(item);
};

Stack.prototype.prepend = function (item) {
  this.items.unshift(item);
};

Stack.prototype.reset = function () {
  this.items = [];
};

Stack.prototype.length = function () {
  return this.items.length;
};

Stack.prototype.hasItems = function () {
  return (this.items.length > 0);
};

Stack.prototype.first = function () {
  if (this.items.length > 0) {
    return this.items.shift();
  }
  return null;
};

Stack.prototype.last = function () {
  if (this.items.length > 0) {
    return this.items.pop();
  }
  return null;
};

module.exports = Stack;
},{}],28:[function(require,module,exports){
//KB.TinyMCE
var Ajax = require('common/Ajax');
var Logger = require('common/Logger');
var Config = require('common/Config');
module.exports =
{
  removeEditors: function ($parent) {
    // do nothing if it is the native editor
    if (!$parent) {
      $parent = jQuery('body');
    }
    jQuery('.wp-editor-area', $parent).each(function () {
      if (jQuery(this).attr('id') === 'wp-content-wrap' || jQuery(this).attr('id') === 'ghosteditor' || jQuery(this).attr('id') === 'replycontent') {
      } else {
        var textarea = this.id;
        tinyMCE.execCommand('mceRemoveEditor', true, textarea);
      }
    });
  },
  restoreEditors: function ($parent) {
    if (!$parent) {
      $parent = jQuery('body');
    }
    jQuery('.wp-editor-wrap', $parent).each(function () {
      var id = jQuery(this).find('textarea').attr('id');
      var textarea = jQuery(this).find('textarea');

      if (id === 'ghosteditor' || id === 'replycontent') {
        return;
      } else {
        textarea.val(switchEditors.wpautop(textarea.val()));
        tinyMCE.execCommand('mceAddEditor', true, id);
        //tinymce.init(tinyMCEPreInit.mceInit[id]);
        switchEditors.go(id, 'tmce');

      }

    });
  },
  addEditor: function ($el, quicktags, height, watch) {
    // get settings from native WP Editor
    // Editor may not be initialized and is not accessible through
    // the tinymce api, thats why we take the settings from preInit


    if (!$el) {
      Logger.Debug.error('No scope element ($el) provided');
      return false;
    }

    if (_.isUndefined(tinyMCEPreInit)) {
      return false;
    }


    var edHeight = height || 350;
    var live = (_.isUndefined(watch)) ? true : false;
    // if no $el, we assume it's in the last added module

    // find all editors and init
    jQuery('.wp-editor-area', $el).each(function () {
      var id = this.id;
      var prev = window.tinyMCE.get(id);
      if (prev) {
        tinyMCE.execCommand('mceRemoveEditor', null, id);
      }

      var ghostId = (tinyMCEPreInit && tinyMCEPreInit.mceInit && tinyMCEPreInit.mceInit.ghosteditor) ? 'ghosteditor' : 'content';

      var settings = _.clone(tinyMCEPreInit.mceInit[ghostId]);
      // add new editor id to settings
      settings.elements = id;
      settings.selector = '#' + id;
      settings.id = id;
      settings.kblive = live;
      settings.height = edHeight;
      settings.remove_linebreaks = false;
      settings.setup = function (ed) {
        ed.on('init', function () {
          KB.Events.trigger('kb.tinymce.new-editor', ed);
        });
        ed.on('change', function () {
          // var $module, moduleView;
          // if (!ed.module) {
          //   $module = jQuery(ed.editorContainer).closest('.kb-module');
          //   ed.module = KB.Views.Modules.get($module.attr('id'));
          // }
          //
          // if (ed.module) {
          //   ed.module.$el.trigger('tinymce.change');
          // }

        });
      };
      tinymce.init(settings);

      if (!tinyMCEPreInit.mceInit[id]) {
        tinyMCEPreInit.mceInit[id] = settings;
      }

      var qtsettings = {
        'buttons': '',
        'disabled_buttons': '',
        'id': id
      };
      //var qts = jQuery('#qt_' + id + '_toolbar');
      //if (qts.length > 0) {
      window.quicktags(qtsettings);
      //}
    });
    setTimeout(function () {
      jQuery('.wp-editor-wrap', $el).removeClass('html-active').addClass('tmce-active');
      window.QTags._buttonsInit();
    }, 1500);

  },
  remoteGetEditor: function ($el, name, id, content, postId, media, watch) {
    var pid = postId || KB.appData.config.post.ID;
    var id = id || $el.attr('id');
    if (!media) {
      var media = false;
    }
    var editorContent = content || '';
    return Ajax.send({
      action: 'getRemoteEditor',
      editorId: id + '_ed',
      editorName: name,
      post_id: pid,
      postId: pid,
      editorContent: editorContent,
      _ajax_nonce: Config.getNonce('read'),
      args: {
        media_buttons: media
      }
    }, function (response) {
      if (response.success) {
        $el.empty().append(response.data.html);
        this.addEditor($el, null, 250, watch);
      } else {
        Logger.Debug.info('Editor markup could not be retrieved from the server');
      }
    }, this);

  }
};
},{"common/Ajax":20,"common/Config":22,"common/Logger":24}],29:[function(require,module,exports){
/**
 *
 * These is a collection of helper functions to handle
 * the user interface / user interaction such as
 * - Sorting
 * - TinyMCE De-/Initialization
 * - Tabs initialization
 * - UI repainting / updating
 *
 * @package Kontentblocks
 * @subpackage Backend/UI
 * @type @exp; KB
 */
var $ = jQuery;
var Config = require('common/Config');
var Ajax = require('common/Ajax');
var TinyMCE = require('common/TinyMCE');
var Notice = require('common/Notice');
var ContextRowGrid = require('backend/Views/ContextUi/ContextRowGrid');
var Ui = {
  // sorting indication
  isSorting: false,
  // boot up
  init: function () {
    var that = this;
    var $body = $('body');
    // init general ui components
    this.initTabs();
    this.initSortable();
    this.initSortableAreas();
    this.initToggleBoxes();
    this.flexContext();
    this.flushLocalStorage();
    this.initTipsy();

    // set the global activeField variable dynamically
    // legacy
    $body.on('mousedown', '.kb-field', function (e) {
      activeField = this;
    });

    // set the global activeBlock variable dynamically
    // legacy
    $body.on('mousedown', '.kb-module', function (e) {
      activeBlock = this.id;
    });

    // set the current field id as reference
    $body.on('mouseenter', '[data-kbfield]', function () {
      KB.currentFieldId = this.id;
    });

    $body.on('mouseenter', '.kb-area__list-item li', function () {
      KB.currentModuleId = this.id;
    });

    // Bind AjaxComplete, restoring TinyMCE after global MEtaBox reordering
    jQuery(document).ajaxComplete(function (e, o, settings) {
      that.metaBoxReorder(e, o, settings, 'restore');
    });

    // Bind AjaxSend to remove TinyMCE before global MetaBox reordering
    jQuery(document).ajaxSend(function (e, o, settings) {
      that.metaBoxReorder(e, o, settings, 'remove');
    });
  },

  flexContext: function () {
    jQuery('.kb-context-row').each(function (index, el) {
      var $el = jQuery(el);
      $el.data('KB.ContextRow', new ContextRowGrid({
        el: el
      }));
    });
  },
  repaint: function ($el) {
    this.initTabs($el);
    this.initToggleBoxes();
    TinyMCE.addEditor($el);
  },
  initTabs: function ($cntxt) {
    var $context = $cntxt || jQuery('body');
    var selector = $('.kb-field--tabs', $context);
    var $window = $(window);


    selector.tabs({
      // beforeActivate: function (event, ui) {
      //   console.log(ui);
      //
      //   window.location.hash = ui.newPanel.selector;
      // },
      activate: function (e, ui) {
        _.defer(function () {
          $('.kb-nano').nanoScroller({contentClass: 'kb-nano-content'});
          KB.Events.trigger('modal.recalibrate');
        });
      }
    });
    selector.each(function () {
      // hide tab navigation if only one tab exists
      var length = $('.ui-tabs-nav li', $(this)).length;
      if (length === 1) {
        $(this).find('.ui-tabs-nav').css('display', 'none');
      }

      // $window.on('hashchange', function () {
      //   if (!location.hash) {
      //     selector.tabs('option', 'active', 0);
      //     return;
      //   }
      //   $('ul > li > a', selector).each(function (index,a) {
      //     if ($(a).attr('href') === location.hash){
      //       selector.tabs('option', 'active', index);
      //     }
      //   })
      // })

    });


    var $subtabs = $('[data-kbfsubtabs]', $context).tabs({
      activate: function () {
        KB.Events.trigger('modal.recalibrate');
      }
    });


  },
  initToggleBoxes: function () {
    $('.kb-togglebox-header').on('click', function () {
      $(this).next('div').slideToggle();
    });

    $('.kb_fieldtoggles div:first-child').trigger('click');
  },
  initSortable: function ($cntxt) {
    var $context = $cntxt || jQuery('body');
    var currentModule, areaOver, prevAreaOver;
    var validModule = false;

    var that = this;

    /*
     * Test if the current sorted module
     * is allowed in (potentially) new area
     * Checks if either the module limit of the area
     * has been reached or if the current module
     * type is not in the array of assigned modules
     * of the area
     */
    function isValidModule() {
      var limit = areaOver.get('limit');
      var nom = numberOfModulesInArea(areaOver.get('id'));

      if (
        _.indexOf(areaOver.get(
          'assignedModules'), currentModule.get('settings').class) === -1) {
        return false;
      } else if (limit !== 0 && limit <= nom - 1) {
        Notice.notice(
          'Not allowed here', 'error');
        return false;
      } else {
        return true;
      }
    }

    /**
     *
     Get an
     array of modules by area id
     * @param
      id string
     *
     @returns array of all found modules in that area
     */
    function filterModulesByArea(id) {
      return _.filter(KB.Modules.models, function (model) {
          return model.get('area') === id;
        }
      );
    }

    function numberOfModulesInArea(id) {
      return $('#' + id + ' li.kb-module').length;
    }


    var appendTo = 'parent';
    if (Config.getLayoutMode() === 'default-tabs') {
      appendTo = '#kb-contexts-tabs';
    }


    // handles sorting of the blocks.
    $('.kb-module-ui__sortable', $context).sortable({
      //settings
      placeholder: "ui-state-highlight",
      ghost: true,
      connectWith: ".kb-module-ui__sortable--connect",
      helper: 'clone',
      handle: '.kb-move',
      cancel: 'li.disabled, li.cantsort',
      tolerance: 'pointer',
      delay: 150,
      revert: 350,
      appendTo: appendTo,
      // start event
      start: function (event, ui) {

        // set current model
        that.isSorting = true;
        $('body').addClass('kb-is-sorting');
        currentModule = KB.Modules.get(ui.item.attr('id'));
        areaOver = KB.currentArea;
        $(KB).trigger('kb:sortable::start');

        // close open modules, sorting on open container
        // doesn't work very well
        $('.kb-open').toggleClass('kb-open');
        $('.kb-module__body').hide();
        // tinyMCE doesn't like to be moved in the DOM
        if (areaOver.View && areaOver.View.$el){
          TinyMCE.removeEditors(areaOver.View.$el);
        } else {
          TinyMCE.removeEditors();
        }

        // Add a global trigger to sortable.start, maybe other Blocks might need it
        $(document).trigger('kb_sortable_start', [event, ui]);
      },
      stop: function (event, ui) {
        that.isSorting = false;
        $('body').removeClass('kb-is-sorting');

        // restore TinyMCE editors
        TinyMCE.restoreEditors();

        // global trigger when sortable is done
        $(document).trigger('kb_sortable_stop', [event, ui]);
        if (currentModule.get('open')) {
          currentModule.View.toggleBody(155);
        }
      },
      over: function (event, ui) {
        // keep track of target area
        areaOver = KB.Areas.get(this.id);
      },
      receive: function (event, ui) {
        if (!isValidModule()) {
          // inform the user
          Notice.notice('Module not allowed in this area', 'error');
          // cancel sorting
          $(ui.sender).sortable('cancel');
        }
      },
      update: function (ev, ui) {
        if (!isValidModule()) {
          return false;
        }

        // update will fire twice when modules are
        // moved between two areas, once for each list
        // this makes sure that the right action(s) are only done once
        if (this === ui.item.parent('ul')[0] && !ui.sender) {
          // function call applies when target area == origin
          $.when(that.resort(ui.sender)).done(function (res) {
            if (res.success) {
              $(KB).trigger('kb:sortable::update');
              Notice.notice(res.message, 'success');
            } else {
              Notice.notice(res.message, 'error');
              return false;
            }
          });
        } else if (ui.sender) {
          // do nothing if the receiver rejected the request
          if (ui.item.parent('ul')[0].id === ui.sender.attr('id')) {
            return false;
          }
          // function call applies when target area != origin
          // chain reordering and change of area
          $.when(that.changeArea(areaOver, currentModule)).then(function (res) {
            if (res.success) {
              that.resort(ui.sender);
            } else {
              return false;
            }
          }).done(function () {
            that.triggerAreaChange(areaOver, currentModule);
            $(KB).trigger('kb:sortable::update');
            // force recreation of any attached fields
            currentModule.View.clearFields();

            Notice.notice('Area change and order were updated successfully', 'success');

          });
        }
      }
    });
  },
  flushLocalStorage: function () {
    var hash = Config.get('env').hash;
    if (store.get('kbhash') !== hash) {
      store.set('kbhash', hash)
    }
  },
  /**
   * Handles saving of new module order per area
   * @param sender jQueryUI sortable sender list
   * @returns {jqXHR}
   */
  resort: function (sender) {
    // serialize data
    var serializedData = {};
    $('.kb-module-ui__sortable').each(function () {
      serializedData[this.id] = $('#' + this.id).sortable('serialize', {
        attribute: 'rel'
      });
    });

    return Ajax.send({
      action: 'resortModules',
      data: serializedData,
      _ajax_nonce: Config.getNonce('update')
    });
  },
  /**
   *
   * @param object targetArea
   * @param object module
   * @returns {jqXHR}
   */
  changeArea: function (targetArea, module) {
    return Ajax.send({
      action: 'changeArea',
      _ajax_nonce: Config.getNonce('update'),
      mid: module.get('mid'),
      area_id: targetArea.get('id'),
      context: targetArea.get('context')
    });
  },
  triggerAreaChange: function (newArea, moduleModel) {
    moduleModel.unsubscribeFromArea(); // remove from current area
    moduleModel.setArea(newArea);
  },
  toggleModule: function () {
    $('body').on('click', '.kb-toggle', function () {
      if (KB.isLocked() && !KB.userCan('lock_kontentblocks')) {
        Notice.notice(kontentblocks.l18n.gen_no_permission, 'alert');
      }
      else {
        $(this).parent().nextAll('.kb-module__body:first').slideToggle('fast', function () {
          $('body').trigger('module::opened');
        });
        $('#' + activeBlock).toggleClass('kb-open', 1000);
      }
    });
  },
  initSortableAreas: function () {
    jQuery('.kb-context__inner').sortable({
      items: '.kb-area__wrap',
      handle: '.kb-area-move-handle',
      start: function (e, ui) {
        TinyMCE.removeEditors();
      },
      stop: function (e, ui) {
        var serData = jQuery('#post').serializeJSON();
        var data = serData.kbcontext;

        if (data) {
          Ajax.send({
            action: 'updateContextAreaOrder',
            _ajax_nonce: Config.getNonce('update'),
            data: data
          }, function (res) {
            if (res.success) {
              Notice.notice(res.message, 'success');
            } else {
              Notice.notice(res.message, 'error');
            }
            TinyMCE.restoreEditors();
          }, this);
        }
      }
    });
  },
  initTipsy: function () {

    jQuery('body').on('mouseenter', '[data-kbtooltip]', function (e) {
      jQuery(this).qtip({
        content: {
          attr: 'data-kbtooltip' // Tell qTip2 to look inside this attr for its content
        },
        style: 'qtip-dark qtip-shadow',
        show: {

          event: e.type, // Show on mouse over by default
          effect: true, // Use default 90ms fade effect
          delay: 180, // 90ms delay before showing
          solo: true, // Do not hide others when showing
          ready: true // Do not show immediately
        }
      });
    });


  },
  metaBoxReorder: function (e, o, settings, action) {
    if (settings.data) {
      var a = settings.data;

      if (a && a.split) {
        var b = a.split('&');
        var result = {};
        $.each(b, function (x, y) {
          var temp = y.split('=');
          result[temp[0]] = temp[1];
        });

        if (result.action === 'meta-box-order') {
          if (action === 'restore') {
            TinyMCE.restoreEditors();
          }
          else if (action === 'remove') {
            TinyMCE.removeEditors();
          }
        }
      }
    }
  }
};
module.exports = Ui;
},{"backend/Views/ContextUi/ContextRowGrid":3,"common/Ajax":20,"common/Config":22,"common/Notice":25,"common/TinyMCE":28}],30:[function(require,module,exports){
var Utilities = function ($) {
  return {
    // store with expiration
    stex: {
      set: function (key, val, exp) {
        store.set(key, {val: val, exp: exp, time: new Date().getTime()})
      },
      get: function (key) {
        var info = store.get(key)
        if (!info) {
          return null
        }
        if (new Date().getTime() - info.time > info.exp) {
          return null
        }
        return info.val
      }
    },
    store: {
      set: function(key,val){
          store.set(key,val);
        },
      get: function(key){
          return store.get(key);
      }
    },
    setIndex: function (obj, is, value) {
      if (!_.isObject(obj)){
        obj = {};
      }

      if (typeof is == 'string'){
        return this.setIndex(obj, is.split('.'), value);
      }
      else if (is.length == 1 && value !== undefined){
        return obj[is[0]] = value;
      }
      else if (is.length == 0){
        return obj;
      }
      else{
        return this.setIndex(obj[is[0]], is.slice(1), value);
      }
    },
    getIndex: function (obj, s) {
      s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
      s = s.replace(/^\./, '');           // strip a leading dot
      var a = s.split('.');
      while (a.length) {
        var n = a.shift();
        if (_.isObject(obj) && n in obj) {
          obj = obj[n];
        } else {
          return {};
        }
      }
      return obj;
    },
    hashString : function(str) {
    var hash = 0, i, chr, len;
    if (str == 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  },
    // deprecated in favor of kpath
    //cleanArray: function (actual) {
    //  var newArray = new Array();
    //  for (var i = 0; i < actual.length; i++) {
    //
    //    if (!_.isUndefined(actual[i]) && !_.isEmpty(actual[i])) {
    //      newArray.push(actual[i]);
    //    }
    //  }
    //  return newArray;
    //},
    sleep: function (milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
          break;
        }
      }
    }
  }

}(jQuery);
module.exports = Utilities;
},{}],31:[function(require,module,exports){
//KB.Fields.BaseView
module.exports = Backbone.View.extend({
  rerender: function(){
    this.render();
  },
  gone: function () {
    this.trigger('field.view.gone', this);
    // this.derender();
  },
  toString: function(){
    return '';
  }
});

},{}],32:[function(require,module,exports){
var Checks = require('common/Checks');
var Utilities = require('common/Utilities');
var Payload = require('common/Payload');
var Config = require('common/Config');
var Logger = require('common/Logger');
module.exports = Backbone.Model.extend({
  // idAttribute: "uid",
  initialize: function () {
    this.cleanUp(); //remove self from linked fields
    var module = this.get('relId'); // fieldId equals baseId equals the parent object id (Panel or Module)
    if (module && (this.ModuleModel = KB.ObjectProxy.get(module)) && this.getType()) { // if object exists and this field type is valid
      this.set('ModuleModel', this.ModuleModel); // assign the parent object model
      this.setData(); // get data from the parent object and assign to this
      this.bindHandlers(); // attach listeners
      this.setupType(); // create the field view
      this.ModuleModel.attachField(this);
    }
  },
  /*
   remove self from linked fields
   */
  cleanUp: function () {
    var links = this.get('linkedFields') || {};
    if (links.hasOwnProperty(this.get('uid'))) {
      delete links[this.get('uid')];
    }
  },
  bindHandlers: function () {
    this.listenTo(this, 'field.model.settings', this.updateLinkedFields);
    this.listenTo(this.ModuleModel, 'remove', this.remove); // delete this from collection when parent obj leaves
    this.listenTo(this.ModuleModel, 'change:entityData', this.setData); // reassign data when parent obj data changes
    this.listenTo(this.ModuleModel, 'module.model.updated', this.getClean); // set state to clean
    this.listenTo(this, 'change:value', this.upstreamData); // assign new data to parent obj when this data changes
    this.listenTo(this.ModuleModel, 'modal.serialize.before', this.unbind); // before the frontend modal reloads the parent obj
    this.listenTo(this.ModuleModel, 'modal.serialize', this.rebind); // frontend modal reloaded parent obj, reattach handlers
    this.listenTo(this.ModuleModel, 'change:area', this.unbind); // parent obj was dragged to new area, detach handlers
    this.listenTo(this.ModuleModel, 'change:viewfile', this.unbind); // parent obj was dragged to new area, detach handlers
    this.listenTo(this.ModuleModel, 'after.change.area', this.rebind); // parent obj was dragged to new area, reattach handlers
  },
  setupType: function () {
    var view;
    if (view = this.getType()) { // obj equals specific field view
      this.FieldControlView = new view({ // create new field view
        el: this.getElement(), // get the root DOM element for this field
        model: this
      });
    }
  },
  updateLinkedFields: function (fieldSettings) {
    var that = this;
    if (fieldSettings.linkedFields) {
      this.set('linkedFields', fieldSettings.linkedFields);
      this.cleanUp();
      this.unbind();
      _.defer(function () {
        that.rebind();
      })
    }
  },
  getElement: function () {
    return jQuery('*[data-kbfuid="' + this.get('uid') + '"]')[0]; // root DOM element by data attribute
  },
  getType: function () {
    var type = this.get('type'); // link, image, etc
    if (!Checks.userCan('edit_kontentblocks')) {
      return false;
    }

    // get the view object from KB.Fields collection
    var control = KB.Fields.get(type);
    if (control && control.prototype.hasOwnProperty('initialize')) {
      return control;
    } else {
      return false;
    }
  },
  getClean: function () {
    this.trigger('field.model.clean', this);
  },
  setData: function (Model) {
    var ModuleModel, fieldData, typeData, obj, addData = {}, mData;
    ModuleModel = Model || this.get('ModuleModel');
    fieldData = Payload.getPayload('fieldData');

    // special field data may come from the server
    if (fieldData[this.get('type')]) {
      typeData = fieldData[this.get('type')];
      if (typeData[this.get('fieldId')]) {
        obj = typeData[this.get('fieldId')];
        addData = Utilities.getIndex(obj, this.get('kpath'));
      }
    }
    // the parent obj data
    mData = _.clone(Utilities.getIndex(ModuleModel.get('entityData'), this.get('kpath')));
    this.set('value', _.extend(mData, addData)); // set merged data to this.value

  },
  // since this data is only the data of a specific field we can upstream this data to the whole module data
  upstreamData: function () {
    var ModuleModel;
    if (ModuleModel = this.get('ModuleModel')) {
      var cdata = _.clone(this.get('ModuleModel').get('entityData'));
      Utilities.setIndex(cdata, this.get('kpath'), this.get('value'));
      ModuleModel.set('entityData', cdata, {silent: false});
      // ModuleModel.View.getDirty();
    }
  },
  /**
   * A linked field was updated
   * @param model
   */
  externalUpdate: function (model) {
    this.FieldControlView.synchronize(model);
  },
  remove: function () {
    this.stopListening();
    KB.FieldControls.remove(this);
  },
  rebind: function () {
    var that = this;
    _.defer(function () {
      if (_.isUndefined(that.getElement())) {
        _.defer(_.bind(that.FieldControlView.gone, that.FieldControlView));
      } else if (that.FieldControlView) {
        that.FieldControlView.setElement(that.getElement()); // markup might have changed, reset the root element
        _.defer(_.bind(that.FieldControlView.rerender, that.FieldControlView)); // call rerender on the field
      }
    }, true);
  },
  unbind: function () {
    if (this.FieldControlView && this.FieldControlView.derender) {
      this.FieldControlView.derender(); // call derender
    }
  },
  sync: function (context) {
    var that = this;
    KB.Events.trigger('field.before.sync', this.model);

    var clone = that.toJSON();
    var type = clone.ModuleModel.type;
    var module = clone.ModuleModel.toJSON();

    delete clone['ModuleModel'];
    delete clone['linkedFields'];
    return jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'updateFieldModel',
        data: that.get('value'),
        field: clone,
        module: module,
        type: type,
        _ajax_nonce: Config.getNonce('update')
      },
      context: (context) ? context : that,
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        that.trigger('field.model.updated', that);
      },
      error: function () {
        Logger.Debug.error('serialize | FrontendModal | Ajax error');
      }
    });
  },
  getEntityModel: function () {
    if (this.ModuleModel) {
      return this.ModuleModel;
    }
    return false;
  }
});
},{"common/Checks":21,"common/Config":22,"common/Logger":24,"common/Payload":26,"common/Utilities":30}],33:[function(require,module,exports){
//KB.Backbone.Common.FieldControlModelModal
var FieldControlModel = require('./FieldControlModel');
module.exports = FieldControlModel.extend({
  bindHandlers: function () {
    this.listenToOnce(this.ModuleModel, 'remove', this.remove);
    this.listenTo(this.ModuleModel, 'change:entityData', this.setData);
    this.listenTo(KB.Events, 'modal.reload', this.rebind);
    this.listenTo(KB.Events, 'modal.close', this.remove);
  },
  rebind: function () {
    if (this.FieldControlView) {
      this.FieldControlView.setElement(this.getElement());
      this.FieldControlView.rerender();
    }
  },
  getElement: function () {
    return jQuery('*[data-kbfuid="' + this.get('uid') + '"]');
  }
});
},{"./FieldControlModel":32}],34:[function(require,module,exports){
//KB.Backbone.Common.FieldConfigsCollection
var FieldControlModel = require('./FieldControlModel');
module.exports = Backbone.Collection.extend({
  initialize: function () {
    this._byModule = {};
    this._byArea = {};
    this._linkedFields = [];
    this.listenTo(this, 'add', this.addToModules);
    this.listenTo(this, 'add', this.bindLinkedFields);
  },
  model: FieldControlModel,
  addToModules: function (model) {
    if (model.ModuleModel) {
      var cid = model.ModuleModel.id;
      if (!this._byModule[cid]) {
        this._byModule[cid] = {};
      }

      if (model.ModuleModel.Area){
        var areaid = model.ModuleModel.Area.id;
        if (!this._byArea[areaid]){
          this._byArea[areaid] = {};
        }
        this._byArea[areaid][model.id] = model;
      }
      this._byModule[cid][model.id] = model;
    }
  },
  getFieldsforModule: function (id) {
    if (this._byModule[id]) {
      return this._byModule[id];
    }
    return {};
  },
  bindLinkedFields: function(model){
    var lf = model.get('linkedFields');
    _.each(lf, function(val, fid){
      if (_.isNull(val)){
        var xModel = this.get(fid);
        if (xModel){
          lf[fid] = xModel;
          model.listenTo(xModel, 'external.change', model.externalUpdate);
          this.bindLinkedFields(xModel);
        }
      }
    },this);

  },
  updateModels: function (data) {
    if (data) {
      _.each(data, function (field) {
        var model = this.get(field.uid);
        if (model) {
          model.trigger('field.model.settings', field);
        } else {
          this.add(field);
        }
      }, this);
    }
  }
});
},{"./FieldControlModel":32}],35:[function(require,module,exports){
/**
 * Registry for field controls
 * @type {{}}
 */
var Fields = {};
var Logger = require('common/Logger');
// include Backbone events handler
_.extend(Fields, Backbone.Events);
// include custom functions
_.extend(Fields, {
  fields: {}, // 'collection' of fields
  /**
   * Register a fieldtype
   * @param id string name of field
   * @param object field object
   */
  registerObject: function (id, object) {
    _.extend(object, Backbone.Events);
    this.fields[id] = object;
  },
  /**
   * Get method
   * @param id string fieldtype
   * @returns mixed field object or null
   */
  get: function (id) {
    if (this.fields[id]) {
      return this.fields[id];
    } else {
      return null;
    }
  }
});
module.exports = Fields;
},{"common/Logger":24}],36:[function(require,module,exports){
module.exports = Backbone.View.extend({
  type: '',
  render: function () {

    this.setupElements();
    this.bindHandlers();
    this.initialSetup();
  },
  initialSetup: function () {
    var data = this.setupData();
    if (!_.isArray(data)) {
      this.createElement();
    } else {
      _.each(data, function (val, i) {
        var limit = this.model.get('limit');
        if (limit && (i + 1) <= limit) {
          this.createElement(val);
        } else {
          this.createElement(val);
        }
      }, this);
      this.handleLimit();
    }
  },
  setupData: function () {
    return this.model.get('value');
  },
  createElement: function (value) {
    var val = value || '';
    var that = this;
    var itemData = _.extend(this.model.toJSON(), {
      value: val,
      uniqueId: _.uniqueId('mdate'),
      arrayKey: this.model.get('arrayKey'),
      fieldkey: this.model.get('fieldkey'),
      primeKey: this.model.get('fieldkey'),
      fieldId: this.model.get('fieldId'),
      type: this.type
    });
    var view = KB.FieldsAPI.getRefByType(this.type, itemData);
    this.$list.append(view.render());
    _.defer(function () {
      if (view.postRender) {
        view.postRender.call(view);
      }
    });
    view.$el.on('click', '[data-kbfaction="delete"]', function () {
      view.$el.off();
      view.remove();
      that.handleLimit();
      that.handleEmptyList();
    });
    this.handleLimit();

  },
  setupElements: function () {
    this.$list = this.$('[data-kfel="list"]');
    this.$button = this.$('[data-kfui="add-entry"]');
    this.$list.sortable();
  },
  bindHandlers: function () {
    var that = this;
    this.$button.on('click', function () {
      that.createElement();
    });
  },
  handleLimit: function () {
    var limit = this.model.get('limit');
    if (limit) {
      var items = jQuery('.kb-field--' + this.type + '-item', this.$list).length;
      if (items >= limit) {
        this.$button.hide();
      } else {
        this.$button.show();
      }
    }
  },
  handleEmptyList: function () {
    var items = jQuery('.kb-field--' + this.type + '-item', this.$list).length;
    if (items === 0) {
      this.createElement('');
    }
  }
});
},{}],37:[function(require,module,exports){
var Fields = require('./Fields');
window.KB.Fields = Fields;
Fields.registerObject('color', require('./controls/color'));
Fields.registerObject('datetime', require('./controls/datetime'));
Fields.registerObject('file', require('./controls/file'));
Fields.registerObject('file-multiple', require('./controls/file-multiple'));
Fields.registerObject('flexfields', require('./controls/flexfields'));
Fields.registerObject('gallery', require('./controls/gallery'));
Fields.registerObject('gallery2', require('./controls/gallery2'));
Fields.registerObject('image', require('./controls/image'));
Fields.registerObject('cropimage', require('./controls/cropimage'));
Fields.registerObject('link', require('./controls/link'));
Fields.registerObject('textarea', require('./controls/textarea'));
Fields.registerObject('code', require('./controls/code'));
Fields.registerObject('text', require('./controls/text'));
Fields.registerObject('checkbox', require('./controls/checkbox'));
Fields.registerObject('text-multiple', require('./controls/text-multiple'));
Fields.registerObject('multitext', require('./controls/text-multiple'));
Fields.registerObject('date-multiple', require('./controls/date-multiple'));
Fields.registerObject('tagsinput', require('./controls/tagsinput'));
Fields.registerObject('multiselect', require('./controls/multiselect'));
Fields.registerObject('select', require('./controls/select'));
Fields.registerObject('editor', require('./controls/editor'));
Fields.registerObject('otimes', require('./controls/otimes'));
Fields.registerObject('oembed', require('./controls/oembed'));
Fields.registerObject('subarea', require('./controls/subarea'));
Fields.registerObject('medium', require('./controls/medium'));
Fields.registerObject('imageselect', require('./controls/imageselect'));
Fields.registerObject('osm', require('./controls/osm'));
},{"./Fields":35,"./controls/checkbox":38,"./controls/code":39,"./controls/color":40,"./controls/cropimage":41,"./controls/date-multiple":42,"./controls/datetime":44,"./controls/editor":45,"./controls/file":48,"./controls/file-multiple":46,"./controls/flexfields":49,"./controls/gallery":55,"./controls/gallery2":58,"./controls/image":61,"./controls/imageselect":62,"./controls/link":63,"./controls/medium":64,"./controls/multiselect":65,"./controls/oembed":66,"./controls/osm":67,"./controls/otimes":68,"./controls/select":69,"./controls/subarea":70,"./controls/tagsinput":77,"./controls/text":80,"./controls/text-multiple":78,"./controls/textarea":81}],38:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    this.$input = this.$('.kb-field--checkbox input');
    this.$input.on('change', function(){
      that.update(that.$input.prop('checked'));
    })
  },
  derender: function () {
    this.$input.off();
  },
  update: function (val) {
    this.model.set('value', val);
  },
  toString: function(){
    return this.$input.val();
  }
});
},{"../FieldControlBaseView":31}],39:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.defaults = {
      mode: 'htmlmixed',
      theme: 'dracula',
      lineNumbers: true,
      lineWrapping: true,
      tabMode: "indent",
      indentUnit: 4,
      autoCloseBrackets: true,
      autoCloseTags: true
    };
    this.settings = this.model.get('settings') || {};
    this.render();
  },
  render: function () {
    var that = this;
    this.$textarea = this.$('textarea');
    // this.$textarea.on('change', function () {
    //   that.update(that.$textarea.val());
    // });
    this.editor = this.getEditor();
    this.editor.on('change',function(editor) {
      editor.save();
      that.update(editor.getTextArea().value);
    });
  },
  derender: function () {
    if (this.editor){
      this.editor.save();
      this.editor.toTextArea();
    }
    this.editor = null;
    delete this.editor;


  },
  getEditor: function(){

    if (this.editor){
      return this.editor;
    }

    var settings = _.extend(this.defaults, this.settings);
    this.editor = CodeMirror.fromTextArea(this.$textarea.get(0), settings);
    return this.editor;
  },
  update: function (val) {
    this.model.set('value', val);
  },
  toString: function () {
    if (this.editor){
      var txt = this.editor.getTextArea().value;
      return txt;
    }
    return this.$textarea.val();
  }
});
},{"../FieldControlBaseView":31}],40:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  events: {
    'mouseup .kb-field--color': 'recalibrate'
  },
  render: function () {
    this.$(".kb-color-picker").wpColorPicker({});
    jQuery('body').on('click.wpcolorpicker', this.update);
  },
  derender: function () {
    jQuery('body').off('click.wpcolorpicker', this.update);
  },
  update: function () {
    //KB.Events.trigger('modal.preview');
  },
  recalibrate: function () {
    _.delay(function () {
      KB.Events.trigger('modal.recalibrate')
    }, 150);
  }
});
},{"../FieldControlBaseView":31}],41:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
var Utilities = require('common/Utilities');
var Config = require('common/Config');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  events: {
    'click .kb-js-add-image': 'openFrame',
    'click .kb-js-reset-image': 'resetImage',
  },
  render: function () {
    this.$reset = this.$('.kb-js-reset-image');
    this.$container = this.$('.kb-field-image-container');
    this.$saveId = this.$('.kb-js-image-id');
    this.$description = this.$('.kb-js-image-description');
    this.$title = this.$('.kb-js-image-title');
  },
  editImage: function () {
    this.openFrame(true);
  },
  derender: function () {
    if (this.frame) {
      this.frame.dispose();
    }
  },
  openFrame: function (editmode) {
    var that = this, metadata, frameoptions;
    if (this.frame) {
      this.frame.dispose();
    }

    // we only want to query "our" image attachment
    // value of post__in must be an array

    var queryargs = {};


    if (this.model.get('value').id !== '') {
      queryargs.post__in = [this.model.get('value').id];
    }

    wp.media.query(queryargs) // set the query
      .more() // execute the query, this will return an deferred object
      .done(function () { // attach callback, executes after the ajax call succeeded
        // inside the callback 'this' refers to the result collection
        // there should be only one model, assign it to a var
        var attachment = this.first();
        that.attachment = attachment;
        // this is a bit odd: if you want to access the 'sizes' in the modal
        // and if you need access to the image editor / replace image function

        // attachment_id must be set.
        // see media-models.js, Line ~370 / PostImage
        if (attachment) {
          attachment.set('attachment_id', attachment.get('id'));
          metadata = that.attachment.toJSON();
        } else {
          metadata = {};
        }

        frameoptions = {
          cropOptions: {
            maxWidth: that.model.get('width') || 300, //target width
            maxHeight: that.model.get('height') || 300 // target height
          },
          croppedCallback: that.handleAttachment,
          parentController: that,
          library: {
            type: 'image',
            cache: false
          }
        };

        if (that.model.get('uploadedTo') === true) {
          frameoptions.library.uploadedTo = KB.Environment.postId || 0
        }

        that.frame = new wp.media.view.KBCropperFrame(frameoptions).on('update', function (attachmentObj) { // bind callback to 'update'
            that.update(attachmentObj);
          })
          .on('close', function (att) {
            if (that.frame.image && that.frame.image.attachment) {
              that.$description.val(that.frame.image.attachment.get('caption'));
              that.$title.val(that.frame.image.attachment.get('title'));
            }
          })
          .on('ready', function () {
            that.ready();
          }).on('replace', function () {
            //console.log('replace');
            //that.replace(that.frame.image.attachment);
          }).on('select', function (what) {
            //console.log('select', what);
            //var attachment = this.get('library').get('selection').first();
            //console.log(attachment);
            //that.replace(attachment);
          })
          .on('cropped', function(croppedImage){
          })
          .open();


        // create a frame, bind 'update' callback and open in one step
      });
  },

  ready: function () {
    jQuery('.media-modal').addClass('smaller kb-image-frame');
  },
  replace: function (attachment) {
    this.attachment = attachment;
    this.handleAttachment(attachment);
  },
  update: function (attachmentObj) {
    this.attachment.set(attachmentObj);
    this.attachment.sync('update', this.attachment);
    //if(this.$caption.length > 0){
    //  this.$caption.html(this.attachment.get('caption'));
    //}
  },
  prepareArgs: function () {
    var that = this;
    return {
      width: that.model.get('previewWidth') || null,
      height: that.model.get('previewHeight') || null,
      crop: true,
      upscale: that.model.get('upscale') || false
    };
  },
  handleAttachment: function (attachment) {
    var that = this;
    var id = attachment.get('id');
    var value = this.prepareValue(attachment);
    var entityData = _.clone(this.model.get('ModuleModel').get('entityData'));
    var path = this.model.get('kpath');
    Utilities.setIndex(entityData, path, value);
    this.model.get('ModuleModel').set('entityData', entityData);


    var preW = this.model.get('previewWidth');
    var preH = this.model.get('previewHeight');

    if (preW && preH) {
      var args = that.prepareArgs();
      that.retrieveImage(args, id);
    } else {
      var url = attachment.get('sizes').full.url;
      that.$container.html('<img src="' + url + ' " >');
    }

    this.$saveId.val(attachment.get('id'));
    this.$description.val(attachment.get('caption'));
    this.$title.val(attachment.get('title'));
    //KB.Events.trigger('modal.preview');
    this.model.get('ModuleModel').trigger('data.updated', {silent: true});
  },
  retrieveImage: function (args, id) {
    var that = this;
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'fieldGetImage',
        args: args,
        id: id,
        _ajax_nonce: Config.getNonce('read')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        that.$container.html('<img src="' + res.data.src + '" >');
      },
      error: function () {

      }
    });
  },
  prepareValue: function (attachment) {
    var newValue = {
      id: attachment.get('id'),
      title: attachment.get('title'),
      caption: attachment.get('caption'),
      alt: attachment.get('alt')
    };

    var oldValue = this.model.get('value');

    return _.defaults(oldValue, newValue);
  },
  resetImage: function () {
    this.$container.html('');
    this.$saveId.val('');
    this.model.set('value', {id: null, caption: '', title: ''});
    this.$description.val('');
    this.$title.val('');
  },
  toString: function () {
    if (this.attachment) {
      var size = (this.attachment.get('sizes').thumbnail) ? this.attachment.get('sizes').thumbnail : this.attachment.get('sizes').full;
      return "<img src='" + size.url + "'>";
    }
    return '';

  }
});
},{"../FieldControlBaseView":31,"common/Config":22,"common/Utilities":30}],42:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
var DateMultipleController = require('fields/controls/date-multiple/DateMultipleController');
module.exports = BaseView.extend({
  initialize: function () {
    this.createController();
    this.render();
  },
  render: function () {
    var that = this;
    this.$stage = this.$('[data-kftype="date-multiple"]');
    this.DateMultipleController.setElement(this.$stage.get(0)); // root element equals stage element
    _.defer(function(){
      that.DateMultipleController.render();
    });
  },
  derender: function () {
    this.FlexFieldsController.derender();
  },
  rerender: function () {
    this.render();
  },
  createController: function () {
    if (!this.DateMultipleController) {
      return this.DateMultipleController = new DateMultipleController({
        el: this.$('[data-kftype="date-multiple"]'),
        model: this.model,
        parentView: this
      })
    }
  }
});
},{"../FieldControlBaseView":31,"fields/controls/date-multiple/DateMultipleController":43}],43:[function(require,module,exports){
var BaseController = require('fields/MultipleControllerBase');
module.exports = BaseController.extend({
  type: 'date-multiple',
  setupData: function () {
    var data = this.model.get('value');
    data.sort(function (a, b) {
      return (a.unix < b.unix) ? -1 : 1
    });
    return data;
  }
});
},{"fields/MultipleControllerBase":36}],44:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    var that = this;
    this.defaults = {
      format: 'd.m.Y H:i',
      inline: false,
      mask: true,
      lang: 'de',
      allowBlank: true,
      onChangeDateTime: function (current, $input) {
        that.$unixIn.val(current.dateFormat('unixtime'));
        that.$sqlIn.val(current.dateFormat('Y-m-d H:i:s'));
      }
    };
    this.settings = this.model.get('settings') || {};
    this.render();
  },
  render: function () {
    this.$unixIn = this.$('.kb-datetimepicker--js-unix');
    this.$sqlIn = this.$('.kb-datetimepicker--js-sql');
    this.$('.kb-datetimepicker').kbdatetimepicker(_.extend(this.defaults, this.settings));
  },
  derender: function () {
    this.$('.kb-datetimepicker').kbdatetimepicker('destroy');
  }
});
},{"../FieldControlBaseView":31}],45:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
var TinyMCE = require('common/TinyMCE');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    var settings = this.model.toJSON();
    this.$textarea = this.$('textarea');
    tinymce.on('AddEditor', function (event) {
      var editor = event.editor;
      if (editor && editor.id === that.$textarea.attr('id') && !that.editor) {
        that.editor = editor;
        editor.on('change', function () {
          that.update(editor.getContent());
        });

        if (settings.settings && settings.settings.charlimit) {
          var limit = settings.settings.charlimit;
          var $charlimit = that.$('.char-limit');
          editor.on('keyDown SetContent', function (ed, e) {
            var content = this.getContent({format: 'text'});
            var max = limit;
            var len = content.length;
            var rest = len - max;
            if (len >= max) {
              $charlimit.html('<span class="text-error" style="color: red;">Zu viele Zeichen:-' + rest +'</span>');
            } else {
              var charCount = max - len;
              $charlimit.html(charCount + ' Zeichen verbleiben');
            }
          })
        }

      }
    });
  },
  derender: function () {
    this.stopListening();
    this.editor = null;
  },
  update: function (val) {
    this.model.set('value', val);
  },
  toString: function () {
    if (this.editor) {
      try {
        return this.editor.getContent();
      } catch (e) {
        return '';
      }
    }
    return '';
  }
});
},{"../FieldControlBaseView":31,"common/TinyMCE":28}],46:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
var FileMultipleController = require('fields/controls/file-multiple/FileMultipleController');
module.exports = BaseView.extend({
  initialize: function () {
    this.createController();
    this.render();
  },
  render: function () {
    var that = this;
    this.$stage = this.$('[data-kftype="file-multiple"]');
    this.FileMultipleController.setElement(this.$stage.get(0)); // root element equals stage element
    _.defer(function(){
      that.FileMultipleController.render();
    });
  },
  derender: function () {
    this.FileMultipleController.derender();
  },
  rerender: function () {
    this.render();
  },
  createController: function () {
    if (!this.FileMultipleController) {
      return this.FileMultipleController = new FileMultipleController({
        el: this.$('[data-kftype="file-multiple"]'),
        model: this.model,
        parentView: this
      })
    }
  }
});
},{"../FieldControlBaseView":31,"fields/controls/file-multiple/FileMultipleController":47}],47:[function(require,module,exports){
var BaseController = require('fields/MultipleControllerBase');
module.exports = BaseController.extend({
  type: 'file-multiple'
});
},{"fields/MultipleControllerBase":36}],48:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  events: {
    'click .kb-js-add-file': 'openFrame',
    'click .kb-js-reset-file': 'reset'
  },
  render: function () {
    this.$container = this.$('.kb-field-file-wrapper');
    this.$IdIn = this.$('.kb-file-attachment-id'); // hidden input
    this.$resetIn = this.$('.kb-js-reset-file'); // reset button
  },
  derender: function () {
    if (this.frame) {
      this.frame.dispose();
      this.frame = null;
    }
  },
  openFrame: function () {
    var that = this;
    if (this.frame) {
      return this.frame.open();
    }

    var frameoptions = {
      title: KB.i18n.Refields.file.modalTitle,
      button: {
        text: KB.i18n.Refields.common.select
      },
      multiple: false,
      library: {
        type: ''
      }
    };

    if (that.model.get('uploadedTo') === true) {
      frameoptions.library.uploadedTo = KB.Environment.postId || 0
    }

    this.frame = wp.media(frameoptions);
    this.frame.on('ready', function () {
      that.ready(this);
    });
    this.frame.state('library').on('select', function () {
      that.select(this);
    });
    return this.frame.open();
  },
  ready: function (frame) {
    var that = this;
    this.$('.media-modal').addClass(' smaller no-sidebar');
    var settings = that.model.get('settings');
    if (settings && settings.uploadFolder) {
      that.frame.uploader.options.uploader.params.upload_folder = settings.uploadFolder;
    }
  },
  select: function (frame) {
    var attachment = frame.get('selection').first();
    this.handleAttachment(attachment);
  },
  handleAttachment: function (attachment) {
    this.$('.kb-file-filename', this.$container).html(attachment.get('filename'));
    this.$('.kb-file-attachment-id', this.$container).val(attachment.get('id'));
    this.$('.kb-file-title', this.$container).html(attachment.get('title'));
    this.$('.kb-file-id', this.$container).html(attachment.get('id'));
    this.$('.kb-file-editLink', this.$container).attr('href', attachment.get('editLink'));
    this.$resetIn.show();
    this.$container.show(450, function () {
      KB.Events.trigger('modal.recalibrate');
    });
  },
  reset: function () {
    this.$IdIn.val('');
    this.$container.hide(450);
    this.$resetIn.hide();
  }
});

},{"../FieldControlBaseView":31}],49:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
var FlexfieldController = require('fields/controls/flexfields/FlexfieldsController');
module.exports = BaseView.extend({
  initialize: function () {
    this.createController();
    this.render();
  },
  render: function () {
    var that = this;
    this.$stage = this.$('.flexible-fields--stage');
    this.FlexFieldsController.setElement(this.$stage.get(0)); // root element equals stage element
    _.defer(function(){
      that.FlexFieldsController.render();
    });
  },
  derender: function () {
    this.FlexFieldsController.derender(); 
  },
  rerender: function () {
    this.FlexFieldsController.derender();
    this.render();
  },
  createController: function () {
    if (!this.FlexFieldsController) {
      return this.FlexFieldsController = new FlexfieldController({
        el: this.$('.flexible-fields2--stage'),
        model: this.model,
        parentView: this
      })
    }
  }
});
},{"../FieldControlBaseView":31,"fields/controls/flexfields/FlexfieldsController":52}],50:[function(require,module,exports){
var FlexFieldModelModal = require('fields/FieldControlModelModal');
module.exports = Backbone.Collection.extend({
  model: FlexFieldModelModal
});
},{"fields/FieldControlModelModal":33}],51:[function(require,module,exports){
module.exports = Backbone.View.extend({

  initialize: function (options) {
    this.controller = options.controller;
    this.types = this.model.get('fields');
  },
  factorNewItem: function (data, obj) {
    var uid = obj['_meta'].uid || null;
    var title = obj['_meta'].title || null;
    var type = obj['_meta'].type;
    var status = obj['_meta'].status || 'visible';
    var itemId = uid || _.uniqueId('ff2');
    var text = this.model.get('newitemtext') || 'Enter a title : ';
    var ask = this.model.get('requesttitle') || false;


    if (ask) {
      title = title || prompt(text, '');
    } else {
      title = title || '#' + this.controller.subviews.length;
    }
    var typesections = this.types[type].sections || [];
    var types = _.clone(this.types);
    _.each(typesections, function (section) {
      _.each(section.fields, function (field) {
        var fielddata = (data && data[field.key]) ? data[field.key] : field.std;
        var itemData = _.extend(field, {
          value: fielddata || '',
          arrayKey: this.model.get('arrayKey'),
          fieldkey: this.model.get('fieldkey'),
          relId: this.model.get('relId'),
          primeKey: field.key,
          fieldId: this.model.get('fieldId'),
          index: itemId,
          type: field.type
        });
        field.view = KB.FieldsAPI.getRefByType(field.type, itemData);

        if (!fielddata) {
          field.view.setDefaults();
        }
      }, this)
    }, this);

    return {
      itemId: itemId,
      fftype: type,
      title: title,
      status: status,
      sections: typesections
    }
  }

});
},{}],52:[function(require,module,exports){
/**
 * Main Controller
 */
//KB.FlexibleFields.Controller
var ToggleBoxItem = require('fields/controls/flexfields/ToggleBoxItem');
var SectionBoxItem = require('fields/controls/flexfields/SectionBoxItem');
var Factory = require('fields/controls/flexfields/FlexFieldsFactory');
var TinyMCE = require('common/TinyMCE');
var UI = require('common/UI');
var Logger = require('common/Logger');
var FlexFieldsCollection = require('fields/controls/flexfields/FlexFieldsCollection');
var tplSkeleton = require('templates/fields/FlexibleFields/skeleton.hbs');
var I18n = require('common/I18n');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    // setup the flexfield configuration as set in the parent object
    // finally this.Tabs holds an array of all tabs with setup fields reference objects
    this.parentView = options.parentView;
    this.active = false;
    this.Renderer = (this.model.get('renderer') == 'sections') ? SectionBoxItem : ToggleBoxItem;
    this.Fields = new FlexFieldsCollection();
    this.subviews = [];
    this.factory = new Factory({
      controller: this,
      model: this.model
    });
    Logger.Debug.log('Fields: Flexfields2 instance created and initialized'); // tell the developer that I'm here
  },
  events: {
    'click .kb-flexible-fields--js-add-item': 'addItem'
  },
  initialSetup: function () {
    var data, types;
    data = this.model.get('value'); // model equals FieldControlModel, value equals parent obj data for this field key

    types = this.model.get('fields');
    if (!_.isEmpty(data)) {
      _.each(data, function (dataobj, index) {
        if (!dataobj) {
          return;
        }
        if (!dataobj['_meta'].type) {
          dataobj['_meta'].type = 'default';
        }
        if (!types[dataobj['_meta'].type]) {
          return;
        }
        // factor item
        var item = this.factory.factorNewItem(data[dataobj['_meta'].uid], dataobj);
        // build view for item
        var view = new this.Renderer({
          controller: this,
          model: new Backbone.Model(item)
        });
        //collect views
        this.subviews.push(view);
        // render item
        this.$list.append(view.render());
        UI.initTabs();
        KB.Events.trigger('modal.recalibrate');
      }, this);
    }
    UI.initTabs();
    this.$list.sortable({
      handle: '.flexible-fields--js-drag-handle',
      start: function () {
        TinyMCE.removeEditors();
      },
      stop: function () {
        TinyMCE.restoreEditors();
      }
    });
    KB.Events.trigger('modal.recalibrate'); // tell the frontend modal to resize
    this._initialized = true; // flag init state
  },
  duplicateItem: function (model) {
    var itemId = model.get('itemId');
    var title = model.get('title') + ' (Copy)';
    var data = this.model.get('value'); // model equals FieldControlModel, value equals parent obj data for this field key
    if (!data[itemId]) {
      return false;
    }
    var itemData = JSON.parse(JSON.stringify(data[itemId]));
    if (!itemData['_meta']) {
      return false;
    }
    itemData['_meta']['uid'] = null;
    itemData['_meta']['title'] = title;

    var item = this.factory.factorNewItem(itemData, itemData);
    var view = new this.Renderer({
      controller: this,
      model: new Backbone.Model(item)
    });
    //collect views
    this.subviews.push(view);
    // render item
    this.$list.append(view.render());
    UI.initTabs();
    KB.Events.trigger('modal.recalibrate');

  },
  render: function () {
    if (this.active) {
      return null;
    }
    this.$el.append(tplSkeleton({
      i18n: I18n.getString('Refields.flexfields'),
      model: this.model.toJSON()
    }));
    this.setupElements();
    this.initialSetup();
    this.active = true;
  },
  derender: function () {
    this.trigger('derender'); // subviews mights listen
    this.subviews = [];
    this.active = false;
  },
  setupElements: function () {
    this.$list = this.$('.flexible-fields--item-list');
    this.$addButton = this.$('.kb-flexible-fields--js-add-item');
  },
  addItem: function (e) {
    var $btn = jQuery(e.currentTarget);
    var type = $btn.data('kbf-addtype');
    var item = this.factory.factorNewItem(null, {_meta: {type: type}});
    var view = new this.Renderer({
      controller: this,
      model: new Backbone.Model(item)
    });
    this.subviews.push(view);
    this.$list.append(view.render());
    UI.initTabs();
    KB.Events.trigger('modal.recalibrate');
  }
});

},{"common/I18n":23,"common/Logger":24,"common/TinyMCE":28,"common/UI":29,"fields/controls/flexfields/FlexFieldsCollection":50,"fields/controls/flexfields/FlexFieldsFactory":51,"fields/controls/flexfields/SectionBoxItem":53,"fields/controls/flexfields/ToggleBoxItem":54,"templates/fields/FlexibleFields/skeleton.hbs":183}],53:[function(require,module,exports){
var ToggleBoxItem =  require('fields/controls/flexfields/ToggleBoxItem');
var tplSingleSectionBox = require('templates/fields/FlexibleFields/single-section-box.hbs');
module.exports = ToggleBoxItem.extend({

  events: function(){
    return _.extend({},ToggleBoxItem.prototype.events,{
      'mouseenter' : 'mousein',
      'mouseleave' : 'mouseout'
    });
  },
  mousein: function(){
    // this.$el.addClass('kb-active-box')
  },
  mouseout: function(){
    var that = this;
    // setTimeout(function () {
    //   that.$el.removeClass('kb-active-box')
    // },1000);
  },
  render: function () {
    var inputName = this.createInputName(this.model.get('itemId'));
    var item = this.model.toJSON(); // tab information and value hold by this.model
    var $skeleton = this.$el.append(tplSingleSectionBox({ // append the outer skeletion markup for the item / toggle head & body
      item: item,
      inputName: inputName,
      uid: this.model.get('itemId'),
      fftype: this.model.get('fftype'),
      visible: true
    }));
    this.renderTabs($skeleton); // insert the tabs markup
    return $skeleton;
  }

});
},{"fields/controls/flexfields/ToggleBoxItem":54,"templates/fields/FlexibleFields/single-section-box.hbs":181}],54:[function(require,module,exports){
//KB.FlexibleFields.ItemView
var Notice = require('common/Notice');
var tplSingleToggleBox = require('templates/fields/FlexibleFields/single-toggle-box.hbs');
var Handlebars = require('handlebars');
var TinyMCE = require('common/TinyMCE');
module.exports = Backbone.View.extend({
  tagName: 'li',
  className: 'kb-flexible-fields--item-wrapper',
  initialize: function (options) {
    this.Controller = options.controller;
    this.listenTo(this.Controller, 'derender', this.derender);
    this.FieldViews = {};
  },
  events: {
    'click .flexible-fields--js-toggle': 'toggleItem',
    'click .flexible-fields--js-trash': 'deleteItem',
    'click .flexible-fields--js-visibility': 'toggleItemStatus',
    'click .flexible-fields--js-duplicate': 'duplicateItem'
  },
  toggleItem: function () {
    this.$('.flexible-fields--toggle-title').next().slideToggle(250, function () {
      jQuery(this).toggleClass('kb-togglebox-open');
      if (jQuery(this).hasClass('kb-togglebox-open')) {
        TinyMCE.removeEditors(jQuery(this));
        TinyMCE.restoreEditors(jQuery(this));
      }
      _.defer(function () {
        KB.Events.trigger('modal.recalibrate');
      });
    });
  },
  deleteItem: function () {
    this.$el.hide(250);
    var inputName = this.createInputName(this.model.get('itemId'));
    // important to mark the index as up-to-delete by inserting the hidden field
    // delete happens during save when this field is present for an item
    this.$el.append('<input type="hidden" name="' + inputName + '[_meta][delete]" value="' + this.model.get('itemId') + '" >');
    Notice.notice('Please click update to save the changes', 'success');
  },
  toggleItemStatus: function () {
    var val = this.$('[data-flexfield-visible]').val();
    var nVal = (val === 'visible') ? 'hidden' : 'visible';
    this.$('[data-flexfield-visible]').val(nVal);
    this.$el.toggleClass('ff-section-invisible');
    Notice.notice('Please click update to save the changes', 'success');
  },
  duplicateItem: function(){
    this.Controller.duplicateItem(this.model);
  },
  render: function () {
    var inputName = this.createInputName(this.model.get('itemId'));
    var item = this.model.toJSON(); // tab information and value hold by this.model
    var $skeleton = this.$el.append(tplSingleToggleBox({ // append the outer skeleton markup for the item / toggle head & body
      item: item,
      inputName: inputName,
      uid: this.model.get('itemId'),
      fftype: this.model.get('fftype'),
      status: this.model.get('status')
    }));
    this.renderTabs($skeleton); // insert the tabs markup
    if (this.model.get('status') === 'hidden'){
      this.$el.toggleClass('ff-section-invisible')
    }
    return $skeleton;
  },
  renderTabs: function ($skeleton) {
    var that = this;
    // markup strings @todo move to hbs
    var tabNavEl = Handlebars.compile("<li><a href='#tab-{{ uid }}-{{ index }}'>{{ section.label }}</a></li>");
    var tabCon = Handlebars.compile("<div id='tab-{{ uid }}-{{ index }}'></div>");
    // nav
    _.each(this.model.get('sections'), function (section, index) { // remember: a tab holds the fields referece objects
      jQuery('.flexible-field--tab-nav', $skeleton).append(tabNavEl({ // append a nav element for each tab
        uid: that.model.get('itemId'),
        section: section,
        index: index
      }));
      var $tabsContainment = jQuery('.kb-field--tabs', $skeleton);
      // append a yet empty content container for the tab
      var $con = jQuery(tabCon({uid: that.model.get('itemId'), index: index})).appendTo($tabsContainment);

      // append fields to the container
      that.renderFields(section, $con);
    });
  },
  renderFields: function (section, $con) {
    var fieldInstance;
    var that = this, data, fieldConfig;

    /**
     * Create or get the js representation of a field template
     */
    _.each(section.fields, function (fieldTpl) { // field is just a reference object and does nothing on it's own

      var wrap = Handlebars.compile("<div class='kb-field-wrapper' data-kbfuid='{{ kbfuid }}' id='{{ kbfuid }}'></div>");
      fieldInstance = fieldTpl.view; // get a view for the field, responsibile for the markup
      data = this.model.get('value'); // if not new item a standard backbone model
      fieldInstance.listenTo(this, 'derender', fieldInstance.derender);
      var $wrap = jQuery(wrap({kbfuid: fieldInstance.model.get('uid')}));
      $wrap.append(fieldInstance.render());
      $con.append($wrap);
      this.setupFieldInstance(fieldInstance, $con);
    }, this);
  },
  createInputName: function (uid) {
    return this.createBaseId() + '[' + this.Controller.model.get('fieldkey') + ']' + '[' + uid + ']';
  },
  createBaseId: function () {
    if (!_.isEmpty(this.Controller.model.get('arrayKey'))) {
      return this.Controller.model.get('fieldId') + '[' + this.Controller.model.get('arrayKey') + ']';
    } else {
      return this.Controller.model.get('fieldId');
    }
  },
  derender: function () {
    this.stopListening();
    this.remove();
  },
  setupFieldInstance: function (fieldInstance, $con) {
    var that = this;
    if (that.Controller.parentView) {
      _.defer(function () {
        var existing = that.Controller.Fields.findWhere({uid: fieldInstance.model.get('uid')});
        if (_.isUndefined(existing)) {
          fieldInstance.fieldModel = that.Controller.Fields.add(fieldInstance.model.toJSON());
        } else {
          existing.rebind();
        }
      });
    }
    _.defer(function () {
      fieldInstance.setElement($con);
      if (fieldInstance.postRender) {
        fieldInstance.postRender.call(fieldInstance);
      }
      // add field to controller fields collection
    });
  }
});
},{"common/Notice":25,"common/TinyMCE":28,"handlebars":244,"templates/fields/FlexibleFields/single-toggle-box.hbs":182}],55:[function(require,module,exports){
var BaseView = require('fields/FieldControlBaseView');
var GalleryController = require('./gallery/GalleryController');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    this.$stage = this.$('.kb-gallery--stage');
    this.createController();
  },
  derender: function () {
    this.GalleryController.dispose();
  },
  rerender: function () {
    this.derender();
    this.render();
  },
  createController: function () {
    if (!this.GalleryController) {
      return this.GalleryController = new GalleryController({
        el: this.$stage.get(0),
        model: this.model
      })
    }
    this.GalleryController.setElement(this.$stage.get(0));
    return this.GalleryController.render();
  }
});

///**
// * Bootstrap everything
// */
//KB.Fields.register('Gallery', (function ($) {
//  return {
//    init: function (modalView) {
//      // find all instances on load
//      $('.kb-gallery--stage', $('body')).each(function (index, el) {
//        var fid = $(el).closest('.kb-js-field-identifier').attr('id');
//        var baseId = KB.Payload.getPayload('Fields')[fid].baseId;
//        var view = modalView || KB.Views.Modules.get($(el).data('module')) || new KB.FieldCollection();
//
//        var key = $(el).data('fieldkey');
//        var arrayKey = $(el).data('arraykey');
//
//        if (!view.hasField(key, arrayKey)) {
//
//          var obj = new KB.Gallery.Controller({
//            baseId: baseId,
//            fid: fid,
//            key: key,
//            arrayKey: arrayKey,
//            el: el
//          });
//          view.addField(key, obj, arrayKey);
//        } else {
//          view.getField(key, arrayKey).bootstrap.call(view.getField(key, arrayKey));
//        }
//
//        // attach a new FF instance to the view
////                if (!view[key]) {
////                    view[key] = new KB.Gallery.Controller({moduleView: view, fid: fid, key: key, el: el});
////                } else {
////                    view[key].bootstrap.call(view[key]);
////                }
//
//      });
//    },
//    update: function () {
//      this.init();
//    },
//    frontUpdate: function (modalView) {
//      this.init(modalView);
//    }
//  };
//}(jQuery)));

/*
 * namespace declaration
 */




},{"./gallery/GalleryController":56,"fields/FieldControlBaseView":31}],56:[function(require,module,exports){
/**
 * Main Field Controller
 */
//KB.Gallery.Controller
var Logger = require('common/Logger');
var ImageView = require('./ImageView');
module.exports = Backbone.View.extend({
  initialize: function (params) {
    this._frame = null; // media modal instance
    this.subviews = []; // image items
    this.listenTo(KB.Events, 'modal.saved', this.frontendSave);
    this.setupElements();
    this.initialSetup();
    Logger.Debug.log('Fields: Gallery instance created and initialized');

  },
  events: {
    'click .kb-gallery--js-add-images': 'addImages'
  },
  setupElements: function () {
    // Add list element dynamically
    this.$list = jQuery('<div class="kb-gallery--item-list"></div>').appendTo(this.$el);
    this.$list.sortable({revert: true, delay: 300});
    // add button dynamically
    this.$addButton = jQuery('<a class="button button-primary kb-gallery--js-add-images">' + KB.i18n.Refields.image.addButton + '</a>').appendTo(this.$el);

  },
  addImages: function () {
    this.openModal();
  },
  frame: function () {
    if (this._frame) {
      return this._frame;
    }
  },
  openModal: function () {
    var that = this;
    // opens dialog if not already declared
    if (this._frame) {
      this._frame.open();
      return;
    }

    this._frame = wp.media({
      // Custom attributes
      title: KB.i18n.Refields.image.modalHelpTitle,
      button: {
        text: KB.i18n.Refields.common.select
      },
      multiple: true,
      library: {
        type: 'image'
      }
    });

    this._frame.state('library').on('select', function () {
      that.select(this);
    });
    this._frame.open();
    return this._frame;

  },
  select: function (modal) {
    var selection = modal.get('selection');
    if (selection.length > 0) {
      this.handleModalSelection(selection.models);
    }
  },
  handleModalSelection: function (selection) {
    var that = this;
    _.each(selection, function (image) {
      var attr = {
        file: image.toJSON(),
        details: {
          'title': '',
          'alt': '',
          'description': ''
        },
        id: image.get('id')
      };
      var model = new Backbone.Model(attr);
      var imageView = new ImageView({model: model, Controller: that});
      that.subviews.push(imageView);
      that.$list.append(imageView.render());
      setTimeout(function () {
        KB.Events.trigger('modal.recalibrate');
      }, 250);
    })
  },
  initialSetup: function () {
    var that = this;
    var data = this.model.get('value').images || {};

    if (_.toArray(data).length > 0) {
      _.each(data, function (image) {
        var model = new Backbone.Model(image);
        var imageView = new ImageView({model: model, Controller: that});
        that.subviews.push(imageView);
        that.$list.append(imageView.render());
      })
    }
  },
  frontendSave: function () {
    var that = this;
    if (this.subviews.length > 0) {
      _.each(this.subviews, function (m, i) {
        if (m._remove) {
          delete that.subviews[i];
          m.remove();
        }
      });
    }
  }
});

},{"./ImageView":57,"common/Logger":24}],57:[function(require,module,exports){
/**
 * Single Gallery Image View
 */
//KB.Gallery.ImageView
var TinyMCE = require('common/TinyMCE');
var UI = require('common/UI');
var tplSingleImage = require('templates/fields/Gallery/single-image.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-gallery--image-wrapper',
  initialize: function (options) {
    this.Controller = options.Controller;
    this.uid = this.model.get('uid') || _.uniqueId('kbg');
    this.editorAdded = false;
    this._remove = false;
  },
  events: {
    'click .kb-gallery--js-edit': 'edit',
    'click .kb-gallery--js-delete': 'delete',
    'click .kb-gallery--js-meta-close': 'close'
  },
  edit: function () {
    this.$el.wrap('<div class="kb-gallery--item-placeholder kb-gallery--image-wrapper"></div>');
    this._placeholder = this.$el.parent();
    this.$el.addClass('kb-gallery--active-item kb-field').appendTo('body');
    jQuery('#wpwrap').addClass('module-browser-open');
    this.handleEditor();
    UI.initTabs();
  },
  handleEditor: function () {
    var that = this;
    var $re = jQuery('.kb-js--remote-editor', this.$el);
    var name = this.createInputName(this.uid) + '[details][description]';

    if (!this.editorAdded) {
      var req = TinyMCE.remoteGetEditor($re, name, this.uid, this.model.get('details').description, null, false, false);
      req.done(function (res) {
        that.editorAdded = res;
        UI.initTabs();
      });
    } else {
      TinyMCE.addEditor($re, null, 150);
    }

  },
  delete: function () {
    if (!this._remove) {
      this.$el.fadeTo(450, .5).css('borderColor', 'red');
      this._remove = true;
      jQuery('.kb-gallery--image-remove', this.$el).val('true');
//            this.removeInput.val('true');
    } else {
      this.$el.fadeTo(450, 1).css('borderColor', '#ccc');
      jQuery('.kb-gallery--image-remove', this.$el).val('');
      this._remove = false;
    }
  },
  remove: function () {
    this.$el.remove();
    delete this.$el;
  },
  close: function () {
    var ed = tinymce.get(this.uid + '_ededitor');
    var details = this.model.get('details');
    details.description = this.getEditorContent(ed);

    tinymce.remove(ed);
    this.$el.appendTo(this._placeholder).unwrap();
    this.$el.removeClass('kb-gallery--active-item').removeClass('kb-field');
    jQuery('#wpwrap').removeClass('module-browser-open');
  },
  getEditorContent: function (ed) {
    var $wrap = jQuery('#wp-' + this.uid + '_ededitor-wrap');
    var isTinyMCE = $wrap.hasClass('tmce-active');

    if (isTinyMCE) {
      return ed.getContent();
    } else {
      var value = document.getElementById(this.uid + '_ededitor').value;
      value = value.replace(/<br\s*\/?>/mg, "\n");
      ed.setContent(value);
      return value;
    }

  },
  render: function () {
    var inputName = this.createInputName(this.uid);
    var item = this.model.toJSON();
    return this.$el.append(tplSingleImage({
      image: item,
      id: item.id,
      inputName: inputName,
      uid: this.uid
    }));
  },
  createInputName: function (uid) {
    return this.createBaseId() + '[' + this.Controller.model.get('fieldkey') + ']' + '[images]' + '[' + uid + ']';
  },
  createBaseId: function () {
    if (!_.isEmpty(this.Controller.model.get('arrayKey'))) {
      return this.Controller.model.get('baseId') + '[' + this.Controller.model.get('arrayKey') + ']';
    } else {
      return this.Controller.model.get('baseId');
    }
  }

});

},{"common/TinyMCE":28,"common/UI":29,"templates/fields/Gallery/single-image.hbs":184}],58:[function(require,module,exports){
var BaseView = require('fields/FieldControlBaseView');
var Gallery2Controller = require('./gallery2/Gallery2Controller');
module.exports = BaseView.extend({
  initialize: function () {
    this.selection = null;
    this.render();
  },
  render: function () {
    this.$stage = this.$('.kb-gallery2__stage');
    this.createController();
    this.$stage.append(this.GalleryController.render());
  },
  derender: function () {
    if (this.GalleryController){
      this.GalleryController.$el.detach();
    }
  },
  createController: function () {
    if (!this.GalleryController) {
      this.GalleryController = new Gallery2Controller({
        el: this.$stage.get(0),
        model: this.model
      })
    }
    return this.GalleryController;

  }
});
},{"./gallery2/Gallery2Controller":59,"fields/FieldControlBaseView":31}],59:[function(require,module,exports){
/**
 * Main Field Controller
 */
var Logger = require('common/Logger');
var ImageView = require('./ImageView');
module.exports = Backbone.View.extend({
  initialize: function (params) {
    this._frame = null; // media modal instance
    this.subviews = {}; // image items
    this.ids = [];
    Logger.Debug.log('Fields: Gallery instance created and initialized');
    this.renderElements();
    this.initialSetup();

  },
  render: function () {
    this.trigger('render');
    this.setupElements();
    this.delegateEvents();
    return this.$el;
  },
  events: {
    'click .kb-gallery2--js-add-images': 'addImages'
  },
  derender: function () {

  },
  renderElements: function () {
    // Add list element dynamically
    jQuery('<div class="kb-gallery2--item-list"></div>').appendTo(this.$el);
    // add button dynamically
    jQuery('<a class="button button-primary kb-gallery2--js-add-images">' + KB.i18n.Refields.gallery.addButton + '</a>').appendTo(this.$el);
  },
  setupElements: function () {
    this.$list = this.$('.kb-gallery2--item-list');
    this.$list.sortable({revert: true, delay: 300, helper: 'clone', stop: _.bind(this.updateOrder, this)});
  },
  addImages: function () {
    this.openModal();
  },
  updateOrder: function () {
    this.resortSelection();
    this.model.set('value', this.ids);
  },
  frame: function () {
    if (this._frame) {
      return this._frame;
    }
  },
  openModal: function () {
    var that = this;

    // opens dialog if not already declared
    if (this._frame) {
      this._frame.open();
      return;
    }

    this._frame = new wp.media.view.KBGallery({
      state: 'gallery-edit',
      multiple: true,
      selection: this.selection,
      editing: true
    });

    this._frame.state('gallery-edit').on('update', function (selection) {
      that.selection = selection;
      that.resortToSelection();
      setTimeout(function () {
        KB.Events.trigger('modal.recalibrate');
      }, 250);
    });

    this._frame.options.selection.on('add', function (model) {
      that.add(model);
    });

    this._frame.on('ready', function (model) {
      jQuery('.media-modal').addClass('kb-gallery-frame');
    });

    this._frame.options.selection.on('remove', function (model) {
      that.remove(model);
    });

    this._frame.open();
    return this._frame;

  },
  initialSetup: function () {
    var that = this;
    var data = this.model.get('value').images || {};
    this.setIds(data);

    if (this.ids != '') {
      var args = {post__in: this.ids,suppress_filters:true};
      var query = wp.media.query(args);
      if (!this.selection) {
        this.selection = new wp.media.model.Selection(query.models, {
          props: query.props.toJSON(),
          multiple: true
        });

        this.selection.more().done(function () {
          // Break ties with the query.
          that.selection.props.set({query: false});
          that.selection.unmirror();
          that.selection.props.unset('orderby');
          that.initImages();
          that.resortSelection();
        });
      }
    }
  },
  initImages: function () {
    _.each(this.ids, function (imageId) {
      var image = this.selection.get(imageId);
      if (image){
        this.add(this.selection.get(imageId));
      }
    }, this);
  },
  add: function (model) {
    var imageView = new ImageView({model: model, Controller: this});
    this.subviews[model.get('id')] = imageView;
    var $image = imageView.render();
    this.ids.push(model.get('id'));
    this.$list.append($image);
  },
  setIds: function (ids) {
    var parsedids = [];
    _.each(ids, function (num) {
      num = parseInt(num, 10);
      if (_.isNumber(num) && !isNaN(num)) {
        parsedids.push(num);
      }
    });
    this.ids = parsedids;

  },
  resortSelection: function () {
    var models = [];
    var ids = this.getIdsFromInputs();
    _.each(ids, function (imgId) {
      models.push(this.selection.get(imgId));
    }, this);
    this.selection.reset(models);
    this.setIds(ids);

  },
  remove: function (model) {
    var index = this.ids.indexOf(model.get('id'));
    if (index !== -1) {
      this.ids.splice(index, 1);
    }
    var view = this.subviews[model.get('id')];

    if (view && view.remove) {
      view.remove();
      delete this.subviews[model.get('id')];
    }

  },
  getIdsFromInputs: function () {
    return this.$('.kb-gallery--image-holder input').map(function (idx, ele) {
      return jQuery(ele).val();
    }).get();
  },
  resortToSelection: function () {
    var ids = _.pluck(this.selection.models, 'id');
    _.each(this.subviews, function (view) {
      view.$el.detach();
    }, this);

    _.each(ids, function (imgId) {
      var view = this.subviews[imgId];
      view.$el.appendTo(this.$list);
    }, this);

  }
});

},{"./ImageView":60,"common/Logger":24}],60:[function(require,module,exports){
var tplSingleImage = require('templates/fields/Gallery2/single-image.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-gallery--image-wrapper',
  initialize: function (options) {
    this.Controller = options.Controller;
  },
  remove: function () {
    this.$el.remove();
    delete this.$el;
  },
  render: function () {
    var inputName = this.createInputName(this.uid);
    var item = this.model.toJSON();

    if (!item.sizes){
      return;
    }

    item.previewUrl = (item.sizes.thumbnail) ? item.sizes.thumbnail.url : item.url;
    var tpl = jQuery(tplSingleImage({
      image: item,
      id: item.id,
      inputName: inputName
    }))
    .appendTo(this.$el);
    return this.$el;
  },
  createInputName: function (uid) {
    return this.createBaseId() + '[' + this.Controller.model.get('fieldkey') + ']' + '[images]' + '[]';
  },
  createBaseId: function () {
    // if (!_.isEmpty(this.Controller.model.get('arrayKey'))) {
    //   return this.Controller.model.get('baseId') + '[' + this.Controller.model.get('arrayKey') + ']';
    // } else {
      return this.Controller.model.get('baseId');
    // }
  }
});

},{"templates/fields/Gallery2/single-image.hbs":185}],61:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
var Utilities = require('common/Utilities');
var Config = require('common/Config');
module.exports = BaseView.extend({
  initialize: function () {
    this.defaultState = 'replace-image';
    this.defaultFrame = 'image';
    this.render();
  },
  events: {
    'click .kb-js-add-image': 'openFrame',
    'click .kb-js-reset-image': 'resetImage',
    'change [data-kbimage-crop]': 'handleCropChange'
  },
  handleCropChange: function () {
    var cropValue = this.$cropSelect.val();
    var value = this.model.get('value');
    value.crop = cropValue;
    this.model.set('value', value);
    var args = this.prepareArgs();
    this.retrieveImage(args, value.id);
  },
  render: function () {
    this.$reset = this.$('.kb-js-reset-image');
    this.$container = this.$('.kb-field-image-container');
    this.$saveId = this.$('.kb-js-image-id');
    this.$description = this.$('.kb-js-image-description');
    this.$title = this.$('.kb-js-image-title');
    this.$cropSelect = this.$('[data-kbimage-crop]');
  },
  editImage: function () {
    this.openFrame(true);
  },
  derender: function () {
    if (this.frame) {
      this.frame.dispose();
    }
  },
  openFrame: function (editmode) {
    var that = this, metadata;
    if (this.frame) {
      this.frame.dispose();
    }

    // we only want to query "our" image attachment
    // value of post__in must be an array

    var queryargs = {};
    if (this.model.get('value').id !== '') {
      queryargs.post__in = [this.model.get('value').id];
    }
    wp.media.query(queryargs) // set the query
      .more() // execute the query, this will return an deferred object
      .done(function () { // attach callback, executes after the ajax call succeeded
        // inside the callback 'this' refers to the result collection
        // there should be only one model, assign it to a var
        // if (queryargs.post__in){
        var attachment = this.first();
        that.attachment = attachment;
        // }
        // this is a bit odd: if you want to access the 'sizes' in the modal
        // and if you need access to the image editor / replace image function

        // attachment_id must be set.
        // see media-models.js, Line ~370 / PostImage
        if (attachment) {
          attachment.set('attachment_id', attachment.get('id'));
          metadata = that.attachment.toJSON();
        } else {
          metadata = {};
          that.defaultFrame = 'select';
          that.defaultState = 'library';
        }
        // create a frame, bind 'update' callback and open in one step
        that.frame = wp.media({
          frame: that.defaultFrame, // alias for the ImageDetails frame
          state: that.defaultState, // default state, makes sense
          metadata: metadata, // the important bit, thats where the initial information come from
          imageEditView: that,
          type: 'image',
          library: {
            type: 'image'
          }
        });
        that.frame.on('update', function (attachmentObj) { // bind callback to 'update'
          that.update(attachmentObj);
        })
          .on('close', function (att) {
            if (that.frame.image && that.frame.image.attachment) {
              that.$description.val(that.frame.image.attachment.get('caption'));
              that.$title.val(that.frame.image.attachment.get('title'));
            }
          })
          .on('ready', function () {
            that.ready(that);
          }).on('replace', function () {
          that.replace(that.frame.image.attachment);
        }).on('select', function (what) {
          var attachment = this.get('library').get('selection').first();
          that.replace(attachment);
        }).open();
      });
  },
  ready: function (that) {
    jQuery('.media-modal').addClass('smaller kb-image-frame');

    var settings = that.model.get('settings');
    if (settings && settings.minDimensions) {
      that.frame.uploader.options.uploader.params.mindimensions = settings.minDimensions;
    }
  },
  replace: function (attachment) {
    this.attachment = attachment;
    this.handleAttachment(attachment);
  },
  update: function (attachmentObj) {
    this.attachment.set(attachmentObj);
    this.attachment.sync('update', this.attachment);
    //if(this.$caption.length > 0){
    //  this.$caption.html(this.attachment.get('caption'));
    //}
  },
  getCropValue: function () {
    var value = this.model.get('value');
    if (value.crop && value.crop !== '') {
      return value.crop;
    }
    return this.model.get('crop');
  },
  prepareArgs: function () {
    var that = this;
    return {
      width: that.model.get('width') || null,
      height: that.model.get('height') || null,
      crop: that.getCropValue() || true,
      upscale: that.model.get('upscale') || false
    };
  },
  handleAttachment: function (attachment) {
    var that = this;
    var id = attachment.get('id');
    var value = this.prepareValue(attachment);
    that.model.set('value', value);
    var entityData = _.clone(this.model.get('ModuleModel').get('entityData'));
    var path = this.model.get('kpath');
    Utilities.setIndex(entityData, path, value);
    this.model.get('ModuleModel').set('entityData', entityData);
    var args = that.prepareArgs();
    if (!args.width) {
      var src = (attachment.get('sizes').thumbnail) ? attachment.get('sizes').thumbnail.url : attachment.get('sizes').full.url;
      this.$container.html('<img src="' + src + '" >');
    } else {
      that.retrieveImage(args, id);
    }
    this.$saveId.val(attachment.get('id'));
    this.$description.val(value.caption);
    this.$title.val(value.title);
    //KB.Events.trigger('modal.preview');
    this.model.get('ModuleModel').trigger('data.updated', {silent: true});
  },
  retrieveImage: function (args, id) {
    var that = this;
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'fieldGetImage',
        args: args,
        id: id,
        _ajax_nonce: Config.getNonce('read')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        that.$container.html('<img src="' + res.data.src + '" >');
      },
      error: function () {

      }
    });
  },
  prepareValue: function (attachment) {
    var newValue = {
      id: attachment.get('id'),
      // title: attachment.get('title'),
      // caption: attachment.get('caption'),
      alt: attachment.get('alt')
    };
    var oldValue = this.model.get('value');
    if (!_.isObject(oldValue)) {
      oldValue = {};
    }

    return _.extend(oldValue, newValue);
  },
  resetImage: function () {
    this.$container.html('');
    this.$saveId.val('');
    this.model.set('value', {id: null, caption: '', title: ''});
    this.$description.val('');
    this.$title.val('');
  },
  toString: function () {
    var that = this;
    if (!this.attachment && !_.isEmpty(this.model.get('value').id)) {
      var query = wp.media.query({post__in: [this.model.get('value').id]});
      var promise = query.more();
      promise.done(function (res) {
        that.attachment = query.first();
        // if (window.YoastSEO) {
        //   YoastSEO.app.refresh();
        // }
      })
    }

    if (this.attachment) {
      var size = (this.attachment.get('sizes').thumbnail) ? this.attachment.get('sizes').thumbnail : this.attachment.get('sizes').full;
      return "<img src='" + size.url + "'>";
    }

    return '';

  }
});
},{"../FieldControlBaseView":31,"common/Config":22,"common/Utilities":30}],62:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.defaults = {
      filter:true
    };
    this.settings = this.model.get('settings') || {};
    this.render();
  },
  render: function () {
    this.$("[data-kftype='imageselect']").imagepicker(_.extend(this.defaults, this.settings));
  },
  rerender: function () {
    this.$("[data-kftype='imageselect']").imagepicker('destroy');
    this.render();
  }
});
},{"../FieldControlBaseView":31}],63:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  events: {
    'click .kb-js-add-link': 'openModal'
  },
  render: function () {
    this.$input = this.$('[data-kbf-link-url]');
    this.$text = this.$('[data-kbf-link-linktext]');
    this.$target = this.$('[data-kbf-link-target]');
  },
  derender: function () {

  },
  openModal: function () {
    window._kbLink = this;
    wpActiveEditor = this.$input.attr('id');
    jQuery('#wp-link-wrap').addClass('kb-customized');

    // store the original function
    window.kb_restore_htmlUpdate = wpLink.htmlUpdate;
    window.kb_restore_isMce = wpLink.isMCE;

    wpLink.isMCE = this.isMCE;
    wpLink.htmlUpdate = this.htmlUpdate;
    wpLink.open();
    jQuery('#wp-link-text').val(this.$text.val());
    jQuery('#wp-link-url').val(this.$input.val());

    if (!this.model.get('showtarget')){
      jQuery('#link-selector .link-target').addClass('kb-hide');
    }

    this.setTarget();

  },
  setTarget: function () {
    var $mTarget = jQuery('#wp-link-target');
    if (this.$target.is(':checked')) {
      $mTarget.prop('checked', true);
    } else {
      $mTarget.prop('checked', false);
    }
  },
  setTargetFromModal: function (target) {
    if (target === '_blank') {
      this.$target.prop('checked', true);
    } else {
      this.$target.prop('checked', false);
    }

  },
  htmlUpdate: function () {
    var target, attrs, html, start, end, cursor, href, title,
      textarea = wpLink.textarea, result;

    if (!textarea)
      return;
    // get contents of dialog
    attrs = wpLink.getAttrs();
    title = jQuery('#wp-link-text').val();

    target = attrs.target;
    window._kbLink.setTargetFromModal(target);

    // If there's no href, return.
    if (!attrs.href)
      return;
    // Build HTML
    href = attrs.href;
    // Clear textarea
    // jQuery(textarea).empty();
    window._kbLink.$input.empty();

    //Append the Url to the textarea
    window._kbLink.$input.val(href);

    window._kbLink.trigger('update', title, href);
    window._kbLink.$text.val(title);

    //restore the original function
    // close dialog and put the cursor inside the textarea
    wpLink.close();
    window._kbLink.close();
    textarea.focus();
  },
  isMCE: function () {
    return false;
  },
  close: function () {
    // restore the original functions to wpLink
    if (!this.model.get('showtarget')){
      jQuery('#link-selector .link-target').removeClass('kb-hide');
    }
    wpLink.isMCE = window.kb_restore_isMce;
    wpLink.htmlUpdate = window.kb_restore_htmlUpdate;
  }
});
},{"../FieldControlBaseView":31}],64:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    this.editor = new MediumEditor(this.$('.kb-medium-editable'));
  },
  derender: function () {

  },
  update: function (val) {
  },
  toString: function(){
  }
});
},{"../FieldControlBaseView":31}],65:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.defaults = {
      filter:true
    };
    this.settings = this.model.get('settings') || {};
    this.render();
  },
  render: function () {
    this.$("[data-kftype='multiselect']").multipleSelect(_.extend(this.defaults, this.settings));
  },
  rerender: function () {
    this.$("[data-kftype='multiselect']").multipleSelect('refresh');
  }
});
},{"../FieldControlBaseView":31}],66:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    this.$input = this.$('.kb-field--oembed input');
    this.$preview = this.$('[data-kb-oembed-preview]');
    this.$input.on('change', function () {
      that.update(that.$input.val());
    })
    this.$input.trigger('change');
  },
  derender: function () {

  },
  update: function (val) {
    var that = this;
    this.model.set('value', val);
    var request = this.sendRequest(val).done(function (res) {
      if (res && res.data && res.data.html){
        that.$preview.html(res.data.html);
      }
    });
  },
  toString: function () {
    return '';
  },
  sendRequest: function (val) {
    return Ajax.send({
      action: 'getOembed',
      embedUrl: val,
      _ajax_nonce: Config.getNonce('read')
    })
  }
});
},{"../FieldControlBaseView":31,"common/Ajax":20,"common/Config":22}],67:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
var Utilities = require('common/Utilities');
var Config = require('common/Config');
module.exports = BaseView.extend({
  initialize: function () {
    this.uniq = _.uniqueId('map');
    this.marker = null;
    this.render();
  },
  events: {
    'change input': 'updateMarker'
  },
  render: function () {
    var that = this;
    this.default = {
      road: '',
      postcode: '',
      village: '',
      state: '',
      house_number: ''
    }
    this.$map = this.$('[data-kb-osm-map]').attr('id', this.uniq);
    this.$lat = this.$('[data-kb-osm-lat]');
    this.$lng = this.$('[data-kb-osm-lng]');
    this.$road = this.$('[data-kb-osm-road]');
    this.$postcode = this.$('[data-kb-osm-postcode]');
    this.$village = this.$('[data-kb-osm-village]');
    this.$state = this.$('[data-kb-osm-state]');
    this.$housenumber = this.$('[data-kb-osm-housenumber]');
    _.defer(function () {
      that.setupMap();
      _.defer(function () {
        that.map.invalidateSize();
      });
    });

    this.$map.on('mouseenter', function () {
      that.map.invalidateSize();
    })

  },
  updateMarker: function () {
    var lat = this.$lat.val();
    var lng = this.$lng.val();
    this.setMarker(lat, lng, this.default, false);
    this.map.setView(this.marker.getLatLng());
  },
  derender: function () {
  },

  reverseGeocode: function (lat, lng, cb) {
    var that = this;
    var GeoCRev = new L.Control.Geocoder.Nominatim({
      collapsed: false,
      defaultMarkGeocode: false
    });
    GeoCRev.reverse(L.latLng(lat, lng), 18, function (res) {
      cb.call(that, res)
    });
  },

  setupMap: function () {
    var that = this;
    this.map = L.map(this.uniq).setView([53.551086, 9.993682], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
    }).addTo(this.map);

    var GeoC = new L.Control.Geocoder({
      collapsed: false,
      defaultMarkGeocode: false
    });

    GeoC.on('markgeocode', function (e) {
      that.map.setView(e.geocode.center, 17);
      that.setMarker(e.geocode.properties.lat, e.geocode.properties.lon, Object.assign({}, that.default, e.geocode.properties.address), true)

    });
    GeoC.addTo(this.map);

    this.map.on('click', function (e) {
      that.reverseGeocode(e.latlng.lat, e.latlng.lng, function (res) {
        var result = res[0];
        if (!result || !result.properties) {
          that.setMarker(e.latlng.lat, e.latlng.lng, that.default, true)
        }
        that.setMarker(e.latlng.lat, e.latlng.lng, Object.assign({}, that.default, {
          road: result.properties.address.footway || result.properties.address.pedestrian || result.properties.address.road,
          postcode: result.properties.address.postcode,
          village: result.properties.address.city || result.properties.address.town,
          state: result.properties.address.state || result.properties.address.city,
          house_number: result.properties.address.house_number || ''
        }), true)
      })
    });
    this.updateMarker();
    this.$('.leaflet-control-geocoder,[data-prevent-send]').on('keydown', function (e) {
      if (e.which === 13) {
        e.stopPropagation();
        e.preventDefault();
      }
    })

  },
  setMarker: function (lat, lng, properties, setDetails) {
    var that = this;
    setDetails = setDetails || false;
    if (that.marker) {
      that.map.removeLayer(that.marker);
    }
    //Add a marker to show where you clicked.
    that.marker = L.marker([lat, lng]).addTo(that.map);
    that.$lat.val(lat);
    that.$lng.val(lng);
    if (setDetails) {
      that.$road.val(properties.road);
      that.$village.val(properties.village);
      that.$postcode.val(properties.postcode);
      that.$state.val(properties.state);
      that.$housenumber.val(properties.house_number);
    }

  },
  toString: function () {
    return '';
  }
});
},{"../FieldControlBaseView":31,"common/Config":22,"common/Utilities":30}],68:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  events: {
    'click .js-oday-activate-split' : 'split',
    'click input[type=checkbox]' : 'toggleClosed'
  },
  initialize: function () {
    this.render();
  },
  toggleClosed: function(){
    var $trs = this.$('tr');
    jQuery.each($trs, function (i, el) {
      var $el = jQuery(el);
      var $cb = jQuery('input[type=checkbox]', $el);
      if ($cb.is(':checked')){
        $el.find('input[type=text]:not(.ot-label)').attr('disabled', 'disabled');
      } else {
        $el.find('input[type=text]:not(.ot-label)').removeAttr('disabled','');
      }
    })
  },
  render:function(){
    this.$('.kb-ot-timepicker').kbdatetimepicker({
      datepicker: false,
      format: 'H:i',
      validateOnBlur: false,
      step: 30
    });
    this.toggleClosed();
  },
  derender: function(){
    this.$('.kb-ot-timepicker').kbdatetimepicker('destroy');
  },
  split:function(){
    this.$('table').toggleClass('split');
  }
});


},{"../FieldControlBaseView":31}],69:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.defaults = {
      sortable: false,
      placeholder: 'Click here to add options'
    };
    this.settings = this.model.get('settings') || {};
    this.render();
  },
  render: function () {
    var that = this;
    var settings = _.extend(this.defaults, this.settings);
    if (settings.sortable){
      this.$el.addClass('select-sortable');
      this.$("[data-kbselect2='true']").select2_sortable(settings);
    } else {
      this.$el.removeClass('select-sortable');
      this.$("[data-kbselect2='true']").select2(settings);
    }
    that.$('.select2-search__field').attr('placeholder', settings.placeholder);
    this.$el.on('change', function () {
      that.$('.select2-search__field').attr('placeholder', settings.placeholder);
    })
  },
  rerender: function () {
    this.render();  
  },
  derender: function () {
    var settings = _.extend(this.defaults, this.settings);
    if (settings.sortable){
      this.$("[data-kbselect2='true']").select2_sortable('destroy');
    } else {
      this.$el.removeClass('select-sortable');
      this.$("[data-kbselect2='true']").select2('destroy');
    }
  }
});
},{"../FieldControlBaseView":31}],70:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
var SubareaConroller = require('fields/controls/subarea/SubareaController');
module.exports = BaseView.extend({
  initialize: function () {
    this.createController();
    this.render();
  },
  render: function () {
    this.$stage = this.$('.kb-field--subarea-stage');
    this.SubareaConroller.setElement(this.$stage.get(0)); // root element equals stage element
    this.SubareaConroller.render();
  },
  derender: function () {
    this.SubareaConroller.derender();
  },
  rerender: function () {
    this.SubareaConroller.derender();
    this.model.setData();
    this.render();
  },
  createController: function () {
    var that = this;
    if (!this.SubareaConroller) {
      return this.SubareaConroller = new SubareaConroller({
        el: this.$('.kb-field--subarea-stage'),
        model: this.model,
        parentView: this,
        subarea: KB.Areas.get(that.$('.kb-field--subarea-stage').attr('id')),
        area: this.model.ModuleModel.Area
      })
    }
  }
});
},{"../FieldControlBaseView":31,"fields/controls/subarea/SubareaController":74}],71:[function(require,module,exports){
var ModuleBrowser = require('shared/ModuleBrowser/ModuleBrowserController');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
module.exports = ModuleBrowser.extend({
  initialize: function(options){
      ModuleBrowser.prototype.initialize.apply(this,arguments);
      this.subarea = options.subarea;
      this.isSubarea = true;
  },
  createModule: function (module) {
    var Area, data;
    // check if capability is right for this action
    if (Checks.userCan('create_kontentblocks')) {
    } else {
      Notice.notice('You\'re not allowed to do this', 'error');
    }

    // prepare data to send
    data = {
      action: 'createNewModule',
      'class': module.get('settings').class,
      globalModule: module.get('globalModule'),
      parentObject: module.get('parentObject'),
      parentObjectId: module.get('parentObjectId'),
      areaContext: this.subarea.model.get('context'),
      area: this.subarea.model.get('id'),
      _ajax_nonce: Config.getNonce('create'),
      frontend: KB.appData.config.frontend,
      submodule: true
    };

    if (this.area.model.get('parent_id')) {
      data.postId = this.area.model.get('parent_id');
    }
    Ajax.send(data, this.success, this);
  },
  success: function (res) {
    this.trigger('browser.module.created', {res: res});
    this.close();

  }

});
},{"common/Ajax":20,"common/Checks":21,"common/Config":22,"common/Notice":25,"shared/ModuleBrowser/ModuleBrowserController":149}],72:[function(require,module,exports){
var tplModuleView = require('fields/controls/subarea/templates/module-view.hbs');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var TinyMCE = require('common/TinyMCE');
var Payload = require('common/Payload');
var FullscreenView = require('backend/Views/FullscreenView');
var UI = require('common/UI');

module.exports = Backbone.View.extend({
  events: {
    'click .kbms-action--open': 'openForm',
    'click .kbms-action--delete': 'removeModule',
    'click .kbms-action--update': 'saveModule'
  },
  tagName: 'div',
  className: 'kb-submodule',
  initialize: function (options) {
    this.formLoaded = false;
    this.slotView = options.slotView;
    this.controller = options.slotView.controller;
    this.ModuleModel = options.ModuleModel;
    this.parentModel = options.parentModel;
  },
  draft: function () {

  },
  render: function () {
    var that = this;
    this.$el.append(tplModuleView({module: this.ModuleModel.toJSON()}));
    this.slotView.$container.prepend(this.$el);
    this.$el.attr('data-kba-mid', this.ModuleModel.get('mid'));
    _.defer(function () {
      that.setupElements();
    });
  },
  setupElements: function () {
    this.$inner = this.$('.kbsm-inner');
  },
  openForm: function () {
    if (KB.EditModalModules) {
      this.handleFrontend();
    } else {
      this.handleBackend();
    }
  },
  handleBackend: function () {
    if (this.formLoaded) {
      this.open();
    } else {
      var data = {
        action: 'getModuleBackendForm',
        _ajax_nonce: Config.getNonce('read'),
        module: this.ModuleModel.toJSON()
      };
      Ajax.send(data, this.success, this);
    }
  },
  handleFrontend: function () {
    var model = KB.Modules.get(this.model.get('mid'));
    console.log(model);
    KB.EditModalModules.openView(model.View, false, true);
  },
  success: function (res) {
    this.$inner.hide().append(res.data.html);
    var model = KB.ObjectProxy.add(KB.Modules.add(this.ModuleModel.toJSON()));
    _.defer(function () {
      Payload.parseAdditionalJSON(res.data.json);
    });
    this.formLoaded = true;
    TinyMCE.addEditor(this.$el);
    this.ModuleModel = model;
    this.open();
  },
  open: function () {
    if (!Config.get('frontend')) {
      if (!this.fsControl) {
        this.fsControl = new FullscreenView({model: this.ModuleModel});
      }
      this.fsControl.open();
    }

    this.listenToOnce(this.fsControl, 'close', this.getDirty);
    UI.repaint(this.fsControl.$el);
  },
  saveModule: function () {
    if (!this.formLoaded){
      return false;
    }
    this.ModuleModel.sync();
    this.getClean();
  },

  getDirty: function () {
    this.$el.addClass('is-dirty');
  },
  getClean: function () {
    this.$el.removeClass('is-dirty');
  },
  removeModule: function (e) {
    this.slotView.removeModuleView(e);
  }

});
},{"backend/Views/FullscreenView":7,"common/Ajax":20,"common/Config":22,"common/Payload":26,"common/TinyMCE":28,"common/UI":29,"fields/controls/subarea/templates/module-view.hbs":76}],73:[function(require,module,exports){
var ModuleBrowser = require('fields/controls/subarea/ModuleBrowser');
var ModuleView = require('fields/controls/subarea/ModuleView');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var tplEmpty = require('fields/controls/subarea/templates/empty.hbs');

module.exports = Backbone.View.extend({
  hasModule: false,
  events: {
    'click': 'click'
  },
  initialize: function (options) {
    this.controller = options.controller;
    this.slotId = options.slotId;
    this.ModuleView = null;
    this.ModuleModel = null;
    this.setup();
    this.render();
    this.listenTo(this.model, 'change', this.updateInput);
  },
  setModule: function (module) {
    if (!_.isNull(module)) {
      this.ModuleModel = new Backbone.Model(module);
    }
  },
  updateInputValue: function (val) {
    this.$input.val(val);
  },
  updateInput: function () {
    this.$container.empty();
    if (this.ModuleModel && this.ModuleModel.get('submodule')) {
      this.ModuleView = new ModuleView({
        slotView: this,
        model: this.model,
        ModuleModel: this.ModuleModel,
        parentModel: this.controller.model.ModuleModel
      });
      this.ModuleView.render();
      this.$('.kbsm-empty').remove();
    } else {
      this.$container.prepend(tplEmpty({}));
    }
    this.updateInputValue(this.model.get('mid'));
  },
  setup: function () {
    var field = this.controller.model;
    this.basename = field.get('baseId');
    if (field.get('arrayKey')) {
      this.basename = this.basename + '[' + field.get('arrayKey') + ']';
    }
    this.basename = this.basename + '[' + field.get('fieldkey') + ']' + '[slots]' + '[' + this.slotId + '][mid]';
    this.$input = jQuery("<input type='hidden' name='" + this.basename + "'>");
    this.$container = jQuery("<div></div>");
  },
  render: function () {
    this.$el.append(this.$container);
    this.$el.append(this.$input);
  },
  click: function () {
    if (!this.ModuleBrowser) {
      this.ModuleBrowser = new ModuleBrowser({
        area: this.controller.subarea.View,
        subarea: this.controller.subarea.View
      });
      this.listenTo(this.ModuleBrowser, 'browser.module.created', this.moduleCreated);
    }

    if (!this.ModuleView) {
      this.ModuleBrowser.render();
    }
  },
  dispose: function () {
    // include dispose function
  },
  moduleCreated: function (data) {
    var that = this;
    var res = data.res;
    var module = res.data.module;
    _.defer(function () {
      that.setModule(module);
      that.model.set('mid', '');
      that.model.set('mid', module.mid);
      that.trigger('module.created');
      that.listenToOnce(that.controller.model.ModuleModel.View, 'modal.after.nodeupdate', function () {
        _.defer(function () {
          KB.ObjectProxy.add(KB.Modules.add(module));
          that.controller.setupViewConnections();
        })
      });
      KB.Events.trigger('modal.preview');
    });
  },
  removeModuleView: function (event) {
    event.stopPropagation();
    Ajax.send({
      action: 'removeModules',
      _ajax_nonce: Config.getNonce('delete'),
      module: this.model.get('mid')
    }, this.removeSuccess, this);
  },
  removeSuccess: function (res) {
    var that = this;
    if (res.success) {
      //console.log(this.controller.model);
      //this.controller.model.ModuleModel.View.ModuleMenu.getView('save').saveData();
      this.ModuleView.stopListening();
      this.ModuleView.remove();
      this.ModuleView = null;
      delete this.ModuleView;
      this.ModuleModel = null;
      _.defer(function () {
        that.model.set({mid: ''});
      });

      this.trigger('module.removed');
    }
  }
});
},{"common/Ajax":20,"common/Config":22,"fields/controls/subarea/ModuleBrowser":71,"fields/controls/subarea/ModuleView":72,"fields/controls/subarea/templates/empty.hbs":75}],74:[function(require,module,exports){
var SlotView = require('fields/controls/subarea/SlotView');
var Logger = require('common/Logger');
var ModuleView = require('frontend/Views/ModuleView');
var Config = require('common/Config');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.area = options.area;
    this.subarea = options.subarea;
    this.parentView = options.parentView;
    this.listenTo(this.model.ModuleModel.View, 'modal.before.nodeupdate', this.disposeSubviews);
    this.listenTo(this.model.ModuleModel.View, 'modal.after.nodeupdate', this.updateSubviews);
    this.listenTo(this.model.ModuleModel, 'modal.serialize.before', this.unbindFields);
    this.listenTo(this.model.ModuleModel, 'modal.serialize', this.rebindFields);
    Logger.Debug.log('Fields: SubareaController created'); // tell the developer that I'm here


  },
  unbindFields: function () {
    _.each(this.subViews, function (subview) {
      subview.model.trigger('modal.serialize.before');
    });
  },
  rebindFields: function () {
    _.each(this.subViews, function (subview) {
      subview.model.trigger('modal.serialize');
    });
  },
  setupViewConnections: function () {
    var views = {};
    _.each(this.slotViews, function (slotView) {
      if (slotView.model.get('mid') !== '') {
        var moduleModel = KB.Modules.get(slotView.model.get('mid'));
        if (moduleModel && moduleModel.View) {
          views[slotView.model.get('mid')] = moduleModel.View;
        } else if (moduleModel) {
          _.defer(function () {
            KB.Views.Modules.add(moduleModel.get('mid'), new ModuleView({
              model: moduleModel,
              el: '#' + moduleModel.get('mid')
            }));
          });

        }

      }
    });
    return views;
  },
  updateSubviews: function () {
    this.setupViewConnections();
    _.each(this.subViews, function (subview) {
      subview.rerender();
    })
  },
  disposeSubviews: function () {
    _.each(this.subViews, function (subview) {
      subview.derender();
    })
  },
  derender: function () {
    Logger.Debug.log('Fields: SubareaController derender'); // tell the developer that I'm here
  },
  render: function () {
    var that = this;
    Logger.Debug.log('Fields: SubareaController render'); // tell the developer that I'm here
    this.convertDom(); // clean up the layout
    this.slotViews = {};
    this.$slotContainers = this.setupSlotContainers(); //slots from layout
    this.slotViews = this.setupViews();
    _.defer(function () {
      that.subViews = that.setupViewConnections();
      that.draggable();
    });

    },
  setupSlotContainers: function () {
    return this.$('[data-kbml-slot]');
  },
  draggable: function () {
    var $source, $target, $sourcecontainer, $targetcontainer;
    var that = this;
    this.$('.kbml-slot').draggable({
      revert: 'invalid',
      helper: 'clone',
      revertDuration: 200,
      start: function () {
        $source = jQuery(this).find('.kb-submodule');
        $sourcecontainer = jQuery(this);
        jQuery(this).addClass('being-dragged');
      },
      stop: function () {
        $source = null;
        jQuery(this).removeClass('being-dragged');
      }
    });

    this.$('.kbml-slot').droppable({
      hoverClass: 'drop-hover',
      over: function (event, ui) {
        $target = jQuery(event.target).find('.kb-submodule');
        $targetcontainer = jQuery(this);
      },
      drop: function (event, ui) {

        $source.detach();
        $target.detach();

        $sourcecontainer.append($target);
        $targetcontainer.append($source);

        that.reindex();

        return false;
      }
    });
  },
  reindex: function () {
    _.each(this.slotViews, function (slotView) {
      var $mid = slotView.$('[data-kba-mid]');
      if ($mid.length === 1) {
        var mid = $mid.data('kba-mid');
        if (mid) {
          slotView.updateInputValue(mid);
        }
      } else {
        slotView.updateInputValue('');
      }
    })
  },
  convertDom: function () {
    this.$el.find('*').each(function (i, el) {
      el.removeAttribute('style');
      el.removeAttribute('class');
      var dataset = el.dataset;
      if (dataset.kbaEl) {
        el.className = dataset.kbaEl;
      }
    });
  },
  setupViews: function () {
    var that = this;
    var views = {};
    _.each(this.$slotContainers, function (el) {
      var $el = jQuery(el);
      var slotId = $el.data('kbml-slot');
      var fullId = this.createSlotId(slotId);
      var view = new SlotView({
        el: $el,
        model: new Backbone.Model({}),
        controller: this,
        slotId: fullId
      });
      views[fullId] = view;
      view.setModule(this.getSlotModule(fullId));
      _.defer(function () {
        view.model.set(that.getSlotData(fullId));
      });
      this.listenTo(view, 'module.created', this.updateParent);
      this.listenTo(view, 'module.removed', this.updateParent);
    }, this);
    return views;
  },
  createSlotId: function (slotId) {
    return 'slot-' + slotId;
  },
  getSlotModule: function (slotId) {
    var value = this.model.get('value').modules || {};

    var module = value[slotId];
    if (module) {
      if (module.mid) {
        if (module.mid !== '') {
          return module;
        }
      }
    }
    return null;
  },
  getSlotData: function (slotId) {
    var value = this.model.get('value').slots || {};
    if (!_.isObject(value)) {
      value = {};
    }

    if (value[slotId]) {
      return value[slotId];
    }
    return {mid: ''};
  },
  updateParent: function () {
    this.model.ModuleModel.sync();
  }

});
},{"common/Config":22,"common/Logger":24,"fields/controls/subarea/SlotView":73,"frontend/Views/ModuleView":132}],75:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"kb-submodule\">\n    <div class=\"kbsm-empty add-modules\">\n        <div>Modul auswählen</div>\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],76:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kbsm-details\">\n    <div class=\"kbsm--name\">"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"module") : depth0)) != null ? lookupProperty(stack1,"settings") : stack1)) != null ? lookupProperty(stack1,"name") : stack1), depth0))
    + "</div>\n    <div class=\"kbsm--name\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"module") : depth0)) != null ? lookupProperty(stack1,"mid") : stack1), depth0))
    + "</div>\n</div>\n<div class=\"kbsm-actions\">\n    <div class=\"kbsm-action kbms-action--open\" data-kbtooltip=\"open form\"><span\n            class=\"dashicons dashicons-admin-generic\"></span></div>\n    <div class=\"kbsm-action kbms-action--delete\" data-kbtooltip=\"delete\"><span\n            class=\"dashicons dashicons-welcome-comments\"></span></div>\n    <div class=\"kbsm-action kbms-action--update\" data-kbtooltip=\"update\"><span\n            class=\"dashicons dashicons-update\"></span></div>\n</div>\n<div class=\"kbsm-inner\">\n    <div class=\"kbsm-button kbms-action--open\">Bearbeiten</div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],77:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    if (jQuery('.kb-tags-input').length){
      window.tagBox && window.tagBox.init();
    }
  },
  toString: function(){
    return '';
  }
});
},{"../FieldControlBaseView":31}],78:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
var TextMultipleController = require('fields/controls/text-multiple/TextMultipleController');
module.exports = BaseView.extend({
  initialize: function () {
    this.createController();
    this.render();
  },
  render: function () {
    var that = this;
    this.$stage = this.$('[data-kftype="text-multiple"]');
    this.TextMultipleController.setElement(this.$stage.get(0)); // root element equals stage element
    _.defer(function(){
      that.TextMultipleController.render();
    });
  },
  derender: function () {
    this.FlexFieldsController.derender();
  },
  rerender: function () {
    this.render();
  },
  createController: function () {
    if (!this.TextMultipleController) {
      return this.TextMultipleController = new TextMultipleController({
        el: this.$('[data-kftype="text-multiple"]'),
        model: this.model,
        parentView: this
      })
    }
  }
});
},{"../FieldControlBaseView":31,"fields/controls/text-multiple/TextMultipleController":79}],79:[function(require,module,exports){
var BaseController = require('fields/MultipleControllerBase');
module.exports = BaseController.extend({
  type: 'text-multiple'
});
},{"fields/MultipleControllerBase":36}],80:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    var attributes = this.model.get('attributes');

    this.$input = this.$('.kb-field--text input');
    this.$input.on('change', function () {
      that.update(that.$input.val());
    });

    if (attributes && attributes.maxlength) {
      this.$count = jQuery("<span class='charcount kb-field--bubble'></span>").insertAfter(this.$input);
      this.$input.on('keyup change', function () {
        that.charcount(that.$input.val(), that.$count, attributes.maxlength);
      }).trigger('keyup');

    }
  },
  derender: function () {
    this.$input.off();
    if (this.$count) {
      this.$count.off().remove();
    }

  },
  update: function (val) {
    this.model.set('value', val);
  },
  toString: function () {
    return this.$input.val();
  },
  charcount: function (content, $charlimit, limit) {
    var max = limit;
    var len = content.length;
    var charCount = max - len;
    $charlimit.html(charCount + " chars left");
  }
});
},{"../FieldControlBaseView":31}],81:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    var attributes = this.model.get('attributes');
    this.$textarea = this.$('textarea');
    this.$textarea.on('change', function () {
      that.update(that.$textarea.val());
    });

    if (attributes && attributes.maxlength) {
      this.$count = jQuery("<span class='charcount kb-field--bubble'></span>").insertAfter(this.$textarea);
      this.$textarea.on('keyup change', function () {
        that.charcount(that.$textarea.val(), that.$count, attributes.maxlength);
      }).trigger('keyup');

    }

  },
  derender: function () {
    this.$textarea.off();

    if (this.$count){
      this.$count.off().remove();
    }
  },
  update: function (val) {
    this.model.set('value', val);
  },
  toString: function () {
    return this.$textarea.val();
  },
    charcount: function (content, $charlimit, limit) {
      var max = limit;
      var len = content.length;
      var charCount = max - len;
      $charlimit.html(charCount + " chars left");
    }
});
},{"../FieldControlBaseView":31}],82:[function(require,module,exports){
module.exports =
{
  fields: {},
  register: function (obj) {
    var id = obj.prototype.type;
    this.fields[id] = obj;
  },
  get: function (field) {
    return new this.fields[field.model.get('type')]({model: new Backbone.Model(field.model.toJSON())});
  },
  getRefByType: function(type, data){
    return new this.fields[type]({model: new Backbone.Model(data)});
  }
};
},{}],83:[function(require,module,exports){
require('fieldsAPI/hbsHelpers');
var Collection = require('fieldsAPI/FieldsAPICollection');
KB.FieldsAPI = Collection;
KB.FieldsAPI.register(require('fieldsAPI/definitions/editor'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/image'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/link'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/text'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/file'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/file-multiple'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/select'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/checkbox'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/text-multiple'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/date-multiple'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/textarea'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/medium'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/color'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/oembed'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/datetime'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/radioset'));


},{"fieldsAPI/FieldsAPICollection":82,"fieldsAPI/definitions/checkbox":85,"fieldsAPI/definitions/color":86,"fieldsAPI/definitions/date-multiple":87,"fieldsAPI/definitions/datetime":88,"fieldsAPI/definitions/editor":89,"fieldsAPI/definitions/file":91,"fieldsAPI/definitions/file-multiple":90,"fieldsAPI/definitions/image":92,"fieldsAPI/definitions/link":93,"fieldsAPI/definitions/medium":94,"fieldsAPI/definitions/oembed":95,"fieldsAPI/definitions/radioset":96,"fieldsAPI/definitions/select":97,"fieldsAPI/definitions/text":99,"fieldsAPI/definitions/text-multiple":98,"fieldsAPI/definitions/textarea":100,"fieldsAPI/hbsHelpers":101}],84:[function(require,module,exports){
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-dyn-field',
  initialize: function () {
    this.defaults = this.getDefaults() || {};
    this.extendModel();
  },
  getDefaults: function(){
    return '';
  },
  setDefaults: function () {
    this.setValue(this.getDefaults());
  },
  setValue: function (val) {
    this.model.set('value', val);
  },
  derender: function () {
    this.model.destroy();
    this.stopListening();
    this.remove();
  },
  prepareBaseId: function () {
    if (!_.isEmpty(this.model.get('arrayKey'))) {
      return this.model.get('fieldId') + '[' + this.model.get('arrayKey') + ']' + '[' + this.model.get('fieldkey') + ']';
    } else {
      return this.model.get('fieldId') + '[' + this.model.get('fieldkey') + ']';
    }
  },
  extendModel: function () {
    this.model.set('baseId', this.prepareBaseId());
    this.model.set('uid', this.kbfuid());
    this.model.set('kpath', this.prepareKpath());
  },
  prepareKpath: function () {
    var concat = [];
    if (this.model.get('arrayKey')) {
      concat.push(this.model.get('arrayKey'));
    }

    if (this.model.get('fieldkey')) {
      concat.push(this.model.get('fieldkey'));
    }

    if (this.model.get('index')) {
      concat.push(this.model.get('index'));
    }

    if (this.model.get('primeKey')) {
      concat.push(this.model.get('primeKey'));
    }

    return concat.join('.');
  },
  kbfuid: function () {
    var index = this.model.get('index') || '';
    return index + this.model.get('fieldId') + this.model.get('primeKey') + this.model.get('type');
  }
});
},{}],85:[function(require,module,exports){
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Checkbox',
  template: require('templates/fields/Checkbox.hbs'),
  type: 'checkbox',
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  }
});





},{"fieldsAPI/definitions/baseView":84,"templates/fields/Checkbox.hbs":174}],86:[function(require,module,exports){
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Color',
  template: require('templates/fields/Color.hbs'),
  type: 'color',
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  },
  getDefaults: function () {
    return ''
  }
});





},{"fieldsAPI/definitions/baseView":84,"templates/fields/Color.hbs":175}],87:[function(require,module,exports){
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/DateMultiple',
  template: require('templates/fields/DateMultiple.hbs'),
  type: 'date-multiple',
  render: function () {
    var el = this.template({
      model: this.model.toJSON()
    });
    this.setElement(el);
    return this.$el;
  },
  postRender: function(){
    var that = this;
    this.defaults = {
      format: 'd.m.Y H:i',
      inline: false,
      mask: true,
      lang: 'de',
      allowBlank: true,
      onChangeDateTime: function (current, $input) {
        that.$unixIn.val(current.dateFormat('unixtime'));
        that.$sqlIn.val(current.dateFormat('Y-m-d H:i:s'));
      }
    };
    this.settings = this.model.get('settings') || {};
    this.$unixIn = this.$('.kb-datetimepicker--js-unix');
    this.$sqlIn = this.$('.kb-datetimepicker--js-sql');
    this.$('.kb-datetimepicker').datetimepicker(_.extend(this.defaults, this.settings));
  }
  
});





},{"fieldsAPI/definitions/baseView":84,"templates/fields/DateMultiple.hbs":176}],88:[function(require,module,exports){
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/DateTime',
  template: require('templates/fields/Datetime.hbs'),
  type: 'datetime',
  render: function () {
    var el = this.template({
      model: this.model.toJSON()
    });
    this.setElement(el);
    return this.$el;
  },
  postRender: function(){
    var that = this;
    this.defaults = {
      format: 'd.m.Y H:i',
      inline: false,
      mask: true,
      lang: 'de',
      allowBlank: true,
      onChangeDateTime: function (current, $input) {
        that.$unixIn.val(current.dateFormat('unixtime'));
        that.$sqlIn.val(current.dateFormat('Y-m-d H:i:s'));
      }
    };
    this.settings = this.model.get('settings') || {};
    this.$unixIn = this.$('.kb-datetimepicker--js-unix');
    this.$sqlIn = this.$('.kb-datetimepicker--js-sql');
    this.$('.kb-datetimepicker').datetimepicker(_.extend(this.defaults, this.settings));
  }
  
});





},{"fieldsAPI/definitions/baseView":84,"templates/fields/Datetime.hbs":177}],89:[function(require,module,exports){
var TinyMCE = require('common/TinyMCE');
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  $editorWrap: null,
  templatePath: 'fields/Editor',
  template: require('templates/fields/Editor.hbs'),
  type: 'editor',
  initialize: function (config) {
    BaseView.prototype.initialize.call(this, config);
  },
  setValue: function (value) {
    this.model.set('value', value);
  },
  render: function (index) {
    this.index = index;
    return this.template({
      config: this.config,
      baseId: this.baseId,
      index: index,
      model: this.model.toJSON()
    });
  },
  postRender: function () {
    var open;
    var that = this;
    var name = this.model.get('baseId') + '[' + this.model.get('index') + ']' + '[' + this.model.get('primeKey') + ']';
    var edId = this.model.get('fieldId') + '_' + this.model.get('key') + '_editor_' + this.model.get('index');
    this.$editorWrap = jQuery('.kb-ff-editor-wrapper-' + this.model.get('index') + '-' + this.model.get('key'), this.$el);

    try {
      open = this.fieldModel.getEntityModel().View.isOpen();
      if (open) {
        TinyMCE.remoteGetEditor(this.$editorWrap, name, edId, this.model.get('value'), null, this.model.get('media'));
      } else {
        this.listenToOnce(this.fieldModel.getEntityModel(), 'kb.module.view.open', function () {
          TinyMCE.remoteGetEditor(this.$editorWrap, name, edId, that.model.get('value'), null, that.model.get('media'));
        })
      }
    } catch (e) {
      TinyMCE.remoteGetEditor(this.$editorWrap, name, edId, this.model.get('value'), null, this.model.get('media'));
    }

  }
});
},{"common/TinyMCE":28,"fieldsAPI/definitions/baseView":84,"templates/fields/Editor.hbs":178}],90:[function(require,module,exports){
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/FileMultiple',
  template: require('templates/fields/FileMultiple.hbs'),
  type: 'file-multiple',
  className: 'kb-dyn-file-field',
  render: function () {
    this.$el.append(this.template({
      model: this.model.toJSON(),
      i18n: _.extend(KB.i18n.Refields.file, KB.i18n.Refields.common)
    }));
    return this.$el;
  },
  events: {
    'click .kb-js-add-file': 'openFrame',
    'click .kb-js-reset-file': 'reset'
  },
  postRender: function () {
    var value = this.model.get('value');
    var queryargs = {};
    var that = this;
    this.$container = this.$('.kb-field-file-wrapper');
    this.$IdIn = this.$('.kb-file-attachment-id'); // hidden input
    this.$resetIn = this.$('.kb-js-reset-file'); // reset button

    if (!_.isEmpty(this.model.get('value').id)) {
      queryargs.post__in = [this.model.get('value').id];
      wp.media.query(queryargs) // set the query
        .more() // execute the query, this will return an deferred object
        .done(function () { // attach callback, executes after the ajax call succeeded
          var attachment = this.first();
          if (attachment) {
            attachment.set('attachment_id', attachment.get('id'));
            that.handleAttachment(attachment);
          }
        });
    }
  },
  derender: function () {
    if (this.frame) {
      this.frame.dispose();
      this.frame = null;
    }
  },
  openFrame: function () {
    var that = this;
    if (this.frame) {
      return this.frame.open();
    }

    var frameoptions = {
      title: KB.i18n.Refields.file.modalTitle,
      button: {
        text: KB.i18n.Refields.common.select
      },
      multiple: false,
      library: {
        type: ''
      }
    };

    if (that.model.get('uploadedTo') === true) {
      frameoptions.library.uploadedTo = KB.Environment.postId || 0
    }

    this.frame = wp.media(frameoptions);
    this.frame.on('ready', function () {
      that.ready(this);
    });
    this.frame.state('library').on('select', function () {
      that.select(this);
    });
    return this.frame.open();
  },
  ready: function (frame) {
    var that = this;
    this.$('.media-modal').addClass(' smaller no-sidebar');
    var settings = that.model.get('settings');
    if (settings && settings.uploadFolder) {
      that.frame.uploader.options.uploader.params.upload_folder = settings.uploadFolder;
    }
  },
  select: function (frame) {
    var attachment = frame.get('selection').first();
    this.handleAttachment(attachment);
  },
  handleAttachment: function (attachment) {
    this.$('.kb-file-filename', this.$container).html(attachment.get('filename'));
    this.$('.kb-file-attachment-id', this.$container).val(attachment.get('id'));
    this.$('.kb-file-title', this.$container).html(attachment.get('title'));
    this.$('.kb-file-id', this.$container).html(attachment.get('id'));
    this.$('.kb-file-editLink', this.$container).attr('href', attachment.get('editLink'));
    this.$resetIn.show();
    this.$container.show(450, function () {
      KB.Events.trigger('modal.recalibrate');
    });
  },
  reset: function () {
    this.$IdIn.val('');
    this.$container.hide(450);
    this.$resetIn.hide();
  }
});





},{"fieldsAPI/definitions/baseView":84,"templates/fields/FileMultiple.hbs":180}],91:[function(require,module,exports){
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/File',
  template: require('templates/fields/File.hbs'),
  type: 'file',
  render: function () {
    return this.template({
      model: this.model.toJSON(),
      i18n: _.extend(KB.i18n.Refields.file, KB.i18n.Refields.common)
    });
  },
  postRender: function () {
    var value = this.model.get('value');
    var queryargs = {};
    var that = this;
    if (!_.isEmpty(this.model.get('value').id )) {
      queryargs.post__in = [this.model.get('value').id];
      wp.media.query(queryargs) // set the query
        .more() // execute the query, this will return an deferred object
        .done(function () { // attach callback, executes after the ajax call succeeded
          var attachment = this.first();
          if (attachment) {
            attachment.set('attachment_id', attachment.get('id'));
            if (that.fieldModel && that.fieldModel.FieldControlView) {
              that.fieldModel.FieldControlView.handleAttachment(attachment);
            }
          }
        });
    }
  }
});





},{"fieldsAPI/definitions/baseView":84,"templates/fields/File.hbs":179}],92:[function(require,module,exports){
//var Field = require('fields/controls/image');
var BaseView = require('fieldsAPI/definitions/baseView');
var Utilities = require('common/Utilities');
var Config = require('common/Config');
module.exports = BaseView.extend({
  $currentWrapper: null,
  $currentFrame: null,
  templatePath: 'fields/Image',
  template: require('templates/fields/Image.hbs'),
  type: 'image',
  render: function (index) {
    return this.template({
      model: this.model.toJSON(),
      i18n: _.extend(KB.i18n.Refields.image, KB.i18n.Refields.common)
    });
  },
  postRender: function () {
    var value = this.model.get('value');
    var queryargs = {};
    var that = this;
    var id = this.model.get('value').id;
    if (typeof id === 'number'){
      id = id.toString();
    }
    if (id) {
      queryargs.post__in = [this.model.get('value').id];
      var query = wp.media.query(queryargs) // set the query
        .more() // execute the query, this will return an deferred object
        .done(function () { // attach callback, executes after the ajax call succeeded
          var attachment = this.first();
          if (attachment) {
            attachment.set('attachment_id', attachment.get('id'));
            if (that.fieldModel && that.fieldModel.FieldControlView) {
              that.fieldModel.FieldControlView.handleAttachment(attachment);
            }
          }
        });
    }
  }
});
},{"common/Config":22,"common/Utilities":30,"fieldsAPI/definitions/baseView":84,"templates/fields/Image.hbs":186}],93:[function(require,module,exports){
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Link',
  template: require('templates/fields/Link.hbs'),
  type: 'link',
  render: function () {
    return this.template({
      i18n: _.extend(KB.i18n.Refields.link, KB.i18n.Refields.common),
      model: this.model.toJSON()
    });
  },
  getDefaults: function(){
    return {
      link: '',
      linktext: '',
      linktitle: ''
    }
  }
});
},{"fieldsAPI/definitions/baseView":84,"templates/fields/Link.hbs":187}],94:[function(require,module,exports){
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Medium',
  template: require('templates/fields/Medium.hbs'),
  type: 'medium',
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  },
  postRender: function(){

  },
  getDefaults: function(){
    return '';
  }
});





},{"fieldsAPI/definitions/baseView":84,"templates/fields/Medium.hbs":188}],95:[function(require,module,exports){
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Oembed',
  template: require('templates/fields/Oembed.hbs'),
  type: 'oembed',
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  },
  getDefaults: function () {
    return '';
  }
});





},{"fieldsAPI/definitions/baseView":84,"templates/fields/Oembed.hbs":189}],96:[function(require,module,exports){
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Radioset',
  template: require('templates/fields/Radioset.hbs'),
  type: 'radioset',
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  }
});





},{"fieldsAPI/definitions/baseView":84,"templates/fields/Radioset.hbs":190}],97:[function(require,module,exports){
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Text',
  template: require('templates/fields/Select.hbs'),
  type: 'select',
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  }
});





},{"fieldsAPI/definitions/baseView":84,"templates/fields/Select.hbs":191}],98:[function(require,module,exports){
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/TextMultiple',
  template: require('templates/fields/TextMultiple.hbs'),
  type: 'text-multiple',
  render: function () {
    var el = this.template({
      model: this.model.toJSON()
    });
    this.setElement(el);
    return this.$el;
  }
  
});





},{"fieldsAPI/definitions/baseView":84,"templates/fields/TextMultiple.hbs":193}],99:[function(require,module,exports){
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Text',
  template: require('templates/fields/Text.hbs'),
  type: 'text',
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  },
  getDefaults: function(){
    return '';
  },
  charcount: function (content, $charlimit, limit) {
    var max = limit;
    var len = content.length;
    var charCount = max - len;
    $charlimit.html(charCount + " chars left");
  }
});





},{"fieldsAPI/definitions/baseView":84,"templates/fields/Text.hbs":192}],100:[function(require,module,exports){
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  type: 'textarea',
  templatePath: 'fields/Textarea',
  template: require('templates/fields/Textarea.hbs'),
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  },
  getDefaults: function(){
    return '';
  }
});
},{"fieldsAPI/definitions/baseView":84,"templates/fields/Textarea.hbs":194}],101:[function(require,module,exports){
var Handlebars = require("hbsfy/runtime");
Handlebars.registerHelper("debug", function (optionalValue) {
  console.log("Current Context");
  console.log("====================");
  console.log(this);
  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    console.log(optionalValue);
  }
});

Handlebars.registerHelper("fieldName", function (base, index, key) {
  return base + "[" + index + "][" + key + "]";
});

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

  switch (operator) {
    case '==':
      return (v1 == v2) ? options.fn(this) : options.inverse(this);
    case '===':
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
    case '<':
      return (v1 < v2) ? options.fn(this) : options.inverse(this);
    case '<=':
      return (v1 <= v2) ? options.fn(this) : options.inverse(this);
    case '>':
      return (v1 > v2) ? options.fn(this) : options.inverse(this);
    case '>=':
      return (v1 >= v2) ? options.fn(this) : options.inverse(this);
    case '&&':
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
    case '||':
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

Handlebars.registerHelper('trimString', function(passedString, length) {
  length = length || 50;
  var overlength = passedString.length > length;
  var theString = passedString.substring(0,length);

  if (overlength){
    theString = theString + '…';
  }

  return new Handlebars.SafeString(theString)
});
},{"hbsfy/runtime":256}],102:[function(require,module,exports){
var Utilities = require('common/Utilities');
var Config = require('common/Config');
module.exports = {
  _active: false,
  init: function () {
    var that = this;
    jQuery('#wpadminbar').on('click', 'li.kb-edit-switch a', function (e) {
      e.preventDefault();
    });
    var lsShow =Utilities.stex.get('kb.showcontrols');
    if (lsShow || Config.get('editAlwaysOn')){
      var $a = jQuery('.kb-edit-switch a');
      this.control($a);
    }

    var enterCounter = 0;

    jQuery(window).keydown(function(e) {
      var key = e.which;
      if(key === 17) { // the enter key code
        if (++enterCounter >= 3){
          that.control();
          enterCounter = 0;
        }
        setTimeout(function(){enterCounter = 0;}, 1000);
      }
    });

    // Heartbeat send data
    jQuery(document).on('heartbeat-send', function (e, data) {
      var id = KB.appData.config.post.ID
      data.kbEditWatcher = id; // actual user
    });

  },
  control: function (caller) {
    this._active = !this._active;
    jQuery(caller).parent('li').toggleClass('kb-edit-on');
    jQuery('body').toggleClass('kb-editcontrols-show');
    Utilities.stex.set('kb.showcontrols', this._active, 1000*60*24);
    KB.Events.trigger('reposition');
    KB.Events.trigger('content.change');

    if (this._active){
      KB.Events.trigger('editcontrols.show');
    } else{
      KB.Events.trigger('editcontrols.hide');
    }
  },
  isActive: function(){
    return this._active;
  }
};

},{"common/Config":22,"common/Utilities":30}],103:[function(require,module,exports){
var FieldControlModelModal = require('fields/FieldControlModelModal');
module.exports = Backbone.Collection.extend({
  model: FieldControlModelModal
});
},{"fields/FieldControlModelModal":33}],104:[function(require,module,exports){
module.exports = Backbone.Collection.extend({

  filterByAttr: function(attr, value){
    return this.filter(function(module){
      return (module.get(attr) === value);
    }, this);
  }

});
},{}],105:[function(require,module,exports){
var KB = window.KB || {};
KB.Events = {};
_.extend(KB, Backbone.Events);
_.extend(KB.Events, Backbone.Events);

KB.currentModule = {};
KB.currentArea = {};
if (typeof global == 'undefined') { global = window }


// requires
var ViewsCollection = require('shared/ViewsCollection');
var EditModalModules = require('frontend/Views/EditModalModules');
var SidebarView = require('frontend/Views/Sidebar');
var FieldConfigsCollection = require('fields/FieldControlsCollection');
var Payload = require('common/Payload');
var ModuleCollection = require('frontend/Collections/ModuleCollection');
var ObjectProxy = require('shared/Collections/ObjectProxyCollection');
var ModuleModel = require('frontend/Models/ModuleModel');
var ModuleView = require('./Views/ModuleView');

var AreaModel = require('frontend/Models/AreaModel');
var PanelModel = require('frontend/Models/PanelModel');
var PanelView = require('./Views/PanelView');

var Ui = require('common/UI');
var Logger = require('common/Logger');
var ChangeObserver = require('shared/ChangeObserver');
var Tether = require('tether');
var AdminBar = require('frontend/AdminBar');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Refields = require('fields/RefieldsController');
var FieldsAPI = require('fieldsAPI/FieldsAPIController');


/*
 Preperations
 */

/*
 * Views, not a Backbone collection
 * simple getter/setter access point to views
 */
KB.Views = {
  Modules: new ViewsCollection(),
  Areas: new ViewsCollection(),
  Context: new ViewsCollection(),
  Panels: new ViewsCollection()
};


/*
 * Modules model collection
 * Get by 'mid'
 */
KB.Modules = new ModuleCollection([], {
  model: ModuleModel
});

/*
 * Area models collection
 * Get by 'id'
 */
KB.Areas = new Backbone.Collection([], {
  model: AreaModel
});

/*
 * Panel models collection
 * Get by 'id'
 */
KB.Panels = new Backbone.Collection([], {
  model: PanelModel
});

/*
 * Models proxy
 * this provides an central access point to objects
 */
KB.ObjectProxy = new ObjectProxy([]);

/*
 * Init function
 * Register event listeners
 * Create Views for areas and modules
 * None of this functions is meant to be used directly
 * from outside the function itself.
 * Use events on the backbone items instead
 * handle UI specific actions
 */
KB.App = function () {

  /*
   Frontend bootstrap
   called on jquery.ready
   */
  function init() {
    if (!Config.get('initFrontend')) {
      return;
    }

    jQuery('body').addClass('wordpress-' + Config.get('wpVersion'));


    // create Sidebar singleton
    if (KB.appData.config.useModuleNav && Checks.userCan('edit_kontentblocks')) {
      KB.Sidebar = new SidebarView();
    }


    // make Tether globally available
    window.Tether = Tether;


    require('./InlineSetup');
    require('./GlobalEvents');

    // init the edit modal
    KB.EditModalModules = new EditModalModules({});

    // change observer handles model data changes UI
    KB.ChangeObserver = new ChangeObserver();

    // Register events on collections
    KB.Modules.on('add', createModuleViews);
    KB.Modules.on('remove', removeModule);
    KB.Areas.on('add', createAreaViews);
    KB.Panels.on('add', createPanelViews);

    // Create views
    addViews();

    /*
     * payload.Fields collection
     */
    KB.FieldControls = new FieldConfigsCollection();
    KB.FieldControls.add(_.toArray(Payload.getPayload('Fields')));
    // get the UI on track
    Ui.init();

  }

  //function shutdown() {
  //  _.each(KB.Modules.toArray(), function (item) {
  //    KB.Modules.remove(item);
  //  });
  //
  //  jQuery('.editable').each(function (i, el) {
  //    tinymce.remove('#' + el.id);
  //  });
  //
  //}

  /**
   * Iterate through raw areas as they were
   * output by toJSON() method on each area upon
   * server side page creation
   *
   * Modules are taken from the raw areas and
   * collected seperatly in their own collection
   *
   * View generation is handled by the 'add' event callback
   * as registered above
   * @returns mixed
   */
  function addViews() {

    if (KB.appData.config.preview) {
      return false;
    }


    // iterate over raw areas
    _.each(Payload.getPayload('Areas'), function (area) {
      // create new area model
      // automatically creates corresponding view
      KB.ObjectProxy.add(KB.Areas.add(area));
    });

    // create models from already attached modules
    // automatically creates corresponding view

    _.each(Payload.getPayload('Modules'), function (module) {
      KB.ObjectProxy.add(KB.Modules.add(module));
    });

    //create models from already attached modules
    // automatically creates corresponding view

    _.each(Payload.getPayload('Panels'), function (panel) {
      KB.ObjectProxy.add(KB.Panels.add(panel));
    });

    // new event
    KB.Events.trigger('frontend.init');
  }


  /**
   * Create views for modules and add them
   * to the custom collection
   * runs as callback for 'add' event on collection
   * @param ModuleModel Backbone Model
   * @returnes void
   */
  function createModuleViews(ModuleModel) {
    KB.Views.Modules.add(ModuleModel.get('mid'), new ModuleView({
      model: ModuleModel,
      el: '#' + ModuleModel.get('mid')
    }));
    Ui.initTabs();
  }

  /**
   * Create views for panels and add them
   * to the custom collection
   * runs as callback for 'add' event on collection
   * @param PanelModel Backbone Model
   * @returns void
   */
  function createPanelViews(PanelModel) {
    var Panel = KB.Views.Panels.add(PanelModel.get('settings').uid, new PanelView({
      model: PanelModel,
      el: 'body'
    }));
  }


  /**
   * Create views for areas and add them
   * to the custom collection
   * runs as callback for 'add' event on collection
   * @param AreaModel Backbone Model
   * @returns void
   */
  function createAreaViews(AreaModel) {
    var AreaView = require('./Views/AreaView');
    var LayoutAreaView = require('./Views/LayoutAreaView');

    if (AreaModel.get('layoutArea')) {
      KB.Views.Areas.add(AreaModel.get('id'), new LayoutAreaView({
        model: AreaModel,
        el: '#' + AreaModel.get('id')
      }));
    } else {
      KB.Views.Areas.add(AreaModel.get('id'), new AreaView({
        model: AreaModel,
        el: '#' + AreaModel.get('id')
      }));
    }


  }

  /**
   * Removes a view from the collection.
   * The collection will destroy corresponding views
   * callback for 'remove' on collection
   * @param ModuleModel Backbone Model
   * @returns void
   */
  function removeModule(ModuleModel) {
    ModuleModel.dispose();
    KB.Views.Modules.remove(ModuleModel.get('mid'));
    KB.Events.trigger('content.change');
  }

  return {
    init: init
  };

}(jQuery);


jQuery(document).ready(function () {
// get started
  KB.App.init();

  var $body = jQuery('body');

  if (KB.appData && KB.appData.config.frontend) {
    KB.Views.Modules.readyOnFront();
    Logger.User.info('Frontend welcomes you');
    $body.addClass('kontentblocks-ready');
    KB.Events.trigger('content.change');

  }

  jQuery(window).on('scroll resize', function () {
    KB.Events.trigger('window.change');
  });

  // force user cookie to tinymce
  // wp native js function
  setUserSetting('editor', 'tinymce');

  // @TODO remove
  $body.on('click', '.kb-fx-button', function (e) {
    jQuery(this).addClass('kb-fx-button--click');
    jQuery(e.currentTarget).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
      e.currentTarget.classList.remove('kb-fx-button--click');
    });
  });

  KB.App.adminBar = AdminBar;
  KB.App.adminBar.init();

});

},{"./GlobalEvents":106,"./InlineSetup":115,"./Views/AreaView":120,"./Views/LayoutAreaView":123,"./Views/ModuleView":132,"./Views/PanelView":133,"common/Checks":21,"common/Config":22,"common/Logger":24,"common/Payload":26,"common/UI":29,"fields/FieldControlsCollection":34,"fields/RefieldsController":37,"fieldsAPI/FieldsAPIController":83,"frontend/AdminBar":102,"frontend/Collections/ModuleCollection":104,"frontend/Models/AreaModel":116,"frontend/Models/ModuleModel":117,"frontend/Models/PanelModel":118,"frontend/Views/EditModalModules":122,"frontend/Views/Sidebar":134,"shared/ChangeObserver":147,"shared/Collections/ObjectProxyCollection":148,"shared/ViewsCollection":160,"tether":257}],106:[function(require,module,exports){
var Logger = require('common/Logger');
KB.Events.on('module.before.sync panel.before.sync', function(Model){
  if (window.tinymce){
    window.tinymce.triggerSave();
    Logger.Debug.info('tinymce.triggerSave called');
  }
});

var reposition = _.debounce(window.Tether.position, 25);
KB.Events.on('content.change', function(){
  reposition();
});

jQuery('body').on('webkitTransitionEnd moztransitionend transitionend oTransitionEnd', function () {
  KB.Events.trigger('content.change');
});
},{"common/Logger":24}],107:[function(require,module,exports){
//KB.Backbone.Inline.EditableImage
var Config = require('common/Config');
var Utilities = require('common/Utilities');
var ModuleControl = require('frontend/Inline/controls/EditImage');
var UpdateControl = require('frontend/Inline/controls/InlineUpdate');
var Toolbar = require('frontend/Inline/InlineToolbar');

var EditableImage = Backbone.View.extend({
  initialize: function () {
    this.mode = this.model.get('mode');
    this.defaultState = this.model.get('state') || 'replace-image';
    this.parentView = this.model.get('ModuleModel').View;
    this.listenTo(this.model, 'field.model.settings', this.setMode);
    this.listenToOnce(this.model.get('ModuleModel'), 'module.create', this.showPlaceholder);
    this.listenTo(KB.Events, 'editcontrols.show', this.showPlaceholder);
    this.listenTo(KB.Events, 'editcontrols.hide', this.removePlaceholder);

    this.Toolbar = new Toolbar({
      FieldControlView: this,
      model: this.model,
      controls: [
        new ModuleControl({
          model: this.model,
          parent: this
        }),
        new UpdateControl({
          model: this.model,
          parent: this
        })
      ]
    });
    this.render();
  },
  showPlaceholder: function(){
    if (this.hasData()){
      return false;
    }
    this.$el.on('load', function(){
      KB.Events.trigger('content.change reposition');
    });
    var url = 'https://unsplash.it/g/' + this.model.get('width') + '/' + this.model.get('height') + '?random';
    if (this.mode === 'simple') {
      this.$el.attr('src', url);
    } else if (this.mode === 'background') {
      this.$el.css('backgroundImage', "url('"+ url +"')");
    }
  },
  removePlaceholder: function(){
    if (this.hasData()){
      return false;
    }
    if (this.mode === 'simple') {
      this.$el.attr('src', '');
    } else if (this.mode === 'background') {
      this.$el.css('backgroundImage', "url('')");
    }
  },
  hasData: function(){
    return _.isNumber(parseInt(this.model.get('value').id,10));
  },
  setMode: function(settings){
    this.model.set('mode', settings.mode);
    this.mode = settings.mode;
  },
  render: function () {
    this.delegateEvents();
    this.$el.addClass('kb-inline-imageedit-attached');
    this.$caption = jQuery('*[data-' + this.model.get('uid') + '-caption]');
    this.$title = jQuery('*[data-' + this.model.get('uid') + '-title]');
  },
  rerender: function () {
    var that = this;
    this.render();
    this.trigger('field.view.rerender', this);
  },
  gone: function () {
    this.trigger('field.view.gone', this);
    this.Toolbar.hide();
  },
  derender: function () {
    if (this.frame) {
      this.frame.dispose();
      this.frame = null;
    }
    this.$el.off();
    this.trigger('field.view.derender', this);
  },
  openFrame: function () {
    var that = this;
    if (this.frame) {
      this.frame.dispose();
    }

    // we only want to query "our" image attachment
    // value of post__in must be an array
    var queryargs = {post__in: [this.model.get('value').id]};
    wp.media.query(queryargs) // set the query
      .more() // execute the query, this will return an deferred object
      .done(function () { // attach callback, executes after the ajax call succeeded
        // inside the callback 'this' refers to the result collection
        // there should be only one model, assign it to a var
        var attachment = that.attachment = this.first();

        // this is a bit odd: if you want to access the 'sizes' in the modal
        // and if you need access to the image editor / replace image function
        // attachment_id must be set.
        // see media-models.js, Line ~370 / PostImage
        that.attachment.set('attachment_id', attachment.get('id'));
        // create a frame, bind 'update' callback and open in one step
        that.frame = wp.media({
          frame: 'select', // alias for the ImageDetails frame
          state: 'library', // default state, makes sense
          metadata: attachment.toJSON(), // the important bit, thats where the initial informations come from
          imageEditView: that,
          library: {
            type: 'image'
          }
        }).on('update', function (attachmentObj) { // bind callback to 'update'
          that.update(attachmentObj);
        }).on('ready', function () {
          that.ready();
        }).on('replace', function () {
          that.replace(that.frame.image.attachment);
        }).on('select', function () {
          var attachment = this.get('library').get('selection').first();
          that.replace(attachment);
        }).open();
      });

    //this.frame.state('library').on('select', this.select);
    //return this.frame.open();
  }
  ,
  ready: function () {
    jQuery('.media-modal').addClass('smaller kb-image-frame');
  }
  ,
  replace: function (attachment) {
    this.attachment = attachment;
    this.handleAttachment(attachment);
  }
  ,
  update: function (attachmentObj) {
    this.attachment.set(attachmentObj);
    this.attachment.sync('update', this.attachment);
    if (this.$caption.length > 0) {
      this.$caption.html(this.attachment.get('caption'));
    }
  }
  ,
  handleAttachment: function (attachment, suppress) {
    var that = this;
    var id = attachment.get('id');

    var value = this.prepareValue(attachment);
    this.model.attachment = attachment;
    this.model.set('value', value);
    KB.Events.trigger('modal.refresh');
    that.model.trigger('field.model.dirty', that.model);
    var args = {
      width: that.model.get('width'),
      height: that.model.get('height'),
      crop: that.model.get('crop'),
      upscale: that.model.get('upscale')
    };

    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'fieldGetImage',
        args: args,
        id: id,
        _ajax_nonce: Config.getNonce('read')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        if (that.mode === 'simple') {
          that.$el.attr('src', res.data.src);
        } else if (that.mode === 'background') {
          that.$el.css('backgroundImage', "url('" + res.data.src + "')");
        }
        that.delegateEvents();
        if (!suppress) {
          that.model.trigger('external.change', that.model);
        }

        if (that.$caption.length > 0){
          that.$caption.html(attachment.get('caption'));
        }
        if (that.$title.length > 0){
          that.$title.html(attachment.get('title'));
        }
        KB.Events.trigger('content.change');

      },
      error: function () {

      }
    });
  }
  ,
  prepareValue: function (attachment) {
    return {
      id: attachment.get('id'),
      title: attachment.get('title'),
      caption: attachment.get('caption')
    };
  }
  ,
  synchronize: function (model) {
    this.handleAttachment(model.attachment, true);
  }
});


//// we only want to query "our" image attachment
//// value of post__in must be an array
//var queryargs = {post__in: [this.model.get('id')]};
//
//wp.media.query(queryargs) // set the query
//  .more() // execute the query, this will return an deferred object
//  .done(function () { // attach callback, executes after the ajax call succeeded
//
//    // inside the callback 'this' refers to the result collection
//    // there should be only one model, assign it to a var
//    var attachment = that.attachment = this.first();
//
//    // this is a bit odd: if you want to access the 'sizes' in the modal
//    // and if you need access to the image editor / replace image function
//    // attachment_id must be set.
//    // see media-models.js, Line ~370 / PostImage
//    that.attachment.set('attachment_id', attachment.get('id'));
//
//    // create a frame, bind 'update' callback and open in one step
//    that.frame = wp.media({
//      frame: 'image', // alias for the ImageDetails frame
//      state: 'image-details', // default state, makes sense
//      metadata: attachment.toJSON(), // the important bit, thats where the initial informations come from
//      imageEditView: that
//    }).on('update', function (attachmentObj) { // bind callback to 'update'
//      that.update(attachmentObj);
//    }).on('ready', function () {
//      that.ready();
//    }).on('replace', function () {
//      that.replace(that.frame.image.attachment);
//    }).on('select', function () {
//      //alert('select');
//      //that.select();
//    }).open();
//  });

KB.Fields.registerObject('EditableImage', EditableImage);
module.exports = EditableImage;
},{"common/Config":22,"common/Utilities":30,"frontend/Inline/InlineToolbar":110,"frontend/Inline/controls/EditImage":111,"frontend/Inline/controls/InlineUpdate":114}],108:[function(require,module,exports){
//KB.Backbone.Inline.EditableImage
var Config = require('common/Config');
var Utilities = require('common/Utilities');
var ModuleControl = require('frontend/Inline/controls/EditLink');
var UpdateControl = require('frontend/Inline/controls/InlineUpdate');
var Toolbar = require('frontend/Inline/InlineToolbar');
var EditableLink = Backbone.View.extend({
  initialize: function () {
    this.parentView = this.model.get('ModuleModel').View;
    this.setupDefaults();
    this.Toolbar = new Toolbar({
      FieldControlView: this,
      model: this.model,
      controls: [
        new ModuleControl({
          model: this.model,
          parent: this
        }),
        new UpdateControl({
          model: this.model,
          parent: this
        })
      ],
      tether: {
        offset: '0 -20px'
      }
    });
    this.render();
  },
  render: function () {
    this.Toolbar.show();
    this.delegateEvents();
    this.$caption = jQuery('*[data-' + this.model.get('uid') + '-caption]');
  },
  rerender: function () {
    this.render();
    this.trigger('field.view.rerender', this);
  },
  derender: function () {
    this.$el.off();
    this.trigger('field.view.derender', this);
  },
  gone: function () {
    this.trigger('field.view.gone', this);
    this.Toolbar.hide();
  },
  openDialog: function () {
    var that = this;
    window.wpActiveEditor = 'ghosteditor';
    jQuery('#wp-link-wrap').addClass('kb-customized');

    // store the original function
    window.kb_restore_htmlUpdate = wpLink.htmlUpdate;
    window.kb_restore_isMce = wpLink.isMCE;

    wpLink.isMCE = function () {
      return false;
    };


    wpLink.htmlUpdate = function () {
      that.htmlUpdate.call(that);
    };

    wpLink.open();
    jQuery('#wp-link-text').val(this.model.get('value').linktext);
    jQuery('#wp-link-url').val(this.model.get('value').link);

  },
  htmlUpdate: function () {
    var attrs, html, start, end, cursor, href, title,
      textarea = wpLink.textarea, result;

    if (!textarea)
      return;

    // get contents of dialog
    attrs = wpLink.getAttrs();
    title = jQuery('#wp-link-text').val();
    // If there's no href, return.
    if (!attrs.href || attrs.href == 'http://')
      return;
    // Build HTML
    href = attrs.href;

    this.$el.attr('href', href);
    this.$el.text(title);

    var data = {
      link: href,
      linktext: title
    };

    //var kpath = this.model.get('kpath');
    this.model.set('value', data);
    this.model.trigger('field.model.dirty', this.model);
    this.model.trigger('external.change', this.model);

    //restore the original function
    // close dialog and put the cursor inside the textarea
    wpLink.close();
    this.close();
  },
  close: function () {
    // restore the original functions to wpLink
    wpLink.isMCE = window.kb_restore_isMce;
    wpLink.htmlUpdate = window.kb_restore_htmlUpdate;
    KB.Events.trigger('content.change');
  },
  setupDefaults: function () {
    var val = this.model.get('value');
    if (!val || val === '') {
      val = {};
    }
    var sval = _.defaults(val, {
      link: '',
      linktext: ''
    });

    this.model.set('value', sval);
  },
  synchronize: function (model) {
    this.$el.attr('href', model.get('value').link);
    this.$el.html(model.get('value').linktext);
    this.model.trigger('field.model.dirty', this.model);
    KB.Events.trigger('content.change');

  }
});

KB.Fields.registerObject('EditableLink', EditableLink);
module.exports = EditableLink;
},{"common/Config":22,"common/Utilities":30,"frontend/Inline/InlineToolbar":110,"frontend/Inline/controls/EditLink":112,"frontend/Inline/controls/InlineUpdate":114}],109:[function(require,module,exports){
//KB.Backbone.Inline.EditableText
var Utilities = require('common/Utilities');
var Config = require('common/Config');
var ModuleControl = require('frontend/Inline/controls/EditText');
var UpdateControl = require('frontend/Inline/controls/InlineUpdate');
var Toolbar = require('frontend/Inline/InlineToolbar');
var EditableText = Backbone.View.extend({
  initialize: function () {
    this.settings = this.model.get('tinymce');
    this.parentView = this.model.get('ModuleModel').View;
    this.listenToOnce(this.model.get('ModuleModel'), 'remove', this.deactivate);
    this.listenToOnce(this.model.get('ModuleModel'), 'module.create', this.showPlaceholder);
    this.listenTo(KB.Events, 'editcontrols.show', this.showPlaceholder);
    this.listenTo(KB.Events, 'editcontrols.hide', this.removePlaceholder);
    this.listenTo(this, 'kn.inline.synced', this.deactivate);
    this.Toolbar = new Toolbar({
      FieldControlView: this,
      model: this.model,
      controls: [
        new ModuleControl({
          model: this.model,
          parent: this
        }),
        new UpdateControl({
          model: this.model,
          parent: this
        })
      ]
    });
    this.render();
  },
  showPlaceholder: function () {
    this.preValue = this.model.get('value');
    var $isEmpty = _.isEmpty(this.cleanString(this.model.get('value')));
    if ($isEmpty) {
      this.$el.html('<p>Start writing here</p>');
    }
  },
  removePlaceholder: function () {
    var $isEmpty = _.isEmpty(this.cleanString(this.model.get('value')));
    if ($isEmpty) {
      this.$el.html(this.preValue);
    }
  },
  render: function () {
    if (this.el.id) {
      this.id = this.el.id;
    }

    this.Toolbar.show();

  },
  derender: function () {
    this.deactivate();
    this.trigger('field.view.derender', this);
    this.$el.off();
  },
  gone: function () {
    this.trigger('field.view.gone', this);
    this.Toolbar.hide();
  },
  rerender: function () {
    this.render();
    this.trigger('field.view.rerender', this);

  },
  setupEvents: function () {
    var $edEl = $('#' + this.id);
    var that = this;
    KB.Events.trigger('KB::tinymce.new-inline-editor', this.editor);
    this.editor.kfilter = (this.model.get('filter') && this.model.get('filter') === 'content');
    this.editor.module = this.model.get('ModuleModel');
    var con = Utilities.getIndex(this.editor.module.get('entityData'), this.model.get('kpath'));
    if (this.editor.kfilter) {
      this.editor.setContent(switchEditors.wpautop(con));
    }
    this.editor.previousContent = this.editor.getContent();
    this.editor.module.View.$el.addClass('kb-inline-text--active');
    this.editor.subscribe('editableInput', this.handleChange.bind(this));
  },
  handleChange: function () {
    var content = this.editor.getContent();
    if (this.editor.kfilter) {
      content = switchEditors._wp_Nop(this.editor.getContent());
    }
    this.model.set('value', content);
    // this.model.syncContent = this.editor.getContent();
    this.model.trigger('external.change', this.model);
    this.model.trigger('field.model.dirty', this.model);
    KB.Events.trigger('content.change');
    this.editor.isDirty = true;
  },
  retrieveFilteredContent: function (ed, content) {
    var that = this;
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'applyContentFilter',
        content: content,
        postId: ed.module.toJSON().parentObjectId,
        _ajax_nonce: Config.getNonce('read')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        var $edEl = $('#' + that.id).html(res.data.content);
        ed.destroy();
        setTimeout(function () {
          if (window.twttr) {
            window.twttr.widgets.load();
          }
          jQuery(window).off('scroll.kbmce resize.kbmce');
          ed.off('nodeChange ResizeEditor ResizeWindow');
        }, 500);
      },
      error: function () {
      }
    });
  },
  activate: function (e) {
    if (KB.EditModalModules) {
      KB.EditModalModules.destroy();
    }
    e.stopPropagation();
    if (!this.editor) {
      this.editor = new MediumEditor('#' + this.id, {
        toolbar: {
          diffTop: -50
        }
      });
      this.setupEvents();
    } else {
      this.editor.setup();
      this.setupEvents();
    }
  },
  deactivate: function () {
    if (this.editor) {
      this.editor.unsubscribe('editableInput', this.handleChange.bind(this));
      // var content = this.editor.getContent();
      var content = Utilities.getIndex(this.editor.module.get('entityData'), this.model.get('kpath'));

      // apply filter
      if (this.editor.kfilter) {
        content = switchEditors._wp_Nop(content);
        this.retrieveFilteredContent(this.editor, content);
      } else {
        this.editor.destroy();
        KB.Events.trigger('kb.repaint'); // @TODO figure this out
      }
    }
  },
  cleanString: function (string) {
    return string.replace(/\s/g, '')
      .replace(/&nbsp;/g, '')
      .replace(/<br>/g, '')
      .replace(/<[^\/>][^>]*><\/[^>]+>/g, '')
      .replace(/<p><\/p>/g, '');
  },
  synchronize: function (model) {
    if (this.editor) {
      this.editor.setContent(model.syncContent);
    } else {
      this.$el.html(model.syncContent);
    }
    this.model.trigger('field.model.dirty', this.model);

  }
});


module.exports = EditableText;
},{"common/Config":22,"common/Utilities":30,"frontend/Inline/InlineToolbar":110,"frontend/Inline/controls/EditText":113,"frontend/Inline/controls/InlineUpdate":114}],110:[function(require,module,exports){
var Tether = require('tether');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-inline-toolbar',
  attributes: function () {
    return {
      'data-kbelrel': this.model.get('baseId'),
      'hidefocus': '1',
      'tabindex': '-1'
    };
  },
  initialize: function (options) {
    this.options = options;
    this.FieldControlView = options.FieldControlView;
    this.controls = options.controls || [];
    this.hidden = false;
    this.listenTo(this.model, 'field.model.dirty', this.getDirty);
    this.listenTo(this.model, 'field.model.clean', this.getClean);
    this.listenTo(this.FieldControlView, 'field.view.derender', this.derender);
    this.listenTo(this.FieldControlView, 'field.view.rerender', this.rerender);
    this.listenTo(this.FieldControlView, 'field.view.gone', this.derender);
    this.create();
  },
  create: function () {
    var that = this;
    _.each(this.controls, function (control) {
      if (control.isValid()){
        control.render().appendTo(that.$el);
        control.Toolbar = that;
      }
    });
    this.$el.appendTo('body');
    this.createPosition();
  },
  hide: function(){
    this.$el.hide();
    this.hidden = true;
  },
  show: function(){
    if (this.hidden){
      this.$el.show();
    }
  },
  createPosition: function () {
    var tether = this.options.tether || {};
    var settings = {
      element: this.$el,
      target: this.FieldControlView.$el,
      attachment: 'center right',
      targetAttachment: 'center right'
    };
    this.Tether = new Tether(
      _.defaults(settings, tether)
    );
  },
  getDirty: function () {
    this.$el.addClass('isDirty');
  },
  getClean: function () {
    this.$el.removeClass('isDirty');
  },
  derender: function () {
    if (this.Tether) {
      this.Tether.destroy();
      delete this.Tether;
    }
  },
  rerender: function () {
    this.createPosition();
  },
  getTetherDefaults: function () {
    var att = this.el;
    var target = this.FieldControlView.el;
    return _.defaults(tether, {
      element: att,
      target: target,
      attachment: 'center right',
      targetAttachment: 'center right'
    });
  }

});
},{"tether":257}],111:[function(require,module,exports){
var Check = require('common/Checks');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.visible = false;
    this.options = options || {};
    this.Parent = options.parent;
    this.listenTo(KB.Events, 'window.change', this.reposition);
  },
  className: 'kb-inline-control kb-inline--edit-image',
  events: {
    'click': 'openFrame',
    'mouseenter': 'mouseenter',
    'mouseleave': 'mouseleave'
  },
  openFrame: function () {
    this.Parent.openFrame();
  },
  render: function () {
    return this.$el;
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  },
  mouseenter: function () {
    this.Parent.$el.addClass('kb-field--outline');
    _.each(this.model.get('linkedFields'), function(linkedModel){
      linkedModel.FieldControlView.$el.addClass('kb-field--outline-link');
    })
  },
  mouseleave: function(){
    this.Parent.$el.removeClass('kb-field--outline');
    _.each(this.model.get('linkedFields'), function(linkedModel){
      linkedModel.FieldControlView.$el.removeClass('kb-field--outline-link');
    })
  }
});
},{"common/Checks":21}],112:[function(require,module,exports){
var Check = require('common/Checks');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.visible = false;
    this.options = options || {};
    this.Parent = options.parent;
    if (this.isValid()) {
      this.render();
    }
  },
  className: 'kb-inline-control kb-inline--edit-link',
  events: {
    'click': 'openDialog',
    'mouseenter': 'mouseenter',
    'mouseleave': 'mouseleave'
  },
  openDialog: function () {
    this.Parent.openDialog();
  },
  render: function () {
    return this.$el;
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  },
  mouseenter: function () {
    this.Parent.$el.addClass('kb-field--outline');
    _.each(this.model.get('linkedFields'), function(linkedModel){
      linkedModel.FieldControlView.$el.addClass('kb-field--outline-link');
    })
  },
  mouseleave: function(){
    this.Parent.$el.removeClass('kb-field--outline');
    _.each(this.model.get('linkedFields'), function(linkedModel){
      linkedModel.FieldControlView.$el.removeClass('kb-field--outline-link');
    })
  }
});
},{"common/Checks":21}],113:[function(require,module,exports){
var Check = require('common/Checks');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.visible = false;
    this.options = options || {};
    this.Parent = options.parent;
  },
  className: 'kb-inline-control kb-inline--edit-text',
  events: {
    'click': 'focusEditor',
    'mouseenter': 'mouseenter',
    'mouseleave': 'mouseleave'
  },
  focusEditor: function (e) {
    this.Parent.activate(e);
  },
  render: function () {
    return this.$el;
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  },
  mouseenter: function () {
    this.Parent.$el.addClass('kb-field--outline');
    _.each(this.model.get('linkedFields'), function (linkedModel) {
      linkedModel.FieldControlView.$el.addClass('kb-field--outline-link');
    })
  },
  mouseleave: function () {
    this.Parent.$el.removeClass('kb-field--outline');
    _.each(this.model.get('linkedFields'), function (linkedModel) {
      linkedModel.FieldControlView.$el.removeClass('kb-field--outline-link');
    })
  }
});
},{"common/Checks":21}],114:[function(require,module,exports){
var Check = require('common/Checks');
var Config = require('common/Config');
var Logger = require('common/Logger');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.visible = false;
    this.options = options || {};
    this.parent = options.parent;
  },
  className: 'kb-inline-control kb-inline--update',
  events: {
    'click': 'syncFieldModel',
    'mouseenter': 'mouseenter',
    'mouseleave': 'mouseleave'
  },
  render: function () {
    return this.$el;
  },
  syncFieldModel: function (context) {
    var dfr = this.model.sync(this).done(function (res) {
      if (res.success) {
        this.model.getClean();
        this.parent.trigger('kn.inline.synced');
        _.each(this.model.get('linkedFields'), function (model, i) {
          if (!_.isNull(model)) {
            model.getClean();
          }
        });
      }
    })
  },
  syncModuleModel: function () {
    this.model.get('ModuleModel').sync(true);
    this.Toolbar.getClean();
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  },
  mouseenter: function () {

  }
});
},{"common/Checks":21,"common/Config":22,"common/Logger":24}],115:[function(require,module,exports){
// Bootstrap File
//KB.IEdit.Image.init();
//KB.IEdit.BackgroundImage.init();
var EditableText = require('frontend/Inline/EditableTextView');
var EditableLink = require('frontend/Inline/EditableLinkView');
var EditableImage = require('frontend/Inline/EditableImageView');
KB.Fields.registerObject('EditableText', EditableText);
KB.Fields.registerObject('EditableImage', EditableImage);
KB.Fields.registerObject('EditableLink', EditableLink);

},{"frontend/Inline/EditableImageView":107,"frontend/Inline/EditableLinkView":108,"frontend/Inline/EditableTextView":109}],116:[function(require,module,exports){
//KB.Backbone.AreaModel
module.exports = Backbone.Model.extend({
  defaults: {
      id: 'generic'
  },
  idAttribute: 'id'
});
},{}],117:[function(require,module,exports){
//KB.Backbone.ModuleModel
var Config = require('common/Config');
var Notice = require('common/Notice');
var Logger = require('common/Logger');
module.exports = Backbone.Model.extend({
  idAttribute: 'mid',
  attachedFields: {},
  changedFields: {},
  linkedModules: {},
  initialize: function () {
    this.subscribeToArea();
    this.type = 'module';

    if (this.get('globalModule')) {
      this.linkModules();
    }

  },
  subscribeToArea: function (AreaModel) {
    if (!AreaModel) {
      AreaModel = KB.Areas.get(this.get('area'));
    }
    AreaModel.View.attachModule(this);
    this.Area = AreaModel;
  },
  dispose: function () {
    this.stopListening();
  },
  attachField: function (FieldModel) {
    this.attachedFields[FieldModel.id] = FieldModel;
    this.listenTo(FieldModel, 'field.model.dirty', this.addChangedField);
    this.listenTo(FieldModel, 'field.model.clean', this.removeChangedField);
    this.listenTo(FieldModel, 'remove', this.removeAttachedField);
  },
  removeAttachedField: function (FieldModel) {
    if (this.attachedFields[FieldModel.id]) {
      this.stopListening(FieldModel);
      delete this.attachedFields[FieldModel.id];
    }
    if (this.changedFields[FieldModel.id]) {
      delete this.changedFields[FieldModel.id];
    }
  },
  addChangedField: function (FieldModel) {
    this.changedFields[FieldModel.id] = FieldModel;
  },
  removeChangedField: function (FieldModel) {
    if (this.changedFields[FieldModel.id]) {
      delete this.changedFields[FieldModel.id];
    }
    if (_.isEmpty(this.changedFields)) {
      this.trigger('module.model.clean', this);
    }
  },
  sync: function (save, context) {
    var that = this;
    KB.Events.trigger('module.before.sync', this);
    return jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'updateModule',
        data: that.toJSON().entityData,
        module: that.toJSON(),
        editmode: (save) ? 'update' : 'preview',
        _ajax_nonce: Config.getNonce('update')
      },
      context: (context) ? context : that,
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        that.set('entityData', res.data.newModuleData);
        if (save) {
          that.trigger('module.model.updated', that);
        }
      },
      error: function () {
        Logger.Debug.error('serialize | FrontendModal | Ajax error');
      }
    });
  },
  getModuleView: function () {
    if (this.View) {
      return this.View;
    }

    return false;
  },
  linkModules: function () {
    //var equals = KB.Modules.filterByAttr('parentObjectId', this.get('parentObjectId'));
    //_.each(equals, function (ModuleModel) {
    //  ModuleModel.linkedModules[this.cid] = this;
    //  this.linkedModules[ModuleModel.cid] = ModuleModel;
    //}, this);
  }

});
},{"common/Config":22,"common/Logger":24,"common/Notice":25}],118:[function(require,module,exports){
//KB.Backbone.PanelModel
var Config = require('common/Config');
var Logger = require('common/Logger');
module.exports = Backbone.Model.extend({
  idAttribute: 'mid',
  attachedFields: {},
  changedFields: {},
  initialize: function(){
    this.type = 'panel';
  },
  attachField: function (FieldModel) {
    this.attachedFields[FieldModel.id] = FieldModel;
    this.listenTo(FieldModel, 'field.model.dirty', this.addChangedField);
    this.listenTo(FieldModel, 'field.model.clean', this.removeChangedField);
    this.listenTo(FieldModel, 'remove', this.removeAttachedField);
  },
  removeAttachedField: function(FieldModel){
    if (this.attachedFields[FieldModel.id]){
      delete this.attachedFields[FieldModel.id];
    }
    if (this.changedFields[FieldModel.id]){
      delete this.changedFields[FieldModel.id];
    }
  },
  addChangedField: function (FieldModel) {
    this.changedFields[FieldModel.id] = FieldModel;
  },
  removeChangedField: function (FieldModel) {
    if (this.changedFields[FieldModel.id]) {
      this.stopListening(FieldModel);
      delete this.changedFields[FieldModel.id];
    }
    if (_.isEmpty(this.changedFields)){
      this.trigger('module.model.updated', this);
    }
  },
  sync: function (save, context) {
    var that = this;
    KB.Events.trigger('panel.before.sync');
    return jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'updatePostPanel',
        data: that.toJSON().entityData,
        panel: that.toJSON(),
        editmode: (save) ? 'update' : 'preview',
        _ajax_nonce: Config.getNonce('update')
      },
      context: (context) ? context : that,
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        that.set('entityData', res.data.newModuleData);
        that.trigger('module.model.updated', that);
      },
      error: function () {
        Logger.Debug.error('sync | FrontendModal | Ajax error');
      }
    });
  }
});
},{"common/Config":22,"common/Logger":24}],119:[function(require,module,exports){
/**
 * Override module browser success method
 */
var ModuleBrowser = require('shared/ModuleBrowser/ModuleBrowserController');
var TinyMCE = require('common/TinyMCE');
module.exports = ModuleBrowser.extend({
  success : function (res) {
    var model;
    if (this.dropZone) {
      this.dropZone.$el.after(res.data.html);
      this.dropZone.removeDropZone();
    } else {
      this.options.area.$el.append(res.data.html).removeClass('kb-area__empty');
    }
    KB.ObjectProxy.add(model = KB.Modules.add(res.data.module));

    this.parseAdditionalJSON(res.data.json);
    KB.Fields.trigger('newModule', KB.Views.Modules.lastViewAdded);
    this.options.area.trigger('kb.module.created');
    KB.Events.trigger('content.change reposition');
    model.trigger('module.created');

    setTimeout(function () {
      model.View.openOptions();
    }, 300);

  },
  close: function(){
    delete this.dropZone;
    ModuleBrowser.prototype.close.apply(this, arguments);
  }
});
},{"common/TinyMCE":28,"shared/ModuleBrowser/ModuleBrowserController":149}],120:[function(require,module,exports){
//KB.Backbone.AreaView
var ModuleBrowser = require('frontend/ModuleBrowser/ModuleBrowserExt');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var tplPlaceholder = require('templates/frontend/area-empty-placeholder.hbs');
module.exports = Backbone.View.extend({
  isSorting: false,
  events: {
    'click .kb-area__empty-placeholder': 'openModuleBrowser'
  },
  initialize: function () {
    this.attachedModules = {};
    this.renderSettings = this.model.get('renderSettings');
    this.listenTo(KB.Events, 'editcontrols.show', this.showPlaceholder);
    this.listenTo(KB.Events, 'editcontrols.hide', this.removePlaceholder);
    this.listenToOnce(KB.Events, 'frontend.init', this.setupUi);
    this.listenTo(this, 'kb.module.deleted', this.removeModule);
    this.listenTo(this, 'kb.module.created', this.refreshPlaceholder);
    this.model.View = this;
    this.$placeholder = jQuery(tplPlaceholder({i18n: KB.i18n}));
  },
  showPlaceholder: function () {
    this.$el.append(this.$placeholder);
    return this;
  },
  removePlaceholder: function () {
    this.$placeholder.detach();
    return this;
  },
  refreshPlaceholder: function () {
    this.removePlaceholder().showPlaceholder();
  },
  setupUi: function () {
    // Sortable
    if (this.model.get('sortable')) {
      this.setupSortables();
    }
  },
  openModuleBrowser: function () {
    if (!this.ModuleBrowser) {
      this.ModuleBrowser = new ModuleBrowser({
        area: this
      });
    }
    this.ModuleBrowser.render();
    return this.ModuleBrowser;
  },
  attachModule: function (moduleModel) {
    this.attachedModules[moduleModel.get('mid')] = moduleModel; // add module
    this.listenTo(moduleModel, 'change:area', this.removeModule); // add listener

    if (this.getNumberOfModules() > 0) {
      // this.removePlaceholder();
      // this.$el.removeClass('kb-area__empty');
    }
    this.trigger('kb.module.created', moduleModel);
  },

  getNumberOfModules: function () {
    return _.size(this.attachedModules);
  },
  getAttachedModules: function () {
    return this.attachedModules;
  },
  setupSortables: function () {
    var that = this;
    this.$el.sortable(
      {
        handle: ".kb-module-control--move",
        items: ".module",
        helper: "clone",
        cursorAt: {
          top: 5,
          left: 5
        },
        delay: 150,
        forceHelperSize: true,
        forcePlaceholderSize: true,
        placeholder: "kb-front-sortable-placeholder",
        start: function (e, ui) {
          that.isSorting = true;
        },
        receive: function (e, ui) {
          // model is set in the sidebar areaList single module item
          var module = ui.item.data('module');
          // callback is handled by that view object
          that.isSorting = false;
          module.create(ui);
        },
        stop: function () {
          if (that.isSorting) {
            that.isSorting = false;
            that.resort(that.model)
            KB.Events.trigger('content.change');
          }
        },
        change: function () {
          that.applyClasses();
        }
      });
  },
  removeModule: function (ModuleView) {
    var id = ModuleView.model.get('mid');
    if (this.attachedModules[id]) {
      delete this.attachedModules[id];
    }
    if (this.getNumberOfModules() < 1) {
      this.$el.addClass('kb-area__empty');
      this.showPlaceholder();
    }
  },
  resort: function (area) {
    var serializedData = {};
    serializedData[area.get('id')] = area.View.$el.sortable('serialize', {
      attribute: 'rel'
    });

    return Ajax.send({
      action: 'resortModules',
      postId: area.get('envVars').postId,
      data: serializedData,
      _ajax_nonce: Config.getNonce('update')
    }, function () {
      Notice.notice('Order was updated successfully', 'success');
      area.trigger('area.resorted');
    }, null);
  },
  applyClasses: function () {
    var $parent, prev;
    var $modules = this.model.View.$el.find('.module');
    $modules.removeClass('first-module last-module repeater');
    for (var i = 0; i < $modules.length; i++) {
      var View = jQuery($modules[i]).data('ModuleView');
      if (_.isUndefined(View)) {
        continue;
      }

      if (i === 0) {
        View.$el.addClass('first-module');
      }

      if (i === $modules.length - 1) {
        View.$el.addClass('last-module');
      }

      // add repeater class if current module equals previous one in type
      if (prev && View.model.get('settings').id === prev) {
        View.$el.addClass('repeater');
      }

      // cache for next iteration for comparison
      prev = View.model.get('settings').id;

      /**
       * copy rel attribute to wrapper, which is the actual sortable element
       */
      $parent = View.$el.parent();
      if ($parent.hasClass('kb-wrap')) {
        $parent.attr('rel', View.$el.attr('rel'));
      }

    }
  }


});
},{"common/Ajax":20,"common/Config":22,"common/Notice":25,"frontend/ModuleBrowser/ModuleBrowserExt":119,"templates/frontend/area-empty-placeholder.hbs":195}],121:[function(require,module,exports){
var Stack = require('common/Stack');
module.exports = Backbone.View.extend({
  events: {
    'click': 'goBack'
  },
  initialize: function (options) {
    this.stack = new Stack();
    this.modal = options.modal;
    this.setElement(this.modal.$('.kb-modal-history-back'));
    this.render();
  },
  append: function (view) {
    this.stack.append(view);
    this.render();
  },
  prepend: function (view) {
    this.stack.prepend(view);
    this.render();
  },
  reset: function () {
    this.stack.reset();
    this.render();
  },
  render: function () {
    if (this.stack.length() > 0) {
      this.$el.show();
    } else {
      this.$el.hide();
    }
  },
  goBack: function () {
    this.modal.openView(this.stack.first(), false, false);
    this.render();
  }

});
},{"common/Stack":27}],122:[function(require,module,exports){
var Logger = require('common/Logger');
var ModalFieldCollection = require('frontend/Collections/ModalFieldCollection');
var LoadingAnimation = require('frontend/Views/LoadingAnimation');
var Config = require('common/Config');
var Ui = require('common/UI');
var TinyMCE = require('common/TinyMCE');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var tplModuleEditForm = require('templates/frontend/module-edit-form.hbs');
var History = require('frontend/Views/EditModalHistory');
/**
 * This is the modal which wraps the modules input form
 * and loads when the user clicks on "edit" while in frontend editing mode
 * @type {*|void|Object}
 *
 */
//KB.Backbone.EditModalModules
module.exports = Backbone.View.extend({
  tagName: 'div',
  id: 'onsite-modal',
  timerId: null,
  viewStack: {},
  /**
   * Init method
   */
  initialize: function () {
    var that = this;
    this.FieldModels = new ModalFieldCollection();

    // add form skeleton to modal
    this.$el.append(tplModuleEditForm({
      model: {},
      i18n: KB.i18n.jsFrontend
    }));

    this.history = new History({modal: this});

    // cache elements
    this.LoadingAnimation = new LoadingAnimation({
      el: this.$el
    });

    this.setupElements();
    this.bindHandlers();


    return this;
  },

  bindHandlers: function () {
    var that = this;
    // use this event to refresh the modal on demand
    this.listenTo(KB.Events, 'modal.recalibrate', this.recalibrate);
    // use this event to trigger preview
    this.listenTo(KB.Events, 'modal.preview', this.preview);
    // use this event to trigger update
    this.listenTo(KB.Events, 'modal.update', this.update);

    // Attach resize event handler
    jQuery(window).on('resize', function () {
      that.recalibrate();
    });

    this.listenTo(KB.Events, 'kb.tinymce.new-editor', function (ed) {
      if (ed.settings && ed.settings.kblive) {
        that.attachEditorEvents(ed);
      }
    });

  },
  setupElements: function () {
    this.$form = jQuery('#onsite-form', this.$el);
    this.$formContent = jQuery('#onsite-content', this.$el);
    this.$inner = jQuery('.os-content-inner', this.$formContent);
    this.$title = jQuery('.controls-title', this.$el);
    this.$draft = jQuery('.kb-modal__draft-notice', this.$el);
  },
  events: {
    'click .close-controls': 'destroy',
    'click .kb-save-form': 'update',
    'click .kb-preview-form': 'preview',
    'change .kb-template-select': 'viewfileChange'
  },
  /**
   * Main method to open the modal
   * If modal is already opened and ModuleView differs from active
   * the modal reloads the view
   * else it's a noop
   * @param ModuleView Backbone View
   * @param force
   * @param keepinhistory
   * @returns {KB.Backbone.EditModalModules}
   */
  openView: function (ModuleView, force, keepinhistory) {
    //force = (_.isUndefined(force)) ? false : true;
    if (this.ModuleView && this.ModuleView.cid === ModuleView.cid) {
      return this;
    }

    if (keepinhistory) {
      this.history.prepend(this.ModuleView);
    }

    this.listenTo(KB.Events, 'modal.refresh', this.reload);

    this.ModuleView = ModuleView;
    this.model = ModuleView.model;
    this.realmid = this.setupModuleId();
    this.setupWindow();
    this.attach();
    this.render();
    this.recalibrate();
  },

  setupModuleId: function () {
    return this.model.get('mid');
  },
  /**
   * Attach events to Module View
   */
  attach: function () {
    //when update gets called from module controls, notify this view
    this.listenTo(this.ModuleView, 'kb.frontend.module.inline.saved', this.frontendViewUpdated);
    this.listenTo(this.model, 'data.updated', this.preview);
    this.listenTo(this.model, 'remove', this.destroy);
  },

  detach: function () {
    // reset listeners and ModuleView
    this.FieldModels.reset();
    this.stopListening();
    KB.Events.trigger('modal.close', this);
  },
  /**
   * reload the modal
   */
  reload: function () {
    this.render(true);
  },
  /**
   * Destroy and remove the modal
   */
  destroy: function () {
    var that = this;
    this.stopListening(KB.Events, 'modal.refresh', this.reload);
    that.detach();
    that.history.reset();
    jQuery('.wp-editor-area', this.$el).each(function (i, item) {
      tinymce.remove('#' + item.id);
    });
    that.ModuleView = null;
    that.initialized = false;
    that.unbind();
    that.$el.detach();

    if (KB.Sidebar.visible) {
      KB.Sidebar.$el.css('width', "");
    }

  },

  /**
   * Append element and restore position
   */
  setupWindow: function () {
    var that = this;
    if (KB.Sidebar.visible) {
      this.$el.appendTo(KB.Sidebar.$el);
      this.mode = 'sidebar';
      this.listenToOnce(KB.Sidebar, 'sidebar.close', function () {
        this.mode = 'body';
        this.$el.removeClass('kb-modal-sidebar');
        this.destroy();
      });
      KB.Sidebar.clearTimer();
    } else {
      this.mode = 'body';
      this.$el.appendTo('body').show();
    }
    // init draggable container and store position in config var
    if (this.mode === 'body') {
      this.$el.css('position', 'fixed').draggable({
        handle: '._controls-title',
        containment: 'window',
        helper: 'clone',
        stop: function (eve, ui) {
          // fit modal to window in size and position
          that.recalibrate(ui.position);
        }
      }).resizable();
    }
  },

  /**
   * Callback handler for update events triggered from module controls
   */
  frontendViewUpdated: function () {
    this.$el.removeClass('isDirty');
    this.reload();
  },
  /**
   * Calls serialize in preview mode
   * No data gets saved
   */
  preview: function (options) {
    if (options && options.hasOwnProperty('silent')) {
      if (options.silent === true) {
        return;
      }
    }
    this.serialize(false, false);
  },
  /**
   * Wrapper to serialize()
   * Calls serialize in save mode
   */
  update: function () {
    this.serialize(true, true);
    this.switchDraftOff();
  },
  /**
   * Main render method of the modal content
   */
  render: function (reload) {
    var that = this,
      json;
    Logger.User.info('Frontend modal retrieves data from the server');
    json = this.model.toJSON();

    // apply settings for the modal from the active module, if any
    this.applyControlsSettings(this.$el);

    //this.updateViewClassTo = false;

    // get the form
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'getModuleForm',
        module: json,
        entityData: json.entityData,
        //overloadData: overloadData,
        _ajax_nonce: Config.getNonce('read')
      },
      type: 'POST',
      dataType: 'json',
      beforeSend: function () {
        that.LoadingAnimation.show();
      },
      success: function (res) {
        // clear form content
        that.$inner.empty();
        // clear fields on ModuleView
        that.ModuleView.clearFields();
        // set id to module id
        that.$inner.attr('id', that.model.get('mid'));
        // append the html to the inner form container
        that.$inner.append(res.data.html);

        if (that.model.get('state').draft) {
          that.$draft.show(150);
        } else {
          that.$draft.hide();
        }

        var tinymce = window.tinymce;
        var $$ = tinymce.$;
        jQuery(document).on('click', function (event) {
          var id, mode,
            target = $$(event.target);
          if (target.hasClass('wp-switch-editor')) {
            id = target.attr('data-wp-editor-id');
            mode = target.hasClass('switch-tmce') ? 'tmce' : 'html';
            window.switchEditors.go(id, mode);
          }
        });


        if (res.data.json) {
          KB.payload = _.extend(KB.payload, res.data.json);
          _.defer(function () {
            if (res.data.json.Fields) {
              that.FieldModels.add(_.toArray(res.data.json.Fields));
            }
          });
        }
        // (Re)Init UI widgets
        Ui.initTabs();
        Ui.initToggleBoxes();
        TinyMCE.addEditor(that.$form);

        // -----------------------------------------------
        Logger.User.info('Frontend modal done.');

        that.$title.text(that.model.get('settings').name);

        if (reload) {
          if (that.FieldModels.length > 0) {
            KB.Events.trigger('modal.reload');
          }
        }
        Logger.User.info('Frontend modal.reload triggered.');

        // delayed recalibration
        setTimeout(function () {
          that.$el.show();
          that.LoadingAnimation.hide();
          that.ModuleView.renderStatusBar(that.$el);
          that.$('.kb-template-select').select2({
            templateResult: function (state) {
              if (!state.id) {
                return state.text;
              }
              var desc = state.element.dataset.tpldesc;
              return jQuery(
                '<span>' + state.text + '<br><span class="kb-tpl-desc">' + desc + '</span></span>'
              );
            }
          });
          that.recalibrate();
        }, 550);
      },
      error: function () {
        Notice.notice('There went something wrong', 'error');
      }
    });
  },


  /**
   * position and height of the modal may change depending on user action resp. contents
   * if the contents fits easily,  modal height will be set to the minimum required height
   * if contents take too much height, modal height will be set to maximum possible height
   * scrollbars are added as necessary
   */
  recalibrate: function () {
    var winH,
      conH,
      position,
      winDiff;
    // get window height
    winH = (jQuery(window).height() - 16);
    // get height of modal contents
    conH = jQuery('.os-content-inner').height();
    //get position of modal
    position = this.$el.position();

    // calculate if the modal contents overlap the window height
    // i.e. if part of the modal is out of view
    winDiff = (conH + position.top) - winH;
    // if the modal overlaps the height of the window
    // calculate possible height and set
    // nanoScroller needs an re-init after every change
    if (winDiff > 0) {
      this.initScrollbars(conH - (winDiff + 30));
    }
    //
    else if ((conH - position.top ) < winH) {
      this.initScrollbars(conH);

    } else {
      this.initScrollbars((winH - position.top));
    }

    // be aware of WP admin bar
    // TODO maybe check if admin bar is around
    if (position.top < 32) {
      this.$el.css('top', '32px');
      this.$el.css('right', '20px');

    }

    //if (KB.Sidebar.visible) {
    //  var sw = KB.Sidebar.$el.width();
    //  this.$el.css('left', sw + 'px');
    //  this.$el.css('height', winH + 'px');
    //}

    if (this.mode === 'sidebar') {
      var settings = this.model.get('settings');
      var cWidth = (settings.controls && settings.controls.width) || 600;
      KB.Sidebar.$el.width(cWidth);
      this.$el.addClass('kb-modal-sidebar');
      this.$el.width(cWidth);
    }

  },
  /**
   * (Re) Init Nano scrollbars
   * @param height
   */
  initScrollbars: function (height) {
    jQuery('.kb-nano', this.$el).height(height + 20);
    jQuery('.kb-nano').nanoScroller({preventPageScrolling: true, contentClass: 'kb-nano-content'});
  },

  /**
   * Serialize the form data
   * @param mode update or preview
   * @param showNotice show update notice or don't
   */
  serialize: function (mode, showNotice) {
    var that = this, moddata,
      save = mode || false,
      notice = (showNotice !== false);
    tinymce.triggerSave();

    moddata = this.formdataForId(this.realmid);
    this.model.set('entityData', moddata);
    this.LoadingAnimation.show();
    var ViewAnimation = new LoadingAnimation({
      el: this.ModuleView.$el
    });
    ViewAnimation.show();

    this.model.sync(save, this).done(function (res, b, c) {
      that.moduleUpdated(res, b, c, save, notice);
      ViewAnimation.remove();
    });
  },
  /**
   * This will update the actual DOM element of the edited module
   * @param res
   * @param b
   * @param c
   * @param save
   * @param notice
   */
  moduleUpdated: function (res, b, c, save, notice) {
    var that = this;

    that.model.trigger('modal.serialize.before');


    // change the container class if viewfile changed
    if (that.updateViewClassTo !== false) {
      that.updateContainerClass(that.updateViewClassTo);
    }

    // replace module html with new html
    that.ModuleView.trigger('modal.before.nodeupdate');
    that.ModuleView.$el.html(res.data.html);
    that.ModuleView.trigger('modal.after.nodeupdate');

    if (res.data.json && res.data.json.Fields) {
      KB.FieldControls.updateModels(res.data.json.Fields);
    }

    that.model.set('entityData', res.data.newModuleData);
    if (save) {
      that.model.trigger('module.model.updated', that.model);
      KB.Events.trigger('modal.saved');
    }
    jQuery(document).trigger('kb.module-update', that.model.get('settings').id, that.ModuleView);
    jQuery(document).trigger('kb.refresh');
    that.ModuleView.delegateEvents();

    // (re)attach inline editors and handle module controls
    // delay action to be safe
    _.defer(function () {
      that.ModuleView.render();
      that.model.trigger('modal.serialize');
      that.recalibrate();
    });
    //
    if (save) {
      if (notice) {
        Notice.notice(KB.i18n.jsFrontend.frontendModal.noticeDataSaved, 'success');
      }
      that.$el.removeClass('isDirty');
      that.ModuleView.getClean();
    } else {
      if (notice) {
        Notice.notice(KB.i18n.jsFrontend.frontendModal.noticePreviewUpdated, 'success');
      }
      that.$el.addClass('isDirty');
    }

    that.ModuleView.trigger('kb.view.module.HTMLChanged');
    that.LoadingAnimation.hide();
  },
  /**
   * Callback handler when the viewfile select field triggers change
   * @param e $ event
   */
  viewfileChange: function (e) {
    this.updateViewClassTo = {
      current: this.ModuleView.model.get('viewfile'),
      target: e.currentTarget.value
    };
    this.model.set('viewfile', e.currentTarget.value, {silent: true});
    this.preview();
    this.reload();
  },
  /**
   * Update modules element class to new view to
   * respect view dependent styles on the fly
   * @param viewfile string
   */
  updateContainerClass: function (viewfile) {
    if (!viewfile || !viewfile.current || !viewfile.target) {
      return false;
    }
    this.ModuleView.$el.removeClass(this._classifyView(viewfile.current));
    this.ModuleView.$el.addClass(this._classifyView(viewfile.target));
    this.updateViewClassTo = false;
  },
  /**
   * Delay key up events on form inputs
   * only fires the last event after 750ms
   */
  delayInput: function () {
    var that = this;
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.timerId = setTimeout(function () {
      that.timerId = null;
      that.serialize(false, false);
    }, 750);
  },
  attachEditorEvents: function (ed) {

  },


  /**
   * Modules can pass special settings to manipulate the modal
   * By now it's limited to the width
   * Maybe extended as usecases arise
   * @param $el
   */
  applyControlsSettings: function ($el) {
    var settings = this.model.get('settings');
    var cWidth = settings.controls && settings.controls.width;
    if (cWidth) {
      $el.css('width', settings.controls.width + 'px');
    }

    if (this.mode === 'sidebar' && cWidth) {
      KB.Sidebar.$el.width(cWidth);
    }

    if (settings.controls && settings.controls.fullscreen) {
      $el.width('100%').height('100%').addClass('fullscreen');
    } else {
      $el.height('').removeClass('fullscreen');
    }
  },
  /**
   * Helper method to create a element class from viewfile
   * @param str
   * @returns {string}
   * @private
   */
  _classifyView: function (str) {
    return 'view-' + str.replace('.twig', '');
  },
  switchDraftOff: function () {
    var json = this.model.toJSON();
    var that = this;

    if (!this.model.get('state').draft) {
      return;
    }
    // get the form
    Ajax.send({
      action: 'undraftModule',
      module: json,
      postId: this.model.get('parentObjectId'),
      _ajax_nonce: Config.getNonce('update')
    }, function (res) {
      if (res.success) {
        that.$draft.hide(150);
      }
    }, this);
  },
  formdataForId: function (mid) {
    var formdata;
    if (!mid) {
      return null;
    }
    formdata = this.$form.serializeJSON();
    if (formdata[mid]) {
      return _.clone(formdata[mid]);
    }
    return null;
  }
});
},{"common/Ajax":20,"common/Config":22,"common/Logger":24,"common/Notice":25,"common/TinyMCE":28,"common/UI":29,"frontend/Collections/ModalFieldCollection":103,"frontend/Views/EditModalHistory":121,"frontend/Views/LoadingAnimation":124,"templates/frontend/module-edit-form.hbs":198}],123:[function(require,module,exports){
//KB.Backbone.AreaView
var AreaView = require('frontend/Views/AreaView');
var ModuleBrowser = require('frontend/ModuleBrowser/ModuleBrowserExt');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var tplPlaceholder = require('templates/frontend/area-empty-placeholder.hbs');
module.exports = AreaView.extend({
  isSorting: false,
  events: {},
  initialize: function () {
    this.attachedModules = {};
    this.renderSettings = this.model.get('renderSettings');
    this.listenTo(KB.Events, 'editcontrols.show', this.showPlaceholder);
    this.listenTo(KB.Events, 'editcontrols.hide', this.removePlaceholder);
    this.listenToOnce(KB.Events, 'frontend.init', this.setupUi);
    this.listenTo(this, 'kb.module.deleted', this.removeModule);
    this.listenTo(this, 'kb.module.created', this.refreshPlaceholder);
    this.model.View = this;
    this.$placeholder = jQuery(tplPlaceholder({i18n: KB.i18n}));
    this.extendElements()
  },
  extendElements: function () {
    var data = this.model.get('layoutData');
    var slots = data.slots;
    if (slots) {
      _.each(slots, function (data, key) {
        if (data.mid && data.mid !== '') {
          var $el = this.$('#' + data.mid);
          $el.attr('data-slot', key);
          $el.addClass('kbml-slot-ref');
        }
      }, this)
    }

    // this.initDraggable();

  },
  initDraggable: function () {
    var $source, $target, $sourcecontainer, $targetcontainer;
    var that = this;
    this.$('.kbml-slot-ref').draggable({
      revert: 'invalid',
      helper: 'clone',
      revertDuration: 200,
      start: function () {
        $source = jQuery(this);
      },
      stop: function () {
        $source = null;
        jQuery(this).removeClass('being-dragged');
      }
    });

    this.$('.kbml-slot-ref').droppable({
      hoverClass: 'drop-hover',
      over: function (event, ui) {
        $target = jQuery(event.target);
      },
      drop: function (event, ui) {

        var from = $source.data('slot');
        var fromId = $source.attr('id');
        var to = $target.data('slot');
        var toId = $target.attr('id');
        var data = that.model.get('layoutData');
        var slots = data.slots;

        slots[from].mid = toId;
        slots[to].mid = fromId;


        alert(JSON.stringify(slots));
        return false;
      }
    });
  },
  showPlaceholder: function () {
    return this;
  },
  removePlaceholder: function () {
    return this;
  },
  refreshPlaceholder: function () {
    return this;
  },
  setupUi: function () {
    return false;
  },

  setupSortables: function () {

  },
  resort: function (area) {
  }

});
},{"common/Ajax":20,"common/Config":22,"common/Notice":25,"frontend/ModuleBrowser/ModuleBrowserExt":119,"frontend/Views/AreaView":120,"templates/frontend/area-empty-placeholder.hbs":195}],124:[function(require,module,exports){
//KB.Backbone.Shared.LoadingAnimation
module.exports = Backbone.View.extend({
  $overlay: jQuery('<div class="kb-loading-overlay" style="display: none;"><span>working...</span></div>'),
  initialize: function () {
    this.$el.css('position', 'relative').append(this.$overlay);
  },
  show: function (opacity) {
    if (opacity) {
      this.$overlay.fadeTo(150, opacity);
    } else {
      this.$overlay.show();
    }

  },
  hide: function () {
    this.$overlay.fadeOut(350);
  },
  remove: function () {
    this.$overlay.remove();
  }
});
},{}],125:[function(require,module,exports){
/**
 * Creates the individual module-actions controls
 * like: sortable, delete, update
 */
//KB.Backbone.Frontend.ModuleControlsView
var ModuleEdit = require('./modulecontrols/EditControl');
var ModuleUpdate = require('./modulecontrols/UpdateControl');
var ModuleDelete = require('./modulecontrols/DeleteControl');
var ModuleMove = require('./modulecontrols/MoveControl');
var DraftMove = require('./modulecontrols/DraftControl');

var tplModuleControls = require('templates/frontend/module-controls.hbs');
module.exports = Backbone.View.extend({
  ModuleView: null,
  $menuList: null, // ul item
  initialize: function (options) {
    // assign parent View
    this.ModuleView = options.ModuleView;
  },
  derender: function(){
    this.$el.detach();
  },
  rerender:function(){
    var that = this;
    this.ModuleView.$el.append(this.$el);
    _.defer(function(){
      that.reposition();
    })
  },
  render: function () {
    // append wrapper element
    this.ModuleView.$el.append(tplModuleControls({
      model: this.ModuleView.model.toJSON(),
      i18n: KB.i18n.jsFrontend
    }));

    // cache the actual controls $el
    this.$el = jQuery('[data-kb-mcontrols="'+ this.model.get('mid') +'"]', this.ModuleView.$el);
    //append ul tag, holder for single action items
    this.$menuList = this.$('.kb-controls-wrap');

    this.EditControl = this.addItem(new ModuleEdit({
      model: this.ModuleView.model,
      parent: this.ModuleView
    }));
    this.UpdateControl = this.addItem(new ModuleUpdate({
      model: this.ModuleView.model,
      parent: this.ModuleView
    }));
    this.DeleteControl = this.addItem(new ModuleDelete({
      model: this.ModuleView.model,
      parent: this.ModuleView
    }));
    this.MoveControl = this.addItem(new ModuleMove({
      model: this.ModuleView.model,
      parent: this.ModuleView
    }));
    this.DraftControl = this.addItem(new DraftMove({
      model: this.ModuleView.model,
      parent: this.ModuleView
    }));

  },
  addItem: function (view) {
    // actually happens in ModuleView.js
    // this functions validates action by calling 'isValid' on menu item view
    // if isValid render the menu item view
    // see /ModuleMenuItems/ files for action items
    if (view.isValid && view.isValid() === true) {
      //var $liItem = jQuery('<div class="kb-controls-wrap-item"></div>').appendTo(this.$menuList);
      this.$menuList.append(view.render());
      view.listenToOnce(this, 'controls.remove', view.remove);
      //this.$menuList.append($menuItem);
      return view;
    }
  },
  dispose: function () {
    this.trigger('controls.remove');
    this.remove();
  },
  reposition: function () {
    var elpostop, elposleft, mSettings, submodule, pos, height;
    elpostop = 0;
    elposleft = 0;
    mSettings = this.model.get('settings');
    submodule = this.model.get('submodule');
    pos = this.ModuleView.$el.offset();
    height = this.ModuleView.$el.height();

    if (mSettings.controls && mSettings.controls.toolbar) {
      pos.top = mSettings.controls.toolbar.top;
      pos.left = mSettings.controls.toolbar.left;
    }

    // small item with enough space above
    // position is at top outside of the element (headlines etc)
    if (this.ModuleView.$el.css('overflow') !== 'hidden' && pos.top > 60 && height < 119) {
      elpostop = -25;
    }

    // enough space on the left side
    // menu will be rendered vertically on the left
    if (this.ModuleView.$el.css('overflow') !== 'hidden' && pos.left > 100 && height > 120 && this.ModuleView.$el.class) {
      elpostop = 0;
      elposleft = -30;
      this.ModuleView.$el.addClass('kb-module-nav__vertical');
    }

    if (pos.top < 20) {
      elpostop = 10;
    }

    if (elpostop == 0) {
      elpostop = 20;
    }

    if (elposleft == 0) {
      elposleft = 20;
    }

    if (submodule) {
      elpostop = elpostop + 50;
    }
    this.$el.css({'top': elpostop + 'px', 'left': elposleft});
  }

});
},{"./modulecontrols/DeleteControl":127,"./modulecontrols/DraftControl":128,"./modulecontrols/EditControl":129,"./modulecontrols/MoveControl":130,"./modulecontrols/UpdateControl":131,"templates/frontend/module-controls.hbs":197}],126:[function(require,module,exports){
//KB.Backbone.Frontend.ModuleMenuItemView
module.exports = Backbone.View.extend({
  tagName: 'div',
  isValid: function () {
    return true;
  },
  render: function(){
    return this.el;
  },
  dispose: function(){
    this.remove();
  }
});
},{}],127:[function(require,module,exports){
//KB.Backbone.Frontend.ModuleDelete
var ModuleMenuItem = require('frontend/Views/ModuleControls/modulecontrols/ControlsBaseView');
var Check = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');

module.exports = ModuleMenuItem.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
  },
  className: 'kb-module-control kb-module-control--delete',
  events: {
    'click': 'confirmRemoval'
  },
  confirmRemoval: function () {
    Notice.confirm('Remove', KB.i18n.EditScreen.notices.confirmDeleteMsg, this.removeModule, this.cancelRemoval, this);
  },
  removeModule: function () {
    var that = this;
    Ajax.send({
      action: 'removeModules',
      _ajax_nonce: Config.getNonce('delete'),
      module: that.model.get('mid'),
      postId: that.model.get('postId')
    }, this.afterRemoval, this);
  },
  afterRemoval: function () {
    this.Parent.$el.parent('.kb-wrap').remove();
    this.trigger('remove');
    // removes the model from model collection
    // removal triggers remove on views collection
    // views collection triggers kb.module.view.deleted
    KB.Modules.remove(this.model);
  },
  cancelRemoval: function () {
    return false;
  },
  isValid: function () {
    return Check.userCan('delete_kontentblocks');
  }
});
},{"common/Ajax":20,"common/Checks":21,"common/Config":22,"common/Notice":25,"frontend/Views/ModuleControls/modulecontrols/ControlsBaseView":126}],128:[function(require,module,exports){
//KB.Backbone.Frontend.ModuleMove
var ModuleMenuItem = require('frontend/Views/ModuleControls/modulecontrols/ControlsBaseView');
module.exports = ModuleMenuItem.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
    this.$el.append('<div>Draft! Only visible while logged in</div>');
    this.listenTo(this.Parent.model, 'change:state', this.recheck);
    this.recheck(this.Parent.model.get('state'));
  },
  className: 'kb-module-control kb-module-control--draft',
  isValid: function () {
    return true;
  },
  recheck: function(state){
    if (!state.draft){
      this.$el.hide();
    } else{
      this.$el.show();
    }
  }
});
},{"frontend/Views/ModuleControls/modulecontrols/ControlsBaseView":126}],129:[function(require,module,exports){
var ModuleMenuItem = require('frontend/Views/ModuleControls/modulecontrols/ControlsBaseView');
var Check = require('common/Checks');
module.exports = ModuleMenuItem.extend({
  initialize: function (options) {
    this.options = options || {};
    this.parent = options.parent;
  },
  className: 'kb-module-control kb-module-control--edit',
  events: {
    'click': 'openForm'
  },
  openForm: function () {
    KB.EditModalModules.openView(this.parent,false,false);
    KB.focusedModule = this.model;
    return this;
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  }
});
},{"common/Checks":21,"frontend/Views/ModuleControls/modulecontrols/ControlsBaseView":126}],130:[function(require,module,exports){
//KB.Backbone.Frontend.ModuleMove
var ModuleMenuItem = require('frontend/Views/ModuleControls/modulecontrols/ControlsBaseView');
var Check = require('common/Checks');
module.exports = ModuleMenuItem.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
  },
  className: 'kb-module-control kb-module-control--move',
  isValid: function () {
    if (!this.Parent.model.Area){
      return false;
    }
    return Check.userCan('edit_kontentblocks') && this.Parent.model.Area.get('sortable') && !this.model.get('submodule');
  }
});
},{"common/Checks":21,"frontend/Views/ModuleControls/modulecontrols/ControlsBaseView":126}],131:[function(require,module,exports){
//KB.Backbone.Frontend.ModuleUpdate
var ModuleMenuItem = require('frontend/Views/ModuleControls/modulecontrols/ControlsBaseView');
var Check = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');

module.exports = ModuleMenuItem.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
  },
  className: 'kb-module-control kb-module-control--update',
  events: {
    'click': 'update'
  },
  update: function () {
    var that = this;
    var refresh = false;
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'updateModule',
        data: that.model.get('entityData'),
        module: that.model.toJSON(),
        editmode: 'update',
        refresh: refresh,
        _ajax_nonce: Config.getNonce('update')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        if (refresh) {
          that.$el.html(res.html);
        }
        tinymce.triggerSave();
        that.model.set('entityData', res.data.newModuleData);
        that.Parent.render();
        that.Parent.trigger('kb.frontend.module.inline.saved');
        that.model.trigger('module.model.updated', that.model);
        Notice.notice('Module saved successfully', 'success');
        that.Parent.$el.removeClass('isDirty'); // deprecate
      },
      error: function () {
        Notice.notice('There went something wrong', 'error');
      }
    });
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  }
});
},{"common/Checks":21,"common/Config":22,"common/Notice":25,"frontend/Views/ModuleControls/modulecontrols/ControlsBaseView":126}],132:[function(require,module,exports){
var ModuleControlsView = require('frontend/Views/ModuleControls/ModuleControls');
var Check = require('common/Checks');
var ModuleStatusBarView = require('shared/ModuleStatusBar/ModuleStatusBarView');
var TemplatesStatus = require('shared/ModuleStatusBar/status/TemplateStatus');
var PublishStatus = require('shared/ModuleStatusBar/status/PublishStatus');

var tplModulePlaceholder = require('templates/frontend/module-placeholder.hbs');
module.exports = Backbone.View.extend({
  focus: false,
  attachedFields: {},
  initialize: function () {
    this.Controls = new ModuleControlsView({
      ModuleView: this,
      model: this.model
    });

    if (this.$el.length === 0) {
      return;
    }

    // don't init if cap is missing for current user
    if (!Check.userCan('edit_kontentblocks')) {
      return;
    }
    // attach this view to the model
    this.model.View = this;

    this.model.trigger('module.model.view.attached', this);
    // observe model changes

    this.bindHandlers();

    // init render
    this.render();

    KB.Events.on('reposition', this.setControlsPosition, this);

  },
  bindHandlers: function () {
    this.listenTo(this.model, 'change', this.getDirty);
    this.listenTo(this.model, 'module.model.updated', this.getClean);
    this.listenTo(this.model, 'module.model.clean', this.getClean);
  },
  events: {
    "click .kb-module__placeholder": "openOptions",
    "click .editable": "reloadModal",
    "mouseenter.first": "setActive"
  },
  renderStatusBar: function ($el) {
    this.ModuleStatusBar = new ModuleStatusBarView({
      el: $el,
      parent: this
    });
    this.ModuleStatusBar.addItem(new TemplatesStatus({model: this.model, parent: this}));
    this.ModuleStatusBar.addItem(new PublishStatus({model: this.model, parent: this}));

  },
  openOptions: function () {
    this.Controls.EditControl.openForm();
  },
  setActive: function () {
    KB.currentModule = this;
  },
  rerender: function () {
    var that = this;
    this.setElement(jQuery('#' + this.model.get('mid')));
    _.defer(function () {
      that.Controls.rerender();
    });
  },
  derender: function () {
    this.Controls.derender();
    this.$el.remove();
  },
  render: function () {
    var settings;
    if (this.$el.hasClass('draft') && this.$el.html() == '') {
      this.renderPlaceholder();
    }
    //assign rel attribute to handle sortable serialize
    this.$el.attr('rel', this.model.get('mid') + '_' + _.uniqueId());

    settings = this.model.get('settings');
    if (settings.controls && settings.controls.hide) {
      return;
    }
    this.Controls.render();
    this.setControlsPosition();
  },
  setControlsPosition: function () {
    this.Controls.reposition();
  },

  reloadModal: function (force) {
    if (KB.EditModalModules) {
      KB.EditModalModules.reload(this, force);
    }
    KB.focusedModule = this.model;
    return this;
  },
  renderPlaceholder: function () {
    this.$el.append(tplModulePlaceholder({
      model: this.model.toJSON()
    }));
  },
  addField: function (obj) {
    this.attachedFields[obj.cid] = obj;
  },
  hasField: function (key, arrayKey) {
    if (!_.isEmpty(arrayKey)) {
      if (!this.attachedFields[arrayKey]) {
        this.attachedFields[arrayKey] = {};
      }
      return key in this.attachedFields[arrayKey];
    } else {
      return key in this.attachedFields;
    }
  },
  getField: function (key, arrayKey) {
    if (!_.isEmpty(arrayKey)) {
      return this.attachedFields[arrayKey][key];
    } else {
      return this.attachedFields[key];
    }
  },
  clearFields: function () {
    this.attachedFields = {};
  },
  getDirty: function () {
    this.$el.addClass('isDirty');
    this.trigger('view.became.dirty', this);
  },
  getClean: function () {
    this.$el.removeClass('isDirty');
    this.trigger('view.became.clean', this);
  },
  modelChange: function () {
    this.getDirty();
  },
  dispose: function () {
    this.Controls.dispose();
    delete this.model.View;
    this.stopListening();
    this.remove();
  }

});
},{"common/Checks":21,"frontend/Views/ModuleControls/ModuleControls":125,"shared/ModuleStatusBar/ModuleStatusBarView":157,"shared/ModuleStatusBar/status/PublishStatus":158,"shared/ModuleStatusBar/status/TemplateStatus":159,"templates/frontend/module-placeholder.hbs":199}],133:[function(require,module,exports){
module.exports = Backbone.View.extend({
  initialize: function () {
    this.model.View = this;
  },
  getDirty: function () {

  },
  getClean: function () {

  }
});
},{}],134:[function(require,module,exports){
// KB.Backbone.SidebarView
var AreaOverview = require('frontend/Views/Sidebar/AreaOverview/AreaOverviewController');
var CategoryFilter = require('frontend/Views/Sidebar/AreaDetails/CategoryFilter');
var SidebarHeader = require('frontend/Views/Sidebar/SidebarHeader');
var Utilities = require('common/Utilities');
var PanelOverviewController = require('frontend/Views/Sidebar/PanelOverview/PanelOverviewController');
var tplSidebarNav = require('templates/frontend/sidebar/sidebar-nav.hbs');
//var RootView = require('frontend/Views/Sidebar/RootView');
module.exports = Backbone.View.extend({
  currentView: null,
  viewStack: [],
  timer: 0,
  initialize: function () {
    this.render();
    this.states = {};
    var controlsTpl = tplSidebarNav({});
    this.$navControls = jQuery(controlsTpl);
    this.bindHandlers();

    this.states['AreaList'] = new AreaOverview({
      controller: this
    });

    this.states['PanelList'] = new PanelOverviewController({
      controller: this
    });

    // utility
    this.CategoryFilter = new CategoryFilter();

    //this.RootView = new RootView({
    //  controller: this
    //});
    //this.setView(this.RootView);
    this.setView(this.states['AreaList']); // init Areas list view
    this.$el.addClass('ui-widget-content');
    this.$el.resizable({
      maxWidth: 900,
      minWidth: 340,
      handles: 'e'
    });

  },
  events: {
    'click .kb-js-sidebar-nav-back': 'rootView', // back to level 0
    'click [data-kb-action]': 'actionHandler', // event proxy
    'mouseleave': 'detectActivity',
    'mouseenter': 'clearTimer'
  },
  detectActivity: function () {
    var that = this;
    this.timer = setTimeout(function () {
      that.$el.addClass('kb-opaque');
    }, 15000);
  },
  clearTimer: function () {
    var that = this;
    if (this.timer) {
      clearTimeout(this.timer);
      that.$el.removeClass('kb-opaque');
    }
  },
  render: function () {
    this.$el = jQuery('<div class="kb-sidebar-wrap" style="display: none;"></div>').appendTo('body');
    this.$toggle = jQuery('<div class="kb-sidebar-wrap--toggle cbutton cbutto-effect--boris"></div>').appendTo('body');
    this.Header = new SidebarHeader({});
    this.$el.append(this.Header.render());
    this.$container = jQuery('<div class="kb-sidebar-wrap__container"></div>').appendTo(this.$el);
    this.$extension = jQuery('<div class="kb-sidebar-extension" style="display: none;"></div>').appendTo(this.$el);
    this.setLayout();

    var ls = Utilities.stex.get('kb-sidebar-visible');
    if (ls) {
      this.toggleSidebar();
      this.detectActivity();
    }
    this.delegateEvents();
  },
  bindHandlers: function () {
    var that = this;
    jQuery(window).resize(function () {
      that.setLayout();
    });

    this.$toggle.on('click', function () {
      that.toggleSidebar();
    });
  },
  setLayout: function () {
    var h = jQuery(window).height();
    var w = this.$el.width();
    this.$el.height(h);
    this.$extension.height(h);
  },
  setExtendedView: function (View) {
    if (this.currentExtendedView) {
      this.currentExtendedView.$el.detach();
    }
    this.currentExtendedView = View;
    this.$extension.html(View.render());
    this.$extension.show();
  },
  closeExtendedView: function () {
    this.currentExtendedView.$el.detach();
    this.currentExtendedView = null;
    this.$extension.html('');
    this.$extension.hide();
  },
  setView: function (View) {
    if (this.currentView) {
      this.currentView.$el.detach();
    }
    this.currentView = View;
    this.viewStack.push(View);
    this.$container.html(View.render());
    this.handleNavigationControls();
  },
  prevView: function () {
    var prev = this.viewStack.shift();
    if (prev) {
      this.setView(prev);
    }
  },

  rootView: function () {
    this.viewStack = []; // empty stack
    this.setView(this.states['AreaList']); // set level 0 view
  },
  handleNavigationControls: function () {
    if (this.viewStack.length >= 2) {
      this.$navControls.prependTo(this.$container);
    } else {
      this.$navControls.detach();
    }
  },
  toggleSidebar: function () {
    this.visible = !this.visible;
    this.$el.toggle(0);
    jQuery('body').toggleClass('kb-sidebar-visible');
    Utilities.stex.set('kb-sidebar-visible', this.visible, 1000 * 60 * 60);
    (this.visible) ? this.trigger('sidebar.open') : this.trigger('sidebar.close');
  },
  actionHandler: function (event) {
    var action = jQuery(event.currentTarget).data('kb-action');
    if (action && this.states[action]) {
      this.setView(this.states[action]);
    }
  }
});
},{"common/Utilities":30,"frontend/Views/Sidebar/AreaDetails/CategoryFilter":137,"frontend/Views/Sidebar/AreaOverview/AreaOverviewController":140,"frontend/Views/Sidebar/PanelOverview/PanelOverviewController":144,"frontend/Views/Sidebar/SidebarHeader":146,"templates/frontend/sidebar/sidebar-nav.hbs":210}],135:[function(require,module,exports){
//KB.Backbone.Sidebar.AreaDetails.AreaDetailsController
var CategoryController = require('frontend/Views/Sidebar/AreaDetails/CategoryController');
// var AreaSettings = require('frontend/Views/Sidebar/AreaDetails/AreaSettingsController');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');

var tplAreaDetailsHeader = require('templates/frontend/sidebar/area-details-header.hbs');

//noinspection JSUnusedGlobalSymbols
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar__module-list',
  initialize: function (options) {
    this.controller = options.controller;
    this.sidebarController = options.sidebarController;
    this.categories = this.sidebarController.CategoryFilter.filter(this.model);
    this.renderHeader();
    this.renderCategories();
  },
  render: function () {
    return this.$el;
  },
  renderHeader: function () {
    this.$el.append(tplAreaDetailsHeader(this.model.toJSON()));
  },
  renderCategories: function () {
    var that = this;
    _.each(this.categories.toJSON(), function (cat, id) {
      var catView = new CategoryController({
        model: new Backbone.Model(cat),
        controller: that
      });
      that.$el.append(catView.render());
    });
  }
});
},{"common/Ajax":20,"common/Config":22,"common/Notice":25,"frontend/Views/Sidebar/AreaDetails/CategoryController":136,"templates/frontend/sidebar/area-details-header.hbs":200}],136:[function(require,module,exports){
//KB.Backbone.Sidebar.AreaDetails.CategoryController
var ModuleDragItem = require('frontend/Views/Sidebar/AreaDetails/ModuleDragItem');

var tplCategoryList = require('templates/frontend/sidebar/category-list.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar__module-category',
  initialize: function (options) {
    // ModuleListController
    this.controller = options.controller;
    this.$el.append(tplCategoryList(this.model.toJSON()));
    this.$list = this.$el.find('.kb-sidebar__category-item__module-list');
    this.setupModuleItems();
  },
  render: function () {
    return this.$el;
  },
  setupModuleItems: function () {
    var that = this;
    _.each(this.model.get('modules'), function (module) {
      var view = new ModuleDragItem({
        model: new Backbone.Model(module),
        listController: that.controller,
        controller: that
      });
      that.$list.append(view.render());
    })
  }
});
},{"frontend/Views/Sidebar/AreaDetails/ModuleDragItem":138,"templates/frontend/sidebar/category-list.hbs":201}],137:[function(require,module,exports){
//KB.Backbone.Sidebar.CategoryFilter
var Payload = require('common/Payload');
module.exports = Backbone.View.extend({
  categories: Payload.getPayload('ModuleCategories'),
  definitions: Payload.getPayload('ModuleDefinitions'),
  initialize: function () {
    this.setupSortTable();
  },
  filter: function (AreaModel) {
    var that = this;
    var sorted = this.setupSortTable();
    var assigned = AreaModel.get('assignedModules');
    _.each(this.definitions, function (def, name) {
      if (_.indexOf(assigned, name) !== -1) {
        sorted[def.settings.category].modules[name] = def;
      }
    });
    return new Backbone.Model(this.removeEmptyCats(sorted));
  },
  setupSortTable: function () {
    var coll = {}
    _.each(this.categories, function (name, key) {
      coll[key] = {
        name: name,
        id: key,
        modules: {}
      }
    });
    return coll;
  },
  removeEmptyCats: function (sorted) {
    _.each(sorted, function (obj, id) {
      if (_.isEmpty(obj.modules)) {
        delete sorted[id];
      }
    });
    if (sorted.core) {
      delete sorted['core'];
    }
    return sorted;
  }
});
},{"common/Payload":26}],138:[function(require,module,exports){
//KB.Backbone.Sidebar.AreaDetails.ModuleDragItem
var Payload = require('common/Payload');
var Notice = require('common/Notice');
var Config = require('common/Config');
var Checks = require('common/Checks');
var ModuleModel = require('frontend/Models/ModuleModel');
var AreaView = require('frontend/Views/AreaView');
var Ajax = require('common/Ajax');

var tplCategoryModuleItem = require('templates/frontend/sidebar/category-module-item.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar-module',
  initialize: function (options) {
    var that = this;
    // CategoryView
    this.controller = options.controller;
    // ModuleListController
    this.listController = options.listController;
    this.$el.append(tplCategoryModuleItem(this.model.toJSON()));
    // set Area model
    this.model.set('area', this.listController.model);

    var moduleEl = (this.model.get('area').get('renderSettings')).moduleElement || 'div';
    this.$dropHelper = jQuery("<" + moduleEl + " class='kb-sidebar-drop-helper ui-sortable-helper'></" + moduleEl + ">");
    this.$el.draggable({
      appendTo: that.listController.model.View.$el.selector,
      revert: 'invalid',
      refreshPositions: true,
      // helper: 'clone',
      cursorAt: {
        top: 5,
        left: 5
      },
      stop: function () {
        that.listController.model.View.$el.css('overflow', '');
      },
      helper: function () {
        that.listController.model.View.$el.css('overflow', 'hidden');
        var size = that.findHelperSize(that.model.get('area').View);
        that.$dropHelper.width(size.width).height(size.height);
        return that.$dropHelper;
      },
      drag: function () {
        that.$dropHelper.css('zIndex', '10000');
      },
      connectToSortable: this.listController.model.View.$el.selector
    }).data('module', this);
  },
  render: function () {
    return this.$el;
  },
  /**
   * Create callback when the item is received by the area
   * @param ui jqueryUi draggable ui object
   */
  create: function (ui) {
    var Area, data, module;
    // check if capability is right for this action
    if (Checks.userCan('create_kontentblocks')) {
    } else {
      Notice.notice('You\'re not allowed to do this', 'error');
    }
    // check if block limit isn't reached
    Area = KB.Areas.get(this.model.get('area').get('id'));
    if (!Checks.blockLimit(Area)) {
      Notice.notice('Limit for this area reached', 'error');
      return false;
    }
    module = this.model;
    // prepare data to send
    data = {
      action: 'createNewModule',
      'class': module.get('settings').class,
      globalModule: module.get('globalModule'),
      parentObject: module.get('parentObject'),
      areaContext: Area.get('context'),
      renderSettings: Area.get('renderSettings'),
      area: Area.get('id'),
      _ajax_nonce: Config.getNonce('create'),
      frontend: KB.appData.config.frontend
    };

    if (this.model.get('area').get('parent_id')) {
      data.postId = this.model.get('area').get('parent_id');
    }

    Ajax.send(data, this.success, this, {ui: ui});
  },
  success: function (res, payload) {
    var that = this, model;
    payload.ui.helper.replaceWith(res.data.html);
    model = KB.Modules.add(res.data.module);
    KB.ObjectProxy.add(model);
    model.Area.View.applyClasses();
    AreaView.prototype.resort(this.model.get('area'));
    that.model.get('area').trigger('kb.module.created');

    // callbacks on next tick
    _.defer(function () {
      Payload.parseAdditionalJSON(res.data.json);
      KB.Events.trigger('content.change reposition');
      if (KB.App.adminBar.isActive()) {
        model.trigger('module.create');
      }
    });

  },
  findHelperSize: function (scope) {
    var widths = [];
    var heights = [];
    _.each(scope.attachedModules, function (ModuleView) {
      widths.push(ModuleView.View.$el.width());
      heights.push(ModuleView.View.$el.height());

    });
    return {
      width: Math.max.apply(Math, widths) - 10,
      height: Math.max.apply(Math, heights) - 10
    }
  }
});
},{"common/Ajax":20,"common/Checks":21,"common/Config":22,"common/Notice":25,"common/Payload":26,"frontend/Models/ModuleModel":117,"frontend/Views/AreaView":120,"templates/frontend/sidebar/category-module-item.hbs":202}],139:[function(require,module,exports){
var ModuleListItem = require('frontend/Views/Sidebar/AreaOverview/ModuleListItem');
var AreaDetailsController = require('frontend/Views/Sidebar/AreaDetails/AreaDetailsController');
var tplEmptyArea = require('templates/frontend/sidebar/empty-area.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar-areaview__modules-list',
  ModuleViews: {},
  initialize: function (options) {
    this.Modules = new Backbone.Collection();
    this.$parent = options.$el; // skelton as inserted by controller
    this.controller = options.controller;
    this.sidebarController = options.sidebarController;
    this.$toggleHandle = this.$parent.find('.kb-sidebar-areaview__title');
    this.ModuleList = new AreaDetailsController({
      controller: options.controller,
      sidebarController: options.sidebarController,
      model: this.model
    });
    this.render();
    this.bindHandlers();
  },

  render: function () {
    this.$el.appendTo(this.$parent).hide();
  },
  bindHandlers: function () {
    var that = this;
    this.listenTo(this.Modules, 'add', this.renderModuleItem);
    this.listenTo(this.model, 'area.resorted', this.resortViews);

    this.$toggleHandle.on('click', function () {
      that.controller.setActiveList(that);
    });
    this.$parent.on('click', '.kb-js-sidebar-add-module', function () {
      that.sidebarController.setView(that.ModuleList);
    });

    this.listenToOnce(KB.Events, 'frontend.init', this.afterInit);
  },
  activate: function () {
    this.$parent.removeClass('kb-sidebar-areaview--inactive');
    this.model.View.$el.addClass('kb-in-sidebar-active');
  },
  deactivate: function () {
    this.$parent.addClass('kb-sidebar-areaview--inactive');
    this.model.View.$el.removeClass('kb-in-sidebar-active');

  },
  renderModuleItem: function (model) {
    this.ModuleViews[model.id] = View = new ModuleListItem({
      $parent: this.$el,
      model: model
    });
    View.$el.appendTo(this.$el);
  },
  /**
   *
   * @param moduleView original base view of the module
   * - $el refers to the DOM node
   */
  attachModuleView: function (moduleView) {
    this.Modules.add(moduleView.model);
    this.listenToOnce(moduleView.model, 'remove', this.removeModuleView);
  },
  /**
   * Original / base module model
   * @param moduleModel
   */
  removeModuleView: function (moduleModel) {
    // sidebar list item view
    var sidebarView = this.ModuleViews[moduleModel.id];
    this.Modules.remove(moduleModel);
    delete this.ModuleViews[moduleModel.id];
    sidebarView.dispose();
  },
  afterInit: function () {
    if (this.Modules.models.length === 0 && this.model.View.$el.is(":visible")) {
      this.$el.append(tplEmptyArea({}));
    }
  },
  moduleOrder: function () {
    var $domEl = this.model.View.$el;
    var modules = jQuery("[id^=module]", $domEl);
    return _.pluck(modules, 'id');
  },
  resortViews: function(){
    var that = this;
    var order = this.moduleOrder().reverse();
    _.each(order, function(id){
      var v = that.ModuleViews[id];
      v.$el.detach();
      v.$el.prependTo(that.$el);
    });

  }
});
},{"frontend/Views/Sidebar/AreaDetails/AreaDetailsController":135,"frontend/Views/Sidebar/AreaOverview/ModuleListItem":141,"templates/frontend/sidebar/empty-area.hbs":203}],140:[function(require,module,exports){
//KB.Backbone.Sidebar.AreaOverview.AreaOverviewController
var AreaListItem = require('frontend/Views/Sidebar/AreaOverview/AreaListItem');
var tplSidebarAreaView = require('templates/frontend/sidebar/sidebar-area-view.hbs');
var tplRootItem = require('templates/frontend/sidebar/root-item.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar-main-panel',
  Areas: new Backbone.Collection(), // Area models
  AreaViews: {}, // attached Area Views
  activeList: null,
  events: {
    'click .kb-sidebar-areaview__title': 'toggleList'
  },
  initialize: function (options) {
    this.sidebarController = options.controller;
    this.render();
    this.bindHandlers();
  },
  render: function () {
    // this.$el is the main wrapper for the area overview list
    return this.$el;
  },
  bindHandlers: function () {
    this.listenTo(KB.Views.Areas, 'view:add', this.attachAreaView);
    this.listenTo(KB.Views.Modules, 'view:add', this.attachModuleView);
    this.listenTo(this.Areas, 'add', this.createAreaItem);
  },
  attachAreaView: function (view) {
    if (view.el) { // make sure the area is present in the DOM
      this.Areas.add(view.model);
    }

  },
  attachModuleView: function (view) {
    var AreaView = this.AreaViews[view.model.get('area')];
    if (AreaView) {
      AreaView.attachModuleView(view);
    }
  },
  createAreaItem: function (model) {
    // render area item skeleton markup for each area
    if (!model.get('internal')) { // ignore internal system areas
      var $item = jQuery(tplSidebarAreaView(model.toJSON())).appendTo(this.$el);
      this.AreaViews[model.get('id')] = new AreaListItem({
        $el: $item,
        controller: this,
        sidebarController: this.sidebarController,
        model: model
      })
    }
  },
  setActiveList: function (AreaView) {
    // is null
    if (!this.activeList || !this.activeList.cid) {
      this.activeList = AreaView;
      AreaView.$el.slideDown();
      AreaView.activate();
      return true;
    }
    if (this.activeList.cid === AreaView.cid) {
      return false;
    } else {
      this.activeList.$el.slideUp();
      this.activeList.deactivate();
      this.activeList = null;
      this.setActiveList(AreaView);
    }

  },
  renderRootItem: function () {
    return this.sidebarController.$container.append(tplRootItem({
      text: 'Areas',
      id: 'AreaList'
    }))
  }
});
},{"frontend/Views/Sidebar/AreaOverview/AreaListItem":139,"templates/frontend/sidebar/root-item.hbs":207,"templates/frontend/sidebar/sidebar-area-view.hbs":208}],141:[function(require,module,exports){
//KB.Backbone.Sidebar.AreaOverview.ModuleListItem
var tplModuleViewItem = require('templates/frontend/sidebar/module-view-item.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar-module-list-container',

  initialize: function (options) {
    // parent area list
    this.$parent = options.$parent;
    // the actual DOM View
    this.parentView = this.model.View;
    this.bindHandlers();
    this.render();
  },
  events: {
    'mouseenter': 'over',
    'mouseleave': 'out',
    "click": 'scrollTo',
    "click .kb-sidebar-item__edit": "openControls",
    'click .kb-js-inline-update': 'inlineUpdate',
    'click .kb-js-inline-delete': 'inlineDelete'
  },
  bindHandlers: function () {
    this.listenTo(this.model, 'change', this.getDirty);
    this.listenTo(this.model, 'module.model.updated', this.getClean);
    this.listenTo(this.model, 'module.model.clean', this.getClean);
  },
  getDirty: function () {
    this.$el.addClass('kb-module-dirty');
  },
  getClean:function(){
    this.$el.removeClass('kb-module-dirty');
  },
  over: function () {
    this.parentView.$el.addClass('kb-in-sidebar-active');
  },
  out: function () {
    this.parentView.$el.removeClass('kb-in-sidebar-active');

  },
  openControls: function (e) {
    e.stopPropagation();
    this.parentView.openOptions();
  },
  inlineUpdate: function (e) {
    e.stopPropagation();
    this.parentView.Controls.UpdateControl.update();
    this.parentView.getClean();
  },
  inlineDelete: function(e){
    e.stopPropagation();
    this.parentView.Controls.DeleteControl.confirmRemoval();
  },
  scrollTo: function () {
    var that = this;
    jQuery('html, body').animate({
      scrollTop: that.parentView.$el.offset().top - 100
    }, 750);
  },
  render: function () {
    this.$el.append(tplModuleViewItem({view: this.model.toJSON()}));
    //this.$el.appendTo(this.$parent);
  },
  dispose: function(){
    this.stopListening();
    this.remove();
    delete this.model;
    delete this.parentView;
  }
});

},{"templates/frontend/sidebar/module-view-item.hbs":204}],142:[function(require,module,exports){
//KB.Backbone.Sidebar.StaticPanelFormView
var Config = require('common/Config');
var Payload = require('common/Payload');
var Ui = require('common/UI');
var tplPanelFormView = require('templates/frontend/sidebar/option-panel-details.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar__option-panel-wrap',
  initialize: function(options){
    this.Controller = options.controller;
    this.parentView = options.parentView;
    this.$el.append(tplPanelFormView({name: this.model.get('settings').baseId}));
    this.$form = this.$('.kb-sidebar__form-container');

  },
  events:{
    'click .kb-sidebar-action--update' : 'save',
    'click .kb-sidebar-action--close' : 'close'
  },
  render: function(){
    this.loadForm();
    return this.$el;
  },
  save: function(){
    var that = this;
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'saveStaticPanelForm',
        data: that.$form.serializeJSON(),
        panel: that.model.toJSON(),
        _ajax_nonce: Config.getNonce('update')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        //console.log(res);
      },
      error: function () {
      }
    });

  },
  loadForm: function(){
    var that = this;
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'getStaticPanelForm',
        panel: that.model.toJSON(),
        //overloadData: overloadData,
        _ajax_nonce: Config.getNonce('read')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        that.model.trigger('modal.serialize.before');
        that.$form.html(res.data.html);
        Payload.parseAdditionalJSON(res.data.json);
        that.model.trigger('modal.serialize');
        Ui.initTabs(that.$el);
      },
      error: function () {
      }
    });
  },
  close: function(){
    this.model.trigger('modal.serialize.before');
    this.parentView.closeDetails();
  }
});
},{"common/Config":22,"common/Payload":26,"common/UI":29,"templates/frontend/sidebar/option-panel-details.hbs":205}],143:[function(require,module,exports){

module.exports= Backbone.View.extend({

  tagName: 'div',
  className: 'kb-sidebar__panel-item',
  initialize: function (options) {
    this.$parent = options.$parent;
    this.Controller = options.controller;
    //this.setupFormView();
    this.render();
  },
  events: {
    'click': 'setupFormView'
  },
  render: function () {
    this.$el.append(KB.Templates.render('frontend/sidebar/panel-list-item', {name: this.model.get('args').menu.name}));
    return this.$parent.append(this.$el);
  },
  setupFormView: function () {
    this.FormView = new KB.Backbone.Sidebar.OptionsPanelFormView({
      model: this.model,
      controller: this.Controller,
      parentView: this
    });
    this.Controller.sidebarController.setExtendedView(this.FormView);
  },
  closeDetails: function () {
    this.Controller.sidebarController.closeExtendedView();
  }
});

},{}],144:[function(require,module,exports){
var StaticPanelView = require('frontend/Views/Sidebar/PanelOverview/StaticPanelView');
var OptionPanelView = require('frontend/Views/Sidebar/PanelOverview/OptionPanelView');
var tplRootItem = require('templates/frontend/sidebar/root-item.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar-main-panel panel-view',
  Panels: new Backbone.Collection(), // Area models
  PanelViews: {
    option: {},
    static: {}
  }, // attached Area Views
  activeList: null,

  initialize: function (options) {
    this.sidebarController = options.controller;
    this.render();
    this.bindHandlers();

  },
  render: function () {
    return this.$el;
  },
  bindHandlers: function () {
    this.listenTo(KB.Panels, 'add', this.createPanelItem);
  },
  createPanelItem: function (model) {
    if (!model.get('settings').frontend) {
      return;
    }


    if (model.get('type') && model.get('type') === 'option') {
      this.PanelViews.option[model.get('baseId')] = new OptionPanelView({
        model: model,
        $parent: this.$el,
        controller: this
      })
    }

    if (model.get('type') && model.get('type') === 'static') {
      this.PanelViews.static[model.get('baseId')] = new StaticPanelView({
        model: model,
        $parent: this.$el,
        controller: this
      })
    }
  },
  renderRootItem: function () {
    return this.sidebarController.$container.append(tplRootItem('frontend/sidebar/root-item', {
      text: 'Panels',
      id: 'PanelList'
    }))
  }
});
},{"frontend/Views/Sidebar/PanelOverview/OptionPanelView":143,"frontend/Views/Sidebar/PanelOverview/StaticPanelView":145,"templates/frontend/sidebar/root-item.hbs":207}],145:[function(require,module,exports){
var tplPanelListItem = require('templates/frontend/sidebar/panel-list-item.hbs');
var StaticPanelFormView = require('frontend/Views/Sidebar/PanelDetails/StaticPanelFormView');
module.exports = Backbone.View.extend({

  tagName: 'div',
  className: 'kb-sidebar__panel-item',
  initialize: function (options) {
    this.$parent = options.$parent;
    this.Controller = options.controller;
    //this.setupFormView();
    this.render();
  },
  events: {
    'click' : 'setupFormView'
  },
  render: function () {
    this.$el.append(tplPanelListItem({ name: this.model.get('settings').baseId} ));
    return this.$parent.append(this.$el);
  },
  setupFormView: function(){
    this.FormView = new StaticPanelFormView({
      model: this.model,
      controller: this.Controller,
      parentView: this
    });
    this.Controller.sidebarController.setExtendedView(this.FormView);
  },
  closeDetails: function(){
    this.Controller.sidebarController.closeExtendedView();
  }
});

},{"frontend/Views/Sidebar/PanelDetails/StaticPanelFormView":142,"templates/frontend/sidebar/panel-list-item.hbs":206}],146:[function(require,module,exports){
//KB.Backbone.Sidebar.Header
var tplSidebarHeader = require('templates/frontend/sidebar/sidebar-header.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar__header',
  initialize: function () {
    this.$el.append(tplSidebarHeader({}));
  },
  render: function () {
    return this.$el;
  }

});
},{"templates/frontend/sidebar/sidebar-header.hbs":209}],147:[function(require,module,exports){
var Notice = require('common/Notice');
var tplChangeObserver = require('templates/frontend/change-observer.hbs');
var I18n = require('common/I18n');
var Config = require('common/Config');
module.exports = Backbone.View.extend({
  models: new Backbone.Collection(),
  className: 'kb-change-observer',
  initialize: function () {
    this.listenTo(KB.Modules, 'add', this.attachHandler);
    //this.listenTo(KB.Panels, 'add', this.attachHandler);
    this.render();
  },
  events: {
    'click .kb-button': 'saveAll'
  },
  render: function () {
    this.$el.append(tplChangeObserver({
      strings: I18n.getString('UI.changeObserver')
    }));
    this.$el.appendTo('body');
  },
  attachHandler: function (model) {
    this.listenTo(model, 'change:entityData', this.add);
    this.listenTo(model, 'module.model.updated', this.remove);
    this.listenTo(model, 'module.model.clean', this.remove);
  },
  add: function (model) {
    this.models.add(model);
    this.trigger('change');
    this.handleState();
  },
  remove: function (model) {
    this.models.remove(model, {silent: true});
    this.trigger('change');
    this.handleState();
  },
  getModels: function () {
    return this.models;
  },
  saveAll: function () {
    tinyMCE.triggerSave();
    _.each(this.models.models, function (model) {
      model.sync(true);
    });
    if (!Config.isAdmin()) {
      Notice.notice('Data is safe.', 'success');
    }
    this.trigger('change');
  },
  handleState: function () {
    var l = this.models.models.length;
    if (l > 0) {
      this.$el.addClass('show');
    } else {
      this.$el.removeClass('show');
    }
  }


});
},{"common/Config":22,"common/I18n":23,"common/Notice":25,"templates/frontend/change-observer.hbs":196}],148:[function(require,module,exports){
module.exports = Backbone.Collection.extend({

  initialize: function(){
    this.listenTo(this, 'add', this.attachHandler);
  },
  attachHandler: function(model){
    this.listenTo(model, 'remove', this.removeModel);
  },
  removeModel: function(model){
    this.remove(model,{silent:true});
  }

});
},{}],149:[function(require,module,exports){
//KB.Backbone.ModuleBrowser
var ModuleDefinitions = require('shared/ModuleBrowser/ModuleBrowserDefinitions');
var ModuleDefModel = require('shared/ModuleBrowser/ModuleDefinitionModel');
var ModuleBrowserDescription = require('shared/ModuleBrowser/ModuleBrowserDescriptions');
var ModuleBrowserNavigation = require('shared/ModuleBrowser/ModuleBrowserNavigation');
var Checks = require('common/Checks');
var Notice = require('common/Notice');
var Payload = require('common/Payload');
var Ajax = require('common/Ajax');
var TinyMCE = require('common/TinyMCE');
var Config = require('common/Config');

var tplModuleBrowser = require('templates/backend/modulebrowser/module-browser.hbs');

module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.options = options || {};
    this.isOpen = false;
    this.area = this.options.area;
    this.viewMode = this.getViewMode();
    this.modulesDefinitions = new ModuleDefinitions(this.prepareAssignedModules(), {
      model: ModuleDefModel,
      area: this.options.area
    }).setup();

    // render and append the skeleton markup to the browsers root element
    this.$el.append(tplModuleBrowser({viewMode: this.getViewModeClass()}));

    this.$backdrop = jQuery('<div class="kb-module-browser--backdrop"></div>');

    // render the list sub view
    //this.subviews.ModulesList = new ModuleBrowserList({
    //  el: jQuery('.modules-list', this.$el),
    //  browser: this
    //});

    this.$list = jQuery('.modules-list', this.$el);
    // render description sub view
    this.subviews.ModuleDescription = new ModuleBrowserDescription({
      el: jQuery('.module-description', this.$el),
      browser: this
    });
    // render tab navigation subview
    this.subviews.Navigation = new ModuleBrowserNavigation({
      el: jQuery('.module-categories', this.$el),
      cats: this.modulesDefinitions.categories,
      browser: this
    });

    // bind to navigation views custom change event
    this.listenTo(this.subviews.Navigation, 'browser:change', this.update);

    this.bindHandlers();

  },
  // element tag
  tagName: 'div',
  // element id
  id: 'module-browser',
  //element class
  className: 'kb-overlay',
  //events
  events: {
    'click .close-browser': 'close',
    'click .module-browser--switch__list-view': 'toggleViewMode',
    'click .module-browser--switch__grid-view': 'toggleViewMode'
  },
  subviews: {},
  toggleViewMode: function () {
    jQuery('.module-browser-wrapper', this.$el).toggleClass('module-browser--list-view module-browser--grid-view');
    var abbr = 'mdb_' + this.area.model.get('id') + '_state';
    var curr = store.get(abbr);
    if (curr == 'list') {
      this.viewMode = 'grid';
      store.set(abbr, 'grid');
    } else {
      this.viewMode = 'list';
      store.set(abbr, 'list');
    }
  },

  // this method gets called when the user clicks on 'add module'
  // prepares the modules for the browser
  // calls 'open'
  render: function () {
    this.open();
  },
  getViewMode: function () {

    var abbr = 'mdb_' + this.area.model.get('id') + '_state';
    if (store.get(abbr)) {
      return store.get(abbr);
    } else {
      store.set(abbr, 'list');
    }

    return 'list';
  },
  getViewModeClass: function () {
    if (this.viewMode === 'list') {
      return 'module-browser--list-view';
    } else {
      return 'module-browser--grid-view';
    }
  },
  bindHandlers: function () {
    var that = this;
    jQuery('body').on('click', function (e) {
      if (that.isOpen) {
        if (jQuery(e.target).is('.kb-module-browser--backdrop')) {
          that.close();
        }
      }
    });

    jQuery(document).keydown(function (e) {
      if (!that.isOpen) {
        return;
      }
      switch (e.which) {
        case 27:
          that.close();
          break;

        default:
          return; // exit this handler for other keys
      }
      e.preventDefault(); // prevent the default action (scroll / move caret)
    });
  },
  open: function () {
    // render root element
    this.$el.appendTo('body');
    this.$backdrop.appendTo('body');
    // add class to root element of wp admin screen
    jQuery('#wpwrap').addClass('module-browser-open');
    jQuery('.kb-nano').nanoScroller({
      flash: true,
      contentClass: 'kb-nano-content'
    });
    this.isOpen = true;
  },
  // close the browser
  // TODO clean up and remove all references & bindings
  close: function () {
    jQuery('#wpwrap').removeClass('module-browser-open');
    this.trigger('browser:close');
    this.$backdrop.detach();
    this.$el.detach();
    this.isOpen = false;
  },
  // update list view upon navigation
  update: function (cat) {
    var id = cat.model.get('id');
    var modules = this.modulesDefinitions.getModules(id);
    //this.subviews.ModulesList.setModules(modules).update();
    cat.renderList();
//        this.listenTo(this.subviews.ModulesList, 'loadDetails', this.loadDetails);

  },
  // update details in description view
  loadDetails: function (model) {
    this.subviews.ModuleDescription.model = model;
    this.subviews.ModuleDescription.update();
  },
  // create module action
  createModule: function (module) {
    var Area, data;
    // check if capability is right for this action
    if (Checks.userCan('create_kontentblocks')) {
    } else {
      Notice.notice('You\'re not allowed to do this', 'error');
    }

    // check if block limit isn't reached
    Area = KB.Areas.get(this.options.area.model.get('id'));
    if (!Checks.blockLimit(Area)) {
      Notice.notice('Limit for this area reached', 'error');
      return false;
    }
    // prepare data to send
    data = {
      action: 'createNewModule',
      'class': module.get('settings').class,
      globalModule: module.get('globalModule'),
      parentObject: module.get('parentObject'),
      parentObjectId: module.get('parentObjectId'),
      areaContext: this.options.area.model.get('context'),
      area: this.options.area.model.get('id'),
      _ajax_nonce: Config.getNonce('create'),
      frontend: KB.appData.config.frontend,
      submodule: false
    };

    if (this.options.area.model.get('parent_id')) {
      data.postId = this.options.area.model.get('parent_id');
    }

    this.close();
    Ajax.send(data, this.success, this);
  },
  // create module success callback
  // TODO Re-initialize ui components
  success: function (res) {
    var model, data;
    data = res.data;
    this.options.area.$modulesList.append(data.html);
    model = KB.ObjectProxy.add(KB.Modules.add(data.module));
    this.options.area.attachModule(model);
    this.parseAdditionalJSON(data.json);
    model.View.trigger('toggle.open');

    setTimeout(function () {
      KB.Fields.trigger('newModule', model.View);
      TinyMCE.addEditor(model.View.$el);
    }, 150);

    this.trigger('browser.module.created', {res: res})

    // repaint
    // add module to collection
  },
  parseAdditionalJSON: function (json) {
    // create the object if it doesn't exist already
    if (!KB.payload.Fields) {
      KB.payload.Fields = {};
    }
    _.extend(KB.payload.Fields, json.Fields);
    Payload.parseAdditionalJSON(json); // this will add new fields to the FieldConfigs collection
  },
  // helper method to convert list of assigned classnames to object with module definitions
  prepareAssignedModules: function () {
    var assignedModules = this.area.model.get('assignedModules');
    var fullDefs = [];
    // @TODO a module class which was assigned to an area is not necessarily present

    _.each(Payload.getPayload('ModuleDefinitions'), function (module) {
      if (_.indexOf(assignedModules, module.settings.class) !== -1) {
        fullDefs.push(module);
      }
    });
    KB.Events.trigger('module.browser.setup.defs', this, fullDefs);
    return fullDefs;
  }
});
},{"common/Ajax":20,"common/Checks":21,"common/Config":22,"common/Notice":25,"common/Payload":26,"common/TinyMCE":28,"shared/ModuleBrowser/ModuleBrowserDefinitions":150,"shared/ModuleBrowser/ModuleBrowserDescriptions":151,"shared/ModuleBrowser/ModuleBrowserNavigation":154,"shared/ModuleBrowser/ModuleDefinitionModel":156,"templates/backend/modulebrowser/module-browser.hbs":163}],150:[function(require,module,exports){
var Payload = require('common/Payload');
var Checks = require('common/Checks');

module.exports = Backbone.Collection.extend({

  initialize: function (models, options) {
    this.area = options.area;
  },
  setup: function () {
    this.categories = this.prepareCategories();
    this.sortToCategories();
    return this;
  },
  getModules: function (id) {
    if (this.categories[id]) {
      return this.categories[id].modules;
    }
  },
  getCategories: function () {
    return this.categories;
  },
  sortToCategories: function () {
    var that = this;
    _.each(this.models, function (model) {
      if (!that.validateVisibility(model)) {
        return;
      }
      var cat = (_.isUndefined(model.get('settings').category)) ? 'standard' : model.get('settings').category;
      that.categories[cat].modules.push(model);
    });
  },
  validateVisibility: function (m) {

    if (!Checks.userCan(m.get('settings').cap)){
      return false;
    }

    if (m.get('settings').hidden) {
      return false;
    }

    if (m.get('settings').disabled) {
      return false;
    }
    return !(!m.get('settings').globalModule && this.area.model.get('dynamic'));

  },
  prepareCategories: function () {
    var cats = {};
    var pCats = Payload.getPayload('ModuleCategories');
    _.each(pCats, function (item, key) {
      cats[key] = {
        id: key,
        name: item,
        modules: []
      };
    });
    KB.Events.trigger('module.browser.setup.cats', cats);
    return cats;
  }
});
},{"common/Checks":21,"common/Payload":26}],151:[function(require,module,exports){
//KB.Backbone.ModuleBrowserModuleDescription
var tplModuleTemplateDescription = require('templates/backend/modulebrowser/module-template-description.hbs');
var tplModuleDescription = require('templates/backend/modulebrowser/module-description.hbs');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Browser = options.browser;
    this.Browser.on('browser:close', this.close, this);
  },
  events:{
    'click .kb-js-create-module' : 'createModule'
  },
  update: function () {
    var that = this;
    this.$el.empty();
    if (this.model.get('template')) {
      this.$el.html(tplModuleTemplateDescription( {module: this.model.toJSON(), i18n: KB.i18n}));
    } else {
      this.$el.html(tplModuleDescription({module: this.model.toJSON(), i18n: KB.i18n}));
    }

    if (this.model.get('settings').helptext !== false) {
      this.$el.append(this.model.get('settings').helptext);
    } 
  },
  close: function () {
//        this.unbind();
//        this.remove();
//        delete this.$el;
//        delete this.el;
  },
  createModule: function(){
    this.Browser.createModule(this.model);

  }
});

},{"templates/backend/modulebrowser/module-description.hbs":164,"templates/backend/modulebrowser/module-template-description.hbs":166}],152:[function(require,module,exports){
//KB.Backbone.ModuleBrowserModulesList
var ListItem = require('shared/ModuleBrowser/ModuleBrowserListItem');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.options = options || {};
    this.cat = options.cat;
  },
  modules: {},
  subviews: {},
  // set modules to render
  setModules: function (modules) {
    this.modules = modules;
    return this;
  },
  // render current modules to list
  update: function () {
    var that = this;
    // flag the first
    var first = false;
    this.$el.empty();
    var modules = this.cat.model.get('modules');
    modules.sort(function(a,b) {return (a.get('settings').name > b.get('settings').name) ? 1 : ((b.get('settings').name > a.get('settings').name) ? -1 : 0);} );
    _.each(modules, function (module) {
      that.subviews[module.cid] = new ListItem({
        model: module,
        parent: that,
        browser: that.options.browser
      });

      if (first === false) {
        that.options.browser.loadDetails(module);
        first = !first;
      }
      that.$el.append(that.subviews[module.cid].render(that.$el));
    });
  },
  render: function(){
  }
});
},{"shared/ModuleBrowser/ModuleBrowserListItem":153}],153:[function(require,module,exports){
//KB.Backbone.ModuleBrowserListItem
var tplTemplateListItem = require('templates/backend/modulebrowser/module-template-list-item.hbs');
var tplListItem = require('templates/backend/modulebrowser/module-list-item.hbs');
var tplModulePoster = require('templates/backend/modulebrowser/poster.hbs');

module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'modules-list-item',
  initialize: function (options) {
    this.options = options || {};
    this.Browser = options.browser;
    // shorthand to parent area
    this.area = options.browser.area;
    // listen to browser close event
//        this.options.parent.options.browser.on('browser:close', this.close, this);
  },
  // render list
  render: function (el) {
    if (this.model.get('globalModule')) {
      this.$el.html(tplTemplateListItem({module: this.model.toJSON(), i18n: KB.i18n}));
    } else {
      this.$el.html(tplListItem({module: this.model.toJSON(), i18n: KB.i18n}));
    }
    el.append(this.$el);

    if (this.model.get('settings').poster !== false) {
      this.$el.qtip({
        content: {
          text: tplModulePoster({module: this.model.toJSON()}),
        },
        style: {
          classes: 'kb-qtip'
        },
        position:{
          my: 'top left',
          at: 'bottom right',
          target: 'mouse',
          adjust:{
            x: 80,
            y: 20
          }
        }
      });
    }

  },
  events: {
    'click': 'handleClick',
    'click .kb-js-create-module': 'handlePlusClick'
  },
  handleClick: function () {
    if (this.Browser.viewMode === 'list') {
      this.createModule();
    } else {
      this.Browser.loadDetails(this.model);
    }
  },
  handlePlusClick: function () {
    if (this.Browser.viewMode === 'list') {
      this.handleClick();
      return false;
    } else {
      this.createModule();
    }
  },
  createModule: function () {
    this.Browser.createModule(this.model);
  },
  close: function () {
    this.remove();
  }

});
},{"templates/backend/modulebrowser/module-list-item.hbs":165,"templates/backend/modulebrowser/module-template-list-item.hbs":167,"templates/backend/modulebrowser/poster.hbs":168}],154:[function(require,module,exports){
var ModuleBrowserTabItemView = require('shared/ModuleBrowser/ModuleBrowserTabItemView');
module.exports = Backbone.View.extend({
  catSet: false,
  initialize: function (options) {
    var that = this;
    this.options = options || {};
    this.$list = jQuery('<div></div>').appendTo(this.$el);
    _.each(this.options.cats, function (cat) {
      var model = new Backbone.Model(cat);
      new ModuleBrowserTabItemView({parent: that, model: model, browser: that.options.browser}).render();
    });

  }

});
},{"shared/ModuleBrowser/ModuleBrowserTabItemView":155}],155:[function(require,module,exports){
var ModuleBrowserList = require('shared/ModuleBrowser/ModuleBrowserList');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.options = options || {};
    if (this.model.get('listRenderer')) {
      var renderer = this.model.get('listRenderer');
      this.listRenderer = new renderer({cat: this, el: options.browser.$list, browser: options.browser});
    } else {
      this.listRenderer = new ModuleBrowserList({cat: this, el: options.browser.$list, browser: options.browser});
    }
  },
  tagName: 'div',
  className: 'cat-item',
  events: {
    'click': 'change'
  },
  change: function () {
    this.options.parent.trigger('browser:change', this);
    this.$el.addClass('active');
    jQuery('.cat-item').not(this.$el).removeClass('active');
  },
  render: function () {
    var count = _.keys(this.model.get('modules')).length;
    var countstr = ' (' + count + ')';

    if (count === 0) {
      return false;
    }

    if (this.options.parent.catSet === false) {
      this.options.parent.catSet = true;
      this.options.browser.update(this);
      this.$el.addClass('active');
    }

    this.options.parent.$list.append(this.$el.html(this.model.get('name') + '<span class="module-count">' + countstr + '</span>'));
  },
  renderList: function () {
    this.listRenderer.update();
  }
});
},{"shared/ModuleBrowser/ModuleBrowserList":152}],156:[function(require,module,exports){
//KB.Backbone.ModuleDefinition
module.exports = Backbone.Model.extend({
  initialize: function () {
    var that = this;
    this.id = (function () {
      if (that.get('settings').category === 'template') {
        return that.get('mid');
      } else {
        return that.get('settings').class;
      }
    }());
  }
});
},{}],157:[function(require,module,exports){
var ControlsView = require('backend/Views/ModuleControls/ControlsView');

module.exports = ControlsView.extend({
  tagName: 'div',
  className: 'kb-module--status-bar-list',
  initialize: function (options) {
    this.$menuWrap = jQuery('.kb-module--status-bar', this.$el); //set outer element
    this.$menuWrap.append("<div class='kb-module--status-bar-list'></div>"); // render template
    this.$menuList = jQuery('.kb-module--status-bar-list', this.$menuWrap);
  }

});
},{"backend/Views/ModuleControls/ControlsView":8}],158:[function(require,module,exports){
var BaseView = require('backend/Views/BaseControlView');
var tplPublishStatus = require('templates/backend/status/publish.hbs');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var I18n = require('common/I18n');
var Checks = require('common/Checks');

module.exports = BaseView.extend({
  id: 'publish',
  className: 'kb-status-draft',
  events: {
    'click': 'toggleDraft'
  },
  isValid: function () {

    if (!Checks.userCan(this.model.get('settings').cap)){
      return false;
    }

    if (KB.Environment && KB.Environment.postType === "kb-gmd" ){
      return false;
    }
    return true;
  },
  render: function () {
    var draft = this.model.get('state').draft;
    var $parent = this.model.View.$el;
    this.$el.append(tplPublishStatus({
      draft: this.model.get('state').draft,
      strings: I18n.getString('Modules.tooltips')
    }));
    if (draft) {
      $parent.addClass('kb-module-draft');
    } else {
      $parent.removeClass('kb-module-draft');
    }
  },
  toggleDraft: function () {
    var that = this;
    Ajax.send({
      action: 'undraftModule',
      module: this.model.toJSON(),
      _ajax_nonce: Config.getNonce('update')
    }).done(function () {
      that.model.get('state').draft = !that.model.get('state').draft;
      that.$el.empty();
      that.render();
      that.model.trigger('change:state', that.model.get('state'));
    });
  }

});
},{"backend/Views/BaseControlView":1,"common/Ajax":20,"common/Checks":21,"common/Config":22,"common/I18n":23,"templates/backend/status/publish.hbs":169}],159:[function(require,module,exports){
var BaseView = require('backend/Views/BaseControlView');
var tplTemplatesStatus = require('templates/backend/status/templates.hbs');
var CodemirrorOverlay = require('backend/Views/TemplateEditor/CodemirrorOverlay');
var Checks = require('common/Checks');

module.exports = BaseView.extend({
  id: 'templates',
  controller: null,
  className: 'kb-status-templates',
  initialize: function (options) {
    this.moduleView = options.parent;
    this.views = this.prepareViews(this.model.get('views'));
  },
  attributes:{
    'aria-label': 'Modultemplate Auswahl'
  },
  events: {
    'dblclick': 'openEditor'
  },
  isValid: function () {
    if (!Checks.userCan(this.model.get('settings').cap)){
      return false;
    }
    return true;
  },
  render: function (views) {
    var selectViews = views || this.views;
    var show = (_.size(selectViews) > 1);
    this.$el.empty().append(tplTemplatesStatus({show: show, module: this.model.toJSON(), views: selectViews}));
  },
  openEditor: function () {
    var editor = new CodemirrorOverlay({views: this.views, module: this.model});
  },
  prepareViews: function (views) {
    return _.map(views, function (view) {
      view.selected = (view.filename === this.model.get('viewfile')) ? 'selected="selected"' : '';
      view.isActive = (view.filename === this.model.get('viewfile'));
      return view;
    }, this);
  }
});
},{"backend/Views/BaseControlView":1,"backend/Views/TemplateEditor/CodemirrorOverlay":9,"common/Checks":21,"templates/backend/status/templates.hbs":170}],160:[function(require,module,exports){
/*
 Simple Get/Set implementation to set and get views
 No magic here
 */
KB.ViewsCollection = function () {
  this.views = {};
  this.lastViewAdded = null;
  this.add = function (id, view) {
    if (!this.views[id]) {
      this.views[id] = view;
      KB.trigger('kb:' + view.model.get('class') + ':added', view);
      this.trigger('view:add', view);
      this.lastViewAdded = view;
    }
    return view;

  };

  this.ready = function () {
    _.each(this.views, function (view) {
      view.trigger('kb:' + view.model.get('class'), view);
      KB.trigger('kb:' + view.model.get('class') + ':loaded', view);
    });
    KB.trigger('kb:ready');
  };

  this.readyOnFront = function () {
    _.each(this.views, function (view) {
      view.trigger('kb:' + view.model.get('class'), view);
      KB.trigger('kb:' + view.model.get('class') + ':loadedOnFront', view);
    });
    KB.trigger('kb:ready');
  };


  this.remove = function (id) {
    var V = this.get(id);
    V.model.Area.View.trigger('kb.module.deleted', V);
    this.trigger('kb.modules.view.deleted', V);
    delete this.views[id];
    V.dispose();
  };

  this.get = function (id) {
    if (this.views[id]) {
      return this.views[id];
    }
  };

  this.filterByModelAttr = function (attr, value) {
    return _.filter(this.views, function (view) {
      return (view.model.get(attr)) === value;
    });
  };

};

_.extend(KB.ViewsCollection.prototype, Backbone.Events);
module.exports = KB.ViewsCollection;
},{}],161:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"kb-context-bar grid__col grid__col--12-of-12\" aria-hidden=\"true\">\n    <div class=\"kb-context-bar--actions\">\n\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],162:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"kb-fullscreen--holder-wrap\">\n    <div class=\"kb-fullscreen--controls\">\n        <div class=\"kb-fullscreen-js-close\"><span class=\"dashicons dashicons-no-alt\"></span></div>\n    </div>\n    <div class=\"kb-nano\">\n        <div class=\"kb-fullscreen--inner kb-nano-content\">\n\n        </div>\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],163:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"module-browser-wrapper "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"viewMode") || (depth0 != null ? lookupProperty(depth0,"viewMode") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"viewMode","hash":{},"data":data,"loc":{"start":{"line":1,"column":35},"end":{"line":1,"column":49}}}) : helper)))
    + "\">\n\n    <div class=\"module-browser-header module-categories\">\n        <div class=\"genericon genericon-close-alt close-browser kb-button\"></div>\n        <div class=\"dashicons dashicons-list-view module-browser--switch__list-view kb-hide\"></div>\n        <div class=\"dashicons dashicons-exerpt-view module-browser--switch__excerpt-view kb-hide\"></div>\n        <div class=\"dashicons dashicons-grid-view module-browser--switch__grid-view kb-hide\"></div>\n    </div>\n\n    <div class=\"module-browser__left-column kb-nano\">\n        <div class=\"modules-list kb-nano-content\">\n\n        </div>\n    </div>\n\n    <div class=\"module-browser__right-column kb-nano\">\n        <div class=\"module-description kb-nano-content\">\n\n        </div>\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],164:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h3>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"module") : depth0)) != null ? lookupProperty(stack1,"settings") : stack1)) != null ? lookupProperty(stack1,"publicName") : stack1), depth0))
    + " <div class=\"kb-button-small kb-js-create-module\">"
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"EditScreen") : stack1)) != null ? lookupProperty(stack1,"moduleBrowser") : stack1)) != null ? lookupProperty(stack1,"addModule") : stack1), depth0))
    + "</div>\n</h3>\n";
},"useData":true});

},{"hbsfy/runtime":256}],165:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kbmb-icon "
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"module") : depth0)) != null ? lookupProperty(stack1,"settings") : stack1)) != null ? lookupProperty(stack1,"iconclass") : stack1), depth0))
    + "\"></div>\n<div class=\"kbmb-hl\">"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"module") : depth0)) != null ? lookupProperty(stack1,"settings") : stack1)) != null ? lookupProperty(stack1,"name") : stack1), depth0))
    + "</div>\n<div class=\"kbmb-description\">"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"module") : depth0)) != null ? lookupProperty(stack1,"settings") : stack1)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</div>";
},"useData":true});

},{"hbsfy/runtime":256}],166:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h3>"
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"module") : depth0)) != null ? lookupProperty(stack1,"parentObject") : stack1)) != null ? lookupProperty(stack1,"post_title") : stack1), depth0))
    + "</h3>";
},"useData":true});

},{"hbsfy/runtime":256}],167:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"dashicons dashicons-plus kb-js-create-module\"></div>\n<div class=\"kbmb-hl\">"
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"module") : depth0)) != null ? lookupProperty(stack1,"parentObject") : stack1)) != null ? lookupProperty(stack1,"post_title") : stack1), depth0))
    + "</div>";
},"useData":true});

},{"hbsfy/runtime":256}],168:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"module-browser--poster-wrap\">\n    <img src=\""
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"module") : depth0)) != null ? lookupProperty(stack1,"settings") : stack1)) != null ? lookupProperty(stack1,"poster") : stack1), depth0))
    + "\" >\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],169:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <div class=\"kb-status-draft kb-button-small\" data-kbtooltip=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"strings") : depth0)) != null ? lookupProperty(stack1,"tooltipUndraft") : stack1), depth0))
    + "\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"strings") : depth0)) != null ? lookupProperty(stack1,"draft") : stack1), depth0))
    + "</div>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "   <div class=\"kb-status-public kb-button-small\" data-kbtooltip=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"strings") : depth0)) != null ? lookupProperty(stack1,"tooltipDraft") : stack1), depth0))
    + "\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"strings") : depth0)) != null ? lookupProperty(stack1,"published") : stack1), depth0))
    + "</div>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"draft") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "");
},"useData":true});

},{"hbsfy/runtime":256}],170:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <div class=\"kb-template-selector--wrapper\">\n        <div class=\"kb-selectbox\">\n            <select class=\"kb-template-select\" data-kb-rel=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"module") : depth0)) != null ? lookupProperty(stack1,"mid") : stack1), depth0))
    + "\" name=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"module") : depth0)) != null ? lookupProperty(stack1,"mid") : stack1), depth0))
    + "[viewfile]\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"views") : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":16},"end":{"line":8,"column":25}}})) != null ? stack1 : "")
    + "            </select>\n        </div>\n    </div>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <option "
    + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0,"selected") : depth0), depth0)) != null ? stack1 : "")
    + " value=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"filename") : depth0), depth0))
    + "\"\n                                                data-tpldesc=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"description") : depth0), depth0))
    + "\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0))
    + "</option>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <input name=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"module") : depth0)) != null ? lookupProperty(stack1,"mid") : stack1), depth0))
    + "[viewfile]\" type=\"hidden\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"module") : depth0)) != null ? lookupProperty(stack1,"viewfile") : stack1), depth0))
    + "\">\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"show") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(4, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":14,"column":7}}})) != null ? stack1 : "")
    + "\n";
},"useData":true});

},{"hbsfy/runtime":256}],171:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-tpled--field-item\">\n    <div><strong>Label:</strong>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"args") : stack1)) != null ? lookupProperty(stack1,"label") : stack1), depth0))
    + "</div>\n    <div class=\"kb-tpled--details\">\n        <div><strong>Type:</strong>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"type") : stack1), depth0))
    + "</div>\n        <div><strong>Key:</strong>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"key") : stack1), depth0))
    + "</div>\n        <div><strong>Access:</strong>Model."
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"kpath") : stack1), depth0))
    + "</div>\n        <div><strong>Value:</strong>Model."
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"value") : stack1), depth0))
    + "</div>\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],172:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-template-edditor--file-item\">\n    "
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"name") : stack1), depth0))
    + "\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],173:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"kb-tpled--wrap\">\n\n    <div class=\"kb-tpled--header\">\n        <div class=\"kb-fullscreen--controls\">\n            <div class=\"kb-tpled--close\"><span class=\"dashicons dashicons-no-alt\"></span></div>\n        </div>\n    </div>\n    <div class=\"kb-tpled--inner kbflexwrap\">\n        <div class=\"kb-tpled--sidebar kbflex\">\n            <div class=\"kb-tpled--views\">\n                <h5>Templates</h5>\n                <div data-views></div>\n            </div>\n            <div class=\"kb-tpled--actions\">\n                <h5>Actions</h5>\n                <div data-controls></div>\n            </div>\n        </div>\n        <div class=\"kb-tpled--content kbflex\">\n            <div id=\"codemirror\"></div>\n\n        </div>\n        <div class=\"kb-tpled--sidebar kb-tpled--sidebar-right kbflex\">\n            <div class=\"kb-tpled--fields\">\n                <h5>Available Datafields</h5>\n                <div data-fields></div>\n            </div>\n        </div>\n    </div>\n    <div class=\"kb-tpled--footer\">\n\n    </div>\n\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],174:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    return "checked=\"checked\"";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), alias4=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field kb-js-field field-api-checkbox kb-field--checkbox\">\n    <label class=\"heading\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"label") : stack1), depth0))
    + "\n        <input type=\"checkbox\""
    + ((stack1 = (lookupProperty(helpers,"ifCond")||(depth0 && lookupProperty(depth0,"ifCond"))||alias4).call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1),"==",true,{"name":"ifCond","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":30},"end":{"line":3,"column":92}}})) != null ? stack1 : "")
    + "\n               name=\""
    + alias2((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||alias4).call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":4,"column":21},"end":{"line":4,"column":76}}}))
    + "\">\n    </label>\n    <p class=\"description\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</p>\n</div>\n";
},"useData":true});

},{"hbsfy/runtime":256}],175:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field kb-js-field field-api-text kb-field--text\">\n    <label class=\"heading\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"label") : stack1), depth0))
    + "</label>\n    <input class='kb-color-picker' data-alpha=\"true\" type='text' name='"
    + alias2((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":3,"column":71},"end":{"line":3,"column":126}}}))
    + "' }}'\n    value='"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1), depth0))
    + "' size='7'/>\n    <p class=\"description\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</p>\n</div>\n";
},"useData":true});

},{"hbsfy/runtime":256}],176:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field--date-multiple-item\">\n    <div class=\"kb-field--date-multiple-control kbf-sort\"><span class=\"dashicons dashicons-menu hide\"></span></div>\n    <input type='text'  name='"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1), depth0))
    + "["
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"uniqueId") : stack1), depth0))
    + "][human]'\n           value='"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"human") : stack1), depth0))
    + "' class='kb-datetimepicker'>\n    <input type='hidden' name='"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1), depth0))
    + "["
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"uniqueId") : stack1), depth0))
    + "][unix]' value='"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"unix") : stack1), depth0))
    + "'\n           class='kb-datetimepicker--js-unix'>\n    <input type='hidden' name='"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1), depth0))
    + "["
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"uniqueId") : stack1), depth0))
    + "][sql]' value='"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"sql") : stack1), depth0))
    + "'\n           class='kb-datetimepicker--js-sql'>\n    <div data-kbfaction=\"delete\" class=\"kb-field--text-multiple-control kbf-delete\"><span class=\"dashicons dashicons-trash\" ></span></div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],177:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), alias4=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field kb-js-field kb-field--datetime field-api-datetime\">\n<label class=\"heading\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"label") : stack1), depth0))
    + "</label>\n<div class=\"kb-field--datetime-item\">\n\n    <input type=\"text\" name='"
    + alias2((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||alias4).call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":5,"column":29},"end":{"line":5,"column":84}}}))
    + "[human]'\n           value='"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"human") : stack1), depth0))
    + "' class='kb-datetimepicker'>\n    <input type='hidden' name='"
    + alias2((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||alias4).call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":7,"column":31},"end":{"line":7,"column":86}}}))
    + "[unix]' value='"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"unix") : stack1), depth0))
    + "'\n           class='kb-datetimepicker--js-unix'>\n    <input type='hidden' name='"
    + alias2((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||alias4).call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":9,"column":31},"end":{"line":9,"column":86}}}))
    + "[sql]' value='"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"sql") : stack1), depth0))
    + "'\n           class='kb-datetimepicker--js-sql'>\n</div>\n<p class=\"description\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</p>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],178:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field kb-js-field field-api-editor\">\n    <label class=\"heading\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"label") : stack1), depth0))
    + "</label>\n    <div class=\"kb-ff-editor-wrapper-"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1), depth0))
    + "-"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"key") : stack1), depth0))
    + "\">\n    </div>\n    <p class=\"description\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</p>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],179:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), alias4=container.hooks.helperMissing, alias5="function", lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<label class=\"heading\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"label") : stack1), depth0))
    + "</label>\n<div class='kb-field-file-wrapper "
    + alias2(((helper = (helper = lookupProperty(helpers,"isEmpty") || (depth0 != null ? lookupProperty(depth0,"isEmpty") : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"isEmpty","hash":{},"data":data,"loc":{"start":{"line":2,"column":34},"end":{"line":2,"column":47}}}) : helper)))
    + "'>\n    <table>\n        <tbody>\n        <tr>\n            <td>ID:</td>\n            <td><span class=\"kb-file-id\">"
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"file") : stack1)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "</span></td>\n        </tr>\n        <tr>\n            <td>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"title") : stack1), depth0))
    + "</td>\n            <td><span class=\"kb-file-title\">"
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"file") : stack1)) != null ? lookupProperty(stack1,"title") : stack1), depth0))
    + "</span></td>\n        </tr>\n        <tr>\n            <td>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"filename") : stack1), depth0))
    + "</td>\n            <td><span class=\"kb-file-filename\">"
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"file") : stack1)) != null ? lookupProperty(stack1,"filename") : stack1), depth0))
    + "</span></td>\n        </tr>\n        <tr>\n            <td>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"editLink") : stack1), depth0))
    + "</td>\n            <td><a class=\"kb-file-editLink\" href=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"file") : stack1)) != null ? lookupProperty(stack1,"editLink") : stack1), depth0))
    + "\">edit</a></td>\n        </tr>\n        </tbody>\n    </table>\n    <input type=\"hidden\" class=\"kb-file-attachment-id\" value=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"file") : stack1)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\"\n           name=\""
    + alias2((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||alias4).call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":24,"column":17},"end":{"line":24,"column":72}}}))
    + "[id]\">\n</div>\n<a class=\"button primary kb-js-add-file\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"selectFile") : stack1), depth0))
    + "</a>\n<a class=\"kb-js-reset-file "
    + alias2(((helper = (helper = lookupProperty(helpers,"isEmpty") || (depth0 != null ? lookupProperty(depth0,"isEmpty") : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"isEmpty","hash":{},"data":data,"loc":{"start":{"line":27,"column":27},"end":{"line":27,"column":40}}}) : helper)))
    + "\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"remove") : stack1), depth0))
    + "</a>\n<p class=\"description\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</p>\n";
},"useData":true});

},{"hbsfy/runtime":256}],180:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field--file-multiple-item\">\n    <div class=\"kb-field--file-multiple-control kbf-sort\"><span class=\"dashicons dashicons-menu\"></span></div>\n    <div class='kb-field-file-wrapper "
    + alias4(((helper = (helper = lookupProperty(helpers,"isEmpty") || (depth0 != null ? lookupProperty(depth0,"isEmpty") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"isEmpty","hash":{},"data":data,"loc":{"start":{"line":3,"column":38},"end":{"line":3,"column":51}}}) : helper)))
    + "'>\n        <table>\n            <tbody>\n            <tr>\n                <td>"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"customtitle") : stack1), depth0))
    + "</td>\n                <td><input class=\"kb-file-input\" name=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1), depth0))
    + "["
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"uniqueId") : stack1), depth0))
    + "][title]\" value=\""
    + ((stack1 = alias5(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"title") : stack1), depth0)) != null ? stack1 : "")
    + "\"></td>\n            </tr>\n            <tr>\n                <td>ID:</td>\n                <td><span class=\"kb-file-id\">"
    + alias4(alias5(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"file") : stack1)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "</span></td>\n            </tr>\n            <tr>\n                <td>"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"filetitle") : stack1), depth0))
    + "</td>\n                <td><span class=\"kb-file-title\">"
    + alias4(alias5(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"file") : stack1)) != null ? lookupProperty(stack1,"title") : stack1), depth0))
    + "</span></td>\n            </tr>\n            <tr>\n                <td>"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"filename") : stack1), depth0))
    + "</td>\n                <td><span class=\"kb-file-filename\">"
    + alias4(alias5(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"file") : stack1)) != null ? lookupProperty(stack1,"filename") : stack1), depth0))
    + "</span></td>\n            </tr>\n            <tr>\n                <td>"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"editLink") : stack1), depth0))
    + "</td>\n                <td><a class=\"kb-file-editLink\" href=\""
    + alias4(alias5(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"file") : stack1)) != null ? lookupProperty(stack1,"editLink") : stack1), depth0))
    + "\">edit</a></td>\n            </tr>\n            <tr>\n                <td>"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"comment") : stack1), depth0))
    + "</td>\n                <td><textarea class=\"kb-file-input\" name=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1), depth0))
    + "["
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"uniqueId") : stack1), depth0))
    + "][comment]\">"
    + ((stack1 = alias5(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"comment") : stack1), depth0)) != null ? stack1 : "")
    + "</textarea></td>\n            </tr>\n            </tbody>\n        </table>\n        <input type=\"hidden\" class=\"kb-file-attachment-id\" value=\""
    + alias4(alias5(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"file") : stack1)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\"\n               name=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1), depth0))
    + "["
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"uniqueId") : stack1), depth0))
    + "][id]\">\n    </div>\n    <a class=\"button primary kb-js-add-file\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"selectFile") : stack1), depth0))
    + "</a>\n    <a class=\"kb-js-reset-file "
    + alias4(((helper = (helper = lookupProperty(helpers,"isEmpty") || (depth0 != null ? lookupProperty(depth0,"isEmpty") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"isEmpty","hash":{},"data":data,"loc":{"start":{"line":36,"column":31},"end":{"line":36,"column":44}}}) : helper)))
    + "\">"
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"reset") : stack1), depth0))
    + "</a>\n    <div data-kbfaction=\"delete\" class=\"kb-field--file-multiple-control kbf-delete\"><span class=\"dashicons dashicons-trash\" ></span></div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],181:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<input type=\"hidden\" name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"inputName") || (depth0 != null ? lookupProperty(depth0,"inputName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputName","hash":{},"data":data,"loc":{"start":{"line":1,"column":27},"end":{"line":1,"column":42}}}) : helper)))
    + "[_meta][uid]\" value=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"uid") || (depth0 != null ? lookupProperty(depth0,"uid") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"uid","hash":{},"data":data,"loc":{"start":{"line":1,"column":63},"end":{"line":1,"column":72}}}) : helper)))
    + "\">\n<input type=\"hidden\" name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"inputName") || (depth0 != null ? lookupProperty(depth0,"inputName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputName","hash":{},"data":data,"loc":{"start":{"line":2,"column":27},"end":{"line":2,"column":42}}}) : helper)))
    + "[_meta][type]\" value=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"fftype") || (depth0 != null ? lookupProperty(depth0,"fftype") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"fftype","hash":{},"data":data,"loc":{"start":{"line":2,"column":64},"end":{"line":2,"column":76}}}) : helper)))
    + "\">\n<input data-flexfield-visible type=\"hidden\" name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"inputName") || (depth0 != null ? lookupProperty(depth0,"inputName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputName","hash":{},"data":data,"loc":{"start":{"line":3,"column":50},"end":{"line":3,"column":65}}}) : helper)))
    + "[_meta][status]\" value=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"status") || (depth0 != null ? lookupProperty(depth0,"status") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"status","hash":{},"data":data,"loc":{"start":{"line":3,"column":89},"end":{"line":3,"column":101}}}) : helper)))
    + "\">\n\n<div class=\"flexible-fields--section-box\">\n    <div class=\"flexible-fields--section-title\">\n        <span class=\"genericon genericon-draggable flexible-fields--js-drag-handle\"></span>\n        <span class=\"dashicons dashicons-trash flexible-fields--js-trash\"></span>\n        <input type=\"text\" value=\""
    + alias4(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"item") : depth0)) != null ? lookupProperty(stack1,"title") : stack1), depth0))
    + "\" name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"inputName") || (depth0 != null ? lookupProperty(depth0,"inputName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputName","hash":{},"data":data,"loc":{"start":{"line":9,"column":58},"end":{"line":9,"column":73}}}) : helper)))
    + "[_meta][title] \">\n    </div>\n    <div class=\"flexible-fields--section-box-inner\">\n\n    </div>\n    <div class=\"kb-field--tabs\">\n        <ul class=\"flexible-field--tab-nav\">\n        </ul>\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],182:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<input type=\"hidden\" name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"inputName") || (depth0 != null ? lookupProperty(depth0,"inputName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputName","hash":{},"data":data,"loc":{"start":{"line":1,"column":27},"end":{"line":1,"column":42}}}) : helper)))
    + "[_meta][uid]\" value=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"uid") || (depth0 != null ? lookupProperty(depth0,"uid") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"uid","hash":{},"data":data,"loc":{"start":{"line":1,"column":63},"end":{"line":1,"column":72}}}) : helper)))
    + "\">\n<input type=\"hidden\" name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"inputName") || (depth0 != null ? lookupProperty(depth0,"inputName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputName","hash":{},"data":data,"loc":{"start":{"line":2,"column":27},"end":{"line":2,"column":42}}}) : helper)))
    + "[_meta][type]\" value=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"fftype") || (depth0 != null ? lookupProperty(depth0,"fftype") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"fftype","hash":{},"data":data,"loc":{"start":{"line":2,"column":64},"end":{"line":2,"column":76}}}) : helper)))
    + "\">\n<input data-flexfield-visible type=\"hidden\" name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"inputName") || (depth0 != null ? lookupProperty(depth0,"inputName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputName","hash":{},"data":data,"loc":{"start":{"line":3,"column":50},"end":{"line":3,"column":65}}}) : helper)))
    + "[_meta][status]\" value=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"status") || (depth0 != null ? lookupProperty(depth0,"status") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"status","hash":{},"data":data,"loc":{"start":{"line":3,"column":89},"end":{"line":3,"column":101}}}) : helper)))
    + "\">\n<div class=\"flexible-fields--toggle-title\">\n    <h3>\n        <span class=\"genericon genericon-draggable flexible-fields--js-drag-handle\"></span>\n        <span class=\"genericon genericon-expand flexible-fields--js-toggle\" data-flexfields-toggle></span>\n        <span class=\"dashicons dashicons-trash flexible-fields--js-duplicate\"></span>\n        <span class=\"dashicons dashicons-trash flexible-fields--js-trash\"></span>\n        <span class=\"dashicons dashicons-trash flexible-fields--js-visibility\"></span>\n        <input type=\"text\" value=\""
    + alias4(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"item") : depth0)) != null ? lookupProperty(stack1,"title") : stack1), depth0))
    + "\" name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"inputName") || (depth0 != null ? lookupProperty(depth0,"inputName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputName","hash":{},"data":data,"loc":{"start":{"line":11,"column":58},"end":{"line":11,"column":73}}}) : helper)))
    + "[_meta][title]\">\n    </h3>\n</div>\n<div class=\"flexible-fields--toggle-box kb-hide\">\n    <div class=\"kb-field--tabs\">\n        <ul class=\"flexible-field--tab-nav\">\n\n        </ul>\n    </div>\n\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],183:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.escapeExpression, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <a class=\"button button-primary kb-flexible-fields--js-add-item\"\n           data-kbf-addtype=\""
    + alias1(((helper = (helper = lookupProperty(helpers,"key") || (data && lookupProperty(data,"key"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"key","hash":{},"data":data,"loc":{"start":{"line":5,"column":29},"end":{"line":5,"column":37}}}) : helper)))
    + "\">"
    + alias1(alias2(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"addNewItem") : stack1), depth0))
    + alias1(alias2(((stack1 = (depth0 != null ? lookupProperty(depth0,"args") : depth0)) != null ? lookupProperty(stack1,"buttontext") : stack1), depth0))
    + "</a>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ul class=\"flexible-fields--item-list\"></ul>\n<div class=\"flexible-fields--header\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"fields") : stack1),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":4},"end":{"line":6,"column":13}}})) != null ? stack1 : "")
    + "</div>";
},"useData":true});

},{"hbsfy/runtime":256}],184:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-gallery--header\">\n    <h3>Image Details</h3>\n</div>\n<div class=\"kb-gallery--left-column\">\n    <div class=\"kb-gallery--image-meta\" style=\"display: none;\">\n        <span class=\"genericon genericon-close-alt kb-gallery--js-meta-close\"></span>\n\n        <div class=\"kb-field--tabs\">\n            <ul class=\"kb-gallery--tabs-nav\">\n                <li><a href=\"#tab"
    + alias4(((helper = (helper = lookupProperty(helpers,"uid") || (depth0 != null ? lookupProperty(depth0,"uid") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"uid","hash":{},"data":data,"loc":{"start":{"line":10,"column":33},"end":{"line":10,"column":42}}}) : helper)))
    + "-1\">Details</a></li>\n                <li><a href=\"#tab"
    + alias4(((helper = (helper = lookupProperty(helpers,"uid") || (depth0 != null ? lookupProperty(depth0,"uid") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"uid","hash":{},"data":data,"loc":{"start":{"line":11,"column":33},"end":{"line":11,"column":42}}}) : helper)))
    + "-2\">Beschreibung</a></li>\n            </ul>\n            <div id=\"tab"
    + alias4(((helper = (helper = lookupProperty(helpers,"uid") || (depth0 != null ? lookupProperty(depth0,"uid") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"uid","hash":{},"data":data,"loc":{"start":{"line":13,"column":24},"end":{"line":13,"column":33}}}) : helper)))
    + "-1\">\n                <div class=\"kb-gallery--meta-field kb-field\">\n                    <label class=\"heading\">Titel</label>\n                    <input class=\"large\" type=\"text\" name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"inputName") || (depth0 != null ? lookupProperty(depth0,"inputName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputName","hash":{},"data":data,"loc":{"start":{"line":16,"column":59},"end":{"line":16,"column":74}}}) : helper)))
    + "[details][title]\" value=\""
    + alias4(alias5(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"image") : depth0)) != null ? lookupProperty(stack1,"details") : stack1)) != null ? lookupProperty(stack1,"title") : stack1), depth0))
    + "\">\n                </div>\n                <div class=\"kb-gallery--meta-field kb-field\">\n                    <label class=\"heading\">Alt</label>\n                    <input class=\"large\" type=\"text\" name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"inputName") || (depth0 != null ? lookupProperty(depth0,"inputName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputName","hash":{},"data":data,"loc":{"start":{"line":20,"column":59},"end":{"line":20,"column":74}}}) : helper)))
    + "[details][alt]\" value=\""
    + alias4(alias5(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"image") : depth0)) != null ? lookupProperty(stack1,"details") : stack1)) != null ? lookupProperty(stack1,"alt") : stack1), depth0))
    + "\">\n                </div>\n            </div>\n\n            <div id=\"tab"
    + alias4(((helper = (helper = lookupProperty(helpers,"uid") || (depth0 != null ? lookupProperty(depth0,"uid") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"uid","hash":{},"data":data,"loc":{"start":{"line":24,"column":24},"end":{"line":24,"column":33}}}) : helper)))
    + "-2\">\n                <div class=\"kb-js--remote-editor\" data-uid=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"uid") || (depth0 != null ? lookupProperty(depth0,"uid") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"uid","hash":{},"data":data,"loc":{"start":{"line":25,"column":60},"end":{"line":25,"column":69}}}) : helper)))
    + "\">\n                    <textarea name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"inputName") || (depth0 != null ? lookupProperty(depth0,"inputName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputName","hash":{},"data":data,"loc":{"start":{"line":26,"column":36},"end":{"line":26,"column":51}}}) : helper)))
    + "[details][description]\">"
    + alias4(alias5(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"image") : depth0)) != null ? lookupProperty(stack1,"details") : stack1)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</textarea>\n                </div>\n\n            </div>\n        </div>\n    </div>\n</div>\n<div class=\"kb-gallery--right-column\">\n    <div class=\"kb-gallery--image-holder\">\n        <img src=\""
    + alias4(alias5(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"image") : depth0)) != null ? lookupProperty(stack1,"file") : stack1)) != null ? lookupProperty(stack1,"sizes") : stack1)) != null ? lookupProperty(stack1,"thumbnail") : stack1)) != null ? lookupProperty(stack1,"url") : stack1), depth0))
    + "\">\n        <span class=\"genericon genericon-edit kb-gallery--js-edit\"></span>\n        <span class=\"genericon genericon-close-alt kb-gallery--js-delete\"></span>\n        <input type=\"hidden\" name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"inputName") || (depth0 != null ? lookupProperty(depth0,"inputName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputName","hash":{},"data":data,"loc":{"start":{"line":38,"column":35},"end":{"line":38,"column":50}}}) : helper)))
    + "[id]\" value=\""
    + alias4(alias5(((stack1 = (depth0 != null ? lookupProperty(depth0,"image") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\">\n        <input type=\"hidden\" class=\"kb-gallery--image-remove\" name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"inputName") || (depth0 != null ? lookupProperty(depth0,"inputName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputName","hash":{},"data":data,"loc":{"start":{"line":39,"column":68},"end":{"line":39,"column":83}}}) : helper)))
    + "[remove]\" value=\"\">\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],185:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-gallery--right-column\">\n    <div class=\"kb-gallery--image-holder\">\n        <img src=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"image") : depth0)) != null ? lookupProperty(stack1,"previewUrl") : stack1), depth0))
    + "\">\n        <input type=\"hidden\" name=\""
    + alias2(((helper = (helper = lookupProperty(helpers,"inputName") || (depth0 != null ? lookupProperty(depth0,"inputName") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"inputName","hash":{},"data":data,"loc":{"start":{"line":4,"column":35},"end":{"line":4,"column":50}}}) : helper)))
    + "\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"image") : depth0)) != null ? lookupProperty(stack1,"id") : stack1), depth0))
    + "\">\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],186:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <img src=\""
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"url") : stack1), depth0)) != null ? stack1 : "")
    + "\">\n";
},"3":function(container,depth0,helpers,partials,data) {
    return " kb-hide ";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.lambda, alias3=container.escapeExpression, alias4=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field kb-field kb-field--image kb-fieldapi-field\">\n    <div class='kb-field-image-wrapper' data-kbfield=\"image\">\n        <div role=\"button\" aria-label=\"Datei auswählen\" tabindex=\"0\" class='kb-js-add-image kb-field-image-container'>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"url") : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":12},"end":{"line":6,"column":19}}})) != null ? stack1 : "")
    + "        </div>\n        <div class=\"kb-field-image-meta "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"hideMeta") : stack1),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":40},"end":{"line":8,"column":79}}})) != null ? stack1 : "")
    + " \">\n            <div class=\"kb-field-image-title\">\n                <label>"
    + alias3(alias2(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"title") : stack1), depth0))
    + "</label>\n                <input class='kb-js-image-title kb-observe' type=\"text\"\n                       name='"
    + alias3((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||alias4).call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":12,"column":29},"end":{"line":12,"column":83}}}))
    + "[title]'\n                       value='"
    + ((stack1 = alias2(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"title") : stack1), depth0)) != null ? stack1 : "")
    + "'>\n            </div>\n            <div class=\"kb-field-image-description\">\n                <label>"
    + alias3(alias2(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</label>\n        <textarea class='kb-js-image-description kb-observe'\n                  name='"
    + alias3((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||alias4).call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":18,"column":24},"end":{"line":18,"column":79}}}))
    + "[caption]'>"
    + ((stack1 = alias2(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"caption") : stack1), depth0)) != null ? stack1 : "")
    + "\n        </textarea>\n            </div>\n        </div>\n        <input class='kb-js-image-id' type='hidden'\n               name='"
    + alias3((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||alias4).call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":23,"column":21},"end":{"line":23,"column":76}}}))
    + "[id]'\n               value='"
    + ((stack1 = alias2(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"id") : stack1), depth0)) != null ? stack1 : "")
    + "'>\n    </div>\n    <div class=\"kb-field-image--footer\">\n        <a class=\"button kb-js-reset-image\">Reset</a>\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],187:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class='kb-field--link-meta'><label for='"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1), depth0))
    + "-linktext'>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"linktext") : stack1), depth0))
    + "</label><br>\n            <input\n                    type='text' data-kbf-link-linktext\n                    name=\""
    + alias2((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":13,"column":26},"end":{"line":13,"column":81}}}))
    + "[linktext]\"\n                    class='kb-field--link-linktext'\n                    id='"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1), depth0))
    + "-linktext'\n                    value='"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"linktext") : stack1), depth0))
    + "'>\n        </div>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class='kb-field--link-meta'><label for='"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1), depth0))
    + "-linktitle'>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"linktitle") : stack1), depth0))
    + "</label><br>\n            <input\n                    type='text'\n                    name=\""
    + alias2((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":24,"column":26},"end":{"line":24,"column":81}}}))
    + "[linktitle]\"\n                    class='kb-field--link-linktitle'\n                    id='"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1), depth0))
    + "-linktitle'\n                    value='"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"linktitle") : stack1), depth0))
    + "'>\n        </div>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class='kb-field--link-meta'>\n            <label for='"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1), depth0))
    + "-linktarget'>\n                <input data-kbf-link-target type='checkbox' class='kb-field--link-target'\n                       id='"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1), depth0))
    + "-linktarget'\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"target") : stack1),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":36,"column":20},"end":{"line":38,"column":27}}})) != null ? stack1 : "")
    + "                       value='"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"target") : stack1), depth0))
    + "'\n                       name='"
    + alias2((lookupProperty(helpers,"fieldname")||(depth0 && lookupProperty(depth0,"fieldname"))||container.hooks.helperMissing).call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldname","hash":{},"data":data,"loc":{"start":{"line":40,"column":29},"end":{"line":40,"column":84}}}))
    + "[linktarget]'>\n                "
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"linktarget") : stack1), depth0))
    + " </label>\n        </div>\n\n";
},"6":function(container,depth0,helpers,partials,data) {
    return "                       checked=\"checked\"\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field kb-js-field kb-field--link field-api-link\">\n    <label class=\"heading\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"label") : stack1), depth0))
    + "</label>\n    <input class=\"kb-js-link-input\" data-kbf-link-url\n           id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1), depth0))
    + "_link_input\"\n           type=\"text\"\n           name=\""
    + alias2((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||container.hooks.helperMissing).call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":6,"column":17},"end":{"line":6,"column":72}}}))
    + "[link]\"\n           value=\""
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1)) != null ? lookupProperty(stack1,"link") : stack1), depth0))
    + "\">\n    <a class='button kb-js-add-link'>Add internal link</a>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"linktext") : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":4},"end":{"line":18,"column":11}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"linktitle") : stack1),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":20,"column":4},"end":{"line":29,"column":11}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"showtarget") : stack1),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":31,"column":4},"end":{"line":44,"column":11}}})) != null ? stack1 : "")
    + "    <p class=\"description\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</p>\n\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],188:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field kb-js-field field-api-medium\">\n    <label class=\"heading\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"label") : stack1), depth0))
    + "</label>\n    <textarea class=\"kb-medium-editable\" id=\"random\" name='"
    + alias2((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":3,"column":59},"end":{"line":3,"column":114}}}))
    + "'>"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1), depth0))
    + "</textarea>\n    <p class=\"description\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</p>\n</div>\n\n";
},"useData":true});

},{"hbsfy/runtime":256}],189:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field--oembed kb-field kb-js-field field-api-oembed\">\n    <label class=\"heading\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"label") : stack1), depth0))
    + "</label>\n    <input data-kbf-link-url\n    name='"
    + alias2((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":4,"column":10},"end":{"line":4,"column":65}}}))
    + "'\n    value='"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1), depth0))
    + "' />\n    <div class=\"kb-oembed-preview\" data-kb-oembed-preview>\n\n    </div>\n    <p class=\"description\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</p>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],190:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3=container.escapeExpression, alias4=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <div class='kb-radioset-item'>\n        <label>\n        <input type='radio' name='"
    + alias3((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||alias2).call(alias1,((stack1 = (depths[1] != null ? lookupProperty(depths[1],"model") : depths[1])) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depths[1] != null ? lookupProperty(depths[1],"model") : depths[1])) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depths[1] != null ? lookupProperty(depths[1],"model") : depths[1])) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":6,"column":34},"end":{"line":6,"column":98}}}))
    + "'\n               value='"
    + alias3(alias4((depth0 != null ? lookupProperty(depth0,"value") : depth0), depth0))
    + "'\n               "
    + ((stack1 = (lookupProperty(helpers,"ifCond")||(depth0 && lookupProperty(depth0,"ifCond"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"value") : depth0),"==",((stack1 = (depths[1] != null ? lookupProperty(depths[1],"model") : depths[1])) != null ? lookupProperty(stack1,"value") : stack1),{"name":"ifCond","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":15},"end":{"line":8,"column":86}}})) != null ? stack1 : "")
    + "/>"
    + ((stack1 = alias4((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0)) != null ? stack1 : "")
    + "</label>\n    </div>\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "checked=\"checked\"";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field kb-js-field field-api-radioset kb-field--radioset\">\n    <label class=\"heading\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"label") : stack1), depth0))
    + "</label>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"options") : stack1),{"name":"each","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":4},"end":{"line":10,"column":13}}})) != null ? stack1 : "")
    + "    <p class=\"description\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</p>\n</div>";
},"useData":true,"useDepths":true});

},{"hbsfy/runtime":256}],191:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    return "            data-kbselect2=\"true\"\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "            multiple=\"multiple\"\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "            <option value=\"\">Auswählen</option>\n";
},"7":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <option "
    + ((stack1 = (lookupProperty(helpers,"ifCond")||(depth0 && lookupProperty(depth0,"ifCond"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"value") : depth0),"==",((stack1 = (depths[1] != null ? lookupProperty(depths[1],"model") : depths[1])) != null ? lookupProperty(stack1,"value") : stack1),{"name":"ifCond","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":20},"end":{"line":16,"column":93}}})) != null ? stack1 : "")
    + "\n                    value=\""
    + container.escapeExpression(alias1((depth0 != null ? lookupProperty(depth0,"value") : depth0), depth0))
    + "\">"
    + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0,"name") : depth0), depth0)) != null ? stack1 : "")
    + "</option>\n";
},"8":function(container,depth0,helpers,partials,data) {
    return "selected=\"selected\"";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), alias4=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field kb-js-field field-api-text kb-field--select\">\n    <label class=\"heading\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"label") : stack1), depth0))
    + "</label>\n    <select\n            name=\""
    + alias2((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||alias4).call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":4,"column":18},"end":{"line":4,"column":73}}}))
    + "\"\n"
    + ((stack1 = (lookupProperty(helpers,"ifCond")||(depth0 && lookupProperty(depth0,"ifCond"))||alias4).call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"select2") : stack1),"===",true,{"name":"ifCond","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":8},"end":{"line":7,"column":19}}})) != null ? stack1 : "")
    + ((stack1 = (lookupProperty(helpers,"ifCond")||(depth0 && lookupProperty(depth0,"ifCond"))||alias4).call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"multiple") : stack1),"===",true,{"name":"ifCond","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":8},"end":{"line":10,"column":19}}})) != null ? stack1 : "")
    + "    >\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"showempty") : stack1),{"name":"if","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":8},"end":{"line":14,"column":15}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"options") : stack1),{"name":"each","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":8},"end":{"line":18,"column":17}}})) != null ? stack1 : "")
    + "    </select>\n    <p class=\"description\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</p>\n</div>";
},"useData":true,"useDepths":true});

},{"hbsfy/runtime":256}],192:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        "
    + alias1(((helper = (helper = lookupProperty(helpers,"key") || (data && lookupProperty(data,"key"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"key","hash":{},"data":data,"loc":{"start":{"line":5,"column":8},"end":{"line":5,"column":16}}}) : helper)))
    + "=\""
    + alias1(container.lambda(depth0, depth0))
    + "\"\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field kb-js-field field-api-text kb-field--text kb-field--reset\">\n    <label class=\"heading\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"label") : stack1), depth0))
    + "</label>\n    <input type=\"text\"\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"attributes") : stack1),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":4},"end":{"line":6,"column":13}}})) != null ? stack1 : "")
    + "    name=\""
    + alias2((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||container.hooks.helperMissing).call(alias3,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":7,"column":10},"end":{"line":7,"column":65}}}))
    + "\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1), depth0))
    + "\" >\n    <p class=\"description\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</p>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],193:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field--text-multiple-item\">\n    <div class=\"kb-field--text-multiple-control kbf-sort\"><span class=\"dashicons dashicons-menu\"></span></div>\n    <input type=\"text\" name=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1), depth0))
    + "[]\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1), depth0))
    + "\">\n    <div data-kbfaction=\"delete\" class=\"kb-field--text-multiple-control kbf-delete\"><span class=\"dashicons dashicons-trash\" ></span></div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],194:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-field kb-js-field field-api-textarea\">\n    <label class=\"heading\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"label") : stack1), depth0))
    + "</label>\n    <textarea name=\""
    + alias2((lookupProperty(helpers,"fieldName")||(depth0 && lookupProperty(depth0,"fieldName"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"baseId") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"index") : stack1),((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"primeKey") : stack1),{"name":"fieldName","hash":{},"data":data,"loc":{"start":{"line":3,"column":20},"end":{"line":3,"column":75}}}))
    + "\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"value") : stack1), depth0))
    + "</textarea>\n    <p class=\"description\">"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"description") : stack1), depth0))
    + "</p>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],195:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-area__empty-placeholder\">\n    <div class=\"kb-module-trigger\">"
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"jsFrontend") : stack1)) != null ? lookupProperty(stack1,"onpage") : stack1)) != null ? lookupProperty(stack1,"placeholder") : stack1), depth0))
    + "</div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],196:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div>"
    + ((stack1 = container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"strings") : depth0)) != null ? lookupProperty(stack1,"feedback") : stack1), depth0)) != null ? stack1 : "")
    + "</div>";
},"useData":true});

},{"hbsfy/runtime":256}],197:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    return " kb-dynamic-module ";
},"3":function(container,depth0,helpers,partials,data) {
    return " global-module ";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div data-kb-mcontrols=\""
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"mid") : stack1), depth0))
    + "\" class='kb-module-controls "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"inDynamic") : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":65},"end":{"line":1,"column":115}}})) != null ? stack1 : "")
    + " "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"globalModule") : stack1),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":116},"end":{"line":1,"column":165}}})) != null ? stack1 : "")
    + "'>\n    <div class=\"kb-controls-wrap\"></div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],198:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"controls-title\">Module: <span> "
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"settings") : stack1)) != null ? lookupProperty(stack1,"name") : stack1), depth0))
    + "</span></div>\n<div class=\"dashicons dashicons-no close-controls kb-button\"></div>\n<div class=\"kb-controls--buttons-wrap\">\n    <div class=\"kb-modal-history-back kb-button kb-button-secondary\">&laquo; previous module</div>\n    <div class=\"kb-save-form kb-button kb-button-primary\" title=\""
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"frontendModal") : stack1)) != null ? lookupProperty(stack1,"modalSave") : stack1), depth0))
    + "\">\n        <div class=\"dashicons dashicons-update\"></div>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"frontendModal") : stack1)) != null ? lookupProperty(stack1,"modalSave") : stack1), depth0))
    + "<span\n            class=\"kb-dirty-notice\">*</span></div>\n    <div class=\"kb-preview-form kb-button kb-button-secondary\">"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"frontendModal") : stack1)) != null ? lookupProperty(stack1,"modalPreview") : stack1), depth0))
    + "</div>\n\n</div>\n<form id=\"onsite-form\" class=\"wp-core-ui wp-admin kb-nano\">\n    <div class=\"kb-nano-content\" id=\"onsite-content\">\n\n        <div class=\"os-content-inner kb-module\">\n\n        </div>\n    </div>\n</form>";
},"useData":true});

},{"hbsfy/runtime":256}],199:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-module__placeholder\">\n    <p>"
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"model") : depth0)) != null ? lookupProperty(stack1,"settings") : stack1)) != null ? lookupProperty(stack1,"name") : stack1), depth0))
    + "\n    <span>Start here.</span>\n    </p>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],200:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-sidebar__subheader\">\n    <span>You are editing area:</span> "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"name","hash":{},"data":data,"loc":{"start":{"line":2,"column":39},"end":{"line":2,"column":49}}}) : helper)))
    + "\n</div>\n<div class=\"kb-sidebar-area-details__settings\" style=\"display: none\">\n\n</div>\n<!--<div class=\"kb-sidebar-area-details__subheader\">Categories</div>-->";
},"useData":true});

},{"hbsfy/runtime":256}],201:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-sidebar__category-item\">\n    <div class=\"kb-sidebar__category-item__title\">\n        Category: "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"name","hash":{},"data":data,"loc":{"start":{"line":3,"column":18},"end":{"line":3,"column":28}}}) : helper)))
    + "\n    </div>\n    <div class=\"kb-sidebar__category-item__module-list\">\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],202:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-sidebar__cat-module-item\">\n    "
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"settings") : depth0)) != null ? lookupProperty(stack1,"name") : stack1), depth0))
    + "\n    <div class=\"kb-sidebar__cat-module-item__actions\">\n    </div>\n</div>\n";
},"useData":true});

},{"hbsfy/runtime":256}],203:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<li class=\"kb-sidebar__no-modules\">No Modules attached yet</li>";
},"useData":true});

},{"hbsfy/runtime":256}],204:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-sidebar-item__wrapper\">\n    <div class=\"kb-sidebar-item__name\">"
    + ((stack1 = alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"view") : depth0)) != null ? lookupProperty(stack1,"settings") : stack1)) != null ? lookupProperty(stack1,"name") : stack1), depth0)) != null ? stack1 : "")
    + "</div>\n    <div class=\"kb-sidebar-item__id\">"
    + ((stack1 = alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"view") : depth0)) != null ? lookupProperty(stack1,"settings") : stack1)) != null ? lookupProperty(stack1,"id") : stack1), depth0)) != null ? stack1 : "")
    + "</div>\n</div>\n<div class=\"kb-sidebar-item__actions\">\n    <a class='kb-sidebar-item__edit' title='edit'\n       data='"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"view") : depth0)) != null ? lookupProperty(stack1,"mid") : stack1), depth0))
    + "' data-url='"
    + alias2(alias1(((stack1 = (depth0 != null ? lookupProperty(depth0,"view") : depth0)) != null ? lookupProperty(stack1,"editURL") : stack1), depth0))
    + "'>\n        <span class=\"dashicons dashicons-edit\"></span>\n        <span class=\"os-action\">"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"i18n") : depth0)) != null ? lookupProperty(stack1,"moduleControls") : stack1)) != null ? lookupProperty(stack1,"controlsEdit") : stack1), depth0))
    + "</span></a>\n    <a class='kb-sidebar__module-delete kb-js-inline-delete'><span\n            class=\"dashicons dashicons-trash\"></span></a>\n    <a class='kb-sidebar__module-update kb-js-inline-update'><span\n            class=\"dashicons dashicons-update\"></span></a>\n\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],205:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-sidebar__header-wrap\">\n    <div class=\"kb-sidebar__subheader\">\n        "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"name","hash":{},"data":data,"loc":{"start":{"line":3,"column":8},"end":{"line":3,"column":18}}}) : helper)))
    + "\n    </div>\n    <span class=\"genericon genericon-close-alt kb-sidebar-action--close\"></span>\n    <div class=\"kb-sidebar-action--update kb-fx-button kb-fx-button--effect-boris\"><span class=\"dashicons dashicons-update\"></span></div>\n\n</div>\n<form class=\"kb-sidebar__form-container\">\n\n</form>\n";
},"useData":true});

},{"hbsfy/runtime":256}],206:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-sidebar--panel-item kb-sidebar__item\">\n    "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"name","hash":{},"data":data,"loc":{"start":{"line":2,"column":4},"end":{"line":2,"column":14}}}) : helper)))
    + "\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],207:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-sidebar__item kb-sidebar__item--root\" data-kb-action=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data,"loc":{"start":{"line":1,"column":69},"end":{"line":1,"column":77}}}) : helper)))
    + "\">\n    "
    + alias4(((helper = (helper = lookupProperty(helpers,"text") || (depth0 != null ? lookupProperty(depth0,"text") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data,"loc":{"start":{"line":2,"column":4},"end":{"line":2,"column":14}}}) : helper)))
    + "\n    <span class=\"dashicons dashicons-arrow-right-alt2 kb-sidebar__add-module kb-js-sidebar-add-module\"></span>\n\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],208:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"kb-sidebar-areaview kb-sidebar-areaview--inactive\">\n    <div class=\"kb-sidebar-areaview__title\"> "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"name","hash":{},"data":data,"loc":{"start":{"line":2,"column":45},"end":{"line":2,"column":55}}}) : helper)))
    + "</div>\n    <span class=\"dashicons dashicons-arrow-right-alt2 kb-sidebar__add-module kb-js-sidebar-add-module\"></span>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],209:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"kb-sidebar__header-wrap\">\n    <div class=\"kb-sidebar__subheader\">\n        Kontentblocks\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],210:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"kb-sidebar__nav-controls\">\n    <div class=\"kb-sidebar__nav-button kb-js-sidebar-nav-back\">\n        <span class=\"dashicons dashicons-arrow-left-alt2 cbutton cbutton--effect-boris\"></span>\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":256}],211:[function(require,module,exports){

},{}],212:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _handlebarsRuntime = require('./handlebars.runtime');

var _handlebarsRuntime2 = _interopRequireDefault(_handlebarsRuntime);

// Compiler imports

var _handlebarsCompilerAst = require('./handlebars/compiler/ast');

var _handlebarsCompilerAst2 = _interopRequireDefault(_handlebarsCompilerAst);

var _handlebarsCompilerBase = require('./handlebars/compiler/base');

var _handlebarsCompilerCompiler = require('./handlebars/compiler/compiler');

var _handlebarsCompilerJavascriptCompiler = require('./handlebars/compiler/javascript-compiler');

var _handlebarsCompilerJavascriptCompiler2 = _interopRequireDefault(_handlebarsCompilerJavascriptCompiler);

var _handlebarsCompilerVisitor = require('./handlebars/compiler/visitor');

var _handlebarsCompilerVisitor2 = _interopRequireDefault(_handlebarsCompilerVisitor);

var _handlebarsNoConflict = require('./handlebars/no-conflict');

var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

var _create = _handlebarsRuntime2['default'].create;
function create() {
  var hb = _create();

  hb.compile = function (input, options) {
    return _handlebarsCompilerCompiler.compile(input, options, hb);
  };
  hb.precompile = function (input, options) {
    return _handlebarsCompilerCompiler.precompile(input, options, hb);
  };

  hb.AST = _handlebarsCompilerAst2['default'];
  hb.Compiler = _handlebarsCompilerCompiler.Compiler;
  hb.JavaScriptCompiler = _handlebarsCompilerJavascriptCompiler2['default'];
  hb.Parser = _handlebarsCompilerBase.parser;
  hb.parse = _handlebarsCompilerBase.parse;
  hb.parseWithoutProcessing = _handlebarsCompilerBase.parseWithoutProcessing;

  return hb;
}

var inst = create();
inst.create = create;

_handlebarsNoConflict2['default'](inst);

inst.Visitor = _handlebarsCompilerVisitor2['default'];

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];


},{"./handlebars.runtime":213,"./handlebars/compiler/ast":215,"./handlebars/compiler/base":216,"./handlebars/compiler/compiler":218,"./handlebars/compiler/javascript-compiler":220,"./handlebars/compiler/visitor":223,"./handlebars/no-conflict":240}],213:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _handlebarsBase = require('./handlebars/base');

var base = _interopRequireWildcard(_handlebarsBase);

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)

var _handlebarsSafeString = require('./handlebars/safe-string');

var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);

var _handlebarsException = require('./handlebars/exception');

var _handlebarsException2 = _interopRequireDefault(_handlebarsException);

var _handlebarsUtils = require('./handlebars/utils');

var Utils = _interopRequireWildcard(_handlebarsUtils);

var _handlebarsRuntime = require('./handlebars/runtime');

var runtime = _interopRequireWildcard(_handlebarsRuntime);

var _handlebarsNoConflict = require('./handlebars/no-conflict');

var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = _handlebarsSafeString2['default'];
  hb.Exception = _handlebarsException2['default'];
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = runtime;
  hb.template = function (spec) {
    return runtime.template(spec, hb);
  };

  return hb;
}

var inst = create();
inst.create = create;

_handlebarsNoConflict2['default'](inst);

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];


},{"./handlebars/base":214,"./handlebars/exception":227,"./handlebars/no-conflict":240,"./handlebars/runtime":241,"./handlebars/safe-string":242,"./handlebars/utils":243}],214:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.HandlebarsEnvironment = HandlebarsEnvironment;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('./utils');

var _exception = require('./exception');

var _exception2 = _interopRequireDefault(_exception);

var _helpers = require('./helpers');

var _decorators = require('./decorators');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _internalProtoAccess = require('./internal/proto-access');

var VERSION = '4.7.6';
exports.VERSION = VERSION;
var COMPILER_REVISION = 8;
exports.COMPILER_REVISION = COMPILER_REVISION;
var LAST_COMPATIBLE_COMPILER_REVISION = 7;

exports.LAST_COMPATIBLE_COMPILER_REVISION = LAST_COMPATIBLE_COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1',
  7: '>= 4.0.0 <4.3.0',
  8: '>= 4.3.0'
};

exports.REVISION_CHANGES = REVISION_CHANGES;
var objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials, decorators) {
  this.helpers = helpers || {};
  this.partials = partials || {};
  this.decorators = decorators || {};

  _helpers.registerDefaultHelpers(this);
  _decorators.registerDefaultDecorators(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: _logger2['default'],
  log: _logger2['default'].log,

  registerHelper: function registerHelper(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple helpers');
      }
      _utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (_utils.toString.call(name) === objectType) {
      _utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  },

  registerDecorator: function registerDecorator(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple decorators');
      }
      _utils.extend(this.decorators, name);
    } else {
      this.decorators[name] = fn;
    }
  },
  unregisterDecorator: function unregisterDecorator(name) {
    delete this.decorators[name];
  },
  /**
   * Reset the memory of illegal property accesses that have already been logged.
   * @deprecated should only be used in handlebars test-cases
   */
  resetLoggedPropertyAccesses: function resetLoggedPropertyAccesses() {
    _internalProtoAccess.resetLoggedProperties();
  }
};

var log = _logger2['default'].log;

exports.log = log;
exports.createFrame = _utils.createFrame;
exports.logger = _logger2['default'];


},{"./decorators":225,"./exception":227,"./helpers":228,"./internal/proto-access":237,"./logger":239,"./utils":243}],215:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var AST = {
  // Public API used to evaluate derived attributes regarding AST nodes
  helpers: {
    // a mustache is definitely a helper if:
    // * it is an eligible helper, and
    // * it has at least one parameter or hash segment
    helperExpression: function helperExpression(node) {
      return node.type === 'SubExpression' || (node.type === 'MustacheStatement' || node.type === 'BlockStatement') && !!(node.params && node.params.length || node.hash);
    },

    scopedId: function scopedId(path) {
      return (/^\.|this\b/.test(path.original)
      );
    },

    // an ID is simple if it only has one part, and that part is not
    // `..` or `this`.
    simpleId: function simpleId(path) {
      return path.parts.length === 1 && !AST.helpers.scopedId(path) && !path.depth;
    }
  }
};

// Must be exported as an object rather than the root of the module as the jison lexer
// must modify the object to operate properly.
exports['default'] = AST;
module.exports = exports['default'];


},{}],216:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.parseWithoutProcessing = parseWithoutProcessing;
exports.parse = parse;
// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _whitespaceControl = require('./whitespace-control');

var _whitespaceControl2 = _interopRequireDefault(_whitespaceControl);

var _helpers = require('./helpers');

var Helpers = _interopRequireWildcard(_helpers);

var _utils = require('../utils');

exports.parser = _parser2['default'];

var yy = {};
_utils.extend(yy, Helpers);

function parseWithoutProcessing(input, options) {
  // Just return if an already-compiled AST was passed in.
  if (input.type === 'Program') {
    return input;
  }

  _parser2['default'].yy = yy;

  // Altering the shared object here, but this is ok as parser is a sync operation
  yy.locInfo = function (locInfo) {
    return new yy.SourceLocation(options && options.srcName, locInfo);
  };

  var ast = _parser2['default'].parse(input);

  return ast;
}

function parse(input, options) {
  var ast = parseWithoutProcessing(input, options);
  var strip = new _whitespaceControl2['default'](options);

  return strip.accept(ast);
}


},{"../utils":243,"./helpers":219,"./parser":221,"./whitespace-control":224}],217:[function(require,module,exports){
/* global define */
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

var SourceNode = undefined;

try {
  /* istanbul ignore next */
  if (typeof define !== 'function' || !define.amd) {
    // We don't support this in AMD environments. For these environments, we asusme that
    // they are running on the browser and thus have no need for the source-map library.
    var SourceMap = require('source-map');
    SourceNode = SourceMap.SourceNode;
  }
} catch (err) {}
/* NOP */

/* istanbul ignore if: tested but not covered in istanbul due to dist build  */
if (!SourceNode) {
  SourceNode = function (line, column, srcFile, chunks) {
    this.src = '';
    if (chunks) {
      this.add(chunks);
    }
  };
  /* istanbul ignore next */
  SourceNode.prototype = {
    add: function add(chunks) {
      if (_utils.isArray(chunks)) {
        chunks = chunks.join('');
      }
      this.src += chunks;
    },
    prepend: function prepend(chunks) {
      if (_utils.isArray(chunks)) {
        chunks = chunks.join('');
      }
      this.src = chunks + this.src;
    },
    toStringWithSourceMap: function toStringWithSourceMap() {
      return { code: this.toString() };
    },
    toString: function toString() {
      return this.src;
    }
  };
}

function castChunk(chunk, codeGen, loc) {
  if (_utils.isArray(chunk)) {
    var ret = [];

    for (var i = 0, len = chunk.length; i < len; i++) {
      ret.push(codeGen.wrap(chunk[i], loc));
    }
    return ret;
  } else if (typeof chunk === 'boolean' || typeof chunk === 'number') {
    // Handle primitives that the SourceNode will throw up on
    return chunk + '';
  }
  return chunk;
}

function CodeGen(srcFile) {
  this.srcFile = srcFile;
  this.source = [];
}

CodeGen.prototype = {
  isEmpty: function isEmpty() {
    return !this.source.length;
  },
  prepend: function prepend(source, loc) {
    this.source.unshift(this.wrap(source, loc));
  },
  push: function push(source, loc) {
    this.source.push(this.wrap(source, loc));
  },

  merge: function merge() {
    var source = this.empty();
    this.each(function (line) {
      source.add(['  ', line, '\n']);
    });
    return source;
  },

  each: function each(iter) {
    for (var i = 0, len = this.source.length; i < len; i++) {
      iter(this.source[i]);
    }
  },

  empty: function empty() {
    var loc = this.currentLocation || { start: {} };
    return new SourceNode(loc.start.line, loc.start.column, this.srcFile);
  },
  wrap: function wrap(chunk) {
    var loc = arguments.length <= 1 || arguments[1] === undefined ? this.currentLocation || { start: {} } : arguments[1];

    if (chunk instanceof SourceNode) {
      return chunk;
    }

    chunk = castChunk(chunk, this, loc);

    return new SourceNode(loc.start.line, loc.start.column, this.srcFile, chunk);
  },

  functionCall: function functionCall(fn, type, params) {
    params = this.generateList(params);
    return this.wrap([fn, type ? '.' + type + '(' : '(', params, ')']);
  },

  quotedString: function quotedString(str) {
    return '"' + (str + '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u2028/g, '\\u2028') // Per Ecma-262 7.3 + 7.8.4
    .replace(/\u2029/g, '\\u2029') + '"';
  },

  objectLiteral: function objectLiteral(obj) {
    // istanbul ignore next

    var _this = this;

    var pairs = [];

    Object.keys(obj).forEach(function (key) {
      var value = castChunk(obj[key], _this);
      if (value !== 'undefined') {
        pairs.push([_this.quotedString(key), ':', value]);
      }
    });

    var ret = this.generateList(pairs);
    ret.prepend('{');
    ret.add('}');
    return ret;
  },

  generateList: function generateList(entries) {
    var ret = this.empty();

    for (var i = 0, len = entries.length; i < len; i++) {
      if (i) {
        ret.add(',');
      }

      ret.add(castChunk(entries[i], this));
    }

    return ret;
  },

  generateArray: function generateArray(entries) {
    var ret = this.generateList(entries);
    ret.prepend('[');
    ret.add(']');

    return ret;
  }
};

exports['default'] = CodeGen;
module.exports = exports['default'];


},{"../utils":243,"source-map":255}],218:[function(require,module,exports){
/* eslint-disable new-cap */

'use strict';

exports.__esModule = true;
exports.Compiler = Compiler;
exports.precompile = precompile;
exports.compile = compile;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

var _utils = require('../utils');

var _ast = require('./ast');

var _ast2 = _interopRequireDefault(_ast);

var slice = [].slice;

function Compiler() {}

// the foundHelper register will disambiguate helper lookup from finding a
// function in a context. This is necessary for mustache compatibility, which
// requires that context functions in blocks are evaluated by blockHelperMissing,
// and then proceed as if the resulting value was provided to blockHelperMissing.

Compiler.prototype = {
  compiler: Compiler,

  equals: function equals(other) {
    var len = this.opcodes.length;
    if (other.opcodes.length !== len) {
      return false;
    }

    for (var i = 0; i < len; i++) {
      var opcode = this.opcodes[i],
          otherOpcode = other.opcodes[i];
      if (opcode.opcode !== otherOpcode.opcode || !argEquals(opcode.args, otherOpcode.args)) {
        return false;
      }
    }

    // We know that length is the same between the two arrays because they are directly tied
    // to the opcode behavior above.
    len = this.children.length;
    for (var i = 0; i < len; i++) {
      if (!this.children[i].equals(other.children[i])) {
        return false;
      }
    }

    return true;
  },

  guid: 0,

  compile: function compile(program, options) {
    this.sourceNode = [];
    this.opcodes = [];
    this.children = [];
    this.options = options;
    this.stringParams = options.stringParams;
    this.trackIds = options.trackIds;

    options.blockParams = options.blockParams || [];

    options.knownHelpers = _utils.extend(Object.create(null), {
      helperMissing: true,
      blockHelperMissing: true,
      each: true,
      'if': true,
      unless: true,
      'with': true,
      log: true,
      lookup: true
    }, options.knownHelpers);

    return this.accept(program);
  },

  compileProgram: function compileProgram(program) {
    var childCompiler = new this.compiler(),
        // eslint-disable-line new-cap
    result = childCompiler.compile(program, this.options),
        guid = this.guid++;

    this.usePartial = this.usePartial || result.usePartial;

    this.children[guid] = result;
    this.useDepths = this.useDepths || result.useDepths;

    return guid;
  },

  accept: function accept(node) {
    /* istanbul ignore next: Sanity code */
    if (!this[node.type]) {
      throw new _exception2['default']('Unknown type: ' + node.type, node);
    }

    this.sourceNode.unshift(node);
    var ret = this[node.type](node);
    this.sourceNode.shift();
    return ret;
  },

  Program: function Program(program) {
    this.options.blockParams.unshift(program.blockParams);

    var body = program.body,
        bodyLength = body.length;
    for (var i = 0; i < bodyLength; i++) {
      this.accept(body[i]);
    }

    this.options.blockParams.shift();

    this.isSimple = bodyLength === 1;
    this.blockParams = program.blockParams ? program.blockParams.length : 0;

    return this;
  },

  BlockStatement: function BlockStatement(block) {
    transformLiteralToPath(block);

    var program = block.program,
        inverse = block.inverse;

    program = program && this.compileProgram(program);
    inverse = inverse && this.compileProgram(inverse);

    var type = this.classifySexpr(block);

    if (type === 'helper') {
      this.helperSexpr(block, program, inverse);
    } else if (type === 'simple') {
      this.simpleSexpr(block);

      // now that the simple mustache is resolved, we need to
      // evaluate it by executing `blockHelperMissing`
      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);
      this.opcode('emptyHash');
      this.opcode('blockValue', block.path.original);
    } else {
      this.ambiguousSexpr(block, program, inverse);

      // now that the simple mustache is resolved, we need to
      // evaluate it by executing `blockHelperMissing`
      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);
      this.opcode('emptyHash');
      this.opcode('ambiguousBlockValue');
    }

    this.opcode('append');
  },

  DecoratorBlock: function DecoratorBlock(decorator) {
    var program = decorator.program && this.compileProgram(decorator.program);
    var params = this.setupFullMustacheParams(decorator, program, undefined),
        path = decorator.path;

    this.useDecorators = true;
    this.opcode('registerDecorator', params.length, path.original);
  },

  PartialStatement: function PartialStatement(partial) {
    this.usePartial = true;

    var program = partial.program;
    if (program) {
      program = this.compileProgram(partial.program);
    }

    var params = partial.params;
    if (params.length > 1) {
      throw new _exception2['default']('Unsupported number of partial arguments: ' + params.length, partial);
    } else if (!params.length) {
      if (this.options.explicitPartialContext) {
        this.opcode('pushLiteral', 'undefined');
      } else {
        params.push({ type: 'PathExpression', parts: [], depth: 0 });
      }
    }

    var partialName = partial.name.original,
        isDynamic = partial.name.type === 'SubExpression';
    if (isDynamic) {
      this.accept(partial.name);
    }

    this.setupFullMustacheParams(partial, program, undefined, true);

    var indent = partial.indent || '';
    if (this.options.preventIndent && indent) {
      this.opcode('appendContent', indent);
      indent = '';
    }

    this.opcode('invokePartial', isDynamic, partialName, indent);
    this.opcode('append');
  },
  PartialBlockStatement: function PartialBlockStatement(partialBlock) {
    this.PartialStatement(partialBlock);
  },

  MustacheStatement: function MustacheStatement(mustache) {
    this.SubExpression(mustache);

    if (mustache.escaped && !this.options.noEscape) {
      this.opcode('appendEscaped');
    } else {
      this.opcode('append');
    }
  },
  Decorator: function Decorator(decorator) {
    this.DecoratorBlock(decorator);
  },

  ContentStatement: function ContentStatement(content) {
    if (content.value) {
      this.opcode('appendContent', content.value);
    }
  },

  CommentStatement: function CommentStatement() {},

  SubExpression: function SubExpression(sexpr) {
    transformLiteralToPath(sexpr);
    var type = this.classifySexpr(sexpr);

    if (type === 'simple') {
      this.simpleSexpr(sexpr);
    } else if (type === 'helper') {
      this.helperSexpr(sexpr);
    } else {
      this.ambiguousSexpr(sexpr);
    }
  },
  ambiguousSexpr: function ambiguousSexpr(sexpr, program, inverse) {
    var path = sexpr.path,
        name = path.parts[0],
        isBlock = program != null || inverse != null;

    this.opcode('getContext', path.depth);

    this.opcode('pushProgram', program);
    this.opcode('pushProgram', inverse);

    path.strict = true;
    this.accept(path);

    this.opcode('invokeAmbiguous', name, isBlock);
  },

  simpleSexpr: function simpleSexpr(sexpr) {
    var path = sexpr.path;
    path.strict = true;
    this.accept(path);
    this.opcode('resolvePossibleLambda');
  },

  helperSexpr: function helperSexpr(sexpr, program, inverse) {
    var params = this.setupFullMustacheParams(sexpr, program, inverse),
        path = sexpr.path,
        name = path.parts[0];

    if (this.options.knownHelpers[name]) {
      this.opcode('invokeKnownHelper', params.length, name);
    } else if (this.options.knownHelpersOnly) {
      throw new _exception2['default']('You specified knownHelpersOnly, but used the unknown helper ' + name, sexpr);
    } else {
      path.strict = true;
      path.falsy = true;

      this.accept(path);
      this.opcode('invokeHelper', params.length, path.original, _ast2['default'].helpers.simpleId(path));
    }
  },

  PathExpression: function PathExpression(path) {
    this.addDepth(path.depth);
    this.opcode('getContext', path.depth);

    var name = path.parts[0],
        scoped = _ast2['default'].helpers.scopedId(path),
        blockParamId = !path.depth && !scoped && this.blockParamIndex(name);

    if (blockParamId) {
      this.opcode('lookupBlockParam', blockParamId, path.parts);
    } else if (!name) {
      // Context reference, i.e. `{{foo .}}` or `{{foo ..}}`
      this.opcode('pushContext');
    } else if (path.data) {
      this.options.data = true;
      this.opcode('lookupData', path.depth, path.parts, path.strict);
    } else {
      this.opcode('lookupOnContext', path.parts, path.falsy, path.strict, scoped);
    }
  },

  StringLiteral: function StringLiteral(string) {
    this.opcode('pushString', string.value);
  },

  NumberLiteral: function NumberLiteral(number) {
    this.opcode('pushLiteral', number.value);
  },

  BooleanLiteral: function BooleanLiteral(bool) {
    this.opcode('pushLiteral', bool.value);
  },

  UndefinedLiteral: function UndefinedLiteral() {
    this.opcode('pushLiteral', 'undefined');
  },

  NullLiteral: function NullLiteral() {
    this.opcode('pushLiteral', 'null');
  },

  Hash: function Hash(hash) {
    var pairs = hash.pairs,
        i = 0,
        l = pairs.length;

    this.opcode('pushHash');

    for (; i < l; i++) {
      this.pushParam(pairs[i].value);
    }
    while (i--) {
      this.opcode('assignToHash', pairs[i].key);
    }
    this.opcode('popHash');
  },

  // HELPERS
  opcode: function opcode(name) {
    this.opcodes.push({
      opcode: name,
      args: slice.call(arguments, 1),
      loc: this.sourceNode[0].loc
    });
  },

  addDepth: function addDepth(depth) {
    if (!depth) {
      return;
    }

    this.useDepths = true;
  },

  classifySexpr: function classifySexpr(sexpr) {
    var isSimple = _ast2['default'].helpers.simpleId(sexpr.path);

    var isBlockParam = isSimple && !!this.blockParamIndex(sexpr.path.parts[0]);

    // a mustache is an eligible helper if:
    // * its id is simple (a single part, not `this` or `..`)
    var isHelper = !isBlockParam && _ast2['default'].helpers.helperExpression(sexpr);

    // if a mustache is an eligible helper but not a definite
    // helper, it is ambiguous, and will be resolved in a later
    // pass or at runtime.
    var isEligible = !isBlockParam && (isHelper || isSimple);

    // if ambiguous, we can possibly resolve the ambiguity now
    // An eligible helper is one that does not have a complex path, i.e. `this.foo`, `../foo` etc.
    if (isEligible && !isHelper) {
      var _name = sexpr.path.parts[0],
          options = this.options;
      if (options.knownHelpers[_name]) {
        isHelper = true;
      } else if (options.knownHelpersOnly) {
        isEligible = false;
      }
    }

    if (isHelper) {
      return 'helper';
    } else if (isEligible) {
      return 'ambiguous';
    } else {
      return 'simple';
    }
  },

  pushParams: function pushParams(params) {
    for (var i = 0, l = params.length; i < l; i++) {
      this.pushParam(params[i]);
    }
  },

  pushParam: function pushParam(val) {
    var value = val.value != null ? val.value : val.original || '';

    if (this.stringParams) {
      if (value.replace) {
        value = value.replace(/^(\.?\.\/)*/g, '').replace(/\//g, '.');
      }

      if (val.depth) {
        this.addDepth(val.depth);
      }
      this.opcode('getContext', val.depth || 0);
      this.opcode('pushStringParam', value, val.type);

      if (val.type === 'SubExpression') {
        // SubExpressions get evaluated and passed in
        // in string params mode.
        this.accept(val);
      }
    } else {
      if (this.trackIds) {
        var blockParamIndex = undefined;
        if (val.parts && !_ast2['default'].helpers.scopedId(val) && !val.depth) {
          blockParamIndex = this.blockParamIndex(val.parts[0]);
        }
        if (blockParamIndex) {
          var blockParamChild = val.parts.slice(1).join('.');
          this.opcode('pushId', 'BlockParam', blockParamIndex, blockParamChild);
        } else {
          value = val.original || value;
          if (value.replace) {
            value = value.replace(/^this(?:\.|$)/, '').replace(/^\.\//, '').replace(/^\.$/, '');
          }

          this.opcode('pushId', val.type, value);
        }
      }
      this.accept(val);
    }
  },

  setupFullMustacheParams: function setupFullMustacheParams(sexpr, program, inverse, omitEmpty) {
    var params = sexpr.params;
    this.pushParams(params);

    this.opcode('pushProgram', program);
    this.opcode('pushProgram', inverse);

    if (sexpr.hash) {
      this.accept(sexpr.hash);
    } else {
      this.opcode('emptyHash', omitEmpty);
    }

    return params;
  },

  blockParamIndex: function blockParamIndex(name) {
    for (var depth = 0, len = this.options.blockParams.length; depth < len; depth++) {
      var blockParams = this.options.blockParams[depth],
          param = blockParams && _utils.indexOf(blockParams, name);
      if (blockParams && param >= 0) {
        return [depth, param];
      }
    }
  }
};

function precompile(input, options, env) {
  if (input == null || typeof input !== 'string' && input.type !== 'Program') {
    throw new _exception2['default']('You must pass a string or Handlebars AST to Handlebars.precompile. You passed ' + input);
  }

  options = options || {};
  if (!('data' in options)) {
    options.data = true;
  }
  if (options.compat) {
    options.useDepths = true;
  }

  var ast = env.parse(input, options),
      environment = new env.Compiler().compile(ast, options);
  return new env.JavaScriptCompiler().compile(environment, options);
}

function compile(input, options, env) {
  if (options === undefined) options = {};

  if (input == null || typeof input !== 'string' && input.type !== 'Program') {
    throw new _exception2['default']('You must pass a string or Handlebars AST to Handlebars.compile. You passed ' + input);
  }

  options = _utils.extend({}, options);
  if (!('data' in options)) {
    options.data = true;
  }
  if (options.compat) {
    options.useDepths = true;
  }

  var compiled = undefined;

  function compileInput() {
    var ast = env.parse(input, options),
        environment = new env.Compiler().compile(ast, options),
        templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
    return env.template(templateSpec);
  }

  // Template is only compiled on first use and cached after that point.
  function ret(context, execOptions) {
    if (!compiled) {
      compiled = compileInput();
    }
    return compiled.call(this, context, execOptions);
  }
  ret._setup = function (setupOptions) {
    if (!compiled) {
      compiled = compileInput();
    }
    return compiled._setup(setupOptions);
  };
  ret._child = function (i, data, blockParams, depths) {
    if (!compiled) {
      compiled = compileInput();
    }
    return compiled._child(i, data, blockParams, depths);
  };
  return ret;
}

function argEquals(a, b) {
  if (a === b) {
    return true;
  }

  if (_utils.isArray(a) && _utils.isArray(b) && a.length === b.length) {
    for (var i = 0; i < a.length; i++) {
      if (!argEquals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
}

function transformLiteralToPath(sexpr) {
  if (!sexpr.path.parts) {
    var literal = sexpr.path;
    // Casting to string here to make false and 0 literal values play nicely with the rest
    // of the system.
    sexpr.path = {
      type: 'PathExpression',
      data: false,
      depth: 0,
      parts: [literal.original + ''],
      original: literal.original + '',
      loc: literal.loc
    };
  }
}


},{"../exception":227,"../utils":243,"./ast":215}],219:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.SourceLocation = SourceLocation;
exports.id = id;
exports.stripFlags = stripFlags;
exports.stripComment = stripComment;
exports.preparePath = preparePath;
exports.prepareMustache = prepareMustache;
exports.prepareRawBlock = prepareRawBlock;
exports.prepareBlock = prepareBlock;
exports.prepareProgram = prepareProgram;
exports.preparePartialBlock = preparePartialBlock;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

function validateClose(open, close) {
  close = close.path ? close.path.original : close;

  if (open.path.original !== close) {
    var errorNode = { loc: open.path.loc };

    throw new _exception2['default'](open.path.original + " doesn't match " + close, errorNode);
  }
}

function SourceLocation(source, locInfo) {
  this.source = source;
  this.start = {
    line: locInfo.first_line,
    column: locInfo.first_column
  };
  this.end = {
    line: locInfo.last_line,
    column: locInfo.last_column
  };
}

function id(token) {
  if (/^\[.*\]$/.test(token)) {
    return token.substring(1, token.length - 1);
  } else {
    return token;
  }
}

function stripFlags(open, close) {
  return {
    open: open.charAt(2) === '~',
    close: close.charAt(close.length - 3) === '~'
  };
}

function stripComment(comment) {
  return comment.replace(/^\{\{~?!-?-?/, '').replace(/-?-?~?\}\}$/, '');
}

function preparePath(data, parts, loc) {
  loc = this.locInfo(loc);

  var original = data ? '@' : '',
      dig = [],
      depth = 0;

  for (var i = 0, l = parts.length; i < l; i++) {
    var part = parts[i].part,

    // If we have [] syntax then we do not treat path references as operators,
    // i.e. foo.[this] resolves to approximately context.foo['this']
    isLiteral = parts[i].original !== part;
    original += (parts[i].separator || '') + part;

    if (!isLiteral && (part === '..' || part === '.' || part === 'this')) {
      if (dig.length > 0) {
        throw new _exception2['default']('Invalid path: ' + original, { loc: loc });
      } else if (part === '..') {
        depth++;
      }
    } else {
      dig.push(part);
    }
  }

  return {
    type: 'PathExpression',
    data: data,
    depth: depth,
    parts: dig,
    original: original,
    loc: loc
  };
}

function prepareMustache(path, params, hash, open, strip, locInfo) {
  // Must use charAt to support IE pre-10
  var escapeFlag = open.charAt(3) || open.charAt(2),
      escaped = escapeFlag !== '{' && escapeFlag !== '&';

  var decorator = /\*/.test(open);
  return {
    type: decorator ? 'Decorator' : 'MustacheStatement',
    path: path,
    params: params,
    hash: hash,
    escaped: escaped,
    strip: strip,
    loc: this.locInfo(locInfo)
  };
}

function prepareRawBlock(openRawBlock, contents, close, locInfo) {
  validateClose(openRawBlock, close);

  locInfo = this.locInfo(locInfo);
  var program = {
    type: 'Program',
    body: contents,
    strip: {},
    loc: locInfo
  };

  return {
    type: 'BlockStatement',
    path: openRawBlock.path,
    params: openRawBlock.params,
    hash: openRawBlock.hash,
    program: program,
    openStrip: {},
    inverseStrip: {},
    closeStrip: {},
    loc: locInfo
  };
}

function prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {
  if (close && close.path) {
    validateClose(openBlock, close);
  }

  var decorator = /\*/.test(openBlock.open);

  program.blockParams = openBlock.blockParams;

  var inverse = undefined,
      inverseStrip = undefined;

  if (inverseAndProgram) {
    if (decorator) {
      throw new _exception2['default']('Unexpected inverse block on decorator', inverseAndProgram);
    }

    if (inverseAndProgram.chain) {
      inverseAndProgram.program.body[0].closeStrip = close.strip;
    }

    inverseStrip = inverseAndProgram.strip;
    inverse = inverseAndProgram.program;
  }

  if (inverted) {
    inverted = inverse;
    inverse = program;
    program = inverted;
  }

  return {
    type: decorator ? 'DecoratorBlock' : 'BlockStatement',
    path: openBlock.path,
    params: openBlock.params,
    hash: openBlock.hash,
    program: program,
    inverse: inverse,
    openStrip: openBlock.strip,
    inverseStrip: inverseStrip,
    closeStrip: close && close.strip,
    loc: this.locInfo(locInfo)
  };
}

function prepareProgram(statements, loc) {
  if (!loc && statements.length) {
    var firstLoc = statements[0].loc,
        lastLoc = statements[statements.length - 1].loc;

    /* istanbul ignore else */
    if (firstLoc && lastLoc) {
      loc = {
        source: firstLoc.source,
        start: {
          line: firstLoc.start.line,
          column: firstLoc.start.column
        },
        end: {
          line: lastLoc.end.line,
          column: lastLoc.end.column
        }
      };
    }
  }

  return {
    type: 'Program',
    body: statements,
    strip: {},
    loc: loc
  };
}

function preparePartialBlock(open, program, close, locInfo) {
  validateClose(open, close);

  return {
    type: 'PartialBlockStatement',
    name: open.path,
    params: open.params,
    hash: open.hash,
    program: program,
    openStrip: open.strip,
    closeStrip: close && close.strip,
    loc: this.locInfo(locInfo)
  };
}


},{"../exception":227}],220:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _base = require('../base');

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

var _utils = require('../utils');

var _codeGen = require('./code-gen');

var _codeGen2 = _interopRequireDefault(_codeGen);

function Literal(value) {
  this.value = value;
}

function JavaScriptCompiler() {}

JavaScriptCompiler.prototype = {
  // PUBLIC API: You can override these methods in a subclass to provide
  // alternative compiled forms for name lookup and buffering semantics
  nameLookup: function nameLookup(parent, name /*,  type */) {
    return this.internalNameLookup(parent, name);
  },
  depthedLookup: function depthedLookup(name) {
    return [this.aliasable('container.lookup'), '(depths, "', name, '")'];
  },

  compilerInfo: function compilerInfo() {
    var revision = _base.COMPILER_REVISION,
        versions = _base.REVISION_CHANGES[revision];
    return [revision, versions];
  },

  appendToBuffer: function appendToBuffer(source, location, explicit) {
    // Force a source as this simplifies the merge logic.
    if (!_utils.isArray(source)) {
      source = [source];
    }
    source = this.source.wrap(source, location);

    if (this.environment.isSimple) {
      return ['return ', source, ';'];
    } else if (explicit) {
      // This is a case where the buffer operation occurs as a child of another
      // construct, generally braces. We have to explicitly output these buffer
      // operations to ensure that the emitted code goes in the correct location.
      return ['buffer += ', source, ';'];
    } else {
      source.appendToBuffer = true;
      return source;
    }
  },

  initializeBuffer: function initializeBuffer() {
    return this.quotedString('');
  },
  // END PUBLIC API
  internalNameLookup: function internalNameLookup(parent, name) {
    this.lookupPropertyFunctionIsUsed = true;
    return ['lookupProperty(', parent, ',', JSON.stringify(name), ')'];
  },

  lookupPropertyFunctionIsUsed: false,

  compile: function compile(environment, options, context, asObject) {
    this.environment = environment;
    this.options = options;
    this.stringParams = this.options.stringParams;
    this.trackIds = this.options.trackIds;
    this.precompile = !asObject;

    this.name = this.environment.name;
    this.isChild = !!context;
    this.context = context || {
      decorators: [],
      programs: [],
      environments: []
    };

    this.preamble();

    this.stackSlot = 0;
    this.stackVars = [];
    this.aliases = {};
    this.registers = { list: [] };
    this.hashes = [];
    this.compileStack = [];
    this.inlineStack = [];
    this.blockParams = [];

    this.compileChildren(environment, options);

    this.useDepths = this.useDepths || environment.useDepths || environment.useDecorators || this.options.compat;
    this.useBlockParams = this.useBlockParams || environment.useBlockParams;

    var opcodes = environment.opcodes,
        opcode = undefined,
        firstLoc = undefined,
        i = undefined,
        l = undefined;

    for (i = 0, l = opcodes.length; i < l; i++) {
      opcode = opcodes[i];

      this.source.currentLocation = opcode.loc;
      firstLoc = firstLoc || opcode.loc;
      this[opcode.opcode].apply(this, opcode.args);
    }

    // Flush any trailing content that might be pending.
    this.source.currentLocation = firstLoc;
    this.pushSource('');

    /* istanbul ignore next */
    if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
      throw new _exception2['default']('Compile completed with content left on stack');
    }

    if (!this.decorators.isEmpty()) {
      this.useDecorators = true;

      this.decorators.prepend(['var decorators = container.decorators, ', this.lookupPropertyFunctionVarDeclaration(), ';\n']);
      this.decorators.push('return fn;');

      if (asObject) {
        this.decorators = Function.apply(this, ['fn', 'props', 'container', 'depth0', 'data', 'blockParams', 'depths', this.decorators.merge()]);
      } else {
        this.decorators.prepend('function(fn, props, container, depth0, data, blockParams, depths) {\n');
        this.decorators.push('}\n');
        this.decorators = this.decorators.merge();
      }
    } else {
      this.decorators = undefined;
    }

    var fn = this.createFunctionContext(asObject);
    if (!this.isChild) {
      var ret = {
        compiler: this.compilerInfo(),
        main: fn
      };

      if (this.decorators) {
        ret.main_d = this.decorators; // eslint-disable-line camelcase
        ret.useDecorators = true;
      }

      var _context = this.context;
      var programs = _context.programs;
      var decorators = _context.decorators;

      for (i = 0, l = programs.length; i < l; i++) {
        if (programs[i]) {
          ret[i] = programs[i];
          if (decorators[i]) {
            ret[i + '_d'] = decorators[i];
            ret.useDecorators = true;
          }
        }
      }

      if (this.environment.usePartial) {
        ret.usePartial = true;
      }
      if (this.options.data) {
        ret.useData = true;
      }
      if (this.useDepths) {
        ret.useDepths = true;
      }
      if (this.useBlockParams) {
        ret.useBlockParams = true;
      }
      if (this.options.compat) {
        ret.compat = true;
      }

      if (!asObject) {
        ret.compiler = JSON.stringify(ret.compiler);

        this.source.currentLocation = { start: { line: 1, column: 0 } };
        ret = this.objectLiteral(ret);

        if (options.srcName) {
          ret = ret.toStringWithSourceMap({ file: options.destName });
          ret.map = ret.map && ret.map.toString();
        } else {
          ret = ret.toString();
        }
      } else {
        ret.compilerOptions = this.options;
      }

      return ret;
    } else {
      return fn;
    }
  },

  preamble: function preamble() {
    // track the last context pushed into place to allow skipping the
    // getContext opcode when it would be a noop
    this.lastContext = 0;
    this.source = new _codeGen2['default'](this.options.srcName);
    this.decorators = new _codeGen2['default'](this.options.srcName);
  },

  createFunctionContext: function createFunctionContext(asObject) {
    // istanbul ignore next

    var _this = this;

    var varDeclarations = '';

    var locals = this.stackVars.concat(this.registers.list);
    if (locals.length > 0) {
      varDeclarations += ', ' + locals.join(', ');
    }

    // Generate minimizer alias mappings
    //
    // When using true SourceNodes, this will update all references to the given alias
    // as the source nodes are reused in situ. For the non-source node compilation mode,
    // aliases will not be used, but this case is already being run on the client and
    // we aren't concern about minimizing the template size.
    var aliasCount = 0;
    Object.keys(this.aliases).forEach(function (alias) {
      var node = _this.aliases[alias];
      if (node.children && node.referenceCount > 1) {
        varDeclarations += ', alias' + ++aliasCount + '=' + alias;
        node.children[0] = 'alias' + aliasCount;
      }
    });

    if (this.lookupPropertyFunctionIsUsed) {
      varDeclarations += ', ' + this.lookupPropertyFunctionVarDeclaration();
    }

    var params = ['container', 'depth0', 'helpers', 'partials', 'data'];

    if (this.useBlockParams || this.useDepths) {
      params.push('blockParams');
    }
    if (this.useDepths) {
      params.push('depths');
    }

    // Perform a second pass over the output to merge content when possible
    var source = this.mergeSource(varDeclarations);

    if (asObject) {
      params.push(source);

      return Function.apply(this, params);
    } else {
      return this.source.wrap(['function(', params.join(','), ') {\n  ', source, '}']);
    }
  },
  mergeSource: function mergeSource(varDeclarations) {
    var isSimple = this.environment.isSimple,
        appendOnly = !this.forceBuffer,
        appendFirst = undefined,
        sourceSeen = undefined,
        bufferStart = undefined,
        bufferEnd = undefined;
    this.source.each(function (line) {
      if (line.appendToBuffer) {
        if (bufferStart) {
          line.prepend('  + ');
        } else {
          bufferStart = line;
        }
        bufferEnd = line;
      } else {
        if (bufferStart) {
          if (!sourceSeen) {
            appendFirst = true;
          } else {
            bufferStart.prepend('buffer += ');
          }
          bufferEnd.add(';');
          bufferStart = bufferEnd = undefined;
        }

        sourceSeen = true;
        if (!isSimple) {
          appendOnly = false;
        }
      }
    });

    if (appendOnly) {
      if (bufferStart) {
        bufferStart.prepend('return ');
        bufferEnd.add(';');
      } else if (!sourceSeen) {
        this.source.push('return "";');
      }
    } else {
      varDeclarations += ', buffer = ' + (appendFirst ? '' : this.initializeBuffer());

      if (bufferStart) {
        bufferStart.prepend('return buffer + ');
        bufferEnd.add(';');
      } else {
        this.source.push('return buffer;');
      }
    }

    if (varDeclarations) {
      this.source.prepend('var ' + varDeclarations.substring(2) + (appendFirst ? '' : ';\n'));
    }

    return this.source.merge();
  },

  lookupPropertyFunctionVarDeclaration: function lookupPropertyFunctionVarDeclaration() {
    return '\n      lookupProperty = container.lookupProperty || function(parent, propertyName) {\n        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {\n          return parent[propertyName];\n        }\n        return undefined\n    }\n    '.trim();
  },

  // [blockValue]
  //
  // On stack, before: hash, inverse, program, value
  // On stack, after: return value of blockHelperMissing
  //
  // The purpose of this opcode is to take a block of the form
  // `{{#this.foo}}...{{/this.foo}}`, resolve the value of `foo`, and
  // replace it on the stack with the result of properly
  // invoking blockHelperMissing.
  blockValue: function blockValue(name) {
    var blockHelperMissing = this.aliasable('container.hooks.blockHelperMissing'),
        params = [this.contextName(0)];
    this.setupHelperArgs(name, 0, params);

    var blockName = this.popStack();
    params.splice(1, 0, blockName);

    this.push(this.source.functionCall(blockHelperMissing, 'call', params));
  },

  // [ambiguousBlockValue]
  //
  // On stack, before: hash, inverse, program, value
  // Compiler value, before: lastHelper=value of last found helper, if any
  // On stack, after, if no lastHelper: same as [blockValue]
  // On stack, after, if lastHelper: value
  ambiguousBlockValue: function ambiguousBlockValue() {
    // We're being a bit cheeky and reusing the options value from the prior exec
    var blockHelperMissing = this.aliasable('container.hooks.blockHelperMissing'),
        params = [this.contextName(0)];
    this.setupHelperArgs('', 0, params, true);

    this.flushInline();

    var current = this.topStack();
    params.splice(1, 0, current);

    this.pushSource(['if (!', this.lastHelper, ') { ', current, ' = ', this.source.functionCall(blockHelperMissing, 'call', params), '}']);
  },

  // [appendContent]
  //
  // On stack, before: ...
  // On stack, after: ...
  //
  // Appends the string value of `content` to the current buffer
  appendContent: function appendContent(content) {
    if (this.pendingContent) {
      content = this.pendingContent + content;
    } else {
      this.pendingLocation = this.source.currentLocation;
    }

    this.pendingContent = content;
  },

  // [append]
  //
  // On stack, before: value, ...
  // On stack, after: ...
  //
  // Coerces `value` to a String and appends it to the current buffer.
  //
  // If `value` is truthy, or 0, it is coerced into a string and appended
  // Otherwise, the empty string is appended
  append: function append() {
    if (this.isInline()) {
      this.replaceStack(function (current) {
        return [' != null ? ', current, ' : ""'];
      });

      this.pushSource(this.appendToBuffer(this.popStack()));
    } else {
      var local = this.popStack();
      this.pushSource(['if (', local, ' != null) { ', this.appendToBuffer(local, undefined, true), ' }']);
      if (this.environment.isSimple) {
        this.pushSource(['else { ', this.appendToBuffer("''", undefined, true), ' }']);
      }
    }
  },

  // [appendEscaped]
  //
  // On stack, before: value, ...
  // On stack, after: ...
  //
  // Escape `value` and append it to the buffer
  appendEscaped: function appendEscaped() {
    this.pushSource(this.appendToBuffer([this.aliasable('container.escapeExpression'), '(', this.popStack(), ')']));
  },

  // [getContext]
  //
  // On stack, before: ...
  // On stack, after: ...
  // Compiler value, after: lastContext=depth
  //
  // Set the value of the `lastContext` compiler value to the depth
  getContext: function getContext(depth) {
    this.lastContext = depth;
  },

  // [pushContext]
  //
  // On stack, before: ...
  // On stack, after: currentContext, ...
  //
  // Pushes the value of the current context onto the stack.
  pushContext: function pushContext() {
    this.pushStackLiteral(this.contextName(this.lastContext));
  },

  // [lookupOnContext]
  //
  // On stack, before: ...
  // On stack, after: currentContext[name], ...
  //
  // Looks up the value of `name` on the current context and pushes
  // it onto the stack.
  lookupOnContext: function lookupOnContext(parts, falsy, strict, scoped) {
    var i = 0;

    if (!scoped && this.options.compat && !this.lastContext) {
      // The depthed query is expected to handle the undefined logic for the root level that
      // is implemented below, so we evaluate that directly in compat mode
      this.push(this.depthedLookup(parts[i++]));
    } else {
      this.pushContext();
    }

    this.resolvePath('context', parts, i, falsy, strict);
  },

  // [lookupBlockParam]
  //
  // On stack, before: ...
  // On stack, after: blockParam[name], ...
  //
  // Looks up the value of `parts` on the given block param and pushes
  // it onto the stack.
  lookupBlockParam: function lookupBlockParam(blockParamId, parts) {
    this.useBlockParams = true;

    this.push(['blockParams[', blockParamId[0], '][', blockParamId[1], ']']);
    this.resolvePath('context', parts, 1);
  },

  // [lookupData]
  //
  // On stack, before: ...
  // On stack, after: data, ...
  //
  // Push the data lookup operator
  lookupData: function lookupData(depth, parts, strict) {
    if (!depth) {
      this.pushStackLiteral('data');
    } else {
      this.pushStackLiteral('container.data(data, ' + depth + ')');
    }

    this.resolvePath('data', parts, 0, true, strict);
  },

  resolvePath: function resolvePath(type, parts, i, falsy, strict) {
    // istanbul ignore next

    var _this2 = this;

    if (this.options.strict || this.options.assumeObjects) {
      this.push(strictLookup(this.options.strict && strict, this, parts, type));
      return;
    }

    var len = parts.length;
    for (; i < len; i++) {
      /* eslint-disable no-loop-func */
      this.replaceStack(function (current) {
        var lookup = _this2.nameLookup(current, parts[i], type);
        // We want to ensure that zero and false are handled properly if the context (falsy flag)
        // needs to have the special handling for these values.
        if (!falsy) {
          return [' != null ? ', lookup, ' : ', current];
        } else {
          // Otherwise we can use generic falsy handling
          return [' && ', lookup];
        }
      });
      /* eslint-enable no-loop-func */
    }
  },

  // [resolvePossibleLambda]
  //
  // On stack, before: value, ...
  // On stack, after: resolved value, ...
  //
  // If the `value` is a lambda, replace it on the stack by
  // the return value of the lambda
  resolvePossibleLambda: function resolvePossibleLambda() {
    this.push([this.aliasable('container.lambda'), '(', this.popStack(), ', ', this.contextName(0), ')']);
  },

  // [pushStringParam]
  //
  // On stack, before: ...
  // On stack, after: string, currentContext, ...
  //
  // This opcode is designed for use in string mode, which
  // provides the string value of a parameter along with its
  // depth rather than resolving it immediately.
  pushStringParam: function pushStringParam(string, type) {
    this.pushContext();
    this.pushString(type);

    // If it's a subexpression, the string result
    // will be pushed after this opcode.
    if (type !== 'SubExpression') {
      if (typeof string === 'string') {
        this.pushString(string);
      } else {
        this.pushStackLiteral(string);
      }
    }
  },

  emptyHash: function emptyHash(omitEmpty) {
    if (this.trackIds) {
      this.push('{}'); // hashIds
    }
    if (this.stringParams) {
      this.push('{}'); // hashContexts
      this.push('{}'); // hashTypes
    }
    this.pushStackLiteral(omitEmpty ? 'undefined' : '{}');
  },
  pushHash: function pushHash() {
    if (this.hash) {
      this.hashes.push(this.hash);
    }
    this.hash = { values: {}, types: [], contexts: [], ids: [] };
  },
  popHash: function popHash() {
    var hash = this.hash;
    this.hash = this.hashes.pop();

    if (this.trackIds) {
      this.push(this.objectLiteral(hash.ids));
    }
    if (this.stringParams) {
      this.push(this.objectLiteral(hash.contexts));
      this.push(this.objectLiteral(hash.types));
    }

    this.push(this.objectLiteral(hash.values));
  },

  // [pushString]
  //
  // On stack, before: ...
  // On stack, after: quotedString(string), ...
  //
  // Push a quoted version of `string` onto the stack
  pushString: function pushString(string) {
    this.pushStackLiteral(this.quotedString(string));
  },

  // [pushLiteral]
  //
  // On stack, before: ...
  // On stack, after: value, ...
  //
  // Pushes a value onto the stack. This operation prevents
  // the compiler from creating a temporary variable to hold
  // it.
  pushLiteral: function pushLiteral(value) {
    this.pushStackLiteral(value);
  },

  // [pushProgram]
  //
  // On stack, before: ...
  // On stack, after: program(guid), ...
  //
  // Push a program expression onto the stack. This takes
  // a compile-time guid and converts it into a runtime-accessible
  // expression.
  pushProgram: function pushProgram(guid) {
    if (guid != null) {
      this.pushStackLiteral(this.programExpression(guid));
    } else {
      this.pushStackLiteral(null);
    }
  },

  // [registerDecorator]
  //
  // On stack, before: hash, program, params..., ...
  // On stack, after: ...
  //
  // Pops off the decorator's parameters, invokes the decorator,
  // and inserts the decorator into the decorators list.
  registerDecorator: function registerDecorator(paramSize, name) {
    var foundDecorator = this.nameLookup('decorators', name, 'decorator'),
        options = this.setupHelperArgs(name, paramSize);

    this.decorators.push(['fn = ', this.decorators.functionCall(foundDecorator, '', ['fn', 'props', 'container', options]), ' || fn;']);
  },

  // [invokeHelper]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of helper invocation
  //
  // Pops off the helper's parameters, invokes the helper,
  // and pushes the helper's return value onto the stack.
  //
  // If the helper is not found, `helperMissing` is called.
  invokeHelper: function invokeHelper(paramSize, name, isSimple) {
    var nonHelper = this.popStack(),
        helper = this.setupHelper(paramSize, name);

    var possibleFunctionCalls = [];

    if (isSimple) {
      // direct call to helper
      possibleFunctionCalls.push(helper.name);
    }
    // call a function from the input object
    possibleFunctionCalls.push(nonHelper);
    if (!this.options.strict) {
      possibleFunctionCalls.push(this.aliasable('container.hooks.helperMissing'));
    }

    var functionLookupCode = ['(', this.itemsSeparatedBy(possibleFunctionCalls, '||'), ')'];
    var functionCall = this.source.functionCall(functionLookupCode, 'call', helper.callParams);
    this.push(functionCall);
  },

  itemsSeparatedBy: function itemsSeparatedBy(items, separator) {
    var result = [];
    result.push(items[0]);
    for (var i = 1; i < items.length; i++) {
      result.push(separator, items[i]);
    }
    return result;
  },
  // [invokeKnownHelper]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of helper invocation
  //
  // This operation is used when the helper is known to exist,
  // so a `helperMissing` fallback is not required.
  invokeKnownHelper: function invokeKnownHelper(paramSize, name) {
    var helper = this.setupHelper(paramSize, name);
    this.push(this.source.functionCall(helper.name, 'call', helper.callParams));
  },

  // [invokeAmbiguous]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of disambiguation
  //
  // This operation is used when an expression like `{{foo}}`
  // is provided, but we don't know at compile-time whether it
  // is a helper or a path.
  //
  // This operation emits more code than the other options,
  // and can be avoided by passing the `knownHelpers` and
  // `knownHelpersOnly` flags at compile-time.
  invokeAmbiguous: function invokeAmbiguous(name, helperCall) {
    this.useRegister('helper');

    var nonHelper = this.popStack();

    this.emptyHash();
    var helper = this.setupHelper(0, name, helperCall);

    var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

    var lookup = ['(', '(helper = ', helperName, ' || ', nonHelper, ')'];
    if (!this.options.strict) {
      lookup[0] = '(helper = ';
      lookup.push(' != null ? helper : ', this.aliasable('container.hooks.helperMissing'));
    }

    this.push(['(', lookup, helper.paramsInit ? ['),(', helper.paramsInit] : [], '),', '(typeof helper === ', this.aliasable('"function"'), ' ? ', this.source.functionCall('helper', 'call', helper.callParams), ' : helper))']);
  },

  // [invokePartial]
  //
  // On stack, before: context, ...
  // On stack after: result of partial invocation
  //
  // This operation pops off a context, invokes a partial with that context,
  // and pushes the result of the invocation back.
  invokePartial: function invokePartial(isDynamic, name, indent) {
    var params = [],
        options = this.setupParams(name, 1, params);

    if (isDynamic) {
      name = this.popStack();
      delete options.name;
    }

    if (indent) {
      options.indent = JSON.stringify(indent);
    }
    options.helpers = 'helpers';
    options.partials = 'partials';
    options.decorators = 'container.decorators';

    if (!isDynamic) {
      params.unshift(this.nameLookup('partials', name, 'partial'));
    } else {
      params.unshift(name);
    }

    if (this.options.compat) {
      options.depths = 'depths';
    }
    options = this.objectLiteral(options);
    params.push(options);

    this.push(this.source.functionCall('container.invokePartial', '', params));
  },

  // [assignToHash]
  //
  // On stack, before: value, ..., hash, ...
  // On stack, after: ..., hash, ...
  //
  // Pops a value off the stack and assigns it to the current hash
  assignToHash: function assignToHash(key) {
    var value = this.popStack(),
        context = undefined,
        type = undefined,
        id = undefined;

    if (this.trackIds) {
      id = this.popStack();
    }
    if (this.stringParams) {
      type = this.popStack();
      context = this.popStack();
    }

    var hash = this.hash;
    if (context) {
      hash.contexts[key] = context;
    }
    if (type) {
      hash.types[key] = type;
    }
    if (id) {
      hash.ids[key] = id;
    }
    hash.values[key] = value;
  },

  pushId: function pushId(type, name, child) {
    if (type === 'BlockParam') {
      this.pushStackLiteral('blockParams[' + name[0] + '].path[' + name[1] + ']' + (child ? ' + ' + JSON.stringify('.' + child) : ''));
    } else if (type === 'PathExpression') {
      this.pushString(name);
    } else if (type === 'SubExpression') {
      this.pushStackLiteral('true');
    } else {
      this.pushStackLiteral('null');
    }
  },

  // HELPERS

  compiler: JavaScriptCompiler,

  compileChildren: function compileChildren(environment, options) {
    var children = environment.children,
        child = undefined,
        compiler = undefined;

    for (var i = 0, l = children.length; i < l; i++) {
      child = children[i];
      compiler = new this.compiler(); // eslint-disable-line new-cap

      var existing = this.matchExistingProgram(child);

      if (existing == null) {
        this.context.programs.push(''); // Placeholder to prevent name conflicts for nested children
        var index = this.context.programs.length;
        child.index = index;
        child.name = 'program' + index;
        this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);
        this.context.decorators[index] = compiler.decorators;
        this.context.environments[index] = child;

        this.useDepths = this.useDepths || compiler.useDepths;
        this.useBlockParams = this.useBlockParams || compiler.useBlockParams;
        child.useDepths = this.useDepths;
        child.useBlockParams = this.useBlockParams;
      } else {
        child.index = existing.index;
        child.name = 'program' + existing.index;

        this.useDepths = this.useDepths || existing.useDepths;
        this.useBlockParams = this.useBlockParams || existing.useBlockParams;
      }
    }
  },
  matchExistingProgram: function matchExistingProgram(child) {
    for (var i = 0, len = this.context.environments.length; i < len; i++) {
      var environment = this.context.environments[i];
      if (environment && environment.equals(child)) {
        return environment;
      }
    }
  },

  programExpression: function programExpression(guid) {
    var child = this.environment.children[guid],
        programParams = [child.index, 'data', child.blockParams];

    if (this.useBlockParams || this.useDepths) {
      programParams.push('blockParams');
    }
    if (this.useDepths) {
      programParams.push('depths');
    }

    return 'container.program(' + programParams.join(', ') + ')';
  },

  useRegister: function useRegister(name) {
    if (!this.registers[name]) {
      this.registers[name] = true;
      this.registers.list.push(name);
    }
  },

  push: function push(expr) {
    if (!(expr instanceof Literal)) {
      expr = this.source.wrap(expr);
    }

    this.inlineStack.push(expr);
    return expr;
  },

  pushStackLiteral: function pushStackLiteral(item) {
    this.push(new Literal(item));
  },

  pushSource: function pushSource(source) {
    if (this.pendingContent) {
      this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent), this.pendingLocation));
      this.pendingContent = undefined;
    }

    if (source) {
      this.source.push(source);
    }
  },

  replaceStack: function replaceStack(callback) {
    var prefix = ['('],
        stack = undefined,
        createdStack = undefined,
        usedLiteral = undefined;

    /* istanbul ignore next */
    if (!this.isInline()) {
      throw new _exception2['default']('replaceStack on non-inline');
    }

    // We want to merge the inline statement into the replacement statement via ','
    var top = this.popStack(true);

    if (top instanceof Literal) {
      // Literals do not need to be inlined
      stack = [top.value];
      prefix = ['(', stack];
      usedLiteral = true;
    } else {
      // Get or create the current stack name for use by the inline
      createdStack = true;
      var _name = this.incrStack();

      prefix = ['((', this.push(_name), ' = ', top, ')'];
      stack = this.topStack();
    }

    var item = callback.call(this, stack);

    if (!usedLiteral) {
      this.popStack();
    }
    if (createdStack) {
      this.stackSlot--;
    }
    this.push(prefix.concat(item, ')'));
  },

  incrStack: function incrStack() {
    this.stackSlot++;
    if (this.stackSlot > this.stackVars.length) {
      this.stackVars.push('stack' + this.stackSlot);
    }
    return this.topStackName();
  },
  topStackName: function topStackName() {
    return 'stack' + this.stackSlot;
  },
  flushInline: function flushInline() {
    var inlineStack = this.inlineStack;
    this.inlineStack = [];
    for (var i = 0, len = inlineStack.length; i < len; i++) {
      var entry = inlineStack[i];
      /* istanbul ignore if */
      if (entry instanceof Literal) {
        this.compileStack.push(entry);
      } else {
        var stack = this.incrStack();
        this.pushSource([stack, ' = ', entry, ';']);
        this.compileStack.push(stack);
      }
    }
  },
  isInline: function isInline() {
    return this.inlineStack.length;
  },

  popStack: function popStack(wrapped) {
    var inline = this.isInline(),
        item = (inline ? this.inlineStack : this.compileStack).pop();

    if (!wrapped && item instanceof Literal) {
      return item.value;
    } else {
      if (!inline) {
        /* istanbul ignore next */
        if (!this.stackSlot) {
          throw new _exception2['default']('Invalid stack pop');
        }
        this.stackSlot--;
      }
      return item;
    }
  },

  topStack: function topStack() {
    var stack = this.isInline() ? this.inlineStack : this.compileStack,
        item = stack[stack.length - 1];

    /* istanbul ignore if */
    if (item instanceof Literal) {
      return item.value;
    } else {
      return item;
    }
  },

  contextName: function contextName(context) {
    if (this.useDepths && context) {
      return 'depths[' + context + ']';
    } else {
      return 'depth' + context;
    }
  },

  quotedString: function quotedString(str) {
    return this.source.quotedString(str);
  },

  objectLiteral: function objectLiteral(obj) {
    return this.source.objectLiteral(obj);
  },

  aliasable: function aliasable(name) {
    var ret = this.aliases[name];
    if (ret) {
      ret.referenceCount++;
      return ret;
    }

    ret = this.aliases[name] = this.source.wrap(name);
    ret.aliasable = true;
    ret.referenceCount = 1;

    return ret;
  },

  setupHelper: function setupHelper(paramSize, name, blockHelper) {
    var params = [],
        paramsInit = this.setupHelperArgs(name, paramSize, params, blockHelper);
    var foundHelper = this.nameLookup('helpers', name, 'helper'),
        callContext = this.aliasable(this.contextName(0) + ' != null ? ' + this.contextName(0) + ' : (container.nullContext || {})');

    return {
      params: params,
      paramsInit: paramsInit,
      name: foundHelper,
      callParams: [callContext].concat(params)
    };
  },

  setupParams: function setupParams(helper, paramSize, params) {
    var options = {},
        contexts = [],
        types = [],
        ids = [],
        objectArgs = !params,
        param = undefined;

    if (objectArgs) {
      params = [];
    }

    options.name = this.quotedString(helper);
    options.hash = this.popStack();

    if (this.trackIds) {
      options.hashIds = this.popStack();
    }
    if (this.stringParams) {
      options.hashTypes = this.popStack();
      options.hashContexts = this.popStack();
    }

    var inverse = this.popStack(),
        program = this.popStack();

    // Avoid setting fn and inverse if neither are set. This allows
    // helpers to do a check for `if (options.fn)`
    if (program || inverse) {
      options.fn = program || 'container.noop';
      options.inverse = inverse || 'container.noop';
    }

    // The parameters go on to the stack in order (making sure that they are evaluated in order)
    // so we need to pop them off the stack in reverse order
    var i = paramSize;
    while (i--) {
      param = this.popStack();
      params[i] = param;

      if (this.trackIds) {
        ids[i] = this.popStack();
      }
      if (this.stringParams) {
        types[i] = this.popStack();
        contexts[i] = this.popStack();
      }
    }

    if (objectArgs) {
      options.args = this.source.generateArray(params);
    }

    if (this.trackIds) {
      options.ids = this.source.generateArray(ids);
    }
    if (this.stringParams) {
      options.types = this.source.generateArray(types);
      options.contexts = this.source.generateArray(contexts);
    }

    if (this.options.data) {
      options.data = 'data';
    }
    if (this.useBlockParams) {
      options.blockParams = 'blockParams';
    }
    return options;
  },

  setupHelperArgs: function setupHelperArgs(helper, paramSize, params, useRegister) {
    var options = this.setupParams(helper, paramSize, params);
    options.loc = JSON.stringify(this.source.currentLocation);
    options = this.objectLiteral(options);
    if (useRegister) {
      this.useRegister('options');
      params.push('options');
      return ['options=', options];
    } else if (params) {
      params.push(options);
      return '';
    } else {
      return options;
    }
  }
};

(function () {
  var reservedWords = ('break else new var' + ' case finally return void' + ' catch for switch while' + ' continue function this with' + ' default if throw' + ' delete in try' + ' do instanceof typeof' + ' abstract enum int short' + ' boolean export interface static' + ' byte extends long super' + ' char final native synchronized' + ' class float package throws' + ' const goto private transient' + ' debugger implements protected volatile' + ' double import public let yield await' + ' null true false').split(' ');

  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

  for (var i = 0, l = reservedWords.length; i < l; i++) {
    compilerWords[reservedWords[i]] = true;
  }
})();

/**
 * @deprecated May be removed in the next major version
 */
JavaScriptCompiler.isValidJavaScriptVariableName = function (name) {
  return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
};

function strictLookup(requireTerminal, compiler, parts, type) {
  var stack = compiler.popStack(),
      i = 0,
      len = parts.length;
  if (requireTerminal) {
    len--;
  }

  for (; i < len; i++) {
    stack = compiler.nameLookup(stack, parts[i], type);
  }

  if (requireTerminal) {
    return [compiler.aliasable('container.strict'), '(', stack, ', ', compiler.quotedString(parts[i]), ', ', JSON.stringify(compiler.source.currentLocation), ' )'];
  } else {
    return stack;
  }
}

exports['default'] = JavaScriptCompiler;
module.exports = exports['default'];


},{"../base":214,"../exception":227,"../utils":243,"./code-gen":217}],221:[function(require,module,exports){
// File ignored in coverage tests via setting in .istanbul.yml
/* Jison generated parser */
"use strict";

exports.__esModule = true;
var handlebars = (function () {
    var parser = { trace: function trace() {},
        yy: {},
        symbols_: { "error": 2, "root": 3, "program": 4, "EOF": 5, "program_repetition0": 6, "statement": 7, "mustache": 8, "block": 9, "rawBlock": 10, "partial": 11, "partialBlock": 12, "content": 13, "COMMENT": 14, "CONTENT": 15, "openRawBlock": 16, "rawBlock_repetition0": 17, "END_RAW_BLOCK": 18, "OPEN_RAW_BLOCK": 19, "helperName": 20, "openRawBlock_repetition0": 21, "openRawBlock_option0": 22, "CLOSE_RAW_BLOCK": 23, "openBlock": 24, "block_option0": 25, "closeBlock": 26, "openInverse": 27, "block_option1": 28, "OPEN_BLOCK": 29, "openBlock_repetition0": 30, "openBlock_option0": 31, "openBlock_option1": 32, "CLOSE": 33, "OPEN_INVERSE": 34, "openInverse_repetition0": 35, "openInverse_option0": 36, "openInverse_option1": 37, "openInverseChain": 38, "OPEN_INVERSE_CHAIN": 39, "openInverseChain_repetition0": 40, "openInverseChain_option0": 41, "openInverseChain_option1": 42, "inverseAndProgram": 43, "INVERSE": 44, "inverseChain": 45, "inverseChain_option0": 46, "OPEN_ENDBLOCK": 47, "OPEN": 48, "mustache_repetition0": 49, "mustache_option0": 50, "OPEN_UNESCAPED": 51, "mustache_repetition1": 52, "mustache_option1": 53, "CLOSE_UNESCAPED": 54, "OPEN_PARTIAL": 55, "partialName": 56, "partial_repetition0": 57, "partial_option0": 58, "openPartialBlock": 59, "OPEN_PARTIAL_BLOCK": 60, "openPartialBlock_repetition0": 61, "openPartialBlock_option0": 62, "param": 63, "sexpr": 64, "OPEN_SEXPR": 65, "sexpr_repetition0": 66, "sexpr_option0": 67, "CLOSE_SEXPR": 68, "hash": 69, "hash_repetition_plus0": 70, "hashSegment": 71, "ID": 72, "EQUALS": 73, "blockParams": 74, "OPEN_BLOCK_PARAMS": 75, "blockParams_repetition_plus0": 76, "CLOSE_BLOCK_PARAMS": 77, "path": 78, "dataName": 79, "STRING": 80, "NUMBER": 81, "BOOLEAN": 82, "UNDEFINED": 83, "NULL": 84, "DATA": 85, "pathSegments": 86, "SEP": 87, "$accept": 0, "$end": 1 },
        terminals_: { 2: "error", 5: "EOF", 14: "COMMENT", 15: "CONTENT", 18: "END_RAW_BLOCK", 19: "OPEN_RAW_BLOCK", 23: "CLOSE_RAW_BLOCK", 29: "OPEN_BLOCK", 33: "CLOSE", 34: "OPEN_INVERSE", 39: "OPEN_INVERSE_CHAIN", 44: "INVERSE", 47: "OPEN_ENDBLOCK", 48: "OPEN", 51: "OPEN_UNESCAPED", 54: "CLOSE_UNESCAPED", 55: "OPEN_PARTIAL", 60: "OPEN_PARTIAL_BLOCK", 65: "OPEN_SEXPR", 68: "CLOSE_SEXPR", 72: "ID", 73: "EQUALS", 75: "OPEN_BLOCK_PARAMS", 77: "CLOSE_BLOCK_PARAMS", 80: "STRING", 81: "NUMBER", 82: "BOOLEAN", 83: "UNDEFINED", 84: "NULL", 85: "DATA", 87: "SEP" },
        productions_: [0, [3, 2], [4, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [13, 1], [10, 3], [16, 5], [9, 4], [9, 4], [24, 6], [27, 6], [38, 6], [43, 2], [45, 3], [45, 1], [26, 3], [8, 5], [8, 5], [11, 5], [12, 3], [59, 5], [63, 1], [63, 1], [64, 5], [69, 1], [71, 3], [74, 3], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [56, 1], [56, 1], [79, 2], [78, 1], [86, 3], [86, 1], [6, 0], [6, 2], [17, 0], [17, 2], [21, 0], [21, 2], [22, 0], [22, 1], [25, 0], [25, 1], [28, 0], [28, 1], [30, 0], [30, 2], [31, 0], [31, 1], [32, 0], [32, 1], [35, 0], [35, 2], [36, 0], [36, 1], [37, 0], [37, 1], [40, 0], [40, 2], [41, 0], [41, 1], [42, 0], [42, 1], [46, 0], [46, 1], [49, 0], [49, 2], [50, 0], [50, 1], [52, 0], [52, 2], [53, 0], [53, 1], [57, 0], [57, 2], [58, 0], [58, 1], [61, 0], [61, 2], [62, 0], [62, 1], [66, 0], [66, 2], [67, 0], [67, 1], [70, 1], [70, 2], [76, 1], [76, 2]],
        performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {

            var $0 = $$.length - 1;
            switch (yystate) {
                case 1:
                    return $$[$0 - 1];
                    break;
                case 2:
                    this.$ = yy.prepareProgram($$[$0]);
                    break;
                case 3:
                    this.$ = $$[$0];
                    break;
                case 4:
                    this.$ = $$[$0];
                    break;
                case 5:
                    this.$ = $$[$0];
                    break;
                case 6:
                    this.$ = $$[$0];
                    break;
                case 7:
                    this.$ = $$[$0];
                    break;
                case 8:
                    this.$ = $$[$0];
                    break;
                case 9:
                    this.$ = {
                        type: 'CommentStatement',
                        value: yy.stripComment($$[$0]),
                        strip: yy.stripFlags($$[$0], $$[$0]),
                        loc: yy.locInfo(this._$)
                    };

                    break;
                case 10:
                    this.$ = {
                        type: 'ContentStatement',
                        original: $$[$0],
                        value: $$[$0],
                        loc: yy.locInfo(this._$)
                    };

                    break;
                case 11:
                    this.$ = yy.prepareRawBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
                    break;
                case 12:
                    this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1] };
                    break;
                case 13:
                    this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], false, this._$);
                    break;
                case 14:
                    this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], true, this._$);
                    break;
                case 15:
                    this.$ = { open: $$[$0 - 5], path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
                    break;
                case 16:
                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
                    break;
                case 17:
                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
                    break;
                case 18:
                    this.$ = { strip: yy.stripFlags($$[$0 - 1], $$[$0 - 1]), program: $$[$0] };
                    break;
                case 19:
                    var inverse = yy.prepareBlock($$[$0 - 2], $$[$0 - 1], $$[$0], $$[$0], false, this._$),
                        program = yy.prepareProgram([inverse], $$[$0 - 1].loc);
                    program.chained = true;

                    this.$ = { strip: $$[$0 - 2].strip, program: program, chain: true };

                    break;
                case 20:
                    this.$ = $$[$0];
                    break;
                case 21:
                    this.$ = { path: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 2], $$[$0]) };
                    break;
                case 22:
                    this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
                    break;
                case 23:
                    this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
                    break;
                case 24:
                    this.$ = {
                        type: 'PartialStatement',
                        name: $$[$0 - 3],
                        params: $$[$0 - 2],
                        hash: $$[$0 - 1],
                        indent: '',
                        strip: yy.stripFlags($$[$0 - 4], $$[$0]),
                        loc: yy.locInfo(this._$)
                    };

                    break;
                case 25:
                    this.$ = yy.preparePartialBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
                    break;
                case 26:
                    this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 4], $$[$0]) };
                    break;
                case 27:
                    this.$ = $$[$0];
                    break;
                case 28:
                    this.$ = $$[$0];
                    break;
                case 29:
                    this.$ = {
                        type: 'SubExpression',
                        path: $$[$0 - 3],
                        params: $$[$0 - 2],
                        hash: $$[$0 - 1],
                        loc: yy.locInfo(this._$)
                    };

                    break;
                case 30:
                    this.$ = { type: 'Hash', pairs: $$[$0], loc: yy.locInfo(this._$) };
                    break;
                case 31:
                    this.$ = { type: 'HashPair', key: yy.id($$[$0 - 2]), value: $$[$0], loc: yy.locInfo(this._$) };
                    break;
                case 32:
                    this.$ = yy.id($$[$0 - 1]);
                    break;
                case 33:
                    this.$ = $$[$0];
                    break;
                case 34:
                    this.$ = $$[$0];
                    break;
                case 35:
                    this.$ = { type: 'StringLiteral', value: $$[$0], original: $$[$0], loc: yy.locInfo(this._$) };
                    break;
                case 36:
                    this.$ = { type: 'NumberLiteral', value: Number($$[$0]), original: Number($$[$0]), loc: yy.locInfo(this._$) };
                    break;
                case 37:
                    this.$ = { type: 'BooleanLiteral', value: $$[$0] === 'true', original: $$[$0] === 'true', loc: yy.locInfo(this._$) };
                    break;
                case 38:
                    this.$ = { type: 'UndefinedLiteral', original: undefined, value: undefined, loc: yy.locInfo(this._$) };
                    break;
                case 39:
                    this.$ = { type: 'NullLiteral', original: null, value: null, loc: yy.locInfo(this._$) };
                    break;
                case 40:
                    this.$ = $$[$0];
                    break;
                case 41:
                    this.$ = $$[$0];
                    break;
                case 42:
                    this.$ = yy.preparePath(true, $$[$0], this._$);
                    break;
                case 43:
                    this.$ = yy.preparePath(false, $$[$0], this._$);
                    break;
                case 44:
                    $$[$0 - 2].push({ part: yy.id($$[$0]), original: $$[$0], separator: $$[$0 - 1] });this.$ = $$[$0 - 2];
                    break;
                case 45:
                    this.$ = [{ part: yy.id($$[$0]), original: $$[$0] }];
                    break;
                case 46:
                    this.$ = [];
                    break;
                case 47:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 48:
                    this.$ = [];
                    break;
                case 49:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 50:
                    this.$ = [];
                    break;
                case 51:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 58:
                    this.$ = [];
                    break;
                case 59:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 64:
                    this.$ = [];
                    break;
                case 65:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 70:
                    this.$ = [];
                    break;
                case 71:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 78:
                    this.$ = [];
                    break;
                case 79:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 82:
                    this.$ = [];
                    break;
                case 83:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 86:
                    this.$ = [];
                    break;
                case 87:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 90:
                    this.$ = [];
                    break;
                case 91:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 94:
                    this.$ = [];
                    break;
                case 95:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 98:
                    this.$ = [$$[$0]];
                    break;
                case 99:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 100:
                    this.$ = [$$[$0]];
                    break;
                case 101:
                    $$[$0 - 1].push($$[$0]);
                    break;
            }
        },
        table: [{ 3: 1, 4: 2, 5: [2, 46], 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 1: [3] }, { 5: [1, 4] }, { 5: [2, 2], 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: 11, 14: [1, 12], 15: [1, 20], 16: 17, 19: [1, 23], 24: 15, 27: 16, 29: [1, 21], 34: [1, 22], 39: [2, 2], 44: [2, 2], 47: [2, 2], 48: [1, 13], 51: [1, 14], 55: [1, 18], 59: 19, 60: [1, 24] }, { 1: [2, 1] }, { 5: [2, 47], 14: [2, 47], 15: [2, 47], 19: [2, 47], 29: [2, 47], 34: [2, 47], 39: [2, 47], 44: [2, 47], 47: [2, 47], 48: [2, 47], 51: [2, 47], 55: [2, 47], 60: [2, 47] }, { 5: [2, 3], 14: [2, 3], 15: [2, 3], 19: [2, 3], 29: [2, 3], 34: [2, 3], 39: [2, 3], 44: [2, 3], 47: [2, 3], 48: [2, 3], 51: [2, 3], 55: [2, 3], 60: [2, 3] }, { 5: [2, 4], 14: [2, 4], 15: [2, 4], 19: [2, 4], 29: [2, 4], 34: [2, 4], 39: [2, 4], 44: [2, 4], 47: [2, 4], 48: [2, 4], 51: [2, 4], 55: [2, 4], 60: [2, 4] }, { 5: [2, 5], 14: [2, 5], 15: [2, 5], 19: [2, 5], 29: [2, 5], 34: [2, 5], 39: [2, 5], 44: [2, 5], 47: [2, 5], 48: [2, 5], 51: [2, 5], 55: [2, 5], 60: [2, 5] }, { 5: [2, 6], 14: [2, 6], 15: [2, 6], 19: [2, 6], 29: [2, 6], 34: [2, 6], 39: [2, 6], 44: [2, 6], 47: [2, 6], 48: [2, 6], 51: [2, 6], 55: [2, 6], 60: [2, 6] }, { 5: [2, 7], 14: [2, 7], 15: [2, 7], 19: [2, 7], 29: [2, 7], 34: [2, 7], 39: [2, 7], 44: [2, 7], 47: [2, 7], 48: [2, 7], 51: [2, 7], 55: [2, 7], 60: [2, 7] }, { 5: [2, 8], 14: [2, 8], 15: [2, 8], 19: [2, 8], 29: [2, 8], 34: [2, 8], 39: [2, 8], 44: [2, 8], 47: [2, 8], 48: [2, 8], 51: [2, 8], 55: [2, 8], 60: [2, 8] }, { 5: [2, 9], 14: [2, 9], 15: [2, 9], 19: [2, 9], 29: [2, 9], 34: [2, 9], 39: [2, 9], 44: [2, 9], 47: [2, 9], 48: [2, 9], 51: [2, 9], 55: [2, 9], 60: [2, 9] }, { 20: 25, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 36, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 37, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 39: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 4: 38, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 15: [2, 48], 17: 39, 18: [2, 48] }, { 20: 41, 56: 40, 64: 42, 65: [1, 43], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 44, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 5: [2, 10], 14: [2, 10], 15: [2, 10], 18: [2, 10], 19: [2, 10], 29: [2, 10], 34: [2, 10], 39: [2, 10], 44: [2, 10], 47: [2, 10], 48: [2, 10], 51: [2, 10], 55: [2, 10], 60: [2, 10] }, { 20: 45, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 46, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 47, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 41, 56: 48, 64: 42, 65: [1, 43], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [2, 78], 49: 49, 65: [2, 78], 72: [2, 78], 80: [2, 78], 81: [2, 78], 82: [2, 78], 83: [2, 78], 84: [2, 78], 85: [2, 78] }, { 23: [2, 33], 33: [2, 33], 54: [2, 33], 65: [2, 33], 68: [2, 33], 72: [2, 33], 75: [2, 33], 80: [2, 33], 81: [2, 33], 82: [2, 33], 83: [2, 33], 84: [2, 33], 85: [2, 33] }, { 23: [2, 34], 33: [2, 34], 54: [2, 34], 65: [2, 34], 68: [2, 34], 72: [2, 34], 75: [2, 34], 80: [2, 34], 81: [2, 34], 82: [2, 34], 83: [2, 34], 84: [2, 34], 85: [2, 34] }, { 23: [2, 35], 33: [2, 35], 54: [2, 35], 65: [2, 35], 68: [2, 35], 72: [2, 35], 75: [2, 35], 80: [2, 35], 81: [2, 35], 82: [2, 35], 83: [2, 35], 84: [2, 35], 85: [2, 35] }, { 23: [2, 36], 33: [2, 36], 54: [2, 36], 65: [2, 36], 68: [2, 36], 72: [2, 36], 75: [2, 36], 80: [2, 36], 81: [2, 36], 82: [2, 36], 83: [2, 36], 84: [2, 36], 85: [2, 36] }, { 23: [2, 37], 33: [2, 37], 54: [2, 37], 65: [2, 37], 68: [2, 37], 72: [2, 37], 75: [2, 37], 80: [2, 37], 81: [2, 37], 82: [2, 37], 83: [2, 37], 84: [2, 37], 85: [2, 37] }, { 23: [2, 38], 33: [2, 38], 54: [2, 38], 65: [2, 38], 68: [2, 38], 72: [2, 38], 75: [2, 38], 80: [2, 38], 81: [2, 38], 82: [2, 38], 83: [2, 38], 84: [2, 38], 85: [2, 38] }, { 23: [2, 39], 33: [2, 39], 54: [2, 39], 65: [2, 39], 68: [2, 39], 72: [2, 39], 75: [2, 39], 80: [2, 39], 81: [2, 39], 82: [2, 39], 83: [2, 39], 84: [2, 39], 85: [2, 39] }, { 23: [2, 43], 33: [2, 43], 54: [2, 43], 65: [2, 43], 68: [2, 43], 72: [2, 43], 75: [2, 43], 80: [2, 43], 81: [2, 43], 82: [2, 43], 83: [2, 43], 84: [2, 43], 85: [2, 43], 87: [1, 50] }, { 72: [1, 35], 86: 51 }, { 23: [2, 45], 33: [2, 45], 54: [2, 45], 65: [2, 45], 68: [2, 45], 72: [2, 45], 75: [2, 45], 80: [2, 45], 81: [2, 45], 82: [2, 45], 83: [2, 45], 84: [2, 45], 85: [2, 45], 87: [2, 45] }, { 52: 52, 54: [2, 82], 65: [2, 82], 72: [2, 82], 80: [2, 82], 81: [2, 82], 82: [2, 82], 83: [2, 82], 84: [2, 82], 85: [2, 82] }, { 25: 53, 38: 55, 39: [1, 57], 43: 56, 44: [1, 58], 45: 54, 47: [2, 54] }, { 28: 59, 43: 60, 44: [1, 58], 47: [2, 56] }, { 13: 62, 15: [1, 20], 18: [1, 61] }, { 33: [2, 86], 57: 63, 65: [2, 86], 72: [2, 86], 80: [2, 86], 81: [2, 86], 82: [2, 86], 83: [2, 86], 84: [2, 86], 85: [2, 86] }, { 33: [2, 40], 65: [2, 40], 72: [2, 40], 80: [2, 40], 81: [2, 40], 82: [2, 40], 83: [2, 40], 84: [2, 40], 85: [2, 40] }, { 33: [2, 41], 65: [2, 41], 72: [2, 41], 80: [2, 41], 81: [2, 41], 82: [2, 41], 83: [2, 41], 84: [2, 41], 85: [2, 41] }, { 20: 64, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 26: 65, 47: [1, 66] }, { 30: 67, 33: [2, 58], 65: [2, 58], 72: [2, 58], 75: [2, 58], 80: [2, 58], 81: [2, 58], 82: [2, 58], 83: [2, 58], 84: [2, 58], 85: [2, 58] }, { 33: [2, 64], 35: 68, 65: [2, 64], 72: [2, 64], 75: [2, 64], 80: [2, 64], 81: [2, 64], 82: [2, 64], 83: [2, 64], 84: [2, 64], 85: [2, 64] }, { 21: 69, 23: [2, 50], 65: [2, 50], 72: [2, 50], 80: [2, 50], 81: [2, 50], 82: [2, 50], 83: [2, 50], 84: [2, 50], 85: [2, 50] }, { 33: [2, 90], 61: 70, 65: [2, 90], 72: [2, 90], 80: [2, 90], 81: [2, 90], 82: [2, 90], 83: [2, 90], 84: [2, 90], 85: [2, 90] }, { 20: 74, 33: [2, 80], 50: 71, 63: 72, 64: 75, 65: [1, 43], 69: 73, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 72: [1, 79] }, { 23: [2, 42], 33: [2, 42], 54: [2, 42], 65: [2, 42], 68: [2, 42], 72: [2, 42], 75: [2, 42], 80: [2, 42], 81: [2, 42], 82: [2, 42], 83: [2, 42], 84: [2, 42], 85: [2, 42], 87: [1, 50] }, { 20: 74, 53: 80, 54: [2, 84], 63: 81, 64: 75, 65: [1, 43], 69: 82, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 26: 83, 47: [1, 66] }, { 47: [2, 55] }, { 4: 84, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 39: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 47: [2, 20] }, { 20: 85, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 86, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 26: 87, 47: [1, 66] }, { 47: [2, 57] }, { 5: [2, 11], 14: [2, 11], 15: [2, 11], 19: [2, 11], 29: [2, 11], 34: [2, 11], 39: [2, 11], 44: [2, 11], 47: [2, 11], 48: [2, 11], 51: [2, 11], 55: [2, 11], 60: [2, 11] }, { 15: [2, 49], 18: [2, 49] }, { 20: 74, 33: [2, 88], 58: 88, 63: 89, 64: 75, 65: [1, 43], 69: 90, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 65: [2, 94], 66: 91, 68: [2, 94], 72: [2, 94], 80: [2, 94], 81: [2, 94], 82: [2, 94], 83: [2, 94], 84: [2, 94], 85: [2, 94] }, { 5: [2, 25], 14: [2, 25], 15: [2, 25], 19: [2, 25], 29: [2, 25], 34: [2, 25], 39: [2, 25], 44: [2, 25], 47: [2, 25], 48: [2, 25], 51: [2, 25], 55: [2, 25], 60: [2, 25] }, { 20: 92, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 74, 31: 93, 33: [2, 60], 63: 94, 64: 75, 65: [1, 43], 69: 95, 70: 76, 71: 77, 72: [1, 78], 75: [2, 60], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 74, 33: [2, 66], 36: 96, 63: 97, 64: 75, 65: [1, 43], 69: 98, 70: 76, 71: 77, 72: [1, 78], 75: [2, 66], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 74, 22: 99, 23: [2, 52], 63: 100, 64: 75, 65: [1, 43], 69: 101, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 74, 33: [2, 92], 62: 102, 63: 103, 64: 75, 65: [1, 43], 69: 104, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [1, 105] }, { 33: [2, 79], 65: [2, 79], 72: [2, 79], 80: [2, 79], 81: [2, 79], 82: [2, 79], 83: [2, 79], 84: [2, 79], 85: [2, 79] }, { 33: [2, 81] }, { 23: [2, 27], 33: [2, 27], 54: [2, 27], 65: [2, 27], 68: [2, 27], 72: [2, 27], 75: [2, 27], 80: [2, 27], 81: [2, 27], 82: [2, 27], 83: [2, 27], 84: [2, 27], 85: [2, 27] }, { 23: [2, 28], 33: [2, 28], 54: [2, 28], 65: [2, 28], 68: [2, 28], 72: [2, 28], 75: [2, 28], 80: [2, 28], 81: [2, 28], 82: [2, 28], 83: [2, 28], 84: [2, 28], 85: [2, 28] }, { 23: [2, 30], 33: [2, 30], 54: [2, 30], 68: [2, 30], 71: 106, 72: [1, 107], 75: [2, 30] }, { 23: [2, 98], 33: [2, 98], 54: [2, 98], 68: [2, 98], 72: [2, 98], 75: [2, 98] }, { 23: [2, 45], 33: [2, 45], 54: [2, 45], 65: [2, 45], 68: [2, 45], 72: [2, 45], 73: [1, 108], 75: [2, 45], 80: [2, 45], 81: [2, 45], 82: [2, 45], 83: [2, 45], 84: [2, 45], 85: [2, 45], 87: [2, 45] }, { 23: [2, 44], 33: [2, 44], 54: [2, 44], 65: [2, 44], 68: [2, 44], 72: [2, 44], 75: [2, 44], 80: [2, 44], 81: [2, 44], 82: [2, 44], 83: [2, 44], 84: [2, 44], 85: [2, 44], 87: [2, 44] }, { 54: [1, 109] }, { 54: [2, 83], 65: [2, 83], 72: [2, 83], 80: [2, 83], 81: [2, 83], 82: [2, 83], 83: [2, 83], 84: [2, 83], 85: [2, 83] }, { 54: [2, 85] }, { 5: [2, 13], 14: [2, 13], 15: [2, 13], 19: [2, 13], 29: [2, 13], 34: [2, 13], 39: [2, 13], 44: [2, 13], 47: [2, 13], 48: [2, 13], 51: [2, 13], 55: [2, 13], 60: [2, 13] }, { 38: 55, 39: [1, 57], 43: 56, 44: [1, 58], 45: 111, 46: 110, 47: [2, 76] }, { 33: [2, 70], 40: 112, 65: [2, 70], 72: [2, 70], 75: [2, 70], 80: [2, 70], 81: [2, 70], 82: [2, 70], 83: [2, 70], 84: [2, 70], 85: [2, 70] }, { 47: [2, 18] }, { 5: [2, 14], 14: [2, 14], 15: [2, 14], 19: [2, 14], 29: [2, 14], 34: [2, 14], 39: [2, 14], 44: [2, 14], 47: [2, 14], 48: [2, 14], 51: [2, 14], 55: [2, 14], 60: [2, 14] }, { 33: [1, 113] }, { 33: [2, 87], 65: [2, 87], 72: [2, 87], 80: [2, 87], 81: [2, 87], 82: [2, 87], 83: [2, 87], 84: [2, 87], 85: [2, 87] }, { 33: [2, 89] }, { 20: 74, 63: 115, 64: 75, 65: [1, 43], 67: 114, 68: [2, 96], 69: 116, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [1, 117] }, { 32: 118, 33: [2, 62], 74: 119, 75: [1, 120] }, { 33: [2, 59], 65: [2, 59], 72: [2, 59], 75: [2, 59], 80: [2, 59], 81: [2, 59], 82: [2, 59], 83: [2, 59], 84: [2, 59], 85: [2, 59] }, { 33: [2, 61], 75: [2, 61] }, { 33: [2, 68], 37: 121, 74: 122, 75: [1, 120] }, { 33: [2, 65], 65: [2, 65], 72: [2, 65], 75: [2, 65], 80: [2, 65], 81: [2, 65], 82: [2, 65], 83: [2, 65], 84: [2, 65], 85: [2, 65] }, { 33: [2, 67], 75: [2, 67] }, { 23: [1, 123] }, { 23: [2, 51], 65: [2, 51], 72: [2, 51], 80: [2, 51], 81: [2, 51], 82: [2, 51], 83: [2, 51], 84: [2, 51], 85: [2, 51] }, { 23: [2, 53] }, { 33: [1, 124] }, { 33: [2, 91], 65: [2, 91], 72: [2, 91], 80: [2, 91], 81: [2, 91], 82: [2, 91], 83: [2, 91], 84: [2, 91], 85: [2, 91] }, { 33: [2, 93] }, { 5: [2, 22], 14: [2, 22], 15: [2, 22], 19: [2, 22], 29: [2, 22], 34: [2, 22], 39: [2, 22], 44: [2, 22], 47: [2, 22], 48: [2, 22], 51: [2, 22], 55: [2, 22], 60: [2, 22] }, { 23: [2, 99], 33: [2, 99], 54: [2, 99], 68: [2, 99], 72: [2, 99], 75: [2, 99] }, { 73: [1, 108] }, { 20: 74, 63: 125, 64: 75, 65: [1, 43], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 5: [2, 23], 14: [2, 23], 15: [2, 23], 19: [2, 23], 29: [2, 23], 34: [2, 23], 39: [2, 23], 44: [2, 23], 47: [2, 23], 48: [2, 23], 51: [2, 23], 55: [2, 23], 60: [2, 23] }, { 47: [2, 19] }, { 47: [2, 77] }, { 20: 74, 33: [2, 72], 41: 126, 63: 127, 64: 75, 65: [1, 43], 69: 128, 70: 76, 71: 77, 72: [1, 78], 75: [2, 72], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 5: [2, 24], 14: [2, 24], 15: [2, 24], 19: [2, 24], 29: [2, 24], 34: [2, 24], 39: [2, 24], 44: [2, 24], 47: [2, 24], 48: [2, 24], 51: [2, 24], 55: [2, 24], 60: [2, 24] }, { 68: [1, 129] }, { 65: [2, 95], 68: [2, 95], 72: [2, 95], 80: [2, 95], 81: [2, 95], 82: [2, 95], 83: [2, 95], 84: [2, 95], 85: [2, 95] }, { 68: [2, 97] }, { 5: [2, 21], 14: [2, 21], 15: [2, 21], 19: [2, 21], 29: [2, 21], 34: [2, 21], 39: [2, 21], 44: [2, 21], 47: [2, 21], 48: [2, 21], 51: [2, 21], 55: [2, 21], 60: [2, 21] }, { 33: [1, 130] }, { 33: [2, 63] }, { 72: [1, 132], 76: 131 }, { 33: [1, 133] }, { 33: [2, 69] }, { 15: [2, 12], 18: [2, 12] }, { 14: [2, 26], 15: [2, 26], 19: [2, 26], 29: [2, 26], 34: [2, 26], 47: [2, 26], 48: [2, 26], 51: [2, 26], 55: [2, 26], 60: [2, 26] }, { 23: [2, 31], 33: [2, 31], 54: [2, 31], 68: [2, 31], 72: [2, 31], 75: [2, 31] }, { 33: [2, 74], 42: 134, 74: 135, 75: [1, 120] }, { 33: [2, 71], 65: [2, 71], 72: [2, 71], 75: [2, 71], 80: [2, 71], 81: [2, 71], 82: [2, 71], 83: [2, 71], 84: [2, 71], 85: [2, 71] }, { 33: [2, 73], 75: [2, 73] }, { 23: [2, 29], 33: [2, 29], 54: [2, 29], 65: [2, 29], 68: [2, 29], 72: [2, 29], 75: [2, 29], 80: [2, 29], 81: [2, 29], 82: [2, 29], 83: [2, 29], 84: [2, 29], 85: [2, 29] }, { 14: [2, 15], 15: [2, 15], 19: [2, 15], 29: [2, 15], 34: [2, 15], 39: [2, 15], 44: [2, 15], 47: [2, 15], 48: [2, 15], 51: [2, 15], 55: [2, 15], 60: [2, 15] }, { 72: [1, 137], 77: [1, 136] }, { 72: [2, 100], 77: [2, 100] }, { 14: [2, 16], 15: [2, 16], 19: [2, 16], 29: [2, 16], 34: [2, 16], 44: [2, 16], 47: [2, 16], 48: [2, 16], 51: [2, 16], 55: [2, 16], 60: [2, 16] }, { 33: [1, 138] }, { 33: [2, 75] }, { 33: [2, 32] }, { 72: [2, 101], 77: [2, 101] }, { 14: [2, 17], 15: [2, 17], 19: [2, 17], 29: [2, 17], 34: [2, 17], 39: [2, 17], 44: [2, 17], 47: [2, 17], 48: [2, 17], 51: [2, 17], 55: [2, 17], 60: [2, 17] }],
        defaultActions: { 4: [2, 1], 54: [2, 55], 56: [2, 20], 60: [2, 57], 73: [2, 81], 82: [2, 85], 86: [2, 18], 90: [2, 89], 101: [2, 53], 104: [2, 93], 110: [2, 19], 111: [2, 77], 116: [2, 97], 119: [2, 63], 122: [2, 69], 135: [2, 75], 136: [2, 32] },
        parseError: function parseError(str, hash) {
            throw new Error(str);
        },
        parse: function parse(input) {
            var self = this,
                stack = [0],
                vstack = [null],
                lstack = [],
                table = this.table,
                yytext = "",
                yylineno = 0,
                yyleng = 0,
                recovering = 0,
                TERROR = 2,
                EOF = 1;
            this.lexer.setInput(input);
            this.lexer.yy = this.yy;
            this.yy.lexer = this.lexer;
            this.yy.parser = this;
            if (typeof this.lexer.yylloc == "undefined") this.lexer.yylloc = {};
            var yyloc = this.lexer.yylloc;
            lstack.push(yyloc);
            var ranges = this.lexer.options && this.lexer.options.ranges;
            if (typeof this.yy.parseError === "function") this.parseError = this.yy.parseError;
            function popStack(n) {
                stack.length = stack.length - 2 * n;
                vstack.length = vstack.length - n;
                lstack.length = lstack.length - n;
            }
            function lex() {
                var token;
                token = self.lexer.lex() || 1;
                if (typeof token !== "number") {
                    token = self.symbols_[token] || token;
                }
                return token;
            }
            var symbol,
                preErrorSymbol,
                state,
                action,
                a,
                r,
                yyval = {},
                p,
                len,
                newState,
                expected;
            while (true) {
                state = stack[stack.length - 1];
                if (this.defaultActions[state]) {
                    action = this.defaultActions[state];
                } else {
                    if (symbol === null || typeof symbol == "undefined") {
                        symbol = lex();
                    }
                    action = table[state] && table[state][symbol];
                }
                if (typeof action === "undefined" || !action.length || !action[0]) {
                    var errStr = "";
                    if (!recovering) {
                        expected = [];
                        for (p in table[state]) if (this.terminals_[p] && p > 2) {
                            expected.push("'" + this.terminals_[p] + "'");
                        }
                        if (this.lexer.showPosition) {
                            errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                        } else {
                            errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1 ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
                        }
                        this.parseError(errStr, { text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected });
                    }
                }
                if (action[0] instanceof Array && action.length > 1) {
                    throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
                }
                switch (action[0]) {
                    case 1:
                        stack.push(symbol);
                        vstack.push(this.lexer.yytext);
                        lstack.push(this.lexer.yylloc);
                        stack.push(action[1]);
                        symbol = null;
                        if (!preErrorSymbol) {
                            yyleng = this.lexer.yyleng;
                            yytext = this.lexer.yytext;
                            yylineno = this.lexer.yylineno;
                            yyloc = this.lexer.yylloc;
                            if (recovering > 0) recovering--;
                        } else {
                            symbol = preErrorSymbol;
                            preErrorSymbol = null;
                        }
                        break;
                    case 2:
                        len = this.productions_[action[1]][1];
                        yyval.$ = vstack[vstack.length - len];
                        yyval._$ = { first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column };
                        if (ranges) {
                            yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
                        }
                        r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
                        if (typeof r !== "undefined") {
                            return r;
                        }
                        if (len) {
                            stack = stack.slice(0, -1 * len * 2);
                            vstack = vstack.slice(0, -1 * len);
                            lstack = lstack.slice(0, -1 * len);
                        }
                        stack.push(this.productions_[action[1]][0]);
                        vstack.push(yyval.$);
                        lstack.push(yyval._$);
                        newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                        stack.push(newState);
                        break;
                    case 3:
                        return true;
                }
            }
            return true;
        }
    };
    /* Jison generated lexer */
    var lexer = (function () {
        var lexer = { EOF: 1,
            parseError: function parseError(str, hash) {
                if (this.yy.parser) {
                    this.yy.parser.parseError(str, hash);
                } else {
                    throw new Error(str);
                }
            },
            setInput: function setInput(input) {
                this._input = input;
                this._more = this._less = this.done = false;
                this.yylineno = this.yyleng = 0;
                this.yytext = this.matched = this.match = '';
                this.conditionStack = ['INITIAL'];
                this.yylloc = { first_line: 1, first_column: 0, last_line: 1, last_column: 0 };
                if (this.options.ranges) this.yylloc.range = [0, 0];
                this.offset = 0;
                return this;
            },
            input: function input() {
                var ch = this._input[0];
                this.yytext += ch;
                this.yyleng++;
                this.offset++;
                this.match += ch;
                this.matched += ch;
                var lines = ch.match(/(?:\r\n?|\n).*/g);
                if (lines) {
                    this.yylineno++;
                    this.yylloc.last_line++;
                } else {
                    this.yylloc.last_column++;
                }
                if (this.options.ranges) this.yylloc.range[1]++;

                this._input = this._input.slice(1);
                return ch;
            },
            unput: function unput(ch) {
                var len = ch.length;
                var lines = ch.split(/(?:\r\n?|\n)/g);

                this._input = ch + this._input;
                this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
                //this.yyleng -= len;
                this.offset -= len;
                var oldLines = this.match.split(/(?:\r\n?|\n)/g);
                this.match = this.match.substr(0, this.match.length - 1);
                this.matched = this.matched.substr(0, this.matched.length - 1);

                if (lines.length - 1) this.yylineno -= lines.length - 1;
                var r = this.yylloc.range;

                this.yylloc = { first_line: this.yylloc.first_line,
                    last_line: this.yylineno + 1,
                    first_column: this.yylloc.first_column,
                    last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
                };

                if (this.options.ranges) {
                    this.yylloc.range = [r[0], r[0] + this.yyleng - len];
                }
                return this;
            },
            more: function more() {
                this._more = true;
                return this;
            },
            less: function less(n) {
                this.unput(this.match.slice(n));
            },
            pastInput: function pastInput() {
                var past = this.matched.substr(0, this.matched.length - this.match.length);
                return (past.length > 20 ? '...' : '') + past.substr(-20).replace(/\n/g, "");
            },
            upcomingInput: function upcomingInput() {
                var next = this.match;
                if (next.length < 20) {
                    next += this._input.substr(0, 20 - next.length);
                }
                return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
            },
            showPosition: function showPosition() {
                var pre = this.pastInput();
                var c = new Array(pre.length + 1).join("-");
                return pre + this.upcomingInput() + "\n" + c + "^";
            },
            next: function next() {
                if (this.done) {
                    return this.EOF;
                }
                if (!this._input) this.done = true;

                var token, match, tempMatch, index, col, lines;
                if (!this._more) {
                    this.yytext = '';
                    this.match = '';
                }
                var rules = this._currentRules();
                for (var i = 0; i < rules.length; i++) {
                    tempMatch = this._input.match(this.rules[rules[i]]);
                    if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                        match = tempMatch;
                        index = i;
                        if (!this.options.flex) break;
                    }
                }
                if (match) {
                    lines = match[0].match(/(?:\r\n?|\n).*/g);
                    if (lines) this.yylineno += lines.length;
                    this.yylloc = { first_line: this.yylloc.last_line,
                        last_line: this.yylineno + 1,
                        first_column: this.yylloc.last_column,
                        last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length };
                    this.yytext += match[0];
                    this.match += match[0];
                    this.matches = match;
                    this.yyleng = this.yytext.length;
                    if (this.options.ranges) {
                        this.yylloc.range = [this.offset, this.offset += this.yyleng];
                    }
                    this._more = false;
                    this._input = this._input.slice(match[0].length);
                    this.matched += match[0];
                    token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]);
                    if (this.done && this._input) this.done = false;
                    if (token) return token;else return;
                }
                if (this._input === "") {
                    return this.EOF;
                } else {
                    return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), { text: "", token: null, line: this.yylineno });
                }
            },
            lex: function lex() {
                var r = this.next();
                if (typeof r !== 'undefined') {
                    return r;
                } else {
                    return this.lex();
                }
            },
            begin: function begin(condition) {
                this.conditionStack.push(condition);
            },
            popState: function popState() {
                return this.conditionStack.pop();
            },
            _currentRules: function _currentRules() {
                return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
            },
            topState: function topState() {
                return this.conditionStack[this.conditionStack.length - 2];
            },
            pushState: function begin(condition) {
                this.begin(condition);
            } };
        lexer.options = {};
        lexer.performAction = function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {

            function strip(start, end) {
                return yy_.yytext = yy_.yytext.substring(start, yy_.yyleng - end + start);
            }

            var YYSTATE = YY_START;
            switch ($avoiding_name_collisions) {
                case 0:
                    if (yy_.yytext.slice(-2) === "\\\\") {
                        strip(0, 1);
                        this.begin("mu");
                    } else if (yy_.yytext.slice(-1) === "\\") {
                        strip(0, 1);
                        this.begin("emu");
                    } else {
                        this.begin("mu");
                    }
                    if (yy_.yytext) return 15;

                    break;
                case 1:
                    return 15;
                    break;
                case 2:
                    this.popState();
                    return 15;

                    break;
                case 3:
                    this.begin('raw');return 15;
                    break;
                case 4:
                    this.popState();
                    // Should be using `this.topState()` below, but it currently
                    // returns the second top instead of the first top. Opened an
                    // issue about it at https://github.com/zaach/jison/issues/291
                    if (this.conditionStack[this.conditionStack.length - 1] === 'raw') {
                        return 15;
                    } else {
                        strip(5, 9);
                        return 'END_RAW_BLOCK';
                    }

                    break;
                case 5:
                    return 15;
                    break;
                case 6:
                    this.popState();
                    return 14;

                    break;
                case 7:
                    return 65;
                    break;
                case 8:
                    return 68;
                    break;
                case 9:
                    return 19;
                    break;
                case 10:
                    this.popState();
                    this.begin('raw');
                    return 23;

                    break;
                case 11:
                    return 55;
                    break;
                case 12:
                    return 60;
                    break;
                case 13:
                    return 29;
                    break;
                case 14:
                    return 47;
                    break;
                case 15:
                    this.popState();return 44;
                    break;
                case 16:
                    this.popState();return 44;
                    break;
                case 17:
                    return 34;
                    break;
                case 18:
                    return 39;
                    break;
                case 19:
                    return 51;
                    break;
                case 20:
                    return 48;
                    break;
                case 21:
                    this.unput(yy_.yytext);
                    this.popState();
                    this.begin('com');

                    break;
                case 22:
                    this.popState();
                    return 14;

                    break;
                case 23:
                    return 48;
                    break;
                case 24:
                    return 73;
                    break;
                case 25:
                    return 72;
                    break;
                case 26:
                    return 72;
                    break;
                case 27:
                    return 87;
                    break;
                case 28:
                    // ignore whitespace
                    break;
                case 29:
                    this.popState();return 54;
                    break;
                case 30:
                    this.popState();return 33;
                    break;
                case 31:
                    yy_.yytext = strip(1, 2).replace(/\\"/g, '"');return 80;
                    break;
                case 32:
                    yy_.yytext = strip(1, 2).replace(/\\'/g, "'");return 80;
                    break;
                case 33:
                    return 85;
                    break;
                case 34:
                    return 82;
                    break;
                case 35:
                    return 82;
                    break;
                case 36:
                    return 83;
                    break;
                case 37:
                    return 84;
                    break;
                case 38:
                    return 81;
                    break;
                case 39:
                    return 75;
                    break;
                case 40:
                    return 77;
                    break;
                case 41:
                    return 72;
                    break;
                case 42:
                    yy_.yytext = yy_.yytext.replace(/\\([\\\]])/g, '$1');return 72;
                    break;
                case 43:
                    return 'INVALID';
                    break;
                case 44:
                    return 5;
                    break;
            }
        };
        lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:\{\{\{\{(?=[^\/]))/, /^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/, /^(?:[^\x00]+?(?=(\{\{\{\{)))/, /^(?:[\s\S]*?--(~)?\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{\{\{)/, /^(?:\}\}\}\})/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#>)/, /^(?:\{\{(~)?#\*?)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^\s*(~)?\}\})/, /^(?:\{\{(~)?\s*else\s*(~)?\}\})/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{(~)?!--)/, /^(?:\{\{(~)?![\s\S]*?\}\})/, /^(?:\{\{(~)?\*?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)|])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:undefined(?=([~}\s)])))/, /^(?:null(?=([~}\s)])))/, /^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/, /^(?:as\s+\|)/, /^(?:\|)/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/, /^(?:\[(\\\]|[^\]])*\])/, /^(?:.)/, /^(?:$)/];
        lexer.conditions = { "mu": { "rules": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44], "inclusive": false }, "emu": { "rules": [2], "inclusive": false }, "com": { "rules": [6], "inclusive": false }, "raw": { "rules": [3, 4, 5], "inclusive": false }, "INITIAL": { "rules": [0, 1, 44], "inclusive": true } };
        return lexer;
    })();
    parser.lexer = lexer;
    function Parser() {
        this.yy = {};
    }Parser.prototype = parser;parser.Parser = Parser;
    return new Parser();
})();exports["default"] = handlebars;
module.exports = exports["default"];


},{}],222:[function(require,module,exports){
/* eslint-disable new-cap */
'use strict';

exports.__esModule = true;
exports.print = print;
exports.PrintVisitor = PrintVisitor;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _visitor = require('./visitor');

var _visitor2 = _interopRequireDefault(_visitor);

function print(ast) {
  return new PrintVisitor().accept(ast);
}

function PrintVisitor() {
  this.padding = 0;
}

PrintVisitor.prototype = new _visitor2['default']();

PrintVisitor.prototype.pad = function (string) {
  var out = '';

  for (var i = 0, l = this.padding; i < l; i++) {
    out += '  ';
  }

  out += string + '\n';
  return out;
};

PrintVisitor.prototype.Program = function (program) {
  var out = '',
      body = program.body,
      i = undefined,
      l = undefined;

  if (program.blockParams) {
    var blockParams = 'BLOCK PARAMS: [';
    for (i = 0, l = program.blockParams.length; i < l; i++) {
      blockParams += ' ' + program.blockParams[i];
    }
    blockParams += ' ]';
    out += this.pad(blockParams);
  }

  for (i = 0, l = body.length; i < l; i++) {
    out += this.accept(body[i]);
  }

  this.padding--;

  return out;
};

PrintVisitor.prototype.MustacheStatement = function (mustache) {
  return this.pad('{{ ' + this.SubExpression(mustache) + ' }}');
};
PrintVisitor.prototype.Decorator = function (mustache) {
  return this.pad('{{ DIRECTIVE ' + this.SubExpression(mustache) + ' }}');
};

PrintVisitor.prototype.BlockStatement = PrintVisitor.prototype.DecoratorBlock = function (block) {
  var out = '';

  out += this.pad((block.type === 'DecoratorBlock' ? 'DIRECTIVE ' : '') + 'BLOCK:');
  this.padding++;
  out += this.pad(this.SubExpression(block));
  if (block.program) {
    out += this.pad('PROGRAM:');
    this.padding++;
    out += this.accept(block.program);
    this.padding--;
  }
  if (block.inverse) {
    if (block.program) {
      this.padding++;
    }
    out += this.pad('{{^}}');
    this.padding++;
    out += this.accept(block.inverse);
    this.padding--;
    if (block.program) {
      this.padding--;
    }
  }
  this.padding--;

  return out;
};

PrintVisitor.prototype.PartialStatement = function (partial) {
  var content = 'PARTIAL:' + partial.name.original;
  if (partial.params[0]) {
    content += ' ' + this.accept(partial.params[0]);
  }
  if (partial.hash) {
    content += ' ' + this.accept(partial.hash);
  }
  return this.pad('{{> ' + content + ' }}');
};
PrintVisitor.prototype.PartialBlockStatement = function (partial) {
  var content = 'PARTIAL BLOCK:' + partial.name.original;
  if (partial.params[0]) {
    content += ' ' + this.accept(partial.params[0]);
  }
  if (partial.hash) {
    content += ' ' + this.accept(partial.hash);
  }

  content += ' ' + this.pad('PROGRAM:');
  this.padding++;
  content += this.accept(partial.program);
  this.padding--;

  return this.pad('{{> ' + content + ' }}');
};

PrintVisitor.prototype.ContentStatement = function (content) {
  return this.pad("CONTENT[ '" + content.value + "' ]");
};

PrintVisitor.prototype.CommentStatement = function (comment) {
  return this.pad("{{! '" + comment.value + "' }}");
};

PrintVisitor.prototype.SubExpression = function (sexpr) {
  var params = sexpr.params,
      paramStrings = [],
      hash = undefined;

  for (var i = 0, l = params.length; i < l; i++) {
    paramStrings.push(this.accept(params[i]));
  }

  params = '[' + paramStrings.join(', ') + ']';

  hash = sexpr.hash ? ' ' + this.accept(sexpr.hash) : '';

  return this.accept(sexpr.path) + ' ' + params + hash;
};

PrintVisitor.prototype.PathExpression = function (id) {
  var path = id.parts.join('/');
  return (id.data ? '@' : '') + 'PATH:' + path;
};

PrintVisitor.prototype.StringLiteral = function (string) {
  return '"' + string.value + '"';
};

PrintVisitor.prototype.NumberLiteral = function (number) {
  return 'NUMBER{' + number.value + '}';
};

PrintVisitor.prototype.BooleanLiteral = function (bool) {
  return 'BOOLEAN{' + bool.value + '}';
};

PrintVisitor.prototype.UndefinedLiteral = function () {
  return 'UNDEFINED';
};

PrintVisitor.prototype.NullLiteral = function () {
  return 'NULL';
};

PrintVisitor.prototype.Hash = function (hash) {
  var pairs = hash.pairs,
      joinedPairs = [];

  for (var i = 0, l = pairs.length; i < l; i++) {
    joinedPairs.push(this.accept(pairs[i]));
  }

  return 'HASH{' + joinedPairs.join(', ') + '}';
};
PrintVisitor.prototype.HashPair = function (pair) {
  return pair.key + '=' + this.accept(pair.value);
};
/* eslint-enable new-cap */


},{"./visitor":223}],223:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

function Visitor() {
  this.parents = [];
}

Visitor.prototype = {
  constructor: Visitor,
  mutating: false,

  // Visits a given value. If mutating, will replace the value if necessary.
  acceptKey: function acceptKey(node, name) {
    var value = this.accept(node[name]);
    if (this.mutating) {
      // Hacky sanity check: This may have a few false positives for type for the helper
      // methods but will generally do the right thing without a lot of overhead.
      if (value && !Visitor.prototype[value.type]) {
        throw new _exception2['default']('Unexpected node type "' + value.type + '" found when accepting ' + name + ' on ' + node.type);
      }
      node[name] = value;
    }
  },

  // Performs an accept operation with added sanity check to ensure
  // required keys are not removed.
  acceptRequired: function acceptRequired(node, name) {
    this.acceptKey(node, name);

    if (!node[name]) {
      throw new _exception2['default'](node.type + ' requires ' + name);
    }
  },

  // Traverses a given array. If mutating, empty respnses will be removed
  // for child elements.
  acceptArray: function acceptArray(array) {
    for (var i = 0, l = array.length; i < l; i++) {
      this.acceptKey(array, i);

      if (!array[i]) {
        array.splice(i, 1);
        i--;
        l--;
      }
    }
  },

  accept: function accept(object) {
    if (!object) {
      return;
    }

    /* istanbul ignore next: Sanity code */
    if (!this[object.type]) {
      throw new _exception2['default']('Unknown type: ' + object.type, object);
    }

    if (this.current) {
      this.parents.unshift(this.current);
    }
    this.current = object;

    var ret = this[object.type](object);

    this.current = this.parents.shift();

    if (!this.mutating || ret) {
      return ret;
    } else if (ret !== false) {
      return object;
    }
  },

  Program: function Program(program) {
    this.acceptArray(program.body);
  },

  MustacheStatement: visitSubExpression,
  Decorator: visitSubExpression,

  BlockStatement: visitBlock,
  DecoratorBlock: visitBlock,

  PartialStatement: visitPartial,
  PartialBlockStatement: function PartialBlockStatement(partial) {
    visitPartial.call(this, partial);

    this.acceptKey(partial, 'program');
  },

  ContentStatement: function ContentStatement() /* content */{},
  CommentStatement: function CommentStatement() /* comment */{},

  SubExpression: visitSubExpression,

  PathExpression: function PathExpression() /* path */{},

  StringLiteral: function StringLiteral() /* string */{},
  NumberLiteral: function NumberLiteral() /* number */{},
  BooleanLiteral: function BooleanLiteral() /* bool */{},
  UndefinedLiteral: function UndefinedLiteral() /* literal */{},
  NullLiteral: function NullLiteral() /* literal */{},

  Hash: function Hash(hash) {
    this.acceptArray(hash.pairs);
  },
  HashPair: function HashPair(pair) {
    this.acceptRequired(pair, 'value');
  }
};

function visitSubExpression(mustache) {
  this.acceptRequired(mustache, 'path');
  this.acceptArray(mustache.params);
  this.acceptKey(mustache, 'hash');
}
function visitBlock(block) {
  visitSubExpression.call(this, block);

  this.acceptKey(block, 'program');
  this.acceptKey(block, 'inverse');
}
function visitPartial(partial) {
  this.acceptRequired(partial, 'name');
  this.acceptArray(partial.params);
  this.acceptKey(partial, 'hash');
}

exports['default'] = Visitor;
module.exports = exports['default'];


},{"../exception":227}],224:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _visitor = require('./visitor');

var _visitor2 = _interopRequireDefault(_visitor);

function WhitespaceControl() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  this.options = options;
}
WhitespaceControl.prototype = new _visitor2['default']();

WhitespaceControl.prototype.Program = function (program) {
  var doStandalone = !this.options.ignoreStandalone;

  var isRoot = !this.isRootSeen;
  this.isRootSeen = true;

  var body = program.body;
  for (var i = 0, l = body.length; i < l; i++) {
    var current = body[i],
        strip = this.accept(current);

    if (!strip) {
      continue;
    }

    var _isPrevWhitespace = isPrevWhitespace(body, i, isRoot),
        _isNextWhitespace = isNextWhitespace(body, i, isRoot),
        openStandalone = strip.openStandalone && _isPrevWhitespace,
        closeStandalone = strip.closeStandalone && _isNextWhitespace,
        inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;

    if (strip.close) {
      omitRight(body, i, true);
    }
    if (strip.open) {
      omitLeft(body, i, true);
    }

    if (doStandalone && inlineStandalone) {
      omitRight(body, i);

      if (omitLeft(body, i)) {
        // If we are on a standalone node, save the indent info for partials
        if (current.type === 'PartialStatement') {
          // Pull out the whitespace from the final line
          current.indent = /([ \t]+$)/.exec(body[i - 1].original)[1];
        }
      }
    }
    if (doStandalone && openStandalone) {
      omitRight((current.program || current.inverse).body);

      // Strip out the previous content node if it's whitespace only
      omitLeft(body, i);
    }
    if (doStandalone && closeStandalone) {
      // Always strip the next node
      omitRight(body, i);

      omitLeft((current.inverse || current.program).body);
    }
  }

  return program;
};

WhitespaceControl.prototype.BlockStatement = WhitespaceControl.prototype.DecoratorBlock = WhitespaceControl.prototype.PartialBlockStatement = function (block) {
  this.accept(block.program);
  this.accept(block.inverse);

  // Find the inverse program that is involed with whitespace stripping.
  var program = block.program || block.inverse,
      inverse = block.program && block.inverse,
      firstInverse = inverse,
      lastInverse = inverse;

  if (inverse && inverse.chained) {
    firstInverse = inverse.body[0].program;

    // Walk the inverse chain to find the last inverse that is actually in the chain.
    while (lastInverse.chained) {
      lastInverse = lastInverse.body[lastInverse.body.length - 1].program;
    }
  }

  var strip = {
    open: block.openStrip.open,
    close: block.closeStrip.close,

    // Determine the standalone candiacy. Basically flag our content as being possibly standalone
    // so our parent can determine if we actually are standalone
    openStandalone: isNextWhitespace(program.body),
    closeStandalone: isPrevWhitespace((firstInverse || program).body)
  };

  if (block.openStrip.close) {
    omitRight(program.body, null, true);
  }

  if (inverse) {
    var inverseStrip = block.inverseStrip;

    if (inverseStrip.open) {
      omitLeft(program.body, null, true);
    }

    if (inverseStrip.close) {
      omitRight(firstInverse.body, null, true);
    }
    if (block.closeStrip.open) {
      omitLeft(lastInverse.body, null, true);
    }

    // Find standalone else statments
    if (!this.options.ignoreStandalone && isPrevWhitespace(program.body) && isNextWhitespace(firstInverse.body)) {
      omitLeft(program.body);
      omitRight(firstInverse.body);
    }
  } else if (block.closeStrip.open) {
    omitLeft(program.body, null, true);
  }

  return strip;
};

WhitespaceControl.prototype.Decorator = WhitespaceControl.prototype.MustacheStatement = function (mustache) {
  return mustache.strip;
};

WhitespaceControl.prototype.PartialStatement = WhitespaceControl.prototype.CommentStatement = function (node) {
  /* istanbul ignore next */
  var strip = node.strip || {};
  return {
    inlineStandalone: true,
    open: strip.open,
    close: strip.close
  };
};

function isPrevWhitespace(body, i, isRoot) {
  if (i === undefined) {
    i = body.length;
  }

  // Nodes that end with newlines are considered whitespace (but are special
  // cased for strip operations)
  var prev = body[i - 1],
      sibling = body[i - 2];
  if (!prev) {
    return isRoot;
  }

  if (prev.type === 'ContentStatement') {
    return (sibling || !isRoot ? /\r?\n\s*?$/ : /(^|\r?\n)\s*?$/).test(prev.original);
  }
}
function isNextWhitespace(body, i, isRoot) {
  if (i === undefined) {
    i = -1;
  }

  var next = body[i + 1],
      sibling = body[i + 2];
  if (!next) {
    return isRoot;
  }

  if (next.type === 'ContentStatement') {
    return (sibling || !isRoot ? /^\s*?\r?\n/ : /^\s*?(\r?\n|$)/).test(next.original);
  }
}

// Marks the node to the right of the position as omitted.
// I.e. {{foo}}' ' will mark the ' ' node as omitted.
//
// If i is undefined, then the first child will be marked as such.
//
// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
// content is met.
function omitRight(body, i, multiple) {
  var current = body[i == null ? 0 : i + 1];
  if (!current || current.type !== 'ContentStatement' || !multiple && current.rightStripped) {
    return;
  }

  var original = current.value;
  current.value = current.value.replace(multiple ? /^\s+/ : /^[ \t]*\r?\n?/, '');
  current.rightStripped = current.value !== original;
}

// Marks the node to the left of the position as omitted.
// I.e. ' '{{foo}} will mark the ' ' node as omitted.
//
// If i is undefined then the last child will be marked as such.
//
// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
// content is met.
function omitLeft(body, i, multiple) {
  var current = body[i == null ? body.length - 1 : i - 1];
  if (!current || current.type !== 'ContentStatement' || !multiple && current.leftStripped) {
    return;
  }

  // We omit the last node if it's whitespace only and not preceded by a non-content node.
  var original = current.value;
  current.value = current.value.replace(multiple ? /\s+$/ : /[ \t]+$/, '');
  current.leftStripped = current.value !== original;
  return current.leftStripped;
}

exports['default'] = WhitespaceControl;
module.exports = exports['default'];


},{"./visitor":223}],225:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.registerDefaultDecorators = registerDefaultDecorators;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _decoratorsInline = require('./decorators/inline');

var _decoratorsInline2 = _interopRequireDefault(_decoratorsInline);

function registerDefaultDecorators(instance) {
  _decoratorsInline2['default'](instance);
}


},{"./decorators/inline":226}],226:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerDecorator('inline', function (fn, props, container, options) {
    var ret = fn;
    if (!props.partials) {
      props.partials = {};
      ret = function (context, options) {
        // Create a new partials stack frame prior to exec.
        var original = container.partials;
        container.partials = _utils.extend({}, original, props.partials);
        var ret = fn(context, options);
        container.partials = original;
        return ret;
      };
    }

    props.partials[options.args[0]] = options.fn;

    return ret;
  });
};

module.exports = exports['default'];


},{"../utils":243}],227:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var errorProps = ['description', 'fileName', 'lineNumber', 'endLineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var loc = node && node.loc,
      line = undefined,
      endLineNumber = undefined,
      column = undefined,
      endColumn = undefined;

  if (loc) {
    line = loc.start.line;
    endLineNumber = loc.end.line;
    column = loc.start.column;
    endColumn = loc.end.column;

    message += ' - ' + line + ':' + column;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  /* istanbul ignore else */
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }

  try {
    if (loc) {
      this.lineNumber = line;
      this.endLineNumber = endLineNumber;

      // Work around issue under safari where we can't directly set the column value
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(this, 'column', {
          value: column,
          enumerable: true
        });
        Object.defineProperty(this, 'endColumn', {
          value: endColumn,
          enumerable: true
        });
      } else {
        this.column = column;
        this.endColumn = endColumn;
      }
    }
  } catch (nop) {
    /* Ignore if the browser is very particular */
  }
}

Exception.prototype = new Error();

exports['default'] = Exception;
module.exports = exports['default'];


},{}],228:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.registerDefaultHelpers = registerDefaultHelpers;
exports.moveHelperToHooks = moveHelperToHooks;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersBlockHelperMissing = require('./helpers/block-helper-missing');

var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);

var _helpersEach = require('./helpers/each');

var _helpersEach2 = _interopRequireDefault(_helpersEach);

var _helpersHelperMissing = require('./helpers/helper-missing');

var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);

var _helpersIf = require('./helpers/if');

var _helpersIf2 = _interopRequireDefault(_helpersIf);

var _helpersLog = require('./helpers/log');

var _helpersLog2 = _interopRequireDefault(_helpersLog);

var _helpersLookup = require('./helpers/lookup');

var _helpersLookup2 = _interopRequireDefault(_helpersLookup);

var _helpersWith = require('./helpers/with');

var _helpersWith2 = _interopRequireDefault(_helpersWith);

function registerDefaultHelpers(instance) {
  _helpersBlockHelperMissing2['default'](instance);
  _helpersEach2['default'](instance);
  _helpersHelperMissing2['default'](instance);
  _helpersIf2['default'](instance);
  _helpersLog2['default'](instance);
  _helpersLookup2['default'](instance);
  _helpersWith2['default'](instance);
}

function moveHelperToHooks(instance, helperName, keepHelper) {
  if (instance.helpers[helperName]) {
    instance.hooks[helperName] = instance.helpers[helperName];
    if (!keepHelper) {
      delete instance.helpers[helperName];
    }
  }
}


},{"./helpers/block-helper-missing":229,"./helpers/each":230,"./helpers/helper-missing":231,"./helpers/if":232,"./helpers/log":233,"./helpers/lookup":234,"./helpers/with":235}],229:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (_utils.isArray(context)) {
      if (context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
        options = { data: data };
      }

      return fn(context, options);
    }
  });
};

module.exports = exports['default'];


},{"../utils":243}],230:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('../utils');

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = _utils.createFrame(options.data);
    }

    function execIteration(field, index, last) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret = ret + fn(context[field], {
        data: data,
        blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (_utils.isArray(context)) {
        for (var j = context.length; i < j; i++) {
          if (i in context) {
            execIteration(i, i, i === context.length - 1);
          }
        }
      } else if (global.Symbol && context[global.Symbol.iterator]) {
        var newContext = [];
        var iterator = context[global.Symbol.iterator]();
        for (var it = iterator.next(); !it.done; it = iterator.next()) {
          newContext.push(it.value);
        }
        context = newContext;
        for (var j = context.length; i < j; i++) {
          execIteration(i, i, i === context.length - 1);
        }
      } else {
        (function () {
          var priorKey = undefined;

          Object.keys(context).forEach(function (key) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey !== undefined) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          });
          if (priorKey !== undefined) {
            execIteration(priorKey, i - 1, true);
          }
        })();
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });
};

module.exports = exports['default'];


},{"../exception":227,"../utils":243}],231:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('helperMissing', function () /* [args, ]options */{
    if (arguments.length === 1) {
      // A missing field in a {{foo}} construct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });
};

module.exports = exports['default'];


},{"../exception":227}],232:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('../utils');

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('if', function (conditional, options) {
    if (arguments.length != 2) {
      throw new _exception2['default']('#if requires exactly one argument');
    }
    if (_utils.isFunction(conditional)) {
      conditional = conditional.call(this);
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function (conditional, options) {
    if (arguments.length != 2) {
      throw new _exception2['default']('#unless requires exactly one argument');
    }
    return instance.helpers['if'].call(this, conditional, {
      fn: options.inverse,
      inverse: options.fn,
      hash: options.hash
    });
  });
};

module.exports = exports['default'];


},{"../exception":227,"../utils":243}],233:[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('log', function () /* message, options */{
    var args = [undefined],
        options = arguments[arguments.length - 1];
    for (var i = 0; i < arguments.length - 1; i++) {
      args.push(arguments[i]);
    }

    var level = 1;
    if (options.hash.level != null) {
      level = options.hash.level;
    } else if (options.data && options.data.level != null) {
      level = options.data.level;
    }
    args[0] = level;

    instance.log.apply(instance, args);
  });
};

module.exports = exports['default'];


},{}],234:[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('lookup', function (obj, field, options) {
    if (!obj) {
      // Note for 5.0: Change to "obj == null" in 5.0
      return obj;
    }
    return options.lookupProperty(obj, field);
  });
};

module.exports = exports['default'];


},{}],235:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('../utils');

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('with', function (context, options) {
    if (arguments.length != 2) {
      throw new _exception2['default']('#with requires exactly one argument');
    }
    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    var fn = options.fn;

    if (!_utils.isEmpty(context)) {
      var data = options.data;
      if (options.data && options.ids) {
        data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
      }

      return fn(context, {
        data: data,
        blockParams: _utils.blockParams([context], [data && data.contextPath])
      });
    } else {
      return options.inverse(this);
    }
  });
};

module.exports = exports['default'];


},{"../exception":227,"../utils":243}],236:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.createNewLookupObject = createNewLookupObject;

var _utils = require('../utils');

/**
 * Create a new object with "null"-prototype to avoid truthy results on prototype properties.
 * The resulting object can be used with "object[property]" to check if a property exists
 * @param {...object} sources a varargs parameter of source objects that will be merged
 * @returns {object}
 */

function createNewLookupObject() {
  for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
    sources[_key] = arguments[_key];
  }

  return _utils.extend.apply(undefined, [Object.create(null)].concat(sources));
}


},{"../utils":243}],237:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.createProtoAccessControl = createProtoAccessControl;
exports.resultIsAllowed = resultIsAllowed;
exports.resetLoggedProperties = resetLoggedProperties;
// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _createNewLookupObject = require('./create-new-lookup-object');

var _logger = require('../logger');

var logger = _interopRequireWildcard(_logger);

var loggedProperties = Object.create(null);

function createProtoAccessControl(runtimeOptions) {
  var defaultMethodWhiteList = Object.create(null);
  defaultMethodWhiteList['constructor'] = false;
  defaultMethodWhiteList['__defineGetter__'] = false;
  defaultMethodWhiteList['__defineSetter__'] = false;
  defaultMethodWhiteList['__lookupGetter__'] = false;

  var defaultPropertyWhiteList = Object.create(null);
  // eslint-disable-next-line no-proto
  defaultPropertyWhiteList['__proto__'] = false;

  return {
    properties: {
      whitelist: _createNewLookupObject.createNewLookupObject(defaultPropertyWhiteList, runtimeOptions.allowedProtoProperties),
      defaultValue: runtimeOptions.allowProtoPropertiesByDefault
    },
    methods: {
      whitelist: _createNewLookupObject.createNewLookupObject(defaultMethodWhiteList, runtimeOptions.allowedProtoMethods),
      defaultValue: runtimeOptions.allowProtoMethodsByDefault
    }
  };
}

function resultIsAllowed(result, protoAccessControl, propertyName) {
  if (typeof result === 'function') {
    return checkWhiteList(protoAccessControl.methods, propertyName);
  } else {
    return checkWhiteList(protoAccessControl.properties, propertyName);
  }
}

function checkWhiteList(protoAccessControlForType, propertyName) {
  if (protoAccessControlForType.whitelist[propertyName] !== undefined) {
    return protoAccessControlForType.whitelist[propertyName] === true;
  }
  if (protoAccessControlForType.defaultValue !== undefined) {
    return protoAccessControlForType.defaultValue;
  }
  logUnexpecedPropertyAccessOnce(propertyName);
  return false;
}

function logUnexpecedPropertyAccessOnce(propertyName) {
  if (loggedProperties[propertyName] !== true) {
    loggedProperties[propertyName] = true;
    logger.log('error', 'Handlebars: Access has been denied to resolve the property "' + propertyName + '" because it is not an "own property" of its parent.\n' + 'You can add a runtime option to disable the check or this warning:\n' + 'See https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details');
  }
}

function resetLoggedProperties() {
  Object.keys(loggedProperties).forEach(function (propertyName) {
    delete loggedProperties[propertyName];
  });
}


},{"../logger":239,"./create-new-lookup-object":236}],238:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.wrapHelper = wrapHelper;

function wrapHelper(helper, transformOptionsFn) {
  if (typeof helper !== 'function') {
    // This should not happen, but apparently it does in https://github.com/wycats/handlebars.js/issues/1639
    // We try to make the wrapper least-invasive by not wrapping it, if the helper is not a function.
    return helper;
  }
  var wrapper = function wrapper() /* dynamic arguments */{
    var options = arguments[arguments.length - 1];
    arguments[arguments.length - 1] = transformOptionsFn(options);
    return helper.apply(this, arguments);
  };
  return wrapper;
}


},{}],239:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('./utils');

var logger = {
  methodMap: ['debug', 'info', 'warn', 'error'],
  level: 'info',

  // Maps a given level value to the `methodMap` indexes above.
  lookupLevel: function lookupLevel(level) {
    if (typeof level === 'string') {
      var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
      if (levelMap >= 0) {
        level = levelMap;
      } else {
        level = parseInt(level, 10);
      }
    }

    return level;
  },

  // Can be overridden in the host environment
  log: function log(level) {
    level = logger.lookupLevel(level);

    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
      var method = logger.methodMap[level];
      // eslint-disable-next-line no-console
      if (!console[method]) {
        method = 'log';
      }

      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        message[_key - 1] = arguments[_key];
      }

      console[method].apply(console, message); // eslint-disable-line no-console
    }
  }
};

exports['default'] = logger;
module.exports = exports['default'];


},{"./utils":243}],240:[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  var root = typeof global !== 'undefined' ? global : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
    return Handlebars;
  };
};

module.exports = exports['default'];


},{}],241:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.checkRevision = checkRevision;
exports.template = template;
exports.wrapProgram = wrapProgram;
exports.resolvePartial = resolvePartial;
exports.invokePartial = invokePartial;
exports.noop = noop;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _utils = require('./utils');

var Utils = _interopRequireWildcard(_utils);

var _exception = require('./exception');

var _exception2 = _interopRequireDefault(_exception);

var _base = require('./base');

var _helpers = require('./helpers');

var _internalWrapHelper = require('./internal/wrapHelper');

var _internalProtoAccess = require('./internal/proto-access');

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = _base.COMPILER_REVISION;

  if (compilerRevision >= _base.LAST_COMPATIBLE_COMPILER_REVISION && compilerRevision <= _base.COMPILER_REVISION) {
    return;
  }

  if (compilerRevision < _base.LAST_COMPATIBLE_COMPILER_REVISION) {
    var runtimeVersions = _base.REVISION_CHANGES[currentRevision],
        compilerVersions = _base.REVISION_CHANGES[compilerRevision];
    throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
  } else {
    // Use the embedded version info since the runtime doesn't know about this revision yet
    throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  templateSpec.main.decorator = templateSpec.main_d;

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as pseudo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  // backwards compatibility for precompiled templates with compiler-version 7 (<4.3.0)
  var templateWasPrecompiledWithCompilerV7 = templateSpec.compiler && templateSpec.compiler[0] === 7;

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
      if (options.ids) {
        options.ids[0] = true;
      }
    }
    partial = env.VM.resolvePartial.call(this, partial, context, options);

    var extendedOptions = Utils.extend({}, options, {
      hooks: this.hooks,
      protoAccessControl: this.protoAccessControl
    });

    var result = env.VM.invokePartial.call(this, partial, context, extendedOptions);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, extendedOptions);
    }
    if (result != null) {
      if (options.indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = options.indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name, loc) {
      if (!obj || !(name in obj)) {
        throw new _exception2['default']('"' + name + '" not defined in ' + obj, {
          loc: loc
        });
      }
      return obj[name];
    },
    lookupProperty: function lookupProperty(parent, propertyName) {
      var result = parent[propertyName];
      if (result == null) {
        return result;
      }
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return result;
      }

      if (_internalProtoAccess.resultIsAllowed(result, container.protoAccessControl, propertyName)) {
        return result;
      }
      return undefined;
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        var result = depths[i] && container.lookupProperty(depths[i], name);
        if (result != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function lambda(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function fn(i) {
      var ret = templateSpec[i];
      ret.decorator = templateSpec[i + '_d'];
      return ret;
    },

    programs: [],
    program: function program(i, data, declaredBlockParams, blockParams, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths || blockParams || declaredBlockParams) {
        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
      }
      return programWrapper;
    },

    data: function data(value, depth) {
      while (value && depth--) {
        value = value._parent;
      }
      return value;
    },
    mergeIfNeeded: function mergeIfNeeded(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },
    // An empty object to use as replacement for null-contexts
    nullContext: Object.seal({}),

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      if (options.depths) {
        depths = context != options.depths[0] ? [context].concat(options.depths) : options.depths;
      } else {
        depths = [context];
      }
    }

    function main(context /*, options*/) {
      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
    }

    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
    return main(context, options);
  }

  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      var mergedHelpers = Utils.extend({}, env.helpers, options.helpers);
      wrapHelpersToPassLookupProperty(mergedHelpers, container);
      container.helpers = mergedHelpers;

      if (templateSpec.usePartial) {
        // Use mergeIfNeeded here to prevent compiling global partials multiple times
        container.partials = container.mergeIfNeeded(options.partials, env.partials);
      }
      if (templateSpec.usePartial || templateSpec.useDecorators) {
        container.decorators = Utils.extend({}, env.decorators, options.decorators);
      }

      container.hooks = {};
      container.protoAccessControl = _internalProtoAccess.createProtoAccessControl(options);

      var keepHelperInHelpers = options.allowCallsToHelperMissing || templateWasPrecompiledWithCompilerV7;
      _helpers.moveHelperToHooks(container, 'helperMissing', keepHelperInHelpers);
      _helpers.moveHelperToHooks(container, 'blockHelperMissing', keepHelperInHelpers);
    } else {
      container.protoAccessControl = options.protoAccessControl; // internal option
      container.helpers = options.helpers;
      container.partials = options.partials;
      container.decorators = options.decorators;
      container.hooks = options.hooks;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var currentDepths = depths;
    if (depths && context != depths[0] && !(context === container.nullContext && depths[0] === null)) {
      currentDepths = [context].concat(depths);
    }

    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
  }

  prog = executeDecorators(fn, prog, container, depths, data, blockParams);

  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

/**
 * This is currently part of the official API, therefore implementation details should not be changed.
 */

function resolvePartial(partial, context, options) {
  if (!partial) {
    if (options.name === '@partial-block') {
      partial = options.data['partial-block'];
    } else {
      partial = options.partials[options.name];
    }
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  // Use the current closure context to save the partial-block if this partial
  var currentPartialBlock = options.data && options.data['partial-block'];
  options.partial = true;
  if (options.ids) {
    options.data.contextPath = options.ids[0] || options.data.contextPath;
  }

  var partialBlock = undefined;
  if (options.fn && options.fn !== noop) {
    (function () {
      options.data = _base.createFrame(options.data);
      // Wrapper function to get access to currentPartialBlock from the closure
      var fn = options.fn;
      partialBlock = options.data['partial-block'] = function partialBlockWrapper(context) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        // Restore the partial-block from the closure for the execution of the block
        // i.e. the part inside the block of the partial call.
        options.data = _base.createFrame(options.data);
        options.data['partial-block'] = currentPartialBlock;
        return fn(context, options);
      };
      if (fn.partials) {
        options.partials = Utils.extend({}, options.partials, fn.partials);
      }
    })();
  }

  if (partial === undefined && partialBlock) {
    partial = partialBlock;
  }

  if (partial === undefined) {
    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? _base.createFrame(data) : {};
    data.root = context;
  }
  return data;
}

function executeDecorators(fn, prog, container, depths, data, blockParams) {
  if (fn.decorator) {
    var props = {};
    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
    Utils.extend(prog, props);
  }
  return prog;
}

function wrapHelpersToPassLookupProperty(mergedHelpers, container) {
  Object.keys(mergedHelpers).forEach(function (helperName) {
    var helper = mergedHelpers[helperName];
    mergedHelpers[helperName] = passLookupPropertyOption(helper, container);
  });
}

function passLookupPropertyOption(helper, container) {
  var lookupProperty = container.lookupProperty;
  return _internalWrapHelper.wrapHelper(helper, function (options) {
    return Utils.extend({ lookupProperty: lookupProperty }, options);
  });
}


},{"./base":214,"./exception":227,"./helpers":228,"./internal/proto-access":237,"./internal/wrapHelper":238,"./utils":243}],242:[function(require,module,exports){
// Build out our basic SafeString type
'use strict';

exports.__esModule = true;
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports['default'] = SafeString;
module.exports = exports['default'];


},{}],243:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.extend = extend;
exports.indexOf = indexOf;
exports.escapeExpression = escapeExpression;
exports.isEmpty = isEmpty;
exports.createFrame = createFrame;
exports.blockParams = blockParams;
exports.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

var badChars = /[&<>"'`=]/g,
    possible = /[&<>"'`=]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

var toString = Object.prototype.toString;

exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/* eslint-disable func-style */
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  exports.isFunction = isFunction = function (value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
exports.isFunction = isFunction;

/* eslint-enable func-style */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};

exports.isArray = isArray;
// Older IE versions do not directly support indexOf so we must implement our own, sadly.

function indexOf(array, value) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function createFrame(object) {
  var frame = extend({}, object);
  frame._parent = object;
  return frame;
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}


},{}],244:[function(require,module,exports){
// USAGE:
// var handlebars = require('handlebars');
/* eslint-disable no-var */

// var local = handlebars.create();

var handlebars = require('../dist/cjs/handlebars')['default'];

var printer = require('../dist/cjs/handlebars/compiler/printer');
handlebars.PrintVisitor = printer.PrintVisitor;
handlebars.print = printer.print;

module.exports = handlebars;

// Publish a Node.js require() handler for .handlebars and .hbs files
function extension(module, filename) {
  var fs = require('fs');
  var templateString = fs.readFileSync(filename, 'utf8');
  module.exports = handlebars.compile(templateString);
}
/* istanbul ignore else */
if (typeof require !== 'undefined' && require.extensions) {
  require.extensions['.handlebars'] = extension;
  require.extensions['.hbs'] = extension;
}

},{"../dist/cjs/handlebars":212,"../dist/cjs/handlebars/compiler/printer":222,"fs":211}],245:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = require('./util');
var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util.toSetString(aStr);
    if (has.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

exports.ArraySet = ArraySet;

},{"./util":254}],246:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var base64 = require('./base64');

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
exports.encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

},{"./base64":247}],247:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
exports.encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
exports.decode = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

},{}],248:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};

},{}],249:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = require('./util');

/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  var lineA = mappingA.generatedLine;
  var lineB = mappingB.generatedLine;
  var columnA = mappingA.generatedColumn;
  var columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA ||
         util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function MappingList() {
  this._array = [];
  this._sorted = true;
  // Serves as infimum
  this._last = {generatedLine: -1, generatedColumn: 0};
}

/**
 * Iterate through internal items. This method takes the same arguments that
 * `Array.prototype.forEach` takes.
 *
 * NOTE: The order of the mappings is NOT guaranteed.
 */
MappingList.prototype.unsortedForEach =
  function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
MappingList.prototype.add = function MappingList_add(aMapping) {
  if (generatedPositionAfter(this._last, aMapping)) {
    this._last = aMapping;
    this._array.push(aMapping);
  } else {
    this._sorted = false;
    this._array.push(aMapping);
  }
};

/**
 * Returns the flat, sorted array of mappings. The mappings are sorted by
 * generated position.
 *
 * WARNING: This method returns internal data without copying, for
 * performance. The return value must NOT be mutated, and should be treated as
 * an immutable borrow. If you want to take ownership, you must make your own
 * copy.
 */
MappingList.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(util.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

exports.MappingList = MappingList;

},{"./util":254}],250:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
exports.quickSort = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

},{}],251:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = require('./util');
var binarySearch = require('./binary-search');
var ArraySet = require('./array-set').ArraySet;
var base64VLQ = require('./base64-vlq');
var quickSort = require('./quick-sort').quickSort;

function SourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
    : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
}

SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
}

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number is 1-based.
 *   - column: Optional. the column number in the original source.
 *    The column number is 0-based.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *    line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *    The column number is 0-based.
 */
SourceMapConsumer.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util.getArg(aArgs, 'column', 0)
    };

    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

exports.SourceMapConsumer = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The first parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  var version = util.getArg(sourceMap, 'version');
  var sources = util.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util.getArg(sourceMap, 'names', []);
  var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util.getArg(sourceMap, 'mappings');
  var file = util.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  if (sourceRoot) {
    sourceRoot = util.normalize(sourceRoot);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
        ? util.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet.fromArray(names.map(String), true);
  this._sources = ArraySet.fromArray(sources, true);

  this._absoluteSources = this._sources.toArray().map(function (s) {
    return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
  });

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this._sourceMapURL = aSourceMapURL;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

/**
 * Utility function to find the index of a source.  Returns -1 if not
 * found.
 */
BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
  var relativeSource = aSource;
  if (this.sourceRoot != null) {
    relativeSource = util.relative(this.sourceRoot, relativeSource);
  }

  if (this._sources.has(relativeSource)) {
    return this._sources.indexOf(relativeSource);
  }

  // Maybe aSource is an absolute URL as returned by |sources|.  In
  // this case we can't simply undo the transform.
  var i;
  for (i = 0; i < this._absoluteSources.length; ++i) {
    if (this._absoluteSources[i] == aSource) {
      return i;
    }
  }

  return -1;
};

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @param String aSourceMapURL
 *        The URL at which the source map can be found (optional)
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;
    smc._sourceMapURL = aSourceMapURL;
    smc._absoluteSources = smc._sources.toArray().map(function (s) {
      return util.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
    });

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort(smc.__originalMappings, util.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._absoluteSources.slice();
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64VLQ.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util.compareByGeneratedPositionsDeflated,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }
        var name = util.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    var index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }

    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util.relative(this.sourceRoot, relativeSource);
    }

    var url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, 'source');
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }

    var needle = {
      source: source,
      originalLine: util.getArg(aArgs, 'line'),
      originalColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util.compareByOriginalPositions,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

exports.BasicSourceMapConsumer = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The first parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  var version = util.getArg(sourceMap, 'version');
  var sections = util.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet();
  this._names = new ArraySet();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util.getArg(s, 'offset');
    var offsetLine = util.getArg(offset, 'line');
    var offsetColumn = util.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer(util.getArg(s, 'map'), aSourceMapURL)
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based. 
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer._findSourceIndex(util.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        source = util.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = null;
        if (mapping.name) {
          name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
        }

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, util.compareByOriginalPositions);
  };

exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;

},{"./array-set":245,"./base64-vlq":246,"./binary-search":248,"./quick-sort":250,"./util":254}],252:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var base64VLQ = require('./base64-vlq');
var util = require('./util');
var ArraySet = require('./array-set').ArraySet;
var MappingList = require('./mapping-list').MappingList;

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function SourceMapGenerator(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = util.getArg(aArgs, 'file', null);
  this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
  this._sources = new ArraySet();
  this._names = new ArraySet();
  this._mappings = new MappingList();
  this._sourcesContents = null;
}

SourceMapGenerator.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
SourceMapGenerator.fromSourceMap =
  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator({
      file: aSourceMapConsumer.file,
      sourceRoot: sourceRoot
    });
    aSourceMapConsumer.eachMapping(function (mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };

      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util.relative(sourceRoot, newMapping.source);
        }

        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };

        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }

      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var sourceRelative = sourceFile;
      if (sourceRoot !== null) {
        sourceRelative = util.relative(sourceRoot, sourceFile);
      }

      if (!generator._sources.has(sourceRelative)) {
        generator._sources.add(sourceRelative);
      }

      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };

/**
 * Add a single mapping from original source line and column to the generated
 * source's line and column for this source map being created. The mapping
 * object should have the following properties:
 *
 *   - generated: An object with the generated line and column positions.
 *   - original: An object with the original line and column positions.
 *   - source: The original source file (relative to the sourceRoot).
 *   - name: An optional original token name for this mapping.
 */
SourceMapGenerator.prototype.addMapping =
  function SourceMapGenerator_addMapping(aArgs) {
    var generated = util.getArg(aArgs, 'generated');
    var original = util.getArg(aArgs, 'original', null);
    var source = util.getArg(aArgs, 'source', null);
    var name = util.getArg(aArgs, 'name', null);

    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }

    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }

    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }

    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source: source,
      name: name
    });
  };

/**
 * Set the source content for a source file.
 */
SourceMapGenerator.prototype.setSourceContent =
  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[util.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };

/**
 * Applies the mappings of a sub-source-map for a specific source file to the
 * source map being generated. Each mapping to the supplied source file is
 * rewritten using the supplied source map. Note: The resolution for the
 * resulting mappings is the minimium of this map and the supplied map.
 *
 * @param aSourceMapConsumer The source map to be applied.
 * @param aSourceFile Optional. The filename of the source file.
 *        If omitted, SourceMapConsumer's file property will be used.
 * @param aSourceMapPath Optional. The dirname of the path to the source map
 *        to be applied. If relative, it is relative to the SourceMapConsumer.
 *        This parameter is needed when the two source maps aren't in the same
 *        directory, and the source map to be applied contains relative source
 *        paths. If so, those relative source paths need to be rewritten
 *        relative to the SourceMapGenerator.
 */
SourceMapGenerator.prototype.applySourceMap =
  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    // If aSourceFile is omitted, we will use the file property of the SourceMap
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error(
          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
          'or the source map\'s "file" property. Both were omitted.'
        );
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    // Make "sourceFile" relative if an absolute Url is passed.
    if (sourceRoot != null) {
      sourceFile = util.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    var newSources = new ArraySet();
    var newNames = new ArraySet();

    // Find mappings for the "sourceFile"
    this._mappings.unsortedForEach(function (mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        // Check if it can be mapped by the source map, then update the mapping.
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          // Copy mapping
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util.join(aSourceMapPath, mapping.source)
          }
          if (sourceRoot != null) {
            mapping.source = util.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }

      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }

      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }

    }, this);
    this._sources = newSources;
    this._names = newNames;

    // Copy sourcesContents of applied map.
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile = util.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = util.relative(sourceRoot, sourceFile);
        }
        this.setSourceContent(sourceFile, content);
      }
    }, this);
  };

/**
 * A mapping can have one of the three levels of data:
 *
 *   1. Just the generated position.
 *   2. The Generated position, original position, and original source.
 *   3. Generated and original position, original source, as well as a name
 *      token.
 *
 * To maintain consistency, we validate that any new mapping being added falls
 * in to one of these categories.
 */
SourceMapGenerator.prototype._validateMapping =
  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                              aName) {
    // When aOriginal is truthy but has empty values for .line and .column,
    // it is most likely a programmer error. In this case we throw a very
    // specific error message to try to guide them the right way.
    // For example: https://github.com/Polymer/polymer-bundler/pull/519
    if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
        throw new Error(
            'original.line and original.column are not numbers -- you probably meant to omit ' +
            'the original mapping entirely and only map the generated position. If so, pass ' +
            'null for the original mapping instead of an object with empty or null values.'
        );
    }

    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
        && aGenerated.line > 0 && aGenerated.column >= 0
        && !aOriginal && !aSource && !aName) {
      // Case 1.
      return;
    }
    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
             && aGenerated.line > 0 && aGenerated.column >= 0
             && aOriginal.line > 0 && aOriginal.column >= 0
             && aSource) {
      // Cases 2 and 3.
      return;
    }
    else {
      throw new Error('Invalid mapping: ' + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  };

/**
 * Serialize the accumulated mappings in to the stream of base 64 VLQs
 * specified by the source map format.
 */
SourceMapGenerator.prototype._serializeMappings =
  function SourceMapGenerator_serializeMappings() {
    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = '';
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;

    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length; i < len; i++) {
      mapping = mappings[i];
      next = ''

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ';';
          previousGeneratedLine++;
        }
      }
      else {
        if (i > 0) {
          if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ',';
        }
      }

      next += base64VLQ.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += base64VLQ.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += base64VLQ.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  };

SourceMapGenerator.prototype._generateSourcesContent =
  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function (source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util.relative(aSourceRoot, source);
      }
      var key = util.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  };

/**
 * Externalize the source map.
 */
SourceMapGenerator.prototype.toJSON =
  function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }

    return map;
  };

/**
 * Render the source map being generated to a string.
 */
SourceMapGenerator.prototype.toString =
  function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };

exports.SourceMapGenerator = SourceMapGenerator;

},{"./array-set":245,"./base64-vlq":246,"./mapping-list":249,"./util":254}],253:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
var util = require('./util');

// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
var REGEX_NEWLINE = /(\r?\n)/;

// Newline character code for charCodeAt() comparisons
var NEWLINE_CODE = 10;

// Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
var isSourceNode = "$$$isSourceNode$$$";

/**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */
function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
  this.children = [];
  this.sourceContents = {};
  this.line = aLine == null ? null : aLine;
  this.column = aColumn == null ? null : aColumn;
  this.source = aSource == null ? null : aSource;
  this.name = aName == null ? null : aName;
  this[isSourceNode] = true;
  if (aChunks != null) this.add(aChunks);
}

/**
 * Creates a SourceNode from generated code and a SourceMapConsumer.
 *
 * @param aGeneratedCode The generated code
 * @param aSourceMapConsumer The SourceMap for the generated code
 * @param aRelativePath Optional. The path that relative sources in the
 *        SourceMapConsumer should be relative to.
 */
SourceNode.fromStringWithSourceMap =
  function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    // The SourceNode we want to fill with the generated code
    // and the SourceMap
    var node = new SourceNode();

    // All even indices of this array are one line of the generated code,
    // while all odd indices are the newlines between two adjacent lines
    // (since `REGEX_NEWLINE` captures its match).
    // Processed fragments are accessed by calling `shiftNextLine`.
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var remainingLinesIndex = 0;
    var shiftNextLine = function() {
      var lineContents = getNextLine();
      // The last line of a file might not have a newline.
      var newLine = getNextLine() || "";
      return lineContents + newLine;

      function getNextLine() {
        return remainingLinesIndex < remainingLines.length ?
            remainingLines[remainingLinesIndex++] : undefined;
      }
    };

    // We need to remember the position of "remainingLines"
    var lastGeneratedLine = 1, lastGeneratedColumn = 0;

    // The generate SourceNodes we need a code range.
    // To extract it current and last mapping is used.
    // Here we store the last mapping.
    var lastMapping = null;

    aSourceMapConsumer.eachMapping(function (mapping) {
      if (lastMapping !== null) {
        // We add the code from "lastMapping" to "mapping":
        // First check if there is a new line in between.
        if (lastGeneratedLine < mapping.generatedLine) {
          // Associate first line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
          // The remaining code is added without mapping
        } else {
          // There is no new line in between.
          // Associate the code between "lastGeneratedColumn" and
          // "mapping.generatedColumn" with "lastMapping"
          var nextLine = remainingLines[remainingLinesIndex] || '';
          var code = nextLine.substr(0, mapping.generatedColumn -
                                        lastGeneratedColumn);
          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn -
                                              lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          // No more remaining code, continue
          lastMapping = mapping;
          return;
        }
      }
      // We add the generated code until the first mapping
      // to the SourceNode without any mapping.
      // Each line is added as separate string.
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[remainingLinesIndex] || '';
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLinesIndex < remainingLines.length) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.splice(remainingLinesIndex).join(""));
    }

    // Copy sourcesContent into SourceNode
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });

    return node;

    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath
          ? util.join(aRelativePath, mapping.source)
          : mapping.source;
        node.add(new SourceNode(mapping.originalLine,
                                mapping.originalColumn,
                                source,
                                code,
                                mapping.name));
      }
    }
  };

/**
 * Add a chunk of generated JS to this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.add = function SourceNode_add(aChunk) {
  if (Array.isArray(aChunk)) {
    aChunk.forEach(function (chunk) {
      this.add(chunk);
    }, this);
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    if (aChunk) {
      this.children.push(aChunk);
    }
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Add a chunk of generated JS to the beginning of this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
  if (Array.isArray(aChunk)) {
    for (var i = aChunk.length-1; i >= 0; i--) {
      this.prepend(aChunk[i]);
    }
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    this.children.unshift(aChunk);
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Walk over the tree of JS snippets in this node and its children. The
 * walking function is called once for each snippet of JS and is passed that
 * snippet and the its original associated source's line/column location.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walk = function SourceNode_walk(aFn) {
  var chunk;
  for (var i = 0, len = this.children.length; i < len; i++) {
    chunk = this.children[i];
    if (chunk[isSourceNode]) {
      chunk.walk(aFn);
    }
    else {
      if (chunk !== '') {
        aFn(chunk, { source: this.source,
                     line: this.line,
                     column: this.column,
                     name: this.name });
      }
    }
  }
};

/**
 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
 * each of `this.children`.
 *
 * @param aSep The separator.
 */
SourceNode.prototype.join = function SourceNode_join(aSep) {
  var newChildren;
  var i;
  var len = this.children.length;
  if (len > 0) {
    newChildren = [];
    for (i = 0; i < len-1; i++) {
      newChildren.push(this.children[i]);
      newChildren.push(aSep);
    }
    newChildren.push(this.children[i]);
    this.children = newChildren;
  }
  return this;
};

/**
 * Call String.prototype.replace on the very right-most source snippet. Useful
 * for trimming whitespace from the end of a source node, etc.
 *
 * @param aPattern The pattern to replace.
 * @param aReplacement The thing to replace the pattern with.
 */
SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
  var lastChild = this.children[this.children.length - 1];
  if (lastChild[isSourceNode]) {
    lastChild.replaceRight(aPattern, aReplacement);
  }
  else if (typeof lastChild === 'string') {
    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
  }
  else {
    this.children.push(''.replace(aPattern, aReplacement));
  }
  return this;
};

/**
 * Set the source content for a source file. This will be added to the SourceMapGenerator
 * in the sourcesContent field.
 *
 * @param aSourceFile The filename of the source file
 * @param aSourceContent The content of the source file
 */
SourceNode.prototype.setSourceContent =
  function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
  };

/**
 * Walk over the tree of SourceNodes. The walking function is called for each
 * source file content and is passed the filename and source content.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walkSourceContents =
  function SourceNode_walkSourceContents(aFn) {
    for (var i = 0, len = this.children.length; i < len; i++) {
      if (this.children[i][isSourceNode]) {
        this.children[i].walkSourceContents(aFn);
      }
    }

    var sources = Object.keys(this.sourceContents);
    for (var i = 0, len = sources.length; i < len; i++) {
      aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }
  };

/**
 * Return the string representation of this source node. Walks over the tree
 * and concatenates all the various snippets together to one string.
 */
SourceNode.prototype.toString = function SourceNode_toString() {
  var str = "";
  this.walk(function (chunk) {
    str += chunk;
  });
  return str;
};

/**
 * Returns the string representation of this source node along with a source
 * map.
 */
SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
  var generated = {
    code: "",
    line: 1,
    column: 0
  };
  var map = new SourceMapGenerator(aArgs);
  var sourceMappingActive = false;
  var lastOriginalSource = null;
  var lastOriginalLine = null;
  var lastOriginalColumn = null;
  var lastOriginalName = null;
  this.walk(function (chunk, original) {
    generated.code += chunk;
    if (original.source !== null
        && original.line !== null
        && original.column !== null) {
      if(lastOriginalSource !== original.source
         || lastOriginalLine !== original.line
         || lastOriginalColumn !== original.column
         || lastOriginalName !== original.name) {
        map.addMapping({
          source: original.source,
          original: {
            line: original.line,
            column: original.column
          },
          generated: {
            line: generated.line,
            column: generated.column
          },
          name: original.name
        });
      }
      lastOriginalSource = original.source;
      lastOriginalLine = original.line;
      lastOriginalColumn = original.column;
      lastOriginalName = original.name;
      sourceMappingActive = true;
    } else if (sourceMappingActive) {
      map.addMapping({
        generated: {
          line: generated.line,
          column: generated.column
        }
      });
      lastOriginalSource = null;
      sourceMappingActive = false;
    }
    for (var idx = 0, length = chunk.length; idx < length; idx++) {
      if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
        generated.line++;
        generated.column = 0;
        // Mappings end at eol
        if (idx + 1 === length) {
          lastOriginalSource = null;
          sourceMappingActive = false;
        } else if (sourceMappingActive) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
      } else {
        generated.column++;
      }
    }
  });
  this.walkSourceContents(function (sourceFile, sourceContent) {
    map.setSourceContent(sourceFile, sourceContent);
  });

  return { code: generated.code, map: map };
};

exports.SourceNode = SourceNode;

},{"./source-map-generator":252,"./util":254}],254:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 === null) {
    return 1; // aStr2 !== null
  }

  if (aStr2 === null) {
    return -1; // aStr1 !== null
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 */
function parseSourceMapInput(str) {
  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
}
exports.parseSourceMapInput = parseSourceMapInput;

/**
 * Compute the URL of a source given the the source root, the source's
 * URL, and the source map's URL.
 */
function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
  sourceURL = sourceURL || '';

  if (sourceRoot) {
    // This follows what Chrome does.
    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
      sourceRoot += '/';
    }
    // The spec says:
    //   Line 4: An optional source root, useful for relocating source
    //   files on a server or removing repeated values in the
    //   “sources” entry.  This value is prepended to the individual
    //   entries in the “source” field.
    sourceURL = sourceRoot + sourceURL;
  }

  // Historically, SourceMapConsumer did not take the sourceMapURL as
  // a parameter.  This mode is still somewhat supported, which is why
  // this code block is conditional.  However, it's preferable to pass
  // the source map URL to SourceMapConsumer, so that this function
  // can implement the source URL resolution algorithm as outlined in
  // the spec.  This block is basically the equivalent of:
  //    new URL(sourceURL, sourceMapURL).toString()
  // ... except it avoids using URL, which wasn't available in the
  // older releases of node still supported by this library.
  //
  // The spec says:
  //   If the sources are not absolute URLs after prepending of the
  //   “sourceRoot”, the sources are resolved relative to the
  //   SourceMap (like resolving script src in a html document).
  if (sourceMapURL) {
    var parsed = urlParse(sourceMapURL);
    if (!parsed) {
      throw new Error("sourceMapURL could not be parsed");
    }
    if (parsed.path) {
      // Strip the last path component, but keep the "/".
      var index = parsed.path.lastIndexOf('/');
      if (index >= 0) {
        parsed.path = parsed.path.substring(0, index + 1);
      }
    }
    sourceURL = join(urlGenerate(parsed), sourceURL);
  }

  return normalize(sourceURL);
}
exports.computeSourceURL = computeSourceURL;

},{}],255:[function(require,module,exports){
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = require('./lib/source-map-generator').SourceMapGenerator;
exports.SourceMapConsumer = require('./lib/source-map-consumer').SourceMapConsumer;
exports.SourceNode = require('./lib/source-node').SourceNode;

},{"./lib/source-map-consumer":251,"./lib/source-map-generator":252,"./lib/source-node":253}],256:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":213}],257:[function(require,module,exports){
/*! tether 1.4.7 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Tether = factory();
  }
}(this, function() {

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var TetherBase = undefined;
if (typeof TetherBase === 'undefined') {
  TetherBase = { modules: [] };
}

var zeroElement = null;

// Same as native getBoundingClientRect, except it takes into account parent <frame> offsets
// if the element lies within a nested document (<frame> or <iframe>-like).
function getActualBoundingClientRect(node) {
  var boundingRect = node.getBoundingClientRect();

  // The original object returned by getBoundingClientRect is immutable, so we clone it
  // We can't use extend because the properties are not considered part of the object by hasOwnProperty in IE9
  var rect = {};
  for (var k in boundingRect) {
    rect[k] = boundingRect[k];
  }

  try {
    if (node.ownerDocument !== document) {
      var _frameElement = node.ownerDocument.defaultView.frameElement;
      if (_frameElement) {
        var frameRect = getActualBoundingClientRect(_frameElement);
        rect.top += frameRect.top;
        rect.bottom += frameRect.top;
        rect.left += frameRect.left;
        rect.right += frameRect.left;
      }
    }
  } catch (err) {
    // Ignore "Access is denied" in IE11/Edge
  }

  return rect;
}

function getScrollParents(el) {
  // In firefox if the el is inside an iframe with display: none; window.getComputedStyle() will return null;
  // https://bugzilla.mozilla.org/show_bug.cgi?id=548397
  var computedStyle = getComputedStyle(el) || {};
  var position = computedStyle.position;
  var parents = [];

  if (position === 'fixed') {
    return [el];
  }

  var parent = el;
  while ((parent = parent.parentNode) && parent && parent.nodeType === 1) {
    var style = undefined;
    try {
      style = getComputedStyle(parent);
    } catch (err) {}

    if (typeof style === 'undefined' || style === null) {
      parents.push(parent);
      return parents;
    }

    var _style = style;
    var overflow = _style.overflow;
    var overflowX = _style.overflowX;
    var overflowY = _style.overflowY;

    if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
      if (position !== 'absolute' || ['relative', 'absolute', 'fixed'].indexOf(style.position) >= 0) {
        parents.push(parent);
      }
    }
  }

  parents.push(el.ownerDocument.body);

  // If the node is within a frame, account for the parent window scroll
  if (el.ownerDocument !== document) {
    parents.push(el.ownerDocument.defaultView);
  }

  return parents;
}

var uniqueId = (function () {
  var id = 0;
  return function () {
    return ++id;
  };
})();

var zeroPosCache = {};
var getOrigin = function getOrigin() {
  // getBoundingClientRect is unfortunately too accurate.  It introduces a pixel or two of
  // jitter as the user scrolls that messes with our ability to detect if two positions
  // are equivilant or not.  We place an element at the top left of the page that will
  // get the same jitter, so we can cancel the two out.
  var node = zeroElement;
  if (!node || !document.body.contains(node)) {
    node = document.createElement('div');
    node.setAttribute('data-tether-id', uniqueId());
    extend(node.style, {
      top: 0,
      left: 0,
      position: 'absolute'
    });

    document.body.appendChild(node);

    zeroElement = node;
  }

  var id = node.getAttribute('data-tether-id');
  if (typeof zeroPosCache[id] === 'undefined') {
    zeroPosCache[id] = getActualBoundingClientRect(node);

    // Clear the cache when this position call is done
    defer(function () {
      delete zeroPosCache[id];
    });
  }

  return zeroPosCache[id];
};

function removeUtilElements() {
  if (zeroElement) {
    document.body.removeChild(zeroElement);
  }
  zeroElement = null;
};

function getBounds(el) {
  var doc = undefined;
  if (el === document) {
    doc = document;
    el = document.documentElement;
  } else {
    doc = el.ownerDocument;
  }

  var docEl = doc.documentElement;

  var box = getActualBoundingClientRect(el);

  var origin = getOrigin();

  box.top -= origin.top;
  box.left -= origin.left;

  if (typeof box.width === 'undefined') {
    box.width = document.body.scrollWidth - box.left - box.right;
  }
  if (typeof box.height === 'undefined') {
    box.height = document.body.scrollHeight - box.top - box.bottom;
  }

  box.top = box.top - docEl.clientTop;
  box.left = box.left - docEl.clientLeft;
  box.right = doc.body.clientWidth - box.width - box.left;
  box.bottom = doc.body.clientHeight - box.height - box.top;

  return box;
}

function getOffsetParent(el) {
  return el.offsetParent || document.documentElement;
}

var _scrollBarSize = null;
function getScrollBarSize() {
  if (_scrollBarSize) {
    return _scrollBarSize;
  }
  var inner = document.createElement('div');
  inner.style.width = '100%';
  inner.style.height = '200px';

  var outer = document.createElement('div');
  extend(outer.style, {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    visibility: 'hidden',
    width: '200px',
    height: '150px',
    overflow: 'hidden'
  });

  outer.appendChild(inner);

  document.body.appendChild(outer);

  var widthContained = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  var widthScroll = inner.offsetWidth;

  if (widthContained === widthScroll) {
    widthScroll = outer.clientWidth;
  }

  document.body.removeChild(outer);

  var width = widthContained - widthScroll;

  _scrollBarSize = { width: width, height: width };
  return _scrollBarSize;
}

function extend() {
  var out = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var args = [];

  Array.prototype.push.apply(args, arguments);

  args.slice(1).forEach(function (obj) {
    if (obj) {
      for (var key in obj) {
        if (({}).hasOwnProperty.call(obj, key)) {
          out[key] = obj[key];
        }
      }
    }
  });

  return out;
}

function removeClass(el, name) {
  if (typeof el.classList !== 'undefined') {
    name.split(' ').forEach(function (cls) {
      if (cls.trim()) {
        el.classList.remove(cls);
      }
    });
  } else {
    var regex = new RegExp('(^| )' + name.split(' ').join('|') + '( |$)', 'gi');
    var className = getClassName(el).replace(regex, ' ');
    setClassName(el, className);
  }
}

function addClass(el, name) {
  if (typeof el.classList !== 'undefined') {
    name.split(' ').forEach(function (cls) {
      if (cls.trim()) {
        el.classList.add(cls);
      }
    });
  } else {
    removeClass(el, name);
    var cls = getClassName(el) + (' ' + name);
    setClassName(el, cls);
  }
}

function hasClass(el, name) {
  if (typeof el.classList !== 'undefined') {
    return el.classList.contains(name);
  }
  var className = getClassName(el);
  return new RegExp('(^| )' + name + '( |$)', 'gi').test(className);
}

function getClassName(el) {
  // Can't use just SVGAnimatedString here since nodes within a Frame in IE have
  // completely separately SVGAnimatedString base classes
  if (el.className instanceof el.ownerDocument.defaultView.SVGAnimatedString) {
    return el.className.baseVal;
  }
  return el.className;
}

function setClassName(el, className) {
  el.setAttribute('class', className);
}

function updateClasses(el, add, all) {
  // Of the set of 'all' classes, we need the 'add' classes, and only the
  // 'add' classes to be set.
  all.forEach(function (cls) {
    if (add.indexOf(cls) === -1 && hasClass(el, cls)) {
      removeClass(el, cls);
    }
  });

  add.forEach(function (cls) {
    if (!hasClass(el, cls)) {
      addClass(el, cls);
    }
  });
}

var deferred = [];

var defer = function defer(fn) {
  deferred.push(fn);
};

var flush = function flush() {
  var fn = undefined;
  while (fn = deferred.pop()) {
    fn();
  }
};

var Evented = (function () {
  function Evented() {
    _classCallCheck(this, Evented);
  }

  _createClass(Evented, [{
    key: 'on',
    value: function on(event, handler, ctx) {
      var once = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

      if (typeof this.bindings === 'undefined') {
        this.bindings = {};
      }
      if (typeof this.bindings[event] === 'undefined') {
        this.bindings[event] = [];
      }
      this.bindings[event].push({ handler: handler, ctx: ctx, once: once });
    }
  }, {
    key: 'once',
    value: function once(event, handler, ctx) {
      this.on(event, handler, ctx, true);
    }
  }, {
    key: 'off',
    value: function off(event, handler) {
      if (typeof this.bindings === 'undefined' || typeof this.bindings[event] === 'undefined') {
        return;
      }

      if (typeof handler === 'undefined') {
        delete this.bindings[event];
      } else {
        var i = 0;
        while (i < this.bindings[event].length) {
          if (this.bindings[event][i].handler === handler) {
            this.bindings[event].splice(i, 1);
          } else {
            ++i;
          }
        }
      }
    }
  }, {
    key: 'trigger',
    value: function trigger(event) {
      if (typeof this.bindings !== 'undefined' && this.bindings[event]) {
        var i = 0;

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        while (i < this.bindings[event].length) {
          var _bindings$event$i = this.bindings[event][i];
          var handler = _bindings$event$i.handler;
          var ctx = _bindings$event$i.ctx;
          var once = _bindings$event$i.once;

          var context = ctx;
          if (typeof context === 'undefined') {
            context = this;
          }

          handler.apply(context, args);

          if (once) {
            this.bindings[event].splice(i, 1);
          } else {
            ++i;
          }
        }
      }
    }
  }]);

  return Evented;
})();

TetherBase.Utils = {
  getActualBoundingClientRect: getActualBoundingClientRect,
  getScrollParents: getScrollParents,
  getBounds: getBounds,
  getOffsetParent: getOffsetParent,
  extend: extend,
  addClass: addClass,
  removeClass: removeClass,
  hasClass: hasClass,
  updateClasses: updateClasses,
  defer: defer,
  flush: flush,
  uniqueId: uniqueId,
  Evented: Evented,
  getScrollBarSize: getScrollBarSize,
  removeUtilElements: removeUtilElements
};
/* globals TetherBase, performance */

'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

if (typeof TetherBase === 'undefined') {
  throw new Error('You must include the utils.js file before tether.js');
}

var _TetherBase$Utils = TetherBase.Utils;
var getScrollParents = _TetherBase$Utils.getScrollParents;
var getBounds = _TetherBase$Utils.getBounds;
var getOffsetParent = _TetherBase$Utils.getOffsetParent;
var extend = _TetherBase$Utils.extend;
var addClass = _TetherBase$Utils.addClass;
var removeClass = _TetherBase$Utils.removeClass;
var updateClasses = _TetherBase$Utils.updateClasses;
var defer = _TetherBase$Utils.defer;
var flush = _TetherBase$Utils.flush;
var getScrollBarSize = _TetherBase$Utils.getScrollBarSize;
var removeUtilElements = _TetherBase$Utils.removeUtilElements;

function within(a, b) {
  var diff = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  return a + diff >= b && b >= a - diff;
}

var transformKey = (function () {
  if (typeof document === 'undefined') {
    return '';
  }
  var el = document.createElement('div');

  var transforms = ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform'];
  for (var i = 0; i < transforms.length; ++i) {
    var key = transforms[i];
    if (el.style[key] !== undefined) {
      return key;
    }
  }
})();

var tethers = [];

var position = function position() {
  tethers.forEach(function (tether) {
    tether.position(false);
  });
  flush();
};

function now() {
  if (typeof performance === 'object' && typeof performance.now === 'function') {
    return performance.now();
  }
  return +new Date();
}

(function () {
  var lastCall = null;
  var lastDuration = null;
  var pendingTimeout = null;

  var tick = function tick() {
    if (typeof lastDuration !== 'undefined' && lastDuration > 16) {
      // We voluntarily throttle ourselves if we can't manage 60fps
      lastDuration = Math.min(lastDuration - 16, 250);

      // Just in case this is the last event, remember to position just once more
      pendingTimeout = setTimeout(tick, 250);
      return;
    }

    if (typeof lastCall !== 'undefined' && now() - lastCall < 10) {
      // Some browsers call events a little too frequently, refuse to run more than is reasonable
      return;
    }

    if (pendingTimeout != null) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }

    lastCall = now();
    position();
    lastDuration = now() - lastCall;
  };

  if (typeof window !== 'undefined' && typeof window.addEventListener !== 'undefined') {
    ['resize', 'scroll', 'touchmove'].forEach(function (event) {
      window.addEventListener(event, tick);
    });
  }
})();

var MIRROR_LR = {
  center: 'center',
  left: 'right',
  right: 'left'
};

var MIRROR_TB = {
  middle: 'middle',
  top: 'bottom',
  bottom: 'top'
};

var OFFSET_MAP = {
  top: 0,
  left: 0,
  middle: '50%',
  center: '50%',
  bottom: '100%',
  right: '100%'
};

var autoToFixedAttachment = function autoToFixedAttachment(attachment, relativeToAttachment) {
  var left = attachment.left;
  var top = attachment.top;

  if (left === 'auto') {
    left = MIRROR_LR[relativeToAttachment.left];
  }

  if (top === 'auto') {
    top = MIRROR_TB[relativeToAttachment.top];
  }

  return { left: left, top: top };
};

var attachmentToOffset = function attachmentToOffset(attachment) {
  var left = attachment.left;
  var top = attachment.top;

  if (typeof OFFSET_MAP[attachment.left] !== 'undefined') {
    left = OFFSET_MAP[attachment.left];
  }

  if (typeof OFFSET_MAP[attachment.top] !== 'undefined') {
    top = OFFSET_MAP[attachment.top];
  }

  return { left: left, top: top };
};

function addOffset() {
  var out = { top: 0, left: 0 };

  for (var _len = arguments.length, offsets = Array(_len), _key = 0; _key < _len; _key++) {
    offsets[_key] = arguments[_key];
  }

  offsets.forEach(function (_ref) {
    var top = _ref.top;
    var left = _ref.left;

    if (typeof top === 'string') {
      top = parseFloat(top, 10);
    }
    if (typeof left === 'string') {
      left = parseFloat(left, 10);
    }

    out.top += top;
    out.left += left;
  });

  return out;
}

function offsetToPx(offset, size) {
  if (typeof offset.left === 'string' && offset.left.indexOf('%') !== -1) {
    offset.left = parseFloat(offset.left, 10) / 100 * size.width;
  }
  if (typeof offset.top === 'string' && offset.top.indexOf('%') !== -1) {
    offset.top = parseFloat(offset.top, 10) / 100 * size.height;
  }

  return offset;
}

var parseOffset = function parseOffset(value) {
  var _value$split = value.split(' ');

  var _value$split2 = _slicedToArray(_value$split, 2);

  var top = _value$split2[0];
  var left = _value$split2[1];

  return { top: top, left: left };
};
var parseAttachment = parseOffset;

var TetherClass = (function (_Evented) {
  _inherits(TetherClass, _Evented);

  function TetherClass(options) {
    var _this = this;

    _classCallCheck(this, TetherClass);

    _get(Object.getPrototypeOf(TetherClass.prototype), 'constructor', this).call(this);
    this.position = this.position.bind(this);

    tethers.push(this);

    this.history = [];

    this.setOptions(options, false);

    TetherBase.modules.forEach(function (module) {
      if (typeof module.initialize !== 'undefined') {
        module.initialize.call(_this);
      }
    });

    this.position();
  }

  _createClass(TetherClass, [{
    key: 'getClass',
    value: function getClass() {
      var key = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var classes = this.options.classes;

      if (typeof classes !== 'undefined' && classes[key]) {
        return this.options.classes[key];
      } else if (this.options.classPrefix) {
        return this.options.classPrefix + '-' + key;
      } else {
        return key;
      }
    }
  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      var _this2 = this;

      var pos = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var defaults = {
        offset: '0 0',
        targetOffset: '0 0',
        targetAttachment: 'auto auto',
        classPrefix: 'tether'
      };

      this.options = extend(defaults, options);

      var _options = this.options;
      var element = _options.element;
      var target = _options.target;
      var targetModifier = _options.targetModifier;

      this.element = element;
      this.target = target;
      this.targetModifier = targetModifier;

      if (this.target === 'viewport') {
        this.target = document.body;
        this.targetModifier = 'visible';
      } else if (this.target === 'scroll-handle') {
        this.target = document.body;
        this.targetModifier = 'scroll-handle';
      }

      ['element', 'target'].forEach(function (key) {
        if (typeof _this2[key] === 'undefined') {
          throw new Error('Tether Error: Both element and target must be defined');
        }

        if (typeof _this2[key].jquery !== 'undefined') {
          _this2[key] = _this2[key][0];
        } else if (typeof _this2[key] === 'string') {
          _this2[key] = document.querySelector(_this2[key]);
        }
      });

      addClass(this.element, this.getClass('element'));
      if (!(this.options.addTargetClasses === false)) {
        addClass(this.target, this.getClass('target'));
      }

      if (!this.options.attachment) {
        throw new Error('Tether Error: You must provide an attachment');
      }

      this.targetAttachment = parseAttachment(this.options.targetAttachment);
      this.attachment = parseAttachment(this.options.attachment);
      this.offset = parseOffset(this.options.offset);
      this.targetOffset = parseOffset(this.options.targetOffset);

      if (typeof this.scrollParents !== 'undefined') {
        this.disable();
      }

      if (this.targetModifier === 'scroll-handle') {
        this.scrollParents = [this.target];
      } else {
        this.scrollParents = getScrollParents(this.target);
      }

      if (!(this.options.enabled === false)) {
        this.enable(pos);
      }
    }
  }, {
    key: 'getTargetBounds',
    value: function getTargetBounds() {
      if (typeof this.targetModifier !== 'undefined') {
        if (this.targetModifier === 'visible') {
          if (this.target === document.body) {
            return { top: pageYOffset, left: pageXOffset, height: innerHeight, width: innerWidth };
          } else {
            var bounds = getBounds(this.target);

            var out = {
              height: bounds.height,
              width: bounds.width,
              top: bounds.top,
              left: bounds.left
            };

            out.height = Math.min(out.height, bounds.height - (pageYOffset - bounds.top));
            out.height = Math.min(out.height, bounds.height - (bounds.top + bounds.height - (pageYOffset + innerHeight)));
            out.height = Math.min(innerHeight, out.height);
            out.height -= 2;

            out.width = Math.min(out.width, bounds.width - (pageXOffset - bounds.left));
            out.width = Math.min(out.width, bounds.width - (bounds.left + bounds.width - (pageXOffset + innerWidth)));
            out.width = Math.min(innerWidth, out.width);
            out.width -= 2;

            if (out.top < pageYOffset) {
              out.top = pageYOffset;
            }
            if (out.left < pageXOffset) {
              out.left = pageXOffset;
            }

            return out;
          }
        } else if (this.targetModifier === 'scroll-handle') {
          var bounds = undefined;
          var target = this.target;
          if (target === document.body) {
            target = document.documentElement;

            bounds = {
              left: pageXOffset,
              top: pageYOffset,
              height: innerHeight,
              width: innerWidth
            };
          } else {
            bounds = getBounds(target);
          }

          var style = getComputedStyle(target);

          var hasBottomScroll = target.scrollWidth > target.clientWidth || [style.overflow, style.overflowX].indexOf('scroll') >= 0 || this.target !== document.body;

          var scrollBottom = 0;
          if (hasBottomScroll) {
            scrollBottom = 15;
          }

          var height = bounds.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) - scrollBottom;

          var out = {
            width: 15,
            height: height * 0.975 * (height / target.scrollHeight),
            left: bounds.left + bounds.width - parseFloat(style.borderLeftWidth) - 15
          };

          var fitAdj = 0;
          if (height < 408 && this.target === document.body) {
            fitAdj = -0.00011 * Math.pow(height, 2) - 0.00727 * height + 22.58;
          }

          if (this.target !== document.body) {
            out.height = Math.max(out.height, 24);
          }

          var scrollPercentage = this.target.scrollTop / (target.scrollHeight - height);
          out.top = scrollPercentage * (height - out.height - fitAdj) + bounds.top + parseFloat(style.borderTopWidth);

          if (this.target === document.body) {
            out.height = Math.max(out.height, 24);
          }

          return out;
        }
      } else {
        return getBounds(this.target);
      }
    }
  }, {
    key: 'clearCache',
    value: function clearCache() {
      this._cache = {};
    }
  }, {
    key: 'cache',
    value: function cache(k, getter) {
      // More than one module will often need the same DOM info, so
      // we keep a cache which is cleared on each position call
      if (typeof this._cache === 'undefined') {
        this._cache = {};
      }

      if (typeof this._cache[k] === 'undefined') {
        this._cache[k] = getter.call(this);
      }

      return this._cache[k];
    }
  }, {
    key: 'enable',
    value: function enable() {
      var _this3 = this;

      var pos = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      if (!(this.options.addTargetClasses === false)) {
        addClass(this.target, this.getClass('enabled'));
      }
      addClass(this.element, this.getClass('enabled'));
      this.enabled = true;

      this.scrollParents.forEach(function (parent) {
        if (parent !== _this3.target.ownerDocument) {
          parent.addEventListener('scroll', _this3.position);
        }
      });

      if (pos) {
        this.position();
      }
    }
  }, {
    key: 'disable',
    value: function disable() {
      var _this4 = this;

      removeClass(this.target, this.getClass('enabled'));
      removeClass(this.element, this.getClass('enabled'));
      this.enabled = false;

      if (typeof this.scrollParents !== 'undefined') {
        this.scrollParents.forEach(function (parent) {
          parent.removeEventListener('scroll', _this4.position);
        });
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var _this5 = this;

      this.disable();

      tethers.forEach(function (tether, i) {
        if (tether === _this5) {
          tethers.splice(i, 1);
        }
      });

      // Remove any elements we were using for convenience from the DOM
      if (tethers.length === 0) {
        removeUtilElements();
      }
    }
  }, {
    key: 'updateAttachClasses',
    value: function updateAttachClasses(elementAttach, targetAttach) {
      var _this6 = this;

      elementAttach = elementAttach || this.attachment;
      targetAttach = targetAttach || this.targetAttachment;
      var sides = ['left', 'top', 'bottom', 'right', 'middle', 'center'];

      if (typeof this._addAttachClasses !== 'undefined' && this._addAttachClasses.length) {
        // updateAttachClasses can be called more than once in a position call, so
        // we need to clean up after ourselves such that when the last defer gets
        // ran it doesn't add any extra classes from previous calls.
        this._addAttachClasses.splice(0, this._addAttachClasses.length);
      }

      if (typeof this._addAttachClasses === 'undefined') {
        this._addAttachClasses = [];
      }
      var add = this._addAttachClasses;

      if (elementAttach.top) {
        add.push(this.getClass('element-attached') + '-' + elementAttach.top);
      }
      if (elementAttach.left) {
        add.push(this.getClass('element-attached') + '-' + elementAttach.left);
      }
      if (targetAttach.top) {
        add.push(this.getClass('target-attached') + '-' + targetAttach.top);
      }
      if (targetAttach.left) {
        add.push(this.getClass('target-attached') + '-' + targetAttach.left);
      }

      var all = [];
      sides.forEach(function (side) {
        all.push(_this6.getClass('element-attached') + '-' + side);
        all.push(_this6.getClass('target-attached') + '-' + side);
      });

      defer(function () {
        if (!(typeof _this6._addAttachClasses !== 'undefined')) {
          return;
        }

        updateClasses(_this6.element, _this6._addAttachClasses, all);
        if (!(_this6.options.addTargetClasses === false)) {
          updateClasses(_this6.target, _this6._addAttachClasses, all);
        }

        delete _this6._addAttachClasses;
      });
    }
  }, {
    key: 'position',
    value: function position() {
      var _this7 = this;

      var flushChanges = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      // flushChanges commits the changes immediately, leave true unless you are positioning multiple
      // tethers (in which case call Tether.Utils.flush yourself when you're done)

      if (!this.enabled) {
        return;
      }

      this.clearCache();

      // Turn 'auto' attachments into the appropriate corner or edge
      var targetAttachment = autoToFixedAttachment(this.targetAttachment, this.attachment);

      this.updateAttachClasses(this.attachment, targetAttachment);

      var elementPos = this.cache('element-bounds', function () {
        return getBounds(_this7.element);
      });

      var width = elementPos.width;
      var height = elementPos.height;

      if (width === 0 && height === 0 && typeof this.lastSize !== 'undefined') {
        var _lastSize = this.lastSize;

        // We cache the height and width to make it possible to position elements that are
        // getting hidden.
        width = _lastSize.width;
        height = _lastSize.height;
      } else {
        this.lastSize = { width: width, height: height };
      }

      var targetPos = this.cache('target-bounds', function () {
        return _this7.getTargetBounds();
      });
      var targetSize = targetPos;

      // Get an actual px offset from the attachment
      var offset = offsetToPx(attachmentToOffset(this.attachment), { width: width, height: height });
      var targetOffset = offsetToPx(attachmentToOffset(targetAttachment), targetSize);

      var manualOffset = offsetToPx(this.offset, { width: width, height: height });
      var manualTargetOffset = offsetToPx(this.targetOffset, targetSize);

      // Add the manually provided offset
      offset = addOffset(offset, manualOffset);
      targetOffset = addOffset(targetOffset, manualTargetOffset);

      // It's now our goal to make (element position + offset) == (target position + target offset)
      var left = targetPos.left + targetOffset.left - offset.left;
      var top = targetPos.top + targetOffset.top - offset.top;

      for (var i = 0; i < TetherBase.modules.length; ++i) {
        var _module2 = TetherBase.modules[i];
        var ret = _module2.position.call(this, {
          left: left,
          top: top,
          targetAttachment: targetAttachment,
          targetPos: targetPos,
          elementPos: elementPos,
          offset: offset,
          targetOffset: targetOffset,
          manualOffset: manualOffset,
          manualTargetOffset: manualTargetOffset,
          scrollbarSize: scrollbarSize,
          attachment: this.attachment
        });

        if (ret === false) {
          return false;
        } else if (typeof ret === 'undefined' || typeof ret !== 'object') {
          continue;
        } else {
          top = ret.top;
          left = ret.left;
        }
      }

      // We describe the position three different ways to give the optimizer
      // a chance to decide the best possible way to position the element
      // with the fewest repaints.
      var next = {
        // It's position relative to the page (absolute positioning when
        // the element is a child of the body)
        page: {
          top: top,
          left: left
        },

        // It's position relative to the viewport (fixed positioning)
        viewport: {
          top: top - pageYOffset,
          bottom: pageYOffset - top - height + innerHeight,
          left: left - pageXOffset,
          right: pageXOffset - left - width + innerWidth
        }
      };

      var doc = this.target.ownerDocument;
      var win = doc.defaultView;

      var scrollbarSize = undefined;
      if (win.innerHeight > doc.documentElement.clientHeight) {
        scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
        next.viewport.bottom -= scrollbarSize.height;
      }

      if (win.innerWidth > doc.documentElement.clientWidth) {
        scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
        next.viewport.right -= scrollbarSize.width;
      }

      if (['', 'static'].indexOf(doc.body.style.position) === -1 || ['', 'static'].indexOf(doc.body.parentElement.style.position) === -1) {
        // Absolute positioning in the body will be relative to the page, not the 'initial containing block'
        next.page.bottom = doc.body.scrollHeight - top - height;
        next.page.right = doc.body.scrollWidth - left - width;
      }

      if (typeof this.options.optimizations !== 'undefined' && this.options.optimizations.moveElement !== false && !(typeof this.targetModifier !== 'undefined')) {
        (function () {
          var offsetParent = _this7.cache('target-offsetparent', function () {
            return getOffsetParent(_this7.target);
          });
          var offsetPosition = _this7.cache('target-offsetparent-bounds', function () {
            return getBounds(offsetParent);
          });
          var offsetParentStyle = getComputedStyle(offsetParent);
          var offsetParentSize = offsetPosition;

          var offsetBorder = {};
          ['Top', 'Left', 'Bottom', 'Right'].forEach(function (side) {
            offsetBorder[side.toLowerCase()] = parseFloat(offsetParentStyle['border' + side + 'Width']);
          });

          offsetPosition.right = doc.body.scrollWidth - offsetPosition.left - offsetParentSize.width + offsetBorder.right;
          offsetPosition.bottom = doc.body.scrollHeight - offsetPosition.top - offsetParentSize.height + offsetBorder.bottom;

          if (next.page.top >= offsetPosition.top + offsetBorder.top && next.page.bottom >= offsetPosition.bottom) {
            if (next.page.left >= offsetPosition.left + offsetBorder.left && next.page.right >= offsetPosition.right) {
              // We're within the visible part of the target's scroll parent
              var scrollTop = offsetParent.scrollTop;
              var scrollLeft = offsetParent.scrollLeft;

              // It's position relative to the target's offset parent (absolute positioning when
              // the element is moved to be a child of the target's offset parent).
              next.offset = {
                top: next.page.top - offsetPosition.top + scrollTop - offsetBorder.top,
                left: next.page.left - offsetPosition.left + scrollLeft - offsetBorder.left
              };
            }
          }
        })();
      }

      // We could also travel up the DOM and try each containing context, rather than only
      // looking at the body, but we're gonna get diminishing returns.

      this.move(next);

      this.history.unshift(next);

      if (this.history.length > 3) {
        this.history.pop();
      }

      if (flushChanges) {
        flush();
      }

      return true;
    }

    // THE ISSUE
  }, {
    key: 'move',
    value: function move(pos) {
      var _this8 = this;

      if (!(typeof this.element.parentNode !== 'undefined')) {
        return;
      }

      var same = {};

      for (var type in pos) {
        same[type] = {};

        for (var key in pos[type]) {
          var found = false;

          for (var i = 0; i < this.history.length; ++i) {
            var point = this.history[i];
            if (typeof point[type] !== 'undefined' && !within(point[type][key], pos[type][key])) {
              found = true;
              break;
            }
          }

          if (!found) {
            same[type][key] = true;
          }
        }
      }

      var css = { top: '', left: '', right: '', bottom: '' };

      var transcribe = function transcribe(_same, _pos) {
        var hasOptimizations = typeof _this8.options.optimizations !== 'undefined';
        var gpu = hasOptimizations ? _this8.options.optimizations.gpu : null;
        if (gpu !== false) {
          var yPos = undefined,
              xPos = undefined;
          if (_same.top) {
            css.top = 0;
            yPos = _pos.top;
          } else {
            css.bottom = 0;
            yPos = -_pos.bottom;
          }

          if (_same.left) {
            css.left = 0;
            xPos = _pos.left;
          } else {
            css.right = 0;
            xPos = -_pos.right;
          }

          if (typeof window.devicePixelRatio === 'number' && devicePixelRatio % 1 === 0) {
            xPos = Math.round(xPos * devicePixelRatio) / devicePixelRatio;
            yPos = Math.round(yPos * devicePixelRatio) / devicePixelRatio;
          }

          css[transformKey] = 'translateX(' + xPos + 'px) translateY(' + yPos + 'px)';

          if (transformKey !== 'msTransform') {
            // The Z transform will keep this in the GPU (faster, and prevents artifacts),
            // but IE9 doesn't support 3d transforms and will choke.
            css[transformKey] += " translateZ(0)";
          }
        } else {
          if (_same.top) {
            css.top = _pos.top + 'px';
          } else {
            css.bottom = _pos.bottom + 'px';
          }

          if (_same.left) {
            css.left = _pos.left + 'px';
          } else {
            css.right = _pos.right + 'px';
          }
        }
      };

      var moved = false;
      if ((same.page.top || same.page.bottom) && (same.page.left || same.page.right)) {
        css.position = 'absolute';
        transcribe(same.page, pos.page);
      } else if ((same.viewport.top || same.viewport.bottom) && (same.viewport.left || same.viewport.right)) {
        css.position = 'fixed';
        transcribe(same.viewport, pos.viewport);
      } else if (typeof same.offset !== 'undefined' && same.offset.top && same.offset.left) {
        (function () {
          css.position = 'absolute';
          var offsetParent = _this8.cache('target-offsetparent', function () {
            return getOffsetParent(_this8.target);
          });

          if (getOffsetParent(_this8.element) !== offsetParent) {
            defer(function () {
              _this8.element.parentNode.removeChild(_this8.element);
              offsetParent.appendChild(_this8.element);
            });
          }

          transcribe(same.offset, pos.offset);
          moved = true;
        })();
      } else {
        css.position = 'absolute';
        transcribe({ top: true, left: true }, pos.page);
      }

      if (!moved) {
        if (this.options.bodyElement) {
          if (this.element.parentNode !== this.options.bodyElement) {
            this.options.bodyElement.appendChild(this.element);
          }
        } else {
          var isFullscreenElement = function isFullscreenElement(e) {
            var d = e.ownerDocument;
            var fe = d.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement || d.msFullscreenElement;
            return fe === e;
          };

          var offsetParentIsBody = true;

          var currentNode = this.element.parentNode;
          while (currentNode && currentNode.nodeType === 1 && currentNode.tagName !== 'BODY' && !isFullscreenElement(currentNode)) {
            if (getComputedStyle(currentNode).position !== 'static') {
              offsetParentIsBody = false;
              break;
            }

            currentNode = currentNode.parentNode;
          }

          if (!offsetParentIsBody) {
            this.element.parentNode.removeChild(this.element);
            this.element.ownerDocument.body.appendChild(this.element);
          }
        }
      }

      // Any css change will trigger a repaint, so let's avoid one if nothing changed
      var writeCSS = {};
      var write = false;
      for (var key in css) {
        var val = css[key];
        var elVal = this.element.style[key];

        if (elVal !== val) {
          write = true;
          writeCSS[key] = val;
        }
      }

      if (write) {
        defer(function () {
          extend(_this8.element.style, writeCSS);
          _this8.trigger('repositioned');
        });
      }
    }
  }]);

  return TetherClass;
})(Evented);

TetherClass.modules = [];

TetherBase.position = position;

var Tether = extend(TetherClass, TetherBase);
/* globals TetherBase */

'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _TetherBase$Utils = TetherBase.Utils;
var getBounds = _TetherBase$Utils.getBounds;
var extend = _TetherBase$Utils.extend;
var updateClasses = _TetherBase$Utils.updateClasses;
var defer = _TetherBase$Utils.defer;

var BOUNDS_FORMAT = ['left', 'top', 'right', 'bottom'];

function getBoundingRect(tether, to) {
  if (to === 'scrollParent') {
    to = tether.scrollParents[0];
  } else if (to === 'window') {
    to = [pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset];
  }

  if (to === document) {
    to = to.documentElement;
  }

  if (typeof to.nodeType !== 'undefined') {
    (function () {
      var node = to;
      var size = getBounds(to);
      var pos = size;
      var style = getComputedStyle(to);

      to = [pos.left, pos.top, size.width + pos.left, size.height + pos.top];

      // Account any parent Frames scroll offset
      if (node.ownerDocument !== document) {
        var win = node.ownerDocument.defaultView;
        to[0] += win.pageXOffset;
        to[1] += win.pageYOffset;
        to[2] += win.pageXOffset;
        to[3] += win.pageYOffset;
      }

      BOUNDS_FORMAT.forEach(function (side, i) {
        side = side[0].toUpperCase() + side.substr(1);
        if (side === 'Top' || side === 'Left') {
          to[i] += parseFloat(style['border' + side + 'Width']);
        } else {
          to[i] -= parseFloat(style['border' + side + 'Width']);
        }
      });
    })();
  }

  return to;
}

TetherBase.modules.push({
  position: function position(_ref) {
    var _this = this;

    var top = _ref.top;
    var left = _ref.left;
    var targetAttachment = _ref.targetAttachment;

    if (!this.options.constraints) {
      return true;
    }

    var _cache = this.cache('element-bounds', function () {
      return getBounds(_this.element);
    });

    var height = _cache.height;
    var width = _cache.width;

    if (width === 0 && height === 0 && typeof this.lastSize !== 'undefined') {
      var _lastSize = this.lastSize;

      // Handle the item getting hidden as a result of our positioning without glitching
      // the classes in and out
      width = _lastSize.width;
      height = _lastSize.height;
    }

    var targetSize = this.cache('target-bounds', function () {
      return _this.getTargetBounds();
    });

    var targetHeight = targetSize.height;
    var targetWidth = targetSize.width;

    var allClasses = [this.getClass('pinned'), this.getClass('out-of-bounds')];

    this.options.constraints.forEach(function (constraint) {
      var outOfBoundsClass = constraint.outOfBoundsClass;
      var pinnedClass = constraint.pinnedClass;

      if (outOfBoundsClass) {
        allClasses.push(outOfBoundsClass);
      }
      if (pinnedClass) {
        allClasses.push(pinnedClass);
      }
    });

    allClasses.forEach(function (cls) {
      ['left', 'top', 'right', 'bottom'].forEach(function (side) {
        allClasses.push(cls + '-' + side);
      });
    });

    var addClasses = [];

    var tAttachment = extend({}, targetAttachment);
    var eAttachment = extend({}, this.attachment);

    this.options.constraints.forEach(function (constraint) {
      var to = constraint.to;
      var attachment = constraint.attachment;
      var pin = constraint.pin;

      if (typeof attachment === 'undefined') {
        attachment = '';
      }

      var changeAttachX = undefined,
          changeAttachY = undefined;
      if (attachment.indexOf(' ') >= 0) {
        var _attachment$split = attachment.split(' ');

        var _attachment$split2 = _slicedToArray(_attachment$split, 2);

        changeAttachY = _attachment$split2[0];
        changeAttachX = _attachment$split2[1];
      } else {
        changeAttachX = changeAttachY = attachment;
      }

      var bounds = getBoundingRect(_this, to);

      if (changeAttachY === 'target' || changeAttachY === 'both') {
        if (top < bounds[1] && tAttachment.top === 'top') {
          top += targetHeight;
          tAttachment.top = 'bottom';
        }

        if (top + height > bounds[3] && tAttachment.top === 'bottom') {
          top -= targetHeight;
          tAttachment.top = 'top';
        }
      }

      if (changeAttachY === 'together') {
        if (tAttachment.top === 'top') {
          if (eAttachment.top === 'bottom' && top < bounds[1]) {
            top += targetHeight;
            tAttachment.top = 'bottom';

            top += height;
            eAttachment.top = 'top';
          } else if (eAttachment.top === 'top' && top + height > bounds[3] && top - (height - targetHeight) >= bounds[1]) {
            top -= height - targetHeight;
            tAttachment.top = 'bottom';

            eAttachment.top = 'bottom';
          }
        }

        if (tAttachment.top === 'bottom') {
          if (eAttachment.top === 'top' && top + height > bounds[3]) {
            top -= targetHeight;
            tAttachment.top = 'top';

            top -= height;
            eAttachment.top = 'bottom';
          } else if (eAttachment.top === 'bottom' && top < bounds[1] && top + (height * 2 - targetHeight) <= bounds[3]) {
            top += height - targetHeight;
            tAttachment.top = 'top';

            eAttachment.top = 'top';
          }
        }

        if (tAttachment.top === 'middle') {
          if (top + height > bounds[3] && eAttachment.top === 'top') {
            top -= height;
            eAttachment.top = 'bottom';
          } else if (top < bounds[1] && eAttachment.top === 'bottom') {
            top += height;
            eAttachment.top = 'top';
          }
        }
      }

      if (changeAttachX === 'target' || changeAttachX === 'both') {
        if (left < bounds[0] && tAttachment.left === 'left') {
          left += targetWidth;
          tAttachment.left = 'right';
        }

        if (left + width > bounds[2] && tAttachment.left === 'right') {
          left -= targetWidth;
          tAttachment.left = 'left';
        }
      }

      if (changeAttachX === 'together') {
        if (left < bounds[0] && tAttachment.left === 'left') {
          if (eAttachment.left === 'right') {
            left += targetWidth;
            tAttachment.left = 'right';

            left += width;
            eAttachment.left = 'left';
          } else if (eAttachment.left === 'left') {
            left += targetWidth;
            tAttachment.left = 'right';

            left -= width;
            eAttachment.left = 'right';
          }
        } else if (left + width > bounds[2] && tAttachment.left === 'right') {
          if (eAttachment.left === 'left') {
            left -= targetWidth;
            tAttachment.left = 'left';

            left -= width;
            eAttachment.left = 'right';
          } else if (eAttachment.left === 'right') {
            left -= targetWidth;
            tAttachment.left = 'left';

            left += width;
            eAttachment.left = 'left';
          }
        } else if (tAttachment.left === 'center') {
          if (left + width > bounds[2] && eAttachment.left === 'left') {
            left -= width;
            eAttachment.left = 'right';
          } else if (left < bounds[0] && eAttachment.left === 'right') {
            left += width;
            eAttachment.left = 'left';
          }
        }
      }

      if (changeAttachY === 'element' || changeAttachY === 'both') {
        if (top < bounds[1] && eAttachment.top === 'bottom') {
          top += height;
          eAttachment.top = 'top';
        }

        if (top + height > bounds[3] && eAttachment.top === 'top') {
          top -= height;
          eAttachment.top = 'bottom';
        }
      }

      if (changeAttachX === 'element' || changeAttachX === 'both') {
        if (left < bounds[0]) {
          if (eAttachment.left === 'right') {
            left += width;
            eAttachment.left = 'left';
          } else if (eAttachment.left === 'center') {
            left += width / 2;
            eAttachment.left = 'left';
          }
        }

        if (left + width > bounds[2]) {
          if (eAttachment.left === 'left') {
            left -= width;
            eAttachment.left = 'right';
          } else if (eAttachment.left === 'center') {
            left -= width / 2;
            eAttachment.left = 'right';
          }
        }
      }

      if (typeof pin === 'string') {
        pin = pin.split(',').map(function (p) {
          return p.trim();
        });
      } else if (pin === true) {
        pin = ['top', 'left', 'right', 'bottom'];
      }

      pin = pin || [];

      var pinned = [];
      var oob = [];

      if (top < bounds[1]) {
        if (pin.indexOf('top') >= 0) {
          top = bounds[1];
          pinned.push('top');
        } else {
          oob.push('top');
        }
      }

      if (top + height > bounds[3]) {
        if (pin.indexOf('bottom') >= 0) {
          top = bounds[3] - height;
          pinned.push('bottom');
        } else {
          oob.push('bottom');
        }
      }

      if (left < bounds[0]) {
        if (pin.indexOf('left') >= 0) {
          left = bounds[0];
          pinned.push('left');
        } else {
          oob.push('left');
        }
      }

      if (left + width > bounds[2]) {
        if (pin.indexOf('right') >= 0) {
          left = bounds[2] - width;
          pinned.push('right');
        } else {
          oob.push('right');
        }
      }

      if (pinned.length) {
        (function () {
          var pinnedClass = undefined;
          if (typeof _this.options.pinnedClass !== 'undefined') {
            pinnedClass = _this.options.pinnedClass;
          } else {
            pinnedClass = _this.getClass('pinned');
          }

          addClasses.push(pinnedClass);
          pinned.forEach(function (side) {
            addClasses.push(pinnedClass + '-' + side);
          });
        })();
      }

      if (oob.length) {
        (function () {
          var oobClass = undefined;
          if (typeof _this.options.outOfBoundsClass !== 'undefined') {
            oobClass = _this.options.outOfBoundsClass;
          } else {
            oobClass = _this.getClass('out-of-bounds');
          }

          addClasses.push(oobClass);
          oob.forEach(function (side) {
            addClasses.push(oobClass + '-' + side);
          });
        })();
      }

      if (pinned.indexOf('left') >= 0 || pinned.indexOf('right') >= 0) {
        eAttachment.left = tAttachment.left = false;
      }
      if (pinned.indexOf('top') >= 0 || pinned.indexOf('bottom') >= 0) {
        eAttachment.top = tAttachment.top = false;
      }

      if (tAttachment.top !== targetAttachment.top || tAttachment.left !== targetAttachment.left || eAttachment.top !== _this.attachment.top || eAttachment.left !== _this.attachment.left) {
        _this.updateAttachClasses(eAttachment, tAttachment);
        _this.trigger('update', {
          attachment: eAttachment,
          targetAttachment: tAttachment
        });
      }
    });

    defer(function () {
      if (!(_this.options.addTargetClasses === false)) {
        updateClasses(_this.target, addClasses, allClasses);
      }
      updateClasses(_this.element, addClasses, allClasses);
    });

    return { top: top, left: left };
  }
});
/* globals TetherBase */

'use strict';

var _TetherBase$Utils = TetherBase.Utils;
var getBounds = _TetherBase$Utils.getBounds;
var updateClasses = _TetherBase$Utils.updateClasses;
var defer = _TetherBase$Utils.defer;

TetherBase.modules.push({
  position: function position(_ref) {
    var _this = this;

    var top = _ref.top;
    var left = _ref.left;

    var _cache = this.cache('element-bounds', function () {
      return getBounds(_this.element);
    });

    var height = _cache.height;
    var width = _cache.width;

    var targetPos = this.getTargetBounds();

    var bottom = top + height;
    var right = left + width;

    var abutted = [];
    if (top <= targetPos.bottom && bottom >= targetPos.top) {
      ['left', 'right'].forEach(function (side) {
        var targetPosSide = targetPos[side];
        if (targetPosSide === left || targetPosSide === right) {
          abutted.push(side);
        }
      });
    }

    if (left <= targetPos.right && right >= targetPos.left) {
      ['top', 'bottom'].forEach(function (side) {
        var targetPosSide = targetPos[side];
        if (targetPosSide === top || targetPosSide === bottom) {
          abutted.push(side);
        }
      });
    }

    var allClasses = [];
    var addClasses = [];

    var sides = ['left', 'top', 'right', 'bottom'];
    allClasses.push(this.getClass('abutted'));
    sides.forEach(function (side) {
      allClasses.push(_this.getClass('abutted') + '-' + side);
    });

    if (abutted.length) {
      addClasses.push(this.getClass('abutted'));
    }

    abutted.forEach(function (side) {
      addClasses.push(_this.getClass('abutted') + '-' + side);
    });

    defer(function () {
      if (!(_this.options.addTargetClasses === false)) {
        updateClasses(_this.target, addClasses, allClasses);
      }
      updateClasses(_this.element, addClasses, allClasses);
    });

    return true;
  }
});
/* globals TetherBase */

'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

TetherBase.modules.push({
  position: function position(_ref) {
    var top = _ref.top;
    var left = _ref.left;

    if (!this.options.shift) {
      return;
    }

    var shift = this.options.shift;
    if (typeof this.options.shift === 'function') {
      shift = this.options.shift.call(this, { top: top, left: left });
    }

    var shiftTop = undefined,
        shiftLeft = undefined;
    if (typeof shift === 'string') {
      shift = shift.split(' ');
      shift[1] = shift[1] || shift[0];

      var _shift = shift;

      var _shift2 = _slicedToArray(_shift, 2);

      shiftTop = _shift2[0];
      shiftLeft = _shift2[1];

      shiftTop = parseFloat(shiftTop, 10);
      shiftLeft = parseFloat(shiftLeft, 10);
    } else {
      shiftTop = shift.top;
      shiftLeft = shift.left;
    }

    top += shiftTop;
    left += shiftLeft;

    return { top: top, left: left };
  }
});
return Tether;

}));

},{}]},{},[105]);
