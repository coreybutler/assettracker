<cfcomponent>

	<cffunction name="init" access="private" hint="Initialize application parameters">
		<cflock scope="APPLICATION" type="EXCLUSIVE" timeout="10">
			<cfscript>
				this.name 				= 'assettracker';
				this.sessionmanagement	= true;
				this.sessiontimeout 	= createtimespan(0,12,0,0);
				this.applicationtimeout = createtimespan(30,0,0,0);
				this.loginstore 		= "session";
				this.scriptprotect		= "all";
				this.setClientCookies	= true;
       			this.setDomainCookies	= false;
			</cfscript>
		</cflock>
	</cffunction>

	<cffunction name="OnApplicationStart" access="public" hint="Configures the application." output="false" returntype="void">
		<cfscript>
			application.cfg = expandpath('./config/main.ini');
			application.ldap = createObject("component","data.ldap");
			application.ldap.init(application.cfg);
			application.dsn.chglog = getprofilestring(application.cfg,"dsn","chglog");
			application.reportroot = getprofilestring(application.cfg,"storage","reports");
			application.reportrootabsolute = expandpath(application.reportroot);
			if (application.reportroot is application.reportrootabsolute)
				application.reportroot = replace(application.reportroot,expandpath('./'),'');
		</cfscript>
	</cffunction>

	<cffunction name="onRequestStart">
		<cfargument name="requestname" required=true/>
		<cfapplication sessionmanagement="true">
		<cfscript>
			if (structkeyexists(url,"restart")) {
				OnApplicationStart();
				onSessionStart();
			} else if (not StructKeyExists(session,"start"))
				onSessionStart();
		</cfscript>
	</cffunction>

	<cffunction name="onSessionStart">
		<cfscript>
			session.start = now();
		</cfscript>
	</cffunction>
</cfcomponent>