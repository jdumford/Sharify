DROP TABLE users CASCADE CONSTRAINTS;

CREATE TABLE users
	(	spotifyID		VARCHAR2(30),
		privacy			INT,
		PRIMARY KEY (spotifyID)
	);

exit;
