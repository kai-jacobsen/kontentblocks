(function($) {
    'use strict';

    var models = {},
            views = {},
            collections = {},
            etch = {};

    // versioning as per semver.org
    etch.VERSION = '0.6.2';

    etch.config = {
        // selector to specify editable elements   
        selector: '.editable',
        // Named sets of buttons to be specified on the editable element
        // in the markup as "data-button-class"   
        buttonClasses: {
            'default': ['bold', 'italic', 'underline','unordered-list', 'ordered-list', 'link', 'clear-formatting', 'save'],
            'all': ['bold', 'italic', 'underline', 'unordered-list', 'ordered-list', 'link', 'clear-formatting', 'save'],
            'title': ['bold', 'italic', 'underline', 'save']
        }
    };

    models.Editor = Backbone.Model;

    views.Editor = Backbone.View.extend({
        initialize: function() {
            this.$el = $(this.el);

            // Model attribute event listeners:
            _.bindAll(this, 'changeButtons', 'changePosition', 'changeEditable', 'insertImage');
            this.model.bind('change:buttons', this.changeButtons);
            this.model.bind('change:position', this.changePosition);
            this.model.bind('change:editable', this.changeEditable);

            // Init Routines:
            this.changeEditable();
        },
        events: {
            'click .etch-bold': 'toggleBold',
            'click .etch-italic': 'toggleItalic',
            'click .etch-underline': 'toggleUnderline',
            'click .etch-heading': 'toggleHeading',
            'click .etch-unordered-list': 'toggleUnorderedList',
            'click .etch-justify-left': 'justifyLeft',
            'click .etch-justify-center': 'justifyCenter',
            'click .etch-justify-right': 'justifyRight',
            'click .etch-ordered-list': 'toggleOrderedList',
            'click .etch-link': 'toggleLink',
            'click .etch-image': 'getImage',
            'click .etch-save': 'save',
            'click .etch-clear-formatting': 'clearFormatting'
        },
        changeEditable: function() {
            this.setButtonClass();
            // Im assuming that Ill add more functionality here
        },
        setButtonClass: function() {
            // check the button class of the element being edited and set the associated buttons on the model
            var editorModel = this.model;
            var buttonClass = editorModel.get('editable').attr('data-button-class') || 'default';
            editorModel.set({buttons: etch.config.buttonClasses[buttonClass]});
        },
        changeButtons: function() {
            // render the buttons into the editor-panel
            this.$el.empty();
            var view = this;
            var buttons = this.model.get('buttons');

            // hide editor panel if there are no buttons in it and exit early
            if (!buttons.length) {
                $(this.el).hide();
                return;
            }

            _.each(this.model.get('buttons'), function(button) {
                var $buttonEl = $('<a href="#" class="etch-editor-button etch-' + button + '" title="' + button.replace('-', ' ') + '"><span></span></a>');
                view.$el.append($buttonEl);
            });

            $(this.el).show('fast');
        },
        changePosition: function() {
            // animate editor-panel to new position
            var pos = this.model.get('position');
            this.$el.animate({'top': pos.y, 'left': pos.x}, {queue: false});
        },
        wrapSelection: function(selectionOrRange, elString, cb) {
            // wrap current selection with elString tag
            var range = selectionOrRange === Range ? selectionOrRange : selectionOrRange.getRangeAt(0);
            var el = document.createElement(elString);
            range.surroundContents(el);
        },
        clearFormatting: function(e) {
            e.preventDefault();
            document.execCommand('removeFormat', false, null);
        },
        toggleBold: function(e) {
            e.preventDefault();
            document.execCommand('bold', false, null);
        },
        toggleItalic: function(e) {
            e.preventDefault();
            document.execCommand('italic', false, null);
        },
        toggleUnderline: function(e) {
            e.preventDefault();
            document.execCommand('underline', false, null);
        },
        toggleHeading: function(e) {
            e.preventDefault();
            var range = window.getSelection().getRangeAt(0);
            var wrapper = range.commonAncestorContainer.parentElement;
            if ($(wrapper).is('h3')) {
                $(wrapper).replaceWith(wrapper.textContent);
                return;
            }
            var h3 = document.createElement('h3');
            range.surroundContents(h3);
        },
        urlPrompt: function(callback) {
            // This uses the default browser UI prompt to get a url.
            // Override this function if you want to implement a custom UI.

            var url = prompt('Enter a url', 'http://');

            // Ensure a new link URL starts with http:// or https:// 
            // before it's added to the DOM.
            //
            // NOTE: This implementation will disallow relative URLs from being added
            // but will make it easier for users typing external URLs.
            if (/^((http|https)...)/.test(url)) {
                callback(url);
            } else {
                callback("http://" + url);
            }
        },
        toggleLink: function(e) {
            e.preventDefault();
            var range = window.getSelection().getRangeAt(0);

            // are we in an anchor element?
            if (range.startContainer.parentNode.tagName === 'A' || range.endContainer.parentNode.tagName === 'A') {
                // unlink anchor
                document.execCommand('unlink', false, null);
            } else {
                // promt for url and create link
                this.urlPrompt(function(url) {
                    document.execCommand('createLink', false, url);
                });
            }
        },
        toggleUnorderedList: function(e) {
            e.preventDefault();
            document.execCommand('insertUnorderedList', false, null);
        },
        toggleOrderedList: function(e) {
            e.preventDefault();
            document.execCommand('insertOrderedList', false, null);
        },
        justifyLeft: function(e) {
            e.preventDefault();
            document.execCommand('justifyLeft', false, null);
        },
        justifyCenter: function(e) {
            e.preventDefault();
            document.execCommand('justifyCenter', false, null);
        },
        justifyRight: function(e) {
            e.preventDefault();
            document.execCommand('justifyRight', false, null);
        },
        getImage: function(e) {
            e.preventDefault();

            // call startUploader with callback to handle inserting it once it is uploded/cropped
            this.startUploader(this.insertImage);
        },
        startUploader: function(cb) {
            // initialize Image Uploader
            var model = new models.ImageUploader();
            var view = new views.ImageUploader({model: model});

            // stash a reference to the callback to be called after image is uploaded
            model._imageCallback = function(image) {
                view.startCropper(image, cb);
            };


            // stash reference to saved range for inserting the image once its 
            this._savedRange = window.getSelection().getRangeAt(0);

            // insert uploader html into DOM
            $('body').append(view.render().el);
        },
        insertImage: function(image) {
            // insert image - passed as a callback to startUploader
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(this._savedRange);

            var attrs = {
                'editable': this.model.get('editable'),
                'editableModel': this.model.get('editableModel')
            };

            _.extend(attrs, image);

            var model = new models.EditableImage(attrs);
            var view = new views.EditableImage({model: model});
            this._savedRange.insertNode($(view.render().el).addClass('etch-float-left')[0]);
        },
        save: function(e) {
            console.log(this);
            e.preventDefault();
            var editableModel = this.model.get('editableModel');
            editableModel.trigger('save', this.model);
        }
    });

    // tack on models, views, etc... as well as init function
    _.extend(etch, {
        models: models,
        views: views,
        collections: collections,
        // This function is to be used as callback to whatever event
        // you use to initialize editing 
        editableInit: function(e) {
            e.stopPropagation();
            var self = this;
            var target = e.target || e.srcElement;
            var $editable = $(target).etchFindEditable();

//            this.medium = this.medium || new Medium({
//                element: $editable.get(0),
//                mode: 'partial',
//                maxLength: -1,
//                placeholder: false
//            });

            $editable.on('keydown', function(e) {
//            if (e.which === 13){
//               e.preventDefault();
//               pasteHtmlAtCaret('<br>&nbsp;');
//            }
            });
            $editable.attr('contenteditable', true);

            // if the editor isn't already built, build it
            var $editor = $('.etch-editor-panel');
            var editorModel = $editor.data('model');
            if (!$editor.size()) {
                $editor = $('<div class="etch-editor-panel">');
                var editorAttrs = {editable: $editable, editableModel: this.model};
                document.body.appendChild($editor[0]);
                $editor.etchInstantiate({classType: 'Editor', attrs: editorAttrs});
                editorModel = $editor.data('model');

                // check if we are on a new editable
            } else if ($editable[0] !== editorModel.get('editable')[0]) {
                // set new editable
                editorModel.set({
                    editable: $editable,
                    editableModel: this.model
                });
            }

            // Firefox seems to be only browser that defaults to `StyleWithCSS == true`
            // so we turn it off here. Plus a try..catch to avoid an error being thrown in IE8.
            try {
                document.execCommand('StyleWithCSS', false, false);
            }
            catch (err) {
                // expecting to just eat IE8 error, but if different error, rethrow
                if (err.message !== "Invalid argument.") {
                    throw err;
                }
            }

            if (models.EditableImage) {
                // instantiate any images that may be in the editable
                var $imgs = $editable.find('img');
                if ($imgs.size()) {
                    var attrs = {editable: $editable, editableModel: this.model};
                    $imgs.each(function() {
                        var $this = $(this);
                        if (!$this.data('editableImageModel')) {
                            var editableImageModel = new models.EditableImage(attrs);
                            var editableImageView = new views.EditableImage({model: editableImageModel, el: this, tagName: this.tagName});
                            $this.data('editableImageModel', editableImageModel);
                        }
                    });
                }
            }

            self.model && self.model.trigger('etch:init');

            // listen for mousedowns that are not coming from the editor
            // and close the editor
            $('body').bind('mousedown.editor', function(e) {
                // check to see if the click was in an etch tool
                var target = e.target || e.srcElement;
                if ($(target).not('.etch-editor-panel, .etch-editor-panel *, .etch-image-tools, .etch-image-tools *').size()) {
                    // remove editor
                    self.model && self.model.trigger('etch:remove');
                    $editor.remove();

                    if (models.EditableImage) {
                        // unblind the image-tools if the editor isn't active
                        $editable.find('img').unbind('mouseenter');

                        // remove any latent image tool model references
                        $(etch.config.selector + ' img').data('editableImageModel', false);
                    }

                    // once the editor is removed, remove the body binding for it
                    $(this).unbind('mousedown.editor');
                }
            });

            editorModel.set({position: {x: e.pageX - 15, y: e.pageY - 80}});
        }
    });

    // jquery helper functions
    $.fn.etchInstantiate = function(options, cb) {
        return this.each(function() {
            var $el = $(this);
            options || (options = {});

            var settings = {
                el: this,
                attrs: {}
            };

            _.extend(settings, options);

            var model = new models[settings.classType](settings.attrs, settings);

            // initialize a view is there is one
            if (_.isFunction(views[settings.classType])) {
                var view = new views[settings.classType]({model: model, el: this, tagName: this.tagName});
            }

            // stash the model and view on the elements data object
            $el.data({model: model});
            $el.data({view: view});

            if (_.isFunction(cb)) {
                cb({model: model, view: view});
            }
        });
    };

    $.fn.etchFindEditable = function() {
        // function that looks for the editable selector on itself or its parents
        // and returns that el when it is found
        var $el = $(this);
        return $el.is(etch.config.selector) ? $el : $el.closest(etch.config.selector);
    };

    window.etch = etch;
})(jQuery);

function pasteHtmlAtCaret(html) {
    var sel, range;
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // only relatively recently standardized and is not supported in
            // some browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type !== "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
    }
}
var KB = KB || {};

KB.ModulesCollection = Backbone.Collection.extend({
    
}); 
var KB = KB || {};
KB.Templates = (function($) {

    var tmpl_cache = {};

    function getTmplCache(){
        return tmpl_cache;
    }

    function render(tmpl_name, tmpl_data) {
        
        if (!tmpl_cache[tmpl_name]) {
            var tmpl_dir = kontentblocks.config.url + 'js/templates';
            var tmpl_url = tmpl_dir + '/' + tmpl_name + '.html';

            var tmpl_string;
            $.ajax({
                url: tmpl_url,
                method: 'GET',
                async: false,
                success: function(data) {
                    tmpl_string = data;
                }
            });

            tmpl_cache[tmpl_name] = _.template(tmpl_string);
        }
        return tmpl_cache[tmpl_name](tmpl_data);
    }
    

    return {
        render: render
    };
}(jQuery));
var KB = KB || {};

KB.ModuleModel = Backbone.Model.extend({
    idAttribute: 'instance_id',
    save: function(model) {
        var module = model.get('editableModel');
        var el = model.get('editable');
        var dataset = jQuery(el).data();
        dataset.data =  jQuery(el).html();
        dataset.postId = module.get('post_id');
       
       
        jQuery.ajax({
            url: KBAppConfig.ajaxurl,
            data: {
                action: 'saveInlineEdit',
                data: dataset
            },
            type: 'POST',
            dataType: 'json',
            success: function(data) {
                
                console.log('sent');
            },
            error: function() {
                console.log('not sent');
            },
            complete: function() {
                console.log('no matter what');
            }
        });
    }
});
var KB = KB || {};
KB.OSConfig = KB.OSConfig || {};

KB.ModuleLayoutControls = Backbone.View.extend({
    initialize: function() {
        this.targetEl = this.options.parent.$el;
        
        this.render();
    },
    
    events: {
        "click a.close-controls" : "destroy"
    },
    
    render: function() {
        var that = this;
        
        this.targetEl.addClass('edit-active');
        
        this.$el.append(KB.Templates.render('fe_moduleLayoutControls', {model: this.model.toJSON()}));
        
        var container = jQuery('.os-controls-container', this.$el);
        
		// init draggable 
		// store last position on drag stop
        container.css('position', 'absolute').draggable({
            handle: 'h2',
            containment: 'window',
            stop: function(eve, ui){
                KB.OSConfig.Position = ui.position;
            }
        });
        
		// restore last position
        if (KB.OSConfig.Position){
            container.css({
                top: KB.OSConfig.Position.top,
                left: KB.OSConfig.Position.left
            });
        }
        
        jQuery('body').append(this.$el);
        this.$el.tabs();
        
        var mt = that.targetEl.css('marginTop');
        jQuery("#KBMarginTop").ionRangeSlider({
            from: parseInt(mt, 10),
            postfix: 'px',
            onChange: function(obj) {
                that.targetEl.css('marginTop', obj.fromNumber);
            }
        });
        
        var mb = that.targetEl.css('marginBottom');
        jQuery("#KBMarginBottom").ionRangeSlider({
            from: parseInt(mb, 10),
            postfix: 'px',
            onChange: function(obj) {
                that.targetEl.css('marginBottom', obj.fromNumber);
            }
        });
    },
    destroy: function(){
        this.targetEl.removeClass('edit-active');
        this.remove(); 
    }
});
var KB = KB || {};

KB.ModuleView = Backbone.View.extend({
    initialize: function() {
        this.model.bind('save', this.model.save);
        this.model.view = this;
        this.render(); 

    },
    save: function(){
        
    },
    events: {
        "click a.os-edit-block": "openVex",
        "click .editable": "initEtch",
        "click .kb-js-open-layout-controls": "openLayoutControls"
    },
    render: function() {
        console.log('render');
        this.$el.append(KB.Templates.render('module-controls', {model: this.model.toJSON()}));
    },
    initEtch: etch.editableInit,
    openVex: function() {
        
        if (KB.OpenOnsite) {
            KB.OpenOnsite.destroy();
        }
        
        KB.OpenOnsite = new KB.Backbone.OnsiteView({
            tagName: 'div',
            id: 'onsite-modal',
            model: this.model,
            view: this
        });
        
        
//        var target = this.model.get('editURL');
//        var height = jQuery(window).height();
//        jQuery('#osframe').attr('src', target).attr('height', height - 200);

//        $("#onsite-modal").reveal({animation: 'fade'});
//        KB.openedModal = vex.open({
//            content: jQuery('#onsite-modal').html(),
//            contentClassName: 'onsite',
//            afterOpen: function() {
//                jQuery('.nano').nanoScroller();
//            }
//        });
    },
    openLayoutControls: function() {

        if (KB.OpenedLayoutControls) {
            KB.OpenedLayoutControls.destroy();
        }

        KB.OpenedLayoutControls = new KB.ModuleLayoutControls({
            tagName: 'div',
            id: 'slider-unique',
            className: 'slider-controls-wrapper',
            model: this.model,
            parent: this
        });
    }

});
var KB = KB || {};

KB.Backbone = KB.Backbone || {};


KB.Backbone.OnsiteView = Backbone.View.extend({
	initialize: function() {
		var that = this;
		jQuery(KB.Templates.render('fe_onsite-form', {model: this.model.toJSON()})).appendTo(this.$el);
		this.$form = jQuery('#onsite-form', this.$el);
		this.options.timerId = 0;

		this.applyControlsSettings(this.$el);

		this.$el.css('position', 'fixed').draggable({
			handle: 'h2',
			containment: 'window',
			stop: function(eve, ui) {
				KB.OSConfig.OsPosition = ui.position;
			}
		});

		if (KB.OSConfig.OsPosition) {
			this.$el.css({
				top: KB.OSConfig.OsPosition.top,
				left: KB.OSConfig.OsPosition.left
			});
		}

		jQuery(document).on('newEditor', function(e, ed) {
			that.attachEditorEvents(ed);
		});
		jQuery(document).on('KB:osUpdate', function() {
			that.serialize();
		});
		jQuery(document).on('change', '.kb-observe', function() {
			that.serialize();
		});
		this.render();
	},
	events: {
		'keyup': 'delayInput',
		'click a.close-controls': 'destroy'
	},
	render: function() {
		var that = this;
		jQuery('body').append(this.$el);


		KB.lastAddedModule = {
			view: that
		};

		jQuery.ajax({
			url: ajaxurl,
			data: {
				action: 'getModuleOptions',
				module: that.model.toJSON()
			},
			type: 'POST',
			dataType: 'html',
			success: function(res) {
				that.$form.append(res);
				KB.Ui.initTabs();
				KB.Ui.initToggleBoxes();
				KB.TinyMCE.addEditor();
			},
			error: function() {
				console.log('e');
			}
		});

	},
	serialize: function() {
		var that = this;
		tinymce.triggerSave();
		jQuery.ajax({
			url: ajaxurl,
			data: {
				action: 'updateModuleOptions',
				data: that.$form.serialize().replace(/\'/g, '%27'),
				module: that.model.toJSON()
			},
			type: 'POST',
			dataType: 'json',
			success: function(res) {
				that.options.view.$el.html(res.html);
				that.model.set('moduleData',res.newModuleData);
				console.log(that.model);
				that.model.view.render();
			},
			error: function() {
				console.log('e');
			}
		});
	},
	delayInput: function() {
		var that = this;

		clearTimeout(this.options.timerId);
		this.options.timerId = setTimeout(function() {
			that.serialize();
		}, 150);
	},
	attachEditorEvents: function(ed) {
		var that = this;
		ed.onKeyUp.add(function() {
			that.delayInput();
		});

	},
	destroy: function() {
		this.remove();
	},
	applyControlsSettings: function($el) {
		var settings = this.model.get('settings');

		if (settings.controls && settings.controls.width){

			$el.css('width', settings.controls.width + 'px');
		}
	}

});
var KB = KB || {};


KB.Frontend = (function($) {
	var api = {};

	var Views = [];

	var Collection = new KB.ModulesCollection(KB.PageModules, {
		model: KB.ModuleModel
	});

	_.each(Collection.models, function(model) {
		Views.push(new KB.ModuleView({
			el: '#' + model.get('instance_id'), 
			model: model
		}));
	});

	$('body').append(KB.Templates.render('fe_iframe', {}));

	api.Collection = Collection;
	api.Views = Views;
	return api;
}(jQuery));