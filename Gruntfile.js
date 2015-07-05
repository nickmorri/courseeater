module.exports = function (grunt) {

	grunt.loadNpmTasks('main-bower-files');
  	require('load-grunt-tasks')(grunt);

  	grunt.initConfig({  
	    'pkg':grunt.file.readJSON('package.json'),
	    'meta':{
	        'express':{  
	            'options':{  
	                'port':9000,
	                'hostname':'0.0.0.0'
	            },
	            'dev':{  
	                'options':{  
	                    'bases':[  
	                        '<%= meta.dev_destination %>'
	                    ],
	                    'livereload':true
	                }
	            },
	            'dist':{  
	                'options':{  
	                    'bases':[  
	                        '<%= meta.dist_destination %>'
	                    ]
	                }
	            }
	        },
	        'bower_components_js':[  
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
	        'bower_components_css':[  
	            'bower_components/fullcalendar/dist/fullcalendar.min.css',
	            'bower_components/ng-bs-animated-button/ng-bs-animated-button.css',
	            'bower_components/bootstrap/dist/css/bootstrap.min.css'
	        ],
	        'bower_components_fonts':[  
	            'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2',
	            'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff',
	            'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf'
	        ],
	        'courseeater_components_js':['app/*.js', 'app/components/**/*.js'],
	        'courseeater_components_css':'stylesheets/*.css',
	        'courseeater_components_html':[  
	            'app/directives/*.html',
	            'app/components/**/partials/*.html',
	            'app/components/**/directives/*.html'
	        ],
	        'tests':'test/**/*.js',
	        'dev_destination':'dev',
	        'dist_destination':'dist'
	    },
	    'express':{  
	        'options':{  
	            'port':9000,
	            'hostname':'0.0.0.0'
	        },
	        'dev':{  
	            'options':{  
	                'bases':[  
	                    '<%= meta.dev_destination %>'
	                ],
	                'livereload':true
	            }
	        },
	        'dist':{  
	            'options':{  
	                'bases':[  
	                    '<%= meta.dist_destination %>'
	                ]
	            }
	        }
	    },
	    'open':{  
	        'all':{  
	            'path':'http://localhost:<%= express.options.port %>'
	        }
	    },
	    'bower-install-simple':{  
	        'options':{  
	            'directory':"bower_components"
	        },
	        'dist':{  
	            'options':{  
	                'production':true
	            }
	        },
	        'dev':{  
	            'options':{  
	                'production':false
	            }
	        }
	    },
	    'bower':{  
	        'dist':{  
	            'base':'bower_components',
	            'dest':'<%= meta.dist_destination %>/bower_components',
	            'options':{  
	                'checkExistence':true,
	                'debugging':true,
	                'paths':{  
	                    'bowerDirectory':'bower_components',
	                    'bowerrc':'.bowerrc',
	                    'bowerJson':'bower.json'
	                }
	            }
	        },
	        'dev':{  
	            'base':'bower_components',
	            'dest':'<%= meta.dev_destination %>/bower_components',
	            'options':{  
	                'checkExistence':true,
	                'debugging':true,
	                'paths':{  
	                    'bowerDirectory':'bower_components',
	                    'bowerrc':'.bowerrc',
	                    'bowerJson':'bower.json'
	                }
	            }
	        }
	    },
	    'wiredep':{  
	        'dist':{  
	            'src':'<%= meta.dist_destination %>/index.html'
	        },
	        'dev':{
	        	'src':'<%= meta.dev_destination %>/index.html'
	        }
	    },
	    'watch':{  
	        'scripts':{  
	            'options':{  
	                'livereload':true
	            },
	            'files':'<%= meta.courseeater_components_js %>',
	            'tasks':[  
	                'newer:jshint:dev',
	                'karma:dev',
	                'newer:copy:dev'
	            ]
	        },
	        'stylesheets':{  
	            'options':{  
	                'debounceDelay':100,
	                'livereload':true
	            },
	            'files':'<%= meta.courseeater_components_css %>',
	            'tasks':[  
	                'csslint:dev',
	                'newer:copy:dev'
	            ]
	        },
	        'html':{  
	            'options':{  
	                'debounceDelay':100,
	                'livereload':true
	            },
	            'files':'<%= meta.courseeater_components_html %>',
	            'tasks':[  
	                'newer:copy:dev'
	            ]
	        },
	        'tests':{  
	            'files':'<%= meta.tests %>',
	            'tasks':'karma:dev'
	        }
	    },
	    'karma':{  
	        'options':{  
	            'configFile':'karma.conf.js'
	        },
	        'dev':{  
	            'options':{  
	                'files':[  
	                    '<%= meta.bower_components_js %>',
	                    '<%= meta.courseeater_components_js %>',
	                    '<%= meta.tests %>'
	                ],

	            }
	        },
	        'dist':{  
	            'options':{  
	                'configFile':'karma.conf.js',
	                'files':[  
	                    '<%= meta.bower_components_js %>',
	                    '<%= meta.tests %>',
	                    '<%= meta.dist_destination %>/<%= pkg.namelower %>.min.js'
	                ],

	            }
	        }
	    },
	    'jshint':{  
	        'dev':{  
	            'options':{  
	                'debug':true,

	            },
	            'src':'<%= meta.courseeater_components_js %>',
	            'gruntfile':'Gruntfile.js'
	        },
	        'dist':{  
	            'src':'<%= meta.courseeater_components_js %>'
	        }
	    },
	    'csslint':{  
	        'dist':{  
	            'options':{  
	                'import':2
	            },
	            'src':'<%= meta.courseeater_components_css %>'
	        },
	        'dev':{  
	            'src':'<%= meta.courseeater_components_css %>',
	            'options':{  
	                'vendor-prefix':false,
	                'fallback-colors':false,
	                'important':false,
	                'adjoining-classes':false,
	                'known-properties':false
	            },

	        }
	    },
	    'clean':{  
	        'dev':'<%= meta.dev_destination %>',
	        'dist':'<%= meta.dist_destination %>'
	    },
	    'copy':{  
	        'dev':{  
	            'files':[  
	                {  
	                    'expand':true,
	                    'src':[  
	                        'index.html',
	                        '<%= meta.courseeater_components_html %>',
	                        '<%= meta.courseeater_components_js %>',
	                        '<%= meta.courseeater_components_css %>',
	                        '<%= meta.bower_components_css %>',
	                        '<%= meta.bower_components_fonts %>'
	                    ],
	                    'dest':'<%= meta.dev_destination %>'
	                }
	            ]
	        },
	        'dist':{  
	            'files':[  
	                {  
	                    'expand':true,
	                    'src':'<%= meta.courseeater_components_html %>',
	                    'dest':'<%= meta.dist_destination %>',
	                    'filter':'isFile'
	                }
	            ]
	        }
	    },
	    'processhtml':{  
	        'dist':{  
	            'files':{  
	                '<%= meta.dist_destination %>/index.html':[  
	                    'index.html'
	                ]
	            }
	        },
	        'dev':{
	        	'files':{
	        		'<%=meta.dev_destination %>/index.html':[
	        			'index.html'
	        		]
	        	}
	        }
	    },
	    'uglify':{  
	    	'options':{  
	            'mangle':false,
	            'compress':false,
	            'sourceMap':true,
	            'preserveComments':false
	        },
	        'dev': {
	        	'files':{
	        		'<%= meta.dev_destination %>/<%= pkg.namelower %>.min.js': ['<%= meta.courseeater_components_js %>', 'tmp/templates.js']
	        	}
	        },
	        'dist':{  
	            'files':{
	                '<%= meta.dist_destination %>/<%= pkg.namelower %>.min.js': ['<%= meta.courseeater_components_js %>', 'tmp/templates.js']
	            }
	        }
	    },
	    'cssmin':{  
	        'options':{  
	            'shorthandCompacting':false,
	            'roundingPrecision':-1
	        },
	        'dist':{  
	            'files':{  
	                '<%= meta.dist_destination %>/<%= pkg.namelower %>.min.css':'<%= meta.courseeater_components_css %>'
	            }
	        },
	        'dev':{
	        	'files':{
	        		'<%= meta.dev_destination %>/<%= pkg.namelower %>.min.css':'<%= meta.courseeater_components_css %>'
	        	}
	        }
	    },
	    'html2js': {
		    'options': {
		      'base': ''
		    },
		    'main': {
		      'src': ['<%= meta.courseeater_components_html %>'],
		      'dest': 'tmp/templates.js'
		    },
		}
	});

  	grunt.registerTask('test', ['jshint:dist', 'karma:dev', 'karma:dist', 'karma:minified']);

  	grunt.registerTask('develop', [
	  	'clean:dev',
	  	'bower-install-simple:dev',
	  	'bower:dev',
	  	'jshint:dev',
	  	'csslint:dev',
	    'karma:dev',
	  	'copy:dev',
	  	'wiredep:dev',
	  	'express:dev',
	    'open',
	    'watch'
  	]);

  	grunt.registerTask('dist', [
	    'clean:dist',
	    'bower-install-simple:dist',
	    'bower:dist',
	    'jshint:dist',
	    'csslint:dev',
	    'karma:dev',
	    'uglify:dist',
	    'karma:dist',
	    'copy:dist',
	    'cssmin:dist',
	    'processhtml:dist',
	    'wiredep:dist'
  	]);

  	grunt.registerTask('build', 'dist');

};