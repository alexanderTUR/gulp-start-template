import gulp from "gulp";
import browserSync from "browser-sync";
import util from "gulp-util";
import config from "../config";

const server = browserSync.create();

// in CL 'gulp server --open' to open current project in browser
// in CL 'gulp server --tunnel siteName' to make project available over http://siteName.localtunnel.me

gulp.task("server", done => {
  server.init({
    server: {
      baseDir: config.dest.root,
      directory: false,
      serveStaticOptions: {
        extensions: ["html"]
      }
    },
    files: [
      config.dest.html + "/*.html",
      config.dest.css + "/*.css",
      config.dest.js + "/*.js",
      config.dest.img + "/**/*"
    ],
    port: util.env.port || 3000,
    logLevel: "info", // 'debug', 'info', 'silent', 'warn'
    logConnections: false,
    logFileChanges: true,
    open: Boolean(util.env.open),
    notify: false,
    ghostMode: false,
    online: Boolean(util.env.tunnel),
    tunnel: util.env.tunnel || null
  });
  done();
});

const build = gulp => gulp.parallel("server");

module.exports.build = build;
