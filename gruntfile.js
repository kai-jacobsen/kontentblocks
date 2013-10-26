module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                mangle: true
            },
            prim: {
                files: {
                    'js/dist//<%= pkg.name %>.min.js': ['js/dev/<%= pkg.name %>.js'],
                    'js/dist/frontend.min.js': ['<%= concat.frontend.dest %>'],
                    'js/dist/backend.min.js': ['<%= concat.backend.dest %>']
                }
            },
            sec: {
                files: {
                    'js/dist/fields.min.js': ['<%= concat.kontentfields.dest %>'],
                    'js/dist/extensions.min.js': ['<%= concat.extensions.dest %>'],
                    'js/dist/plugins.min.js': ['<%= concat.plugins.dest %>']
                }
            }
        },
        concat: {
            options: {
                seperator: ';'
            },
            kontentfields: {
                src: ['core/Kontentfields/Definitions/js/**/*.js'],
                dest: 'js/tmp/fields.concat.js',
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
            frontend: {
                src: ['js/dev/frontend/etch/etch.js','js/dev/frontend/**/*.js', 'js/dev/frontend/frontend.js'],
                dest: 'js/tmp/frontend.concat.js',
                nonull: true
            },
            backend: {
                src: ['js/dev/backend/**/*.js', 'js/dev/backend/backend.js'],
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
            files: ['js/dev/<%= pkg.name %>.js', 'css/**/*.scss', 'js/dev/**/**/*.js', 'js/dev/**/*.js'],
            tasks: ['compass', 'concat', 'uglify:prim'],
            options: {
                livereload: true,
                nospawn: true
            }
        },
        clean: ["js/tmp"],
        jshint: {
            dev: ['js/dev/frontend/**/*.js', 'js/dev/backend/**/*.js'],
            options: {
                force: true
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
    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify:prim', 'uglify:sec', 'compass', 'clean']);
    grunt.registerTask('hint', ['jshint']);

};