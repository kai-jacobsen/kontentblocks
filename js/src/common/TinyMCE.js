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
      var prev = tinyMCE.get(id);
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
          ed.module.$el.trigger('tinymce.change');
        });
      };
      console.log(settings);
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