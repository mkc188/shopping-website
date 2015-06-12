var grunt = require('grunt');

module.exports = {
  combine: {files: {'dist/css/screen.css': [grunt.config('paths.output.css') + '/**/*.css']}}
};
