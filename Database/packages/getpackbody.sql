CREATE OR REPLACE PACKAGE BODY getpack
IS
	FUNCTION getUserPrivacy(uid users.spotifyid%TYPE)
		RETURN users.privacy%TYPE
	IS
		priv users.privacy%TYPE;
	BEGIN
		SELECT privacy
		INTO priv
		FROM users
		WHERE spotifyid = uid;
		DBMS_OUTPUT.PUT_LINE(priv);
		RETURN priv;
		EXCEPTION
			WHEN no_data_found THEN
			dbms_output.put_line('getUserPrivacy error: ' || uid || 'not found');
			RETURN null;
	END;

	FUNCTION getStreamHostID(sid streams.streamid%TYPE)
		RETURN streams.hostid%TYPE
	IS
		hid streams.hostid%TYPE;
	BEGIN
		SELECT hostid
		INTO hid
		FROM streams
		WHERE streamid = sid;
		DBMS_OUTPUT.PUT_LINE(hid);
		RETURN hid;
		EXCEPTION
			WHEN no_data_found THEN
			dbms_output.put_line('getStreamHostID error: ' || sid || 'not found');
			RETURN null;
	END;
	FUNCTION getStreamDescription(sid streams.streamid%TYPE)
		RETURN streams.description%TYPE
	IS
		descr streams.description%TYPE;
	BEGIN
		SELECT description
		INTO descr
		FROM streams
		WHERE streamid = sid;
		DBMS_OUTPUT.PUT_LINE(descr);
		RETURN descr;

		EXCEPTION
			WHEN no_data_found THEN
			dbms_output.put_line('getStreamDescription error: ' || sid || 'not found');
			RETURN null;
	END;
	FUNCTION getStreamUAccess(sid streams.streamid%TYPE)
		RETURN streams.uaccess%TYPE
	IS
		ua streams.uaccess%TYPE;
	BEGIN
		SELECT uaccess
		INTO ua
		FROM streams
		WHERE streamid = sid;
		DBMS_OUTPUT.PUT_LINE(ua);
		RETURN ua;
		EXCEPTION
			WHEN no_data_found THEN
			dbms_output.put_line('getStreamUAccess error: ' || sid || 'not found');
			RETURN null;
	END;
	FUNCTION getStreamLiveCount(sid streams.streamid%TYPE)
		RETURN streams.livecount%TYPE
	IS
		lc streams.livecount%TYPE;
	BEGIN
		SELECT livecount
		INTO lc
		FROM streams
		WHERE streamid = sid;
		DBMS_OUTPUT.PUT_LINE(lc);
		RETURN lc;
		EXCEPTION
			WHEN no_data_found THEN
			dbms_output.put_line('getStreamLiveCount error: ' || sid || 'not found');
			RETURN null;
	END;

	FUNCTION getFollowersCount(id follows.followeeID%type)
		RETURN binary_integer
	IS
		cnt binary_integer;
	BEGIN
		SELECT COUNT(followerid)
		INTO cnt
		FROM follows
		WHERE followeeid = id AND status = 1;
		DBMS_OUTPUT.PUT_LINE(cnt);
		RETURN cnt;
		EXCEPTION
			WHEN no_data_found THEN
			dbms_output.put_line('getFollwerCount error: ' || id || 'not found');
			RETURN null;
	END;
	PROCEDURE getAllFollowers(id follows.followeeID%type)
	IS
		cursor followers (id follows.followeeID%type)
		IS
			SELECT followerid
			FROM follows
			WHERE followeeid = id AND status = 1;
		counter binary_integer := 0;
		fid follows.followerID%type;

		nothing EXCEPTION;
	BEGIN
		OPEN followers(id);
		LOOP
		FETCH followers INTO fid;
		EXIT WHEN followers%notfound;
		dbms_output.put_line(fid);
		counter := counter + 1;
		END LOOP;
		CLOSE followers;
		IF counter = 0 THEN
			RAISE nothing;
		END IF;

		EXCEPTION
			WHEN nothing THEN
				dbms_output.put_line('	No followers found for ' || id);
			WHEN no_data_found THEN
				dbms_output.put_line('	' || id || ' not found');
	END;

	FUNCTION getFolloweesCount(id follows.followerID%type)
		RETURN binary_integer
	IS
		cnt binary_integer;
	BEGIN
		SELECT COUNT(followeeid)
		INTO cnt
		FROM follows
		WHERE followerid = id AND status = 1;
		DBMS_OUTPUT.PUT_LINE(cnt);
		RETURN cnt;
		EXCEPTION
			WHEN no_data_found THEN
			dbms_output.put_line('getFollweeCount error: ' || id || 'not found');
			RETURN null;
	END;
	PROCEDURE getAllFollowees(id follows.followerID%type)
	IS
		cursor followees (id follows.followerID%type)
		IS
			SELECT followeeid
			FROM follows
			WHERE followerid = id AND status = 1;
		counter binary_integer := 0;
		fid follows.followeeID%type;

		nothing EXCEPTION;
	BEGIN
		OPEN followees(id);
		LOOP
		FETCH followees INTO fid;
		EXIT WHEN followees%notfound;
		dbms_output.put_line(fid);
		counter := counter + 1;
		END LOOP;
		CLOSE followees;
		IF counter = 0 THEN
			RAISE nothing;
		END IF;

		EXCEPTION
			WHEN nothing THEN
				dbms_output.put_line('	No followees found for ' || id);
			WHEN no_data_found THEN
				dbms_output.put_line('	' || id || ' not found');
	END;

	PROCEDURE getLiveStreams
	IS
		cursor livestreams
		IS
			SELECT streamid, hostid, uaccess, description
			FROM streams
			WHERE send IS null;
		sid streams.streamid%TYPE;
		hid streams.hostid%TYPE;
		ua streams.uaccess%TYPE;
		ds streams.description%TYPE;
		counter binary_integer := 0;

		nothing EXCEPTION;
	BEGIN
		OPEN livestreams;
		LOOP
		FETCH livestreams INTO sid, hid, ua, ds;
		EXIT WHEN livestreams%notfound;
		dbms_output.put_line(sid || ',' || hid || ',' || ua || ',' || ds);
		counter := counter + 1;
		END LOOP;
		CLOSE livestreams;
		IF counter = 0 THEN
			RAISE nothing;
		END IF;

		EXCEPTION
			WHEN nothing THEN
				dbms_output.put_line('	No streams found');
			WHEN no_data_found THEN
				dbms_output.put_line('	No streams found');
	END;

	PROCEDURE getFollowedStreams(uid users.spotifyid%TYPE)
	IS
		cursor livestreams(id users.spotifyid%type)
		IS
			SELECT streamid, hostid
			FROM streams, follows
			WHERE send IS null AND followeeid = hostid AND followerid = id AND uaccess != 'private';
		sid streams.streamid%TYPE;
		hid streams.hostid%TYPE;
		counter binary_integer := 0;

		nothing EXCEPTION;
	BEGIN
		OPEN livestreams(uid);
		LOOP
		FETCH livestreams INTO sid, hid;
		EXIT WHEN livestreams%notfound;
		dbms_output.put_line( sid || ',' || hid);
		counter := counter + 1;
		END LOOP;
		CLOSE livestreams;
		IF counter = 0 THEN
			RAISE nothing;
		END IF;

		EXCEPTION
			WHEN nothing THEN
				dbms_output.put_line('	No streams found');
			WHEN no_data_found THEN
				dbms_output.put_line('	No streams found');
	END;

        PROCEDURE getGlobalStreams(uid users.spotifyid%TYPE)
	IS
		cursor livestreams(id users.spotifyid%type)
		IS
			SELECT streamid, hostid
			FROM streams
			WHERE send IS null AND
			streamid NOT IN (
				SELECT streamid
				FROM streams, follows
				WHERE send IS null AND followeeid = hostid AND followerid = id AND uaccess != 'private'
			);
		sid streams.streamid%TYPE;
		hid streams.hostid%TYPE;
		counter binary_integer := 0;

		nothing EXCEPTION;
	BEGIN
		OPEN livestreams(uid);
		LOOP
		FETCH livestreams INTO sid, hid;
		EXIT WHEN livestreams%notfound;
		dbms_output.put_line(sid || ',' || hid);
		counter := counter + 1;
		END LOOP;
		CLOSE livestreams;
		IF counter = 0 THEN
			RAISE nothing;
		END IF;

		EXCEPTION
			WHEN nothing THEN
				dbms_output.put_line('	No streams found');
			WHEN no_data_found THEN
				dbms_output.put_line('	No streams found');
	END;

	PROCEDURE getQueue(sid streams.streamid%type)
	IS
		cursor songs(id queue.streamid%type)
		IS
			SELECT songid
			FROM queue
			WHERE streamid = id
			ORDER BY votes DESC, sindex ;
		songid queue.songid%type;

		counter binary_integer := 0;

		nothing EXCEPTION;
	BEGIN
		OPEN songs(sid);
		LOOP
		FETCH songs INTO songid;
		EXIT WHEN songs%notfound;
		dbms_output.put_line(songid);
		counter := counter + 1;
		END LOOP;
		CLOSE songs;
		IF counter = 0 THEN
			RAISE nothing;
		END IF;

		EXCEPTION
			WHEN nothing THEN
				dbms_output.put_line('	No songs found');
			WHEN no_data_found THEN
				dbms_output.put_line('	' || sid || ' not found');
	END;

	PROCEDURE getHistory(sid streams.streamid%type)
	IS
		cursor songs(id history.streamid%type)
		IS
			SELECT songid
			FROM history
			WHERE streamid = id;
		songid history.songid%type;

		counter binary_integer := 0;

		nothing EXCEPTION;
	BEGIN
		OPEN songs(sid);
		LOOP
		FETCH songs INTO songid;
		EXIT WHEN songs%notfound;
		dbms_output.put_line(songid);
		counter := counter + 1;
		END LOOP;
		CLOSE songs;
		IF counter = 0 THEN
			RAISE nothing;
		END IF;

		EXCEPTION
			WHEN nothing THEN
				dbms_output.put_line('	No songs found');
			WHEN no_data_found THEN
				dbms_output.put_line('	' || sid || ' not found');
	END;

	PROCEDURE getPlaylistSongs(pid playlists.playlistid%type)
	IS
		cursor songs(id playlists.playlistid%type)
		IS
			SELECT songid
			FROM playlists
			WHERE playlistid = id;
		songid playlists.songid%type;

		counter binary_integer := 0;

		nothing EXCEPTION;
	BEGIN
		OPEN songs(pid);
		LOOP
		FETCH songs INTO songid;
		EXIT WHEN songs%notfound;
		dbms_output.put_line(songid);
		counter := counter + 1;
		END LOOP;
		CLOSE songs;
		IF counter = 0 THEN
			RAISE nothing;
		END IF;

		EXCEPTION
			WHEN nothing THEN
				dbms_output.put_line('	No songs found');
			WHEN no_data_found THEN
				dbms_output.put_line('	' || pid || ' not found');
	END;

	FUNCTION getNextinQueue(sid streams.streamid%TYPE)
                RETURN binary_integer
	IS
		nextIndex binary_integer;
	BEGIN
		nextIndex := 1;
		SELECT coalesce(max(sindex)+1, 1) INTO nextIndex
		FROM queue
		WHERE streamid = sid;
		DBMS_OUTPUT.PUT_LINE(nextIndex);
		RETURN nextIndex;
	END;

	FUNCTION getNextinHIstory(sid streams.streamid%TYPE)
                RETURN binary_integer
	IS
		nextIndex binary_integer;
	BEGIN
		nextIndex := 1;
		SELECT coalesce(max(sindex)+1, 1) INTO nextIndex
		FROM history
		WHERE streamid = sid;
		RETURN nextIndex;
	END;

	FUNCTION getNextSong(sid queue.streamid%TYPE)
		RETURN queue.songid%TYPE
	IS
		nextSong queue.songid%TYPE;
	BEGIN
		SELECT songid INTO nextSong
		FROM ( SELECT songid
			FROM queue
			WHERE streamid = sid
			ORDER BY votes DESC, sindex)
		WHERE rownum = 1;
		DBMS_OUTPUT.PUT_LINE(nextSong);
		RETURN nextSong;
	END;

	FUNCTION getNextSongIndex(sid queue.streamid%TYPE)
		RETURN queue.sindex%TYPE
	IS
		nextSongIndex queue.sindex%TYPE;
	BEGIN
		SELECT sindex INTO nextSongIndex
		FROM ( SELECT sindex
			FROM queue
			WHERE streamid = sid
			ORDER BY votes DESC, sindex)
		WHERE rownum = 1;
		DBMS_OUTPUT.PUT_LINE(nextSongIndex);
		RETURN nextSongIndex;
	END;

	FUNCTION getSongVotes(stid queue.streamid%TYPE, sid queue.songid%TYPE)
		RETURN queue.votes%TYPE
	IS
		v queue.votes%TYPE;
	BEGIN
		SELECT votes
		INTO v
		FROM queue
		WHERE streamid = stid AND songid = sid;
		DBMS_OUTPUT.PUT_LINE(v);
		RETURN v;
		EXCEPTION
			WHEN no_data_found THEN
			dbms_output.put_line(0);
			RETURN 0;
	END;


END getpack;
/
