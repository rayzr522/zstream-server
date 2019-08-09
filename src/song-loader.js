
const path = require('path');
const fs = require('fs');
const mm = require('musicmetadata');
const mime = require('mime-types');
const { info, warn, error, variable } = require('./debug');

/**
 * @param {string} folder The folder to recurse through
 * @param {function} filter The file-filter function
 * @param {number} depth The depth to recurse
 */
const recurse = (folder, filter, depth = 2) => {
    let results = [];

    fs.readdirSync(folder).forEach(file => {
        if (!filter(file)) return;
        if (fs.statSync(path.join(folder, file)).isDirectory()) {
            if (depth < 1) return;
            results = results.concat(recurse(path.join(folder, file), filter, depth - 1).map(i => path.join(file, i)));
        } else {
            results.push(file);
        }
    });

    return results;
};

const fetchMetadata = file => new Promise((resolve, reject) => mm(fs.createReadStream(file), (err, meta) => err ? reject(err) : resolve(meta)));

module.exports = async base => {
    let songs = [];
    let id = 0;

    info(`Loading music from '${variable(base)}'...`);

    await Promise.all(
        recurse(base, file => !file.startsWith('.')).map(async file => {
            if (!/(.mp3|.m4a|.wav)$/i.test(file)) {
                return;
            }

            const parts = file.split(path.sep);

            if (parts.length < 3) {
                // Can't determine info from path, just clear this data.
                parts.splice(0);
            }


            const location = path.join(base, file);

            // Placeholder to avoid undefined errors
            let meta = { artist: [] };

            try {
                meta = await fetchMetadata(location);
            } catch (err) {
                if (err.message === 'Could not find metadata header') {
                    warn(`Could not find metadata for '${variable(file)}'`);
                } else {
                    error(`Failed to load metadata for '${variable(file)}':\n${err}`);
                    return;
                }
            }

            let title = meta.title || (parts[2] ? parts[2].substr(0, parts[2].lastIndexOf('.')) : '') || path.basename(file);
            let artist = meta.artist[0] || parts[0] || 'Unknown';
            let album = meta.album || parts[1] || 'Unknown';
            let artwork = 'https://placehold.it/150x150';

            if (meta.picture && meta.picture.length > 0) {
                artwork = {
                    type: mime.lookup(meta.picture[0].format),
                    data: meta.picture[0].data
                };
                // artwork = `data:image/${meta.picture[0].format};base64,${meta.picture[0].data.toString('base64')}`;
            }

            songs.push({
                id: id++,
                title,
                artist,
                album,
                artwork,
                location
            });
        })
    );

    info(`Finished loading ${variable(songs.length)} songs`);

    return songs;
};
