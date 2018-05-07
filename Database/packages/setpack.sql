CREATE OR REPLACE PACKAGE setpack
IS
	PROCEDURE addUser(sid users.spotifyid%TYPE);
	PROCEDURE setPrivate(sid users.spotifyid%TYPE);
	PROCEDURE setPublic(sid users.spotifyid%TYPE);

	PROCEDURE followUser(sid users.spotifyid%TYPE, fid users.spotifyid%TYPE);
	PROCEDURE unfollowUser(sid users.spotifyid%TYPE, fid users.spotifyid%TYPE);
	PROCEDURE acceptFollow(sid users.spotifyid%TYPE, fid users.spotifyid%TYPE);
	PROCEDURE declineFollow(sid users.spotifyid%TYPE, fid users.spotifyid%TYPE);

	FUNCTION startStream(uid streams.hostid%TYPE, dsc streams.description%TYPE, acc streams.uaccess%TYPE)
		RETURN binary_integer;
	PROCEDURE endStream(sid streams.streamid%TYPE);

	PROCEDURE addtoQueue(stid queue.streamid%TYPE, sid queue.songid%TYPE);
	PROCEDURE addtoHistory(stid history.streamid%TYPE, sid history.songid%TYPE);

	PROCEDURE removefromQueue(stid queue.streamid%TYPE, sid queue.songid%TYPE, sin queue.sindex%TYPE);

	FUNCTION addVote(stid queue.streamid%TYPE, sid queue.songid%TYPE, uid users.spotifyid%TYPE, vote binary_integer)
		RETURN binary_integer;

	PROCEDURE upvoteSong(stid queue.streamid%TYPE, uid votes.voterid%TYPE, sid queue.songid%TYPE);
	PROCEDURE downvoteSong(stid queue.streamid%TYPE, uid votes.voterid%TYPE, sid queue.songid%TYPE);

	PROCEDURE playedSong(stid streams.streamid%TYPE, sid queue.songid%TYPE);

	PROCEDURE joinStream(stid listeners.streamid%TYPE, uid listeners.spotifyid%TYPE);

	PROCEDURE leaveStream(stid listeners.streamid%TYPE, uid listeners.spotifyid%TYPE);


END setpack;
/
