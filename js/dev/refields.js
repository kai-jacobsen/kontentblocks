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


},{"backend/Views/ContextUi/ContextColumnView":2,"backend/Views/ContextUi/ContextUiView":4,"backend/Views/ContextUi/controls/ColumnControl":5,"backend/Views/ContextUi/controls/ResetControl":6,"templates/backend/context-bar.hbs":59}],4:[function(require,module,exports){
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
},{"common/TinyMCE":16,"common/UI":17,"templates/backend/fullscreen-inner.hbs":60}],8:[function(require,module,exports){
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
},{"templates/backend/module-menu.hbs":61}],9:[function(require,module,exports){
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
},{"common/Notice":13}],10:[function(require,module,exports){
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
},{"common/Config":11}],13:[function(require,module,exports){
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
//KB.Templates
var Config = require('common/Config');
var Utilities = require('common/Utilities');
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
      templateCache[tplName] = HandlebarsKB.compile(tplString);
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
},{"common/Config":11,"common/Utilities":18}],16:[function(require,module,exports){
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

          if (ed.module){
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
        this.addEditor($el, null, 150, watch);
      } else {
        Logger.Debug.info('Editor markup could not be retrieved from the server');
      }
    }, this);

  }
};
},{"common/Ajax":9,"common/Config":11,"common/Logger":12}],17:[function(require,module,exports){
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
    $body.on('mouseenter', '.kb-js-field-identifier', function () {
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
},{"backend/Views/ContextUi/ContextRowGrid":3,"common/Ajax":9,"common/Config":11,"common/Notice":13,"common/TinyMCE":16}],18:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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
    this.listenTo(this.ModuleModel, 'change:moduleData', this.setData); // reassign data when parent obj data changes
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
    mData = Utilities.getIndex(ModuleModel.get('moduleData'), this.get('kpath'));
    this.set('value', _.extend(mData, addData)); // set merged data to this.value
  },
  // since this data is only the data of a specific field we can upstream this data to the whole module data
  upstreamData: function () {
    var ModuleModel;
    if (ModuleModel = this.get('ModuleModel')) {
      var cdata = _.clone(this.get('ModuleModel').get('moduleData'));
      Utilities.setIndex(cdata, this.get('kpath'), this.get('value'));
      ModuleModel.set('moduleData', cdata, {silent: false});
      ModuleModel.View.getDirty();
      console.log(ModuleModel);

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
},{"common/Checks":10,"common/Config":11,"common/Logger":12,"common/Payload":14,"common/Utilities":18}],21:[function(require,module,exports){
//KB.Backbone.Common.FieldControlModelModal
var FieldControlModel = require('./FieldControlModel');
module.exports = FieldControlModel.extend({
  bindHandlers: function () {
    this.listenToOnce(this.ModuleModel, 'remove', this.remove);
    this.listenTo(this.ModuleModel, 'change:moduleData', this.setData);
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
},{"./FieldControlModel":20}],22:[function(require,module,exports){
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
},{"common/Logger":12}],23:[function(require,module,exports){
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
Fields.registerObject('editor', require('./controls/editor'));
Fields.registerObject('otimes', require('./controls/otimes'));
Fields.registerObject('mlayout', require('./controls/mlayout'));

},{"./Fields":22,"./controls/color":24,"./controls/datetime":25,"./controls/editor":26,"./controls/file":27,"./controls/flexfields":28,"./controls/gallery":33,"./controls/gallery2":36,"./controls/image":39,"./controls/link":40,"./controls/mlayout":41,"./controls/otimes":48,"./controls/text":49,"./controls/textarea":50}],24:[function(require,module,exports){
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
},{"../FieldControlBaseView":19}],25:[function(require,module,exports){
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
    this.setting = this.model.get('settings') || {};
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
},{"../FieldControlBaseView":19}],26:[function(require,module,exports){
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
},{"../FieldControlBaseView":19,"common/TinyMCE":16}],27:[function(require,module,exports){
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

},{"../FieldControlBaseView":19}],28:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
var FlexfieldController = require('fields/controls/flexfields/FlexfieldsController');
module.exports = BaseView.extend({
  initialize: function () {
    this.createController();
    this.render();
  },
  render: function () {
    this.$stage = this.$('.flexible-fields--stage');
    this.FlexFieldsController.setElement(this.$stage.get(0)); // root element equals stage element
    this.FlexFieldsController.render();
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
        el: this.$('.flexible-fields--stage'),
        model: this.model,
        parentView: this
      })
    }
  }
});
},{"../FieldControlBaseView":19,"fields/controls/flexfields/FlexfieldsController":30}],29:[function(require,module,exports){
var FlexFieldModelModal = require('fields/FieldControlModelModal');
module.exports = Backbone.Collection.extend({
  model: FlexFieldModelModal
});
},{"fields/FieldControlModelModal":21}],30:[function(require,module,exports){
/**
 * Main Controller
 */
//KB.FlexibleFields.Controller
var ToggleBoxItem = require('fields/controls/flexfields/ToggleBoxItem');
var SectionBoxItem = require('fields/controls/flexfields/SectionBoxItem');
var TinyMCE = require('common/TinyMCE');
var UI = require('common/UI');
var Logger = require('common/Logger');
var FlexFieldsCollection = require('fields/controls/flexfields/FlexFieldsCollection');

module.exports = Backbone.View.extend({
  initialize: function (options) {
    // setup the flexfield configuration as set in the parent object
    // finally this.Tabs holds an array of all tabs with setup fields reference objects
    this.parentView = options.parentView;
    this.Tabs = this.setupConfig();
    this.subviews = [];
    this.Renderer = (this.model.get('renderer') == 'sections') ? SectionBoxItem : ToggleBoxItem;
    this.Fields = new FlexFieldsCollection();
    jQuery('<ul class="flexible-fields--item-list"></ul>').appendTo(this.$el);
    jQuery('<a class="button button-primary kb-flexible-fields--js-add-item">Add Item</a>').appendTo(this.$el);
    Logger.Debug.log('Fields: Flexfields instance created and initialized'); // tell the developer that I'm here

  },
  events: {
    'click .kb-flexible-fields--js-add-item': 'addItem'
  },
  initialSetup: function () {
    var data, that = this;
    data = this.model.get('value'); // model equals FieldControlModel, value equals parent obj data for this field key
    if (!_.isEmpty(data)) {
      _.each(data, function (dataobj, index) {
        if (!dataobj) {
          return;
        }
        var Item = new that.Renderer({ // new fieldset
          Controller: that,
          model: new Backbone.Model({
            _tab: {
              title: dataobj._tab.title,
              uid: index
            },
            value: new Backbone.Model(dataobj)
          })
        });
        that.subviews.push(Item);
        that.$list.append(Item.render());
      });
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
    this.setupElements();
    this.initialSetup();
  },
  derender: function () {
    this.trigger('derender'); // subviews mights listen
    this.subviews = [];

  },
  setupConfig: function () {
    var that = this;
    // config is an array of tab information with an fields subarray
    _.each(this.model.get('config'), function (tab) {
      if (!tab.fields) {
        return;
      }
      tab.fields = that.setupFields(tab.fields); // create reference object for each field
      Logger.Debug.log('Fields: Flexfields configs setup', tab.fields); // tell the developer that I'm here
    });
    return this.model.get('config'); //  ?
  },
  // these creates just reference objects for later use
  setupFields: function (fields) {
    var that = this, sfields = {};
    _.each(fields, function (field, key) { // fields i.e: { hello [$key] : { type: link, arg1: value1, etc }}
      _.defaults(field, that.model.toJSON()); // extend the individual field config with parent field information
      // just a few attributes differ from the parent
      // key, index, kpath
      // index & kpath will be set when the individual field gets created
      field.index = null;
      field.kpath = null;
      field.primeKey = key;
      sfields[key] = new Backbone.View({
        Controller: that,
        el: that.el,
        model: new Backbone.Model(field)
      });
    });
    return sfields;
  },
  setupElements: function () {
    this.$list = this.$('.flexible-fields--item-list');
    this.$addButton = this.$('.kb-flexible-fields--js-add-item');
  },
  addItem: function () {
    var Item = new this.Renderer({
      Controller: this,
      model: new Backbone.Model({
        _tab: {
          title: _.uniqueId('ff'), // initial tab title, not beautiful
          uid: _.uniqueId('ff') // initial unique index
        }
      })
    });
    this.subviews.push(Item);
    this.$list.append(Item.render());
    UI.initTabs();
    KB.Events.trigger('modal.recalibrate');
  }
});

},{"common/Logger":12,"common/TinyMCE":16,"common/UI":17,"fields/controls/flexfields/FlexFieldsCollection":29,"fields/controls/flexfields/SectionBoxItem":31,"fields/controls/flexfields/ToggleBoxItem":32}],31:[function(require,module,exports){
var ToggleBoxItem =  require('fields/controls/flexfields/ToggleBoxItem');
var tplSingleSectionBox = require('templates/fields/FlexibleFields/single-section-box.hbs');
module.exports = ToggleBoxItem.extend({
  render: function () {
    var inputName = this.createInputName(this.model.get('_tab').uid);
    var item = this.model.toJSON(); // tab information and value hold by this.model
    var $skeleton = this.$el.append(tplSingleSectionBox({ // append the outer skeletion markup for the item / toggle head & body
      item: item,
      inputName: inputName,
      uid: this.model.get('_tab').uid
    }));
    this.renderTabs($skeleton); // insert the tabs markup
    return $skeleton;
  },
  renderTabs: function ($skeleton) {
    var that = this;
    // markup strings @todo move to hbs
    var tabNavEl = HandlebarsKB.compile("<li><a href='#tab-{{ uid }}-{{ index }}'>{{ tab.label }}</a></li>");
    var tabCon = HandlebarsKB.compile("<div id='tab-{{ uid }}-{{ index }}'></div>");
    // nav
    _.each(this.Controller.Tabs, function (tab, index) { // remember: a tab holds the fields referece objects
      jQuery('.flexible-field--tab-nav', $skeleton).append(tabNavEl({ // append a nav element for each tab
        uid: that.model.get('_tab').uid,
        tab: tab,
        index: index
      }));
      var $tabsContainment = jQuery('.kb-field--tabs', $skeleton);
      // append a yet empty content container for the tab
      var $con = jQuery(tabCon({uid: that.model.get('_tab').uid, index: index})).appendTo($tabsContainment);

      // append fields to the container
      that.renderFields(tab, $con);
    });
  }

});
},{"fields/controls/flexfields/ToggleBoxItem":32,"templates/fields/FlexibleFields/single-section-box.hbs":68}],32:[function(require,module,exports){
//KB.FlexibleFields.ItemView
var Notice = require('common/Notice');
var tplSingleToggleBox = require('templates/fields/FlexibleFields/single-toggle-box.hbs');
module.exports = Backbone.View.extend({
  tagName: 'li',
  className: 'kb-flexible-fields--item-wrapper',
  initialize: function (options) {
    this.Controller = options.Controller;
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
    var inputName = this.createInputName(this.model.get('_tab').uid);
    // important to mark the index as up-to-delete by inserting the hidden field
    // delete happens during save when this field is present for an item
    this.$el.append('<input type="hidden" name="' + inputName + '[delete]" value="' + this.model.get('_tab').uid + '" >');
    Notice.notice('Please click update to save the changes', 'success');
  },
  render: function () {
    var inputName = this.createInputName(this.model.get('_tab').uid);
    var item = this.model.toJSON(); // tab information and value hold by this.model
    var $skeleton = this.$el.append(tplSingleToggleBox({ // append the outer skeletion markup for the item / toggle head & body
      item: item,
      inputName: inputName,
      uid: this.model.get('_tab').uid
    }));
    this.renderTabs($skeleton); // insert the tabs markup
    return $skeleton;
  },
  renderTabs: function ($skeleton) {
    var that = this;
    // markup strings @todo move to hbs
    var tabNavEl = HandlebarsKB.compile("<li><a href='#tab-{{ uid }}-{{ index }}'>{{ tab.label }}</a></li>");
    var tabCon = HandlebarsKB.compile("<div id='tab-{{ uid }}-{{ index }}'></div>");
    // nav
    _.each(this.Controller.Tabs, function (tab, index) { // remember: a tab holds the fields referece objects
      jQuery('.flexible-field--tab-nav', $skeleton).append(tabNavEl({ // append a nav element for each tab
        uid: that.model.get('_tab').uid,
        tab: tab,
        index: index
      }));
      var $tabsContainment = jQuery('.kb-field--tabs', $skeleton);
      // append a yet empty content container for the tab
      var $con = jQuery(tabCon({uid: that.model.get('_tab').uid, index: index})).appendTo($tabsContainment);

      // append fields to the container
      that.renderFields(tab, $con);
    });
  },
  renderFields: function (tab, $con) {
    var fieldInstance;
    var that = this, data, fieldConfig;

    /**
     * Create or get the js representation of a field template
     */
    _.each(tab.fields, function (fieldTpl) { // field is just a reference object and does nothing on it's own
      fieldTpl.model.set('index', this.model.get('_tab').uid); // field models: merged parent field and individual ff field
      fieldInstance = KB.FieldsAPI.get(fieldTpl); // get a view for the field, responsibile for the markup
      data = this.model.get('value'); // if not new item a standard backbone model
      if (!_.isUndefined(data)) {
        fieldInstance.setValue(data.get(fieldTpl.model.get('primeKey')));
      } else {
        fieldInstance.setupDefaults();
      }

      fieldTpl.listenTo(this, 'derender', fieldTpl.destroy);
      fieldInstance.listenTo(this, 'derender', fieldInstance.derender);

      $con.append(fieldInstance.render(this.uid));

      //$con.append('<input type="hidden" name="' + fieldInstance.model.get('baseId') + '[' + fieldInstance.model.get('index') + '][_mapping][' + fieldInstance.model.get('primeKey') + ']" value="' + fieldInstance.model.get('type') + '" >');

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
  setupFieldInstance: function(fieldInstance, $con){
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
      } else {
        existing.rebind();
      }


      });
    }
    });
  }
});
},{"common/Notice":13,"templates/fields/FlexibleFields/single-toggle-box.hbs":69}],33:[function(require,module,exports){
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




},{"./gallery/GalleryController":34,"fields/FieldControlBaseView":19}],34:[function(require,module,exports){
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

},{"./ImageView":35,"common/Logger":12}],35:[function(require,module,exports){
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

},{"common/TinyMCE":16,"common/UI":17,"templates/fields/Gallery/single-image.hbs":70}],36:[function(require,module,exports){
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
},{"./gallery2/Gallery2Controller":37,"fields/FieldControlBaseView":19}],37:[function(require,module,exports){
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

},{"./ImageView":38,"common/Logger":12}],38:[function(require,module,exports){
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

},{"templates/fields/Gallery2/single-image.hbs":71}],39:[function(require,module,exports){
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
    var moduleData = _.clone(this.model.get('ModuleModel').get('moduleData'));
    var path = this.model.get('kpath');
    Utilities.setIndex(moduleData, path, value);
    this.model.get('ModuleModel').set('moduleData', moduleData);
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
    if (this.attachment){
      console.log(this);
      var size = (this.attachment.get('sizes').thumbnail) ? this.attachment.get('sizes').thumbnail : this.attachment.get('sizes').full;
      return "<img src='" + size.url +"'>";
    }
    return '';

  }
});
},{"../FieldControlBaseView":19,"common/Config":11,"common/Utilities":18}],40:[function(require,module,exports){
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
},{"../FieldControlBaseView":19}],41:[function(require,module,exports){
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
},{"../FieldControlBaseView":19,"fields/controls/mlayout/MLayoutController":42}],42:[function(require,module,exports){
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
},{"fields/controls/mlayout/SlotView":45}],43:[function(require,module,exports){
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
},{"common/Ajax":9,"common/Checks":10,"common/Config":11,"common/Notice":13,"shared/ModuleBrowser/ModuleBrowserController":51}],44:[function(require,module,exports){
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
    //    this.ModuleModel.set('moduleData', moddata);
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
},{"backend/Views/FullscreenView":7,"common/Ajax":9,"common/Config":11,"common/Payload":14,"common/TinyMCE":16,"common/UI":17,"fields/controls/mlayout/templates/module-view.hbs":47}],45:[function(require,module,exports){
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
},{"common/Ajax":9,"common/Config":11,"fields/controls/mlayout/ModuleBrowser":43,"fields/controls/mlayout/ModuleView":44,"fields/controls/mlayout/templates/empty.hbs":46}],46:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"kbsm-empty\">\n    add module\n</div>";
},"useData":true});

},{"hbsfy/runtime":80}],47:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"kbsm-details\">\n    <div class=\"kbsm--name\">"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.name : stack1), depth0))
    + "</div>\n</div>\n<div class=\"kbsm-actions\">\n    <div class=\"kbsm-action kbms-action--open\" data-kbtooltip=\"open form\"><span\n            class=\"dashicons dashicons-admin-generic\"></span></div>\n    <div class=\"kbsm-action kbms-action--delete\" data-kbtooltip=\"delete\"><span\n            class=\"dashicons dashicons-welcome-comments\"></span></div>\n    <div class=\"kbsm-action kbms-action--update\" data-kbtooltip=\"update\"><span\n            class=\"dashicons dashicons-update\"></span></div>\n</div>\n<div class=\"kbsm-inner\">\n\n</div>";
},"useData":true});

},{"hbsfy/runtime":80}],48:[function(require,module,exports){
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


},{"../FieldControlBaseView":19}],49:[function(require,module,exports){
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
},{"../FieldControlBaseView":19}],50:[function(require,module,exports){
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
},{"../FieldControlBaseView":19}],51:[function(require,module,exports){
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
},{"common/Ajax":9,"common/Checks":10,"common/Config":11,"common/Notice":13,"common/Payload":14,"common/TinyMCE":16,"shared/ModuleBrowser/ModuleBrowserDefinitions":52,"shared/ModuleBrowser/ModuleBrowserDescriptions":53,"shared/ModuleBrowser/ModuleBrowserNavigation":56,"shared/ModuleBrowser/ModuleDefinitionModel":58,"templates/backend/modulebrowser/module-browser.hbs":62}],52:[function(require,module,exports){
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
},{"common/Payload":14}],53:[function(require,module,exports){
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

},{"common/Templates":15,"templates/backend/modulebrowser/module-description.hbs":63,"templates/backend/modulebrowser/module-template-description.hbs":65,"templates/backend/modulebrowser/poster.hbs":67}],54:[function(require,module,exports){
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
},{"shared/ModuleBrowser/ModuleBrowserListItem":55}],55:[function(require,module,exports){
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
},{"templates/backend/modulebrowser/module-list-item.hbs":64,"templates/backend/modulebrowser/module-template-list-item.hbs":66}],56:[function(require,module,exports){
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
},{"shared/ModuleBrowser/ModuleBrowserTabItemView":57}],57:[function(require,module,exports){
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
},{"shared/ModuleBrowser/ModuleBrowserList":54}],58:[function(require,module,exports){
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
},{}],59:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"kb-context-bar grid__col grid__col--12-of-12\">\n    <ul class=\"kb-context-bar--actions\">\n\n    </ul>\n</div>";
},"useData":true});

},{"hbsfy/runtime":80}],60:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"kb-fullscreen--holder-wrap\">\n    <div class=\"kb-fullscreen--controls\">\n       <div class=\"kb-fullscreen-js-close\"><span class=\"dashicons dashicons-no-alt\"></span></div>\n    </div>\n    <div class=\"kb-fullscreen--inner\">\n\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":80}],61:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<ul class='module-actions'></ul>";
},"useData":true});

},{"hbsfy/runtime":80}],62:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"module-browser-wrapper "
    + this.escapeExpression(((helper = (helper = helpers.viewMode || (depth0 != null ? depth0.viewMode : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"viewMode","hash":{},"data":data}) : helper)))
    + "\">\n\n    <div class=\"module-browser-header module-categories\">\n        <a class=\"genericon genericon-close-alt close-browser kb-button\"></a>\n        <a class=\"dashicons dashicons-list-view module-browser--switch__list-view \"></a>\n        <a class=\"dashicons dashicons-exerpt-view module-browser--switch__excerpt-view \"></a>\n    </div>\n\n    <div class=\"module-browser__left-column kb-nano\">\n        <ul class=\"modules-list kb-nano-content\">\n\n        </ul>\n    </div>\n\n    <div class=\"module-browser__right-column kb-nano\">\n        <div class=\"module-description kb-nano-content\">\n\n        </div>\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":80}],63:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<h3>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.publicName : stack1), depth0))
    + " <div class=\"kb-button-small kb-js-create-module\">Add module</div>\n</h3>\n";
},"useData":true});

},{"hbsfy/runtime":80}],64:[function(require,module,exports){
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

},{"hbsfy/runtime":80}],65:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<h3>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.parentObject : stack1)) != null ? stack1.post_title : stack1), depth0))
    + "</h3>";
},"useData":true});

},{"hbsfy/runtime":80}],66:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"dashicons dashicons-plus kb-js-create-module\"></div>\n<h4>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.parentObject : stack1)) != null ? stack1.post_title : stack1), depth0))
    + "</h4>";
},"useData":true});

},{"hbsfy/runtime":80}],67:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"module-browser--poster-wrap\">\n    <img src=\""
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.poster : stack1), depth0))
    + "\" >\n</div>";
},"useData":true});

},{"hbsfy/runtime":80}],68:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<input type=\"hidden\" name=\""
    + alias3(((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"inputName","hash":{},"data":data}) : helper)))
    + "[_uid]\" value=\""
    + alias3(((helper = (helper = helpers.uid || (depth0 != null ? depth0.uid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"uid","hash":{},"data":data}) : helper)))
    + "\">\n<div class=\"flexible-fields--section-box\">\n    <div class=\"flexible-fields--section-title\">\n        <h3>\n            <span class=\"genericon genericon-draggable flexible-fields--js-drag-handle\"></span>\n            <span class=\"dashicons dashicons-trash flexible-fields--js-trash\"></span>\n            <input type=\"text\" value=\""
    + alias3(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1._tab : stack1)) != null ? stack1.title : stack1), depth0))
    + "\" name=\""
    + alias3(((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"inputName","hash":{},"data":data}) : helper)))
    + "[_tab][title] \">\n        </h3>\n    </div>\n    <div class=\"kb-field--tabs kb_fieldtabs\">\n        <ul class=\"flexible-field--tab-nav\">\n\n        </ul>\n\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":80}],69:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<input type=\"hidden\" name=\""
    + alias3(((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"inputName","hash":{},"data":data}) : helper)))
    + "[_uid]\" value=\""
    + alias3(((helper = (helper = helpers.uid || (depth0 != null ? depth0.uid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"uid","hash":{},"data":data}) : helper)))
    + "\">\n<div class=\"flexible-fields--toggle-title\">\n    <h3>\n        <span class=\"genericon genericon-draggable flexible-fields--js-drag-handle\"></span>\n        <span class=\"genericon genericon-expand flexible-fields--js-toggle\"></span>\n        <span class=\"dashicons dashicons-trash flexible-fields--js-trash\"></span>\n\n        <input type=\"text\" value=\""
    + alias3(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1._tab : stack1)) != null ? stack1.title : stack1), depth0))
    + "\" name=\""
    + alias3(((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"inputName","hash":{},"data":data}) : helper)))
    + "[_tab][title] \">\n    </h3>\n</div>\n<div class=\"flexible-fields--toggle-box kb-hide\">\n    <div class=\"kb-field--tabs kb_fieldtabs\">\n        <ul class=\"flexible-field--tab-nav\">\n\n        </ul>\n    </div>\n\n</div>";
},"useData":true});

},{"hbsfy/runtime":80}],70:[function(require,module,exports){
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

},{"hbsfy/runtime":80}],71:[function(require,module,exports){
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

},{"hbsfy/runtime":80}],72:[function(require,module,exports){
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
},{"./handlebars/base":73,"./handlebars/exception":74,"./handlebars/no-conflict":75,"./handlebars/runtime":76,"./handlebars/safe-string":77,"./handlebars/utils":78}],73:[function(require,module,exports){
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
},{"./exception":74,"./utils":78}],74:[function(require,module,exports){
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
},{}],75:[function(require,module,exports){
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
},{}],76:[function(require,module,exports){
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
},{"./base":73,"./exception":74,"./utils":78}],77:[function(require,module,exports){
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
},{}],78:[function(require,module,exports){
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
},{}],79:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime')['default'];

},{"./dist/cjs/handlebars.runtime":72}],80:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":79}]},{},[23]);
