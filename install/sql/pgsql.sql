DROP TABLE IF EXISTS chglog;
DROP TABLE IF EXISTS compprop;
DROP TABLE IF EXISTS sysapps;
DROP TABLE IF EXISTS sysnotes;
DROP TABLE IF EXISTS updlog;
DROP TABLE IF EXISTS updnotes;
DROP TABLE IF EXISTS updpref;
DROP SEQUENCE IF EXISTS app_id_seq;
DROP SEQUENCE IF EXISTS chg_id_seq;

CREATE SEQUENCE app_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;

  CREATE SEQUENCE chg_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;

  
 CREATE TABLE chglog
(
  chgid integer NOT NULL DEFAULT nextval('chg_id_seq'::regclass),
  "sysid" character varying,
  chgdt timestamp without time zone NOT NULL DEFAULT now(),
  usr character varying NOT NULL,
  act character varying NOT NULL,
  ctg character varying NOT NULL DEFAULT 'Unknown'::character varying,
  CONSTRAINT chglog_pkey PRIMARY KEY (chgid)
)
WITH (
  OIDS=FALSE
);


CREATE TABLE compprop
(
  "sysid" character varying NOT NULL,
  prop character varying NOT NULL,
  val character varying NOT NULL,
  CONSTRAINT compprop_pkey PRIMARY KEY (sysid, prop)
)
WITH (
  OIDS=FALSE
);


CREATE TABLE sysapps
(
  appid integer NOT NULL DEFAULT nextval('app_id_seq'::regclass),
  "sysid" character varying NOT NULL,
  ctg character varying NOT NULL DEFAULT 'General'::character varying,
  app character varying NOT NULL,
  crtdt date DEFAULT ('now'::text)::date,
  CONSTRAINT sysapps_pkey PRIMARY KEY (appid)
)
WITH (
  OIDS=FALSE
);


CREATE TABLE sysnotes
(
  "sysid" character varying NOT NULL,
  note character varying NOT NULL,
  CONSTRAINT pk_note PRIMARY KEY (sysid)
)
WITH (
  OIDS=FALSE
);


CREATE TABLE updlog
(
  "sysid" character varying NOT NULL,
  dt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pk_updatelog PRIMARY KEY (sysid)
)
WITH (
  OIDS=FALSE
);


CREATE TABLE updnotes
(
  uid character varying NOT NULL,
  msg character varying NOT NULL,
  CONSTRAINT pk_upd_note PRIMARY KEY (uid)
)
WITH (
  OIDS=FALSE
);


CREATE TABLE updpref
(
  uid character varying NOT NULL,
  "sysid" character varying NOT NULL,
  ord integer NOT NULL DEFAULT 99999,
  CONSTRAINT pk_updpref PRIMARY KEY (uid, sysid)
)
WITH (
  OIDS=FALSE
);