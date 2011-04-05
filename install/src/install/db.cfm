<cfsilent>
	<cfparam name="tmpserver" default="localhost"/>
	<cfparam name="tmpcfusr" default="admin"/>
	<cfparam name="tmpdsnnm" default="assettracker"/>
	<cfparam name="tmpport" default="5432"/>
	<cfparam name="tmpdbtype" default="pgsql"/>
	<cfparam name="tmpusr" default=""/>
	<cfparam name="tmpdb" default=""/>
	<cfif StructKeyExists(form,"cfusr")>
		<cfscript>
			tmpserver=form.server;
			tmpcfusr=form.cfusr;
			tmpdsnnm=form.dsn;
			tmpport=form.port;
			tmpdbtype=form.type;
			tmpusr=form.usr;
			tmpdb=form.db;
			try {
				//Create Admin Connection
				api = createObject("component","cfide.adminapi.administrator");
				api.login(adminPassword=form.cfpwd,adminUserId=form.cfusr);

				//Create DSN
				ds = createObject("component","cfide.adminapi.datasource");
				if (form.type is "pgsql")
					ds.setpostgresql(trim(form.dsn),trim(form.server),trim(form.db),'',trim(form.port),'PostgreSQL','org.postgresql.Driver',trim(form.usr),trim(form.pwd));
				else
					ds.setmysql5(trim(form.dsn),trim(form.server),trim(form.db),'',trim(form.port),'MySQL5','com.mysql.jdbc.Driver',trim(form.usr),trim(form.pwd));

				if(not ds.verifydsn(trim(form.dsn))) {
					ds.deletedatasource(trim(form.dsn));
					error = "Could not verify datasource. Check database username/password and try again.";
				}

				//Close Admin Connection
				api.logout();

				//Create the DB Tables
			} catch (any e) {
				error = e.message;
			}
		</cfscript>
		<cftry>
			<cfif not isdefined("error")>
				<cfset x = ArrayNew(1)>
				<cfif form.type is "pgsql"><cfquery name="qry" datasource="#trim(form.dsn)#"><cfinclude template="./sql/pgsql.sql"></cfquery></cfif>
				<cfif form.type is "mysql">
					<cffile action="read" file="#expandpath('./sql/mysql.sql')#" variable="sql"/>
					<cfloop list="#sql#" delimiters=";" index="i">
						<cfif len(trim(i))><cfquery name="qry" datasource="#replace(trim(form.dsn),'''''','''','ALL')#">#trim(i)#;</cfquery></cfif>
					</cfloop>
				</cfif>
			</cfif>
			<cfset session.dsn = StructCopy(form)/>
			<cflocation url="js.cfm" addtoken="false"/>
			<cfcatch type="any">
				<cfscript>
					api = createObject("component","cfide.adminapi.administrator");
					api.login(adminPassword=form.cfpwd,adminUserId=form.cfusr);
					ds = createObject("component","cfide.adminapi.datasource");
					ds.deletedatasource(trim(form.dsn));
					error = cfcatch.message&cfcatch.detail;
				</cfscript>
			</cfcatch>
		</cftry>
	</cfif>
	<cfscript>
		dsnList = CreateObject("java", "coldfusion.server.ServiceFactory").getDataSourceService().DataSources;
		dsn = structkeyarray(dsnList);
		list = ArrayNew(1);
		for(i=1;i lte arraylen(dsn);i++) {
			if (findnocase(dsnList[dsn[i]].driver,"postgresql,mysql5"))
				arrayappend(list,dsn[i]);
		}
		i=0;
		while(listcontains(arraytolist(list),tmpdsnnm)) {
			i=i+1;
			tmpdsnnm = tmpdsnnm&i;
		}
		list = SerializeJSON(list);
	</cfscript>
</cfsilent>
<script type="text/javascript">
	function arraycontains(array,item) {
		var str = ','+array.toString()+',';
		return (str.indexOf(','+item+',')>=0);
	}
	function validate(f) {
		var out = [];
		var list=[<cfoutput>#list#</cfoutput>]

		if(f.cfusr.value.length<1)
			out.push('ColdFusion Admin');
		if(f.cfpwd.value.length<1)
			out.push('ColdFusion Admin Password');
		if (arraycontains(list,f.dsn.value))
			out.push('CF DSN Already Exists');
		if(f.server.value.length<1)
			out.push('Host Server');
		if(f.db.value.length<2)
			out.push('Database Name');
		if(f.port.value.length<2)
			out.push('Port');
		if(f.usr.value.length<1)
			out.push('Database User');
		if(f.pwd.value.length<1)
			out.push('Database User Password');
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
	<h2>Installation: Step 3 of <cfoutput>#totalsteps#</cfoutput></h2>
	<div class="done">Requirements & License Acceptance</div>
	<div class="done">Configure Active Directory</div>
	<div class="current">Configure Data Sources</div>
	<div class="notdone">Download &amp; Configure ExtJS</div>
	<div class="notdone">Optionally Install Add-on Modules</div>
</div>
<div align="center">
	<div style="width:785px;text-align:left;margin-bottom:15px;">
		AssetTracker requires a database for both core and add-on modules. At this time,
		only <b>PostgreSQL</b> and <b>MySQL</b> are supported. Please create a data source
		below.<br/><br/>
		<div style="border:2px dashed orange;color:maroon;text-align:center;"><h3>A new CF data source and database tables will be created upon completion of this step.</h3></div>
		<br/>
		<cfif isdefined("error")>
		<div class="alert"><h3 style="margin-top:0;margin-bottom:6px;">Database Connection Test FAILED</h3><font style="font-size:xx-small;"><cfoutput>#error#</cfoutput></font></div>
		</cfif>
		<form action="db.cfm" method="post">
			<table cellspacing="0" border="0" width="100%">
				<tr>
					<td colspan="3" class="noborder"><i>ColdFusion DSN</i></td>
				</tr>
				<tr>
					<th class="noborder" width="165">CF Admin Username*</th>
					<td class="noborder"><input type="text" size="50" name="cfusr" value="<cfoutput>#tmpcfusr#</cfoutput>"/></td>
					<td class="note noborder" rowspan="2">A ColdFusion user with permission to create data source names. This is the same account you use to login to the ColdFusion administrator.</td>
				</tr>
				<tr>
					<th class="noborder">CF Admin Password*</th>
					<td class="noborder"><input type="password" size="50" name="cfpwd"/></td>
				</tr>
				<tr>
					<th class="noborder">CF DSN Name*</th>
					<td class="noborder"><input type="text" size="50" name="dsn" value="<cfoutput>#tmpdsnnm#</cfoutput>"/></td>
					<td class="note noborder">This is the name that will show up in the ColdFusion Datasource list.</td>
				</tr>
				<tr>
					<td colspan="3" style="border-top:1px dashed #666;"><i>Database Configuration</i></td>
				</tr>
				<tr>
					<th>Type*</th>
					<td><input type="radio" value="pgsql" name="type"<cfif tmpdbtype is "pgsql" or not len(trim(tmpdbtype))> checked="true"</cfif> onclick="javascript:document.getElementById('portvalue').value='5432';"/>PostgreSQL&nbsp;&nbsp;&nbsp;<input type="radio" value="mysql" name="type"<cfif tmpdbtype is "mysql"> checked="true"</cfif> onclick="javascript:document.getElementById('portvalue').value='3306';"/>MySQL</td>
					<td class="note"></td>
				</tr>
				<tr>
					<th class="noborder">Host*</th>
					<td class="noborder"><input type="text" size="50" name="server" value="<cfoutput>#tmpserver#</cfoutput>"/></td>
					<td class="note noborder">The server IP address or DNS name, such as db.myserver.local.</td>
				</tr>
				<tr>
					<th>Database*</th>
					<td><input type="text" size="50" name="db" value="<cfoutput>#tmpdb#</cfoutput>"/></td>
					<td class="note">The name of the database.</td>
				</tr>
				<tr>
					<th>Port*</th>
					<td><input type="text" size="50" name="port" id="portvalue" value="<cfoutput>#tmpport#</cfoutput>"/></td>
					<td class="note">PostgreSQL is typically 5432.<br/>MySQL is typically 3306.</td>
				</tr>
				<tr>
					<th>Database Username*</th>
					<td><input type="text" size="50" name="usr" value="<cfoutput>#tmpusr#</cfoutput>"/></td>
					<td class="note"></td>
				</tr>
				<tr>
					<th>Database Password*</th>
					<td><input type="password" size="50" name="pwd"/></td>
					<td class="note"></td>
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