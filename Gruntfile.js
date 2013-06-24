/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.config.init({
    pkg: grunt.file.readJSON('package.json'),
    options: {
      testFiles: ['<%= pkg.name %>.v<%= pkg.version %>.min.js'],
      specFiles: ['test/spec/*.js']
    },
    connect: {
        dev: {
            options: {
                port: 4141,
                keepalive: true
                //middleware: function(connect, options) {
                    //return [
                        //function(req, res, next) {
                            //if (req.url === '/') {
                                //res.end(grunt.file.read('test/TestRunner.html'));
                            //}
                            //else {
                                //next();
                            //}
                        //},
                        //connect.static('/node_modules'),
                        //connect.static('node_modules'),
                        //connect.static('/')
                    //];
                //}
            }
        },
    },
    
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint min',
      test: {
        files: ['<%= options.testFiles>', '<config:options.specFiles>', 'test/TestRunner.html'],
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
        browser: true,
        globals: {
          exports: true,
          jQuery: true
        }
      },
      main: {
          files: [{
              src: ['grunt.js', '<%= pkg.name %>.v<%= pkg.version %>.js']
          }]
      }
    },
    uglify: {
        options: {
            compressor: {
                warnings: false
            },
            mangle: true,
            compress: true
        },
        main: {
          options: {
            banner: '<%= meta.banner %>'
          },
            src: ['<%= pkg.name %>.js'],
            dest: '<%= pkg.name %>.min.js'
        },
        snippet: {
            src: ['snippet.js'],
            dest: 'snippet-min.js'
        }
    },
    mocha: {
      main: {
        src: ['test/TestRunner.html'],
        options: {
          mocha: {
            ignoreLeaks: false
          },
          reporter: 'Spec',
          run: true,
          log: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  

  // Default task.
  grunt.registerTask('default', ['jshint', 'test', 'uglify']);

  grunt.task.registerTask('test', 'mocha');
};
