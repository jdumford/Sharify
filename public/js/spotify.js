
$(document).ready(function(){
    //getCurrentUserPlaylists();
    getCurrentUser();
    getStreamData();
    if (window.location.pathname == '/stream'){
	getCurrentUserPlaylists();
    }
    // database call to get queue song ids
    getTracksFromIDs(['0GKlgYoKod155w3erIfFXn', '0AFZnXDUT5qbJboJMZ6zlp'])
    getQueue();
    //changeVolume(50);
    //getsong();
    //displayStreams([access_token]);
});

function getsong(){
  $.ajax({
    url: 'https://35.171.97.26:8888/getsong',
    type: "GET",
    dataType: 'jsonp',
    success: function(data) {
    //   console.log(data);
    },
    error: function (xhr, ajaxOptions, thrownError){
      console.log(xhr.status);
    }});
}

async function displayStreams(access_codes){
  var streamData = await getStreamData(access_codes);
  console.log(streamData);
}

async function getStreamData(){
    //var stream_headers = headers;
    var stream_data = [];
    /*
    $.get('/friends-streaming', function(res){
	console.log(res);
    });
    */
    
    $.ajax({
	url: 'https://34.224.122.69:8888/friends-streaming',
	type: "GET",
	dataType: 'jsonp',
	success: function(streams) {
	    for(var i in streams){
		console.log(streams[i])
		var s = '<div class="row stream-row"><div class="col-md-3" style="text-align:center"><img class="stream-img" src="' + 
		    streams[i].album_cover + '"><div>' + streams[i].name + ' - ' +
                    streams[i].artist + '</div></div><div class="col-md-9"><div class>' + 
		    'Streamer Name' + '</div><div>' + 'This is a description'  + '</div></div></div>';
		$('#friends-streams').append(s)
	    }
	},
	error: function (xhr, ajaxOptions, thrownError){
	    console.log("BAD")
	    console.log(xhr.status);
	}});
    
}


  function searchTracks(query) {
    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        type: "GET",
        headers: headers,
        data: {
            q: query,
            type: 'track'
        },
        success: function (response) {
          var images = "<img src=\"/media/play.png\" class=\"search-icons search-play\">"
          + "<img src=\"/media/plus.png\" class=\"search-icons plus\">"
          var trackList = ""
          for (i = 0; i < 5; i++) {
            var track = response["tracks"]["items"][i];
            var songID = track["id"];
            var songName = track["name"];
            var songArtist = track["artists"][0]["name"];
            trackList += "<li class=\"search-item\" data-songid=\"" + songID + "\">"
            + images + songName + " - " + songArtist + "</li>"
          }
          if (response["tracks"]["items"].length > 0){
            $('#search').removeClass('search-well')
          }
          else if ($('#search').hasClass('search-well')){
            $('#search').removeClass('search-well')
          }

          $('#track-list').html(trackList);
        },
        error: function (xhr, ajaxOptions, thrownError){
          console.log(xhr.status);
        }});
    }

    function getCurrentUserPlaylists(){
        $.ajax({
        url: 'https://api.spotify.com/v1/me/playlists',
        type: "GET",
        headers: headers,
        cache: false,
        success: function(data) {
          var playlistName = data["items"][0]["name"];
          var playlistID = data["items"][0]["id"];
          var playlists = ""

          for (var i in data["items"]) {
            var playlist = data["items"][i]
            var trackList = '<ul class=\"search-results playlist-songs\" id=\"pl-' + String(i) + '-tracks' + '\"></ul>'
            playlists += "<li class=\"search-item playlist\" id=\"pl-" + String(i) + "\" data-playlistid=\""
            + playlist["id"] + "\">" + playlist["name"] + trackList + "</li>"
          }
          $('#playlist-list').html(playlists);
        },
        error: function (xhr, ajaxOptions, thrownError){
          console.log(xhr.status);
        }});
      }


  function getCurrentUser(){
    $.ajax({
      url: 'https://api.spotify.com/v1/me',
      type: "GET",
      headers: headers,
      success: function(data){
        $('#username').html(data['display_name'])
      },
      error: function (xhr, ajaxOptions, thrownError){
        console.log(xhr.status);
      }});
    }


    async function getPlaylistTracks(playlistID, index){
      var userID = await getUserID();

      $.ajax({
        url: 'https://api.spotify.com/v1/users/' + userID + '/playlists/' + playlistID + '/tracks',
        type: "GET",
        headers: headers,
        success: function(data) {
          showPlaylistTracks(data, index)
        },
        error: function (xhr, ajaxOptions, thrownError){
          console.log(xhr.status);
        }});
    }

    async function getUserID(){
      var response = await $.ajax({
          url: 'https://api.spotify.com/v1/me',
          type: "GET",
          headers: headers
        });
        return response["id"];
      }

      function showPlaylistTracks(data, index){
        var images = "<img src=\"/media/play.png\" class=\"search-icons search-play\">"
        + "<img src=\"/media/plus.png\" class=\"search-icons plus\">"

        var tracks = ""
        for (var i in data["items"]) {
          var track = data["items"][i]["track"]
          var songID = track["id"]
          var songName = track["name"]
          var songArtist = track["artists"][0]["name"];
          tracks += "<li class=\"search-item\" data-songid=\"" + songID + "\">"
          + images + songName + " - " + songArtist + "</li>"
          }

          var elementID = String(index) + '-tracks'
          $('#' + elementID).html(tracks);
          $('#' + elementID).slideDown();
        }

    function pause(){
      $.ajax({
        url: 'https://api.spotify.com/v1/me/player/pause',
        type: "PUT",
        headers: headers,
        success: function(data) {
          // console.log("success");
        },
        error: function (xhr, ajaxOptions, thrownError){
          console.log(xhr.status);
        }});
      }

    function changeVolume(value){
      $.ajax({
        url: 'https://api.spotify.com/v1/me/player/volume?volume_percent=' + value,
        type: "PUT",
        headers: headers,
        success: function(data) {
          // console.log("success");
        },
        error: function (xhr, ajaxOptions, thrownError){
          console.log(xhr.status);
        }});
      }

   // trackIDs is array of strings
   function getTracksFromIDs(trackIDs){
     $.ajax({
       url: 'https://api.spotify.com/v1/tracks',
       type: "GET",
       headers: headers,
       data: {
         ids: trackIDs.join()
       },
       success: function(data) {
         updateQueueDisplay(data["tracks"])
       },
       error: function (xhr, ajaxOptions, thrownError){
         console.log(xhr.status);
     }});
   }

   function updateQueueDisplay(songs){
    var songdisplay = ""
    for (var i in songs) {
      var songname = songs[i]["name"]
      var songartist = songs[i]["artists"][0]["name"]
      var songid = songs[i]["id"]
      songdisplay += "<li class=\"queue-item\" id=\"queue-" + String(i) + "\" data-queuesongid=\""
       + songid + "\">" + songname + " - " + songartist + "</li>"
    }
    $('#queue-list').html(songdisplay)
   }


    $("#play-button").click(function() {
      pause();
      play();
      $(this).addClass('hidden');
      $("#pause-button").removeClass('hidden');
    });

    $("#pause-button").click(function() {
      pause();
      $(this).addClass('hidden');
      $("#play-button").removeClass('hidden');
    });

    $("#stream-tab-playlist").click(function() {
      getCurrentUserPlaylists();
    });

    $("#track-list, #playlist-list").on('click', '.search-play', function() {
      var songID = $(this).parent().data('songid');
      pause();
      play(songID);
    });

    $("#playlist-list").on('click', '.playlist', function() {
      if ($(this).children().is(':visible')){
        $(this).children().slideUp();
      }
      else{
        var playlistID = $(this).data('playlistid');
        var index = $(this).attr('id');
        getPlaylistTracks(playlistID, index);
      }
    });

    $("#search-form").submit(function(e){
      e.preventDefault();
      searchTracks(document.getElementById('query').value);
    });

    $('#volumeSlider').mouseup(function(){
      changeVolume($(this).val());
    });

function getQueue(){
  $.ajax({
    url: 'https://35.171.97.26:8888/getqueue',
    type: "GET",
    dataType: 'jsonp',
    success: function(data) {
       console.log(data);
    },
    error: function (xhr, ajaxOptions, thrownError){
      console.log(xhr.status);
    }});
}
