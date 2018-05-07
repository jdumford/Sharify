 
$(document).ready(function(){
    getCurrentUser();
    getStreamData();
    showQueue();
    changeVolume(50);
});


//setInterval(function(){
//    getStreamData()
//    showQueue()
//}, 15000);

function playlistToggle(name, index){
    var pid = $(name).attr('data-playlistid');
    if($(name).hasClass('collapsed')){
	getPlaylistTracks(pid, index);
    }else{
	$('.search-item').each(function(){
	    if($(this).attr('data-playlistid') == pid){
		$(this).slideUp();
	    }
	});
    }
    $(name).toggleClass('collapsed')
}

//makes a call to the backend to get the information for friends currently streaming
async function getStreamData(){
    var stream_data = [];

    
    $.ajax({
	url: 'https://34.224.122.69:8888/friends-streaming',
	type: "GET",
	dataType: 'jsonp',
	success: function(streams) {
	    $('#main-friends-streams').css("display", "none");
	    $('#main-friends-streams').html("");
	    for(var i in streams){
		var s = '<div class="stream-row" currentsong="' + streams[i].songID + '" streamer="' + streams[i].streamerID + 
		    '"><div class="col-sm-2 col-md-1">' + 
		    '<img class="join-stream" style="width: 40px" src="/media/play.png">' + 
		    '</div><div class="col-sm-5 col-md-6">' + 
		    '<div style="font-size: 18pt" onclick="renderProfile(\'' + streams[i].streamerID + 
		    '\')">' + streams[i].streamerName + '</div><div>' + 
		    ''  + '</div></div>' +
		    '<div class="col-sm-2" style="text-align:center; border-left: 1px solid black;">' + 
		    '<img class="stream-img" src="' + streams[i].album_cover + 
		    '"></div><div class="col-sm-3"><div class="scroll-info">' + 
		    'Currently Playing</div><div class="scroll-info">' + streams[i].name + ' - ' + 
		    streams[i].artist + '</div><div class="scroll-info">' + 
		    '' + '</div></div></div>';
		$('#main-friends-streams').append(s);
		$('.scroll-info').autoTextTape();
	    }
	    $.ajax({
		url: 'https://34.224.122.69:8888/live-streams',
		type: "GET",
		datatype: 'jsonp',
		success: function(data){
		    $('.stream-row').css('display', 'none');
		    for (var row in data){
			var row_string = '.stream-row[streamer="' + data[row].split(',')[1] + '"';
			if (data[row].split(',')[2] != 'private'){
			    $(row_string).css('display', 'block');
			}
			$(row_string).attr('stream-id', data[row].split(',')[0]);
			$(row_string).attr('access', data[row].split(',')[2]);
			$(row_string).on('click', '.join-stream', function() {
			    joinStream($(this).parent().parent().attr('stream-id'), $(this).parent().parent().attr('currentsong'), $(this).parent().parent().attr('access'));
			});
		    }
		    $('#main-friends-streams').css('display', 'block');
		    $('.scroll-info').autoTextTape();
		}
	    });
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
		var trackList = '<ul class="search-results playlist-songs" id="pl-' + String(i) + '-tracks' + '"></ul>'
		playlists += "<li class=\"playlist-title playlist\" id=\"pl-" + String(i) + "\" data-playlistid=\"" +
		    playlist["id"] + '"><div class="playlist-name collapsed" data-playlistid="' + data["items"][i]["id"] + 
		    '" onclick="playlistToggle(this, \'pl-' + String(i) + '\')">' + 
		    playlist["name"] + "</div>" + trackList + "</li>";
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
    //var userID = await getUserID();
    var userID = getCookie('uid-cookie');

    $.ajax({
        url: 'https://api.spotify.com/v1/users/' + userID + '/playlists/' + playlistID + '/tracks',
        type: "GET",
        headers: headers,
        success: function(data) {
            showPlaylistTracks(data, index, playlistID)
        },
        error: function (xhr, ajaxOptions, thrownError){
            console.log(xhr.status);
        }});
}

/*
async function getUserID(){
    var response = await $.ajax({
        url: 'https://api.spotify.com/v1/me',
        type: "GET",
        headers: headers
    });
    return response["id"];
}
*/
function showPlaylistTracks(data, index, playlistID){
    var images = "<img src=\"/media/play.png\" class=\"search-icons search-play\">"
        + "<img src=\"/media/plus.png\" class=\"search-icons plus\">"
    
    var tracks = ""
    for (var i in data["items"]) {
        var track = data["items"][i]["track"]
        var songID = track["id"]
        var songName = track["name"]
        var songArtist = track["artists"][0]["name"];
        tracks += '<li data-playlistid="' + playlistID + '" class="search-item" data-songid="' + songID + '">' +
            images + songName + " - " + songArtist + "</li>";
    }
    
    var elementID = String(index) + '-tracks'
    $('#' + elementID).html(tracks);
    $('#' + elementID).slideDown();
}

function pause(){
    $("#pause-button").addClass('hidden');
    $("#play-button").removeClass('hidden');
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
        if(songs[i]){
            var songname = songs[i]["name"]
            var songartist = songs[i]["artists"][0]["name"]
            var songid = songs[i]["id"]
            songdisplay += '<div class="row queue-item" id="queue-' + String(i) +
		'"><div class="col-xs-8" style="padding-top:5px"><div class="queue-info">' + songname +
		'</div><div class="queue-info">' + songartist + '</div></div>';
	    if(getCookie('access') == 'collaborative'){
		songdisplay += '<div class="col-xs-4 text-right"><div style="text-align:center">' +
		    '<img class="upvote-icon" data-queuesongid="' +
                    songid + '" src="/media/upvote.png"><div class="votes">' +
		    '</div><img class="downvote-icon" src="/media/downvote.png"></div></div>';
	    }
	    songdisplay += '</div>';
	}}
    $('#queue').html("")
    $('#queue').append(songdisplay)
    $('.queue-info').autoTextTape();
}



$('#username').click(function(){
    renderProfile(getCookie('uid-cookie'));
});


$("#play-button").click(function() {
    play();
});

$("#pause-button").click(function() {
    pause();
});


$("#stream-tab-playlist").click(function() {
    getCurrentUserPlaylists();
});

$("#track-list, #playlist-list").on('click', '.plus', function() {
    var songID = $(this).parent().data('songid');
    addToQueue(songID);
});

$("#track-list, #playlist-list").on('click', '.search-play', function() {
    var songID = $(this).parent().data('songid');
    if($('#play-button').hasClass('hidden')){
	pause();
    }
    play(songID);
});

$("#queue").on('click', '.upvote-icon', function() {
    var queuesongid = $(this).data('queuesongid')
    var userID = getCookie('uid-cookie')
    var streamID = getCookie('streamID')
    upvoteSong([streamID, userID, queuesongid])
})


$("#queue").on('click', '.downvote-icon', function() {
    var queuesongid = $(this).data('queuesongid')
    var userID = getCookie('uid-cookie')
    var streamID = getCookie('streamID')
    downvoteSong([streamID, userID, queuesongid])
})


/*
$("#playlist-list").on('click', '.playlist', function() {
    if ($(this).children().is(':visible')){
        $(this).children().slideUp();
    }
    else{
	$('.playlist').children().slideUp();
        var playlistID = $(this).data('playlistid');
        var index = $(this).attr('id');
        getPlaylistTracks(playlistID, index);
    }
});
*/
$("#search-form").submit(function(e){
    e.preventDefault();
    searchTracks(document.getElementById('query').value);
});

$('#volumeSlider').mouseup(function(){
    changeVolume($(this).val());
});





async function showQueue(){
    var queueIDs = await getQueue()
    getTracksFromIDs(queueIDs)
}


async function getQueue(){
    var response = await $.ajax({
	url: 'https://34.224.122.69:8888/getqueue',
	type: "GET",
	data: {
	    streamID: getCookie('streamID')
	},
	dataType: 'jsonp'
    });
    return response;
}


function addToQueue(songID){
    $.ajax({
	url: 'https://34.224.122.69:8888/addToQueue',
	type: "GET",
	headers: headers,
	data: {
	    id: songID,
	    streamID: getCookie('streamID')
	},
	dataType: 'jsonp',
	success: function(data) {
            showQueue();
	},
	error: function (xhr, ajaxOptions, thrownError){
       console.log(xhr.status);
	}});
}

function upvoteSong(params){
    $.ajax({
	url: 'https://34.224.122.69:8888/upvoteSong',
	type: "GET",
	headers: headers,
	data: {
	    streamID: params[0],
	    userID: params[1],
	    queuesongID: params[2]
     },
	dataType: 'jsonp',
	success: function(data) {
	    showQueue();
	},
	error: function (xhr, ajaxOptions, thrownError){
	    console.log(xhr.status);
	}});
}

function downvoteSong(params){
    $.ajax({
	url: 'https://34.224.122.69:8888/downvoteSong',
	type: "GET",
	headers: headers,
	data: {
	    streamID: params[0],
	    userID: params[1],
	    queuesongID: params[2]
	},
	dataType: 'jsonp',
	success: function(data) {
	    showQueue();
	},
	error: function (xhr, ajaxOptions, thrownError){
	    console.log(xhr.status);
	}});
}

/*
 function getFollowersCount(params){
   $.ajax({
     url: 'https://34.224.122.69:8888/getFollowersCount',
     type: "GET",
     headers: headers,
     data: {
       streamID: params[0],
       userID: params[1],
       queuesongID: params[2]
     },
     success: function(data) {
       console.log(data)
     },
     error: function (xhr, ajaxOptions, thrownError){
       console.log(xhr.status);
   }});
 }


 function getFolloweesCount(params){
   $.ajax({
     url: 'https://34.224.122.69:8888/getFolloweesCount',
     type: "GET",
     headers: headers,
     data: {
       streamID: params[0],
       userID: params[1],
       queuesongID: params[2]
     },
     success: function(data) {
       console.log(data)
     },
     error: function (xhr, ajaxOptions, thrownError){
       console.log(xhr.status);
   }});
 }
*/

function startStreamDB(params){
    $.ajax({
	url: 'https://34.224.122.69:8888/startStream',
	type: "GET",
	headers: headers,
	data: {
	    hostid: params[0],
	    description: params[1],
	    acc: params[2]
	},
	success: function(data) {
	    document.cookie = 'streamID=' + data[0];
	    document.cookie = 'mystream=true';
	},
	error: function (xhr, ajaxOptions, thrownError){
	    console.log(xhr.status);
	}});
}


function joinStream(streamID, currentSong, access){
    $.ajax({
	url: 'https://34.224.122.69:8888/joinStream',
	type: "GET",
	headers: headers,
	data: {
	  streamID: streamID,
	  userID: getCookie('uid-cookie')
	},
	dataType: 'jsonp',
	success: function(data) {
	    document.cookie = 'streamID=' + streamID; 
	    document.cookie = 'mystream=false';
	    document.cookie = 'access=' + access;
	    showQueue()
	    play(currentSong)
	},
	error: function (xhr, ajaxOptions, thrownError){
	    console.log(xhr.status);
    }});
}


 function leaveStream(params){
   $.ajax({
     url: 'https://34.224.122.69:8888/leaveStream',
     type: "GET",
     headers: headers,
     data: {
       streamID: params[0],
       userID: params[1],
       queuesongID: params[2]
     },
     dataType: 'jsonp',
     success: function(data) {
       console.log(data)
     },
     error: function (xhr, ajaxOptions, thrownError){
       console.log(xhr.status);
   }});
 }


 function getUserPrivacy(params){
   $.ajax({
     url: 'https://34.224.122.69:8888/getUserPrivacy',
     type: "GET",
     headers: headers,
     data: {
       streamID: params[0],
       userID: params[1],
       queuesongID: params[2]
     },
     dataType: 'jsonp',
     success: function(data) {
       console.log(data)
     },
     error: function (xhr, ajaxOptions, thrownError){
       console.log(xhr.status);
   }});
 }


