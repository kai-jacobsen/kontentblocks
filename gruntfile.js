module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
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
          'js/dist/mediaExt.min.js': ['<%= concat.mediaExt.dest %>']

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
          'js/dev/frontend.js': ['<%= browserify.frontend.dest %>'],
          'js/dev/backend.js': ['<%= browserify.backend.dest %>'],
          'js/dev/refields.js': ['<%= browserify.refields.dest %>'],
          'js/dev/extensions.js': ['<%= browserify.extensions.dest %>'],
          'js/dev/plugins.js': ['<%= concat.plugins.dest %>'],
          'js/dev/fieldsAPI.js': ['<%= browserify.fieldsAPI.dest %>'],
          'js/dev/mediaExt.js': ['<%= concat.mediaExt.dest %>']
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
      //fieldsAPI: {
      //  src: ['js/src/fieldsAPI/kb.fapi.collection.js', 'js/src/fieldsAPI/Fields/_Field.js', 'js/src/fieldsAPI/Fields/**/*.js'],
      //  dest: 'js/tmp/fieldsAPI.concat.js',
      //  nonull: true
      //},
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
        dest: 'js/tmp/frontend.concat.js'
      },
      fieldsAPI: {
        src: 'js/src/fieldsAPI/FieldsAPIController.js',
        dest: 'js/tmp/fieldsAPI.concat.js'
      },
      backend: {
        src: 'js/src/backend/BackendController.js',
        dest: 'js/tmp/backend.concat.js'
      },
      refields: {
        src: 'js/src/fields/RefieldsController.js',
        dest: 'js/tmp/refields.concat.js'
      },
      extensions: {
        src: 'js/src/extensions/ExtensionsController.js',
        dest: 'js/tmp/extensions.concat.js'
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
        livereload: true
      },
      backend: {
        files: ['js/src/backend/**/*.js', 'js/**/*.hbs'],
        tasks: ['jsbackend']
      },
      frontend: {
        files: ['js/src/frontend/**/*.js', 'js/**/*.hbs'],
        tasks: ['jsfrontend']
      },
      common:{
        files: ['js/src/common/**/*.js'],
        tasks: ['jsbackend']
      },
      refields: {
        files: ['js/src/fields/**/*.js', 'js/src/shared/**/*.js', 'js/**/*.hbs'],
        tasks: ['jsrefields', 'jsbackend', 'jsfrontend']
      },
      plugins: {
        files: ['js/src/plugins/**/*.js'],
        tasks: ['jsplugins']
      },
      fieldsApi: {
        files: ['js/src/fieldsAPI/**/*.js', 'js/**/*.hbs', 'js/src/common/**/*.js'],
        tasks: ['jsfieldsAPI']
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
      src: ['js/src/frontend/**/*.js', 'js/src/backend/**/*.js'],
      options: {
        reporter: require('jshint-log-reporter'),
        reporterOutput: '_jshint.log',
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
      },
      report: {
        command: './build/report.sh',
        options: {
          message: 'Report sent to codeclimate'
        }
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


  // Default task(s).
  grunt.registerTask('default', ['concat', 'browserify', 'uglify:dist', 'uglify:dev', 'sass:dist', 'autoprefixer', 'clean', 'jshint', 'bash', 'exec:removeHash', 'exec:createId']);

  grunt.registerTask('cssdev', ['sass:dev', 'autoprefixer']);

  grunt.registerTask('jsfrontend', ['browserify:frontend', 'uglify:dev', 'clean', 'bash']);
  grunt.registerTask('jsbackend', ['browserify:backend', 'uglify:dev', 'clean', 'bash']);
  grunt.registerTask('jsextensions', ['browserify:extensions', 'uglify:dev', 'clean', 'bash']);
  grunt.registerTask('jsrefields', ['browserify:refields', 'uglify:dev', 'clean', 'bash']);
  grunt.registerTask('jsplugins', ['uglify:dev', 'clean', 'jshint', 'bash']);
  grunt.registerTask('jsfieldsAPI', ['browserify:fieldsAPI','uglify:dev', 'clean', 'jshint', 'bash']);
  grunt.registerTask('bash', ['exec:removeHash', 'exec:createDevId']);

};