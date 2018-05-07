DROP TABLE queue CASCADE CONSTRAINTS;

CREATE TABLE queue
	(	streamID			INT,
		sIndex				INT,
		songID				VARCHAR2(25),
		votes				INT,
		PRIMARY KEY (streamID, sIndex),
		FOREIGN KEY (streamID) REFERENCES streams(streamID)
	);

exit;
