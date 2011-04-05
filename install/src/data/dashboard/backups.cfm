<cfsilent>
	<cfscript>
		if (StructKeyExists(url,"refresh"))
			tspan = createtimespan(0,0,0,0);
		else
			tspan = createtimespan(0,1,0,0);
	</cfscript>
	<cfquery name="qry" datasource="#application.dsn.chglog#" cachedwithin="#tspan#">
		SELECT      sysid,startdt,note
		FROM  bkp
		WHERE recurtype LIKE '%#dayofweek(now())#%';
	</cfquery>
</cfsilent>
<div class="newapps">
<cfif qry.recordcount>
	<h3>Today's Backups<img src="./style/icons/new.png" hspace="3" align="right"/></h3>
	<cfoutput query="qry">
	<b>#listlast(listfirst(sysid),"=")#</b> (#timeformat(startdt,"hh:mm tt")#) <cfif len(trim(note))> - #note#</cfif><br/>
	</cfoutput>
<cfelse>
	<h3 style="color:#CCC;">No Regular Backups Today</h3>
</cfif>
</div>