import del from 'del';
import util from 'gulp-util';
import config from '../config';

const build = () => {
  return function () {
    return (
      del([
        config.dest.root, // delete destination folder
        config.revManifest, // delete rev-manifest file
      ])
        // log to console deleted objects
        .then((paths) => util.log('Deleted:', util.colors.cyan(paths.join('\n'))))
    );
  };
};

module.exports.build = build;
