(function() {

  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  var params = getHashParams();

  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  var headers = {
      'Accept': 'application/json',
      'Content-Type':'application/json',
      'Authorization': 'Bearer ' + access_token,
    };

  function play(){
    $.ajax({
      url: 'https://api.spotify.com/v1/me/player/play',
      type: "PUT",
      headers: headers,
      success: function(data) {
        // console.log("success");
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

  function refreshSongInfo(){
    $.ajax({
      url: 'https://api.spotify.com/v1/me/player',
      type: "GET",
      headers: headers,
      success: function(data) {
        console.log(data);
      },
      error: function (xhr, ajaxOptions, thrownError){
        console.log(xhr.status);
      }});
    }

  function playSongOnSharer(device_id){
      $.ajax({
        url: 'https://api.spotify.com/v1/me/player/play?device_id=' + device_id,
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

  if (error) {
    console.log(error);
    // alert('There was an error during the authentication');
  }
  else {
    if (access_token) {
      var authElem = document.getElementById('oauth');
      authElem.setAttribute('data-token', access_token);

      $.ajax({
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            $('#login').hide();
            $('#loggedin').show();
          }
      });

      document.getElementById('pause-button').addEventListener('click', function() {
        pause();
      });

      document.getElementById('play-button').addEventListener('click', function() {
	pause();
        $.ajax({
          url: 'https://api.spotify.com/v1/me/player/devices',
          type: "GET",
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(data) {
            if (data && data['devices']){
              for (i = 0; i < data['devices'].length; i++){
                var device = data['devices'][i];
                if (device['name'] == 'Music Sharer'){
                  if (device['is_active'] == true){
                    console.log("play it");
                    play();
                    refreshSongInfo();
                    break;
                  }
                  else {
                    console.log("play it on sharer");
                    playSongOnSharer(device['id']);
                    refreshSongInfo();
                    break;
                  }
                }
              }
            }
          },
          error: function (xhr, ajaxOptions, thrownError){
            console.log(xhr.status);
          }
        });
      }, false);

    }
    else {
console.log("no access token");
        // render initial screen
        $('#login').show();
        $('#loggedin').hide();
    }
//    document.getElementById('obtain-new-token').addEventListener('click', function() {
//      $.ajax({
//        url: '/refresh_token',
//        data: {
//          'refresh_token': refresh_token
//        }
//      }).done(function(data) {
//        access_token = data.access_token;

//        var authElem = document.getElementById('oauth');
//        authElem.setAttribute('data-token', access_token);

//      });
//    }, false);
  }
})();

