var deviceID = {'sharer': null};

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


function updateSongInfo(state){
  var current_track = state["track_window"]["current_track"]
  $('#current-song-name').html(current_track["name"]);
  $('#current-song-artist').html(current_track["artists"][0]["name"] + " / " + current_track["album"]["name"]);
  $('#current-song-image').attr("src", current_track["album"]["images"][1]["url"]);
}

window.onSpotifyWebPlaybackSDKReady = () => {
  var token = getCookie('webplayer-token');
  const player = new Spotify.Player({
    name: 'Music Sharer',
    getOAuthToken: cb => { cb(token); }
  });

// Error handling
player.addListener('initialization_error', ({ message }) => { console.error(message); });
player.addListener('authentication_error', ({ message }) => { console.error(message); });
player.addListener('account_error', ({ message }) => { console.error(message); });
player.addListener('playback_error', ({ message }) => { console.error(message); });

player.addListener('player_state_changed', state => updateSongInfo(state));

player.addListener('ready', ({ device_id }) => {
  deviceID.sharer = device_id;
  console.log('Ready with Device ID', device_id);
});

player.connect();
};
