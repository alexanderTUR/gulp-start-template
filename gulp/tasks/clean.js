import del from 'del';
import log from 'fancy-log';
import ansiColors from 'ansi-colors';
import config from '../config';

const build = () => {
  return function () {
    return (
      del([
        config.dest.root, // delete destination folder
        config.revManifest, // delete rev-manifest file
      ])
        // log to console deleted objects
        .then((paths) => log(ansiColors.black.bgRed(`Deleted: ${paths.join('\n')}`)))
    );
  };
};

module.exports.build = build;
