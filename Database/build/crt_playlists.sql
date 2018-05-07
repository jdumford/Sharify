DROP TABLE playlists CASCADE CONSTRAINTS;

CREATE TABLE playlists
	(	playlistID			VARCHAR2(30),
		sIndex				INT,
		songID				VARCHAR2(25),
		PRIMARY KEY (playlistID, sIndex)
	);

exit;
