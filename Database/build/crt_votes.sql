DROP TABLE votes CASCADE CONSTRAINTS;

CREATE TABLE votes
	(	voterID				VARCHAR2(30),
		streamID			INT,
		songID				VARCHAR2(25),
		vote				INT,
		PRIMARY KEY (voterID, streamID, songID),
		FOREIGN KEY (voterID) REFERENCES users(spotifyID)
	);

exit;
