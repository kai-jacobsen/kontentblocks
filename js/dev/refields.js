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


},{"backend/Views/ContextUi/ContextColumnView":2,"backend/Views/ContextUi/ContextUiView":4,"backend/Views/ContextUi/controls/ColumnControl":5,"backend/Views/ContextUi/controls/ResetControl":6,"templates/backend/context-bar.hbs":63}],4:[function(require,module,exports){
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
    var st = jQuery(window).scrollTop();
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
    var offset = this.$el.offset();

    this.$el.css('top', offset.top + st + 'px');

  },
  close: function () {
    TinyMCE.removeEditors();
    jQuery('#wpwrap').removeClass('module-browser-open');
    this.$body.detach().appendTo(this.$parent);
    this.$backdrop.remove();
    this.$fswrap.remove();
    this.$el.detach();
    setTimeout(function () {
      TinyMCE.restoreEditors();
    }, 250);
    this.trigger('close');
  }
});
},{"common/TinyMCE":17,"common/UI":18,"templates/backend/fullscreen-inner.hbs":64}],8:[function(require,module,exports){
/**
 * Creates the individual module-actions menu
 * like: duplicate, delete, status
 */
//KB.Backbone.Backend.ModuleControlsView
var tplModuleMenu = require('templates/backend/module-menu.hbs');
module.exports = Backbone.View.extend({
  id: '',
  $menuWrap: {}, // wrap container jQuery element
  $menuList: {}, // ul item
  initialize: function () {
    this.$menuWrap = jQuery('.menu-wrap', this.$el); //set outer element
    this.$menuWrap.append(tplModuleMenu({})); // render template
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
      var $liItem = jQuery('<li></li>').appendTo(this.$menuList);
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
},{"templates/backend/module-menu.hbs":65}],9:[function(require,module,exports){
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
},{"common/Notice":14}],10:[function(require,module,exports){
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
},{"common/Config":11}],11:[function(require,module,exports){
var Config = (function ($) {
  var config = KB.appData.config;
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
},{}],12:[function(require,module,exports){
var Utilities = require('common/Utilities');
module.exports = {
  getString: function (path) {
    if (!path || !KB || !KB.i18n) {
      return null;
    }
    return Utilities.getIndex(KB.i18n, path);
  }
};
},{"common/Utilities":19}],13:[function(require,module,exports){
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
},{"common/Config":11}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
//KB.Templates
var Config = require('common/Config');
var Utilities = require('common/Utilities');
var Handlebars = require('hbsfy/runtime');
var Templates = (function () {
  var templateCache = {};
  var helpfileCache = {};

  function getTmplCache() {
    return templateCache;
  }

  function render(tplName, tplData, done, scope) {
    var callback, tplString;
    tplData = tplData || {};
    scope = scope || this;
    callback = done || null;
    if (!templateCache[tplName]) {
      var tplDir = Config.getRootURL() + 'js/templates';
      var tplUrl = tplDir + '/' + tplName + '.hbs?' + Config.getHash();

      // if a full url is given, tplUrl will be overwritten
      var pat = /^https?:\/\//i;
      if (pat.test(tplName)) {
        tplUrl = tplName;
      }

      // read from local storage if available
      if (Utilities.stex.get(tplUrl)) {
        tplString = Utilities.stex.get(tplUrl);
        if (callback) {
          callback.call(scope)
        }
      } else {
        // load fresh file
        jQuery.ajax({
          url: tplUrl,
          method: 'GET',
          async: false,
          success: function (data) {
            tplString = data;
            Utilities.stex.set(tplUrl, tplString, 2 * 1000 * 60);
            if (callback) {
              callback.call(scope)
            }
          }
        });
      }
      templateCache[tplName] = Handlebars.compile(tplString);
    }
    return templateCache[tplName](tplData);
  }


  /*
   * Deprecated
   */
  function helpfile(helpfileUrl) {
    if (!helpfileCache[helpfileUrl]) {

      var helpfileString;
      jQuery.ajax({
        url: helpfileUrl,
        method: 'GET',
        async: false,
        dataType: 'html',
        success: function (data) {
          helpfileString = data;
        }
      });

      helpfileCache[helpfileUrl] = helpfileUrl;
    }
    return helpfileCache[helpfileUrl];
  }

  return {
    render: render,
    helpfile: helpfile
  };
}());
module.exports = Templates;
},{"common/Config":11,"common/Utilities":19,"hbsfy/runtime":110}],17:[function(require,module,exports){
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
          KB.Events.trigger('KB::tinymce.new-editor', ed);
        });
        ed.on('change', function () {
          var $module, moduleView;
          if (!ed.module) {
            $module = jQuery(ed.editorContainer).closest('.kb-module');
            ed.module = KB.Views.Modules.get($module.attr('id'));
          }

          if (ed.module) {
            ed.module.$el.trigger('tinymce.change');
          }

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
},{"common/Ajax":9,"common/Config":11,"common/Logger":13}],18:[function(require,module,exports){
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
    $body.on('mousedown', '.kb_field', function (e) {
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
    var selector = $('.kb_fieldtabs', $context);
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
    function
    isValidModule() {

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
    }).disableSelection();
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
};
module.exports = Ui;
},{"backend/Views/ContextUi/ContextRowGrid":3,"common/Ajax":9,"common/Config":11,"common/Notice":14,"common/TinyMCE":17}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
//KB.Fields.BaseView
module.exports = Backbone.View.extend({
  rerender: function(){
    this.render();
  },
  gone: function () {
    this.trigger('field.view.gone', this);
    this.derender();
  },
  toString: function(){
    return '';
  }
});

},{}],21:[function(require,module,exports){
var Checks = require('common/Checks');
var Utilities = require('common/Utilities');
var Payload = require('common/Payload');
var Config = require('common/Config');
var Logger = require('common/Logger');
module.exports = Backbone.Model.extend({
  idAttribute: "uid",
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
    this.listenToOnce(this.ModuleModel, 'remove', this.remove); // delete this from collection when parent obj leaves
    this.listenTo(this.ModuleModel, 'change:entityData', this.setData); // reassign data when parent obj data changes
    this.listenTo(this.ModuleModel, 'module.model.updated', this.getClean); // set state to clean
    this.listenTo(this, 'change:value', this.upstreamData); // assign new data to parent obj when this data changes
    this.listenTo(this.ModuleModel, 'modal.serialize.before', this.unbind); // before the frontend modal reloads the parent obj
    this.listenTo(this.ModuleModel, 'modal.serialize', this.rebind); // frontend modal reloaded parent obj, reattach handlers
    this.listenTo(this.ModuleModel, 'change:area', this.unbind); // parent obj was dragged to new area, detach handlers
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
    mData = Utilities.getIndex(ModuleModel.get('entityData'), this.get('kpath'));
    this.set('value', _.extend(mData, addData)); // set merged data to this.value
  },
  // since this data is only the data of a specific field we can upstream this data to the whole module data
  upstreamData: function () {
    var ModuleModel;
    if (ModuleModel = this.get('ModuleModel')) {
      var cdata = _.clone(this.get('ModuleModel').get('entityData'));
      Utilities.setIndex(cdata, this.get('kpath'), this.get('value'));
      ModuleModel.set('entityData', cdata, {silent: false});
      ModuleModel.View.getDirty();

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
  }
});
},{"common/Checks":10,"common/Config":11,"common/Logger":13,"common/Payload":15,"common/Utilities":19}],22:[function(require,module,exports){
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
},{"./FieldControlModel":21}],23:[function(require,module,exports){
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
},{"common/Logger":13}],24:[function(require,module,exports){
var Fields = require('./Fields');
window.KB.Fields = Fields;
Fields.registerObject('color', require('./controls/color'));
Fields.registerObject('datetime', require('./controls/datetime'));
Fields.registerObject('file', require('./controls/file'));
Fields.registerObject('flexfields', require('./controls/flexfields'));
Fields.registerObject('gallery', require('./controls/gallery'));
Fields.registerObject('gallery2', require('./controls/gallery2'));
Fields.registerObject('image', require('./controls/image'));
Fields.registerObject('link', require('./controls/link'));
Fields.registerObject('textarea', require('./controls/textarea'));
Fields.registerObject('text', require('./controls/text'));
Fields.registerObject('tagsinput', require('./controls/tagsinput'));
Fields.registerObject('multiselect', require('./controls/multiselect'));
Fields.registerObject('editor', require('./controls/editor'));
Fields.registerObject('otimes', require('./controls/otimes'));
Fields.registerObject('mlayout', require('./controls/mlayout'));
},{"./Fields":23,"./controls/color":25,"./controls/datetime":26,"./controls/editor":27,"./controls/file":28,"./controls/flexfields":29,"./controls/gallery":35,"./controls/gallery2":38,"./controls/image":41,"./controls/link":42,"./controls/mlayout":43,"./controls/multiselect":50,"./controls/otimes":51,"./controls/tagsinput":52,"./controls/text":53,"./controls/textarea":54}],25:[function(require,module,exports){
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
},{"../FieldControlBaseView":20}],26:[function(require,module,exports){
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
    this.$('.kb-datetimepicker').datetimepicker(_.extend(this.defaults, this.settings));
  },
  derender: function () {
    this.$('.kb-datetimepicker').datetimepicker('destroy');
  }
});
},{"../FieldControlBaseView":20}],27:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
var TinyMCE = require('common/TinyMCE');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    this.$textarea = this.$('textarea');
    tinymce.on('AddEditor', function (event) {
      var editor = event.editor;
      if (editor && editor.id === that.$textarea.attr('id') && !that.editor) {
        that.editor = editor;
        editor.on('change', function () {
          that.update(editor.getContent());
        });
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
  toString: function(){
    if (this.editor){
      return this.editor.getContent();
    }
    return '';
  }
});
},{"../FieldControlBaseView":20,"common/TinyMCE":17}],28:[function(require,module,exports){
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
    if (this.frame){
      return this.frame.open();
    }

    this.frame = wp.media({
      title: KB.i18n.Refields.file.modalTitle,
      button: {
        text: KB.i18n.Refields.common.select
      },
      multiple: false,
      library: {
        type: ''
      }
    });
    this.frame.on('ready', function(){
      that.ready(this);
    });
    this.frame.state('library').on('select', function(){
      that.select(this);
    });
    return this.frame.open();
  },
  ready: function (frame) {
    this.$('.media-modal').addClass(' smaller no-sidebar');
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
    this.$container.show(450, function(){
      KB.Events.trigger('modal.recalibrate');
    });
  },
  reset: function () {
    this.$IdIn.val('');
    this.$container.hide(450);
    this.$resetIn.hide();
  }
});

},{"../FieldControlBaseView":20}],29:[function(require,module,exports){
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
},{"../FieldControlBaseView":20,"fields/controls/flexfields/FlexfieldsController":32}],30:[function(require,module,exports){
var FlexFieldModelModal = require('fields/FieldControlModelModal');
module.exports = Backbone.Collection.extend({
  model: FlexFieldModelModal
});
},{"fields/FieldControlModelModal":22}],31:[function(require,module,exports){
module.exports = Backbone.View.extend({

  initialize: function (options) {
    this.controller = options.controller;
    this.sections = this.model.get('fields');

  },
  factorNewItem: function (data, uid, title) {
    var itemId = uid || _.uniqueId('ff2');
    title = title || prompt("Enter a title : ", itemId);


    var sections = _.clone(this.sections);
    _.each(sections, function (section) {
      _.each(section.fields, function (field) {
        var fielddata = (data && data[field.key]) ? data[field.key] : field.std;
        var itemData = _.extend(field, {
          value: fielddata || '',
          arrayKey: this.model.get('arrayKey'),
          fieldkey: this.model.get('fieldkey'),
          primeKey: field.key,
          fieldId: this.model.get('fieldId'),
          index: itemId,
          type: field.type
        });
        field.view = KB.FieldsAPI.getRefByType(field.type, itemData);
      }, this)
    }, this);

    return {
      itemId: itemId,
      title: title,
      sections: sections
    }
  }

});
},{}],32:[function(require,module,exports){
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
    var data;
    data = this.model.get('value'); // model equals FieldControlModel, value equals parent obj data for this field key
    if (!_.isEmpty(data)) {
      _.each(data, function (dataobj, index) {
        if (!dataobj) {
          return;
        }


        var item = this.factory.factorNewItem(data[dataobj['_meta'].uid], dataobj['_meta'].uid, dataobj['_meta'].title);
        var view = new this.Renderer({
          controller: this,
          model: new Backbone.Model(item)
        });
        this.subviews.push(view);
        this.$list.append(view.render());
        UI.initTabs();
        KB.Events.trigger('modal.recalibrate');
      },this);
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
  render: function () {
    this.$el.append(tplSkeleton({
      i18n: I18n.getString('Refields.flexfields')
    }));
    this.setupElements();
    this.initialSetup();

  },
  derender: function () {
    this.trigger('derender'); // subviews mights listen
    this.subviews = [];
  },
  setupElements: function () {
    this.$list = this.$('.flexible-fields--item-list');
    this.$addButton = this.$('.kb-flexible-fields--js-add-item');
  },
  addItem: function () {
    var item = this.factory.factorNewItem();

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

},{"common/I18n":12,"common/Logger":13,"common/TinyMCE":17,"common/UI":18,"fields/controls/flexfields/FlexFieldsCollection":30,"fields/controls/flexfields/FlexFieldsFactory":31,"fields/controls/flexfields/SectionBoxItem":33,"fields/controls/flexfields/ToggleBoxItem":34,"templates/fields/FlexibleFields/skeleton.hbs":74}],33:[function(require,module,exports){
var ToggleBoxItem =  require('fields/controls/flexfields/ToggleBoxItem');
var tplSingleSectionBox = require('templates/fields/FlexibleFields/single-section-box.hbs');
module.exports = ToggleBoxItem.extend({
  render: function () {
    var inputName = this.createInputName(this.model.get('itemId'));
    var item = this.model.toJSON(); // tab information and value hold by this.model
    var $skeleton = this.$el.append(tplSingleSectionBox({ // append the outer skeletion markup for the item / toggle head & body
      item: item,
      inputName: inputName,
      uid: this.model.get('itemId')
    }));
    this.renderTabs($skeleton); // insert the tabs markup
    return $skeleton;
  }

});
},{"fields/controls/flexfields/ToggleBoxItem":34,"templates/fields/FlexibleFields/single-section-box.hbs":72}],34:[function(require,module,exports){
//KB.FlexibleFields.ItemView
var Notice = require('common/Notice');
var tplSingleToggleBox = require('templates/fields/FlexibleFields/single-toggle-box.hbs');
var Handlebars = require('handlebars');
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
    'click .flexible-fields--js-trash': 'deleteItem'
  },
  toggleItem: function () {
    this.$('.flexible-fields--toggle-title').next().slideToggle(250, function () {
      KB.Events.trigger('modal.recalibrate');
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
  render: function () {
    var inputName = this.createInputName(this.model.get('itemId'));
    var item = this.model.toJSON(); // tab information and value hold by this.model
    var $skeleton = this.$el.append(tplSingleToggleBox({ // append the outer skeletion markup for the item / toggle head & body
      item: item,
      inputName: inputName,
      uid: this.model.get('itemId')
    }));
    this.renderTabs($skeleton); // insert the tabs markup
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

      var wrap = Handlebars.compile("<div class='kb-field-wrapper kb-js-field-identifier' data-kbfuid='{{ kbfuid }}' id='{{ kbfuid }}'></div>");
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
    _.defer(function () {
      fieldInstance.setElement($con);
      if (fieldInstance.postRender) {
        fieldInstance.postRender.call(fieldInstance);
      }
      // add field to controller fields collection
      if (that.Controller.parentView) {
        _.defer(function () {
          var existing = that.Controller.Fields.findWhere({uid: fieldInstance.model.get('uid')});
          if (_.isUndefined(existing)) {
            var model = that.Controller.Fields.add(fieldInstance.model.toJSON());
            fieldInstance.fieldModel = model;
          } else {
            existing.rebind();
          }
        });
      }
    });
  }
});
},{"common/Notice":14,"handlebars":97,"templates/fields/FlexibleFields/single-toggle-box.hbs":73}],35:[function(require,module,exports){
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




},{"./gallery/GalleryController":36,"fields/FieldControlBaseView":20}],36:[function(require,module,exports){
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

},{"./ImageView":37,"common/Logger":13}],37:[function(require,module,exports){
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
    this.$el.addClass('kb-gallery--active-item kb_field').appendTo('body');
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
    this.$el.removeClass('kb-gallery--active-item').removeClass('kb_field');
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

},{"common/TinyMCE":17,"common/UI":18,"templates/fields/Gallery/single-image.hbs":75}],38:[function(require,module,exports){
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
},{"./gallery2/Gallery2Controller":39,"fields/FieldControlBaseView":20}],39:[function(require,module,exports){
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
  derender: function(){

  },
  renderElements: function () {
    // Add list element dynamically
    jQuery('<div class="kb-gallery2--item-list"></div>').appendTo(this.$el);
    // add button dynamically
    jQuery('<a class="button button-primary kb-gallery2--js-add-images">' + KB.i18n.Refields.image.addButton + '</a>').appendTo(this.$el);
  },
  setupElements: function(){
    this.$list = this.$('.kb-gallery2--item-list');
    this.$list.sortable({revert: true, delay: 300, stop: _.bind(this.resortSelection, this)});
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
      var args = {post__in: this.ids};
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
      this.add(this.selection.get(imageId));
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
    view.remove();
    delete this.subviews[model.get('id')];
  },
  getIdsFromInputs: function () {
    return this.$('.kb-gallery--image-holder input').map(function (idx, ele) {
      return jQuery(ele).val();
    }).get();
  },
  resortToSelection: function () {
    var ids = _.pluck(this.selection.models, 'id');
    _.each(this.subviews, function(view){
        view.$el.detach();
    },this);

    _.each(ids, function(imgId){
      var view = this.subviews[imgId];
      view.$el.appendTo(this.$list);
    }, this);

  }
});

},{"./ImageView":40,"common/Logger":13}],40:[function(require,module,exports){
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
    if (!_.isEmpty(this.Controller.model.get('arrayKey'))) {
      return this.Controller.model.get('baseId') + '[' + this.Controller.model.get('arrayKey') + ']';
    } else {
      return this.Controller.model.get('baseId');
    }
  }
});

},{"templates/fields/Gallery2/single-image.hbs":76}],41:[function(require,module,exports){
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
    'click .kb-js-reset-image': 'resetImage'
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
          that.defaultFrame = 'select';
          that.defaultState = 'library';
        }

        // create a frame, bind 'update' callback and open in one step
        that.frame = wp.media({
          frame: that.defaultFrame, // alias for the ImageDetails frame
          state: that.defaultState, // default state, makes sense
          metadata: metadata, // the important bit, thats where the initial informations come from
          imageEditView: that,
          type: 'image',
          library: {
            type: 'image'
          }

        }).on('update', function (attachmentObj) { // bind callback to 'update'
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
            that.replace(that.frame.image.attachment);
          }).on('select', function (what) {
            var attachment = this.get('library').get('selection').first();
            that.replace(attachment);
          }).open();
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
  handleAttachment: function (attachment) {
    var that = this;
    var id = attachment.get('id');
    var value = this.prepareValue(attachment);
    var entityData = _.clone(this.model.get('ModuleModel').get('entityData'));
    var path = this.model.get('kpath');
    Utilities.setIndex(entityData, path, value);
    this.model.get('ModuleModel').set('entityData', entityData);
    var args = {
      width: that.model.get('width') || null,
      height: that.model.get('height') || null,
      crop: that.model.get('crop') || true,
      upscale: that.model.get('upscale') || false
    };

    if (!args.width || !args.height) {
      var src = (attachment.get('sizes').thumbnail) ? attachment.get('sizes').thumbnail.url : attachment.get('sizes').full.url;
      this.$container.html('<img src="' + src + '" >');
    } else {
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
    }
    this.$saveId.val(attachment.get('id'));
    this.$description.val(attachment.get('caption'));
    this.$title.val(attachment.get('title'));
    //KB.Events.trigger('modal.preview');
    this.model.get('ModuleModel').trigger('data.updated');
  },
  prepareValue: function (attachment) {
    return {
      id: attachment.get('id'),
      title: attachment.get('title'),
      caption: attachment.get('caption'),
      alt: attachment.get('alt')
    };
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
},{"../FieldControlBaseView":20,"common/Config":11,"common/Utilities":19}],42:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function(){
    this.render();
  },
  events:{
    'click .kb-js-add-link' : 'openModal'
  },
  render: function(){
    this.$input = this.$('[data-kbf-link-url]');
    this.$text = this.$('[data-kbf-link-linktext]');
  },
  derender: function(){

  },
  openModal: function(){
    window._kbLink = this;
    wpActiveEditor = this.$input.attr('id');
    jQuery('#wp-link-wrap').addClass('kb-customized');

    // store the original function
    window.kb_restore_htmlUpdate = wpLink.htmlUpdate;
    window.kb_restore_isMce = wpLink.isMCE;

    wpLink.isMCE = this.isMCE;
    wpLink.htmlUpdate = this.htmlUpdate;
    wpLink.open();
    jQuery( '#wp-link-text').val(this.$text.val());
    jQuery( '#wp-link-url').val(this.$input.val());
  },
  htmlUpdate: function(){
    var attrs, html, start, end, cursor, href,title,
      textarea = wpLink.textarea, result;

    if (!textarea)
      return;

    // get contents of dialog
    attrs = wpLink.getAttrs();
    title = jQuery( '#wp-link-text').val();
    // If there's no href, return.
    if (!attrs.href || attrs.href == 'http://')
      return;
    // Build HTML
    href = attrs.href;
    // Clear textarea
    jQuery(textarea).empty();

    //Append the Url to the textarea
    textarea.value = href;

    window._kbLink.trigger('update', title, href);
    window._kbLink.$text.val(title);
    //restore the original function
    // close dialog and put the cursor inside the textarea
    wpLink.close();
    window._kbLink.close();
    textarea.focus();
  },
  isMCE: function(){
    return false;
  },
  close: function(){
      // restore the original functions to wpLink
      wpLink.isMCE = window.kb_restore_isMce;
      wpLink.htmlUpdate = window.kb_restore_htmlUpdate;
  }
});
},{"../FieldControlBaseView":20}],43:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
var MLayoutController = require('fields/controls/mlayout/MLayoutController');
module.exports = BaseView.extend({
  initialize: function () {
    this.createController();
    this.render();
  },
  render: function () {
    this.$stage = this.$('.kb-field--mlayout-stage');
    this.MLayoutController.setElement(this.$stage.get(0)); // root element equals stage element
    this.MLayoutController.render();
  },
  derender: function () {
    this.MLayoutController.derender();
  },
  rerender: function () {
    console.log('rerender');
    this.render();

  },
  createController: function () {
    if (!this.MLayoutController) {
      return this.MLayoutController = new MLayoutController({
        el: this.$('.kb-field--mlayout-stage'),
        model: this.model,
        parentView: this,
        area: this.model.ModuleModel.Area
      })
    }
  }
});
},{"../FieldControlBaseView":20,"fields/controls/mlayout/MLayoutController":44}],44:[function(require,module,exports){
var SlotView = require('fields/controls/mlayout/SlotView');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.area = options.area;
    this.parentView = options.parentView;
    this.listenTo(this.model.ModuleModel.View, 'modal.before.nodeupdate', this.disposeSubviews);
    this.listenTo(this.model.ModuleModel.View, 'modal.after.nodeupdate', this.updateSubviews);
  },
  setupViewConnections: function () {
    var views = {};
    _.each(this.slots, function (slot) {
      if (slot.model.get('mid') !== '') {
        var moduleModel = KB.Modules.get(slot.model.get('mid'));
        if (moduleModel && moduleModel.View) {
          views[slot.model.get('mid')] = moduleModel.View;
        }
      }
    });
    return views;
  },
  updateSubviews: function () {
    _.each(this.subViews, function (subview) {
      subview.rerender();
    })
  },
  disposeSubviews: function () {
    _.each(this.subViews, function (subview) {
      subview.derender();
    })
  },
  setupSlots: function () {
    this.$slots = this.$('[data-kbml-slot]');
  },
  derender: function () {
    //console.log('derender');
  },
  render: function () {
    this.slots = {};
    this.setupSlots();
    this.setupViews();
    this.subViews = this.setupViewConnections();

  },
  setupViews: function () {
    _.each(this.$slots, function (el) {
      var $el = jQuery(el);
      var slotId = $el.data('kbml-slot');
      var fullId = this.createSlotId(slotId);
      var view = new SlotView({
        el: $el,
        model: new Backbone.Model({}),
        controller: this,
        slotId: this.createSlotId(slotId)
      });
      this.slots[this.createSlotId(slotId)] = view;
      view.setModule(this.getSlotModule(fullId));
      view.model.set(this.getSlotData(fullId));
      this.listenTo(view, 'module.created', this.updateParent);
      this.listenTo(view, 'module.removed', this.updateParent);
    }, this)
  },
  createSlotId: function (slotId) {
    return 'slot-' + slotId;
  },
  getSlotModule: function (slotId) {
    var value = this.model.get('value');
    var module = value[slotId];
    if (module) {
      return module;
    }
    return null;
  },
  getSlotData: function (slotId) {
    var value = this.model.get('value');

    if (!_.isObject(value)) {
      value = {};
    }

    if (!value.slots) {
      value['slots'] = new Object();
    }


    if (value.slots[slotId]) {
      return value.slots[slotId];
    }
    return {mid: ''};
  },
  updateParent: function () {
    this.model.ModuleModel.sync();
  }

});
},{"fields/controls/mlayout/SlotView":47}],45:[function(require,module,exports){
var ModuleBrowser = require('shared/ModuleBrowser/ModuleBrowserController');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
module.exports = ModuleBrowser.extend({
  createModule: function (module) {
    var Area, data;
    // check if capability is right for this action
    if (Checks.userCan('create_kontentblocks')) {
    } else {
      Notice.notice('You\'re not allowed to do this', 'error');
    }

    // check if block limit isn't reached

    // prepare data to send
    data = {
      action: 'createNewModule',
      'class': module.get('settings').class,
      globalModule: module.get('globalModule'),
      parentObject: module.get('parentObject'),
      parentObjectId: module.get('parentObjectId'),
      areaContext: this.area.model.get('context'),
      area: this.area.model.get('id'),
      _ajax_nonce: Config.getNonce('create'),
      frontend: KB.appData.config.frontend,
      submodule: true
    };

    if (this.area.model.get('parent_id')) {
      data.postId = this.area.model.get('parent_id');
    }

    this.close();
    Ajax.send(data, this.success, this);
  },
  success: function (res) {
    this.trigger('browser.module.created', { res: res})
  }

});
},{"common/Ajax":9,"common/Checks":10,"common/Config":11,"common/Notice":14,"shared/ModuleBrowser/ModuleBrowserController":55}],46:[function(require,module,exports){
var tplModuleView = require('fields/controls/mlayout/templates/module-view.hbs');
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
    this.slotView.$el.prepend(this.$el);
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
      data = {
        action: 'getModuleBackendForm',
        _ajax_nonce: Config.getNonce('read'),
        module: this.ModuleModel.toJSON()
      };
      Ajax.send(data, this.success, this);
    }
  },
  handleFrontend: function () {
    var model = KB.Modules.get(this.model.get('mid'));
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
    //if (KB.EditModalModules) {
    //  tinyMCE.triggerSave();
    //  var $form = KB.EditModalModules.$form;
    //  var formdata = $form.serializeJSON();
    //  var moddata = formdata[this.ModuleModel.get('mid')];
    //  if (moddata) {
    //    //delete moddata.viewfile;
    //    //delete moddata.overrides;
    //    //delete moddata.areaContext;
    //    this.ModuleModel.set('entityData', moddata);
    //    this.ModuleModel.sync(true);
    //  }
    //}
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
},{"backend/Views/FullscreenView":7,"common/Ajax":9,"common/Config":11,"common/Payload":15,"common/TinyMCE":17,"common/UI":18,"fields/controls/mlayout/templates/module-view.hbs":49}],47:[function(require,module,exports){
var ModuleBrowser = require('fields/controls/mlayout/ModuleBrowser');
var ModuleView = require('fields/controls/mlayout/ModuleView');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var tplEmpty = require('fields/controls/mlayout/templates/empty.hbs');

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
    if (!_.isNull(module)){
      this.ModuleModel = new Backbone.Model(module);
    }
  },
  updateInput: function () {

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
      this.$el.prepend(tplEmpty({}));
    }
    this.$input.val(this.model.get('mid'));
  },
  setup: function () {
    var field = this.controller.model;
    this.basename = field.get('baseId');
    if (field.get('arrayKey')) {
      this.basename = this.basename + '[' + field.get('arrayKey') + ']';
    }
    this.basename = this.basename + '[' + field.get('fieldkey') + ']' + '[slots]' + '[' + this.slotId + '][mid]';
    this.$input = jQuery("<input type='hidden' name='" + this.basename + "'>");
  },
  render: function () {
    this.$el.append(this.$input);
  },
  click: function () {
    if (!this.ModuleBrowser) {
      this.ModuleBrowser = new ModuleBrowser({
        area: this.controller.area.View
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
    this.setModule(module);
    this.model.set('mid', module.mid);
    _.defer(function(){
      that.trigger('module.created');
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
    if (res.success) {
      //console.log(this.controller.model);
      //this.controller.model.ModuleModel.View.ModuleMenu.getView('save').saveData();
      this.ModuleView.stopListening();
      this.ModuleView.remove();
      this.ModuleView.model = null;
      this.ModuleView = null;
      this.model.clear();
      this.ModuleModel = null;
      this.updateInput();
      this.trigger('module.removed');
    }
  }
});
},{"common/Ajax":9,"common/Config":11,"fields/controls/mlayout/ModuleBrowser":45,"fields/controls/mlayout/ModuleView":46,"fields/controls/mlayout/templates/empty.hbs":48}],48:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"kbsm-empty\">\n    add module\n</div>";
},"useData":true});

},{"hbsfy/runtime":110}],49:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"kbsm-details\">\n    <div class=\"kbsm--name\">"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.name : stack1), depth0))
    + "</div>\n</div>\n<div class=\"kbsm-actions\">\n    <div class=\"kbsm-action kbms-action--open\" data-kbtooltip=\"open form\"><span\n            class=\"dashicons dashicons-admin-generic\"></span></div>\n    <div class=\"kbsm-action kbms-action--delete\" data-kbtooltip=\"delete\"><span\n            class=\"dashicons dashicons-welcome-comments\"></span></div>\n    <div class=\"kbsm-action kbms-action--update\" data-kbtooltip=\"update\"><span\n            class=\"dashicons dashicons-update\"></span></div>\n</div>\n<div class=\"kbsm-inner\">\n\n</div>";
},"useData":true});

},{"hbsfy/runtime":110}],50:[function(require,module,exports){
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
},{"../FieldControlBaseView":20}],51:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  events: {
    'click .js-oday-activate-split' : 'split'
  },
  initialize: function () {
    this.render();
  },
  render:function(){
    this.$('.kb-ot-timepicker').datetimepicker({
      datepicker: false,
      format: 'H:i',
      validateOnBlur: false,
      step: 30
    });
  },
  derender: function(){
    this.$('.kb-ot-timepicker').datetimepicker('destroy');
  },
  split:function(){
    this.$('table').toggleClass('split');
  }
});


},{"../FieldControlBaseView":20}],52:[function(require,module,exports){
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
},{"../FieldControlBaseView":20}],53:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    this.$input = this.$('.kb-field--text input');
    this.$input.on('change', function(){
      that.update(that.$input.val());
    })
  },
  derender: function () {

  },
  update: function (val) {
    this.model.set('value', val);
  },
  toString: function(){
    return this.$input.val();
  }
});
},{"../FieldControlBaseView":20}],54:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    this.$textarea = this.$('textarea');
    this.$textarea.on('change', function () {
      that.update(that.$textarea.val());
    });
  },
  derender: function () {

  },
  update: function (val) {
    this.model.set('value', val);
  },
  toString: function(){
    return this.$textarea.val();
  }
});
},{"../FieldControlBaseView":20}],55:[function(require,module,exports){
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
    'click .module-browser--switch__excerpt-view': 'toggleViewMode'
  },
  subviews: {},
  toggleViewMode: function () {
    jQuery('.module-browser-wrapper', this.$el).toggleClass('module-browser--list-view module-browser--excerpt-view');
    var abbr = 'mdb_' + this.area.model.get('id') + '_state';
    var curr = store.get(abbr);
    if (curr == 'list') {
      this.viewMode = 'excerpt';
      store.set(abbr, 'excerpt');
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
      return 'module-browser--excerpt-view';
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
    this.options.area.modulesList.append(data.html);
    model = KB.ObjectProxy.add(KB.Modules.add(data.module));
    this.options.area.attachModuleView(model);
    this.parseAdditionalJSON(data.json);
    model.View.$el.addClass('kb-open');

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
},{"common/Ajax":9,"common/Checks":10,"common/Config":11,"common/Notice":14,"common/Payload":15,"common/TinyMCE":17,"shared/ModuleBrowser/ModuleBrowserDefinitions":56,"shared/ModuleBrowser/ModuleBrowserDescriptions":57,"shared/ModuleBrowser/ModuleBrowserNavigation":60,"shared/ModuleBrowser/ModuleDefinitionModel":62,"templates/backend/modulebrowser/module-browser.hbs":66}],56:[function(require,module,exports){
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
    return this.categories[id].modules;
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
},{"common/Payload":15}],57:[function(require,module,exports){
//KB.Backbone.ModuleBrowserModuleDescription
var Templates = require('common/Templates');
var tplModuleTemplateDescription = require('templates/backend/modulebrowser/module-template-description.hbs');
var tplModuleDescription = require('templates/backend/modulebrowser/module-description.hbs');
var tplModulePoster = require('templates/backend/modulebrowser/poster.hbs');
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
      this.$el.html(tplModuleTemplateDescription( {module: this.model.toJSON()}));
    } else {
      this.$el.html(tplModuleDescription({module: this.model.toJSON()}));
    }
    if (this.model.get('settings').poster !== false) {
      this.$el.append(tplModulePoster({module: this.model.toJSON()}));
    }
    if (this.model.get('settings').helpfile !== false) {
      this.$el.append(Templates.render(this.model.get('settings').helpfile, {module: this.model.toJSON()}));
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

},{"common/Templates":16,"templates/backend/modulebrowser/module-description.hbs":67,"templates/backend/modulebrowser/module-template-description.hbs":69,"templates/backend/modulebrowser/poster.hbs":71}],58:[function(require,module,exports){
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
    _.each(this.cat.model.get('modules'), function (module) {
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
},{"shared/ModuleBrowser/ModuleBrowserListItem":59}],59:[function(require,module,exports){
//KB.Backbone.ModuleBrowserListItem
var tplTemplateListItem = require('templates/backend/modulebrowser/module-template-list-item.hbs');
var tplListItem = require('templates/backend/modulebrowser/module-list-item.hbs');
module.exports = Backbone.View.extend({
  tagName: 'li',
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
      this.$el.html(tplTemplateListItem({module: this.model.toJSON()}));
    } else {
      this.$el.html(tplListItem({module: this.model.toJSON()}));
    }
    el.append(this.$el);
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
},{"templates/backend/modulebrowser/module-list-item.hbs":68,"templates/backend/modulebrowser/module-template-list-item.hbs":70}],60:[function(require,module,exports){
var ModuleBrowserTabItemView = require('shared/ModuleBrowser/ModuleBrowserTabItemView');
module.exports = Backbone.View.extend({
  catSet: false,
  initialize: function (options) {
    var that = this;
    this.options = options || {};
    this.$list = jQuery('<ul></ul>').appendTo(this.$el);
    _.each(this.options.cats, function (cat) {
      var model = new Backbone.Model(cat);
      new ModuleBrowserTabItemView({parent: that, model: model, browser: that.options.browser}).render();
    });

  }

});
},{"shared/ModuleBrowser/ModuleBrowserTabItemView":61}],61:[function(require,module,exports){
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
  tagName: 'li',
  className: 'cat-item',
  events: {
    'click': 'change'
  },
  change: function () {
    this.options.parent.trigger('browser:change', this);
    this.$el.addClass('active');
    jQuery('li').not(this.$el).removeClass('active');
  },
  render: function () {
    var count = _.keys(this.model.get('modules')).length;
    var countstr = '(' + count + ')';

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
},{"shared/ModuleBrowser/ModuleBrowserList":58}],62:[function(require,module,exports){
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
},{}],63:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"kb-context-bar grid__col grid__col--12-of-12\">\n    <ul class=\"kb-context-bar--actions\">\n\n    </ul>\n</div>";
},"useData":true});

},{"hbsfy/runtime":110}],64:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"kb-fullscreen--holder-wrap\">\n    <div class=\"kb-fullscreen--controls\">\n       <div class=\"kb-fullscreen-js-close\"><span class=\"dashicons dashicons-no-alt\"></span></div>\n    </div>\n    <div class=\"kb-fullscreen--inner\">\n\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":110}],65:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<ul class='module-actions'></ul>";
},"useData":true});

},{"hbsfy/runtime":110}],66:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"module-browser-wrapper "
    + this.escapeExpression(((helper = (helper = helpers.viewMode || (depth0 != null ? depth0.viewMode : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"viewMode","hash":{},"data":data}) : helper)))
    + "\">\n\n    <div class=\"module-browser-header module-categories\">\n        <a class=\"genericon genericon-close-alt close-browser kb-button\"></a>\n        <a class=\"dashicons dashicons-list-view module-browser--switch__list-view \"></a>\n        <a class=\"dashicons dashicons-exerpt-view module-browser--switch__excerpt-view \"></a>\n    </div>\n\n    <div class=\"module-browser__left-column kb-nano\">\n        <ul class=\"modules-list kb-nano-content\">\n\n        </ul>\n    </div>\n\n    <div class=\"module-browser__right-column kb-nano\">\n        <div class=\"module-description kb-nano-content\">\n\n        </div>\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":110}],67:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<h3>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.publicName : stack1), depth0))
    + " <div class=\"kb-button-small kb-js-create-module\">Add module</div>\n</h3>\n";
},"useData":true});

},{"hbsfy/runtime":110}],68:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"dashicons dashicons-plus kb-js-create-module\"></div>\n<h4>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.name : stack1), depth0))
    + "</h4>\n<p class=\"description\">"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.description : stack1), depth0))
    + "</p>";
},"useData":true});

},{"hbsfy/runtime":110}],69:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<h3>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.parentObject : stack1)) != null ? stack1.post_title : stack1), depth0))
    + "</h3>";
},"useData":true});

},{"hbsfy/runtime":110}],70:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"dashicons dashicons-plus kb-js-create-module\"></div>\n<h4>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.parentObject : stack1)) != null ? stack1.post_title : stack1), depth0))
    + "</h4>";
},"useData":true});

},{"hbsfy/runtime":110}],71:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"module-browser--poster-wrap\">\n    <img src=\""
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.poster : stack1), depth0))
    + "\" >\n</div>";
},"useData":true});

},{"hbsfy/runtime":110}],72:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<input type=\"hidden\" name=\""
    + alias3(((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"inputName","hash":{},"data":data}) : helper)))
    + "[_meta][uid]\" value=\""
    + alias3(((helper = (helper = helpers.uid || (depth0 != null ? depth0.uid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"uid","hash":{},"data":data}) : helper)))
    + "\">\n<div class=\"flexible-fields--section-box\">\n    <div class=\"flexible-fields--section-title\">\n        <h3>\n            <span class=\"genericon genericon-draggable flexible-fields--js-drag-handle\"></span>\n            <span class=\"dashicons dashicons-trash flexible-fields--js-trash\"></span>\n            <input type=\"text\" value=\""
    + alias3(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.title : stack1), depth0))
    + "\" name=\""
    + alias3(((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"inputName","hash":{},"data":data}) : helper)))
    + "[_meta][title] \">\n        </h3>\n    </div>\n    <div class=\"kb-field--tabs kb_fieldtabs\">\n        <ul class=\"flexible-field--tab-nav\">\n\n        </ul>\n\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":110}],73:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<input type=\"hidden\" name=\""
    + alias3(((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"inputName","hash":{},"data":data}) : helper)))
    + "[_meta][uid]\" value=\""
    + alias3(((helper = (helper = helpers.uid || (depth0 != null ? depth0.uid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"uid","hash":{},"data":data}) : helper)))
    + "\">\n<div class=\"flexible-fields--toggle-title\">\n    <h3>\n        <span class=\"genericon genericon-draggable flexible-fields--js-drag-handle\"></span>\n        <span class=\"genericon genericon-expand flexible-fields--js-toggle\"></span>\n        <span class=\"dashicons dashicons-trash flexible-fields--js-trash\"></span>\n\n        <input type=\"text\" value=\""
    + alias3(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.title : stack1), depth0))
    + "\" name=\""
    + alias3(((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"inputName","hash":{},"data":data}) : helper)))
    + "[_meta][title] \">\n    </h3>\n</div>\n<div class=\"flexible-fields--toggle-box kb-hide\">\n    <div class=\"kb-field--tabs kb_fieldtabs\">\n        <ul class=\"flexible-field--tab-nav\">\n\n        </ul>\n    </div>\n\n</div>";
},"useData":true});

},{"hbsfy/runtime":110}],74:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"flexible-fields--header\">\n    <a class=\"button button-primary kb-flexible-fields--js-add-item\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.i18n : depth0)) != null ? stack1.addNewItem : stack1), depth0))
    + "</a>\n</div>\n<ul class=\"flexible-fields--item-list\"></ul>\n";
},"useData":true});

},{"hbsfy/runtime":110}],75:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, alias4=this.lambda;

  return "<div class=\"kb-gallery--header\">\n    <h3>Image Details</h3>\n</div>\n<div class=\"kb-gallery--left-column\">\n    <div class=\"kb-gallery--image-meta\" style=\"display: none;\">\n        <span class=\"genericon genericon-close-alt kb-gallery--js-meta-close\"></span>\n\n        <div class=\"kb_fieldtabs kb-field--tabs\">\n            <ul class=\"kb-gallery--tabs-nav\">\n                <li><a href=\"#tab"
    + alias3(((helper = (helper = helpers.uid || (depth0 != null ? depth0.uid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"uid","hash":{},"data":data}) : helper)))
    + "-1\">Details</a></li>\n                <li><a href=\"#tab"
    + alias3(((helper = (helper = helpers.uid || (depth0 != null ? depth0.uid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"uid","hash":{},"data":data}) : helper)))
    + "-2\">Beschreibung</a></li>\n            </ul>\n            <div id=\"tab"
    + alias3(((helper = (helper = helpers.uid || (depth0 != null ? depth0.uid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"uid","hash":{},"data":data}) : helper)))
    + "-1\">\n                <div class=\"kb-gallery--meta-field kb-field\">\n                    <label class=\"heading\">Titel</label>\n                    <input class=\"large\" type=\"text\" name=\""
    + alias3(((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"inputName","hash":{},"data":data}) : helper)))
    + "[details][title]\" value=\""
    + alias3(alias4(((stack1 = ((stack1 = (depth0 != null ? depth0.image : depth0)) != null ? stack1.details : stack1)) != null ? stack1.title : stack1), depth0))
    + "\">\n                </div>\n                <div class=\"kb-gallery--meta-field kb-field\">\n                    <label class=\"heading\">Alt</label>\n                    <input class=\"large\" type=\"text\" name=\""
    + alias3(((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"inputName","hash":{},"data":data}) : helper)))
    + "[details][alt]\" value=\""
    + alias3(alias4(((stack1 = ((stack1 = (depth0 != null ? depth0.image : depth0)) != null ? stack1.details : stack1)) != null ? stack1.alt : stack1), depth0))
    + "\">\n                </div>\n            </div>\n\n            <div id=\"tab"
    + alias3(((helper = (helper = helpers.uid || (depth0 != null ? depth0.uid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"uid","hash":{},"data":data}) : helper)))
    + "-2\">\n                <div class=\"kb-js--remote-editor\" data-uid=\""
    + alias3(((helper = (helper = helpers.uid || (depth0 != null ? depth0.uid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"uid","hash":{},"data":data}) : helper)))
    + "\">\n                    <textarea name=\""
    + alias3(((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"inputName","hash":{},"data":data}) : helper)))
    + "[details][description]\">"
    + alias3(alias4(((stack1 = ((stack1 = (depth0 != null ? depth0.image : depth0)) != null ? stack1.details : stack1)) != null ? stack1.description : stack1), depth0))
    + "</textarea>\n                </div>\n\n            </div>\n        </div>\n    </div>\n</div>\n<div class=\"kb-gallery--right-column\">\n    <div class=\"kb-gallery--image-holder\">\n        <img src=\""
    + alias3(alias4(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.image : depth0)) != null ? stack1.file : stack1)) != null ? stack1.sizes : stack1)) != null ? stack1.thumbnail : stack1)) != null ? stack1.url : stack1), depth0))
    + "\">\n        <span class=\"genericon genericon-edit kb-gallery--js-edit\"></span>\n        <span class=\"genericon genericon-close-alt kb-gallery--js-delete\"></span>\n        <input type=\"hidden\" name=\""
    + alias3(((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"inputName","hash":{},"data":data}) : helper)))
    + "[id]\" value=\""
    + alias3(alias4(((stack1 = (depth0 != null ? depth0.image : depth0)) != null ? stack1.id : stack1), depth0))
    + "\">\n        <input type=\"hidden\" class=\"kb-gallery--image-remove\" name=\""
    + alias3(((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"inputName","hash":{},"data":data}) : helper)))
    + "[remove]\" value=\"\">\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":110}],76:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"kb-gallery--right-column\">\n    <div class=\"kb-gallery--image-holder\">\n        <img src=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.image : depth0)) != null ? stack1.sizes : stack1)) != null ? stack1.thumbnail : stack1)) != null ? stack1.url : stack1), depth0))
    + "\">\n        <input type=\"hidden\" name=\""
    + alias2(((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"inputName","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.image : depth0)) != null ? stack1.id : stack1), depth0))
    + "\">\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":110}],77:[function(require,module,exports){

},{}],78:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

},{}],79:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;

var _runtime = require('./handlebars.runtime');

var _runtime2 = _interopRequireWildcard(_runtime);

// Compiler imports

var _AST = require('./handlebars/compiler/ast');

var _AST2 = _interopRequireWildcard(_AST);

var _Parser$parse = require('./handlebars/compiler/base');

var _Compiler$compile$precompile = require('./handlebars/compiler/compiler');

var _JavaScriptCompiler = require('./handlebars/compiler/javascript-compiler');

var _JavaScriptCompiler2 = _interopRequireWildcard(_JavaScriptCompiler);

var _Visitor = require('./handlebars/compiler/visitor');

var _Visitor2 = _interopRequireWildcard(_Visitor);

var _noConflict = require('./handlebars/no-conflict');

var _noConflict2 = _interopRequireWildcard(_noConflict);

var _create = _runtime2['default'].create;
function create() {
  var hb = _create();

  hb.compile = function (input, options) {
    return _Compiler$compile$precompile.compile(input, options, hb);
  };
  hb.precompile = function (input, options) {
    return _Compiler$compile$precompile.precompile(input, options, hb);
  };

  hb.AST = _AST2['default'];
  hb.Compiler = _Compiler$compile$precompile.Compiler;
  hb.JavaScriptCompiler = _JavaScriptCompiler2['default'];
  hb.Parser = _Parser$parse.parser;
  hb.parse = _Parser$parse.parse;

  return hb;
}

var inst = create();
inst.create = create;

_noConflict2['default'](inst);

inst.Visitor = _Visitor2['default'];

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];
},{"./handlebars.runtime":80,"./handlebars/compiler/ast":82,"./handlebars/compiler/base":83,"./handlebars/compiler/compiler":85,"./handlebars/compiler/javascript-compiler":87,"./handlebars/compiler/visitor":90,"./handlebars/no-conflict":93}],80:[function(require,module,exports){
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
},{"./handlebars/base":81,"./handlebars/exception":92,"./handlebars/no-conflict":93,"./handlebars/runtime":94,"./handlebars/safe-string":95,"./handlebars/utils":96}],81:[function(require,module,exports){
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
},{"./exception":92,"./utils":96}],82:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var AST = {
  Program: function Program(statements, blockParams, strip, locInfo) {
    this.loc = locInfo;
    this.type = 'Program';
    this.body = statements;

    this.blockParams = blockParams;
    this.strip = strip;
  },

  MustacheStatement: function MustacheStatement(path, params, hash, escaped, strip, locInfo) {
    this.loc = locInfo;
    this.type = 'MustacheStatement';

    this.path = path;
    this.params = params || [];
    this.hash = hash;
    this.escaped = escaped;

    this.strip = strip;
  },

  BlockStatement: function BlockStatement(path, params, hash, program, inverse, openStrip, inverseStrip, closeStrip, locInfo) {
    this.loc = locInfo;
    this.type = 'BlockStatement';

    this.path = path;
    this.params = params || [];
    this.hash = hash;
    this.program = program;
    this.inverse = inverse;

    this.openStrip = openStrip;
    this.inverseStrip = inverseStrip;
    this.closeStrip = closeStrip;
  },

  PartialStatement: function PartialStatement(name, params, hash, strip, locInfo) {
    this.loc = locInfo;
    this.type = 'PartialStatement';

    this.name = name;
    this.params = params || [];
    this.hash = hash;

    this.indent = '';
    this.strip = strip;
  },

  ContentStatement: function ContentStatement(string, locInfo) {
    this.loc = locInfo;
    this.type = 'ContentStatement';
    this.original = this.value = string;
  },

  CommentStatement: function CommentStatement(comment, strip, locInfo) {
    this.loc = locInfo;
    this.type = 'CommentStatement';
    this.value = comment;

    this.strip = strip;
  },

  SubExpression: function SubExpression(path, params, hash, locInfo) {
    this.loc = locInfo;

    this.type = 'SubExpression';
    this.path = path;
    this.params = params || [];
    this.hash = hash;
  },

  PathExpression: function PathExpression(data, depth, parts, original, locInfo) {
    this.loc = locInfo;
    this.type = 'PathExpression';

    this.data = data;
    this.original = original;
    this.parts = parts;
    this.depth = depth;
  },

  StringLiteral: function StringLiteral(string, locInfo) {
    this.loc = locInfo;
    this.type = 'StringLiteral';
    this.original = this.value = string;
  },

  NumberLiteral: function NumberLiteral(number, locInfo) {
    this.loc = locInfo;
    this.type = 'NumberLiteral';
    this.original = this.value = Number(number);
  },

  BooleanLiteral: function BooleanLiteral(bool, locInfo) {
    this.loc = locInfo;
    this.type = 'BooleanLiteral';
    this.original = this.value = bool === 'true';
  },

  UndefinedLiteral: function UndefinedLiteral(locInfo) {
    this.loc = locInfo;
    this.type = 'UndefinedLiteral';
    this.original = this.value = undefined;
  },

  NullLiteral: function NullLiteral(locInfo) {
    this.loc = locInfo;
    this.type = 'NullLiteral';
    this.original = this.value = null;
  },

  Hash: function Hash(pairs, locInfo) {
    this.loc = locInfo;
    this.type = 'Hash';
    this.pairs = pairs;
  },
  HashPair: function HashPair(key, value, locInfo) {
    this.loc = locInfo;
    this.type = 'HashPair';
    this.key = key;
    this.value = value;
  },

  // Public API used to evaluate derived attributes regarding AST nodes
  helpers: {
    // a mustache is definitely a helper if:
    // * it is an eligible helper, and
    // * it has at least one parameter or hash segment
    helperExpression: function helperExpression(node) {
      return !!(node.type === 'SubExpression' || node.params.length || node.hash);
    },

    scopedId: function scopedId(path) {
      return /^\.|this\b/.test(path.original);
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
},{}],83:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;
exports.parse = parse;

var _parser = require('./parser');

var _parser2 = _interopRequireWildcard(_parser);

var _AST = require('./ast');

var _AST2 = _interopRequireWildcard(_AST);

var _WhitespaceControl = require('./whitespace-control');

var _WhitespaceControl2 = _interopRequireWildcard(_WhitespaceControl);

var _import = require('./helpers');

var Helpers = _interopRequireWildcard(_import);

var _extend = require('../utils');

exports.parser = _parser2['default'];

var yy = {};
_extend.extend(yy, Helpers, _AST2['default']);

function parse(input, options) {
  // Just return if an already-compiled AST was passed in.
  if (input.type === 'Program') {
    return input;
  }

  _parser2['default'].yy = yy;

  // Altering the shared object here, but this is ok as parser is a sync operation
  yy.locInfo = function (locInfo) {
    return new yy.SourceLocation(options && options.srcName, locInfo);
  };

  var strip = new _WhitespaceControl2['default']();
  return strip.accept(_parser2['default'].parse(input));
}
},{"../utils":96,"./ast":82,"./helpers":86,"./parser":88,"./whitespace-control":91}],84:[function(require,module,exports){
'use strict';

exports.__esModule = true;
/*global define */

var _isArray = require('../utils');

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
      if (_isArray.isArray(chunks)) {
        chunks = chunks.join('');
      }
      this.src += chunks;
    },
    prepend: function prepend(chunks) {
      if (_isArray.isArray(chunks)) {
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
  if (_isArray.isArray(chunk)) {
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
    var loc = arguments[0] === undefined ? this.currentLocation || { start: {} } : arguments[0];

    return new SourceNode(loc.start.line, loc.start.column, this.srcFile);
  },
  wrap: function wrap(chunk) {
    var loc = arguments[1] === undefined ? this.currentLocation || { start: {} } : arguments[1];

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
    var pairs = [];

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var value = castChunk(obj[key], this);
        if (value !== 'undefined') {
          pairs.push([this.quotedString(key), ':', value]);
        }
      }
    }

    var ret = this.generateList(pairs);
    ret.prepend('{');
    ret.add('}');
    return ret;
  },

  generateList: function generateList(entries, loc) {
    var ret = this.empty(loc);

    for (var i = 0, len = entries.length; i < len; i++) {
      if (i) {
        ret.add(',');
      }

      ret.add(castChunk(entries[i], this, loc));
    }

    return ret;
  },

  generateArray: function generateArray(entries, loc) {
    var ret = this.generateList(entries, loc);
    ret.prepend('[');
    ret.add(']');

    return ret;
  }
};

exports['default'] = CodeGen;
module.exports = exports['default'];

/* NOP */
},{"../utils":96,"source-map":98}],85:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;
exports.Compiler = Compiler;
exports.precompile = precompile;
exports.compile = compile;

var _Exception = require('../exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var _isArray$indexOf = require('../utils');

var _AST = require('./ast');

var _AST2 = _interopRequireWildcard(_AST);

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

    // These changes will propagate to the other compiler components
    var knownHelpers = options.knownHelpers;
    options.knownHelpers = {
      helperMissing: true,
      blockHelperMissing: true,
      each: true,
      'if': true,
      unless: true,
      'with': true,
      log: true,
      lookup: true
    };
    if (knownHelpers) {
      for (var _name in knownHelpers) {
        if (_name in knownHelpers) {
          options.knownHelpers[_name] = knownHelpers[_name];
        }
      }
    }

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

  PartialStatement: function PartialStatement(partial) {
    this.usePartial = true;

    var params = partial.params;
    if (params.length > 1) {
      throw new _Exception2['default']('Unsupported number of partial arguments: ' + params.length, partial);
    } else if (!params.length) {
      params.push({ type: 'PathExpression', parts: [], depth: 0 });
    }

    var partialName = partial.name.original,
        isDynamic = partial.name.type === 'SubExpression';
    if (isDynamic) {
      this.accept(partial.name);
    }

    this.setupFullMustacheParams(partial, undefined, undefined, true);

    var indent = partial.indent || '';
    if (this.options.preventIndent && indent) {
      this.opcode('appendContent', indent);
      indent = '';
    }

    this.opcode('invokePartial', isDynamic, partialName, indent);
    this.opcode('append');
  },

  MustacheStatement: function MustacheStatement(mustache) {
    this.SubExpression(mustache); // eslint-disable-line new-cap

    if (mustache.escaped && !this.options.noEscape) {
      this.opcode('appendEscaped');
    } else {
      this.opcode('append');
    }
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

    this.accept(path);

    this.opcode('invokeAmbiguous', name, isBlock);
  },

  simpleSexpr: function simpleSexpr(sexpr) {
    this.accept(sexpr.path);
    this.opcode('resolvePossibleLambda');
  },

  helperSexpr: function helperSexpr(sexpr, program, inverse) {
    var params = this.setupFullMustacheParams(sexpr, program, inverse),
        path = sexpr.path,
        name = path.parts[0];

    if (this.options.knownHelpers[name]) {
      this.opcode('invokeKnownHelper', params.length, name);
    } else if (this.options.knownHelpersOnly) {
      throw new _Exception2['default']('You specified knownHelpersOnly, but used the unknown helper ' + name, sexpr);
    } else {
      path.falsy = true;

      this.accept(path);
      this.opcode('invokeHelper', params.length, path.original, _AST2['default'].helpers.simpleId(path));
    }
  },

  PathExpression: function PathExpression(path) {
    this.addDepth(path.depth);
    this.opcode('getContext', path.depth);

    var name = path.parts[0],
        scoped = _AST2['default'].helpers.scopedId(path),
        blockParamId = !path.depth && !scoped && this.blockParamIndex(name);

    if (blockParamId) {
      this.opcode('lookupBlockParam', blockParamId, path.parts);
    } else if (!name) {
      // Context reference, i.e. `{{foo .}}` or `{{foo ..}}`
      this.opcode('pushContext');
    } else if (path.data) {
      this.options.data = true;
      this.opcode('lookupData', path.depth, path.parts);
    } else {
      this.opcode('lookupOnContext', path.parts, path.falsy, scoped);
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
    this.opcodes.push({ opcode: name, args: slice.call(arguments, 1), loc: this.sourceNode[0].loc });
  },

  addDepth: function addDepth(depth) {
    if (!depth) {
      return;
    }

    this.useDepths = true;
  },

  classifySexpr: function classifySexpr(sexpr) {
    var isSimple = _AST2['default'].helpers.simpleId(sexpr.path);

    var isBlockParam = isSimple && !!this.blockParamIndex(sexpr.path.parts[0]);

    // a mustache is an eligible helper if:
    // * its id is simple (a single part, not `this` or `..`)
    var isHelper = !isBlockParam && _AST2['default'].helpers.helperExpression(sexpr);

    // if a mustache is an eligible helper but not a definite
    // helper, it is ambiguous, and will be resolved in a later
    // pass or at runtime.
    var isEligible = !isBlockParam && (isHelper || isSimple);

    // if ambiguous, we can possibly resolve the ambiguity now
    // An eligible helper is one that does not have a complex path, i.e. `this.foo`, `../foo` etc.
    if (isEligible && !isHelper) {
      var _name2 = sexpr.path.parts[0],
          options = this.options;

      if (options.knownHelpers[_name2]) {
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
        if (val.parts && !_AST2['default'].helpers.scopedId(val) && !val.depth) {
          blockParamIndex = this.blockParamIndex(val.parts[0]);
        }
        if (blockParamIndex) {
          var blockParamChild = val.parts.slice(1).join('.');
          this.opcode('pushId', 'BlockParam', blockParamIndex, blockParamChild);
        } else {
          value = val.original || value;
          if (value.replace) {
            value = value.replace(/^\.\//g, '').replace(/^\.$/g, '');
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
          param = blockParams && _isArray$indexOf.indexOf(blockParams, name);
      if (blockParams && param >= 0) {
        return [depth, param];
      }
    }
  }
};

function precompile(input, options, env) {
  if (input == null || typeof input !== 'string' && input.type !== 'Program') {
    throw new _Exception2['default']('You must pass a string or Handlebars AST to Handlebars.precompile. You passed ' + input);
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

function compile(input, _x, env) {
  var options = arguments[1] === undefined ? {} : arguments[1];

  if (input == null || typeof input !== 'string' && input.type !== 'Program') {
    throw new _Exception2['default']('You must pass a string or Handlebars AST to Handlebars.compile. You passed ' + input);
  }

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

  if (_isArray$indexOf.isArray(a) && _isArray$indexOf.isArray(b) && a.length === b.length) {
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
    sexpr.path = new _AST2['default'].PathExpression(false, 0, [literal.original + ''], literal.original + '', literal.loc);
  }
}
},{"../exception":92,"../utils":96,"./ast":82}],86:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;
exports.SourceLocation = SourceLocation;
exports.id = id;
exports.stripFlags = stripFlags;
exports.stripComment = stripComment;
exports.preparePath = preparePath;
exports.prepareMustache = prepareMustache;
exports.prepareRawBlock = prepareRawBlock;
exports.prepareBlock = prepareBlock;

var _Exception = require('../exception');

var _Exception2 = _interopRequireWildcard(_Exception);

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
    return token.substr(1, token.length - 2);
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
  return comment.replace(/^\{\{~?\!-?-?/, '').replace(/-?-?~?\}\}$/, '');
}

function preparePath(data, parts, locInfo) {
  locInfo = this.locInfo(locInfo);

  var original = data ? '@' : '',
      dig = [],
      depth = 0,
      depthString = '';

  for (var i = 0, l = parts.length; i < l; i++) {
    var part = parts[i].part,

    // If we have [] syntax then we do not treat path references as operators,
    // i.e. foo.[this] resolves to approximately context.foo['this']
    isLiteral = parts[i].original !== part;
    original += (parts[i].separator || '') + part;

    if (!isLiteral && (part === '..' || part === '.' || part === 'this')) {
      if (dig.length > 0) {
        throw new _Exception2['default']('Invalid path: ' + original, { loc: locInfo });
      } else if (part === '..') {
        depth++;
        depthString += '../';
      }
    } else {
      dig.push(part);
    }
  }

  return new this.PathExpression(data, depth, dig, original, locInfo);
}

function prepareMustache(path, params, hash, open, strip, locInfo) {
  // Must use charAt to support IE pre-10
  var escapeFlag = open.charAt(3) || open.charAt(2),
      escaped = escapeFlag !== '{' && escapeFlag !== '&';

  return new this.MustacheStatement(path, params, hash, escaped, strip, this.locInfo(locInfo));
}

function prepareRawBlock(openRawBlock, content, close, locInfo) {
  if (openRawBlock.path.original !== close) {
    var errorNode = { loc: openRawBlock.path.loc };

    throw new _Exception2['default'](openRawBlock.path.original + ' doesn\'t match ' + close, errorNode);
  }

  locInfo = this.locInfo(locInfo);
  var program = new this.Program([content], null, {}, locInfo);

  return new this.BlockStatement(openRawBlock.path, openRawBlock.params, openRawBlock.hash, program, undefined, {}, {}, {}, locInfo);
}

function prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {
  // When we are chaining inverse calls, we will not have a close path
  if (close && close.path && openBlock.path.original !== close.path.original) {
    var errorNode = { loc: openBlock.path.loc };

    throw new _Exception2['default'](openBlock.path.original + ' doesn\'t match ' + close.path.original, errorNode);
  }

  program.blockParams = openBlock.blockParams;

  var inverse = undefined,
      inverseStrip = undefined;

  if (inverseAndProgram) {
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

  return new this.BlockStatement(openBlock.path, openBlock.params, openBlock.hash, program, inverse, openBlock.strip, inverseStrip, close && close.strip, this.locInfo(locInfo));
}
},{"../exception":92}],87:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;

var _COMPILER_REVISION$REVISION_CHANGES = require('../base');

var _Exception = require('../exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var _isArray = require('../utils');

var _CodeGen = require('./code-gen');

var _CodeGen2 = _interopRequireWildcard(_CodeGen);

function Literal(value) {
  this.value = value;
}

function JavaScriptCompiler() {}

JavaScriptCompiler.prototype = {
  // PUBLIC API: You can override these methods in a subclass to provide
  // alternative compiled forms for name lookup and buffering semantics
  nameLookup: function nameLookup(parent, name /* , type*/) {
    if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
      return [parent, '.', name];
    } else {
      return [parent, '[\'', name, '\']'];
    }
  },
  depthedLookup: function depthedLookup(name) {
    return [this.aliasable('this.lookup'), '(depths, "', name, '")'];
  },

  compilerInfo: function compilerInfo() {
    var revision = _COMPILER_REVISION$REVISION_CHANGES.COMPILER_REVISION,
        versions = _COMPILER_REVISION$REVISION_CHANGES.REVISION_CHANGES[revision];
    return [revision, versions];
  },

  appendToBuffer: function appendToBuffer(source, location, explicit) {
    // Force a source as this simplifies the merge logic.
    if (!_isArray.isArray(source)) {
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

  compile: function compile(environment, options, context, asObject) {
    this.environment = environment;
    this.options = options;
    this.stringParams = this.options.stringParams;
    this.trackIds = this.options.trackIds;
    this.precompile = !asObject;

    this.name = this.environment.name;
    this.isChild = !!context;
    this.context = context || {
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

    this.useDepths = this.useDepths || environment.useDepths || this.options.compat;
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
      throw new _Exception2['default']('Compile completed with content left on stack');
    }

    var fn = this.createFunctionContext(asObject);
    if (!this.isChild) {
      var ret = {
        compiler: this.compilerInfo(),
        main: fn
      };
      var programs = this.context.programs;
      for (i = 0, l = programs.length; i < l; i++) {
        if (programs[i]) {
          ret[i] = programs[i];
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
    this.source = new _CodeGen2['default'](this.options.srcName);
  },

  createFunctionContext: function createFunctionContext(asObject) {
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
    for (var alias in this.aliases) {
      // eslint-disable-line guard-for-in
      var node = this.aliases[alias];

      if (this.aliases.hasOwnProperty(alias) && node.children && node.referenceCount > 1) {
        varDeclarations += ', alias' + ++aliasCount + '=' + alias;
        node.children[0] = 'alias' + aliasCount;
      }
    }

    var params = ['depth0', 'helpers', 'partials', 'data'];

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
    var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),
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
    var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),
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
        this.pushSource(['else { ', this.appendToBuffer('\'\'', undefined, true), ' }']);
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
    this.pushSource(this.appendToBuffer([this.aliasable('this.escapeExpression'), '(', this.popStack(), ')']));
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
  lookupOnContext: function lookupOnContext(parts, falsy, scoped) {
    var i = 0;

    if (!scoped && this.options.compat && !this.lastContext) {
      // The depthed query is expected to handle the undefined logic for the root level that
      // is implemented below, so we evaluate that directly in compat mode
      this.push(this.depthedLookup(parts[i++]));
    } else {
      this.pushContext();
    }

    this.resolvePath('context', parts, i, falsy);
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
  lookupData: function lookupData(depth, parts) {
    if (!depth) {
      this.pushStackLiteral('data');
    } else {
      this.pushStackLiteral('this.data(data, ' + depth + ')');
    }

    this.resolvePath('data', parts, 0, true);
  },

  resolvePath: function resolvePath(type, parts, i, falsy) {
    var _this = this;

    if (this.options.strict || this.options.assumeObjects) {
      this.push(strictLookup(this.options.strict, this, parts, type));
      return;
    }

    var len = parts.length;
    for (; i < len; i++) {
      /*eslint-disable no-loop-func */
      this.replaceStack(function (current) {
        var lookup = _this.nameLookup(current, parts[i], type);
        // We want to ensure that zero and false are handled properly if the context (falsy flag)
        // needs to have the special handling for these values.
        if (!falsy) {
          return [' != null ? ', lookup, ' : ', current];
        } else {
          // Otherwise we can use generic falsy handling
          return [' && ', lookup];
        }
      });
      /*eslint-enable no-loop-func */
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
    this.push([this.aliasable('this.lambda'), '(', this.popStack(), ', ', this.contextName(0), ')']);
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
    this.hash = { values: [], types: [], contexts: [], ids: [] };
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
        helper = this.setupHelper(paramSize, name),
        simple = isSimple ? [helper.name, ' || '] : '';

    var lookup = ['('].concat(simple, nonHelper);
    if (!this.options.strict) {
      lookup.push(' || ', this.aliasable('helpers.helperMissing'));
    }
    lookup.push(')');

    this.push(this.source.functionCall(lookup, 'call', helper.callParams));
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
      lookup.push(' != null ? helper : ', this.aliasable('helpers.helperMissing'));
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
        options = this.setupParams(name, 1, params, false);

    if (isDynamic) {
      name = this.popStack();
      delete options.name;
    }

    if (indent) {
      options.indent = JSON.stringify(indent);
    }
    options.helpers = 'helpers';
    options.partials = 'partials';

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

    this.push(this.source.functionCall('this.invokePartial', '', params));
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

      var index = this.matchExistingProgram(child);

      if (index == null) {
        this.context.programs.push(''); // Placeholder to prevent name conflicts for nested children
        index = this.context.programs.length;
        child.index = index;
        child.name = 'program' + index;
        this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);
        this.context.environments[index] = child;

        this.useDepths = this.useDepths || compiler.useDepths;
        this.useBlockParams = this.useBlockParams || compiler.useBlockParams;
      } else {
        child.index = index;
        child.name = 'program' + index;

        this.useDepths = this.useDepths || child.useDepths;
        this.useBlockParams = this.useBlockParams || child.useBlockParams;
      }
    }
  },
  matchExistingProgram: function matchExistingProgram(child) {
    for (var i = 0, len = this.context.environments.length; i < len; i++) {
      var environment = this.context.environments[i];
      if (environment && environment.equals(child)) {
        return i;
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

    return 'this.program(' + programParams.join(', ') + ')';
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
      throw new _Exception2['default']('replaceStack on non-inline');
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
          throw new _Exception2['default']('Invalid stack pop');
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
    var foundHelper = this.nameLookup('helpers', name, 'helper');

    return {
      params: params,
      paramsInit: paramsInit,
      name: foundHelper,
      callParams: [this.contextName(0)].concat(params)
    };
  },

  setupParams: function setupParams(helper, paramSize, params) {
    var options = {},
        contexts = [],
        types = [],
        ids = [],
        param = undefined;

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
      options.fn = program || 'this.noop';
      options.inverse = inverse || 'this.noop';
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
    var options = this.setupParams(helper, paramSize, params, true);
    options = this.objectLiteral(options);
    if (useRegister) {
      this.useRegister('options');
      params.push('options');
      return ['options=', options];
    } else {
      params.push(options);
      return '';
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
    return [compiler.aliasable('this.strict'), '(', stack, ', ', compiler.quotedString(parts[i]), ')'];
  } else {
    return stack;
  }
}

exports['default'] = JavaScriptCompiler;
module.exports = exports['default'];
},{"../base":81,"../exception":92,"../utils":96,"./code-gen":84}],88:[function(require,module,exports){
"use strict";

exports.__esModule = true;
/* istanbul ignore next */
/* Jison generated parser */
var handlebars = (function () {
    var parser = { trace: function trace() {},
        yy: {},
        symbols_: { error: 2, root: 3, program: 4, EOF: 5, program_repetition0: 6, statement: 7, mustache: 8, block: 9, rawBlock: 10, partial: 11, content: 12, COMMENT: 13, CONTENT: 14, openRawBlock: 15, END_RAW_BLOCK: 16, OPEN_RAW_BLOCK: 17, helperName: 18, openRawBlock_repetition0: 19, openRawBlock_option0: 20, CLOSE_RAW_BLOCK: 21, openBlock: 22, block_option0: 23, closeBlock: 24, openInverse: 25, block_option1: 26, OPEN_BLOCK: 27, openBlock_repetition0: 28, openBlock_option0: 29, openBlock_option1: 30, CLOSE: 31, OPEN_INVERSE: 32, openInverse_repetition0: 33, openInverse_option0: 34, openInverse_option1: 35, openInverseChain: 36, OPEN_INVERSE_CHAIN: 37, openInverseChain_repetition0: 38, openInverseChain_option0: 39, openInverseChain_option1: 40, inverseAndProgram: 41, INVERSE: 42, inverseChain: 43, inverseChain_option0: 44, OPEN_ENDBLOCK: 45, OPEN: 46, mustache_repetition0: 47, mustache_option0: 48, OPEN_UNESCAPED: 49, mustache_repetition1: 50, mustache_option1: 51, CLOSE_UNESCAPED: 52, OPEN_PARTIAL: 53, partialName: 54, partial_repetition0: 55, partial_option0: 56, param: 57, sexpr: 58, OPEN_SEXPR: 59, sexpr_repetition0: 60, sexpr_option0: 61, CLOSE_SEXPR: 62, hash: 63, hash_repetition_plus0: 64, hashSegment: 65, ID: 66, EQUALS: 67, blockParams: 68, OPEN_BLOCK_PARAMS: 69, blockParams_repetition_plus0: 70, CLOSE_BLOCK_PARAMS: 71, path: 72, dataName: 73, STRING: 74, NUMBER: 75, BOOLEAN: 76, UNDEFINED: 77, NULL: 78, DATA: 79, pathSegments: 80, SEP: 81, $accept: 0, $end: 1 },
        terminals_: { 2: "error", 5: "EOF", 13: "COMMENT", 14: "CONTENT", 16: "END_RAW_BLOCK", 17: "OPEN_RAW_BLOCK", 21: "CLOSE_RAW_BLOCK", 27: "OPEN_BLOCK", 31: "CLOSE", 32: "OPEN_INVERSE", 37: "OPEN_INVERSE_CHAIN", 42: "INVERSE", 45: "OPEN_ENDBLOCK", 46: "OPEN", 49: "OPEN_UNESCAPED", 52: "CLOSE_UNESCAPED", 53: "OPEN_PARTIAL", 59: "OPEN_SEXPR", 62: "CLOSE_SEXPR", 66: "ID", 67: "EQUALS", 69: "OPEN_BLOCK_PARAMS", 71: "CLOSE_BLOCK_PARAMS", 74: "STRING", 75: "NUMBER", 76: "BOOLEAN", 77: "UNDEFINED", 78: "NULL", 79: "DATA", 81: "SEP" },
        productions_: [0, [3, 2], [4, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [12, 1], [10, 3], [15, 5], [9, 4], [9, 4], [22, 6], [25, 6], [36, 6], [41, 2], [43, 3], [43, 1], [24, 3], [8, 5], [8, 5], [11, 5], [57, 1], [57, 1], [58, 5], [63, 1], [65, 3], [68, 3], [18, 1], [18, 1], [18, 1], [18, 1], [18, 1], [18, 1], [18, 1], [54, 1], [54, 1], [73, 2], [72, 1], [80, 3], [80, 1], [6, 0], [6, 2], [19, 0], [19, 2], [20, 0], [20, 1], [23, 0], [23, 1], [26, 0], [26, 1], [28, 0], [28, 2], [29, 0], [29, 1], [30, 0], [30, 1], [33, 0], [33, 2], [34, 0], [34, 1], [35, 0], [35, 1], [38, 0], [38, 2], [39, 0], [39, 1], [40, 0], [40, 1], [44, 0], [44, 1], [47, 0], [47, 2], [48, 0], [48, 1], [50, 0], [50, 2], [51, 0], [51, 1], [55, 0], [55, 2], [56, 0], [56, 1], [60, 0], [60, 2], [61, 0], [61, 1], [64, 1], [64, 2], [70, 1], [70, 2]],
        performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {

            var $0 = $$.length - 1;
            switch (yystate) {
                case 1:
                    return $$[$0 - 1];
                    break;
                case 2:
                    this.$ = new yy.Program($$[$0], null, {}, yy.locInfo(this._$));
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
                    this.$ = new yy.CommentStatement(yy.stripComment($$[$0]), yy.stripFlags($$[$0], $$[$0]), yy.locInfo(this._$));
                    break;
                case 9:
                    this.$ = new yy.ContentStatement($$[$0], yy.locInfo(this._$));
                    break;
                case 10:
                    this.$ = yy.prepareRawBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
                    break;
                case 11:
                    this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1] };
                    break;
                case 12:
                    this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], false, this._$);
                    break;
                case 13:
                    this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], true, this._$);
                    break;
                case 14:
                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
                    break;
                case 15:
                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
                    break;
                case 16:
                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
                    break;
                case 17:
                    this.$ = { strip: yy.stripFlags($$[$0 - 1], $$[$0 - 1]), program: $$[$0] };
                    break;
                case 18:
                    var inverse = yy.prepareBlock($$[$0 - 2], $$[$0 - 1], $$[$0], $$[$0], false, this._$),
                        program = new yy.Program([inverse], null, {}, yy.locInfo(this._$));
                    program.chained = true;

                    this.$ = { strip: $$[$0 - 2].strip, program: program, chain: true };

                    break;
                case 19:
                    this.$ = $$[$0];
                    break;
                case 20:
                    this.$ = { path: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 2], $$[$0]) };
                    break;
                case 21:
                    this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
                    break;
                case 22:
                    this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
                    break;
                case 23:
                    this.$ = new yy.PartialStatement($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], yy.stripFlags($$[$0 - 4], $$[$0]), yy.locInfo(this._$));
                    break;
                case 24:
                    this.$ = $$[$0];
                    break;
                case 25:
                    this.$ = $$[$0];
                    break;
                case 26:
                    this.$ = new yy.SubExpression($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], yy.locInfo(this._$));
                    break;
                case 27:
                    this.$ = new yy.Hash($$[$0], yy.locInfo(this._$));
                    break;
                case 28:
                    this.$ = new yy.HashPair(yy.id($$[$0 - 2]), $$[$0], yy.locInfo(this._$));
                    break;
                case 29:
                    this.$ = yy.id($$[$0 - 1]);
                    break;
                case 30:
                    this.$ = $$[$0];
                    break;
                case 31:
                    this.$ = $$[$0];
                    break;
                case 32:
                    this.$ = new yy.StringLiteral($$[$0], yy.locInfo(this._$));
                    break;
                case 33:
                    this.$ = new yy.NumberLiteral($$[$0], yy.locInfo(this._$));
                    break;
                case 34:
                    this.$ = new yy.BooleanLiteral($$[$0], yy.locInfo(this._$));
                    break;
                case 35:
                    this.$ = new yy.UndefinedLiteral(yy.locInfo(this._$));
                    break;
                case 36:
                    this.$ = new yy.NullLiteral(yy.locInfo(this._$));
                    break;
                case 37:
                    this.$ = $$[$0];
                    break;
                case 38:
                    this.$ = $$[$0];
                    break;
                case 39:
                    this.$ = yy.preparePath(true, $$[$0], this._$);
                    break;
                case 40:
                    this.$ = yy.preparePath(false, $$[$0], this._$);
                    break;
                case 41:
                    $$[$0 - 2].push({ part: yy.id($$[$0]), original: $$[$0], separator: $$[$0 - 1] });this.$ = $$[$0 - 2];
                    break;
                case 42:
                    this.$ = [{ part: yy.id($$[$0]), original: $$[$0] }];
                    break;
                case 43:
                    this.$ = [];
                    break;
                case 44:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 45:
                    this.$ = [];
                    break;
                case 46:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 53:
                    this.$ = [];
                    break;
                case 54:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 59:
                    this.$ = [];
                    break;
                case 60:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 65:
                    this.$ = [];
                    break;
                case 66:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 73:
                    this.$ = [];
                    break;
                case 74:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 77:
                    this.$ = [];
                    break;
                case 78:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 81:
                    this.$ = [];
                    break;
                case 82:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 85:
                    this.$ = [];
                    break;
                case 86:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 89:
                    this.$ = [$$[$0]];
                    break;
                case 90:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 91:
                    this.$ = [$$[$0]];
                    break;
                case 92:
                    $$[$0 - 1].push($$[$0]);
                    break;
            }
        },
        table: [{ 3: 1, 4: 2, 5: [2, 43], 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 1: [3] }, { 5: [1, 4] }, { 5: [2, 2], 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: [1, 11], 14: [1, 18], 15: 16, 17: [1, 21], 22: 14, 25: 15, 27: [1, 19], 32: [1, 20], 37: [2, 2], 42: [2, 2], 45: [2, 2], 46: [1, 12], 49: [1, 13], 53: [1, 17] }, { 1: [2, 1] }, { 5: [2, 44], 13: [2, 44], 14: [2, 44], 17: [2, 44], 27: [2, 44], 32: [2, 44], 37: [2, 44], 42: [2, 44], 45: [2, 44], 46: [2, 44], 49: [2, 44], 53: [2, 44] }, { 5: [2, 3], 13: [2, 3], 14: [2, 3], 17: [2, 3], 27: [2, 3], 32: [2, 3], 37: [2, 3], 42: [2, 3], 45: [2, 3], 46: [2, 3], 49: [2, 3], 53: [2, 3] }, { 5: [2, 4], 13: [2, 4], 14: [2, 4], 17: [2, 4], 27: [2, 4], 32: [2, 4], 37: [2, 4], 42: [2, 4], 45: [2, 4], 46: [2, 4], 49: [2, 4], 53: [2, 4] }, { 5: [2, 5], 13: [2, 5], 14: [2, 5], 17: [2, 5], 27: [2, 5], 32: [2, 5], 37: [2, 5], 42: [2, 5], 45: [2, 5], 46: [2, 5], 49: [2, 5], 53: [2, 5] }, { 5: [2, 6], 13: [2, 6], 14: [2, 6], 17: [2, 6], 27: [2, 6], 32: [2, 6], 37: [2, 6], 42: [2, 6], 45: [2, 6], 46: [2, 6], 49: [2, 6], 53: [2, 6] }, { 5: [2, 7], 13: [2, 7], 14: [2, 7], 17: [2, 7], 27: [2, 7], 32: [2, 7], 37: [2, 7], 42: [2, 7], 45: [2, 7], 46: [2, 7], 49: [2, 7], 53: [2, 7] }, { 5: [2, 8], 13: [2, 8], 14: [2, 8], 17: [2, 8], 27: [2, 8], 32: [2, 8], 37: [2, 8], 42: [2, 8], 45: [2, 8], 46: [2, 8], 49: [2, 8], 53: [2, 8] }, { 18: 22, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 33, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 4: 34, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 37: [2, 43], 42: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 4: 35, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 42: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 12: 36, 14: [1, 18] }, { 18: 38, 54: 37, 58: 39, 59: [1, 40], 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 5: [2, 9], 13: [2, 9], 14: [2, 9], 16: [2, 9], 17: [2, 9], 27: [2, 9], 32: [2, 9], 37: [2, 9], 42: [2, 9], 45: [2, 9], 46: [2, 9], 49: [2, 9], 53: [2, 9] }, { 18: 41, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 42, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 43, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 31: [2, 73], 47: 44, 59: [2, 73], 66: [2, 73], 74: [2, 73], 75: [2, 73], 76: [2, 73], 77: [2, 73], 78: [2, 73], 79: [2, 73] }, { 21: [2, 30], 31: [2, 30], 52: [2, 30], 59: [2, 30], 62: [2, 30], 66: [2, 30], 69: [2, 30], 74: [2, 30], 75: [2, 30], 76: [2, 30], 77: [2, 30], 78: [2, 30], 79: [2, 30] }, { 21: [2, 31], 31: [2, 31], 52: [2, 31], 59: [2, 31], 62: [2, 31], 66: [2, 31], 69: [2, 31], 74: [2, 31], 75: [2, 31], 76: [2, 31], 77: [2, 31], 78: [2, 31], 79: [2, 31] }, { 21: [2, 32], 31: [2, 32], 52: [2, 32], 59: [2, 32], 62: [2, 32], 66: [2, 32], 69: [2, 32], 74: [2, 32], 75: [2, 32], 76: [2, 32], 77: [2, 32], 78: [2, 32], 79: [2, 32] }, { 21: [2, 33], 31: [2, 33], 52: [2, 33], 59: [2, 33], 62: [2, 33], 66: [2, 33], 69: [2, 33], 74: [2, 33], 75: [2, 33], 76: [2, 33], 77: [2, 33], 78: [2, 33], 79: [2, 33] }, { 21: [2, 34], 31: [2, 34], 52: [2, 34], 59: [2, 34], 62: [2, 34], 66: [2, 34], 69: [2, 34], 74: [2, 34], 75: [2, 34], 76: [2, 34], 77: [2, 34], 78: [2, 34], 79: [2, 34] }, { 21: [2, 35], 31: [2, 35], 52: [2, 35], 59: [2, 35], 62: [2, 35], 66: [2, 35], 69: [2, 35], 74: [2, 35], 75: [2, 35], 76: [2, 35], 77: [2, 35], 78: [2, 35], 79: [2, 35] }, { 21: [2, 36], 31: [2, 36], 52: [2, 36], 59: [2, 36], 62: [2, 36], 66: [2, 36], 69: [2, 36], 74: [2, 36], 75: [2, 36], 76: [2, 36], 77: [2, 36], 78: [2, 36], 79: [2, 36] }, { 21: [2, 40], 31: [2, 40], 52: [2, 40], 59: [2, 40], 62: [2, 40], 66: [2, 40], 69: [2, 40], 74: [2, 40], 75: [2, 40], 76: [2, 40], 77: [2, 40], 78: [2, 40], 79: [2, 40], 81: [1, 45] }, { 66: [1, 32], 80: 46 }, { 21: [2, 42], 31: [2, 42], 52: [2, 42], 59: [2, 42], 62: [2, 42], 66: [2, 42], 69: [2, 42], 74: [2, 42], 75: [2, 42], 76: [2, 42], 77: [2, 42], 78: [2, 42], 79: [2, 42], 81: [2, 42] }, { 50: 47, 52: [2, 77], 59: [2, 77], 66: [2, 77], 74: [2, 77], 75: [2, 77], 76: [2, 77], 77: [2, 77], 78: [2, 77], 79: [2, 77] }, { 23: 48, 36: 50, 37: [1, 52], 41: 51, 42: [1, 53], 43: 49, 45: [2, 49] }, { 26: 54, 41: 55, 42: [1, 53], 45: [2, 51] }, { 16: [1, 56] }, { 31: [2, 81], 55: 57, 59: [2, 81], 66: [2, 81], 74: [2, 81], 75: [2, 81], 76: [2, 81], 77: [2, 81], 78: [2, 81], 79: [2, 81] }, { 31: [2, 37], 59: [2, 37], 66: [2, 37], 74: [2, 37], 75: [2, 37], 76: [2, 37], 77: [2, 37], 78: [2, 37], 79: [2, 37] }, { 31: [2, 38], 59: [2, 38], 66: [2, 38], 74: [2, 38], 75: [2, 38], 76: [2, 38], 77: [2, 38], 78: [2, 38], 79: [2, 38] }, { 18: 58, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 28: 59, 31: [2, 53], 59: [2, 53], 66: [2, 53], 69: [2, 53], 74: [2, 53], 75: [2, 53], 76: [2, 53], 77: [2, 53], 78: [2, 53], 79: [2, 53] }, { 31: [2, 59], 33: 60, 59: [2, 59], 66: [2, 59], 69: [2, 59], 74: [2, 59], 75: [2, 59], 76: [2, 59], 77: [2, 59], 78: [2, 59], 79: [2, 59] }, { 19: 61, 21: [2, 45], 59: [2, 45], 66: [2, 45], 74: [2, 45], 75: [2, 45], 76: [2, 45], 77: [2, 45], 78: [2, 45], 79: [2, 45] }, { 18: 65, 31: [2, 75], 48: 62, 57: 63, 58: 66, 59: [1, 40], 63: 64, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 66: [1, 70] }, { 21: [2, 39], 31: [2, 39], 52: [2, 39], 59: [2, 39], 62: [2, 39], 66: [2, 39], 69: [2, 39], 74: [2, 39], 75: [2, 39], 76: [2, 39], 77: [2, 39], 78: [2, 39], 79: [2, 39], 81: [1, 45] }, { 18: 65, 51: 71, 52: [2, 79], 57: 72, 58: 66, 59: [1, 40], 63: 73, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 24: 74, 45: [1, 75] }, { 45: [2, 50] }, { 4: 76, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 37: [2, 43], 42: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 45: [2, 19] }, { 18: 77, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 4: 78, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 24: 79, 45: [1, 75] }, { 45: [2, 52] }, { 5: [2, 10], 13: [2, 10], 14: [2, 10], 17: [2, 10], 27: [2, 10], 32: [2, 10], 37: [2, 10], 42: [2, 10], 45: [2, 10], 46: [2, 10], 49: [2, 10], 53: [2, 10] }, { 18: 65, 31: [2, 83], 56: 80, 57: 81, 58: 66, 59: [1, 40], 63: 82, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 59: [2, 85], 60: 83, 62: [2, 85], 66: [2, 85], 74: [2, 85], 75: [2, 85], 76: [2, 85], 77: [2, 85], 78: [2, 85], 79: [2, 85] }, { 18: 65, 29: 84, 31: [2, 55], 57: 85, 58: 66, 59: [1, 40], 63: 86, 64: 67, 65: 68, 66: [1, 69], 69: [2, 55], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 65, 31: [2, 61], 34: 87, 57: 88, 58: 66, 59: [1, 40], 63: 89, 64: 67, 65: 68, 66: [1, 69], 69: [2, 61], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 65, 20: 90, 21: [2, 47], 57: 91, 58: 66, 59: [1, 40], 63: 92, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 31: [1, 93] }, { 31: [2, 74], 59: [2, 74], 66: [2, 74], 74: [2, 74], 75: [2, 74], 76: [2, 74], 77: [2, 74], 78: [2, 74], 79: [2, 74] }, { 31: [2, 76] }, { 21: [2, 24], 31: [2, 24], 52: [2, 24], 59: [2, 24], 62: [2, 24], 66: [2, 24], 69: [2, 24], 74: [2, 24], 75: [2, 24], 76: [2, 24], 77: [2, 24], 78: [2, 24], 79: [2, 24] }, { 21: [2, 25], 31: [2, 25], 52: [2, 25], 59: [2, 25], 62: [2, 25], 66: [2, 25], 69: [2, 25], 74: [2, 25], 75: [2, 25], 76: [2, 25], 77: [2, 25], 78: [2, 25], 79: [2, 25] }, { 21: [2, 27], 31: [2, 27], 52: [2, 27], 62: [2, 27], 65: 94, 66: [1, 95], 69: [2, 27] }, { 21: [2, 89], 31: [2, 89], 52: [2, 89], 62: [2, 89], 66: [2, 89], 69: [2, 89] }, { 21: [2, 42], 31: [2, 42], 52: [2, 42], 59: [2, 42], 62: [2, 42], 66: [2, 42], 67: [1, 96], 69: [2, 42], 74: [2, 42], 75: [2, 42], 76: [2, 42], 77: [2, 42], 78: [2, 42], 79: [2, 42], 81: [2, 42] }, { 21: [2, 41], 31: [2, 41], 52: [2, 41], 59: [2, 41], 62: [2, 41], 66: [2, 41], 69: [2, 41], 74: [2, 41], 75: [2, 41], 76: [2, 41], 77: [2, 41], 78: [2, 41], 79: [2, 41], 81: [2, 41] }, { 52: [1, 97] }, { 52: [2, 78], 59: [2, 78], 66: [2, 78], 74: [2, 78], 75: [2, 78], 76: [2, 78], 77: [2, 78], 78: [2, 78], 79: [2, 78] }, { 52: [2, 80] }, { 5: [2, 12], 13: [2, 12], 14: [2, 12], 17: [2, 12], 27: [2, 12], 32: [2, 12], 37: [2, 12], 42: [2, 12], 45: [2, 12], 46: [2, 12], 49: [2, 12], 53: [2, 12] }, { 18: 98, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 36: 50, 37: [1, 52], 41: 51, 42: [1, 53], 43: 100, 44: 99, 45: [2, 71] }, { 31: [2, 65], 38: 101, 59: [2, 65], 66: [2, 65], 69: [2, 65], 74: [2, 65], 75: [2, 65], 76: [2, 65], 77: [2, 65], 78: [2, 65], 79: [2, 65] }, { 45: [2, 17] }, { 5: [2, 13], 13: [2, 13], 14: [2, 13], 17: [2, 13], 27: [2, 13], 32: [2, 13], 37: [2, 13], 42: [2, 13], 45: [2, 13], 46: [2, 13], 49: [2, 13], 53: [2, 13] }, { 31: [1, 102] }, { 31: [2, 82], 59: [2, 82], 66: [2, 82], 74: [2, 82], 75: [2, 82], 76: [2, 82], 77: [2, 82], 78: [2, 82], 79: [2, 82] }, { 31: [2, 84] }, { 18: 65, 57: 104, 58: 66, 59: [1, 40], 61: 103, 62: [2, 87], 63: 105, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 30: 106, 31: [2, 57], 68: 107, 69: [1, 108] }, { 31: [2, 54], 59: [2, 54], 66: [2, 54], 69: [2, 54], 74: [2, 54], 75: [2, 54], 76: [2, 54], 77: [2, 54], 78: [2, 54], 79: [2, 54] }, { 31: [2, 56], 69: [2, 56] }, { 31: [2, 63], 35: 109, 68: 110, 69: [1, 108] }, { 31: [2, 60], 59: [2, 60], 66: [2, 60], 69: [2, 60], 74: [2, 60], 75: [2, 60], 76: [2, 60], 77: [2, 60], 78: [2, 60], 79: [2, 60] }, { 31: [2, 62], 69: [2, 62] }, { 21: [1, 111] }, { 21: [2, 46], 59: [2, 46], 66: [2, 46], 74: [2, 46], 75: [2, 46], 76: [2, 46], 77: [2, 46], 78: [2, 46], 79: [2, 46] }, { 21: [2, 48] }, { 5: [2, 21], 13: [2, 21], 14: [2, 21], 17: [2, 21], 27: [2, 21], 32: [2, 21], 37: [2, 21], 42: [2, 21], 45: [2, 21], 46: [2, 21], 49: [2, 21], 53: [2, 21] }, { 21: [2, 90], 31: [2, 90], 52: [2, 90], 62: [2, 90], 66: [2, 90], 69: [2, 90] }, { 67: [1, 96] }, { 18: 65, 57: 112, 58: 66, 59: [1, 40], 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 5: [2, 22], 13: [2, 22], 14: [2, 22], 17: [2, 22], 27: [2, 22], 32: [2, 22], 37: [2, 22], 42: [2, 22], 45: [2, 22], 46: [2, 22], 49: [2, 22], 53: [2, 22] }, { 31: [1, 113] }, { 45: [2, 18] }, { 45: [2, 72] }, { 18: 65, 31: [2, 67], 39: 114, 57: 115, 58: 66, 59: [1, 40], 63: 116, 64: 67, 65: 68, 66: [1, 69], 69: [2, 67], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 5: [2, 23], 13: [2, 23], 14: [2, 23], 17: [2, 23], 27: [2, 23], 32: [2, 23], 37: [2, 23], 42: [2, 23], 45: [2, 23], 46: [2, 23], 49: [2, 23], 53: [2, 23] }, { 62: [1, 117] }, { 59: [2, 86], 62: [2, 86], 66: [2, 86], 74: [2, 86], 75: [2, 86], 76: [2, 86], 77: [2, 86], 78: [2, 86], 79: [2, 86] }, { 62: [2, 88] }, { 31: [1, 118] }, { 31: [2, 58] }, { 66: [1, 120], 70: 119 }, { 31: [1, 121] }, { 31: [2, 64] }, { 14: [2, 11] }, { 21: [2, 28], 31: [2, 28], 52: [2, 28], 62: [2, 28], 66: [2, 28], 69: [2, 28] }, { 5: [2, 20], 13: [2, 20], 14: [2, 20], 17: [2, 20], 27: [2, 20], 32: [2, 20], 37: [2, 20], 42: [2, 20], 45: [2, 20], 46: [2, 20], 49: [2, 20], 53: [2, 20] }, { 31: [2, 69], 40: 122, 68: 123, 69: [1, 108] }, { 31: [2, 66], 59: [2, 66], 66: [2, 66], 69: [2, 66], 74: [2, 66], 75: [2, 66], 76: [2, 66], 77: [2, 66], 78: [2, 66], 79: [2, 66] }, { 31: [2, 68], 69: [2, 68] }, { 21: [2, 26], 31: [2, 26], 52: [2, 26], 59: [2, 26], 62: [2, 26], 66: [2, 26], 69: [2, 26], 74: [2, 26], 75: [2, 26], 76: [2, 26], 77: [2, 26], 78: [2, 26], 79: [2, 26] }, { 13: [2, 14], 14: [2, 14], 17: [2, 14], 27: [2, 14], 32: [2, 14], 37: [2, 14], 42: [2, 14], 45: [2, 14], 46: [2, 14], 49: [2, 14], 53: [2, 14] }, { 66: [1, 125], 71: [1, 124] }, { 66: [2, 91], 71: [2, 91] }, { 13: [2, 15], 14: [2, 15], 17: [2, 15], 27: [2, 15], 32: [2, 15], 42: [2, 15], 45: [2, 15], 46: [2, 15], 49: [2, 15], 53: [2, 15] }, { 31: [1, 126] }, { 31: [2, 70] }, { 31: [2, 29] }, { 66: [2, 92], 71: [2, 92] }, { 13: [2, 16], 14: [2, 16], 17: [2, 16], 27: [2, 16], 32: [2, 16], 37: [2, 16], 42: [2, 16], 45: [2, 16], 46: [2, 16], 49: [2, 16], 53: [2, 16] }],
        defaultActions: { 4: [2, 1], 49: [2, 50], 51: [2, 19], 55: [2, 52], 64: [2, 76], 73: [2, 80], 78: [2, 17], 82: [2, 84], 92: [2, 48], 99: [2, 18], 100: [2, 72], 105: [2, 88], 107: [2, 58], 110: [2, 64], 111: [2, 11], 123: [2, 70], 124: [2, 29] },
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
                this.yytext = this.matched = this.match = "";
                this.conditionStack = ["INITIAL"];
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
                return (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "");
            },
            upcomingInput: function upcomingInput() {
                var next = this.match;
                if (next.length < 20) {
                    next += this._input.substr(0, 20 - next.length);
                }
                return (next.substr(0, 20) + (next.length > 20 ? "..." : "")).replace(/\n/g, "");
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
                    this.yytext = "";
                    this.match = "";
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
                    if (token) {
                        return token;
                    } else {
                        return;
                    }
                }
                if (this._input === "") {
                    return this.EOF;
                } else {
                    return this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), { text: "", token: null, line: this.yylineno });
                }
            },
            lex: function lex() {
                var r = this.next();
                if (typeof r !== "undefined") {
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
                return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng - end);
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
                    if (yy_.yytext) {
                        return 14;
                    }break;
                case 1:
                    return 14;
                    break;
                case 2:
                    this.popState();
                    return 14;

                    break;
                case 3:
                    yy_.yytext = yy_.yytext.substr(5, yy_.yyleng - 9);
                    this.popState();
                    return 16;

                    break;
                case 4:
                    return 14;
                    break;
                case 5:
                    this.popState();
                    return 13;

                    break;
                case 6:
                    return 59;
                    break;
                case 7:
                    return 62;
                    break;
                case 8:
                    return 17;
                    break;
                case 9:
                    this.popState();
                    this.begin("raw");
                    return 21;

                    break;
                case 10:
                    return 53;
                    break;
                case 11:
                    return 27;
                    break;
                case 12:
                    return 45;
                    break;
                case 13:
                    this.popState();return 42;
                    break;
                case 14:
                    this.popState();return 42;
                    break;
                case 15:
                    return 32;
                    break;
                case 16:
                    return 37;
                    break;
                case 17:
                    return 49;
                    break;
                case 18:
                    return 46;
                    break;
                case 19:
                    this.unput(yy_.yytext);
                    this.popState();
                    this.begin("com");

                    break;
                case 20:
                    this.popState();
                    return 13;

                    break;
                case 21:
                    return 46;
                    break;
                case 22:
                    return 67;
                    break;
                case 23:
                    return 66;
                    break;
                case 24:
                    return 66;
                    break;
                case 25:
                    return 81;
                    break;
                case 26:
                    // ignore whitespace
                    break;
                case 27:
                    this.popState();return 52;
                    break;
                case 28:
                    this.popState();return 31;
                    break;
                case 29:
                    yy_.yytext = strip(1, 2).replace(/\\"/g, "\"");return 74;
                    break;
                case 30:
                    yy_.yytext = strip(1, 2).replace(/\\'/g, "'");return 74;
                    break;
                case 31:
                    return 79;
                    break;
                case 32:
                    return 76;
                    break;
                case 33:
                    return 76;
                    break;
                case 34:
                    return 77;
                    break;
                case 35:
                    return 78;
                    break;
                case 36:
                    return 75;
                    break;
                case 37:
                    return 69;
                    break;
                case 38:
                    return 71;
                    break;
                case 39:
                    return 66;
                    break;
                case 40:
                    return 66;
                    break;
                case 41:
                    return "INVALID";
                    break;
                case 42:
                    return 5;
                    break;
            }
        };
        lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/, /^(?:[^\x00]*?(?=(\{\{\{\{\/)))/, /^(?:[\s\S]*?--(~)?\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{\{\{)/, /^(?:\}\}\}\})/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^\s*(~)?\}\})/, /^(?:\{\{(~)?\s*else\s*(~)?\}\})/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{(~)?!--)/, /^(?:\{\{(~)?![\s\S]*?\}\})/, /^(?:\{\{(~)?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)|])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:undefined(?=([~}\s)])))/, /^(?:null(?=([~}\s)])))/, /^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/, /^(?:as\s+\|)/, /^(?:\|)/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/, /^(?:\[[^\]]*\])/, /^(?:.)/, /^(?:$)/];
        lexer.conditions = { mu: { rules: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42], inclusive: false }, emu: { rules: [2], inclusive: false }, com: { rules: [5], inclusive: false }, raw: { rules: [3, 4], inclusive: false }, INITIAL: { rules: [0, 1, 42], inclusive: true } };
        return lexer;
    })();
    parser.lexer = lexer;
    function Parser() {
        this.yy = {};
    }Parser.prototype = parser;parser.Parser = Parser;
    return new Parser();
})();exports["default"] = handlebars;
module.exports = exports["default"];
},{}],89:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;
exports.print = print;
exports.PrintVisitor = PrintVisitor;
/*eslint-disable new-cap */

var _Visitor = require('./visitor');

var _Visitor2 = _interopRequireWildcard(_Visitor);

function print(ast) {
  return new PrintVisitor().accept(ast);
}

function PrintVisitor() {
  this.padding = 0;
}

PrintVisitor.prototype = new _Visitor2['default']();

PrintVisitor.prototype.pad = function (string) {
  var out = '';

  for (var i = 0, l = this.padding; i < l; i++) {
    out = out + '  ';
  }

  out = out + string + '\n';
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
    out = out + this.accept(body[i]);
  }

  this.padding--;

  return out;
};

PrintVisitor.prototype.MustacheStatement = function (mustache) {
  return this.pad('{{ ' + this.SubExpression(mustache) + ' }}');
};

PrintVisitor.prototype.BlockStatement = function (block) {
  var out = '';

  out = out + this.pad('BLOCK:');
  this.padding++;
  out = out + this.pad(this.SubExpression(block));
  if (block.program) {
    out = out + this.pad('PROGRAM:');
    this.padding++;
    out = out + this.accept(block.program);
    this.padding--;
  }
  if (block.inverse) {
    if (block.program) {
      this.padding++;
    }
    out = out + this.pad('{{^}}');
    this.padding++;
    out = out + this.accept(block.inverse);
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

PrintVisitor.prototype.ContentStatement = function (content) {
  return this.pad('CONTENT[ \'' + content.value + '\' ]');
};

PrintVisitor.prototype.CommentStatement = function (comment) {
  return this.pad('{{! \'' + comment.value + '\' }}');
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
/*eslint-enable new-cap */
},{"./visitor":90}],90:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;

var _Exception = require('../exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var _AST = require('./ast');

var _AST2 = _interopRequireWildcard(_AST);

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
      // Hacky sanity check:
      if (value && (!value.type || !_AST2['default'][value.type])) {
        throw new _Exception2['default']('Unexpected node type "' + value.type + '" found when accepting ' + name + ' on ' + node.type);
      }
      node[name] = value;
    }
  },

  // Performs an accept operation with added sanity check to ensure
  // required keys are not removed.
  acceptRequired: function acceptRequired(node, name) {
    this.acceptKey(node, name);

    if (!node[name]) {
      throw new _Exception2['default'](node.type + ' requires ' + name);
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

  MustacheStatement: function MustacheStatement(mustache) {
    this.acceptRequired(mustache, 'path');
    this.acceptArray(mustache.params);
    this.acceptKey(mustache, 'hash');
  },

  BlockStatement: function BlockStatement(block) {
    this.acceptRequired(block, 'path');
    this.acceptArray(block.params);
    this.acceptKey(block, 'hash');

    this.acceptKey(block, 'program');
    this.acceptKey(block, 'inverse');
  },

  PartialStatement: function PartialStatement(partial) {
    this.acceptRequired(partial, 'name');
    this.acceptArray(partial.params);
    this.acceptKey(partial, 'hash');
  },

  ContentStatement: function ContentStatement() {},
  CommentStatement: function CommentStatement() {},

  SubExpression: function SubExpression(sexpr) {
    this.acceptRequired(sexpr, 'path');
    this.acceptArray(sexpr.params);
    this.acceptKey(sexpr, 'hash');
  },

  PathExpression: function PathExpression() {},

  StringLiteral: function StringLiteral() {},
  NumberLiteral: function NumberLiteral() {},
  BooleanLiteral: function BooleanLiteral() {},
  UndefinedLiteral: function UndefinedLiteral() {},
  NullLiteral: function NullLiteral() {},

  Hash: function Hash(hash) {
    this.acceptArray(hash.pairs);
  },
  HashPair: function HashPair(pair) {
    this.acceptRequired(pair, 'value');
  }
};

exports['default'] = Visitor;
module.exports = exports['default'];
/* content */ /* comment */ /* path */ /* string */ /* number */ /* bool */ /* literal */ /* literal */
},{"../exception":92,"./ast":82}],91:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;

var _Visitor = require('./visitor');

var _Visitor2 = _interopRequireWildcard(_Visitor);

function WhitespaceControl() {}
WhitespaceControl.prototype = new _Visitor2['default']();

WhitespaceControl.prototype.Program = function (program) {
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

    if (inlineStandalone) {
      omitRight(body, i);

      if (omitLeft(body, i)) {
        // If we are on a standalone node, save the indent info for partials
        if (current.type === 'PartialStatement') {
          // Pull out the whitespace from the final line
          current.indent = /([ \t]+$)/.exec(body[i - 1].original)[1];
        }
      }
    }
    if (openStandalone) {
      omitRight((current.program || current.inverse).body);

      // Strip out the previous content node if it's whitespace only
      omitLeft(body, i);
    }
    if (closeStandalone) {
      // Always strip the next node
      omitRight(body, i);

      omitLeft((current.inverse || current.program).body);
    }
  }

  return program;
};
WhitespaceControl.prototype.BlockStatement = function (block) {
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
    if (isPrevWhitespace(program.body) && isNextWhitespace(firstInverse.body)) {
      omitLeft(program.body);
      omitRight(firstInverse.body);
    }
  } else if (block.closeStrip.open) {
    omitLeft(program.body, null, true);
  }

  return strip;
};

WhitespaceControl.prototype.MustacheStatement = function (mustache) {
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

  // We omit the last node if it's whitespace only and not preceeded by a non-content node.
  var original = current.value;
  current.value = current.value.replace(multiple ? /\s+$/ : /[ \t]+$/, '');
  current.leftStripped = current.value !== original;
  return current.leftStripped;
}

exports['default'] = WhitespaceControl;
module.exports = exports['default'];
},{"./visitor":90}],92:[function(require,module,exports){
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
},{}],93:[function(require,module,exports){
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
},{}],94:[function(require,module,exports){
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
},{"./base":81,"./exception":92,"./utils":96}],95:[function(require,module,exports){
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
},{}],96:[function(require,module,exports){
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
},{}],97:[function(require,module,exports){
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

},{"../dist/cjs/handlebars":79,"../dist/cjs/handlebars/compiler/printer":89,"fs":77}],98:[function(require,module,exports){
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = require('./source-map/source-map-generator').SourceMapGenerator;
exports.SourceMapConsumer = require('./source-map/source-map-consumer').SourceMapConsumer;
exports.SourceNode = require('./source-map/source-node').SourceNode;

},{"./source-map/source-map-consumer":104,"./source-map/source-map-generator":105,"./source-map/source-node":106}],99:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');

  /**
   * A data structure which is a combination of an array and a set. Adding a new
   * member is O(1), testing for membership is O(1), and finding the index of an
   * element is O(1). Removing elements from the set is not supported. Only
   * strings are supported for membership.
   */
  function ArraySet() {
    this._array = [];
    this._set = {};
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
   * Add the given string to this set.
   *
   * @param String aStr
   */
  ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
    var isDuplicate = this.has(aStr);
    var idx = this._array.length;
    if (!isDuplicate || aAllowDuplicates) {
      this._array.push(aStr);
    }
    if (!isDuplicate) {
      this._set[util.toSetString(aStr)] = idx;
    }
  };

  /**
   * Is the given string a member of this set?
   *
   * @param String aStr
   */
  ArraySet.prototype.has = function ArraySet_has(aStr) {
    return Object.prototype.hasOwnProperty.call(this._set,
                                                util.toSetString(aStr));
  };

  /**
   * What is the index of the given string in the array?
   *
   * @param String aStr
   */
  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
    if (this.has(aStr)) {
      return this._set[util.toSetString(aStr)];
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

});

},{"./util":107,"amdefine":108}],100:[function(require,module,exports){
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
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

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
  exports.decode = function base64VLQ_decode(aStr, aOutParam) {
    var i = 0;
    var strLen = aStr.length;
    var result = 0;
    var shift = 0;
    var continuation, digit;

    do {
      if (i >= strLen) {
        throw new Error("Expected more digits in base 64 VLQ value.");
      }
      digit = base64.decode(aStr.charAt(i++));
      continuation = !!(digit & VLQ_CONTINUATION_BIT);
      digit &= VLQ_BASE_MASK;
      result = result + (digit << shift);
      shift += VLQ_BASE_SHIFT;
    } while (continuation);

    aOutParam.value = fromVLQSigned(result);
    aOutParam.rest = aStr.slice(i);
  };

});

},{"./base64":101,"amdefine":108}],101:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var charToIntMap = {};
  var intToCharMap = {};

  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    .split('')
    .forEach(function (ch, index) {
      charToIntMap[ch] = index;
      intToCharMap[index] = ch;
    });

  /**
   * Encode an integer in the range of 0 to 63 to a single base 64 digit.
   */
  exports.encode = function base64_encode(aNumber) {
    if (aNumber in intToCharMap) {
      return intToCharMap[aNumber];
    }
    throw new TypeError("Must be between 0 and 63: " + aNumber);
  };

  /**
   * Decode a single base 64 digit to an integer.
   */
  exports.decode = function base64_decode(aChar) {
    if (aChar in charToIntMap) {
      return charToIntMap[aChar];
    }
    throw new TypeError("Not a valid base 64 digit: " + aChar);
  };

});

},{"amdefine":108}],102:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * Recursive implementation of binary search.
   *
   * @param aLow Indices here and lower do not contain the needle.
   * @param aHigh Indices here and higher do not contain the needle.
   * @param aNeedle The element being searched for.
   * @param aHaystack The non-empty array being searched.
   * @param aCompare Function which takes two elements and returns -1, 0, or 1.
   */
  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
    // This function terminates when one of the following is true:
    //
    //   1. We find the exact element we are looking for.
    //
    //   2. We did not find the exact element, but we can return the index of
    //      the next closest element that is less than that element.
    //
    //   3. We did not find the exact element, and there is no next-closest
    //      element which is less than the one we are searching for, so we
    //      return -1.
    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
    var cmp = aCompare(aNeedle, aHaystack[mid], true);
    if (cmp === 0) {
      // Found the element we are looking for.
      return mid;
    }
    else if (cmp > 0) {
      // aHaystack[mid] is greater than our needle.
      if (aHigh - mid > 1) {
        // The element is in the upper half.
        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
      }
      // We did not find an exact match, return the next closest one
      // (termination case 2).
      return mid;
    }
    else {
      // aHaystack[mid] is less than our needle.
      if (mid - aLow > 1) {
        // The element is in the lower half.
        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
      }
      // The exact needle element was not found in this haystack. Determine if
      // we are in termination case (2) or (3) and return the appropriate thing.
      return aLow < 0 ? -1 : aLow;
    }
  }

  /**
   * This is an implementation of binary search which will always try and return
   * the index of next lowest value checked if there is no exact hit. This is
   * because mappings between original and generated line/col pairs are single
   * points, and there is an implicit region between each of them, so a miss
   * just means that you aren't on the very start of a region.
   *
   * @param aNeedle The element you are looking for.
   * @param aHaystack The array that is being searched.
   * @param aCompare A function which takes the needle and an element in the
   *     array and returns -1, 0, or 1 depending on whether the needle is less
   *     than, equal to, or greater than the element, respectively.
   */
  exports.search = function search(aNeedle, aHaystack, aCompare) {
    if (aHaystack.length === 0) {
      return -1;
    }
    return recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare)
  };

});

},{"amdefine":108}],103:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

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
           util.compareByGeneratedPositions(mappingA, mappingB) <= 0;
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
    var mapping;
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
      this._array.sort(util.compareByGeneratedPositions);
      this._sorted = true;
    }
    return this._array;
  };

  exports.MappingList = MappingList;

});

},{"./util":107,"amdefine":108}],104:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');
  var binarySearch = require('./binary-search');
  var ArraySet = require('./array-set').ArraySet;
  var base64VLQ = require('./base64-vlq');

  /**
   * A SourceMapConsumer instance represents a parsed source map which we can
   * query for information about the original file positions by giving it a file
   * position in the generated source.
   *
   * The only parameter is the raw source map (either as a JSON string, or
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
   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
   */
  function SourceMapConsumer(aSourceMap) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === 'string') {
      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
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

    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    sources = sources.map(util.normalize);

    // Pass `true` below to allow duplicate names and sources. While source maps
    // are intended to be compressed and deduplicated, the TypeScript compiler
    // sometimes generates source maps with duplicates in them. See Github issue
    // #72 and bugzil.la/889492.
    this._names = ArraySet.fromArray(names, true);
    this._sources = ArraySet.fromArray(sources, true);

    this.sourceRoot = sourceRoot;
    this.sourcesContent = sourcesContent;
    this._mappings = mappings;
    this.file = file;
  }

  /**
   * Create a SourceMapConsumer from a SourceMapGenerator.
   *
   * @param SourceMapGenerator aSourceMap
   *        The source map that will be consumed.
   * @returns SourceMapConsumer
   */
  SourceMapConsumer.fromSourceMap =
    function SourceMapConsumer_fromSourceMap(aSourceMap) {
      var smc = Object.create(SourceMapConsumer.prototype);

      smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
      smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
      smc.sourceRoot = aSourceMap._sourceRoot;
      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                              smc.sourceRoot);
      smc.file = aSourceMap._file;

      smc.__generatedMappings = aSourceMap._mappings.toArray().slice();
      smc.__originalMappings = aSourceMap._mappings.toArray().slice()
        .sort(util.compareByOriginalPositions);

      return smc;
    };

  /**
   * The version of the source mapping spec that we are consuming.
   */
  SourceMapConsumer.prototype._version = 3;

  /**
   * The list of original sources.
   */
  Object.defineProperty(SourceMapConsumer.prototype, 'sources', {
    get: function () {
      return this._sources.toArray().map(function (s) {
        return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
      }, this);
    }
  });

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
    get: function () {
      if (!this.__generatedMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__generatedMappings;
    }
  });

  SourceMapConsumer.prototype.__originalMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
    get: function () {
      if (!this.__originalMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__originalMappings;
    }
  });

  SourceMapConsumer.prototype._nextCharIsMappingSeparator =
    function SourceMapConsumer_nextCharIsMappingSeparator(aStr) {
      var c = aStr.charAt(0);
      return c === ";" || c === ",";
    };

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */
  SourceMapConsumer.prototype._parseMappings =
    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var str = aStr;
      var temp = {};
      var mapping;

      while (str.length > 0) {
        if (str.charAt(0) === ';') {
          generatedLine++;
          str = str.slice(1);
          previousGeneratedColumn = 0;
        }
        else if (str.charAt(0) === ',') {
          str = str.slice(1);
        }
        else {
          mapping = {};
          mapping.generatedLine = generatedLine;

          // Generated column.
          base64VLQ.decode(str, temp);
          mapping.generatedColumn = previousGeneratedColumn + temp.value;
          previousGeneratedColumn = mapping.generatedColumn;
          str = temp.rest;

          if (str.length > 0 && !this._nextCharIsMappingSeparator(str)) {
            // Original source.
            base64VLQ.decode(str, temp);
            mapping.source = this._sources.at(previousSource + temp.value);
            previousSource += temp.value;
            str = temp.rest;
            if (str.length === 0 || this._nextCharIsMappingSeparator(str)) {
              throw new Error('Found a source, but no line and column');
            }

            // Original line.
            base64VLQ.decode(str, temp);
            mapping.originalLine = previousOriginalLine + temp.value;
            previousOriginalLine = mapping.originalLine;
            // Lines are stored 0-based
            mapping.originalLine += 1;
            str = temp.rest;
            if (str.length === 0 || this._nextCharIsMappingSeparator(str)) {
              throw new Error('Found a source and line, but no column');
            }

            // Original column.
            base64VLQ.decode(str, temp);
            mapping.originalColumn = previousOriginalColumn + temp.value;
            previousOriginalColumn = mapping.originalColumn;
            str = temp.rest;

            if (str.length > 0 && !this._nextCharIsMappingSeparator(str)) {
              // Original name.
              base64VLQ.decode(str, temp);
              mapping.name = this._names.at(previousName + temp.value);
              previousName += temp.value;
              str = temp.rest;
            }
          }

          this.__generatedMappings.push(mapping);
          if (typeof mapping.originalLine === 'number') {
            this.__originalMappings.push(mapping);
          }
        }
      }

      this.__generatedMappings.sort(util.compareByGeneratedPositions);
      this.__originalMappings.sort(util.compareByOriginalPositions);
    };

  /**
   * Find the mapping that best matches the hypothetical "needle" mapping that
   * we are searching for in the given "haystack" of mappings.
   */
  SourceMapConsumer.prototype._findMapping =
    function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                           aColumnName, aComparator) {
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

      return binarySearch.search(aNeedle, aMappings, aComparator);
    };

  /**
   * Compute the last column for each generated mapping. The last column is
   * inclusive.
   */
  SourceMapConsumer.prototype.computeColumnSpans =
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
   *   - line: The line number in the generated source.
   *   - column: The column number in the generated source.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.
   *   - column: The column number in the original source, or null.
   *   - name: The original identifier, or null.
   */
  SourceMapConsumer.prototype.originalPositionFor =
    function SourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, 'line'),
        generatedColumn: util.getArg(aArgs, 'column')
      };

      var index = this._findMapping(needle,
                                    this._generatedMappings,
                                    "generatedLine",
                                    "generatedColumn",
                                    util.compareByGeneratedPositions);

      if (index >= 0) {
        var mapping = this._generatedMappings[index];

        if (mapping.generatedLine === needle.generatedLine) {
          var source = util.getArg(mapping, 'source', null);
          if (source != null && this.sourceRoot != null) {
            source = util.join(this.sourceRoot, source);
          }
          return {
            source: source,
            line: util.getArg(mapping, 'originalLine', null),
            column: util.getArg(mapping, 'originalColumn', null),
            name: util.getArg(mapping, 'name', null)
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
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * availible.
   */
  SourceMapConsumer.prototype.sourceContentFor =
    function SourceMapConsumer_sourceContentFor(aSource) {
      if (!this.sourcesContent) {
        return null;
      }

      if (this.sourceRoot != null) {
        aSource = util.relative(this.sourceRoot, aSource);
      }

      if (this._sources.has(aSource)) {
        return this.sourcesContent[this._sources.indexOf(aSource)];
      }

      var url;
      if (this.sourceRoot != null
          && (url = util.urlParse(this.sourceRoot))) {
        // XXX: file:// URIs and absolute paths lead to unexpected behavior for
        // many users. We can help them out when they expect file:// URIs to
        // behave like it would if they were running a local HTTP server. See
        // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
        if (url.scheme == "file"
            && this._sources.has(fileUriAbsPath)) {
          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
        }

        if ((!url.path || url.path == "/")
            && this._sources.has("/" + aSource)) {
          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
        }
      }

      throw new Error('"' + aSource + '" is not in the SourceMap.');
    };

  /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: The column number in the original source.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.generatedPositionFor =
    function SourceMapConsumer_generatedPositionFor(aArgs) {
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: util.getArg(aArgs, 'column')
      };

      if (this.sourceRoot != null) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }

      var index = this._findMapping(needle,
                                    this._originalMappings,
                                    "originalLine",
                                    "originalColumn",
                                    util.compareByOriginalPositions);

      if (index >= 0) {
        var mapping = this._originalMappings[index];

        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }

      return {
        line: null,
        column: null,
        lastColumn: null
      };
    };

  /**
   * Returns all generated line and column information for the original source
   * and line provided. The only argument is an object with the following
   * properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *
   * and an array of objects is returned, each with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.allGeneratedPositionsFor =
    function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
      // When there is no exact match, SourceMapConsumer.prototype._findMapping
      // returns the index of the closest mapping less than the needle. By
      // setting needle.originalColumn to Infinity, we thus find the last
      // mapping for the given line, provided such a mapping exists.
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: Infinity
      };

      if (this.sourceRoot != null) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }

      var mappings = [];

      var index = this._findMapping(needle,
                                    this._originalMappings,
                                    "originalLine",
                                    "originalColumn",
                                    util.compareByOriginalPositions);
      if (index >= 0) {
        var mapping = this._originalMappings[index];

        while (mapping && mapping.originalLine === needle.originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[--index];
        }
      }

      return mappings.reverse();
    };

  SourceMapConsumer.GENERATED_ORDER = 1;
  SourceMapConsumer.ORIGINAL_ORDER = 2;

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
        var source = mapping.source;
        if (source != null && sourceRoot != null) {
          source = util.join(sourceRoot, source);
        }
        return {
          source: source,
          generatedLine: mapping.generatedLine,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: mapping.name
        };
      }).forEach(aCallback, context);
    };

  exports.SourceMapConsumer = SourceMapConsumer;

});

},{"./array-set":99,"./base64-vlq":100,"./binary-search":102,"./util":107,"amdefine":108}],105:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

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

      if (source != null && !this._sources.has(source)) {
        this._sources.add(source);
      }

      if (name != null && !this._names.has(name)) {
        this._names.add(name);
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
          this._sourcesContents = {};
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
      var mapping;

      var mappings = this._mappings.toArray();

      for (var i = 0, len = mappings.length; i < len; i++) {
        mapping = mappings[i];

        if (mapping.generatedLine !== previousGeneratedLine) {
          previousGeneratedColumn = 0;
          while (mapping.generatedLine !== previousGeneratedLine) {
            result += ';';
            previousGeneratedLine++;
          }
        }
        else {
          if (i > 0) {
            if (!util.compareByGeneratedPositions(mapping, mappings[i - 1])) {
              continue;
            }
            result += ',';
          }
        }

        result += base64VLQ.encode(mapping.generatedColumn
                                   - previousGeneratedColumn);
        previousGeneratedColumn = mapping.generatedColumn;

        if (mapping.source != null) {
          result += base64VLQ.encode(this._sources.indexOf(mapping.source)
                                     - previousSource);
          previousSource = this._sources.indexOf(mapping.source);

          // lines are stored 0-based in SourceMap spec version 3
          result += base64VLQ.encode(mapping.originalLine - 1
                                     - previousOriginalLine);
          previousOriginalLine = mapping.originalLine - 1;

          result += base64VLQ.encode(mapping.originalColumn
                                     - previousOriginalColumn);
          previousOriginalColumn = mapping.originalColumn;

          if (mapping.name != null) {
            result += base64VLQ.encode(this._names.indexOf(mapping.name)
                                       - previousName);
            previousName = this._names.indexOf(mapping.name);
          }
        }
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
        return Object.prototype.hasOwnProperty.call(this._sourcesContents,
                                                    key)
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
      return JSON.stringify(this);
    };

  exports.SourceMapGenerator = SourceMapGenerator;

});

},{"./array-set":99,"./base64-vlq":100,"./mapping-list":103,"./util":107,"amdefine":108}],106:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

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
      // Processed fragments are removed from this array, by calling `shiftNextLine`.
      var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
      var shiftNextLine = function() {
        var lineContents = remainingLines.shift();
        // The last line of a file might not have a newline.
        var newLine = remainingLines.shift() || "";
        return lineContents + newLine;
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
            var code = "";
            // Associate first line with "lastMapping"
            addMappingWithCode(lastMapping, shiftNextLine());
            lastGeneratedLine++;
            lastGeneratedColumn = 0;
            // The remaining code is added without mapping
          } else {
            // There is no new line in between.
            // Associate the code between "lastGeneratedColumn" and
            // "mapping.generatedColumn" with "lastMapping"
            var nextLine = remainingLines[0];
            var code = nextLine.substr(0, mapping.generatedColumn -
                                          lastGeneratedColumn);
            remainingLines[0] = nextLine.substr(mapping.generatedColumn -
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
          var nextLine = remainingLines[0];
          node.add(nextLine.substr(0, mapping.generatedColumn));
          remainingLines[0] = nextLine.substr(mapping.generatedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
        }
        lastMapping = mapping;
      }, this);
      // We have processed all mappings.
      if (remainingLines.length > 0) {
        if (lastMapping) {
          // Associate the remaining code in the current line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
        }
        // and add the remaining lines without any mapping
        node.add(remainingLines.join(""));
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

});

},{"./source-map-generator":105,"./util":107,"amdefine":108}],107:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

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

  var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
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
   * - Replaces consequtive slashes with one slash.
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
    var isAbsolute = (path.charAt(0) === '/');

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

    // XXX: It is possible to remove this block, and the tests still pass!
    var url = urlParse(aRoot);
    if (aPath.charAt(0) == "/" && url && url.path == "/") {
      return aPath.slice(1);
    }

    return aPath.indexOf(aRoot + '/') === 0
      ? aPath.substr(aRoot.length + 1)
      : aPath;
  }
  exports.relative = relative;

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
    return '$' + aStr;
  }
  exports.toSetString = toSetString;

  function fromSetString(aStr) {
    return aStr.substr(1);
  }
  exports.fromSetString = fromSetString;

  function strcmp(aStr1, aStr2) {
    var s1 = aStr1 || "";
    var s2 = aStr2 || "";
    return (s1 > s2) - (s1 < s2);
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
    var cmp;

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp || onlyCompareOriginal) {
      return cmp;
    }

    cmp = strcmp(mappingA.name, mappingB.name);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    return mappingA.generatedColumn - mappingB.generatedColumn;
  };
  exports.compareByOriginalPositions = compareByOriginalPositions;

  /**
   * Comparator between two mappings where the generated positions are
   * compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same generated line and column, but different
   * source/name/original line and column the same. Useful when searching for a
   * mapping with a stubbed out mapping.
   */
  function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
    var cmp;

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp || onlyCompareGenerated) {
      return cmp;
    }

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp) {
      return cmp;
    }

    return strcmp(mappingA.name, mappingB.name);
  };
  exports.compareByGeneratedPositions = compareByGeneratedPositions;

});

},{"amdefine":108}],108:[function(require,module,exports){
/** vim: et:ts=4:sw=4:sts=4
 * @license amdefine 0.1.0 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/amdefine for details
 */

/*jslint node: true */
/*global module, process */
'use strict';

/**
 * Creates a define for node.
 * @param {Object} module the "module" object that is defined by Node for the
 * current module.
 * @param {Function} [requireFn]. Node's require function for the current module.
 * It only needs to be passed in Node versions before 0.5, when module.require
 * did not exist.
 * @returns {Function} a define function that is usable for the current node
 * module.
 */
function amdefine(module, requireFn) {
    'use strict';
    var defineCache = {},
        loaderCache = {},
        alreadyCalled = false,
        path = require('path'),
        makeRequire, stringRequire;

    /**
     * Trims the . and .. from an array of path segments.
     * It will keep a leading path segment if a .. will become
     * the first path segment, to help with module name lookups,
     * which act like paths, but can be remapped. But the end result,
     * all paths that use this function should look normalized.
     * NOTE: this method MODIFIES the input array.
     * @param {Array} ary the array of path segments.
     */
    function trimDots(ary) {
        var i, part;
        for (i = 0; ary[i]; i+= 1) {
            part = ary[i];
            if (part === '.') {
                ary.splice(i, 1);
                i -= 1;
            } else if (part === '..') {
                if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                    //End of the line. Keep at least one non-dot
                    //path segment at the front so it can be mapped
                    //correctly to disk. Otherwise, there is likely
                    //no path mapping for a path starting with '..'.
                    //This can still fail, but catches the most reasonable
                    //uses of ..
                    break;
                } else if (i > 0) {
                    ary.splice(i - 1, 2);
                    i -= 2;
                }
            }
        }
    }

    function normalize(name, baseName) {
        var baseParts;

        //Adjust any relative paths.
        if (name && name.charAt(0) === '.') {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                baseParts = baseName.split('/');
                baseParts = baseParts.slice(0, baseParts.length - 1);
                baseParts = baseParts.concat(name.split('/'));
                trimDots(baseParts);
                name = baseParts.join('/');
            }
        }

        return name;
    }

    /**
     * Create the normalize() function passed to a loader plugin's
     * normalize method.
     */
    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(id) {
        function load(value) {
            loaderCache[id] = value;
        }

        load.fromText = function (id, text) {
            //This one is difficult because the text can/probably uses
            //define, and any relative paths and requires should be relative
            //to that id was it would be found on disk. But this would require
            //bootstrapping a module/require fairly deeply from node core.
            //Not sure how best to go about that yet.
            throw new Error('amdefine does not implement load.fromText');
        };

        return load;
    }

    makeRequire = function (systemRequire, exports, module, relId) {
        function amdRequire(deps, callback) {
            if (typeof deps === 'string') {
                //Synchronous, single module require('')
                return stringRequire(systemRequire, exports, module, deps, relId);
            } else {
                //Array of dependencies with a callback.

                //Convert the dependencies to modules.
                deps = deps.map(function (depName) {
                    return stringRequire(systemRequire, exports, module, depName, relId);
                });

                //Wait for next tick to call back the require call.
                if (callback) {
                    process.nextTick(function () {
                        callback.apply(null, deps);
                    });
                }
            }
        }

        amdRequire.toUrl = function (filePath) {
            if (filePath.indexOf('.') === 0) {
                return normalize(filePath, path.dirname(module.filename));
            } else {
                return filePath;
            }
        };

        return amdRequire;
    };

    //Favor explicit value, passed in if the module wants to support Node 0.4.
    requireFn = requireFn || function req() {
        return module.require.apply(module, arguments);
    };

    function runFactory(id, deps, factory) {
        var r, e, m, result;

        if (id) {
            e = loaderCache[id] = {};
            m = {
                id: id,
                uri: __filename,
                exports: e
            };
            r = makeRequire(requireFn, e, m, id);
        } else {
            //Only support one define call per file
            if (alreadyCalled) {
                throw new Error('amdefine with no module ID cannot be called more than once per file.');
            }
            alreadyCalled = true;

            //Use the real variables from node
            //Use module.exports for exports, since
            //the exports in here is amdefine exports.
            e = module.exports;
            m = module;
            r = makeRequire(requireFn, e, m, module.id);
        }

        //If there are dependencies, they are strings, so need
        //to convert them to dependency values.
        if (deps) {
            deps = deps.map(function (depName) {
                return r(depName);
            });
        }

        //Call the factory with the right dependencies.
        if (typeof factory === 'function') {
            result = factory.apply(m.exports, deps);
        } else {
            result = factory;
        }

        if (result !== undefined) {
            m.exports = result;
            if (id) {
                loaderCache[id] = m.exports;
            }
        }
    }

    stringRequire = function (systemRequire, exports, module, id, relId) {
        //Split the ID by a ! so that
        var index = id.indexOf('!'),
            originalId = id,
            prefix, plugin;

        if (index === -1) {
            id = normalize(id, relId);

            //Straight module lookup. If it is one of the special dependencies,
            //deal with it, otherwise, delegate to node.
            if (id === 'require') {
                return makeRequire(systemRequire, exports, module, relId);
            } else if (id === 'exports') {
                return exports;
            } else if (id === 'module') {
                return module;
            } else if (loaderCache.hasOwnProperty(id)) {
                return loaderCache[id];
            } else if (defineCache[id]) {
                runFactory.apply(null, defineCache[id]);
                return loaderCache[id];
            } else {
                if(systemRequire) {
                    return systemRequire(originalId);
                } else {
                    throw new Error('No module with ID: ' + id);
                }
            }
        } else {
            //There is a plugin in play.
            prefix = id.substring(0, index);
            id = id.substring(index + 1, id.length);

            plugin = stringRequire(systemRequire, exports, module, prefix, relId);

            if (plugin.normalize) {
                id = plugin.normalize(id, makeNormalize(relId));
            } else {
                //Normalize the ID normally.
                id = normalize(id, relId);
            }

            if (loaderCache[id]) {
                return loaderCache[id];
            } else {
                plugin.load(id, makeRequire(systemRequire, exports, module, relId), makeLoad(id), {});

                return loaderCache[id];
            }
        }
    };

    //Create a define function specific to the module asking for amdefine.
    function define(id, deps, factory) {
        if (Array.isArray(id)) {
            factory = deps;
            deps = id;
            id = undefined;
        } else if (typeof id !== 'string') {
            factory = id;
            id = deps = undefined;
        }

        if (deps && !Array.isArray(deps)) {
            factory = deps;
            deps = undefined;
        }

        if (!deps) {
            deps = ['require', 'exports', 'module'];
        }

        //Set up properties for this module. If an ID, then use
        //internal cache. If no ID, then use the external variables
        //for this node module.
        if (id) {
            //Put the module in deep freeze until there is a
            //require call for it.
            defineCache[id] = [id, deps, factory];
        } else {
            runFactory(id, deps, factory);
        }
    }

    //define.require, which has access to all the values in the
    //cache. Useful for AMD modules that all have IDs in the file,
    //but need to finally export a value to node based on one of those
    //IDs.
    define.require = function (id) {
        if (loaderCache[id]) {
            return loaderCache[id];
        }

        if (defineCache[id]) {
            runFactory.apply(null, defineCache[id]);
            return loaderCache[id];
        }
    };

    define.amd = {};

    return define;
}

module.exports = amdefine;

},{"path":78}],109:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime')['default'];

},{"./dist/cjs/handlebars.runtime":80}],110:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":109}]},{},[24]);
