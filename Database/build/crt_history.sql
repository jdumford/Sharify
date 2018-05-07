DROP TABLE history CASCADE CONSTRAINTS;

CREATE TABLE history
	(	streamID			INT,
		sIndex				INT,
		songID				VARCHAR(25),
		PRIMARY KEY (streamID, sIndex),
		FOREIGN KEY (streamID) REFERENCES streams(streamID)
	);

exit;
