module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			build: {
				src  : ['src/*.js', 'src/**/*.js'],
				dest : 'build/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				//report: 'min',
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'build/<%= pkg.name %>.js', //'src/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: [
				'Gruntfile.js',
				'build/<%= pkg.name %>.js'
			]
		},
		karma: {
			build: {
				configFile: 'test/karma.conf.js',
				singleRun: true,
				browsers: ['PhantomJS']
			}
		},
		jsdoc: {
			doc: {
				src: [
					'src/*.js',
					'src/**/*.js'
				],
				options: {
					destination: 'doc'
				}
			}
		},
		clean: {
			options: {
				force: true
			},
			doc: ['doc']
		},
	});

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-karma');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify']);
  grunt.registerTask('dev', ['concat']);
  grunt.registerTask('build', ['concat', 'jshint', 'karma', 'uglify']);
  grunt.registerTask('doc', ['clean', 'jsdoc']);
};
