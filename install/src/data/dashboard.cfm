<cfsilent>
	<cfset days = 7>
	<cfquery name="qry" datasource="#application.dsn.chglog#">
		SELECT		sysid, count(app) as ct
		FROM		sysapps
		WHERE		crtdt >= '#DateFormat(Dateadd('d',0-days,now()),"yyyy-mm-dd")#'
		GROUP BY	sysid
	</cfquery>
	<cfset newapps = "">
	<cfoutput query="qry">
		<cfset newapps = listappend(newapps,' <a href="javascript:Ext.openComputerByDN(''#sysid#'');">#listlast(listfirst(sysid),'=')#</a> (#ct#)')/>
	</cfoutput>
	<!--- Get other dashboard add-ons --->
	<cffile action="read" file="#expandpath('../config/addons.js')#" variable="addons"/>
	<cfscript>
		code = mid(addons,findnocase("[",addons)+1,(findnocase("]",addons)-1)-(findnocase("[",addons)));
		code = rereplacenocase(code,"\{|\}|\'|\""","","ALL");
		out = listtoarray(code);
		includes = arraynew(1);
		pass = false;
		for(i=1;i lte arraylen(out);i++) {
			if (listlen(out[i],":")) {
				if (trim(listfirst(out[i],":")) is "active") {
					pass = false;
					if (listlast(out[i],":") is "true")
						pass=true;
				}
				if (pass) {
					if (trim(listfirst(out[i],":")) is "dashboard") {
						arrayappend(includes,listlast(out[i],":"));
						pass=false;
					}
				}
			}
		}
	</cfscript>
</cfsilent>
<div id="dashboard">
<img src="./style/icons/assettracker_logo.png" align="right" height="120"/>
<h1 class="title">Welcome to AssetTracker RC 1.0!</h1><br/>
To get started, double click on a computer from the list on the left.
You will also see environment notices, changes, and recent reports
to the right. Individual computer reports are available from the tab
that opens when you double click a computer on the left, or more
advanced/system-wide reports are available on the reports tab.
<br/><br/>
You may also notice additional tabs and tools if optional plugins
have been configured. Thanks for using AssetTracker!
<cfif listlen(newapps)><div class="newapps"><h3>Applications Detected<img src="./style/icons/new.png" hspace="3" align="right"/></h3><cfoutput>#trim(newapps)#</cfoutput><br/></div></cfif>
<cfloop array="#includes#" index="i">
	<cfif len(trim(i))>
		<div class="include"><cfinclude template="./dashboard/#i#"/></div>
	</cfif>
</cfloop>
</div>
<!--- Make sure the abort tag is not removed --->
<cfabort>