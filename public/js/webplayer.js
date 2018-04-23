const token = params.access_token;
var deviceID = {'sharer': null};

function updateSongInfo(state){
  var current_track = state["track_window"]["current_track"]
  console.log(state);
  $('#current-song-name').html(current_track["name"]);
  $('#current-song-artist').html(current_track["artists"][0]["name"] + " / " + current_track["album"]["name"]);
  $('#current-song-image').attr("src", current_track["album"]["images"][1]["url"]);
}

window.onSpotifyWebPlaybackSDKReady = () => {
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
