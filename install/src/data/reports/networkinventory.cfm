<cfsilent>
	<!--- Create the report content --->
	<cfparam name="url.includes" default=""/>
	<cfparam name="url.properties" default=""/>
	<cfscript>
		el = "cn,distinguishedName,description,dNSHostName,location,operatingSystem,operatingSystemServicePack,operatingSystemVersion,lastLogon,logonCount,operatingSystemHotfix";
		computers = application.ldap.query("(&(objectClass=computer))",el,"subtree","CN=Computers,"&application.ldap._cfg.basedn);
		dc= application.ldap.query("(&(objectClass=computer))",el,"subtree","OU=Domain Controllers,"&application.ldap._cfg.basedn);
	</cfscript>
	<cfif listcontains(url.includes,"applications")>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT	*
			FROM	sysapps
		</cfquery>
	</cfif>
	<cfif listcontains(url.includes,"notes")>
		<cfquery name="qryNotes" datasource="#application.dsn.chglog#">
			SELECT	*
			FROM	sysnotes
		</cfquery>
	</cfif>
	<cfset property = StructNew()/>
	<cfif listlen(url.properties)>
		<cfquery name="qryProps" datasource="#application.dsn.chglog#">
			SELECT		sysid,prop,val
			FROM		compprop
			GROUP BY 	sysid,prop,val
			ORDER BY	sysid
		</cfquery>
		<cfoutput query="qryProps" group="sysid">
			<cfset tmp = StructNew()/>
			<cfoutput><cfset StructInsert(tmp,prop,val)/></cfoutput>
			<cfset StructInsert(property,sysid,tmp)/>
		</cfoutput>
	</cfif>
	<cfquery name="qryPropList" datasource="#application.dsn.chglog#">
		SELECT		DISTINCT prop
		FROM		compprop
		<cfif listlen(url.properties)>WHERE		prop in (#ListQualify(url.properties,"'")#)</cfif>
		ORDER BY 	prop
	</cfquery>
	<cfsavecontent variable="systems">
		<link type="text/css" rel="stylesheet" href="../../style/report.css"/>
		<table cellspacing="1" class="adminview">
			<tr>
				<th align="left">Name</th>
				<cfif listcontains(url.includes,"location")><th>Location</th></cfif>
				<th width="125">OS</th>
				<cfif listcontains(url.includes,"applications")><th>Applications</th></cfif>
				<cfif listcontains(url.includes,"notes")><th>Notes</th></cfif>
				<cfif listlen(url.properties)>
				<cfoutput query="qryPropList">
				<th>#prop#</th>
				</cfoutput>
				</cfif>
			</tr>
			<cfoutput query="dc">
				<cfif listcontains(url.includes,"applications")>
					<cfquery name="q" dbtype="query">
						SELECT	*
						FROM	qry
						WHERE	sysid='#distinguishedName#'
					</cfquery>
					<cfset appl=""/>
					<cfloop query="q"><cfset appl=listappend(appl,q.app)/></cfloop>
				</cfif>
				<cfif listcontains(url.includes,"notes")>
					<cfquery name="q" dbtype="query">
						SELECT	*
						FROM	qryNotes
						WHERE	sysid='#distinguishedName#'
					</cfquery>
				</cfif>
				<cfscript>
					notes = "";
					if (listcontains(url.includes,"notes")) {
						if(q.recordcount)
							notes = trim(q.note[1]);
					}
				</cfscript>
				<tr>
					<td class="dc"><b>#ucase(cn)#</b><div class="smalllight">#description#</div></td>
					<cfif listcontains(url.includes,"location")><td class="dc">#location#</td></cfif>
					<td class="dc">#operatingsystem#<cfif len(trim(operatingsystemservicepack))> #operatingsystemservicepack#</cfif></td>
					<cfif listcontains(url.includes,"applications")><td class="dc">#replace(replace(appl,' ','&nbsp;','ALL'),',',', ','ALL')#</td></cfif>
					<cfif listcontains(url.includes,"notes")><td class="dc">#notes#</td></cfif>
					<cfif listlen(url.properties)>
					<cfloop query="qryPropList">
					<td class="dc"><cfif StructKeyExists(property,dc.distinguishedName)><cfif StructKeyExists(property[dc.distinguishedName],qryPropList.prop)>#property[dc.distinguishedName][qryPropList.prop]#</cfif></cfif></td>
					</cfloop>
					</cfif>
				</tr>
			</cfoutput>
			<cfoutput query="computers">
				<cfif listcontains(url.includes,"applications")>
					<cfquery name="q" dbtype="query">
						SELECT	*
						FROM	qry
						WHERE	sysid='#distinguishedName#'
					</cfquery>
					<cfset appl=""/>
					<cfloop query="q"><cfset appl=listappend(appl,q.app)/></cfloop>
				</cfif>
				<cfif listcontains(url.includes,"notes")>
					<cfquery name="q" dbtype="query">
						SELECT	*
						FROM	qryNotes
						WHERE	sysid='#distinguishedName#'
					</cfquery>
				</cfif>
				<cfscript>
					notes = "";
					if (listcontains(url.includes,"notes")) {
						if(q.recordcount)
							notes = trim(q.note[1]);
					}
				</cfscript>
				<tr>
					<td><b>#ucase(cn)#</b><div class="smalllight">#description#</div></td>
					<cfif listcontains(url.includes,"location")><td>#location#</td></cfif>
					<td>#operatingsystem#</td>
					<cfif listcontains(url.includes,"applications")><td>#replace(replace(appl,' ','&nbsp;','ALL'),',',', ','ALL')#</td></cfif>
					<cfif listcontains(url.includes,"notes")><td>#notes#</td></cfif>
					<cfif listlen(url.properties)>
					<cfloop query="qryPropList">
					<td><cfif StructKeyExists(property,computers.distinguishedName)><cfif StructKeyExists(property[computers.distinguishedName],qryPropList.prop)>#property[computers.distinguishedName][qryPropList.prop]#</cfif></cfif></td>
					</cfloop>
					</cfif>
				</tr>
			</cfoutput>
		</table>
	</cfsavecontent>
	<cfset request.out = systems>

	<!--- Use the built in generator & its parameters --->
	<cfscript>
		//STANDARD PARAMETERS
		request.overwrite=true;
		request.orientation="landscape";
		request.marginleft=".25";
		request.marginright=".25";
		request.marginbottom=".25";
		request.margintop=".25";

		//The standard report UI may send a URL variable
		//with the filename and save option.
		if (StructKeyExists(url,"save") and not StructKeyExists(request,"save")) {
			request.save = url.save;

			//Account for text instead of boolean
			if (request.save is "true")
				request.save = true;
			else if (save is "false")
				request.save = false;
		}
		if (StructKeyExists(url,"file") and not StructKeyExists(request,"file"))
			request.filename = url.file;
		if (StructKeyExists(url,"format") and not StructKeyExists(request,"format"))
			request.format = url.format;
	</cfscript>
</cfsilent>