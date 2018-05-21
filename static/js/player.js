/* global $ */

function onClick(element, callback) {
    element.on({ 'click': callback, 'touchend': callback });
}

let songManager = {
    init: function () {
        let songs = [];

        $('div.song').each(function () {
            let song = $(this);
            songs.push({
                id: parseInt(song.attr('data-id')),
                title: song.attr('data-title'),
                artist: song.attr('data-artist'),
                album: song.attr('data-album')
            });
        });

        songs.forEach((song, i) => {
            song.prev = songs[i - 1];
            song.next = songs[i + 1];
        });

        this.songs = songs;
    },
    getSong: function (id) {
        return this.songs.find(song => song.id === id);
    },
    resolveSong: function (input) {
        if (input && input.id) {
            // Probably already a song object, just return
            return input;
        }
        return this.getSong(parseInt(input));
    },
    first: function () {
        return this.songs[0];
    },
    last: function () {
        return this.songs[this.songs.length - 1];
    }
};

let player = {
    playURL: function (url) {
        this.context.attr('src', url);
    },
    raw: function () {
        return this.context.get()[0];
    },
    paused: function () {
        return this.raw().paused;
    },
    init: function () {
        this.context = $('#player');
        // Simulate hitting the stop button to initialize everything properly
        this.setCurrent();

        this.context.on('canplay', function () {
            if (this.context.attr('src')) {
                // Prevent the player from restarting when the stop button is pressed
                this.startPlayer();
            }
        }.bind(this));

        this.context.on('timeupdate', function () {
            let raw = this.raw();
            this.setProgress(raw.currentTime / raw.duration * 100);
        }.bind(this));

        onClick($('.progress'), function (event) {
            // Handle click OR touch position
            let off = event.originalEvent.touches
                ? event.originalEvent.touches[0].pageX - $('.progress-bar').position().left
                : event.originalEvent.offsetX;
            // Set the current play-time
            this.raw().currentTime = off / $('.progress').width() * this.raw().duration;
        }.bind(this));

        this.context.on('ended', function () {
            this.next();
        }.bind(this));
    },
    startPlayer: function () {
        $('#loading').animate({ 'opacity': 0 }, 300);
        $('#song-info').slideDown();

        let { title, artist, album } = this.current;

        $('#track-title').text(title);
        $('#track-artist').text(artist);
        $('#track-album').text(album);

        this.context.attr('title', title + ' - ' + artist);

        ui.get('ctrl-playpause').turnOff();
        this.raw().play();
    },
    setProgress: function (percent) {
        $('#song-progress').css('width', percent + '%');
    },
    setCurrent: function (song) {
        if (!song) {
            // Clear variable
            this.current = null;

            // Clear all audio settings
            this.context.attr('src', null);
            this.raw().currentTime = 0;
            this.setProgress(0);

            // Update UI to reflect state
            $('.player-ctrl').attr('disabled', true);
            $('#song-info').slideUp();
        } else {
            this.current = songManager.resolveSong(song);
            $('.player-ctrl').attr('disabled', false);
        }
    },
    play: function (song) {
        // Get by ID
        song = songManager.resolveSong(song) || this.current;

        if (this.compare(this.current, song)) {
            this.startPlayer();
        } else {
            this.pause();
            this.playURL('/track/' + song.id);

            setTimeout(function () {
                // Stupid client-side crap, PLAY THE DANG FILE
                if (this.paused()) this.startPlayer();
            }.bind(this), 5);

            $('#loading').animate({ 'opacity': 1 }, 300);

            this.last = this.current;
            this.setCurrent(song);
        }
    },
    pause: function () {
        this.raw().pause();
        ui.get('ctrl-playpause').turnOn();
    },
    playPause: function (song) {
        // Get by ID
        song = songManager.resolveSong(song) || this.current;

        if (this.compare(this.current, song)) {
            if (this.paused()) this.play(song);
            else this.pause();
        } else {
            this.play(song);
        }
    },
    stop: function () {
        this.pause();
        // Clear song
        this.setCurrent();
    },
    next: function () {
        if (!this.current) return;
        if (this.current.next)
            this.play(this.current.next);
        else
            this.play(songManager.first());
    },
    previous: function () {
        if (!this.current) return;
        if (this.current.prev)
            this.play(this.current.prev);
        else
            this.play(songManager.last());
    },
    compare: function (a, b) {
        return a && b && a.id === b.id;
    },
    button: function (id, method) {
        method = this[method].bind(this);
        $('#ctrl-' + id).click(function () { method(); });
    }
};

const ui = {
    elements: [],
    get: function (id) {
        return this.elements.find(function (e) { return e.id === id; });
    },
    toggler: function (id, on, off) {
        this.elements.push({
            id: id,
            e: $('#' + id),
            on: false,
            setState: function (state) {
                this.on = state;
                this.e.children('i').text(state ? on : off);
            },
            turnOn: function () {
                this.setState(true);
            },
            turnOff: function () {
                this.setState(false);
            },
            toggle: function () {
                this.setState(!this.on);
            }
        });
    }
};

player.button('stop', 'stop');
player.button('prev', 'previous');
player.button('playpause', 'playPause');
player.button('next', 'next');

ui.toggler('ctrl-playpause', 'play_arrow', 'pause');

onClick($('.cover'), function () {
    // player.playPause($(this).parents('.song').attr('data-id'));
});

$('#songs').niceScroll({
    cursorwidth: '0.5em',
    cursorheight: '1.5em'
});

player.init();
songManager.init();
