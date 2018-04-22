const token = params.access_token;
var deviceID = {'sharer': null};

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

// Playback status updates
// player.addListener('player_state_changed', state => { console.log(state); });
function updateSongInfo(state){
  var current_track = state["track_window"]["current_track"]
  console.log(current_track);
  //$('#song-display').html(JSON.stringify(dat));
}

player.addListener('player_state_changed', state => updateSongInfo(state));

// Ready
player.addListener('ready', ({ device_id }) => {
  deviceID.sharer = device_id;
  console.log('Ready with Device ID', device_id);
});

// Connect to the player!
player.connect();
};
