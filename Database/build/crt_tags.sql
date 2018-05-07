DROP TABLE tags CASCADE CONSTRAINTS;

CREATE TABLE tags
	(	streamID			INT,
		tag				VARCHAR(15),
		FOREIGN KEY (streamID) REFERENCES streams(streamID)
	);

exit;
