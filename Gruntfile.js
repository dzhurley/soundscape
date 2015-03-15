module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            options: {
                browserifyOptions: {
                    debug: true
                },

                transform: [
                    [ 'babelify', { experimental: true } ]
                ]
            },

            app: {
                src: ['js/**/*.js'],
                dest: 'build/app.js',
                options: {
                    external: [],
                    watch: true
                }
            }
        },

        watch: {
            files: ['css/**/*', 'img/**/*', 'build/app.js', 'index.html']
        },

        connect: {
            server: {
                options: { port: 8000, base: '.' }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['connect', 'browserify:app', 'watch']);
};
