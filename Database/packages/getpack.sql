CREATE OR REPLACE PACKAGE getpack
IS
	FUNCTION getUserPrivacy(uid users.spotifyid%TYPE)
		RETURN users.privacy%TYPE;

	FUNCTION getStreamHostID(sid streams.streamid%TYPE)
		RETURN streams.hostid%TYPE;
	FUNCTION getStreamDescription(sid streams.streamid%TYPE)
		RETURN streams.description%TYPE;
	FUNCTION getStreamUAccess(sid streams.streamid%TYPE)
		RETURN streams.uaccess%TYPE;
	FUNCTION getStreamLiveCount(sid streams.streamid%TYPE)
		RETURN streams.livecount%TYPE;

	FUNCTION getFollowersCount(id follows.followeeID%TYPE)
		RETURN binary_integer;
	PROCEDURE getAllFollowers(id follows.followeeID%TYPE);

	FUNCTION getFolloweesCount(id follows.followerID%TYPE)
		RETURN binary_integer;
	PROCEDURE getAllFollowees(id follows.followerID%TYPE);

	PROCEDURE getLiveStreams;

	PROCEDURE getFollowedStreams(uid users.spotifyid%TYPE);

	PROCEDURE getGlobalStreams(uid users.spotifyid%TYPE);

	PROCEDURE getQueue(sid streams.streamid%TYPE);

	PROCEDURE getHistory(sid streams.streamid%TYPE);

	PROCEDURE getPlaylistSongs(pid playlists.playlistid%TYPE);

	FUNCTION getNextinQueue(sid streams.streamid%TYPE)
		RETURN binary_integer;

	FUNCTION getNextinHistory(sid streams.streamid%TYPE)
		RETURN binary_integer;

	FUNCTION getNextSong(sid queue.streamid%TYPE)
		RETURN queue.songid%TYPE;

	FUNCTION getNextSongIndex(sid queue.streamid%TYPE)
		RETURN queue.sindex%TYPE;

	FUNCTION getSongVotes(stid queue.streamid%TYPE, sid queue.songid%TYPE)
                RETURN queue.votes%TYPE;

END getpack;
/
