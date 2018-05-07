DROP TABLE streams CASCADE CONSTRAINTS;

CREATE TABLE streams
	(	streamID			INT,
		hostID				VARCHAR2(30),
		description			VARCHAR2(70),
		sStart				TIMESTAMP,
		sEnd				TIMESTAMP,
		uAccess				VARCHAR2(14),
		liveCount			INT,
		downloadCount			INT,
		PRIMARY KEY (streamID),
		FOREIGN KEY (hostID) REFERENCES users(spotifyID)
	);

CREATE OR REPLACE TRIGGER newstream
BEFORE INSERT ON streams
FOR EACH ROW

BEGIN
  SELECT stream_seq.NEXTVAL
  INTO   :new.streamID
  FROM   dual;
END;
/

exit;
