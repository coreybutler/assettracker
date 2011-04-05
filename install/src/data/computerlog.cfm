<!--- <cfsilent> --->
	<cfparam name="url.format" default="html">
	<cfswitch expression="#url.type#">
		<cfcase value="computer">
			<cfscript>
				el = "description,location,distinguishedName,operatingSystem,operatingSystemServicePack,operatingSystemVersion,servicePrincipalName,dNSHostName,logonCount";
				ldap = application.ldap.query("distinguishedName=#url.id#",el,"subtree",listdeleteat(url.id,1));
				computer = "";
				properties = "";
				applications = "";
				history = "";
			</cfscript>
			<cfquery name="qryNote" datasource="#application.dsn.chglog#">
				SELECT	note
				FROM	sysnotes
				WHERE	sysid = <cfqueryparam cfsqltype="cf_sql_varchar" value="#ldap.distinguishedName[1]#"/>
			</cfquery>
			<cfsavecontent variable="computer">
				<cfoutput query="ldap">
					<link type="text/css" rel="stylesheet" href="../style/report.css"/>
					<table width="100%" cellpadding="0" cellspacing="0" border="0">
						<tr>
							<td>
								<h1 style="font-style:none;">#dnshostname#</h1>
								<div style="padding-left:10px;" class="smalllight">
								#description#<br/>
								#operatingsystem#<br/>
								#location#
								</div>
							</td>
							<td style="padding-top:18px;">
								<cfif findnocase("windows",operatingsystem)>
									<img src="../style/icons/icon_win.png"/>
								<cfelseif findnocase("mac",operatingsystem)>
									<img src="../style/icons/icon_mac.png"/>
								<cfelseif findnocase("nix",operatingsystem)>
									<img src="../style/icons/icon_linux.png"/>
								<cfelseif findnocase("debian",operatingsystem)>
									<img src="../style/icons/icon_linux.png"/>
								<cfelseif findnocase("ubuntu",operatingsystem)>
									<img src="../style/icons/icon_linux.png"/>
								<cfelseif findnocase("cent",operatingsystem)>
									<img src="../style/icons/icon_linux.png"/>
								<cfelse>
									<img src="../style/icons/icon_server.png"/>
								</cfif>
							</td>
						</tr>
					</table>
					<cfif qryNote.recordcount>
						<cfif len(trim(qryNote.note[1]))>
							<div class="note">#trim(qryNote.note[1])#</div>
						</cfif>
					</cfif>
				</cfoutput>
			</cfsavecontent>
			<cfswitch expression="#url.report#">
				<cfcase value="properties">
					<cfquery name="qry" datasource="#application.dsn.chglog#">
						SELECT	*
						FROM	compprop
						WHERE	sysid=<cfqueryparam cfsqltype="cf_sql_varchar" value="#ldap.distinguishedName[1]#"/>
					</cfquery>
					<cfsavecontent variable="properties">
						<table width="100%" cellpadding="0" cellspacing="0" border="0" class="properties">
							<tr><th class="first title">Property</th><th class="title">Value</th></tr>
							<cfoutput query="ldap">
								<tr><th class="first">Distinguished Name</th><td>#trim(distinguishedName)#</td></tr>
								<tr><th class="first">Principle Name(s)</th><td>#replace(trim(servicePrincipalName),',','<br/>','ALL')#</td></tr>
								<tr><th class="first">Operating System</th><td>#trim(operatingSystem)# (#trim(operatingSystemVersion)#)<br/>#trim(operatingSystemServicePack)#</td></tr>
								<tr><th class="first">Logins</th><td>#trim(logonCount)#</td></tr>
							</cfoutput>
							<cfoutput query="qry">
								<tr><th class="first">#prop#</th><td>#trim(val)#</td></tr>
							</cfoutput>
						</table>
					</cfsavecontent>
					<cfquery name="qry" datasource="#application.dsn.chglog#">
						SELECT	ctg,app
						FROM	sysapps
						WHERE	sysid=<cfqueryparam cfsqltype="cf_sql_varchar" value="#ldap.distinguishedName[1]#"/>
						GROUP BY ctg,app
					</cfquery>
					<cfsavecontent variable="applications">
						<table width="100%" cellpadding="0" cellspacing="0" border="0" class="properties">
							<tr><th class="first title">Category</th><th class="title">Application</th></tr>
							<cfoutput query="qry" group="ctg">
								<tr>
									<th class="first" width="300">#ctg#</th>
									<td><cfoutput>#app#<br/></cfoutput></td>
								</tr>
							</cfoutput>
						</table>
					</cfsavecontent>
				</cfcase>
				<cfcase value="history">
					<cfquery name="qry" datasource="#application.dsn.chglog#">
						SELECT	chgdt,ctg,usr,act
						FROM	chglog
						WHERE	sysid=<cfqueryparam cfsqltype="cf_sql_varchar" value="#ldap.distinguishedName[1]#"/>
						GROUP BY chgdt,ctg,usr,act
					</cfquery>
					<cfsavecontent variable="history">
						<br/>
						<b>Change History</b>
						<table cellpadding="0" cellspacing="1" border="0" class="history">
							<cfoutput query="qry" group="chgdt">
								<tr>
									<td class="first">#DateFormat(chgdt,"Mmm dd, yyyy")#</td>
									<td class="noborder">
										<cfoutput group="ctg">
											<table>
												<tr>
													<th width="115">#ctg#:</th>
													<td>
														<cfoutput group="usr"><u>By #usr#</u><br/></cfoutput>
														<cfset ct = 0/>
														<cfoutput><cfset ct=ct+1/></cfoutput>
														<cfoutput><cfif len(trim(act))><li class="note<cfif ct eq 1> single</cfif>">#act#</li></cfif></cfoutput>
													</td>
												</tr>
											</table>
										</cfoutput>
									</td>
								</tr>
							</cfoutput>
						</table>
					</cfsavecontent>
				</cfcase>
				<cfdefaultcase>
					<cfquery name="qry" datasource="#application.dsn.chglog#">
						SELECT	*
						FROM	compprop
						WHERE	sysid=<cfqueryparam cfsqltype="cf_sql_varchar" value="#ldap.distinguishedName[1]#"/>
					</cfquery>
					<cfsavecontent variable="properties">
						<table width="100%" cellpadding="0" cellspacing="0" border="0" class="properties">
							<tr><th class="first title">Property</th><th class="title">Value</th></tr>
							<cfoutput query="ldap">
								<tr><th class="first">Distinguished Name</th><td>#trim(distinguishedName)#</td></tr>
								<tr><th class="first">Principle Name(s)</th><td>#replace(trim(servicePrincipalName),',','<br/>','ALL')#</td></tr>
								<tr><th class="first">Operating System</th><td>#trim(operatingSystem)# (#trim(operatingSystemVersion)#)<br/>#trim(operatingSystemServicePack)#</td></tr>
								<tr><th class="first">Logins</th><td>#trim(logonCount)#</td></tr>
							</cfoutput>
							<cfoutput query="qry">
								<tr><th class="first">#prop#</th><td>#trim(val)#</td></tr>
							</cfoutput>
						</table>
					</cfsavecontent>
					<cfquery name="qry" datasource="#application.dsn.chglog#">
						SELECT	ctg,app
						FROM	sysapps
						WHERE	sysid=<cfqueryparam cfsqltype="cf_sql_varchar" value="#ldap.distinguishedName[1]#"/>
						GROUP BY ctg,app
					</cfquery>
					<cfsavecontent variable="applications">
						<table width="100%" cellpadding="0" cellspacing="0" border="0" class="properties">
							<tr><th class="first title">Category</th><th class="title">Application</th></tr>
							<cfoutput query="qry" group="ctg">
								<tr>
									<th class="first">#ctg#</th>
									<td><cfoutput>#app#<br/></cfoutput></td>
								</tr>
							</cfoutput>
						</table>
					</cfsavecontent>
					<cfquery name="qry" datasource="#application.dsn.chglog#">
						SELECT	chgdt,ctg,usr,act
						FROM	chglog
						WHERE	sysid=<cfqueryparam cfsqltype="cf_sql_varchar" value="#ldap.distinguishedName[1]#"/>
						GROUP BY chgdt,ctg,usr,act
					</cfquery>
					<cfsavecontent variable="history">
						<br/>
						<b>Change History</b>
						<table cellpadding="0" cellspacing="1" border="0" class="history">
							<cfoutput query="qry" group="chgdt">
								<tr>
									<td class="first">#DateFormat(chgdt,"Mmm dd, yyyy")#</td>
									<td class="noborder">
										<cfoutput group="ctg">
											<table>
												<tr>
													<th width="115">#ctg#:</th>
													<td>
														<cfoutput group="usr"><u>By #usr#</u><br/></cfoutput>
														<cfset ct = 0/>
														<cfoutput><cfset ct=ct+1/></cfoutput>
														<cfoutput><cfif len(trim(act))><li class="note<cfif ct eq 1> single</cfif>">#act#</li></cfif></cfoutput>
													</td>
												</tr>
											</table>
										</cfoutput>
									</td>
								</tr>
							</cfoutput>
						</table>
					</cfsavecontent>
				</cfdefaultcase>
			</cfswitch>
			<cfset out = computer&properties&applications&history/>
		</cfcase>
	</cfswitch>
<!--- </cfsilent> --->
<cfif url.format is "html"><cfoutput>#out#</cfoutput><cfexit></cfif>

<!--- Generate PDF --->
<cfheader name="Content-Disposition" value="attachment;filename=#lcase(listlast(listfirst(url.id),'='))#_report.pdf;">
<cfdocument format="PDF" pagetype="letter" orientation="portrait" name="fl"marginleft=".25" marginright=".25" margintop=".25" marginbottom=".25">
	<cfoutput>#out#</cfoutput>
	<cfdocumentitem type="footer"><cfoutput><div class="footer" style="font-family: Arial !important; text-align: right; width: 100%;">Report Generator Provided By <a href="http://open.ecorgroup.com">Ecor Group</a> - Page #cfdocument.currentpagenumber# of #cfdocument.totalpagecount#</div></cfoutput></cfdocumentitem>
</cfdocument>
<cfcontent type="application/pdf" variable="#fl#" reset="true"/>
<cfif fileexists("#lcase(listlast(listfirst(url.id),'='))#_report.pdf")>
	<cffile action="delete" file="#lcase(listlast(listfirst(url.id),'='))#_report.pdf"/>
</cfif>