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
    this.initToggleBoxes();
    this.flexContext();
    this.flushLocalStorage();

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
    var side = $('.area-side');
    var normal = $('.area-normal');
    var stage = $('#kontentblocks-core-ui');
    var that = this;

    jQuery('body').on('mouseover', '.kb_module--body', function () {
      var $con = $(this).closest('.kb-context-container');
      $con.addClass('active-context').removeClass('non-active-context');

      if ($con.hasClass('area-top') || $con.hasClass('area-bottom')) {
        return false;
      }

      $('.kb-context-container').not($con).addClass('non-active-context').removeClass('active-context');
    });

    side.on('click', '.kb-toggle', function () {
      if (that.isSorting) {
        return false;
      }
      side.addClass('active-context').removeClass('non-active-context');
      normal.addClass('non-active-context');
    });

    side.on('mouseenter', '.kb-open .kb-module__controls-inner', function () {
      if (side.hasClass('non-active-context')) {
        side.addClass('active-context').removeClass('non-active-context');
        normal.addClass('non-active-context').removeClass('active-context');
      }
    });

    normal.on('mouseenter', '.kb-open .kb-module__controls-inner', function () {
      if (normal.hasClass('non-active-context')) {
        normal.addClass('active-context').removeClass('non-active-context');
        side.addClass('non-active-context').removeClass('active-context');
      }
    });

    normal.on('click', '.kb-toggle', function () {
      if (that.isSorting) {
        return false;
      }
      side.delay(700).removeClass('active-context').addClass('non-active-context');
      normal.delay(700).removeClass('non-active-context').addClass('active-context');
    })
  },
  repaint: function ($el) {
    this.initTabs();
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

    // handles sorting of the blocks.
    $('.kb-module-ui__sortable', $context).sortable({
      //settings
      placeholder: "ui-state-highlight",
      ghost: true,
      connectWith: ".kb-module-ui__sortable--connect",
      handle: '.kb-move',
      cancel: 'li.disabled, li.cantsort',
      tolerance: 'pointer',
      delay: 150,
      revert: 350,
      // start event
      start: function (event, ui) {

        // set current model
        that.isSorting = true;
        $('#kontentblocks-core-ui').addClass('kb-is-sorting');
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
        $('#kontentblocks-core-ui').removeClass('kb-is-sorting');

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
      mid: module.get('instance_id'),
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
Ui.init();
module.exports = Ui;