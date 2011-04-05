<cfsilent>
	<cfset expiredays = 30>
	<cfset sdays=3>
	<cfset days=7>
	<cfquery name="qry" datasource="#application.dsn.chglog#">
		SELECT	*,(dt <= #DateAdd('d',0-expiredays,now())#) as expired
		FROM	updlog
		ORDER BY dt desc
	</cfquery>
	<cfscript>
		list = "";
		for(i=1;i lte qry.recordcount;i++)
			list = listappend(list,'(distinguishedName='&trim(qry.sysid[i])&')');
		ldap = application.ldap.query("(&(!(|#list#))(objectClass=computer))","cn","subtree","CN=Computers,"&application.ldap._cfg.basedn);
		ldap2 = application.ldap.query("(&(!(|#list#))(objectClass=computer))","cn","subtree","OU=Domain Controllers,"&application.ldap._cfg.basedn);
	</cfscript>
	<cfquery name="ad" dbtype="query">
		SELECT	cn
		FROM	ldap
		UNION
		SELECT	cn
		FROM	ldap2
	</cfquery>
</cfsilent>
<h1>Latest Updates (Last <cfoutput>#days#</cfoutput> days)</h1><br/>
<table cellpadding="0" cellspacing="4" border="0" width="100%">
	<tr>
		<td valign="top" width="30%">
			<table cellpadding="0" cellspacing="4" border="0">
				<tr><td colspan="2" style="border-bottom:1px solid #eee;"><i>Last 3 Days</i></td></tr>
				<tr><th align="left" style="color:navy;"><u>Computer</u></th><th align="left" style="color:navy;"><u>Last Update</u></th></tr>
				<cfoutput query="qry"><cfif not expired and datecompare(dateadd('d',0-sdays,now()),dt) lte 0><tr><td>#ucase(listlast(listfirst(sysid),"="))#</td><td>#DateFormat(dt,"Mmm dd, yyyy")# #TimeFormat(dt,"hh:mm tt")#</td></tr></cfif></cfoutput>
			</table>
		</td>
		<td width="30"></td>
		<td valign="top" width="30%">
			<table cellpadding="0" cellspacing="4" border="0">
				<tr><td colspan="2" style="border-bottom:1px solid #eee;"><i>Past Week</i></td></tr>
				<tr><th align="left" style="color:navy;"><u>Computer</u></th><th align="left" style="color:navy;"><u>Last Update</u></th></tr>
				<cfoutput query="qry"><cfif not expired and datecompare(dateadd('d',0-days,now()),dt) lte 0 and datecompare(dateadd('d',0-sdays,now()),dt) gt 0><tr><td>#ucase(listlast(listfirst(sysid),"="))#</td><td>#DateFormat(dt,"Mmm dd, yyyy")# #TimeFormat(dt,"hh:mm tt")#</td></tr></cfif></cfoutput>
			</table>
		</td>
		<td width="30"></td>
		<td valign="top" width="30%">
			<table cellpadding="0" cellspacing="4" border="0">
				<tr><td colspan="2" style="border-bottom:1px solid #eee;"><i>Need Updates</i></td></tr>
				<tr><th align="left" style="color:maroon;"><u>Computer</u></th><th align="left" style="color:maroon;"><u>Last Update</u></th></tr>
				<cfif ad.recordcount><cfoutput query="ad"><tr><td>#ucase(cn)#</td><td>Never Updated</td></tr></cfoutput></cfif>
				<cfif qry.recordcount><cfoutput query="qry"><cfif expired><tr><td>#ucase(listlast(listfirst(sysid),"="))#</td><td>#DateFormat(dt,"Mmm dd, yyyy")# #TimeFormat(dt,"hh:mm tt")# - <i>#abs(datediff('d',dt,now()))# days</i></td></tr></cfif></cfoutput></cfif>
			</table>
		</td>
	</tr>
</table>