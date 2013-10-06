module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                mangle: true
            },
            dist: {
                files: {
                    'dist/min/<%= pkg.name %>.min.js': ['js/<%= pkg.name %>.js'],
                    'dist/min/app.min.js':['js/app.js'],
                    'dist/min/fields.min.js': ['<%= concat.fields.dest %>'],
                    'dist/min/extensions.min.js': ['<%= concat.extensions.dest %>'],
                    'dist/min/plugins.min.js': ['<%= concat.plugins.dest %>'],
                    'dist/min/backbone.min.js': ['<%= concat.backbone.dest %>']
                }
            }
        },
        concat: {
            options: {
                seperator: ';'

            },
            fields: {
                // the files to concatenate
                src: ['core/Fields/Definitions/js/**/*.js'],
                // the location of the resulting JS file
                dest: 'dist/fields.concat.js',
                nonull:true
            },
            extensions: {
                src:['js/extensions/**/*.js'],
                dest: 'dist/extensions.concat.js',
                nonull:true
            },
            plugins:{
                src:['js/plugins/**/*.js'],
                dest: 'dist/plugins.concat.js',
                nonull:true
            },
            backbone:{
                src:['js/Backbone/**/*.js'],
                dest: 'dist/backbone.concat.js',
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
            files: ['js/<%= pkg.name %>.js', 'css/**/*.scss', 'js/**/*.js'],
            tasks: [ 'compass', 'concat', 'uglify'],
            options: {
                livereload:true
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-compass');
    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify', 'compass']);

};