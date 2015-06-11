var Logger = require('common/Logger');
var Ajax = require('common/Ajax');
var Notice = require('common/Notice');
var Config = require('common/Config');
var LayoutConfigurations =
{
  el: jQuery('#kb-layout-configurations'),
  init: function () {
    if (KB.appData.config.frontend) {
      return false;
    }


    if (this.el.length === 0) {
      return false;
    }

    this.options = {};
    this.areaConfig = this._areaConfig();
    this.selectContainer = this._selectContainer();
    this.selectMenuEl = this._createSelectMenu();
    this.loadButton = this._loadButton();
    this.deleteButton = this._deleteButton();
    this.createContainer = this._createContainer();
    this.createInput = this._createInput();
    this.createButton = this._createButton();

    this.update();
  },
  _selectContainer: function () {
    return jQuery("<div class='select-container clearfix'>" + KB.i18n.Extensions.layoutConfigs.info + "</div>").appendTo(this.el);
  },
  _createSelectMenu: function () {
    jQuery('<select name="kb-layout-configuration"></select>').appendTo(this.selectContainer);
    return jQuery('select', this.el);
  },
  update: function () {
    var that = this;
    Ajax.send(
      {
        action: 'getLayoutConfig',
        _ajax_nonce: Config.getNonce('read'),
        data: {
          areaConfig: this.areaConfig
        }
      },
      function (response) {
        that.options = response;
        that.renderSelectMenu(response);
      });

  },
  save: function () {
    var that = this;
    var value = this.createInput.val();

    if (_.isEmpty(value)) {
      Notice.notice('Please enter a Name for the template', 'error');
      return false;
    }

    Ajax.send
    (
      {
        action: 'setLayoutConfig',
        _ajax_nonce: Config.getNonce('update'),
        data: {
          areaConfig: this.areaConfig,
          name: value
        }
      },
      function (response) {
        that.update();
        that.createInput.val('');
        Notice.notice('Saved', 'success');
      });

  },
  delete: function () {
    var that = this;
    var value = this.selectMenuEl.val();

    if (_.isEmpty(value)) {
      Notice.notice('Please chose a template to delete', 'error');
      return false;
    }

    Ajax.send(
      {
        action: 'deleteLayoutConfig',
        _ajax_nonce: Config.getNonce('delete'),
        data: {
          areaConfig: this.areaConfig,
          name: value
        }
      },
      function (response) {
        that.update();
        Notice.notice('Deleted', 'success');
      });

  },
  renderSelectMenu: function (data) {
    var that = this;
    that.selectMenuEl.empty();
    _.each(data, function (item, key, s) {
      that.selectMenuEl.append(_.template("<option value='<%= data.key %>'><%= data.name %></option>", {
        data: {
          key: key,
          name: item.name
        }
      }));
    });
  },
  _areaConfig: function () {

    var concat = '';

    if (KB.payload.Areas) {
      _.each(KB.payload.Areas, function (context) {
        concat += context.id;
        Logger.Debug.debug('Layout Configurations: Concat', concat);
      });
    }
    return this.hash(concat.replace(',', ''));
  },
  hash: function (s) {
    return s.split("").reduce(function (a, b) {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a
    }, 0);

  },
  _createContainer: function () {
    return (jQuery("<div class='create-container'></div>").appendTo(this.el));
  },
  _createInput: function () {
    return jQuery("<input type='text' >").appendTo(this.createContainer);

  },
  _createButton: function () {
    var that = this;
    var button = jQuery("<a class='button kb-lc-save'>Save</a>").appendTo(this.createContainer);
    button.on('click', function (e) {
      e.preventDefault();
      that.save();
    })
    return button;
  },
  _loadButton: function () {
    var that = this;
    var button = jQuery("<a class='button-primary kb-lc-load'>Load</a>").appendTo(this.selectContainer);
    button.on('click', function (e) {
      e.preventDefault();
      that.load();
    });
    return button;
  },
  _deleteButton: function () {
    var that = this;
    var button = jQuery("<a class='delete-js kb-lc-delete'>delete</a>").appendTo(this.selectContainer);
    button.on('click', function (e) {
      e.preventDefault();
      that.delete();
    });
    return button;
  },
  load: function () {
    var location = window.location.href + '&kb_load_configuration=' + this.selectMenuEl.val() + '&post_id=' + jQuery('#post_ID').val() + '&config=' + this.areaConfig;
    window.location = location;
  }

};
module.exports = LayoutConfigurations;