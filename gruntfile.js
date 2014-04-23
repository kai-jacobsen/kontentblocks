module.exports = function (grunt) {

    var clean = false;

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            dist: {
                options: {
                    banner: '/*! <%= pkg.name %> ProdVersion <%= grunt.template.today("yyyy-mm-dd hh:mm") %> */\n',
                    mangle: false,
                    beautify: false,
                    compress: true,
                    drop_console: true
                },
                files: {
                    'js/dist/frontend.min.js': ['<%= concat.frontend.dest %>'],
                    'js/dist/backend.min.js': ['<%= concat.backend.dest %>'],
                    'js/dist/refields.min.js': ['<%= concat.refields.dest %>'],
                    'js/dist/common.min.js': ['<%= concat.common.dest %>'],
                    'js/dist/extensions.min.js': ['<%= concat.extensions.dest %>'],
                    'js/dist/plugins.min.js': ['<%= concat.plugins.dest %>'],
                    'js/dist/fieldsAPI.min.js': ['<%= concat.fieldsAPI.dest %>']
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
                    'js/dev/frontend.js': ['<%= concat.frontend.dest %>'],
                    'js/dev/backend.js': ['<%= concat.backend.dest %>'],
                    'js/dev/refields.js': ['<%= concat.refields.dest %>'],
                    'js/dev/common.js': ['<%= concat.common.dest %>'],
                    'js/dev/extensions.js': ['<%= concat.extensions.dest %>'],
                    'js/dev/plugins.js': ['<%= concat.plugins.dest %>'],
                    'js/dev/fieldsAPI.js': ['<%= concat.fieldsAPI.dest %>']
                }
            }
        },
        concat: {
            options: {
                seperator: ';'
            },
            refields: {
                src: ['core/Fields/Definitions/js/**/*.js'],
                dest: 'js/tmp/refields.concat.js',
                nonull: true
            },
            extensions: {
                src: ['js/src/extensions/**/*.js'],
                dest: 'js/tmp/extensions.concat.js',
                nonull: true
            },
            plugins: {
                src: ['js/src/plugins/**/*.js'],
                dest: 'js/tmp/plugins.concat.js',
                nonull: true
            },
            common: {
                src: ['js/src/common/kb.cm.Namespaces.js','js/src/common/**/*.js'],
                dest: 'js/tmp/common.concat.js',
                nonull: true
            },
            frontend: {
                src: ['js/src/frontend/**/*.js', 'js/src/frontend/frontend.js'],
                dest: 'js/tmp/frontend.concat.js',
                nonull: true
            },
            backend: {
                src: ['js/src/backend/**/*.js', 'js/src/backend/backend.js'],
                dest: 'js/tmp/backend.concat.js',
                nonull: true
            },
            fieldsAPI: {
                src: ['js/src/fieldsAPI/kb.fapi.collection.js', 'js/src/fieldsAPI/Fields/_Field.js' ,  'js/src/fieldsAPI/Fields/**/*.js'],
                dest: 'js/tmp/fieldsAPI.concat.js'
            }
        },
        compass: {
            dist: {
                options: {
                    config: 'css/config.rb',
                    basePath: 'css/'
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            js: {
                files: ['js/src/**/**/*.js', 'js/src/**/*.js', 'core/Fields/Definitions/**/*.js'],
                tasks: ['concat', 'uglify:dist', 'uglify:dev', 'clean', 'jshint']
            },
            sass: {
                options: {
                    livereload: false
                },
                files: ['css/**/*.scss'],
                tasks: ['compass', 'autoprefixer']
            },
            css: {
                files: ['css/*.css'],
                tasks: []
            }
        },
        clean: ["js/tmp"],
        jshint: {
            src: ['js/src/frontend/**/*.js', 'js/src/backend/**/*.js'],
            options: {
                force: true,
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
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-rsync-2');
    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify:dist', 'uglify:dev', 'compass', 'clean']);
    grunt.registerTask('hint', ['jshint']);

};