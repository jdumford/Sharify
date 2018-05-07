DROP TABLE follows CASCADE CONSTRAINTS;

CREATE TABLE follows
	(	followerID			VARCHAR2(30),
		followeeID			VARCHAR2(30),
		status				INT,
		PRIMARY KEY (followerID, followeeID),
		FOREIGN KEY (followerID) REFERENCES users(spotifyID),
		FOREIGN KEY (followeeID) REFERENCES users(spotifyID)
	);

exit;
