<!--- Debugging must be off or ExtJS can't read output --->
<cfsetting requesttimeout="120" showdebugoutput="false" enablecfoutputonly="true">

<!--- Force an OK header --->
<cfheader statuscode="200"/>

<!--- ExtJS requires a JSON content type--->
<cfcontent type="application/json; charset=utf-8" reset="true">

<!--- Processing Functions --->
<cfsilent>
	<!--- STOCK FUNCTIONALITY --->
	<cffunction name="getComputers" access="private" returntype="query" hint="Retrieve a list of computers from Active Directory">
		<cfscript>
			var qry = "";
			var computers = application.ldap.query("(&(objectClass=computer))","cn,distinguishedName,description,dNSHostName,location,operatingSystem,operatingSystemServicePack,operatingSystemVersion,lastLogon,logonCount,operatingSystemHotfix","subtree","CN=Computers,"&application.ldap._cfg.basedn);
			var c2 = application.ldap.query("(&(objectClass=computer))","cn,distinguishedName,description,dNSHostName,location,operatingSystem,operatingSystemServicePack,operatingSystemVersion,lastLogon,logonCount,operatingSystemHotfix","subtree","OU=Domain Controllers,"&application.ldap._cfg.basedn);
		</cfscript>
		<cfquery name="qry" dbtype="query">
			SELECT 		*, 'false' as dc
			FROM		computers
			UNION
			SELECT		*, 'true' as dc
			FROM		c2
		</cfquery>
		<cfquery name="qry" dbtype="query">
			SELECT		*
			FROM		qry
			ORDER BY	cn, operatingSystem
		</cfquery>
		<cfreturn qry/>
	</cffunction>

	<cffunction name="getChangeCategories" access="private" returntype="string" hint="Retrieve a list of change categories.">
		<cfscript>
			var qry = "";
			var rtn = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT 		distinct ctg
			FROM		chglog
		</cfquery>
		<cfoutput query="qry"><cfset rtn = listappend(rtn,ctg)/></cfoutput>
		<cfreturn rtn/>
	</cffunction>

	<cffunction name="getRecentChanges" access="private" returntype="query" hint="Gets all of the scheduled backups. Returns changes within the last 10 days.">
		<cfscript>
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT		chgid,chgdt,usr,act,ctg,sysid
			FROM		chglog
			WHERE		chgdt >= '#dateformat(dateadd("d",-10,now()),"yyyy-mm-dd")#'
			ORDER BY	chgdt DESC,ctg
		</cfquery>
		<cfreturn qry/>
	</cffunction>

	<cffunction name="getComputer" access="private" returntype="Struct" hint="Returns an object with th changelog and extra computer properties.">
		<cfargument name="dn" type="string" required="true"/>
		<cfscript>
			var qry = "";
			var tmp = StructNew();
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT		chgid,chgdt,usr,act,ctg
			FROM		chglog
			WHERE		sysid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.dn#"/>
			ORDER BY	chgdt DESC,ctg
		</cfquery>
		<cfset tmp.changes = qry/>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT		*
			FROM		compprop
			WHERE		sysid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.dn#"/>
			ORDER BY	prop
		</cfquery>
		<cfscript>
			tmp.properties = qry;
			tmp.propertyList = getPropertyList();
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT		app,ctg,appid
			FROM		sysapps
			WHERE		sysid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.dn#"/>
			ORDER BY	app,ctg,crtdt
		</cfquery>
		<cfset tmp.applications = qry/>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT		distinct ctg
			FROM		sysapps
			ORDER BY	ctg
		</cfquery>
		<cfset tmp.categories = qry/>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT		note
			FROM		sysnotes
			WHERE		sysid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.dn#"/>
			LIMIT 		1
		</cfquery>
		<cfscript>
			if (qry.recordcount)
				tmp.notes = trim(qry.note[1]);
			else
				tmp.notes = '';
			return tmp;
		</cfscript>
	</cffunction>

	<cffunction name="getEnvironmentStatus" access="private" returntype="array" hint="Returns a list of new and orphaned systems.">
		<cfargument name="query" hint="An LDAP query resultset. This can be used in conjunction with getComputers()."/>
		<cfscript>
			var rec = "";
			var log = "";
			var list = "";
			var	days = 15;//A system is recognized as "new" if it was created within this many days of the current date
			var dt = dateformat(dateadd('d',0-days,now()),"yyyymmdd")&"000000.0Z";
			var nqry = application.ldap.query("(&(objectClass=computer)(whenCreated>=#dt#))","distinguishedName","subtree","CN=Computers,"&application.ldap._cfg.basedn);
			var out = ArrayNew(1);
			var tmp = StructNew();
			var i = 0;
			var tbl = "chglog,compprop,sysapps,sysnotes,updlog,updpref,bkp";

			//Get the recognized computers
			if (StructKeyExists(arguments,"query"))
				rec = arguments.query;
			else
				rec = getComputers();

			//Add a filter list for query
			for (i=1;i lte rec.recordcount;i++)
				list = listappend(list,"'"&trim(rec.distinguishedName[i])&"'");

			//Identify the new systems
			for (i=1;i lte nqry.recordcount;i++) {
				tmp = StructNew();
				tmp.sysid = trim(nqry.distinguishedName[i]);
				tmp.type = "New";
				arrayappend(out,tmp);
			}
		</cfscript>
		<!--- Get the distinct computers from the logs --->
		<cfquery name="log" datasource="#application.dsn.chglog#">
			SELECT distinct trim(sysid) as sysid
			FROM (
				<cfloop list="#tbl#" index="i">
					SELECT	sysid
					FROM	chglog
					<cfif i is not listlast(tbl)>UNION</cfif>
				</cfloop>
			) as tmp
			WHERE	lower(sysid) not in (#replace(lcase(list),"''","'","ALL")#)
			ORDER BY sysid
		</cfquery>
		<cfscript>
			for (i=1;i lte log.recordcount;i++) {
				tmp = StructNew();
				tmp.sysid = log.sysid[i];
				tmp.type = "Orphan";
				arrayappend(out,tmp);
			}
			return out;
		</cfscript>
	</cffunction>

	<cffunction name="removeOrphan" access="private" returntype="void" hint="Removes records for an orphan system.">
		<cfargument name="dn" type="string" hint="Distinguishedname of the system to remove."/>
		<cfscript>
			var qry = "";
			var list = "chglog,compprop,sysapps,sysnotes,updlog,updpref,bkp";
			var i = "";
		</cfscript>
		<!--- Remove from any table with a record for the orphan computer --->
		<cfloop list="#list#" index="i">
			<cfquery name="qry" datasource="#application.dsn.chglog#">
				DELETE FROM #i#
				WHERE sysid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.dn#"/>
			</cfquery>
		</cfloop>
	</cffunction>

	<cffunction name="getPropertyList" access="private" returntype="query" hint="Returns an object with th changelog and extra computer properties.">
		<cfscript>
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT		distinct prop
			FROM		compprop
			ORDER BY	prop
		</cfquery>
		<cfreturn qry/>
	</cffunction>

	<cffunction name="updateChangeLog" access="private" returntype="void" hint="Updates a specific change in the log.">
		<cfargument name="form" type="Struct" required="true"/>
		<cfscript>
			var f = arguments.form;
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			UPDATE		chglog
			SET			chgdt = <cfqueryparam cfsqltype="cf_sql_date" value="#f.dt#"/>,
						usr = <cfqueryparam cfsqltype="cf_sql_varchar" value="#f.usr#"/>,
						act = <cfqueryparam cfsqltype="cf_sql_varchar" value="#f.act#"/>,
						ctg = <cfqueryparam cfsqltype="cf_sql_varchar" value="#f.ctg#"/>
			WHERE		chgid = <cfqueryparam cfsqltype="cf_sql_integer" value="#f.id#"/>
		</cfquery>
	</cffunction>

	<cffunction name="addChange" access="private" returntype="numeric" hint="Add a change to the log.">
		<cfargument name="form" type="Struct" required="true"/>
		<cfscript>
			var f = arguments.form;
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			INSERT INTO	chglog (sysid,chgdt,usr,act,ctg)
			VALUES (<cfqueryparam cfsqltype="cf_sql_varchar" value="#f.id#"/>,
					<cfqueryparam cfsqltype="cf_sql_date" value="#f.dt#"/>,
					<cfqueryparam cfsqltype="cf_sql_varchar" value="#f.usr#"/>,
					<cfqueryparam cfsqltype="cf_sql_varchar" value="#f.act#"/>,
					<cfqueryparam cfsqltype="cf_sql_varchar" value="#f.ctg#"/>)
		</cfquery>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT	MAX(chgid) as id
			FROM	chglog
			WHERE	sysid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#f.id#"/>
		</cfquery>
		<cfreturn qry.id[1]/>
	</cffunction>

	<cffunction name="removeChange" access="private" returntype="void" hint="Remove a change from the log.">
		<cfargument name="id" type="numeric" required="true"/>
		<cfset var qry = ""/>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			DELETE FROM	chglog
			WHERE chgid = <cfqueryparam cfsqltype="cf_sql_numeric" value="#arguments.id#">
		</cfquery>
	</cffunction>

	<cffunction name="setProperty" access="private" returntype="void" hint="Sets a property for the specified computer.">
		<cfargument name="id" type="string" required="true"/>
		<cfargument name="prop" type="string" required="true"/>
		<cfargument name="value" type="string" required="true"/>
		<cfscript>
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			INSERT INTO	compprop (sysid,prop,val)
			VALUES (<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.id#"/>,
					<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.prop#"/>,
					<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.value#"/>)
		</cfquery>
		<cfreturn/>
	</cffunction>

	<cffunction name="setPropertyForAll" access="private" returntype="void" hint="Sets a property with a default value for all.">
		<cfargument name="prop" type="string" required="true"/>
		<cfargument name="value" type="string" required="true"/>
		<cfscript>
			var qry = getComputers();
			var qry2 = "";
		</cfscript>
		<cfquery name="qry" dbtype="query">
			SELECT	distinct distinguishedName
			FROM	qry
		</cfquery>
		<cfoutput query="qry">
			<cfquery name="qry2" datasource="#application.dsn.chglog#">
				INSERT INTO	compprop (sysid,prop,val)
				VALUES (<cfqueryparam cfsqltype="cf_sql_varchar" value="#qry.distinguishedName#"/>,
						<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.prop#"/>,
						<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.value#"/>)
			</cfquery>
		</cfoutput>
		<cfreturn/>
	</cffunction>

	<cffunction name="clearProperties" access="private" returntype="void" hint="Removes all properties for a specific computer.">
		<cfargument name="id" type="string" required="true"/>
		<cfscript>
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			DELETE FROM	compprop
			WHERE sysid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.id#"/>
		</cfquery>
		<cfreturn/>
	</cffunction>

	<cffunction name="removeProperty" access="private" returntype="void" hint="Removes a property for a specific computer.">
		<cfargument name="id" type="string" required="true"/>
		<cfargument name="prop" type="string" required="true"/>
		<cfscript>
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			DELETE 	FROM	compprop
			WHERE 			prop = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.prop#"/>
							<cfif trim(arguments.id) is not "*">AND sysid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.id#"/></cfif>
		</cfquery>
		<cfreturn/>
	</cffunction>

	<cffunction name="addApplication" access="private" returntype="numeric" hint="Registers an application to the specified computer.">
		<cfargument name="dn" type="string" required="true"/>
		<cfargument name="prop" type="string" required="true"/>
		<cfargument name="value" type="string" required="true"/>
		<cfscript>
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			INSERT INTO	sysapps (sysid,app,ctg)
			VALUES (<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.dn#"/>,
					<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.prop#"/>,
					<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.value#"/>)
		</cfquery>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT 	Max(appid) as id
			FROM	sysapps
			WHERE 	sysid=<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.dn#"/>
		</cfquery>
		<cfreturn qry.id[1]/>
	</cffunction>

	<cffunction name="removeApplication" access="private" returntype="void" hint="Removes an application from the specified computer.">
		<cfargument name="id" type="numeric" required="true"/>
		<cfscript>
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			DELETE FROM	sysapps
			WHERE  appid=<cfqueryparam cfsqltype="cf_sql_numeric" value="#arguments.id#"/>
		</cfquery>
		<cfreturn/>
	</cffunction>

	<cffunction name="editNote" access="private" returntype="void" hint="Modifies a note.">
		<cfargument name="id" type="string" required="true"/>
		<cfargument name="msg" type="string" required="true"/>
		<cfscript>
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			DELETE FROM	sysnotes
			WHERE  sysid=<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.id#"/>
		</cfquery>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			INSERT INTO	sysnotes (sysid,note)
			VALUES (<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.id#"/>,
					<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.msg#"/>)
		</cfquery>
		<cfreturn/>
	</cffunction>

	<cffunction name="getReports" access="private" returntype="query" hint="Returns up to 25 of the most recent reports.">
		<cfscript>
			var dir="";
			var max=-1;
		</cfscript>
		<cfdirectory action="list" directory="#application.reportrootabsolute#" sort="DATELASTMODIFIED" recurse="false" name="dir"/>
		<cfif dir.recordcount gt max and max gt 0>
			<cfoutput query="dir" startrow="#(max+1)#">
				<cffile action="delete" file="#dir.directory#/#dir.name#"/>
			</cfoutput>
		</cfif>
		<cfreturn dir/>
	</cffunction>

	<cffunction name="removeReport" access="private" returntype="void" hint="Removes a specific report.">
		<cfargument name="id" type="string" required="true"/>
		<cfif lcase(arguments.id) is "all">
			<cfdirectory action="delete" recurse="true" directory="#application.reportrootabsolute#"/>
			<cfdirectory action="create" directory="#application.reportrootabsolute#"/>
		<cfelse>
			<cffile action="delete" file="#application.reportrootabsolute#/#arguments.id#"/>
		</cfif>
	</cffunction>

	<!--- Custom authentication/authorization is handled here. Default is to use LDAP/AD integration --->
	<cffunction name="isAuthentic" access="private" returntype="Boolean" hint="Identifies whether the user is authentic or not.">
		<cfscript>
			return application.ldap.bind(f.usr,f.pwd);
		</cfscript>
	</cffunction>

	<!--- ADD-ON FUNCTIONALITY --->
	<!--- UpdateTracker --->
	<cffunction name="getUpdateLog" access="private" returntype="Struct" hint="Returns a struct with all information regarding manual system updates.">
		<cfscript>
			var qry = "";
			var tmp = StructNew();

			tmp.systems = getComputers();
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT	*,(dt <= #DateAdd('d',-30,now())#) as expired
			FROM	updlog
		</cfquery>
		<cfset tmp.log = qry/>
		<cfreturn tmp/>
	</cffunction>

	<cffunction name="updateLog" access="private" returntype="void" hint="Updates the log for a specified computer.">
		<cfargument name="id" type="string" required="true"/>
		<!--- <cfthread name="updLog#createuuid()#" action="run"> --->
			<cfquery name="qry" datasource="#application.dsn.chglog#">
				DELETE FROM	updlog
				<cfif arguments.id is not "all">
				WHERE	sysid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.id#"/>
				</cfif>
			</cfquery>
			<cfif arguments.id is not "all">
				<cfquery name="qry" datasource="#application.dsn.chglog#">
					INSERT INTO	updlog (sysid)
					VALUES (<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.id#"/>)
				</cfquery>
			<cfelse>
				<cfset q = getComputers()/>
				<cfoutput query="q">
					<cfquery name="qry" datasource="#application.dsn.chglog#">
						INSERT INTO	updlog (sysid)
						VALUES ('#trim(q.distinguishedName)#')
					</cfquery>
				</cfoutput>
			</cfif>
		<!--- </cfthread> --->
	</cffunction>

	<cffunction name="updateShortcuts" access="private" returntype="void" hint="Updates the shortcut preferences for a user.">
		<cfargument name="id" type="string" required="true"/>
		<cfargument name="order" type="array" required="true"/>
		<cfscript>
			var qry = "";
			var i = 0;
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			DELETE FROM	updpref
			WHERE	uid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.id#"/>
		</cfquery>
		<cfloop array="#arguments.order#" index="sys">
			<cfquery name="qry" datasource="#application.dsn.chglog#">
				INSERT INTO updpref (uid,sysid,ord)
				VALUES (<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.id#"/>,
						<cfqueryparam cfsqltype="cf_sql_varchar" value="#sys.dn#"/>,
						<cfqueryparam cfsqltype="cf_sql_numeric" value="#sys.order#"/>)
			</cfquery>
		</cfloop>
	</cffunction>

	<cffunction name="getShortcuts" access="private" returntype="query" hint="Gets shortcuts for a user.">
		<cfargument name="id" type="string" hint="Username" required="true"/>
		<cfscript>
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT	sysid,ord
			FROM	updpref
			WHERE	uid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.id#"/>
			ORDER BY ord ASC
		</cfquery>
		<cfreturn qry/>
	</cffunction>

	<cffunction name="updateNote" access="private" returntype="void" hint="Modifies a user's notes for OS updates.">
		<cfargument name="id" type="string" hint="Username" required="true"/>
		<cfargument name="note" type="string" hint="Note" required="true"/>
		<cfscript>
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			DELETE FROM	updnotes
			WHERE	uid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.id#"/>
		</cfquery>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			INSERT INTO updnotes (uid,msg)
			VALUES (<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.id#"/>,
					<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.note#"/>)
		</cfquery>
	</cffunction>

	<cffunction name="getUpdateNotes" access="private" returntype="string" hint="Gets notes for a user.">
		<cfargument name="id" type="string" hint="Username" required="true"/>
		<cfscript>
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT	msg
			FROM	updnotes
			WHERE	uid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.id#"/>
		</cfquery>
		<cfscript>
			if (qry.recordcount)
				return qry.msg[1];
			return "";
		</cfscript>
	</cffunction>

	<!--- Backup Schedule Documentor --->
	<cffunction name="getBackups" access="private" returntype="query" hint="Gets all of the scheduled backups.">
		<cfscript>
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT		sysid,recurtype,recur,durtype,dur,startdt,enddt,note,id
			FROM		bkp
			GROUP BY	sysid,recurtype,recur,durtype,dur,startdt,enddt,note,id
			ORDER BY	sysid,recurtype,recur,durtype,dur,startdt
		</cfquery>
		<cfreturn qry/>
	</cffunction>

	<cffunction name="removeBackup" access="private" returntype="void" hint="Removes a backup.">
		<cfargument name="id" type="numeric" hint="Username" required="true"/>
		<cfscript>
			var qry = "";
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			DELETE
			FROM	bkp
			WHERE	id = <cfqueryparam cfsqltype="cf_sql_numeric" value="#arguments.id#"/>
		</cfquery>
	</cffunction>

	<cffunction name="addBackup" access="private" returntype="numeric" hint="Add a backup to the schedule.">
		<cfargument name="form" type="Struct" required="true"/>
		<cfscript>
			var f = arguments.form;
			var qry = "";
			var startdt = trim(f.startdt&' '&f.starttm);
			var enddt = trim(f.enddt&' '&f.endtm);

			if (len(trim(f.dow)))
				f.recurtype=f.dow;
		</cfscript>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			INSERT INTO	bkp (sysid,note,tm,
							durtype,dur,recurtype
							<cfif not len(trim(f.dow))>,recur</cfif>,
							startdt
							<cfif len(trim(f.enddt))>,enddt</cfif>)
			VALUES (<cfqueryparam cfsqltype="cf_sql_varchar" value="#f.sysid#"/>,
					<cfqueryparam cfsqltype="cf_sql_varchar" value="#f.note#"/>,
					<cfqueryparam cfsqltype="cf_sql_time" value="#f.starttm#"/>,
					<cfqueryparam cfsqltype="cf_sql_varchar" value="#f.durtype#"/>,
					<cfqueryparam cfsqltype="cf_sql_numeric" value="#f.dur#"/>,
					<cfqueryparam cfsqltype="cf_sql_varchar" value="#f.recurtype#"/>,
					<cfif not len(trim(f.dow))><cfqueryparam cfsqltype="cf_sql_numeric" value="#f.recur#"/>,</cfif>
					<cfqueryparam cfsqltype="cf_sql_timestamp" value="#createodbcdatetime(startdt)#"/>
					<cfif len(trim(f.enddt))>,<cfqueryparam cfsqltype="cf_sql_timestamp" value="#createodbcdatetime(enddt)#"/></cfif>)
		</cfquery>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT	MAX(id) as id
			FROM	bkp
			WHERE	sysid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#f.sysid#"/>
		</cfquery>
		<cfreturn qry.id[1]/>
	</cffunction>
</cfsilent>

<cfscript>
	//Prepare some stock JSON output
	void = "({""success"":true})";
	error = "({""success"":false})";

	//Set the default output string.
	out=void;

	//Process AJAX requests received from the front-end
	if (StructKeyExists(form,"get")) {
		switch (lcase(form.get)) {
			case "init":
				comps = getComputers();
				out = "({""success"":true,""computers"":"&SerializeJSON(comps)&",""recentchanges"":"&SerializeJSON(getRecentChanges())&",""environment"":"&SerializeJSON(getEnvironmentStatus(comps))&"})";
				break;
			case "categories":
				out = "({""success"":true,""categories"":["&Listqualify(getChangeCategories(),"'")&"]})";
				break;
			case "computer":
				out = "({""success"":true,computer:"&SerializeJSON(getComputer(form.id))&",""categories"":["&Listqualify(getChangeCategories(),"'")&"]})";
				break;
			case "user":
				out = "({""success"":true,""uid"":"""&trim(listlast(getAuthUser(),'\'))&"""})";
				break;
			case "reports":
				rt = JSStringFormat(application.reportroot); //Hide the system path
				out = "({""success"":true,reports:"&replace(SerializeJSON(getReports()),rt,'','ALL')&"})";
				break;
			case "properties":
				qry = getPropertyList();
				l = "";
				for(i=1;i lte qry.recordcount;i++)
					l = listappend(l,trim(qry.prop[i]));
				out = "({""success"":true,properties:["&listqualify(l,"'")&"]})";
				break;

			//ADD-ON MODULES
			//Update Tracker
			case "updatelog":
				out = "({""success"":true,""log"":"&SerializeJSON(getUpdateLog())&",""shortcuts"":"&SerializeJSON(getShortcuts(form.user))&",""notes"":"&SerializeJSON(getUpdateNotes(form.user))&"})";
				break;

			//Backup Schedule Documentor
			case "backup":
				out = "({""success"":true,""bkp"":"&SerializeJSON(getBackups())&"})";
				break;
		}
	} else if (StructKeyExists(form,"post")) {
		switch (lcase(form.post)) {
			case "login":
				f = DeserializeJSON(form.data);
				if (not isAuthentic(f.usr,f.pwd))
					out = error;
				break;
			case "editchange":
				updateChangeLog(DeserializeJSON(form.data));
				break;
			case "newchange":
				id = addChange(DeserializeJSON(form.data));
				out = "({""success"":true,""id"":#id#})";
				break;
			case "removechange":
				removeChange(form.id);
				break;
			case "newproperty":
				f = DeserializeJSON(form.data);
				if (f.check)
					setPropertyForAll(f.prop,f.val);
				else
					setProperty(f.id,f.prop,f.val);
				break;
			case "removeproperty":
				removeProperty('*',form.prop);
				break;
			case "editproperties":
				f = DeserializeJSON(form.data);
				prop = StructKeyArray(f);
				clearProperties(form.id);
				for (i=1;i lte arraylen(prop);i++)
					setProperty(form.id,prop[i],f[prop[i]]);
				break;
			case "editproperty":
				removeProperty(form.id,form.prop);
				setProperty(form.id,form.prop,form.value);
				break;
			case "newapplication":
				f = DeserializeJSON(form.data);
				aid = addApplication(f.id,f.nm,f.ctg);
				if (f.chglog) {
					c.id=f.id;
					c.dt=now();
					c.usr=listlast(getAuthUser(),'\');
					c.act="Installed "&f.nm&" ("&f.ctg&")";
					c.ctg="Installation";
					cid = addChange(c);
					out = "({""success"":true,""id"":#aid#,""chgid"":#cid#})";
				} else
					out = "({""success"":true,""id"":#aid#})";
				break;
			case "removeapplication":
				if (StructKeyExists(form,"change")) {
					f = DeserializeJSON(form.change);
					c.id=form.sysid;
					c.dt=now();
					c.usr=listlast(getAuthUser(),'\');
					c.act="Uninstalled "&f.app&" ("&f.ctg&")";
					c.ctg="Uninstallation";
					cid = addChange(c);
					out = "({""success"":true,""id"":#cid#})";
				}
				removeApplication(form.id);
				break;
			case "note":
				editNote(form.id,DeserializeJSON(form.note));
				break;
			case "removereport":
				removeReport(form.id);
				break;
			case "removereportall":
				removeReport('all');
				break;
			case "removeorphan":
				removeOrphan(form.id);
				break;

			//ADD-ON MODULES
			//Update Tracker
			case "updatelog":
				updateLog(form.id);
				break;
			case "updatelogall":
				updateLog('all');
				break;
			case "updatenote":
				updateNote(form.user,DeserializeJSON(form.note));
				break;
			case "shortcuts":
				updateShortcuts(form.user,DeserializeJSON(form.data));
				break;

			//Backup Scheduler
			case "removebackup":
				removeBackup(form.id);
				break;
			case "createbackup":
				f = DeserializeJSON(form.data);
				id = addBackup(f);
				out = "({""success"":true,""id"":#id#})";
				break;
			case "updatebackup":
				f = DeserializeJSON(form.data);
				removeBackup(f.id);
				id = addBackup(f);
				out = "({""success"":true,""id"":#id#})";
				break;
		}
	}
</cfscript>
<cfoutput>#trim(out)#</cfoutput>
<cfabort>