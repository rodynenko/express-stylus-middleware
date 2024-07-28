/*
 * Express Stylus middleware
 *
 * Copyright (c) 2017 Taras Rodynenko
 *
 * This middleware is Stylus-version of Andrew A. Usenok's
 * Express-less module (https://github.com/toogle/express-less)
 */

'use strict';

const fs = require('fs'),
  path = require('path'),
  stylus = require('stylus');

const autoprefixer = require('./autoprefixer-stylus-plugin');

const cache = {};

/**
 * @typedef {Object} CustomOptions
 * @prop {import('autoprefixer').Options | boolean} [autoprefixer]
 * @prop {boolean} [hideWarnings] - for autoprefixer
 * @prop {boolean} [cache] - use cache files
 */

/**
 * @param {import('fs').PathLike} customRoot 
 * @param {import('stylus').RenderOptions & CustomOptions} opts
 * @returns {Function} Express middleware
 */
module.exports = function(customRoot, opts) {
    const options = opts || {};
    const root = customRoot || __dirname + '/stylus';

    return function(req, res, next) {
        if (req.method != 'GET' && req.method != 'HEAD') {
            return next();
        }

        const pathname = new URL(req.url, 'http://example.com').pathname;

        if (path.extname(pathname) != '.css') {
            return next();
        }

        const src = path.join(
            root,
            path.dirname(pathname),
            path.basename(pathname, '.css') + '.styl'
        );

        // Restore from cache
        if (options.cache && cache[src]) {
            res.set('Content-Type', 'text/css');
            res.send(cache[src]);

            return;
        }

        fs.readFile(src, function(err, data) {
            if (err) return next();

            // Filter custom options
            // Leave only Stylus options
            const {
                autoprefixer: _autoprefixer,
                cache: _cache,
                hideWarnings,
                ...opts
            } = options;

            opts.paths = [
                path.join(
                    root,
                    path.dirname(pathname)
                )
            ];

            opts.filename = path.basename(src);

            if (options.autoprefixer){
              if (typeof options.autoprefixer === "boolean"){
                opts.use = [autoprefixer('last 2 versions', hideWarnings)];
              } else {
                opts.use = [autoprefixer(options.autoprefixer, hideWarnings)];
              }
            }

            stylus.render(data.toString('utf8'), opts, function(err, css) {
                if (err) {
                    return res.sendStatus(500);
                }

                // Store in cache
                if (options.cache) {
                    cache[src] = css;
                }

                res.set('Content-Type', 'text/css');
                res.send(css);
            });
        });
    };
};
