
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
    $("#pause-button").removeClass('hidden');
    $("#play-button").addClass('hidden');
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
    playedSong([2, state["track_window"]["current_track"]["id"]])
    playNextTrackFromQueue()
    playerShowQueue()
  }
  else{
   if (state != null){
  updateCurrentTrack(state["track_window"]["current_track"])
 }}
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
   url: 'https://34.224.122.69:8888/getqueue',
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


function playedSong(params){
  console.log(params)
  $.ajax({
   url: 'https://34.224.122.69:8888/playedSong',
   type: "GET",
   headers: headers,
   data: {
     stid: params[0],
     sid: params[1]
   },
   success: function(data) {
     console.log(data)
   },
   error: function (xhr, ajaxOptions, thrownError){
     console.log(xhr.status);
   }});
 }


async function playerShowQueue(){
 var queueIDs = await getQueue()
 console.log(queueIDs)
 playerGetTracksFromIDs(queueIDs)
}

function playerGetTracksFromIDs(trackIDs){
if (trackIDs){
   $.ajax({
       url: 'https://api.spotify.com/v1/tracks',
       type: "GET",
       headers: headers,
       data: {
           ids: trackIDs.join()
       },
       success: function(data) {
           playerUpdateQueueDisplay(data["tracks"])
       },
       error: function (xhr, ajaxOptions, thrownError){
           console.log(xhr.status);
       }});
}}

function playerUpdateQueueDisplay(songs){
     var songdisplay = ""
     for (var i in songs) {
       if(songs[i]){
         var songname = songs[i]["name"]
         var songartist = songs[i]["artists"][0]["name"]
         var songid = songs[i]["id"]
         songdisplay += '<div class="row queue-item" id="queue-' + String(i) +
             '"><div class="col-xs-8" style="padding-top:5px"><div class="queue-info">' + songname +
             '</div><div class="queue-info">' + songartist + '</div></div>' +
             '<div class="col-xs-4 text-right"><div style="text-align:center">' +
             '<img class="upvote-icon" data-queuesongid="' +
              songid + '" src="/media/upvote.png"><div class="votes">' + '0' +
             '</div><img class="downvote-icon" src="/media/downvote.png"></div></div></div>';
     }}

     $('.queue-item').remove()
     $('#queue').append(songdisplay)
     $('.queue-info').autoTextTape();
 }
