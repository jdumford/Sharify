function pageChanger(page_index){
	switch(page_index){
		//Home Page
		case 1:
			$('#stream-page').css('display', 'none');
			$('profile-page').css('display', 'none');
			$('#home-page').css('display', 'block');
			break;
		//Manage Streams Page
		case 2:
			$('#home-page').css('display', 'none');
			$('profile-page').css('display', 'none');
			$('#stream-page').css('display', 'block');
			break;
		//User Profile Page
		case 3:
			$('#home-page').css('display', 'none');
			$('#stream-page').css('display', 'none');
			$('profile-page').css('display', 'block');
			break;
	}
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