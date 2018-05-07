DROP TABLE listeners CASCADE CONSTRAINTS;

CREATE TABLE listeners
	(	streamID			INT,
		spotifyID			VARCHAR2(30),
		uPermission			VARCHAR2(15),
		listening			VARCHAR2(1),
		PRIMARY KEY (streamID, spotifyID),
		FOREIGN KEY (spotifyID) REFERENCES users(spotifyID),
		FOREIGN KEY (streamID) REFERENCES streams(streamID)
	);

exit;
