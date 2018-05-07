CREATE OR REPLACE PACKAGE BODY setpack
IS
	PROCEDURE addUser(sid users.spotifyid%TYPE)
	IS
	BEGIN
		INSERT INTO users(spotifyid, privacy)
		VALUES (sid, 0);
		COMMIT;
	END;
	PROCEDURE setPrivate(sid users.spotifyid%TYPE)
	IS
	BEGIN
		UPDATE users
		SET privacy = 1
		WHERE spotifyid = sid;
	END;
	PROCEDURE setPublic(sid users.spotifyid%TYPE)
	IS
	BEGIN
		UPDATE users
		SET privacy = 0
		WHERE spotifyid = sid;
	END;

	PROCEDURE followUser(sid users.spotifyid%TYPE, fid users.spotifyid%TYPE)
	IS
		privacy users.privacy%TYPE;
	BEGIN
		privacy := getpack.getUserPrivacy(fid);
		IF privacy = 0 THEN
			INSERT INTO follows(followerid, followeeid, status)
			VALUES (sid, fid, 1);
		ELSE
			INSERT INTO follows(followerid, followeeid, status)
			VALUES (sid, fid, 0);
		END IF;
		COMMIT;
	END;
	PROCEDURE unfollowUser(sid users.spotifyid%TYPE, fid users.spotifyid%TYPE)
	IS
	BEGIN
		DELETE FROM follows
		WHERE followerid = sid AND followeeid = fid;
	END;
	PROCEDURE acceptFollow(sid users.spotifyid%TYPE, fid users.spotifyid%TYPE)
	IS
	BEGIN
		UPDATE follows
		SET status = 1
		WHERE followerid = fid AND followeeid = sid;
	END;
	PROCEDURE declineFollow(sid users.spotifyid%TYPE, fid users.spotifyid%TYPE)
	IS
	BEGIN
		DELETE FROM follows
		WHERE followerid = fid AND followeeid = sid;
	END;

	FUNCTION startStream(uid streams.hostid%TYPE, dsc streams.description%TYPE, acc streams.uaccess%TYPE)
		RETURN binary_integer
	IS
		stid binary_integer;
		ver streams.streamid%TYPE;
	BEGIN
		SELECT streamid INTO ver
		FROM streams
		WHERE hostid = uid AND send IS null;
		IF ver is not null THEN
			setpack.endstream(ver);
			INSERT INTO streams(hostid, description, sstart, uaccess, livecount, downloadcount)
			VALUES (uid, dsc, CURRENT_TIMESTAMP, acc, 0, 0);
			COMMIT;
			SELECT streamid INTO stid
			FROM streams
			WHERE hostID = uid AND description = dsc AND uaccess = acc;
			DBMS_OUTPUT.PUT_LINE(stid);
			RETURN stid;
		END IF;
		EXCEPTION
			WHEN no_data_found THEN
				INSERT INTO streams(hostid, description, sstart, uaccess, livecount, downloadcount)
				VALUES (uid, dsc, CURRENT_TIMESTAMP, acc, 0, 0);
				COMMIT;
				SELECT streamid INTO stid
				FROM streams
				WHERE hostID = uid AND description = dsc AND uaccess = acc;
				DBMS_OUTPUT.PUT_LINE(stid);
				RETURN stid;


	END;
	PROCEDURE endStream(sid streams.streamid%TYPE)
	IS
	BEGIN
		UPDATE streams
		SET send = CURRENT_TIMESTAMP
		WHERE streamid = sid;
	END;

	PROCEDURE addtoQueue(stid queue.streamid%TYPE, sid queue.songid%TYPE)
	IS
		sin queue.sindex%TYPE;
	BEGIN
		sin := getpack.getNextinQueue(stid);
		INSERT INTO queue(streamid, sindex, songid, votes)
		VALUES (stid, sin, sid, 0);
		COMMIT;
	END;
	PROCEDURE addtoHistory(stid history.streamid%TYPE, sid history.songid%TYPE)
	IS
		sin history.sindex%TYPE;
	BEGIN
		sin := getpack.getNextinHistory(stid);
		INSERT INTO history(streamid, sindex, songid)
		VALUES (stid, sin, sid);
		COMMIT;
	END;

	PROCEDURE removefromQueue(stid queue.streamid%TYPE, sid queue.songid%TYPE, sin queue.sindex%TYPE)
	IS
	BEGIN
		DELETE FROM queue
		WHERE streamid = stid AND songid = sid and sindex = sin;

	END;

	FUNCTION addVote(stid queue.streamid%TYPE, sid queue.songid%TYPE, uid users.spotifyid%TYPE, vote binary_integer)
		RETURN binary_integer
	IS
		curvote  votes.vote%TYPE;
		perm streams.uaccess%TYPE;
	BEGIN
		perm := getpack.getStreamUaccess(stid);
		SELECT vote INTO curvote
		FROM votes
		WHERE streamid = stid AND songid = sid AND voterid = uid;
		IF curvote IS null AND perm = 'collaborative' THEN
			DBMS_OUTPUT.PUT_LINE(1);
			RETURN 1;
		ELSE
			IF curvote != vote AND perm = 'collaborative' THEN
				DBMS_OUTPUT.PUT_LINE(2);
				RETURN 2;
			ELSE
				DBMS_OUTPUT.PUT_LINE(0);
				RETURN 0;
			END IF;
		END IF;
		EXCEPTION
			WHEN no_data_found THEN
				IF perm = 'collaborative' THEN
					DBMS_OUTPUT.PUT_LINE(1);
					RETURN 1;
				END IF;
				DBMS_OUTPUT.PUT_LINE(0);
				RETURN 0;
	END;

	PROCEDURE upvoteSong(stid queue.streamid%TYPE, uid votes.voterid%TYPE, sid queue.songid%TYPE)
	IS
		result binary_integer;
	BEGIN
		result := setpack.addVote(stid, sid, uid, 1);
		IF result != 0 THEN
			IF result = 1 THEN
				INSERT INTO votes(voterid, streamid, songid, vote)
				VALUES (uid, stid, sid, 1);
			ELSE
				UPDATE votes
				SET vote = 1
				WHERE voterid = uid AND streamid = stid AND songid = sid;
			END IF;
			UPDATE queue
			SET votes = votes + 1
			WHERE streamid = stid AND songid = sid;
			COMMIT;
		END IF;
	END;

	PROCEDURE downvoteSong(stid queue.streamid%TYPE, uid votes.voterid%TYPE, sid queue.songid%TYPE)
	IS
		result binary_integer;
	BEGIN
		result := setpack.addVote(stid, sid, uid, -1);
		IF result != 0 THEN
			IF result = 1 THEN
				INSERT INTO votes(voterid, streamid, songid, vote)
				VALUES (uid, stid, sid, -1);
			ELSE
				UPDATE votes
				SET vote = -1
				WHERE voterid = uid AND streamid = stid AND songid = sid;
			END IF;
			UPDATE queue
			SET votes = votes - 1
			WHERE streamid = stid AND songid = sid;
			COMMIT;
		END IF;
	END;

	PROCEDURE playedSong(stid streams.streamid%TYPE, sid queue.songid%TYPE)
	IS
		nextSong queue.songid%TYPE;
		nextSongIndex queue.sindex%TYPE;
	BEGIN
		nextSong := getPack.getNextSong(stid);
		nextSongIndex := getPack.getNextSongIndex(stid);
		IF nextSong = sid THEN
			setPack.addtoHistory(stid, sid);
			setPack.removefromQueue(stid, sid, nextSongIndex);
			COMMIT;
		ELSE
			setPack.addtoHistory(stid, sid);
			COMMIT;
		END IF;
	END;

	PROCEDURE joinStream(stid listeners.streamid%TYPE, uid listeners.spotifyid%TYPE)
	IS
		perm listeners.upermission%TYPE;
		checks listeners.listening%TYPE;
	BEGIN
		perm := getpack.getstreamuaccess(stid);
		SELECT listening INTO checks
		FROM listeners
		WHERE streamid = stid AND spotifyid = uid;
		IF checks != 1 THEN
			UPDATE listeners
			SET listening = 0
			WHERE streamid = stid AND spotifyid = uid;
			UPDATE streams
			SET livecount = livecount + 1
			WHERE streamid = stid;
			COMMIT;
		END IF;
		EXCEPTION
			WHEN no_data_found THEN
				INSERT INTO Listeners (streamid, spotifyid, upermission, listening)
				VALUES (stid, uid, perm, 1);
				COMMIT;
				UPDATE streams
				SET livecount = livecount + 1
				WHERE streamid = stid;
				COMMIT;
	END;

	PROCEDURE leaveStream(stid listeners.streamid%TYPE, uid listeners.spotifyid%TYPE)
	IS
		checks listeners.listening%TYPE;
	BEGIN
		SELECT listening INTO checks
		FROM listeners
		WHERE streamid = stid AND spotifyid = uid;
		UPDATE listeners
		SET listening = 0
		WHERE streamid = stid AND spotifyid = uid;
		COMMIT;
		IF checks = 1 THEN
			UPDATE streams
			SET livecount = livecount - 1
			WHERE streamid = stid;
		END IF;
		COMMIT;
	END;

END setpack;
/
