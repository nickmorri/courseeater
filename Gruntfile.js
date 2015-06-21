module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),

    'meta': {
      'bower_components_js': [
        'bower_components/angular/angular.min.js',
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/bootstrap/dist/js/bootstrap.min.js',
        'bower_components/angular-ui-router/release/angular-ui-router.min.js',
        'bower_components/angular-filter/dist/angular-filter.min.js',
        'bower_components/moment/min/moment-with-locales.min.js',
        'bower_components/parse-angular-patch/dist/parse-angular.js',
        'bower_components/fullcalendar/dist/fullcalendar.min.js',
        'bower_components/angular-ui-calendar/calendar.min.js',
        'bower_components/ng-bs-animated-button/ng-bs-animated-button.js',
        'bower_components/html2canvas/build/html2canvas.min.js',
        'bower_components/angular-local-storage/dist/angular-local-storage.min.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js'
      ],
      'bower_components_css': [
        'bower_components/fullcalendar/dist/fullcalendar.min.css',
        'bower_components/ng-bs-animated-button/ng-bs-animated-button.css',
        'bower_components/bootstrap/dist/css/bootstrap.min.css'
      ],
      'bower_components_fonts': [
        'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2',
        'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff',
        'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf'
      ],
      'courseeater_components_js': ['app/*.js', 'app/components/**/*.js'],
      'courseeater_components_css': 'stylesheets/*.css',
      'courseeater_components_html': ['app/directives/*.html', 'app/partials/*.html', 'app/views/**/*.html', 'app/components/**/directives/*.html'],
      'tests': ['test/**/*.js'],
      'destination': 'dist'
    },

    'karma': {
      'development': {
        'configFile': 'karma.conf.js',
        'options': {
          'files': [
            '<%= meta.bower_components_js %>',
            '<%= meta.courseeater_components_js %>',
            '<%= meta.tests %>'
          ],
        }
      },
      'dist': {
        'options': {
          'configFile': 'karma.conf.js',
          'files': [
            '<%= meta.jsFilesForTesting %>',
            '<%= meta.destination %>/<%= pkg.namelower %>.js'
          ],
        }
      },
      'minified': {
        'options': {
          'configFile': 'karma.conf.js',
          'files': [
            '<%= meta.jsFilesForTesting %>',
            '<%= meta.destination %>/<%= pkg.namelower %>.min.js'
          ],
        }
      }
	},

  'jshint': {
    'beforeconcat': ['<%= meta.courseeater_components_js %>'],
  },

  'clean': ['<%= meta.destination %>'],

  'copy': {
    'main': {
      'files': [
        {'expand': true, 'src': ['<%= meta.bower_components_js %>', '<%= meta.bower_components_css %>', '<%= meta.bower_components_fonts %>'], 'dest': '<%= meta.destination %>/', 'filter': 'isFile'},
        {'expand': true, 'src': '<%= meta.courseeater_components_html %>', 'dest': '<%= meta.destination %>/', 'filter': 'isFile'}
      ]
    }
  },

  'processhtml': {
    'dist': {
      'files': {'<%= meta.destination %>/index.html': ['index.html']}
    }
  },

  'concat': {
    'dist': {
      'src': ['<%= meta.courseeater_components_js %>'],
      'dest': '<%= meta.destination %>/<%= pkg.namelower %>.js'
    }
  },

  'uglify': {
    'options': {
      'mangle': false
    },  
    'dist': {
      'files': {
        '<%= meta.destination %>/<%= pkg.namelower %>.min.js': ['<%= meta.destination %>/<%= pkg.namelower %>.js']
      }
    }
  },

  'cssmin': {
    'options': {
      'shorthandCompacting': false,
      'roundingPrecision': -1
    },
    'dist': {
      'files': {'<%= meta.destination %>/<%= pkg.namelower %>.min.css': '<%= meta.courseeater_components_css %>'}
    }
  }

  });

  grunt.registerTask('test', ['karma:development', 'karma:dist', 'karma:minified']);

  grunt.registerTask('build', [
    'clean',
    'copy',
    'processhtml',
    'cssmin',
    'jshint',
    'concat',
    'uglify'
  ]);

};