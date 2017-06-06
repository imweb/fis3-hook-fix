/**
 * fix something
 * 1. addSameNameRequire，fix such as 'es6.js'
 * example:
 * fis.hook('commonjs', {
 *     fixAddSameNameRequire: ['.es6.js']
 * });
 * 
 * @author lqlongli
 * 
 */

var path = require('path');
var fs = require('fs');

/*
 * 后缀规范函数，保证后缀串第一个字符必为.
 * @param  {String} ext 后缀串
 * @return {String}     若第一个没有.则加上，若有.则去掉
 */
function normalizeExt(ext) {
    if (ext[0] !== '.') {
        ext = '.' + ext;
    }
    return ext;
}

/**
 * 大小写敏感的文件路径判断，fs 没有提供更直接的 API，只能通过 list 接口来判断。
 */
function caseSensiveFileExits(filepath) {
  var dir = path.dirname(filepath);
  var basename = path.basename(filepath);

  var filenames = fs.readdirSync(dir);
  if (~filenames.indexOf(basename)) {
    return true;
  }

  return false;
}

function addSameNameRequire(fis, file, realpathNoExt, filename, ext) {
    var path, map;

    console.log('>>>> addSameNameRequire:', file.dirname, file.realpath, realpathNoExt, ext, fis.util.isFile(realpathNoExt + ext), caseSensiveFileExits(realpathNoExt + ext));
    if (fis.util.isFile(realpathNoExt + ext) && caseSensiveFileExits(realpathNoExt + ext)) {
        path = './' + filename + ext;
    } else if ((map = fis.media().get('project.ext'))) {
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                var oExt = normalizeExt(key);
                var rExt = normalizeExt(map[key]);
                if (rExt === ext && fis.util.isFile(realpathNoExt + oExt) && caseSensiveFileExits(realpathNoExt + oExt)) {
                    path = './' + filename + oExt;
                    break;
                }
            }
        }
    }

    console.log('>>>> addSameNameRequire path:', path);
    if (path) {
        var info = fis.uri.getId(path, file.dirname);
        console.log('>>>>> addSameNameRequire info:', info.file.useMap, !~file.asyncs.indexOf(info.id));
        if (info.file && info.file.useMap && !~file.asyncs.indexOf(info.id)) {
            file.addLink(info.file.subpath);
            file.addRequire(info.id);
        }
    }
}

module.exports = function(fis, opts) {
    opts = opts || {};

    if (opts.fixAddSameNameRequire && opts.fixAddSameNameRequire.length) {
        fis.on('process:end', function(file) {
            var ext;
            var pos;
            var realpathNoExt;
            var filename;
            if (file.useSameNameRequire) {
                for (var i = 0, l = opts.fixAddSameNameRequire.length; i < l; ++i) {
                    ext = normalizeExt(opts.fixAddSameNameRequire[i]);
                    if ((pos = file.basename.lastIndexOf(ext)) > -1) {
                        filename = file.basename.substring(0, pos);
                        realpathNoExt = fis.util(file.dirname, filename);
                        if (file.isJsLike) {
                            addSameNameRequire(fis, file, realpathNoExt, filename, '.css');
                        } else if (file.isHtmlLike) {
                            addSameNameRequire(fis, file, realpathNoExt, filename, '.js');
                            addSameNameRequire(fis, file, realpathNoExt, filename, '.css');
                        }
                        break;
                    }
                }
            }
        });
    }
};
