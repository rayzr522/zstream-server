/* global $ M */

function reloadSongs() {
    M.toast({ html: 'Reloading...' });
    $.ajax('/reload', {
        success: () => {
            M.toast({ html: 'Done.' });
        }
    });
}

$('#reload-songs').click(reloadSongs);
