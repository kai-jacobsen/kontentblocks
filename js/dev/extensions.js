/*! Kontentblocks DevVersion 2014-11-13 */
(function($) {
    var LayoutConfigurations = {
        el: $("#kb-layout-configurations"),
        init: function() {
            if (KB.appData.config.frontend) {
                _K.info("Layout Configurations stopped");
                return false;
            }
            _K.info("Layout Configurations start up");
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
        _selectContainer: function() {
            return $("<div class='select-container clearfix'>" + KB.i18n.Extensions.layoutConfigs.info + "</div>").appendTo(this.el);
        },
        _createSelectMenu: function() {
            $('<select name="kb-layout-configuration"></select>').appendTo(this.selectContainer);
            return $("select", this.el);
        },
        update: function() {
            var that = this;
            KB.Ajax.send({
                action: "get_layout_configurations",
                _ajax_nonce: KB.Config.getNonce("read"),
                data: {
                    areaConfig: this.areaConfig
                }
            }, function(response) {
                that.options = response;
                that.renderSelectMenu(response);
            });
        },
        save: function() {
            var that = this;
            var value = this.createInput.val();
            if (_.isEmpty(value)) {
                KB.notice("Please enter a Name for the template", "error");
                return false;
            }
            KB.Ajax.send({
                action: "set_layout_configuration",
                _ajax_nonce: KB.Config.getNonce("update"),
                data: {
                    areaConfig: this.areaConfig,
                    name: value
                }
            }, function(response) {
                that.update();
                that.createInput.val("");
                KB.notice("Saved", "success");
            });
        },
        "delete": function() {
            var that = this;
            var value = this.selectMenuEl.val();
            if (_.isEmpty(value)) {
                KB.notice("Please chose a template to delete", "error");
                return false;
            }
            KB.Ajax.send({
                action: "delete_layout_configuration",
                _ajax_nonce: KB.Config.getNonce("delete"),
                data: {
                    areaConfig: this.areaConfig,
                    name: value
                }
            }, function(response) {
                that.update();
                KB.notice("Deleted", "success");
            });
        },
        renderSelectMenu: function(data) {
            var that = this;
            that.selectMenuEl.empty();
            _.each(data, function(item, key, s) {
                that.selectMenuEl.append(_.template("<option value='<%= data.key %>'><%= data.name %></option>", {
                    data: {
                        key: key,
                        name: item.name
                    }
                }));
            });
        },
        _areaConfig: function() {
            var concat = "";
            if (KB.payload.Areas) {
                _.each(KB.payload.Areas, function(context) {
                    concat += context.id;
                    _K.debug("Layout Configurations: Concat", concat);
                });
            }
            return this.hash(concat.replace(",", ""));
        },
        hash: function(s) {
            return s.split("").reduce(function(a, b) {
                a = (a << 5) - a + b.charCodeAt(0);
                return a & a;
            }, 0);
        },
        _createContainer: function() {
            return $("<div class='create-container'></div>").appendTo(this.el);
        },
        _createInput: function() {
            return $("<input type='text' >").appendTo(this.createContainer);
        },
        _createButton: function() {
            var that = this;
            var button = $("<a class='button kb-lc-save'>Save</a>").appendTo(this.createContainer);
            button.on("click", function(e) {
                e.preventDefault();
                that.save();
            });
            return button;
        },
        _loadButton: function() {
            var that = this;
            var button = $("<a class='button-primary kb-lc-load'>Load</a>").appendTo(this.selectContainer);
            button.on("click", function(e) {
                e.preventDefault();
                that.load();
            });
            return button;
        },
        _deleteButton: function() {
            var that = this;
            var button = $("<a class='delete-js kb-lc-delete'>delete</a>").appendTo(this.selectContainer);
            button.on("click", function(e) {
                e.preventDefault();
                that.delete();
            });
            return button;
        },
        load: function() {
            var location = window.location.href + "&kb_load_configuration=" + this.selectMenuEl.val() + "&post_id=" + $("#post_ID").val() + "&config=" + this.areaConfig;
            window.location = location;
        }
    };
    LayoutConfigurations.init();
})(jQuery);

KB.AreaSelector = function($) {
    return {
        $stage: null,
        areaToEdit: null,
        $editWrap: null,
        init: function() {
            if (KB.appData.config.frontend) {
                _K.info("Area Selector stopped");
                return false;
            }
            this.sortable();
        },
        sortable: function() {
            $("#existing-areas, #active-dynamic-areas").sortable({
                connectWith: ".connect",
                cancel: "li.ui-state-disabled",
                placeholder: "sortable-placeholder",
                helper: "clone",
                receive: function(event, ui) {
                    item = ui.item;
                    id = $(item).attr("id");
                    $(item).toggleClass("dynamic-area-active");
                    if (this.id == "active-dynamic-areas") {
                        action = "<span><a href=''>edit</a></span>";
                        content = "<input id='" + id + "_hidden' type='hidden' name='active_sidebar_areas[]' value='" + id + "' />";
                        $(item).append(content);
                    } else {
                        $("input#" + id + "_hidden").remove();
                    }
                }
            });
        }
    };
}(jQuery).init();

KB.Ext.Backup = function($) {
    return {
        el: $("#backup-inspect"),
        lastItem: null,
        firstRun: true,
        init: function() {
            if (KB.appData.config.frontend) {
                _K.info("Backup Inspect stopped");
                return false;
            }
            var that = this;
            this.listEl = $("<ul></ul>").appendTo(this.el);
            if (this.listEl.length > 0) {
                this.update();
            }
            $(document).on("heartbeat-send", function(e, data) {
                data.kbBackupWatcher = that.lastItem;
                data.post_id = KB.Environment.postId;
            });
            $(document).on("heartbeat-tick", function(e, data) {
                if (data.kbHasNewBackups && _.isObject(data.kbHasNewBackups)) {
                    that.renderList(data.kbHasNewBackups);
                }
            });
        },
        update: function() {
            var that = this;
            KB.Ajax.send({
                action: "get_backups",
                _ajax_nonce: KB.Config.getNonce("read")
            }, function(response) {
                that.items = response;
                that.renderList(response);
            });
        },
        renderList: function(items) {
            var that = this;
            this.listEl.empty();
            _.each(items, function(item, key) {
                that.lastItem = key;
                that.listEl.append(_.template("                <li>\n                    <details>\n                        <summary>\n                            <%= data.time %>\n                        </summary>\n                    <div class='actions' data-id='<%= key %>'>\n                        <span class='js-restore'>Restore</span>\n                        <p class='description'><b>Comment:</b> <%= item.msg %></p>\n                    </details>\n                </li>", {
                    data: {
                        time: new moment.unix(key).format("HH:mm:ss / DD.MMM")
                    },
                    item: item,
                    key: key
                }));
            });
            _K.info("Backup Inspect::FirstRun:", this.firstRun);
            if (!this.firstRun) {
                KB.Notice.notice("<p>" + KB.i18n.Extensions.backups.newBackupcreated + "</p>", "success");
            }
            this.firstRun = false;
            this.listEl.on("click", ".js-restore", function(e) {
                var id = $(this).parent().attr("data-id");
                that.restore(id);
            });
        },
        restore: function(id) {
            var that = this;
            var location = window.location.href + "&restore_backup=" + id + "&post_id=" + $("#post_ID").val();
            window.location = location;
        }
    };
}(jQuery);

KB.Ext.Backup.init();