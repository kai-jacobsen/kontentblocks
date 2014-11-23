/**
 * Handles all tinymce inline editors
 * @param el DOM Node
 * @returns {boolean}
 * @constructor
 */
KB.IEdit.Text = function (el) {
  var settings;

  if (_.isUndefined(el)) {
    return false;
  }

  // get settings from payload
  //@TODO needs API
  if (KB.payload.FrontSettings && KB.payload.FrontSettings[el.id]) {
    settings = (KB.payload.FrontSettings[el.id].tinymce) ? KB.payload.FrontSettings[el.id].tinymce : {};
  }

  // defaults
  var defaults = {
    theme: 'modern',
    skin: false,
    menubar: false,
    add_unload_trigger: false,
    fixed_toolbar_container: '#kb-toolbar',
    schema: 'html5',
    inline: true,
    plugins: 'textcolor, wplink',
    statusbar: false,
    preview_styles: false,
    setup: function (ed) {

      ed.on('init', function () {
        var data = jQuery(ed.bodyElement).data();
        var module = data.module, cleaned, $placeholder;
        ed.kfilter = (data.filter && data.filter === 'content') ? true : false;
        ed.module = KB.Modules.get(module);
        ed.kpath = data.kpath;
        ed.module.view.$el.addClass('inline-editor-attached');

        $placeholder = jQuery("<span class='kb-text-placeholder'>Your voice is missing</span>");

        KB.Events.trigger('KB::tinymce.new-inline-editor', ed);

        // placeholder
        cleaned = ed.getContent().replace(/\s/g, '')
          .replace(/&nbsp;/g, '')
          .replace(/<br>/g, '')
          .replace(/<p><\/p>/g, '');
        if (cleaned === '') {
          ed.setContent($placeholder.html());
          ed.placeholder = true;
        } else {
          ed.placeholder = false;
        }

      });

      ed.on('click', function (e) {
        e.stopPropagation();
      });

      ed.on('focus', function () {
        var con = KB.Util.getIndex(ed.module.get('moduleData'), ed.kpath);
        ed.previousContent = ed.getContent();
        if (ed.kfilter) {
          ed.setContent(switchEditors.wpautop(con));
        }

        jQuery('#kb-toolbar').show();
        ed.module.view.$el.addClass('inline-edit-active');

        if (ed.placeholder !== false) {
//                    ed.setContent('');
        }
      });

      ed.on('change', function () {
        _K.info('Got Dirty');
      });

      ed.addButton('kbcancleinline', {
        title: 'Stop inline Edit',
        onClick: function () {
          if (tinymce.activeEditor.isDirty()) {
            tinymce.activeEditor.module.view.getDirty();
          }
          tinymce.activeEditor.fire('blur');
          tinymce.activeEditor = null;
          tinymce.focusedEditor = null;
          document.activeElement.blur();
          jQuery('#kb-toolbar').hide();
        }
      });

      ed.on('blur', function () {
        var content, moduleData, path;
        ed.module.view.$el.removeClass('inline-edit-active');
        jQuery('#kb-toolbar').hide();
        content = ed.getContent();
        if (ed.kfilter) {
          content = switchEditors._wp_Nop(ed.getContent());
        }
        moduleData = _.clone(ed.module.get('moduleData'));
        path = ed.kpath;
        KB.Util.setIndex(moduleData, path, content);
        // && ed.kfilter set
        if (ed.isDirty()) {
          ed.placeholder = false;
          if (ed.kfilter) {
            jQuery.ajax({
              url: ajaxurl,
              data: {
                action: 'applyContentFilter',
                data: content.replace(/\'/g, '%27'),
                module: ed.module.toJSON(),
                _ajax_nonce: KB.Config.getNonce('read')
              },
              type: 'POST',
              dataType: 'html',
              success: function (res) {
                ed.setContent(res);
                ed.module.set('moduleData', moduleData);
                ed.module.trigger('kb.frontend.module.inlineUpdate');
              },
              error: function () {
//                                ed.module.trigger('change');
//                                ed.module.set('moduleData', moduleData);
              }
            });
          } else {
            ed.module.set('moduleData', moduleData);
            ed.module.trigger('kb.frontend.module.inlineUpdate');
          }
        } else {
          ed.setContent(ed.previousContent);
        }

      });
    }
  };

  defaults = _.extend(defaults, settings);
  tinymce.init(_.defaults(defaults, {
    selector: '#' + el.id
  }));

};