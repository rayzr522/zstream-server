function onClick(element, callback) {
    element.on({ 'click': callback, 'touchend': callback });
}

var player = {
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
        $('#controls').slideDown();

        this.context = $('#player');

        this.context.on('canplay', this.startPlayer.bind(this))

        this.context.on('timeupdate', function () {
            var raw = this.raw();
            $('.progress').css('width', (raw.currentTime / raw.duration * 100) + '%');
        }.bind(this));

        onClick($('.progress-bar'), function (event) {
            // Handle click OR touch position
            var off = event.originalEvent.touches
                ? event.originalEvent.touches[0].pageX - $('.progress-bar').position().left
                : event.originalEvent.offsetX;
            // Set the current play-time
            this.raw().currentTime = off / $('.progress-bar').width() * this.raw().duration;
        }.bind(this));

        this.context.on('ended', function () {
            this.next();
        }.bind(this));
    },
    startPlayer: function () {
        $('#loading').animate({ 'opacity': 0 }, 300);
        $('#song-info').slideDown();

        var title = this.current.attr('data-title');
        var artist = this.current.attr('data-artist');
        var album = this.current.attr('data-album');

        $('#track-title').text(title);
        $('#track-artist').text(artist);
        $('#track-album').text(album);

        this.context.attr('title', title + ' - ' + artist);

        ui.get('ctrl-playpause').turnOff();
        this.raw().play();
    },
    play: function (song) {
        if (!this.context) this.init();
        song = song || this.current;

        if (this.compare(this.current, song)) {
            this.startPlayer();
        } else {
            this.pause();
            this.playURL('/track/' + song.attr('data-id'));

            setTimeout(function () {
                // Stupid client-side crap, PLAY THE DANG FILE
                if (this.paused()) this.startPlayer();
            }.bind(this), 5);

            $('#loading').animate({ 'opacity': 1 }, 300);

            if (this.current) this.current.find('.cover').removeClass('current-song');
            song.find('.cover').addClass('current-song');
            this.last = this.current;
            this.current = song;
        }
    },
    pause: function () {
        this.raw().pause();
        ui.get('ctrl-playpause').turnOn();
    },
    playPause: function (song) {
        if (!this.context) this.init();
        song = song || this.current;
        if (this.compare(this.current, song)) {
            if (this.paused()) this.play(song);
            else this.pause();
        } else {
            this.play(song);
        }
    },
    stop: function () {
        this.pause();
        this.context.attr('src', null);
        this.raw().currentTime = 0;
        $('#song-info').slideUp();
    },
    next: function () {
        if (!this.context) this.init();
        if (!this.current) return;
        if (this.current.index() < this.current.siblings().length)
            this.play(this.current.next('.song'));
        else
            this.play(this.current.siblings().first())
    },
    previous: function () {
        if (!this.context) this.init();
        if (!this.current) return;
        if (this.current.index() > 0)
            this.play(this.current.prev('.song'));
        else
            this.play(this.current.siblings().last());
    },
    compare: function (a, b) {
        return a && b && a.attr('data-id') === b.attr('data-id');
    },
    button: function (id, method) {
        method = this[method].bind(this);
        $("#ctrl-" + id).click(function () { method(); });
    }
}

var ui = {
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
                this.e.removeClass(state ? off : on).addClass(state ? on : off);
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
}

player.button('stop', 'stop');
player.button('prev', 'previous');
player.button('playpause', 'playPause');
player.button('next', 'next');

ui.toggler('ctrl-playpause', 'fa-play', 'fa-pause');

onClick($('.cover'), function () {
    player.playPause($(this).parent());
});

$('#songs').niceScroll({
    cursorwidth: '0.5em',
    cursorheight: '1.5em'
});