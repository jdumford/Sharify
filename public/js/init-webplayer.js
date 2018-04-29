var deviceID = {'sharer': null};

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

player.addListener('player_state_changed', state => onStateChange(state));

player.addListener('ready', ({ device_id }) => {
  deviceID.sharer = device_id;
  console.log('Ready with Device ID', device_id);
});

player.connect();
};
