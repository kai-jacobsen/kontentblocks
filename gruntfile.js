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
                    'dist/<%= pkg.name %>.min.js': ['js/<%= pkg.name %>.js'],
                    'dist/fields.min.js': ['<%= concat.dist.dest %>']

                }
            }
        },
        concat: {
            options: {
                // define a string to put between each file in the concatenated output

            },
            dist: {
                // the files to concatenate
                src: ['fields/**/*.js'],
                // the location of the resulting JS file
                dest: 'dist/fields_built.js'
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
            files: ['js/<%= pkg.name %>.js', 'css/**/*.scss'],
            tasks: [ 'compass']
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-compass');
    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']);

};