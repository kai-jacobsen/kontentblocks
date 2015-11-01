module.exports = function (grunt) {

  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concurrent: {
      target: {
        tasks: ['jsbackend', 'jsfrontend'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    uglify: {
      backend: {
        options: {
          banner: '/*! <%= pkg.name %> ProdVersion <%= grunt.template.today("yyyy-mm-dd hh:mm") %> */\n',
          mangle: true,
          beautify: false,
          compress: true,
          drop_console: true
        },
        files: {
          'js/dist/backend.min.js': ['<%= browserify.backend.dest %>']
        }
      },
      dist: {
        options: {
          banner: '/*! <%= pkg.name %> ProdVersion <%= grunt.template.today("yyyy-mm-dd hh:mm") %> */\n',
          mangle: true,
          beautify: false,
          compress: true,
          drop_console: true
        },
        files: {
          'js/dist/frontend.min.js': ['<%= browserify.frontend.dest %>'],
          'js/dist/backend.min.js': ['<%= browserify.backend.dest %>'],
          'js/dist/refields.min.js': ['<%= browserify.refields.dest %>'],
          'js/dist/extensions.min.js': ['<%= browserify.extensions.dest %>'],
          'js/dist/plugins.min.js': ['<%= concat.plugins.dest %>'],
          'js/dist/fieldsAPI.min.js': ['<%= browserify.fieldsAPI.dest %>'],
          'js/dist/mediaExt.min.js': ['<%= concat.mediaExt.dest %>'],
          'js/dist/customizer.min.js': ['<%= browserify.customizer.dest %>'],
          'js/dist/client.min.js' : 'js/dev/client.js'

        }
      },
      dev: {
        options: {
          banner: '/*! <%= pkg.name %> DevVersion <%= grunt.template.today("yyyy-mm-dd") %> */\n',
          mangle: false,
          beautify: true,
          compress: false,
          drop_console: false
        },
        files: {
          'js/dev/plugins.js': ['<%= concat.plugins.dest %>'],
          'js/dev/mediaExt.js': ['<%= concat.mediaExt.dest %>'],
          'js/dev/client.js' : 'js/src/client/CallbackController.js'
        }
      }
    },
    concat: {
      options: {
        seperator: ';'
      },
      plugins: {
        src: ['js/src/plugins/**/*.js'],
        dest: 'js/tmp/plugins.concat.js',
        nonull: true
      },
      mediaExt: {
        src: ['js/src/wpMediaExt/**/*.js'],
        dest: 'js/tmp/wpMediaExt.concat.js',
        nonull: true
      }
    },
    browserify: {
      options: {
        browserifyOptions: {
          paths: ["./js/src"],
          fast: true,
          detectGlobals: false,
          transform: ['hbsfy']
        }
      },
      frontend: {
        src: 'js/src/frontend/FrontendController.js',
        dest: 'js/dev/frontend.js'
      },
      fieldsAPI: {
        src: 'js/src/fieldsAPI/FieldsAPIController.js',
        dest: 'js/dev/fieldsAPI.js'
      },
      backend: {
        src: 'js/src/backend/BackendController.js',
        dest: 'js/dev/backend.js'
      },
      refields: {
        src: 'js/src/fields/RefieldsController.js',
        dest: 'js/dev/refields.js'
      },
      extensions: {
        src: 'js/src/extensions/ExtensionsController.js',
        dest: 'js/dev/extensions.js'
      },
      customizer: {
        src: 'js/src/customizer/CustomizerController.js',
        dest: 'js/dev/customizer.js'
      }
    },
    sass: {
      dist: {
        options: {                       // Target options
          outputStyle: 'compressed',
          sourceMap: false,
          sourceComments: false
        },
        files: {                         // Dictionary of files
          'css/kontentblocks.css': 'css/sass/kontentblocks.scss',
          'css/KBOsEditStyle.css': 'css/sass/KBOsEditStyle.scss',
          'css/OSinlinestyles.css': 'css/sass/OSinlinestyles.scss'
        }
      },
      dev: {
        options: {                       // Target options
          outputStyle: 'expanded',
          //includePaths: ['bower_components/foundation/scss'],
          sourceMap: false,
          sourceComments: true
        },
        files: {                         // Dictionary of files
          'css/kontentblocks.css': 'css/sass/kontentblocks.scss',
          'css/KBOsEditStyle.css': 'css/sass/KBOsEditStyle.scss',
          'css/OSinlinestyles.css': 'css/sass/OSinlinestyles.scss'
        }
      }
    },
    watch: {
      options: {
        livereload: true,
        spawn: false
      },
      backend: {
        files: ['js/src/backend/**/*.js'],
        tasks: ['jsbackend']
      },
      extensions: {
        files: ['js/src/extensions/**/*.js'],
        tasks: ['jsextensions']
      },
      frontend: {
        files: ['js/src/frontend/**/*.js'],
        tasks: ['jsfrontend']
      },
      templates: {
        files: ['js/**/*.hbs'],
        tasks: ['jshbs']
      },
      client: {
        files: ['js/src/client/**/*.js'],
        tasks: ['jsclient']
      },
      common:{
        files: ['js/src/common/**/*.js'],
        tasks: ['cc']
      },
      refields: {
        files: ['js/src/fields/**/*.js', 'js/src/shared/**/*.js', 'js/**/*.hbs'],
        tasks: ['jsrefields', 'cc']
      },
      plugins: {
        files: ['js/src/plugins/**/*.js'],
        tasks: ['jsplugins']
      },
      fieldsApi: {
        files: ['js/src/fieldsAPI/**/*.js', 'js/**/*.hbs'],
        tasks: ['jsfieldsAPI']
      },
      customizer: {
        files: ['js/src/customizer/**/*.js'],
        tasks: ['jsCustomizer']
      },
      sass: {
        options: {
          livereload: false
        },
        files: ['css/**/*.scss'],
        tasks: ['cssdev']
      },
      css: {
        files: ['css/*.css'],
        tasks: []
      },
      clover: {
        files: ['build/logs/clover.xml'],
        tasks: ['exec:report']
      },
      hbs: {
        files: ['core/Fields/**/*.hbs'],
        tasks: ['exec:removeHash', 'exec:createDevId']
      }
    },
    clean: ["js/tmp"],
    jshint: {
      src: ['js/dev/**/*.js'],
      options: {
        force: true,
        unused: true,
        browser: true,
        globals: {
          jQuery: true,
          _: true,
          Backbone: true,
          console: true
        }
      }
    },
    autoprefixer: {
      // prefix the specified file
      single_file: {
        src: 'css/kontentblocks.css',
        dest: 'css/kontentblocks.css'
      }
    },
    exec: {
      removeHash: {
        command: 'rm -f build/hash.php'
      },
      createId: {
        command: './build/githash.sh > build/hash.php'
      },
      createDevId: {
        command: './build/devhash.sh > build/hash.php'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-rsync-2');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-concurrent');


  // Default task(s).
  grunt.registerTask('default', ['concat', 'browserify', 'uglify:dist', 'sass:dist', 'autoprefixer', 'clean', 'bash', 'exec:removeHash', 'exec:createId']);
  grunt.registerTask('cssdev', ['sass:dev', 'autoprefixer']);
  grunt.registerTask('jsfrontend', ['browserify:frontend']);
  grunt.registerTask('jsclient', ['uglify:dev']);
  grunt.registerTask('jsbackend', ['browserify:backend']);
  grunt.registerTask('jsextensions', ['browserify:extensions']);
  grunt.registerTask('jsrefields', ['browserify:refields']);
  grunt.registerTask('jsplugins', ['concat','uglify:dev', 'clean']);
  grunt.registerTask('jsfieldsAPI', ['browserify:fieldsAPI']);
  grunt.registerTask('jsCustomizer', ['browserify:customizer']);
  grunt.registerTask('jshbs', ['jsfrontend', 'jsbackend', 'jsrefields']);
  grunt.registerTask('bash', ['exec:removeHash', 'exec:createDevId']);

  grunt.registerTask('cc', ['concurrent']);

};