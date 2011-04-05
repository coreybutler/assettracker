DROP TABLE IF EXISTS bkp;
CREATE TABLE bkp (
  startdt timestamp NOT NULL default CURRENT_TIMESTAMP,
  enddt datetime,
  id int(10) unsigned NOT NULL auto_increment,
  recur decimal(10,0) NOT NULL default 1,
  recurtype varchar(45) NOT NULL default "?",
  sysid varchar(200) NOT NULL,
  dur decimal(10,0) NOT NULL default 8,
  durtype varchar(10) NOT NULL,
  note varchar(2000) NOT NULL,
  tm time,
  PRIMARY KEY  (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



DROP TABLE IF EXISTS chglog;
CREATE TABLE chglog (
  chgid int(11) NOT NULL auto_increment,
  sysid varchar(200) default NULL,
  chgdt timestamp NOT NULL default CURRENT_TIMESTAMP,
  usr varchar(30) NOT NULL,
  act varchar(2000) NOT NULL,
  ctg varchar(100) NOT NULL default "General",
  PRIMARY KEY  (chgid),
  UNIQUE KEY chgid (chgid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;




DROP TABLE IF EXISTS compprop;
CREATE TABLE compprop (
  sysid varchar(200) NOT NULL,
  prop varchar(50) NOT NULL,
  val varchar(100) NOT NULL,
  PRIMARY KEY  (sysid,prop)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



DROP TABLE IF EXISTS sysapps;
CREATE TABLE sysapps (
  appid int(10) unsigned NOT NULL auto_increment,
  sysid varchar(200) NOT NULL,
  ctg varchar(75) NOT NULL,
  app varchar(75) NOT NULL,
  crtdt timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (appid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;



DROP TABLE IF EXISTS sysnotes;
CREATE TABLE sysnotes (
  sysid varchar(200) NOT NULL,
  note varchar(2000) NOT NULL,
  PRIMARY KEY  (sysid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



DROP TABLE IF EXISTS updlog;
CREATE TABLE updlog (
  sysid varchar(200) NOT NULL,
  dt timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (sysid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



DROP TABLE IF EXISTS updnotes;
CREATE TABLE updnotes (
  uid varchar(30) NOT NULL,
  msg varchar(5000) NOT NULL,
  PRIMARY KEY  (uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



DROP TABLE IF EXISTS updpref;
CREATE TABLE updpref (
  uid varchar(30) NOT NULL,
  sysid varchar(200) NOT NULL,
  ord int(10) unsigned NOT NULL default 999999,
  PRIMARY KEY  (uid,sysid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
