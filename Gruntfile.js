module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.initConfig({
    'meta': {
      'bowerComponents': [
        'bower_components/jquery/jquery.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/restangular/dist/restangular.js',
        'bower_components/underscore/underscore.js',
        'bower_components/underscore/underscore.js'
      ],
      'courseeater_components': ['app/app.js', 'app/misc.js', 'app/components/**/*.js'],
      'tests': ['test/**/*Spec.js'],
    },

    'karma': {
      'development': {
        'configFile': 'karma.conf.js',
        'options': {
          'files': [
            '<%= meta.jsFilesForTesting %>',
            'source/**/*.js'
          ],
        }
      }
	}

  'jshint': {
      'beforeconcat': ['<%= meta.courseeater_components %>'],
    }

  });

  grunt.registerTask('test', ['karma:development']);


};