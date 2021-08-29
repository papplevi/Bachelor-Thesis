'use strict';

module.exports = function(grunt) {

    require("load-grunt-tasks")(grunt);
    grunt.initConfig({

        "babel": {
            options: {
              sourceMap: false,
            },
            dist: {
              files: [
              {
                expand: true,
                cwd: 'webapp/',
                src: ['**/*.js'],
                dest: 'webapp/'
              },
            ],
          },
        },

        dir: {
            webapp: 'webapp',
            dist: 'dist',
            webapp_resources: 'webapp/resources',
            dist_resources: 'dist/resources',
            runtime: 'runtime',
            bower_components: 'bower_components'
        },

        time: {
            today: '<%= grunt.template.today(\'yymmdd\') %>'
        },

        basename: {
            site: 'smarthome-webbapp-<%= time.today %>'
        },

        connect: {
            options: {
                port: 3000, // can be changed perhaps
                hostname: '*'
            },
            src: {},
            dist: {}
        },

        openui5_connect: {
            options: {
                resources: [
                    /*'<%= dir.webapp_resources %>'*/
                ]
            },
            src: {
                options: {
                    appresources: '<%= dir.webapp %>'
                }
            },
            dist: {
                options: {
                    appresources: '<%= dir.dist %>'
                }
            }
        },

        openui5_preload: {
            component: {
                options: {
                    resources: {
                        cwd: '<%= dir.webapp %>',
                        prefix: 'SmartHome'
                    },
                    dest: '<%= dir.dist %>'
                },
                components: true
            }
        },

        openui5_theme: {
            options: {
                rootPaths: [
                    '<%= dir.webapp_resources %>'
                ],
                compiler: {
                    compress: false
                }
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= dir.webapp_resources %>',
                        src: [],
                        dest: '<%= dir.webapp_resources %>'
                    }
                ]
            }
        },

        clean: {
            dist_resources: '<%= dir.dist_resources %>/',
            dist: {
                src: ['<%= dir.dist %>/*', '!<%= dir.dist %>/resources/**']
            }
        },

        copy: {
            dist_resources: {
                files: [
                    { expand: true, cwd: '<%= dir.bower_components %>/openui5-sap.m/resources', src: ['**', '!test/**', "!**/*.less"], dest: '<%= dir.dist_resources %>' },
                    { expand: true, cwd: '<%= dir.bower_components %>/openui5-sap.tnt/resources', src: ['**', '!test/**', "!**/*.less"], dest: '<%= dir.dist_resources %>' },
                    { expand: true, cwd: '<%= dir.bower_components %>/openui5-sap.ui.core/resources', src: ['**', '!test/**', "!**/*.less"], dest: '<%= dir.dist_resources %>' },
                    { expand: true, cwd: '<%= dir.bower_components %>/openui5-sap.ui.layout/resources', src: ['**', '!test/**', "!**/*.less"], dest: '<%= dir.dist_resources %>' },
                    { expand: true, cwd: '<%= dir.bower_components %>/openui5-sap.ui.table/resources', src: ['**', '!test/**', "!**/*.less"], dest: '<%= dir.dist_resources %>' },
                    { expand: true, cwd: '<%= dir.bower_components %>/openui5-sap.ui.unified/resources', src: ['**', '!test/**', "!**/*.less"], dest: '<%= dir.dist_resources %>' },
                    { expand: true, cwd: '<%= dir.bower_components %>/openui5-themelib_sap_belize/resources', src: ['**', '!test/**', "!**/*.less"], dest: '<%= dir.dist_resources %>' }
                ]
            },
            dist: {
                files: [
                    { expand: true, cwd: '<%= dir.webapp %>', src: ['**', '!test/**', '!**/*.less'], dest: '<%= dir.dist %>' }
                ]
            }
        },

        eslint: {
            webapp: ['<%= dir.webapp %>'],
            options: {
                ignorePattern: "**/*.min.js"
            }
        },

        compress: {
            theme: {
                options: {
                    archive: '<%= basename.theme %>.tgz'
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: [
                        '!./resources/sap/**/*.less'
                    ],
                    dest: '<%= basename.theme %>/'
                }],
            },
            site: {
                options: {
                    archive: '<%= basename.site %>.tgz'
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: [
                        './index.html',
                        './manifest.json',
                        './Component.js',
                        './Component-preload.js',
                        //'./res/**',
                        './lib/**',
                        './view/**',
                        //'./css/**',
                        './controller/**'
                    ],
                    dest: '<%= basename.site %>/'
                }]
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-openui5');
    grunt.loadNpmTasks('grunt-eslint');

    // Server task
    grunt.registerTask('serve', function(target) {
        grunt.task.run('openui5_connect:' + (target || 'src') + ':keepalive');
    });

    // Linting task
    grunt.registerTask('lint', ['eslint']);

    // Build task
    grunt.registerTask('install-resources', ['clean:dist_resources', 'copy:dist_resources']);

    // Build task
    grunt.registerTask('build', ['openui5_theme:dist', 'clean:dist', 'copy:dist', 'openui5_preload']);

    // Default task
    grunt.registerTask('default', [
        'lint',
        "babel",
        'clean:dist',
        'build',
        'serve:dist'
    ]);
};
