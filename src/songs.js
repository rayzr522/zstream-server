
const path = require('path');
const fs = require('fs');
const mm = require('musicmetadata');
const mime = require('mime-types');

module.exports = function (base) {
    let songs = [];
    let id = 0;

    recurse(base, (file) => !file.startsWith('.')).forEach(file => {
        let parts = file.split(path.sep);
        let artist = parts[0];
        let album = parts[1];
        let title = parts[2].substr(0, parts[2].lastIndexOf('.'));
        let location = path.join(base, file);
        let artwork = 'https://placehold.it/150x150';

        if (!/.mp3$|.m4a$|.wav$/.test(file)) {
            return;
        }

        mm(fs.createReadStream(file), (err, meta) => {
            if (meta.picture && meta.picture.length > 0) {
                artwork = {
                    type: mime.lookup(meta.picture[0].format),
                    data: meta.picture[0].data
                }
                // artwork = `data:image/${meta.picture[0].format};base64,${meta.picture[0].data.toString('base64')}`;
            }

            songs.push({
                title: meta.title || title,
                artist: meta.artist[0] || artist,
                album: meta.album || album,
                artwork,
                location,
                id
            });
            id++;

        });
    });
    return songs;
};

/**
 * @param {string} folder The folder to recurse through
 * @param {function} filter The file-filter function
 * @param {number} depth The depth to recurse
 */
function recurse(folder, filter, depth = 2) {
    let results = [];

    fs.readdirSync(folder).forEach(file => {
        if (!filter(file)) return;
        if (fs.statSync(path.join(folder, file)).isDirectory()) {
            if (depth < 1) return;
            results = results.concat(recurse(path.join(folder, file), filter, depth - 1).map(i => path.join(file, i)));
        } else results.push(file);
    });

    return results;
}