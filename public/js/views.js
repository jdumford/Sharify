function pageChanger(page_index){
    switch(page_index){
	//Home Page
    case 1:
	$('#stream-page').css('display', 'none');
	$('#profile-page').css('display', 'none');
	$('#home-page').css('display', 'block');
	break;
	//Manage Streams Page
    case 2:
	$('#home-page').css('display', 'none');
	$('#profile-page').css('display', 'none');
	$('#stream-page').css('display', 'block');
	getCurrentUserPlaylists();	
	break;
	//User Profile Page
    case 3:
	$('#home-page').css('display', 'none');
	$('#stream-page').css('display', 'none');
	$('#profile-page').css('display', 'block');
	break;
    }
}

function renderProfile(userID){
    pageChanger(3);
    var endpoint = "https://api.spotify.com/v1/users/" + userID;
    $.ajax({
	url: endpoint,
	type: "GET",
	headers: {
	    'Accept': 'application/json',
	    'Content-Type':'application/json',
	    'Authorization': 'Bearer ' + getCookie('webplayer-token')
	}, 
	success: function(user){
	    console.log(user);
	    if(user.images.length > 0){
		$('#prof-pic').attr('src', user.images[0].url);
	    }else{
		$('#prof-pic').attr('src', '/media/user-anon.png');
	    }
	    $('#prof-username').html(user.display_name);
	},
	error: function (xhr, ajaxOptions, thrownError){
            console.log(xhr.status);
	}});
}

function streamManageTab(tab_index){
    $('#stream-tab-search').toggleClass('active');
    $('#stream-tab-playlist').toggleClass('active');
    switch(tab_index){
    case 1:
	$('#stream-search').css('display', 'none');
	$('#stream-playlist').css('display', 'block');
	break;
    case 2:
	$('#stream-playlist').css('display', 'none');
	$('#stream-search').css('display', 'block');
	break;
    }
}

$( document ).ready(function() {
    var queueHeight = $(window).height() - 160;
    var mainHeight = $(window).height() - 70;
    $('#queue').css('height', queueHeight);
    $('#main-panel').css('height', mainHeight);
});
