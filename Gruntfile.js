/*global module:false*/
module.exports = function(grunt) {

  var TRACKER_FILENAME = 'w.js',
      CDN_URL = 'http://static.woopra.com/';

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
                hostname: '0.0.0.0',
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
              src: ['grunt.js', '<%= pkg.name %>.js']
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
    upload: {
        tracker: {
            type: 'scp',
            host: 'woopra-cdn',
            cdnRoot: '/var/www/html',
            tasks: [{
                src: [
                    '<%= uglify.main.dest %>'
                ],
                dest: '<%= upload.tracker.cdnRoot %>/js/' + TRACKER_FILENAME
            }]
        }
    },
    mocha: {
      main: {
        src: ['test/TestRunner.html'],
        options: {
          mocha: {
            globals: ['woopra', 'woopra2', 'woopra3', '_w'],
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

  grunt.registerTask('deploy', function() {
      grunt.task.run(['jshint', 'test', 'uglify']);
      grunt.task.run('upload:tracker');
      grunt.task.run('purge');
  });

  grunt.registerTask('purge', 'Call EdgeCast API to purge CDN cache', function() {
      var done = this.async(),
          request = require('request'),
          data = {
              MediaPath: CDN_URL + 'js/' + TRACKER_FILENAME,
              MediaType: 8
          };

      request.put({
          url: 'https://api.edgecast.com/v2/mcc/customers/' + process.env.EDGECAST_ACCOUNT_NUMBER + '/edge/purge',
          json: true,
          body: data,
          headers: {
              Authorization: 'TOK:' + process.env.EDGECAST_ACCESS_TOKEN,
              Accept: 'application/json'
          }
      }, function(e, r, body) {
          var json;
          if (!e) {
              if (body.Id) {
                  done();
                  grunt.log.writeln('Request sent, id = ' + body.Id);
              }
              else {
                  grunt.log.error('Error purging CDN cache.');
              }
          }
          else {
              grunt.log.error('Error purging CDN cache.');
          }
      });


  });

  grunt.registerMultiTask('upload', 'Uploads to CDN', function() {
      var self = this;
      var done = this.async();
      var tasks = {
          scp: function() {
              var scp = require('scp');

              this.data.tasks.forEach(function(task) {
                  task.src.forEach(function(src) {
                      scp.send({
                          host: self.data.host,
                          path: task.dest,
                          file: __dirname + '/' + src
                      }, function(err, stdout, stderr) {
                          grunt.log.writeln(err, stdout, stderr);
                          if (err) done(false);
                          else done();
                      });
                  });
              });
          }
      };

      tasks[this.data.type].apply(this);
  });
  
};
