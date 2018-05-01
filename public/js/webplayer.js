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

var headers = {
    'Accept': 'application/json',
    'Content-Type':'application/json',
    'Authorization': 'Bearer ' + getCookie('webplayer-token')
  };

function play(trackID){
  var dataString = null;
  if (trackID != null){
    dataString = '{"uris": ["spotify:track:' + trackID + '\"]}'
  }

  $.ajax({
    url: 'https://api.spotify.com/v1/me/player/play?device_id=' + deviceID.sharer,
    type: "PUT",
    data: dataString,
    headers: headers,
    success: function(data) {
      // console.log("playing")
    },
    error: function (xhr, ajaxOptions, thrownError){
      console.log(xhr.status);
    }});
}


function onStateChange(state){
  if (isSongOver(state)){
    playNextTrackFromQueue();
  }
  else{
   if (state != null){
  updateCurrentTrack(state["track_window"]["current_track"])
 }}
}


  updateCurrentTrack(state["track_window"]["current_track"])
}

var previousTracks = 0;
function isSongOver(state){
  if (state != null && previousTracks != state["track_window"]["previous_tracks"].length)
  {
    console.log(state);
    previousTracks = state["track_window"]["previous_tracks"].length;
    return true;
  }
  return false;
}


function updateCurrentTrack(current_track){
  $('#current-song-name').html(current_track["name"]);
  $('#current-song-artist').html(current_track["artists"][0]["name"] + " / " + current_track["album"]["name"]);
  $('#current-song-image').attr("src", current_track["album"]["images"][1]["url"]);
}


function playNextTrackFromQueue(){
  $.ajax({
   url: 'https://35.171.97.26:8888/getqueue',
   type: "GET",
   dataType: 'jsonp',
   headers: headers,
   success: function(data) {
     getNextTrack(data)
   },
   error: function (xhr, ajaxOptions, thrownError){
     console.log(xhr.status);
   }});
 }

function getNextTrack(data){
  var nextTrack = data[0]
  track = String(nextTrack)
  play(track)
}

