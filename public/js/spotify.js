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

$(document).ready(function(){
  //getCurrentUserPlaylists();
  getCurrentUser();
  if (window.location.pathname == '/stream'){
    getCurrentUserPlaylists();
  }
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

async function getStreamData(access_codes){
  var stream_headers = headers;
  var stream_data = [];

  for (var i in access_codes) {
    stream_headers.Authorization = 'Bearer ' + access_codes[i]
    var response = await $.ajax({
      url: 'https://api.spotify.com/v1/me/player/currently-playing',
      type: "GET",
      headers: stream_headers
    });
    stream_data.push(response);
    }
  return stream_data;
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

    $("#stream-tab-playlist).click(function() {
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

