/**
 * Custom autoprefixer-stylus plugin to maintain dependancy
 * @ref https://github.com/jescalan/autoprefixer-stylus
 */
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const map = require('multi-stage-sourcemap');
const path = require('path');

/**
 * @param {import('autoprefixer').Options} [opts]
 * @param {boolean} [hideWarnings]
 * @returns {Function}
 */
module.exports = function autoprefixerStylusPlugin(opts = {}, hideWarnings) {
  /**
   * @param style - Stylus Renderer object
   */
  return function processCSS(style) {
    style = this || style
    const filename = style.options.filename

    style.on('end', function(err, css) {
      if (err) throw new Error(err)
      // configure the options to be passed to autoprefixer
      const processOpts = {
        from: filename,
        to:
          path.join(
            path.dirname(filename),
            path.basename(filename, path.extname(filename))
          ) + '.css'
      }

      // if there is a stylus sourcemap, ensure autoprefixer also generates one
      if (style.sourcemap) {
        processOpts.map = { annotation: false }
      }

      // run autoprefixer
      var res = postcss([autoprefixer(opts)]).process(css, processOpts);

      // if sourcemaps are generated, combine the two
      if (res.map && style.sourcemap) {
        var combinedMap = map.transfer({
          fromSourceMap: res.map.toString(),
          toSourceMap: style.sourcemap
        })

        // then set the combined result as the new sourcemap
        style.sourcemap = JSON.parse(combinedMap)
      }

      if (!hideWarnings) {
        res.warnings().forEach(console.info)
      }

      // return the css output
      return res.css
    })
  }
}