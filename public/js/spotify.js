
  var headers = {
      'Accept': 'application/json',
      'Content-Type':'application/json',
      'Authorization': 'Bearer ' + params.access_token,
    };

  function getCurrentUserPlaylists(){
      $.ajax({
      url: 'https://api.spotify.com/v1/me/playlists',
      type: "GET",
      headers: headers,
      cache: false,
      success: function(data) {
        var playlistName = data["items"][0]["name"];
        var playlistID = data["items"][0]["id"];
        $('#playlists').html(String(playlistName));
        $('#playlists').data('id', playlistID);
      },
      error: function (xhr, ajaxOptions, thrownError){
        console.log(xhr.status);
      }});
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


  function searchAlbums(query) {
    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        type: "GET",
        headers: headers,
        data: {
            q: query,
            type: 'track'
        },
        success: function (response) {
          var trackList = ""
          for (i = 0; i < 3; i++) {
            var track = response["tracks"]["items"][i];
            var songID = track["id"];
            var songName = track["name"];
            var songArtist = track["artists"][0]["name"];
            trackList += "<li class=\"search-track\" data-songid=\"" + songID + "\">"
            + songName + " - " + songArtist + "</li>"
          }
          document.getElementById('track-list').innerHTML = trackList;
        },
        error: function (xhr, ajaxOptions, thrownError){
          console.log(xhr.status);
        }});
    }

    function play(){
      $.ajax({
        url: 'https://api.spotify.com/v1/me/player/play?device_id=' + deviceID.sharer,
        type: "PUT",
        data: '{"uris": ["spotify:track:40h65HAR8COEoqkMwUUQHu"]}',
        headers: headers,
        success: function(data) {
          //console.log("success");
        },
        error: function (xhr, ajaxOptions, thrownError){
          console.log(xhr.status);
        }});
    }

    $("#play-button").click(function() {
      pause();
      play();
    });

    $("#pause-button").click(function() {
      pause();
    });

    $("#playlist-button").click(function() {
      getCurrentUserPlaylists();
    });

    $("#track-list").on('click', '.search-track', function() {
      console.log($(this).data('songid'));
    });

    $("#search-form").submit(function() {
      searchAlbums(document.getElementById('query').value);
    });
