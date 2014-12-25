KB.TinyMCE = (function ($) {
  return {
    removeEditors: function () {
      // do nothing if it is the native editor
      $('.wp-editor-area').each(function () {
        if ($(this).attr('id') === 'wp-content-wrap' || $(this).attr('id') === 'ghosteditor') {
        } else {
          var textarea = this.id;
          tinyMCE.execCommand('mceRemoveEditor', true, textarea);
        }
      });
    },
    restoreEditors: function () {
      console.clear();
      $('.wp-editor-wrap').each(function () {
        var id = $(this).find('textarea').attr('id');
        var textarea = $(this).find('textarea');

        if (id === 'ghosteditor') {
          return;
        } else {
          textarea.val(switchEditors.wpautop(textarea.val()));
          //tinyMCE.execCommand('mceAddEditor', true, id);
          tinymce.init(tinyMCEPreInit.mceInit[id]);
          switchEditors.go(id, 'tmce');
        }

      });
    },
    addEditor: function ($el, quicktags, height, watch) {
      // get settings from native WP Editor
      // Editor may not be initialized and is not accessible through
      // the tinymce api, thats why we take the settings from preInit
      if (!$el) {
        _K.error('No scope element ($el) provided');
        return false;
      }

      if (_.isUndefined(tinyMCEPreInit)) {
        return false;
      }


      var edHeight = height || 350;
      var live = (_.isUndefined(watch)) ? true : false;
      // if no $el, we assume it's in the last added module


      // find all editors and init
      $('.wp-editor-area', $el).each(function () {
        var id = this.id;
        var settings = _.clone(tinyMCEPreInit.mceInit.ghosteditor);
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
        tinymce.init(settings);
        if (!tinyMCEPreInit.mceInit[id]) {
          tinyMCEPreInit.mceInit[id] = settings;
        }

        // doesn't wok without, but don't really know what this does

        var qtsettings = {
          'buttons': '',
          'disabled_buttons': '',
          'id': id
        };
        var qts = jQuery('#qt_' + id + '_toolbar');

        if (!qts.length) {
          new QTags(qtsettings);
        }


      });

      setTimeout(function () {
        $('.wp-editor-wrap', $el).removeClass('html-active').addClass('tmce-active');
        QTags._buttonsInit();
      }, 1500);

    },
    remoteGetEditor: function ($el, name, id, content, post_id, media, watch) {
      var pid = post_id || KB.appData.config.post.ID;
      var id = id || $el.attr('id');
      if (!media) {
        var media = false;
      }
      var editorContent = content || '';
      return KB.Ajax.send({
        action: 'getRemoteEditor',
        editorId: id + '_ed',
        editorName: name,
        post_id: pid,
        editorContent: editorContent,
        _ajax_nonce: KB.Config.getNonce('read'),
        args: {
          media_buttons: media
        }

      }, function (data) {
        $el.empty().append(data);
        this.addEditor($el, null, 150, watch);
      }, this);

    }

  };

}(jQuery));