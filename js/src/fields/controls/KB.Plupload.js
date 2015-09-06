KB.Fields.registerObject('Plupload', (function ($) {
  return {
  init: function (modalView) {
    if (!wp || !wp.media) {
      return;
    }

    wp.media.controller.KBImageDetails = wp.media.controller.State.extend({
      defaults: _.defaults({
        id:       'kb-image-details',
        title:    'Hab nix',
        content:  'image-details',
        menu:     false,
        router:   false,
        toolbar:  'image-details',
        editing:  false,
        priority: 60
      }, wp.media.controller.Library.prototype.defaults ),

      /**
       * @since 3.9.0
       *
       * @param options Attributes
       */
      initialize: function( options ) {
        this.image = options.image;
        wp.media.controller.State.prototype.initialize.apply( this, arguments );
      },

      /**
       * @since 3.9.0
       */
      activate: function() {
        this.frame.modal.$el.addClass('kb-image-details');
      }
    });


    // supersede the default MediaFrame.Post view
    var oldMediaFrame = wp.media.view.MediaFrame.ImageDetails;
    wp.media.view.MediaFrame.KBImageDetails = oldMediaFrame.extend({
      initialize: function () {
        console.clear();
        oldMediaFrame.prototype.initialize.apply(this, arguments);
      },
      createStates: function() {
        this.states.add([
          new wp.media.controller.KBImageDetails({
            image: this.image,
            editable: false
          }),
          new wp.media.controller.ImageDetails({
            image: this.image,
            editable: false
          }),
          new wp.media.controller.ReplaceImage({
            id: 'replace-image',
            library:   wp.media.query( { type: 'image' } ),
            image: this.image,
            multiple:  false,
            title:     'Bla',
            toolbar: 'replace',
            priority:  80,
            displaySettings: true
          }),
          new wp.media.controller.EditImage( {
            image: this.image,
            selection: this.options.selection
          } )
        ]);
      }
    });


      $('.kb-plupload--stage', $('body')).each(function (index, el) {
        var fid = $(el).closest('.kb-js-field-identifier').attr('id');
        var baseId = KB.payload.Fields[fid].baseId;
        var view = modalView || KB.Views.Modules.get($(el).data('module')) || new KB.FieldCollection();
        var key = KB.payload.Fields[fid].fieldkey;
        var arrayKey = KB.payload.Fields[fid].arrayKey;

        if (!view.hasField(key, arrayKey)) {

          var obj = new KB.Plupload.Controller({
            baseId: baseId,
            fid: fid,
            key: key,
            arrayKey: arrayKey,
            el: el
          });
          view.addField(key, obj, arrayKey);
        } else {
          view.getField(key, arrayKey).bootstrap.call(view.getField(key, arrayKey));
        }
      });


      jQuery.get(KB.Config.getFieldJsUrl() + 'templates/plupload/partials/file-header.hbs', {async: false}, function (res) {
        HandlebarsKB.registerPartial("plupload-file-header", res);
      });

    },
    update: function () {
      this.init();
    },
    updateFront: function (modalView) {
      this.init(modalView);
    }
  }

}(jQuery)));

KB.Plupload = {};

/*
 Generic file model as provided by plupload
 */
KB.Plupload.File = Backbone.Model.extend({
  initialize: function (file) {
    this.original = file;
  }
});

/*
 Single file view
 */
KB.Plupload.UploadFileView = Backbone.View.extend({
  tagName: 'li',
  className: 'kb-plupload__file-item',
  template: 'file-upload.hbs',
  initTemplate: 'file-upload.hbs',
  events: {
    'click' : 'openDetails'
  },
  initialize: function () {
    var data;
    this.model.original.View = this;

    data = {
      file: this.model.toJSON()
    };

    this.$el.append(KB.Templates.render(KB.Config.getFieldJsUrl() + 'templates/plupload/' + this.initTemplate, data));
    this.$progress = this.$el.find('.kb-plupload__file-percent');
    this.$progressBar = this.$el.find('.kb-plupload__file-percent-bar');
  },
  render: function () {
    return this.$el;
  },
  updateProgress: function (val) {
    this.$progress.html(val + '%');
    this.$progressBar.css('width', val + '%');
  },
  updateView: function () {
    data = {
      file: this.model.toJSON()
    };
    this.$el.html(KB.Templates.render(KB.Config.getFieldJsUrl() + 'templates/plupload/' + this.template, data));
  },
  openDetails: function () {
    var data = this.model.get('attachment');
    var mo = new wp.media.model.Attachment(data);
    this.kbFrame = new wp.media.view.MediaFrame.KBImageDetails({
      metadata: mo.toJSON(),
      state: 'kb-image-details'
    });
    this.kbFrame.open();
  }
});

KB.Plupload.ImageFileView = KB.Plupload.UploadFileView.extend({
  template: 'file-image.hbs'
});

KB.Plupload.PdfFileView = KB.Plupload.UploadFileView.extend({
  template: 'file-pdf.hbs'
});

KB.Plupload.GenericFileView = KB.Plupload.UploadFileView.extend({
  template: 'file-generic.hbs'
});

KB.Plupload.VideoFileView = KB.Plupload.UploadFileView.extend({
  template: 'file-video.hbs',
  openDetails: function(){
    console.log(this);
  }
});

/*
 Collection of files in the queue
 */
KB.Plupload.FileCollection = Backbone.Collection.extend({
  model: KB.Plupload.File
});

/*
 Overall list view handles rendering of individual files
 */
KB.Plupload.FileRenderer = Backbone.View.extend({
  tagName: 'ul',
  className: 'kb-plupload__file-list',
  initialize: function (options) {
    this.subviews = {};
    this.controller = options.controller;
    this.listenTo(this.collection, 'add', this.addView);
    this.listenTo(this.collection, 'remove', this.removeView);
    this.$el.appendTo(this.controller.$el);
  },
  addView: function (model) {
    var type = this.detectViewType(model);
    var FileView = new type({model: model});
    this.$el.append(FileView.render());

  },
  removeView: function (model) {
    console.log('remove:', model);
  },
  detectViewType: function (model) {
    var type;
    type = model.get('type');

    if (type.search('image') !== -1) {
      return KB.Plupload.ImageFileView;
    }

    if (type.search('video') !== -1) {
      return KB.Plupload.VideoFileView;

    }

    if (type.search('pdf') !== -1) {
      return KB.Plupload.PdfFileView;

    }
    return KB.Plupload.GenericFileView;


  }
});

/*
 Field controller
 basically bootstraps the field and instantiates the Uploader and corresponding views
 */
KB.Plupload.Controller = Backbone.View.extend({
  Uploader: {},
  initialize: function (params) {
    var that = this;
    this.Collection = new KB.Plupload.FileCollection();
    this.FileRenderer = new KB.Plupload.FileRenderer({collection: this.Collection, controller: this});
    this.params = params;
    this.fieldArgs = KB.Payload.getFieldArgs(params.fid);
    this._initialized = false;

    this.customSettings = this.fieldArgs.plupload || {};
    this.defaults = _.extend(KB.payload.defaults.plupload, this.customSettings, {
      container: params.fid + '-plupload__container',
      browse_button: params.fid + '-plupload-browse-button',
      drop_element: params.fid + '-plupload__drag-drop-area'
    });

    this.Uploader = new plupload.Uploader(this.defaults);
    this.Uploader.init();

    this.Uploader.bind(
      'FilesAdded',
      function (up, files) {
        if (files && files.length > 0) {
          _.each(files, function (file) {
            that.Collection.add(file);
          });
        }

        //hundredMB	= 100 * 1024 * 1024,
        //  max		= parseInt( up.settings.max_file_size, 10 );
        //$.each(
        //  files,
        //  function(i, file )
        //  {
        //    if ( file.size >= max ){
        //      alert('Too large
        //    } else {
        //
        //      $('#'+activeBlock+ ' .kb-queue').append(
        //        '<div id="' + file.id + '">' +
        //        file.name + ' (' + plupload.formatSize(file.size) + ') <b></b>' +
        //        '<div id="' + file.id +'_progress"></div>' +
        //
        //        '</div>');
        //
        //      $('#'+ file.id +'_progress').progressbar({
        //        value: 0
        //      });
        //
        //
        //    }
        //  }
        //);
        up.refresh();
        up.start();
      }
    );

    this.Uploader.bind('BeforeUpload', function (up, file) {
      // Add field_id to the ajax call
      //
      //key = $('#' + activeBlock)
      //  .find('.field-key')
      //  .val();
      //
      //up.settings.multipart_params['blockid'] = activeBlock;
      //up.settings.multipart_params['field_key'] = key;
    });

    this.Uploader.bind(
      'Error',
      function (up, e) {
        console.log(e);
        up.removeFile(e.file);
      }
    );

    this.Uploader.bind('UploadProgress', function (up, file) {
      file.View.updateProgress(file.percent);
    });

    this.Uploader.bind('FileUploaded', function (up, file, response) {
      var res = JSON.parse(response.response);
      if (res.success && file.View) {
        file.View.model.set('attachment', res.data.attachment);
        file.View.updateView();
      }
      // render error view
    });
    this.bootstrap(); // run forrest run
  },
  bootstrap: function () {
    if (!this._initialized) {
      this._initialized = true;
      _K.log('Fields: Plupload instance created and initialized');
    } else {
      _K.log('Fields: Plupload instance was already initialized. Doing nothing.')
    }
  }
});