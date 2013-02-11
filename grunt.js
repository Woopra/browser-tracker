/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    options: {
      testFiles: ['<%= pkg.name %>.min.js'],
      specFiles: ['test/spec/*.js']
    },
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    lint: {
      files: ['grunt.js', '<%= pkg.name %>.js']
    },
    concat: {
      dist: {
        src: ['<%= pkg.name %>.js'],
        dest: '<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<config:concat.dist.dest>'],
        dest: '<%= pkg.name %>.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint min',
      test: {
        files: ['<config:options.testFiles>', '<config:options.specFiles>', 'test/TestRunner.html'],
        tasks: 'mocha'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        exports: true,
        jQuery: true
      }
    },
    uglify: {},
    mocha: {
      all: {
        src: ['test/TestRunner.html'],
        mocha: {
          ignoreLeaks: false
        },
        run: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha');
  // Default task.
  grunt.registerTask('default', 'lint min mocha');

  grunt.task.registerTask('test', 'mocha');
};
