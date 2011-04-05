<cfsilent>
	<cfset dflt = "192.168.0.0"/>
	<cfparam name="tmpdomain" default="DOMAIN.LOCAL"/>
	<cfparam name="tmpserver" default="#dflt#"/>
	<cfparam name="tmpport" default="389"/>
	<cfparam name="tmpbasedn" default="domain.local"/>
	<cfparam name="tmpbind" default="Administrator"/>
	<cfif StructKeyExists(form,"domain")>
		<cfscript>
			tmpdomain=form.domain;
			tmpserver=form.server;
			tmpport=form.port;
			tmpbasedn=form.domain;
			tmpbind=form.bind;

			start = "DC=#replace(trim(form.domain),'.',',DC=','ALL')#";
			if (listlen(form.bind) gt 3)
				usr = form.bind;
			else
				usr = "CN="&trim(form.bind)&",CN=Users,"&start;

			customport = form.port;
		</cfscript>
		<cftry>
			<cfif form.port is "689">
				<cfldap action="QUERY"
					name="LDAP"
					attributes="distinguishedName"
					scope="subtree"
					start="#start#"
					filter="sAMAccountName=#trim(form.bind)#"
					server="#trim(form.server)#"
					port="#trim(customport)#"
					username="#trim(form.bind)#"
					password="#trim(form.pwd)#"
					secure="CFSSL_BASIC">
			<cfelse>
				<cfldap action="QUERY"
					name="LDAP"
					attributes="distinguishedName"
					scope="subtree"
					start="#start#"
					filter="sAMAccountName=#trim(form.bind)#"
					server="#trim(form.server)#"
					port="#trim(customport)#"
					username="#trim(form.bind)#"
					password="#trim(form.pwd)#">
			</cfif>
			<cfscript>
				session.ad=StructCopy(form);
				session.ad.bind=trim(LDAP.distinguishedName[1]);
				session.ad.dn=start;
			</cfscript>
			<cflocation url="./db.cfm" addtoken="false"/>
			<cfcatch type="any"><cfset error = cfcatch.message/></cfcatch>
		</cftry>
		<cfif isdefined("error")>
			<cftry>
				<cfif form.port is "689">
					<cfldap action="QUERY"
						name="LDAP"
						attributes="distinguishedName"
						scope="subtree"
						start="#start#"
						filter="sAMAccountName=#trim(form.bind)#"
						server="#trim(form.server)#"
						port="#trim(customport)#"
						username="#usr#"
						password="#trim(form.pwd)#"
						secure="CFSSL_BASIC">
				<cfelse>
					<cfldap action="QUERY"
						name="LDAP"
						attributes="distinguishedName"
						scope="subtree"
						start="#start#"
						filter="sAMAccountName=#trim(form.bind)#"
						server="#trim(form.server)#"
						port="#trim(customport)#"
						username="#usr#"
						password="#trim(form.pwd)#">
				</cfif>
				<cfif LDAP.recordcount eq 0>
					<cfthrow message="Could not find user."/>
				</cfif>
				<cfscript>
					session.ad=StructCopy(form);
					session.ad.bind=trim(LDAP.distinguishedName[1]);
					session.ad.dn=start;
				</cfscript>
				<cflocation url="./db.cfm" addtoken="false"/>
				<cfcatch type="any"><cfset error = cfcatch.message/></cfcatch>
			</cftry>
		</cfif>
	<cfelseif StructKeyExists(session,"ad")>
		<cfscript>
			if (StructKeyExists(session.ad,"server")) {
				tmpserver=session.ad.server;
				tmpdomain=session.ad.domain;
				tmpport=session.ad.port;
				tmpbind=session.ad.bind;
			}
		</cfscript>
	</cfif>
</cfsilent>
<script type="text/javascript">
	function validate(f) {
		var out = [];

		if((f.server.value!='localhost') && (f.server.value.split(".").length<2||f.server.value=='<cfoutput>#dflt#</cfoutput>'))
			out.push('Server');
		if(f.domain.value.split(".").length<2||f.domain.value.length<3)
			out.push('Domain');
		if(f.bind.value.length<2)
			out.push('Username');
		if(f.pwd.value.length<1)
			out.push('Password');
		if (out.length==0) {
			f.sbt.disabled=true;
			f.submit();
		} else {
			str = "There are problems with the following fields:\n\n";
			if (out.length>1)
				str = str+'--> ';
			str = str+out.toString().replace(/\,/g,'\n--> ');
			alert(str);
		}
	}
</script>
<div class="header">
	<h2>Installation: Step 2 of <cfoutput>#totalsteps#</cfoutput></h2>
	<div class="done">Requirements & License Acceptance</div>
	<div class="current">Configure Active Directory</div>
	<div class="notdone">Configure Data Sources</div>
	<div class="notdone">Download &amp; Configure ExtJS</div>
	<div class="notdone">Optionally Install Add-on Modules</div>
</div>
<div align="center">
	<div style="width:785px;text-align:left;margin-bottom:15px;">
		AssetTracker uses Active Directory to identify computers on the
		network. Please provide	your Active Directory settings below.
		Your connection will be tested upon completion of this form.
		If the test is successful, you will be automatically taken to
		the next step.
		<br/><br/>
		<cfif isdefined("error")>
		<div class="alert"><h3 style="margin-top:0;margin-bottom:6px;">Active Directory Connection Test FAILED</h3><font style="font-size:xx-small;"><cfoutput>#error#</cfoutput><br/>Please refer to the Active Directory troubleshooting section in the AssetTracker Guide for assistance.</font></div>
		</cfif>
		<form action="ad.cfm" method="post">
			<table cellspacing="0" border="0">
				<tr>
					<th class="required" width="110">AD Server*</th>
					<td><input type="text" size="50" name="server" value="<cfoutput>#tmpserver#</cfoutput>"/></td>
					<td class="note">The IP address or DNS name of the Active Directory server<br/>(i.e. ad.myserver.com)</td>
				</tr>
				<tr>
					<th class="required" width="110">Domain*</th>
					<td><input type="text" size="50" name="domain" value="<cfoutput>#tmpdomain#</cfoutput>"/></td>
					<td class="note">Ex: DOMAIN.LOCAL, MYDOMAIN.COM<br/>The domain can be found in Active Directory as shown in the example below:<br/><img src="./images/dc.png" class="border"/></td>
				</tr>
				<tr>
					<th>SSL</th>
					<td><input type="radio" name="port" value="689"<cfif tmpport is not '389'> checked="true"</cfif>/>On&nbsp;<input type="radio" name="port" value="389"<cfif tmpport is '389'> checked="true"</cfif>/>Off</td>
					<td class="note">SSL is not required.</td>
				</tr>
				<tr>
					<th class="required">Username*</th>
					<td><input type="text" size="50" name="bind" value="<cfoutput>#tmpbind#</cfoutput>"/></td>
					<td rowspan="3"><img hspace="6" align="right" src="./images/dc2.png"/></td>
				</tr>
				<tr>
					<th class="required noborder">Password*</th>
					<td class="noborder"><input type="password" size="50" name="pwd"/></td>
				</tr>
				<tr>
					<td class="note noborder" colspan="2">The system uses this account to bind/connect to Active Directory. It is possible and recommended to use an account other than "Administrator" for security purposes, because the password is stored in plain text. Using an alternative account is OK if it has permission to query Active Directory. You may also change this account at a later time by modifying the main.ini file found in the config folder after the install completes.</td>
				</tr>
				<tr>
					<th></th>
					<td></td>
					<td align="right"><input type="button" value="Next &raquo;" name="sbt" onclick="javascript:validate(this.form);"></td>
				</tr>
			</table>
		</form>
	</div>
</div>