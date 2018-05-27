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


},{"backend/Views/ContextUi/ContextColumnView":2,"backend/Views/ContextUi/ContextUiView":4,"backend/Views/ContextUi/controls/ColumnControl":5,"backend/Views/ContextUi/controls/ResetControl":6,"templates/backend/context-bar.hbs":81}],4:[function(require,module,exports){
var ControlsView = require('backend/Views/ModuleControls/ControlsView');
module.exports = ControlsView.extend({
  initialize: function () {
    this.$menuList = jQuery('.kb-context-bar--actions', this.$el);
  }
});
},{"backend/Views/ModuleControls/ControlsView":7}],5:[function(require,module,exports){
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
/**
 * Creates the individual module-actions menu
 * like: duplicate, delete, status
 */
//KB.Backbone.Backend.ModuleControlsView
module.exports = Backbone.View.extend({
  id: '',
  $menuWrap: {}, // wrap container jQuery element
  $menuList: {}, // ul item
  initialize: function () {
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
},{}],8:[function(require,module,exports){
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
},{"common/Notice":13}],9:[function(require,module,exports){
var Config = require('common/Config');
module.exports = {
  blockLimit: function (areamodel) {
    var limit = areamodel.get('limit');
    // todo potentially wrong, yeah it's wrong
    var children = jQuery('#' + areamodel.get('id') + ' li.kb-module').length;
    return !(limit !== 0 && children === limit);


  },
  userCan: function (cap) {
    var check = jQuery.inArray(cap, Config.get('caps'));
    return check !== -1;
  }
}
},{"common/Config":10}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
var Utilities = require('common/Utilities');
module.exports = {
  getString: function (path) {
    if (!path || !KB || !KB.i18n) {
      return null;
    }
    return Utilities.getIndex(KB.i18n, path);
  }
};
},{"common/Utilities":18}],12:[function(require,module,exports){
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
},{"common/Config":10}],13:[function(require,module,exports){
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
    window.alertify.prompt(t, msg, value, function () {
      yes.call(scope);
    }, function () {
      no.call(scope);
    });
  }
};

},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
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
      if (jQuery(this).attr('id') === 'wp-content-wrap' || jQuery(this).attr('id') === 'ghosteditor') {
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

      if (id === 'ghosteditor') {
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
},{"common/Ajax":8,"common/Config":10,"common/Logger":12}],17:[function(require,module,exports){
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
    selector.tabs({
      activate: function (e, ui) {
        $('.kb-nano').nanoScroller({contentClass: 'kb-nano-content'});
        KB.Events.trigger('modal.recalibrate');
      }
    });
    selector.each(function () {
      // hide tab navigation if only one tab exists
      var length = $('.ui-tabs-nav li', $(this)).length;
      if (length === 1) {
        $(this).find('.ui-tabs-nav').css('display', 'none');
      }
    });

    var $subtabs = $('[data-kbfsubtabs]', $context).tabs({
      activate: function(){
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
        TinyMCE.removeEditors();

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
          $.when(that.changeArea(areaOver, currentModule)).
            then(function (res) {
              if (res.success) {
                that.resort(ui.sender);
              } else {
                return false;
              }
            }).
            done(function () {
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
      store.clear();
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

      if (a && a.split){
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
},{"backend/Views/ContextUi/ContextRowGrid":3,"common/Ajax":8,"common/Config":10,"common/Notice":13,"common/TinyMCE":16}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
var Checks = require('common/Checks');
var Utilities = require('common/Utilities');
var Payload = require('common/Payload');
var Config = require('common/Config');
var Logger = require('common/Logger');
module.exports = Backbone.Model.extend({
  // idAttribute: "uid",
  initialize: function () {
    this.cleanUp(); //remove self from linked fields
    var module = this.get('fieldId'); // fieldId equals baseId equals the parent object id (Panel or Module)
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
    if (fieldSettings.linkedFields) {
      this.set('linkedFields', fieldSettings.linkedFields);
      this.cleanUp();
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
      }
      else if (that.FieldControlView) {
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
},{"common/Checks":9,"common/Config":10,"common/Logger":12,"common/Payload":14,"common/Utilities":18}],20:[function(require,module,exports){
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
},{"./FieldControlModel":19}],21:[function(require,module,exports){
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
},{"./FieldControlModel":19}],22:[function(require,module,exports){
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

},{"common/Config":10,"common/Utilities":18}],23:[function(require,module,exports){
var FieldControlModelModal = require('fields/FieldControlModelModal');
module.exports = Backbone.Collection.extend({
  model: FieldControlModelModal
});
},{"fields/FieldControlModelModal":20}],24:[function(require,module,exports){
module.exports = Backbone.Collection.extend({

  filterByAttr: function(attr, value){
    return this.filter(function(module){
      return (module.get(attr) === value);
    }, this);
  }

});
},{}],25:[function(require,module,exports){
var KB = window.KB || {};
KB.Events = {};
_.extend(KB, Backbone.Events);
_.extend(KB.Events, Backbone.Events);

KB.currentModule = {};
KB.currentArea = {};


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

},{"./GlobalEvents":26,"./InlineSetup":35,"./Views/AreaView":40,"./Views/LayoutAreaView":43,"./Views/ModuleView":52,"./Views/PanelView":53,"common/Checks":9,"common/Config":10,"common/Logger":12,"common/Payload":14,"common/UI":17,"fields/FieldControlsCollection":21,"frontend/AdminBar":22,"frontend/Collections/ModuleCollection":24,"frontend/Models/AreaModel":36,"frontend/Models/ModuleModel":37,"frontend/Models/PanelModel":38,"frontend/Views/EditModalModules":42,"frontend/Views/Sidebar":54,"shared/ChangeObserver":67,"shared/Collections/ObjectProxyCollection":68,"shared/ViewsCollection":80,"tether":115}],26:[function(require,module,exports){
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
},{"common/Logger":12}],27:[function(require,module,exports){
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
},{"common/Config":10,"common/Utilities":18,"frontend/Inline/InlineToolbar":30,"frontend/Inline/controls/EditImage":31,"frontend/Inline/controls/InlineUpdate":34}],28:[function(require,module,exports){
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
},{"common/Config":10,"common/Utilities":18,"frontend/Inline/InlineToolbar":30,"frontend/Inline/controls/EditLink":32,"frontend/Inline/controls/InlineUpdate":34}],29:[function(require,module,exports){
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
    this.setupDefaults();
    this.listenToOnce(this.model.get('ModuleModel'), 'remove', this.deactivate);
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
  setupDefaults: function () {
    var that = this;
    // defaults
    var defaults = {
      theme: 'inlite',
      skin: false,
      menubar: true,
      add_unload_trigger: false,
      entity_encoding: "raw",
      fixed_toolbar_container: null,
      insert_toolbar: '',
      schema: 'html5',
      inline: true,
      selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
      plugins: 'textcolor, wptextpattern,paste',
      statusbar: false,
      preview_styles: false,
      paste_as_text: true,
      setup: function (ed) {
        ed.on('init', function () {
          that.editor = ed;
          ed.module = that.model.get('ModuleModel');
          ed.kfilter = (that.model.get('filter') && that.model.get('filter') === 'content');
          KB.Events.trigger('KB::tinymce.new-inline-editor', ed);
          ed.focus();

          // jQuery('.mce-panel.mce-floatpanel').hide();
          jQuery(window).on('scroll.kbmce resize.kbmce', function () {
            jQuery('.mce-panel.mce-floatpanel').hide();
          });

        });


        ed.on('NodeChange', function (e) {
          // that.getSelection(ed, e);
          KB.Events.trigger('window.change');
        });

        ed.on('focus', function () {
          var con;
          window.wpActiveEditor = that.el.id;
          con = Utilities.getIndex(ed.module.get('entityData'), that.model.get('kpath'));
          if (ed.kfilter) {
            ed.setContent(switchEditors.wpautop(con));
          }
          ed.previousContent = ed.getContent();
          ed.module.View.$el.addClass('kb-inline-text--active');
        });

        ed.on('blur', function (e) {
          var content;
          ed.module.View.$el.removeClass('kb-inline-text--active');
          content = ed.getContent();
          // apply filter
          if (ed.kfilter) {
            content = switchEditors._wp_Nop(ed.getContent());
          }
          // get a copy of module data
          //entityData = _.clone(ed.module.get('entityData'));
          //path = that.model.get('kpath');
          //Utilities.setIndex(entityData, path, content);
          // && ed.kfilter set
          if (ed.isDirty()) {
            if (ed.kfilter) {
              that.retrieveFilteredContent(ed, content);
            } else {
              that.model.set('value', content);
              that.model.syncContent = ed.getContent();
              that.model.trigger('external.change', that.model);
              that.model.trigger('field.model.dirty', that.model);
              KB.Events.trigger('content.change');
            }
          } else {
            ed.setContent(ed.previousContent);
          }
        });
      }
    };
    this.defaults = _.extend(defaults, this.settings);
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
        ed.setContent(res.data.content);
        that.model.set('value', content);
        that.model.syncContent = ed.getContent();

        that.model.trigger('field.model.dirty', that.model);
        that.model.trigger('external.change', that.model);
        KB.Events.trigger('content.change');

        //ed.module.trigger('kb.frontend.module.inlineUpdate');
        setTimeout(function () {
          if (window.twttr) {
            window.twttr.widgets.load();
          }
          jQuery(window).off('scroll.kbmce resize.kbmce');
          ed.off('nodeChange ResizeEditor ResizeWindow');
          that.deactivate();
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
      tinymce.init(_.defaults(this.defaults, {
        selector: '#' + this.id
      }));
    }
  },
  deactivate: function () {
    if (this.editor) {
      var ed = this.editor;
      this.editor = null;
      tinyMCE.execCommand('mceRemoveEditor', true, ed.id);
      KB.Events.trigger('kb.repaint'); // @TODO figure this out
    }
  },
  cleanString: function (string) {
    return string.replace(/\s/g, '')
      .replace(/&nbsp;/g, '')
      .replace(/<br>/g, '')
      .replace(/<[^\/>][^>]*><\/[^>]+>/g, '')
      .replace(/<p><\/p>/g, '');
  },
  getSelection: function (editor, event) {
    // var sel = editor.selection.getContent();
    // var $toolbar = jQuery('.mce-panel.mce-floatpanel');
    // if (sel === '') {
    //   $toolbar.hide();
    // } else {
    //   var mpos = markSelection();
    //   var w = $toolbar.width();
    //   $toolbar.css({top: mpos.top - 40 + 'px', left: mpos.left - w + 'px'});
    //   console.log('ran');
    //   $toolbar.show();
    // }
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

var markSelection = (function () {
  var markerTextChar = "\ufeff";
  var markerTextCharEntity = "&#xfeff;";

  var markerEl, markerId = "sel_" + new Date().getTime() + "_" + Math.random().toString().substr(2);

  var selectionEl;

  return function () {
    var sel, range;
    if (document.selection && document.selection.createRange) {
      // Clone the TextRange and collapse
      range = document.selection.createRange().duplicate();
      range.collapse(false);

      // Create the marker element containing a single invisible character by creating literal HTML and insert it
      range.pasteHTML('<span id="' + markerId + '" style="position: relative;">' + markerTextCharEntity + '</span>');
      markerEl = document.getElementById(markerId);
    } else if (window.getSelection) {
      sel = window.getSelection();

      if (sel.getRangeAt) {
        range = sel.getRangeAt(0).cloneRange();
      } else {
        // Older WebKit doesn't have getRangeAt
        range.setStart(sel.anchorNode, sel.anchorOffset);
        range.setEnd(sel.focusNode, sel.focusOffset);

        // Handle the case when the selection was selected backwards (from the end to the start in the
        // document)
        if (range.collapsed !== sel.isCollapsed) {
          range.setStart(sel.focusNode, sel.focusOffset);
          range.setEnd(sel.anchorNode, sel.anchorOffset);
        }
      }

      range.collapse(false);

      // Create the marker element containing a single invisible character using DOM methods and insert it
      markerEl = document.createElement("span");
      markerEl.id = markerId;
      var $markerEl = jQuery(markerEl);
      $markerEl.prepend(document.createTextNode(markerTextChar));
      range.insertNode(markerEl);
    }

    if (markerEl) {
      // Find markerEl position http://www.quirksmode.org/js/findpos.html
      var obj = markerEl;
      var left = 0, top = 0;
      do {
        left += obj.offsetLeft;
        top += obj.offsetTop;
      } while (obj = obj.offsetParent);


      markerEl.parentNode.removeChild(markerEl);
      $markerEl.remove();


      return {
        left: left,
        top: top
      };
    }
  };
})();


module.exports = EditableText;
},{"common/Config":10,"common/Utilities":18,"frontend/Inline/InlineToolbar":30,"frontend/Inline/controls/EditText":33,"frontend/Inline/controls/InlineUpdate":34}],30:[function(require,module,exports){
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
},{"tether":115}],31:[function(require,module,exports){
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
},{"common/Checks":9}],32:[function(require,module,exports){
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
},{"common/Checks":9}],33:[function(require,module,exports){
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
    if (!this.Parent.editor){
      this.Parent.activate(e);
    }
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
},{"common/Checks":9}],34:[function(require,module,exports){
var Check = require('common/Checks');
var Config = require('common/Config');
var Logger = require('common/Logger');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.visible = false;
    this.options = options || {};
    this.Parent = options.parent;
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
    var dfr = this.model.sync(this);
    dfr.done(function (res) {
      if (res.success) {
        this.model.getClean();
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
},{"common/Checks":9,"common/Config":10,"common/Logger":12}],35:[function(require,module,exports){
// Bootstrap File
//KB.IEdit.Image.init();
//KB.IEdit.BackgroundImage.init();
var EditableText = require('frontend/Inline/EditableTextView');
var EditableLink = require('frontend/Inline/EditableLinkView');
var EditableImage = require('frontend/Inline/EditableImageView');
KB.Fields.registerObject('EditableText', EditableText);
KB.Fields.registerObject('EditableImage', EditableImage);
KB.Fields.registerObject('EditableLink', EditableLink);

},{"frontend/Inline/EditableImageView":27,"frontend/Inline/EditableLinkView":28,"frontend/Inline/EditableTextView":29}],36:[function(require,module,exports){
//KB.Backbone.AreaModel
module.exports = Backbone.Model.extend({
  defaults: {
      id: 'generic'
  },
  idAttribute: 'id'
});
},{}],37:[function(require,module,exports){
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
},{"common/Config":10,"common/Logger":12,"common/Notice":13}],38:[function(require,module,exports){
//KB.Backbone.PanelModel
var Config = require('common/Config');
var Logger = require('common/Logger');
module.exports = Backbone.Model.extend({
  idAttribute: 'baseId',
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
},{"common/Config":10,"common/Logger":12}],39:[function(require,module,exports){
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
},{"common/TinyMCE":16,"shared/ModuleBrowser/ModuleBrowserController":69}],40:[function(require,module,exports){
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
},{"common/Ajax":8,"common/Config":10,"common/Notice":13,"frontend/ModuleBrowser/ModuleBrowserExt":39,"templates/frontend/area-empty-placeholder.hbs":90}],41:[function(require,module,exports){
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
},{"common/Stack":15}],42:[function(require,module,exports){
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
},{"common/Ajax":8,"common/Config":10,"common/Logger":12,"common/Notice":13,"common/TinyMCE":16,"common/UI":17,"frontend/Collections/ModalFieldCollection":23,"frontend/Views/EditModalHistory":41,"frontend/Views/LoadingAnimation":44,"templates/frontend/module-edit-form.hbs":93}],43:[function(require,module,exports){
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
},{"common/Ajax":8,"common/Config":10,"common/Notice":13,"frontend/ModuleBrowser/ModuleBrowserExt":39,"frontend/Views/AreaView":40,"templates/frontend/area-empty-placeholder.hbs":90}],44:[function(require,module,exports){
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
},{}],45:[function(require,module,exports){
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
},{"./modulecontrols/DeleteControl":47,"./modulecontrols/DraftControl":48,"./modulecontrols/EditControl":49,"./modulecontrols/MoveControl":50,"./modulecontrols/UpdateControl":51,"templates/frontend/module-controls.hbs":92}],46:[function(require,module,exports){
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
},{}],47:[function(require,module,exports){
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
},{"common/Ajax":8,"common/Checks":9,"common/Config":10,"common/Notice":13,"frontend/Views/ModuleControls/modulecontrols/ControlsBaseView":46}],48:[function(require,module,exports){
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
},{"frontend/Views/ModuleControls/modulecontrols/ControlsBaseView":46}],49:[function(require,module,exports){
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
},{"common/Checks":9,"frontend/Views/ModuleControls/modulecontrols/ControlsBaseView":46}],50:[function(require,module,exports){
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
},{"common/Checks":9,"frontend/Views/ModuleControls/modulecontrols/ControlsBaseView":46}],51:[function(require,module,exports){
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
},{"common/Checks":9,"common/Config":10,"common/Notice":13,"frontend/Views/ModuleControls/modulecontrols/ControlsBaseView":46}],52:[function(require,module,exports){
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
},{"common/Checks":9,"frontend/Views/ModuleControls/ModuleControls":45,"shared/ModuleStatusBar/ModuleStatusBarView":77,"shared/ModuleStatusBar/status/PublishStatus":78,"shared/ModuleStatusBar/status/TemplateStatus":79,"templates/frontend/module-placeholder.hbs":94}],53:[function(require,module,exports){
module.exports = Backbone.View.extend({
  initialize: function () {
    this.model.View = this;
  },
  getDirty: function () {

  },
  getClean: function () {

  }
});
},{}],54:[function(require,module,exports){
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
},{"common/Utilities":18,"frontend/Views/Sidebar/AreaDetails/CategoryFilter":57,"frontend/Views/Sidebar/AreaOverview/AreaOverviewController":60,"frontend/Views/Sidebar/PanelOverview/PanelOverviewController":64,"frontend/Views/Sidebar/SidebarHeader":66,"templates/frontend/sidebar/sidebar-nav.hbs":105}],55:[function(require,module,exports){
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
},{"common/Ajax":8,"common/Config":10,"common/Notice":13,"frontend/Views/Sidebar/AreaDetails/CategoryController":56,"templates/frontend/sidebar/area-details-header.hbs":95}],56:[function(require,module,exports){
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
},{"frontend/Views/Sidebar/AreaDetails/ModuleDragItem":58,"templates/frontend/sidebar/category-list.hbs":96}],57:[function(require,module,exports){
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
},{"common/Payload":14}],58:[function(require,module,exports){
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
},{"common/Ajax":8,"common/Checks":9,"common/Config":10,"common/Notice":13,"common/Payload":14,"frontend/Models/ModuleModel":37,"frontend/Views/AreaView":40,"templates/frontend/sidebar/category-module-item.hbs":97}],59:[function(require,module,exports){
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
},{"frontend/Views/Sidebar/AreaDetails/AreaDetailsController":55,"frontend/Views/Sidebar/AreaOverview/ModuleListItem":61,"templates/frontend/sidebar/empty-area.hbs":98}],60:[function(require,module,exports){
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
},{"frontend/Views/Sidebar/AreaOverview/AreaListItem":59,"templates/frontend/sidebar/root-item.hbs":102,"templates/frontend/sidebar/sidebar-area-view.hbs":103}],61:[function(require,module,exports){
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

},{"templates/frontend/sidebar/module-view-item.hbs":99}],62:[function(require,module,exports){
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
},{"common/Config":10,"common/Payload":14,"common/UI":17,"templates/frontend/sidebar/option-panel-details.hbs":100}],63:[function(require,module,exports){

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

},{}],64:[function(require,module,exports){
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
},{"frontend/Views/Sidebar/PanelOverview/OptionPanelView":63,"frontend/Views/Sidebar/PanelOverview/StaticPanelView":65,"templates/frontend/sidebar/root-item.hbs":102}],65:[function(require,module,exports){
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

},{"frontend/Views/Sidebar/PanelDetails/StaticPanelFormView":62,"templates/frontend/sidebar/panel-list-item.hbs":101}],66:[function(require,module,exports){
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
},{"templates/frontend/sidebar/sidebar-header.hbs":104}],67:[function(require,module,exports){
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
},{"common/Config":10,"common/I18n":11,"common/Notice":13,"templates/frontend/change-observer.hbs":91}],68:[function(require,module,exports){
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
},{}],69:[function(require,module,exports){
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
},{"common/Ajax":8,"common/Checks":9,"common/Config":10,"common/Notice":13,"common/Payload":14,"common/TinyMCE":16,"shared/ModuleBrowser/ModuleBrowserDefinitions":70,"shared/ModuleBrowser/ModuleBrowserDescriptions":71,"shared/ModuleBrowser/ModuleBrowserNavigation":74,"shared/ModuleBrowser/ModuleDefinitionModel":76,"templates/backend/modulebrowser/module-browser.hbs":82}],70:[function(require,module,exports){
var Payload = require('common/Payload');
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
},{"common/Payload":14}],71:[function(require,module,exports){
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

},{"templates/backend/modulebrowser/module-description.hbs":83,"templates/backend/modulebrowser/module-template-description.hbs":85}],72:[function(require,module,exports){
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
},{"shared/ModuleBrowser/ModuleBrowserListItem":73}],73:[function(require,module,exports){
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
},{"templates/backend/modulebrowser/module-list-item.hbs":84,"templates/backend/modulebrowser/module-template-list-item.hbs":86,"templates/backend/modulebrowser/poster.hbs":87}],74:[function(require,module,exports){
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
},{"shared/ModuleBrowser/ModuleBrowserTabItemView":75}],75:[function(require,module,exports){
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
},{"shared/ModuleBrowser/ModuleBrowserList":72}],76:[function(require,module,exports){
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
},{}],77:[function(require,module,exports){
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
},{"backend/Views/ModuleControls/ControlsView":7}],78:[function(require,module,exports){
var BaseView = require('backend/Views/BaseControlView');
var tplPublishStatus = require('templates/backend/status/publish.hbs');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var I18n = require('common/I18n');
module.exports = BaseView.extend({
  className: 'kb-status-draft',
  events: {
    'click': 'toggleDraft'
  },
  isValid: function () {
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
},{"backend/Views/BaseControlView":1,"common/Ajax":8,"common/Config":10,"common/I18n":11,"templates/backend/status/publish.hbs":88}],79:[function(require,module,exports){
var BaseView = require('backend/Views/BaseControlView');
var tplTemplatesStatus = require('templates/backend/status/templates.hbs');
module.exports = BaseView.extend({
  controller: null,
  className: 'kb-status-templates',
  initialize: function (options) {
    this.moduleView = options.parent;
  },
  isValid: function () {
    return true;
  },
  render: function () {
    var show = (_.size(this.model.get('views')) > 1);
    var views = _.map(this.model.get('views'), function (view) {
      view.selected = (view.filename === this.model.get('viewfile')) ? 'selected="selected"' : '';
      return view;
    },this);
    this.$el.append(tplTemplatesStatus({show: show, module: this.model.toJSON(), views:views }));
  }

});
},{"backend/Views/BaseControlView":1,"templates/backend/status/templates.hbs":89}],80:[function(require,module,exports){
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
},{}],81:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"kb-context-bar grid__col grid__col--12-of-12\">\n    <div class=\"kb-context-bar--actions\">\n\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":114}],82:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"module-browser-wrapper "
    + this.escapeExpression(((helper = (helper = helpers.viewMode || (depth0 != null ? depth0.viewMode : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"viewMode","hash":{},"data":data}) : helper)))
    + "\">\n\n    <div class=\"module-browser-header module-categories\">\n        <div class=\"genericon genericon-close-alt close-browser kb-button\"></div>\n        <div class=\"dashicons dashicons-list-view module-browser--switch__list-view kb-hide\"></div>\n        <div class=\"dashicons dashicons-exerpt-view module-browser--switch__excerpt-view kb-hide\"></div>\n        <div class=\"dashicons dashicons-grid-view module-browser--switch__grid-view kb-hide\"></div>\n    </div>\n\n    <div class=\"module-browser__left-column kb-nano\">\n        <div class=\"modules-list kb-nano-content\">\n\n        </div>\n    </div>\n\n    <div class=\"module-browser__right-column kb-nano\">\n        <div class=\"module-description kb-nano-content\">\n\n        </div>\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":114}],83:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<h3>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.publicName : stack1), depth0))
    + " <div class=\"kb-button-small kb-js-create-module\">"
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.i18n : depth0)) != null ? stack1.EditScreen : stack1)) != null ? stack1.moduleBrowser : stack1)) != null ? stack1.addModule : stack1), depth0))
    + "</div>\n</h3>\n";
},"useData":true});

},{"hbsfy/runtime":114}],84:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"kbmb-icon "
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.iconclass : stack1), depth0))
    + "\"></div>\n<div class=\"kbmb-hl\">"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.name : stack1), depth0))
    + "</div>\n<div class=\"kbmb-description\">"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.description : stack1), depth0))
    + "</div>";
},"useData":true});

},{"hbsfy/runtime":114}],85:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<h3>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.parentObject : stack1)) != null ? stack1.post_title : stack1), depth0))
    + "</h3>";
},"useData":true});

},{"hbsfy/runtime":114}],86:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"dashicons dashicons-plus kb-js-create-module\"></div>\n<div class=\"kbmb-hl\">"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.parentObject : stack1)) != null ? stack1.post_title : stack1), depth0))
    + "</div>";
},"useData":true});

},{"hbsfy/runtime":114}],87:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"module-browser--poster-wrap\">\n    <img src=\""
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.poster : stack1), depth0))
    + "\" >\n</div>";
},"useData":true});

},{"hbsfy/runtime":114}],88:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "    <div class=\"kb-status-draft kb-button-small\" data-kbtooltip=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.strings : depth0)) != null ? stack1.tooltipUndraft : stack1), depth0))
    + "\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.strings : depth0)) != null ? stack1.draft : stack1), depth0))
    + "</div>\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "   <div class=\"kb-status-public kb-button-small\" data-kbtooltip=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.strings : depth0)) != null ? stack1.tooltipDraft : stack1), depth0))
    + "\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.strings : depth0)) != null ? stack1.published : stack1), depth0))
    + "</div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.draft : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true});

},{"hbsfy/runtime":114}],89:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "    <div class=\"kb-template-selector--wrapper\">\n        <div class=\"kb-selectbox\">\n            <select class=\"kb-template-select\" data-kb-rel=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.mid : stack1), depth0))
    + "\" name=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.mid : stack1), depth0))
    + "[viewfile]\">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.views : depth0),{"name":"each","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "            </select>\n        </div>\n    </div>\n";
},"2":function(depth0,helpers,partials,data) {
    var alias1=this.lambda, alias2=this.escapeExpression;

  return "                    <option "
    + alias2(alias1((depth0 != null ? depth0.selected : depth0), depth0))
    + " value=\""
    + alias2(alias1((depth0 != null ? depth0.filename : depth0), depth0))
    + "\"\n                                                data-tpldesc=\""
    + alias2(alias1((depth0 != null ? depth0.description : depth0), depth0))
    + "\">"
    + alias2(alias1((depth0 != null ? depth0.name : depth0), depth0))
    + "</option>\n";
},"4":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "    <input name=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.mid : stack1), depth0))
    + "[viewfile]\" type=\"hidden\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.viewfile : stack1), depth0))
    + "\">\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.show : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(4, data, 0),"data":data})) != null ? stack1 : "")
    + "\n";
},"useData":true});

},{"hbsfy/runtime":114}],90:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"kb-area__empty-placeholder\">\n    <div class=\"kb-module-trigger\">"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.i18n : depth0)) != null ? stack1.jsFrontend : stack1)) != null ? stack1.onpage : stack1)) != null ? stack1.placeholder : stack1), depth0))
    + "</div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":114}],91:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div>"
    + ((stack1 = this.lambda(((stack1 = (depth0 != null ? depth0.strings : depth0)) != null ? stack1.feedback : stack1), depth0)) != null ? stack1 : "")
    + "</div>";
},"useData":true});

},{"hbsfy/runtime":114}],92:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    return " kb-dynamic-module ";
},"3":function(depth0,helpers,partials,data) {
    return " global-module ";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div data-kb-mcontrols=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.model : depth0)) != null ? stack1.mid : stack1), depth0))
    + "\" class='kb-module-controls "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.model : depth0)) != null ? stack1.inDynamic : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.model : depth0)) != null ? stack1.globalModule : stack1),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "'>\n    <div class=\"kb-controls-wrap\"></div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":114}],93:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"controls-title\">Module: <span> "
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.model : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.name : stack1), depth0))
    + "</span></div>\n<div class=\"dashicons dashicons-no close-controls kb-button\"></div>\n<div class=\"kb-controls--buttons-wrap\">\n    <div class=\"kb-modal-history-back kb-button kb-button-secondary\">&laquo; previous module</div>\n    <div class=\"kb-save-form kb-button kb-button-primary\" title=\""
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.i18n : depth0)) != null ? stack1.frontendModal : stack1)) != null ? stack1.modalSave : stack1), depth0))
    + "\">\n        <div class=\"dashicons dashicons-update\"></div>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.i18n : depth0)) != null ? stack1.frontendModal : stack1)) != null ? stack1.modalSave : stack1), depth0))
    + "<span\n            class=\"kb-dirty-notice\">*</span></div>\n    <div class=\"kb-preview-form kb-button kb-button-secondary\">"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.i18n : depth0)) != null ? stack1.frontendModal : stack1)) != null ? stack1.modalPreview : stack1), depth0))
    + "</div>\n\n</div>\n<form id=\"onsite-form\" class=\"wp-core-ui wp-admin kb-nano\">\n    <div class=\"kb-nano-content\" id=\"onsite-content\">\n\n        <div class=\"os-content-inner kb-module\">\n\n        </div>\n    </div>\n</form>";
},"useData":true});

},{"hbsfy/runtime":114}],94:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"kb-module__placeholder\">\n    <p>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.model : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.name : stack1), depth0))
    + "\n    <span>Start here.</span>\n    </p>\n</div>";
},"useData":true});

},{"hbsfy/runtime":114}],95:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"kb-sidebar__subheader\">\n    <span>You are editing area:</span> "
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n</div>\n<div class=\"kb-sidebar-area-details__settings\" style=\"display: none\">\n\n</div>\n<!--<div class=\"kb-sidebar-area-details__subheader\">Categories</div>-->";
},"useData":true});

},{"hbsfy/runtime":114}],96:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"kb-sidebar__category-item\">\n    <div class=\"kb-sidebar__category-item__title\">\n        Category: "
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n    </div>\n    <div class=\"kb-sidebar__category-item__module-list\">\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":114}],97:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"kb-sidebar__cat-module-item\">\n    "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.settings : depth0)) != null ? stack1.name : stack1), depth0))
    + "\n    <div class=\"kb-sidebar__cat-module-item__actions\">\n    </div>\n</div>\n";
},"useData":true});

},{"hbsfy/runtime":114}],98:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<li class=\"kb-sidebar__no-modules\">No Modules attached yet</li>";
},"useData":true});

},{"hbsfy/runtime":114}],99:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"kb-sidebar-item__wrapper\">\n    <div class=\"kb-sidebar-item__name\">"
    + ((stack1 = alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.view : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.name : stack1), depth0)) != null ? stack1 : "")
    + "</div>\n    <div class=\"kb-sidebar-item__id\">"
    + ((stack1 = alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.view : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.id : stack1), depth0)) != null ? stack1 : "")
    + "</div>\n</div>\n<div class=\"kb-sidebar-item__actions\">\n    <a class='kb-sidebar-item__edit' title='edit'\n       data='"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.view : depth0)) != null ? stack1.mid : stack1), depth0))
    + "' data-url='"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.view : depth0)) != null ? stack1.editURL : stack1), depth0))
    + "'>\n        <span class=\"dashicons dashicons-edit\"></span>\n        <span class=\"os-action\">"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.i18n : depth0)) != null ? stack1.moduleControls : stack1)) != null ? stack1.controlsEdit : stack1), depth0))
    + "</span></a>\n    <a class='kb-sidebar__module-delete kb-js-inline-delete'><span\n            class=\"dashicons dashicons-trash\"></span></a>\n    <a class='kb-sidebar__module-update kb-js-inline-update'><span\n            class=\"dashicons dashicons-update\"></span></a>\n\n</div>";
},"useData":true});

},{"hbsfy/runtime":114}],100:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"kb-sidebar__header-wrap\">\n    <div class=\"kb-sidebar__subheader\">\n        "
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n    </div>\n    <span class=\"genericon genericon-close-alt kb-sidebar-action--close\"></span>\n    <div class=\"kb-sidebar-action--update kb-fx-button kb-fx-button--effect-boris\"><span class=\"dashicons dashicons-update\"></span></div>\n\n</div>\n<form class=\"kb-sidebar__form-container\">\n\n</form>\n";
},"useData":true});

},{"hbsfy/runtime":114}],101:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"kb-sidebar--panel-item kb-sidebar__item\">\n    "
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n</div>";
},"useData":true});

},{"hbsfy/runtime":114}],102:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"kb-sidebar__item kb-sidebar__item--root\" data-kb-action=\""
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n    "
    + alias3(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"text","hash":{},"data":data}) : helper)))
    + "\n    <span class=\"dashicons dashicons-arrow-right-alt2 kb-sidebar__add-module kb-js-sidebar-add-module\"></span>\n\n</div>";
},"useData":true});

},{"hbsfy/runtime":114}],103:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"kb-sidebar-areaview kb-sidebar-areaview--inactive\">\n    <div class=\"kb-sidebar-areaview__title\"> "
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</div>\n    <span class=\"dashicons dashicons-arrow-right-alt2 kb-sidebar__add-module kb-js-sidebar-add-module\"></span>\n</div>";
},"useData":true});

},{"hbsfy/runtime":114}],104:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"kb-sidebar__header-wrap\">\n    <div class=\"kb-sidebar__subheader\">\n        Kontentblocks\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":114}],105:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"kb-sidebar__nav-controls\">\n    <div class=\"kb-sidebar__nav-button kb-js-sidebar-nav-back\">\n        <span class=\"dashicons dashicons-arrow-left-alt2 cbutton cbutton--effect-boris\"></span>\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":114}],106:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;

var _import = require('./handlebars/base');

var base = _interopRequireWildcard(_import);

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)

var _SafeString = require('./handlebars/safe-string');

var _SafeString2 = _interopRequireWildcard(_SafeString);

var _Exception = require('./handlebars/exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var _import2 = require('./handlebars/utils');

var Utils = _interopRequireWildcard(_import2);

var _import3 = require('./handlebars/runtime');

var runtime = _interopRequireWildcard(_import3);

var _noConflict = require('./handlebars/no-conflict');

var _noConflict2 = _interopRequireWildcard(_noConflict);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = _SafeString2['default'];
  hb.Exception = _Exception2['default'];
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

_noConflict2['default'](inst);

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];
},{"./handlebars/base":107,"./handlebars/exception":108,"./handlebars/no-conflict":109,"./handlebars/runtime":110,"./handlebars/safe-string":111,"./handlebars/utils":112}],107:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;
exports.HandlebarsEnvironment = HandlebarsEnvironment;
exports.createFrame = createFrame;

var _import = require('./utils');

var Utils = _interopRequireWildcard(_import);

var _Exception = require('./exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var VERSION = '3.0.1';
exports.VERSION = VERSION;
var COMPILER_REVISION = 6;

exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1'
};

exports.REVISION_CHANGES = REVISION_CHANGES;
var isArray = Utils.isArray,
    isFunction = Utils.isFunction,
    toString = Utils.toString,
    objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials) {
  this.helpers = helpers || {};
  this.partials = partials || {};

  registerDefaultHelpers(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: logger,
  log: log,

  registerHelper: function registerHelper(name, fn) {
    if (toString.call(name) === objectType) {
      if (fn) {
        throw new _Exception2['default']('Arg not supported with multiple helpers');
      }
      Utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (toString.call(name) === objectType) {
      Utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _Exception2['default']('Attempting to register a partial as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  }
};

function registerDefaultHelpers(instance) {
  instance.registerHelper('helperMissing', function () {
    if (arguments.length === 1) {
      // A missing field in a {{foo}} constuct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _Exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });

  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (isArray(context)) {
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
        var data = createFrame(options.data);
        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
        options = { data: data };
      }

      return fn(context, options);
    }
  });

  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _Exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = createFrame(options.data);
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
        blockParams: Utils.blockParams([context[field], field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (isArray(context)) {
        for (var j = context.length; i < j; i++) {
          execIteration(i, i, i === context.length - 1);
        }
      } else {
        var priorKey = undefined;

        for (var key in context) {
          if (context.hasOwnProperty(key)) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          }
        }
        if (priorKey) {
          execIteration(priorKey, i - 1, true);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });

  instance.registerHelper('if', function (conditional, options) {
    if (isFunction(conditional)) {
      conditional = conditional.call(this);
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (!options.hash.includeZero && !conditional || Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function (conditional, options) {
    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
  });

  instance.registerHelper('with', function (context, options) {
    if (isFunction(context)) {
      context = context.call(this);
    }

    var fn = options.fn;

    if (!Utils.isEmpty(context)) {
      if (options.data && options.ids) {
        var data = createFrame(options.data);
        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
        options = { data: data };
      }

      return fn(context, options);
    } else {
      return options.inverse(this);
    }
  });

  instance.registerHelper('log', function (message, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, message);
  });

  instance.registerHelper('lookup', function (obj, field) {
    return obj && obj[field];
  });
}

var logger = {
  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

  // State enum
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  level: 1,

  // Can be overridden in the host environment
  log: function log(level, message) {
    if (typeof console !== 'undefined' && logger.level <= level) {
      var method = logger.methodMap[level];
      (console[method] || console.log).call(console, message); // eslint-disable-line no-console
    }
  }
};

exports.logger = logger;
var log = logger.log;

exports.log = log;

function createFrame(object) {
  var frame = Utils.extend({}, object);
  frame._parent = object;
  return frame;
}

/* [args, ]options */
},{"./exception":108,"./utils":112}],108:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var loc = node && node.loc,
      line = undefined,
      column = undefined;
  if (loc) {
    line = loc.start.line;
    column = loc.start.column;

    message += ' - ' + line + ':' + column;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }

  if (loc) {
    this.lineNumber = line;
    this.column = column;
  }
}

Exception.prototype = new Error();

exports['default'] = Exception;
module.exports = exports['default'];
},{}],109:[function(require,module,exports){
'use strict';

exports.__esModule = true;
/*global window */

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  var root = typeof global !== 'undefined' ? global : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
  };
};

module.exports = exports['default'];
},{}],110:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;
exports.checkRevision = checkRevision;

// TODO: Remove this line and break up compilePartial

exports.template = template;
exports.wrapProgram = wrapProgram;
exports.resolvePartial = resolvePartial;
exports.invokePartial = invokePartial;
exports.noop = noop;

var _import = require('./utils');

var Utils = _interopRequireWildcard(_import);

var _Exception = require('./exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var _COMPILER_REVISION$REVISION_CHANGES$createFrame = require('./base');

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = _COMPILER_REVISION$REVISION_CHANGES$createFrame.COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[currentRevision],
          compilerVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[compilerRevision];
      throw new _Exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new _Exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
    }
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _Exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _Exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
    }

    partial = env.VM.resolvePartial.call(this, partial, context, options);
    var result = env.VM.invokePartial.call(this, partial, context, options);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, options);
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
      throw new _Exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name) {
      if (!(name in obj)) {
        throw new _Exception2['default']('"' + name + '" not defined in ' + obj);
      }
      return obj[name];
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        if (depths[i] && depths[i][name] != null) {
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
      return templateSpec[i];
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
    merge: function merge(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      depths = options.depths ? [context].concat(options.depths) : [context];
    }

    return templateSpec.main.call(container, context, container.helpers, container.partials, data, blockParams, depths);
  }
  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      container.helpers = container.merge(options.helpers, env.helpers);

      if (templateSpec.usePartial) {
        container.partials = container.merge(options.partials, env.partials);
      }
    } else {
      container.helpers = options.helpers;
      container.partials = options.partials;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _Exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _Exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    return fn.call(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), depths && [context].concat(depths));
  }
  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

function resolvePartial(partial, context, options) {
  if (!partial) {
    partial = options.partials[options.name];
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  options.partial = true;

  if (partial === undefined) {
    throw new _Exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? _COMPILER_REVISION$REVISION_CHANGES$createFrame.createFrame(data) : {};
    data.root = context;
  }
  return data;
}
},{"./base":107,"./exception":108,"./utils":112}],111:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports['default'] = SafeString;
module.exports = exports['default'];
},{}],112:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.extend = extend;

// Older IE versions do not directly support indexOf so we must implement our own, sadly.
exports.indexOf = indexOf;
exports.escapeExpression = escapeExpression;
exports.isEmpty = isEmpty;
exports.blockParams = blockParams;
exports.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#x27;',
  '`': '&#x60;'
};

var badChars = /[&<>"'`]/g,
    possible = /[&<>"'`]/;

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
/*eslint-disable func-style, no-var */
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
var isFunction;
exports.isFunction = isFunction;
/*eslint-enable func-style, no-var */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};exports.isArray = isArray;

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

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}
},{}],113:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime')['default'];

},{"./dist/cjs/handlebars.runtime":106}],114:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":113}],115:[function(require,module,exports){
/*! tether 1.2.0 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require, exports, module);
  } else {
    root.Tether = factory();
  }
}(this, function(require, exports, module) {

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var TetherBase = undefined;
if (typeof TetherBase === 'undefined') {
  TetherBase = { modules: [] };
}

function getScrollParent(el) {
  // In firefox if the el is inside an iframe with display: none; window.getComputedStyle() will return null;
  // https://bugzilla.mozilla.org/show_bug.cgi?id=548397
  var computedStyle = getComputedStyle(el) || {};
  var position = computedStyle.position;

  if (position === 'fixed') {
    return el;
  }

  var parent = el;
  while (parent = parent.parentNode) {
    var style = undefined;
    try {
      style = getComputedStyle(parent);
    } catch (err) {}

    if (typeof style === 'undefined' || style === null) {
      return parent;
    }

    var _style = style;
    var overflow = _style.overflow;
    var overflowX = _style.overflowX;
    var overflowY = _style.overflowY;

    if (/(auto|scroll)/.test(overflow + overflowY + overflowX)) {
      if (position !== 'absolute' || ['relative', 'absolute', 'fixed'].indexOf(style.position) >= 0) {
        return parent;
      }
    }
  }

  return document.body;
}

var uniqueId = (function () {
  var id = 0;
  return function () {
    return ++id;
  };
})();

var zeroPosCache = {};
var getOrigin = function getOrigin(doc) {
  // getBoundingClientRect is unfortunately too accurate.  It introduces a pixel or two of
  // jitter as the user scrolls that messes with our ability to detect if two positions
  // are equivilant or not.  We place an element at the top left of the page that will
  // get the same jitter, so we can cancel the two out.
  var node = doc._tetherZeroElement;
  if (typeof node === 'undefined') {
    node = doc.createElement('div');
    node.setAttribute('data-tether-id', uniqueId());
    extend(node.style, {
      top: 0,
      left: 0,
      position: 'absolute'
    });

    doc.body.appendChild(node);

    doc._tetherZeroElement = node;
  }

  var id = node.getAttribute('data-tether-id');
  if (typeof zeroPosCache[id] === 'undefined') {
    zeroPosCache[id] = {};

    var rect = node.getBoundingClientRect();
    for (var k in rect) {
      // Can't use extend, as on IE9, elements don't resolve to be hasOwnProperty
      zeroPosCache[id][k] = rect[k];
    }

    // Clear the cache when this position call is done
    defer(function () {
      delete zeroPosCache[id];
    });
  }

  return zeroPosCache[id];
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

  var box = {};
  // The original object returned by getBoundingClientRect is immutable, so we clone it
  // We can't use extend because the properties are not considered part of the object by hasOwnProperty in IE9
  var rect = el.getBoundingClientRect();
  for (var k in rect) {
    box[k] = rect[k];
  }

  var origin = getOrigin(doc);

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

function getScrollBarSize() {
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

  return { width: width, height: width };
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
  if (el.className instanceof SVGAnimatedString) {
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
      if (typeof this.bindings !== 'undefined' && typeof this.bindings[event] !== 'undefined') {
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
  getScrollParent: getScrollParent,
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
  getScrollBarSize: getScrollBarSize
};
/* globals TetherBase, performance */

'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

if (typeof TetherBase === 'undefined') {
  throw new Error('You must include the utils.js file before tether.js');
}

var _TetherBase$Utils = TetherBase.Utils;
var getScrollParent = _TetherBase$Utils.getScrollParent;
var getBounds = _TetherBase$Utils.getBounds;
var getOffsetParent = _TetherBase$Utils.getOffsetParent;
var extend = _TetherBase$Utils.extend;
var addClass = _TetherBase$Utils.addClass;
var removeClass = _TetherBase$Utils.removeClass;
var updateClasses = _TetherBase$Utils.updateClasses;
var defer = _TetherBase$Utils.defer;
var flush = _TetherBase$Utils.flush;
var getScrollBarSize = _TetherBase$Utils.getScrollBarSize;

function within(a, b) {
  var diff = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  return a + diff >= b && b >= a - diff;
}

var transformKey = (function () {
  if (typeof document === 'undefined') {
    return '';
  }
  var el = document.createElement('div');

  var transforms = ['transform', 'webkitTransform', 'OTransform', 'MozTransform', 'msTransform'];
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
  if (typeof performance !== 'undefined' && typeof performance.now !== 'undefined') {
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

    if (typeof pendingTimeout !== 'undefined') {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }

    lastCall = now();
    position();
    lastDuration = now() - lastCall;
  };

  if (typeof window !== 'undefined') {
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

var TetherClass = (function () {
  function TetherClass(options) {
    var _this = this;

    _classCallCheck(this, TetherClass);

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

      if (typeof this.scrollParent !== 'undefined') {
        this.disable();
      }

      if (this.targetModifier === 'scroll-handle') {
        this.scrollParent = this.target;
      } else {
        this.scrollParent = getScrollParent(this.target);
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
      var pos = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      if (!(this.options.addTargetClasses === false)) {
        addClass(this.target, this.getClass('enabled'));
      }
      addClass(this.element, this.getClass('enabled'));
      this.enabled = true;

      if (this.scrollParent !== document) {
        this.scrollParent.addEventListener('scroll', this.position);
      }

      if (pos) {
        this.position();
      }
    }
  }, {
    key: 'disable',
    value: function disable() {
      removeClass(this.target, this.getClass('enabled'));
      removeClass(this.element, this.getClass('enabled'));
      this.enabled = false;

      if (typeof this.scrollParent !== 'undefined') {
        this.scrollParent.removeEventListener('scroll', this.position);
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var _this3 = this;

      this.disable();

      tethers.forEach(function (tether, i) {
        if (tether === _this3) {
          tethers.splice(i, 1);
          return;
        }
      });
    }
  }, {
    key: 'updateAttachClasses',
    value: function updateAttachClasses(elementAttach, targetAttach) {
      var _this4 = this;

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
        all.push(_this4.getClass('element-attached') + '-' + side);
        all.push(_this4.getClass('target-attached') + '-' + side);
      });

      defer(function () {
        if (!(typeof _this4._addAttachClasses !== 'undefined')) {
          return;
        }

        updateClasses(_this4.element, _this4._addAttachClasses, all);
        if (!(_this4.options.addTargetClasses === false)) {
          updateClasses(_this4.target, _this4._addAttachClasses, all);
        }

        delete _this4._addAttachClasses;
      });
    }
  }, {
    key: 'position',
    value: function position() {
      var _this5 = this;

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
        return getBounds(_this5.element);
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
        return _this5.getTargetBounds();
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

      var scrollbarSize = undefined;
      if (document.body.scrollWidth > window.innerWidth) {
        scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
        next.viewport.bottom -= scrollbarSize.height;
      }

      if (document.body.scrollHeight > window.innerHeight) {
        scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
        next.viewport.right -= scrollbarSize.width;
      }

      if (['', 'static'].indexOf(document.body.style.position) === -1 || ['', 'static'].indexOf(document.body.parentElement.style.position) === -1) {
        // Absolute positioning in the body will be relative to the page, not the 'initial containing block'
        next.page.bottom = document.body.scrollHeight - top - height;
        next.page.right = document.body.scrollWidth - left - width;
      }

      if (typeof this.options.optimizations !== 'undefined' && this.options.optimizations.moveElement !== false && !(typeof this.targetModifier !== 'undefined')) {
        (function () {
          var offsetParent = _this5.cache('target-offsetparent', function () {
            return getOffsetParent(_this5.target);
          });
          var offsetPosition = _this5.cache('target-offsetparent-bounds', function () {
            return getBounds(offsetParent);
          });
          var offsetParentStyle = getComputedStyle(offsetParent);
          var offsetParentSize = offsetPosition;

          var offsetBorder = {};
          ['Top', 'Left', 'Bottom', 'Right'].forEach(function (side) {
            offsetBorder[side.toLowerCase()] = parseFloat(offsetParentStyle['border' + side + 'Width']);
          });

          offsetPosition.right = document.body.scrollWidth - offsetPosition.left - offsetParentSize.width + offsetBorder.right;
          offsetPosition.bottom = document.body.scrollHeight - offsetPosition.top - offsetParentSize.height + offsetBorder.bottom;

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
      var _this6 = this;

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
        var hasOptimizations = typeof _this6.options.optimizations !== 'undefined';
        var gpu = hasOptimizations ? _this6.options.optimizations.gpu : null;
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

          css[transformKey] = 'translateX(' + Math.round(xPos) + 'px) translateY(' + Math.round(yPos) + 'px)';

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
          var offsetParent = _this6.cache('target-offsetparent', function () {
            return getOffsetParent(_this6.target);
          });

          if (getOffsetParent(_this6.element) !== offsetParent) {
            defer(function () {
              _this6.element.parentNode.removeChild(_this6.element);
              offsetParent.appendChild(_this6.element);
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
        var offsetParentIsBody = true;
        var currentNode = this.element.parentNode;
        while (currentNode && currentNode.tagName !== 'BODY') {
          if (getComputedStyle(currentNode).position !== 'static') {
            offsetParentIsBody = false;
            break;
          }

          currentNode = currentNode.parentNode;
        }

        if (!offsetParentIsBody) {
          this.element.parentNode.removeChild(this.element);
          document.body.appendChild(this.element);
        }
      }

      // Any css change will trigger a repaint, so let's avoid one if nothing changed
      var writeCSS = {};
      var write = false;
      for (var key in css) {
        var val = css[key];
        var elVal = this.element.style[key];

        if (elVal !== '' && val !== '' && ['top', 'left', 'bottom', 'right'].indexOf(key) >= 0) {
          elVal = parseFloat(elVal);
          val = parseFloat(val);
        }

        if (elVal !== val) {
          write = true;
          writeCSS[key] = val;
        }
      }

      if (write) {
        defer(function () {
          extend(_this6.element.style, writeCSS);
        });
      }
    }
  }]);

  return TetherClass;
})();

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
    to = tether.scrollParent;
  } else if (to === 'window') {
    to = [pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset];
  }

  if (to === document) {
    to = to.documentElement;
  }

  if (typeof to.nodeType !== 'undefined') {
    (function () {
      var size = getBounds(to);
      var pos = size;
      var style = getComputedStyle(to);

      to = [pos.left, pos.top, size.width + pos.left, size.height + pos.top];

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
        if (top < bounds[1] && tAttachment.top === 'top') {
          if (eAttachment.top === 'bottom') {
            top += targetHeight;
            tAttachment.top = 'bottom';

            top += height;
            eAttachment.top = 'top';
          } else if (eAttachment.top === 'top') {
            top += targetHeight;
            tAttachment.top = 'bottom';

            top -= height;
            eAttachment.top = 'bottom';
          }
        }

        if (top + height > bounds[3] && tAttachment.top === 'bottom') {
          if (eAttachment.top === 'top') {
            top -= targetHeight;
            tAttachment.top = 'top';

            top -= height;
            eAttachment.top = 'bottom';
          } else if (eAttachment.top === 'bottom') {
            top -= targetHeight;
            tAttachment.top = 'top';

            top += height;
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

},{}]},{},[25]);
