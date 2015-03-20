/*global module:false*/
module.exports = function(grunt) {
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

    var getVersion = function(version) {
        var data = {};
        var match, major, minor, patch;

        match = version.match(/^([0-9]+)\.([0-9]+)\.([0-9]+).*/);

        if (match) {
            data.major = match[1];
            data.minor = match[2];
            data.patch = match[3];
        }

        return data;
    };

    // Project configuration.
    grunt.config.init({
        CDN_URL: 'http://static.woopra.com',
        filename: 'w',
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
                    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> */'
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
                    dest: '/js/<%= filename %>.js'
                }]
            },
            dev: {
                type: 'scp',
                host: 'woopra-cdn',
                cdnRoot: '/var/www/html',
                tasks: [{
                    src: [
                        '<%= uglify.main.dest %>'
                    ],
                    dest: '/js/t/<%= pkg.version %>.js'
                }]

            }
        },
        purge: {
            tracker: {
            },
            dev: {
            }
        },
        mocha: {
            tracker: {
                src: ['test/TestRunner.html'],
                options: {
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
                src: ['test/snippet.html'],
                options: {
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
                    urls: ["http://localhost:4040/test/TestRunner.html"],
                    tunnelArgs: ['-v'],
                    concurrency: 3,
                    'max-duration': 30,
                    testname: "Woopra tracker tests",
                    tags: ["woopra-tracker"]
                }
            },
            full: {
                options: {
                    urls: ["http://localhost:4040/test/TestRunner.html"],
                    tunnelArgs: ['-v'],
                    concurrency: 3,
                    browsers: browsers,
                    'max-duration': 30,
                    testname: "Woopra tracker tests",
                    tags: ["woopra-tracker"]
                }
            },
            quick: {
                options: {
                    urls: ["http://localhost:4040/test/TestRunner.html"],
                    tunnelArgs: ['-v'],
                    concurrency: 3,
                    browsers: [{
                        browserName: "chrome",
                        platform: "linux"
                    }],
                    'max-duration': 30,
                    testname: "Woopra tracker tests",
                    tags: ["woopra-tracker"]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-saucelabs');

    // Default task.
    grunt.registerTask('default', ['test', 'uglify']);

    grunt.task.registerTask('test', ['connect:test', 'saucelabs-mocha:full']);
    grunt.task.registerTask('local-test', ['connect:test', 'mocha']);
    grunt.task.registerTask('quick-test', ['connect:test', 'saucelabs-mocha:quick']);

    grunt.registerTask('deploy', function() {
        grunt.task.run(['local-test', 'version', 'uglify', 'gitTagVersion']);
        grunt.task.run('upload:dev');
        grunt.task.run('purge:dev');
    });

    grunt.registerTask('version', function() {
        var exec = require('child_process').exec;
        var done = this.async();

        var version = grunt.option('ver') || 'patch';
        var old = grunt.config('pkg.version');

        exec('npm version ' + version, function(error, stdout, stderr) {
            grunt.log.writeln(stdout);
            grunt.log.writeln(stderr);

            if (error === null) {
                grunt.config('pkg', grunt.file.readJSON('package.json'));
                grunt.log.writeln('Updated version from ' + old + '->' + grunt.config('pkg.version') + ' (' + version + ')');
                done();
            }
            else {
                grunt.log.error('Error updating version from ' + old + ' (' + version + ')');
                done(false);
            }
        });
    });

    grunt.registerTask('gitTagVersion', function() {
        var exec = require('child_process').exec;
        var _ = require('lodash');
        var done = this.async();
        var version = grunt.config('pkg.version');
        var tasks = [
            'git pull --rebase',
            'git push origin',
            'git fetch --tags',
            'git push origin --tags',
            'git push origin'
        ];

        var doExec = function(index) {
            var task = tasks[index];
            if (task) {
                exec(task, function(error, stdout, stderr) {
                    if (error !== null) {
                        grunt.log.error('Error running: ', task, stderr);
                        done(false);
                    }
                    else {
                        if (tasks.length - 1 === index) {
                            done();
                        }
                        else {
                            doExec(++index);
                        }
                    }
                });
            }
        };

        exec('git diff --shortstat', function(err, stdout, stderr) {
            if (_.isEmpty(stdout)) {
                doExec(0);
            } else {
                // Assume this is safe because `grunt version` will error if there are unstaged changes
                exec('git commit -a -m "Update build to ' + version + '"', function(err, stdout, stderr) {
                    if (!err) {
                        doExec(0);
                    }
                    else {
                        grunt.log.error('Error commiting', stderr);
                        done(false);
                    }
                });
            }
        });
    });

    grunt.registerMultiTask('purge', 'Call EdgeCast API to purge CDN cache', function() {
        var done = this.async();
        var request = require('request');
        var doRequest;
        var upload;
        var doneCounter = 0;
        var doneInc;

        doRequest = function(data) {
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
                console.log(e, body);
                if (!e) {
                    if (body.Id) {
                        // assume only one file gets updated for now
                        grunt.log.writeln('Request sent, id = ' + body.Id);
                        doneInc();
                    }
                    else {
                        grunt.log.error('Error purging CDN cache.', e, body);
                        done(false);
                    }
                }
                else {
                    grunt.log.error('Error purging CDN cache.', e, body);
                    done(false);
                }
            });
        };

        upload = grunt.config('upload.' + this.target);

        doneInc = function() {
            doneCounter++;
            if (doneCounter >= upload.tasks.length) {
                done();
            }
        };

        if (upload && upload.tasks) {
            upload.tasks.forEach(function(task) {
                grunt.log.writeln('Purging...', grunt.config('CDN_URL') + task.dest);
                doRequest({
                    MediaPath: grunt.config('CDN_URL') + task.dest,
                    MediaType: 8
                });
            });
        }
    });

    grunt.registerMultiTask('upload', 'Uploads to CDN', function() {
        var self = this;
        var done = this.async();
        var versions;
        var tasks;
        var uploadTypes = {
            scp: function() {
                var scp = require('scp');

                this.data.tasks.forEach(function(task) {
                    task.src.forEach(function(src) {
                        scp.send({
                            host: self.data.host,
                            path: self.data.cdnRoot + task.dest,
                            file: __dirname + '/' + src
                        }, function(err, stdout, stderr) {
                            grunt.log.writeln(err, stdout, stderr);
                            if (err) done(false);
                            else done();
                        });
                        grunt.log.writeln('Uploading...', task.dest);
                    });
                });
            }
        };

        if (this.target === 'dev') {
            tasks = this.data.tasks;
            versions = getVersion(grunt.config('pkg.version'));
            tasks.push({
                src: [
                    grunt.config('uglify.main.dest')
                ],
                dest: '/js/t/' + versions.major + '.js'
            });
            tasks.push({
                src: [
                    grunt.config('uglify.main.dest')
                ],
                dest: '/js/t/' + versions.major + '.' + versions.minor + '.js'
            });
            grunt.config(this.name + '.' + this.target + '.tasks', tasks);
        }
        uploadTypes[this.data.type].apply(this);
    });
};
