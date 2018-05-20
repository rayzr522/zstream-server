const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const mime = require('mime-types');
const chalk = require('chalk');
const postcssMiddleware = require('postcss-middleware');
// const compression = require('compression');

const utils = require('./src/utils');
const { info } = require('./src/debug');

const base = path.resolve('.');
const songs = require('./src/songs')(base);

const app = express();

// Loads about 50ms faster without (on 127.0.0.1), probably due to Network usage vs. CPU usage
// app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/css', postcssMiddleware({
    plugins: [require('autoprefixer')],
    src: function (req) {
        return path.join(__dirname, 'static', 'css', req.path);
    }
}));
app.use(express.static(path.join(__dirname, 'static')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

function sc(item1, item2) {
    return !item1 || !item2 || item1.toLowerCase().indexOf(item2.toLowerCase()) > -1;
}

function findSongs(req) {
    return songs.filter(s => {
        return sc(s.title, req.title) && sc(s.artist, req.artist) && sc(s.album, req.album);
    });
}

app.get('/', (req, res) => {
    res.render('index', { title: 'ZStream - Home', songs: songs.length });
    info(`Display home page for ${chalk.yellow(utils.cleanIP(req.socket.remoteAddress))}`);
});

app.get('/songs', (req, res) => {
    info(`Displaying songs page for ${chalk.yellow(utils.cleanIP(req.socket.remoteAddress))} ${req.query ? `with filter ${chalk.yellow(utils.compactString(req.query))}` : ''}`);

    res.render('songs', {
        title: 'ZStream - Songs',
        songs: findSongs(req.query || {})
    });
});

app.get('/track/:track', (req, res) => {
    let song = songs[parseInt(req.params.track)];
    if (!song) {
        res.header('Content-Type', 'text/raw');
        res.send('Invalid track id');
        return;
    }
    let type = mime.lookup(song.location);
    res.header('Content-Type', type);
    res.sendFile(song.location);
});

app.get('/artwork/:track', (req, res) => {
    let song = songs[parseInt(req.params.track)];
    if (!song) {
        res.header('Content-Type', 'text/raw');
        res.send('Invalid track id');
        return;
    }
    let art = songs[parseInt(req.params.track)].artwork;
    if (typeof art === 'object') {
        res.header('Content-Type', art.type);
        res.header('Content-Length', art.data.length);
        res.send(art.data);
    } else if (typeof art === 'string') {
        res.redirect(art);
    } else {
        res.send('Error');
    }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});


module.exports = app;
