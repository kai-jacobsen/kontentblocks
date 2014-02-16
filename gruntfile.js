module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                mangle: false,
                beautify: true,
                compress: false
            },
            prim: {
                files: {
                    'js/dist/frontend.min.js': ['<%= concat.frontend.dest %>'],
                    'js/dist/backend.min.js': ['<%= concat.backend.dest %>'],
                    'js/dist/refields.min.js': ['<%= concat.refields.dest %>'],
                    'js/dist/common.min.js': ['<%= concat.common.dest %>']
                }
            },
            sec: {
                files: {
                    'js/dist/extensions.min.js': ['<%= concat.extensions.dest %>'],
                    'js/dist/plugins.min.js': ['<%= concat.plugins.dest %>']
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
                src: ['js/dev/extensions/**/*.js'],
                dest: 'js/tmp/extensions.concat.js',
                nonull: true
            },
            plugins: {
                src: ['js/dev/plugins/**/*.js'],
                dest: 'js/tmp/plugins.concat.js',
                nonull: true
            },
            common: {
                src: ['js/dev/common/**/*.js'],
                dest: 'js/tmp/common.concat.js',
                nonull: true
            },
            frontend: {
                src: ['js/dev/frontend/**/*.js', 'js/dev/frontend/frontend.js'],
                dest: 'js/tmp/frontend.concat.js',
                nonull: true
            },
            backend: {
                src: ['js/dev/backend/**/*.js', 'js/dev/backend/backend.js', 'js/dev/backend/kb.fields.loader.js','js/cjs/app.js'],
                dest: 'js/tmp/backend.concat.js',
                nonull: true
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
                files: ['js/dev/**/**/*.js', 'js/dev/**/*.js', 'core/Fields/Definitions/**/*.js'],
                tasks: ['concat', 'uglify:prim', 'uglify:sec', 'clean', 'jshint']
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
            dev: ['js/dev/frontend/**/*.js', 'js/dev/backend/**/*.js'],
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
    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify:prim', 'uglify:sec', 'compass', 'clean']);
    grunt.registerTask('hint', ['jshint']);

};