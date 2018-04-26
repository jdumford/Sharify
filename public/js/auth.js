var params = {};

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

  params = getHashParams();

  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  if (error) {
    console.log(error);
  }
  else {
    if (access_token) {

      $.ajax({
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            // $('#login').hide();
            // $('#loggedin').show();
          }
      });
    }
    else {
        // $('#login').show();
        // $('#loggedin').hide();
    }

    // document.getElementById('obtain-new-token').addEventListener('click', function() {
    //   $.ajax({
    //     url: '/refresh_token',
    //     data: {
    //       'refresh_token': refresh_token
    //     }
    //   }).done(function(data) {
    //     access_token = data.access_token;
    //     params.access_token = data.access_token;
    //
    //   });
    // }, false);
  }
})();
