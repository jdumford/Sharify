
  var headers = {
      'Accept': 'application/json',
      'Content-Type':'application/json',
      'Authorization': 'Bearer ' + params.access_token,
    };

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

    $("#stream-tab-playlist, #top-start-stream").click(function() {
      getCurrentUserPlaylists();
    });

    $(document).ready(function(){
      getCurrentUserPlaylists();
      changeVolume(50);
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

