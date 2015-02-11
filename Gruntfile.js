/*global module:false*/
module.exports = function(grunt) {

  var TRACKER_FILENAME = 'w.js';
  var CDN_URL = 'http://static.woopra.com/';

  var browsers = [{
      browserName: "firefox",
      version: "19",
      platform: "XP"
  }, {
      browserName: "firefox",
      platform: "XP"
  }, {
      browserName: "chrome",
      platform: "XP"
  }, {
      browserName: "internet explorer",
      platform: "XP",
      version: "7.0"
  }, {
      browserName: "internet explorer",
      platform: "XP",
      version: "8.0"
  }, {
      browserName: "chrome",
      platform: "linux"
  }, {
      browserName: "firefox",
      platform: "linux"
  }, {
      browserName: "firefox",
      platform: "OS X 10.10"
  }, {
      browserName: "safari",
      platform: "OS X 10.10"
  }, {
      browserName: "chrome",
      platform: "OS X 10.10"
  }, {
      browserName: "internet explorer",
      platform: "Windows 8",
      version: "10.0"
  }, {
      browserName: "internet explorer",
      platform: "Windows 8.1",
      version: "11.0"
  }, {
      browserName: "internet explorer",
      platform: "Windows 7",
      version: "9.0"
  //}, {
      //browserName: "opera",
      //platform: "Windows 2008",
      //version: "12"
  }];

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
                port: 4040,
                hostname: '0.0.0.0',
                keepalive: true
            }
        },
        test: {
            options: {
                port: 4040,
                hostname: '0.0.0.0'
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
        files: ['<%= options.testFiles>', '<%= options.specFiles %>', 'test/TestRunner.html'],
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
        unused: true,
        globals: {
          exports: true,
          jQuery: true
        }
      },
      main: {
          files: [{
              src: ['grunt.js', '<%= pkg.name %>.js']
          }]
      },
      tests: {
          options: {
              globals: {
                  exports: true,
                  '$': true,
                  describe: true,
                  expect: true,
                  before: true,
                  beforeEach: true,
                  after: true,
                  afterEach: true,
                  sinon: true,
                  Woopra: true,
                  WoopraTracker: true,
                  it: true
              }
          },
          files: [{
              src: ['<%= options.specFiles %>']
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
          },
            src: ['<%= pkg.name %>.js'],
            dest: '<%= pkg.name %>.min.js'
        },
        plugin: {
            src: ['jquery.woopra.js'],
            dest: 'jquery.woopra.min.js'
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
      tracker: {
        options: {
          urls: ['http://localhost:4040/test/TestRunner.html'],
          mocha: {
            globals: ['woopra', 'newTracker', 'pingTracker', 'w1', 'w2', 'w3'],
            ignoreLeaks: false
          },
          reporter: 'Spec',
          run: true,
          log: true
        }
      },
      snippet: {
        options: {
          urls: ['http://127.0.0.1:4040/test/snippet.html'],
          mocha: {
            globals: ['woopraLoaded', '_w', 'WoopraTracker', 'woopraTracker', 'WoopraLoadScript', 'Woopra', 'woopra', 'woopra_c1', 'woopra_c2', 'woopra_c3'],
            ignoreLeaks: false
          },
          reporter: 'Spec',
          run: true,
          log: false
        }
      }
    },
    'saucelabs-mocha': {
        all: {
            options: {
                urls: ["http://127.0.0.1:4040/test/TestRunner.html"],
                tunnelArgs: ['-v'],
                concurrency: 3,
                browsers: browsers,
                'max-duration': 30,
                testname: "Woopra tracker tests",
                tags: ["woopra-tracker"]
            }
        }
    },
  });

  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-saucelabs');

  // Default task.
  grunt.registerTask('default', ['jshint', 'test', 'uglify']);

  grunt.task.registerTask('test', ['connect:test', 'saucelabs-mocha']);
  grunt.task.registerTask('local-test', ['connect:test', 'mocha']);

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
