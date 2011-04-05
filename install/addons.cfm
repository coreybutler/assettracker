<cfsilent>
	<cfif StructKeyExists(form,"addon")>
		<cfset rt = expandpath('../')/>
		<cffunction name="copyDir" output="true">
		    <cfargument name="source" required="true" type="string">
		    <cfargument name="destination" required="true" type="string">
		    <cfargument name="conflict" required="true" default="overwrite">
			<cfscript>
				var out = "";
				var dest = replace(replace(arguments.destination,'//','|','ONE'),'\','/','ALL');
				var src = replace(replace(arguments.source,'//','|','ONE'),'\','/','ALL');
				var i = 0;
				var base = "";

				src = replace(src,'|','//','ONE');
			</cfscript>

		    <cfif not DirectoryExists(dest)>
		    	<cfset base = replace(listfirst(dest,'/'),'|','//','ALL')/>
			    <cfloop from="2" to="#listlen(dest,'/')#" index="i">
				    <cfset base = base&'/'&listgetat(dest,i,'/')/>
					<cfif not DirectoryExists(base)>
						<cfdirectory action="create" directory="#base#"/>
					</cfif>
				</cfloop>
		    </cfif>
		    <cfdirectory action="list" directory="#src#" name="out">
		    <cfloop query="out">
		        <cfif out.type is "file">
		            <cffile action="copy" source="#src#/#name#" destination="#dest#/#name#" nameconflict="#arguments.conflict#">
		        <cfelseif out.type eq "dir">
		            <cfset copyDir(arguments.source&'/'&name,arguments.destination&'/'&name) />
		        </cfif>
		    </cfloop>
		</cffunction>

		<cfif directoryexists(rt&'/store')>
			<cfdirectory action="delete" recurse="true" directory="#rt#/store"/>
		</cfif>
		<cfdirectory action="create" directory="#rt#/store"/>
		<cfdirectory action="create" directory="#rt#/store/reports"/>
		<cfdirectory action="list" name="out" directory="#expandpath('./src')#"/>
		<cfoutput query="out">
			<cfif out.type is "file">
				<cffile action="copy" source="#directory#/#name#" destination="#rt#/#name#"/>
			</cfif>
		</cfoutput>
		<cfscript>
			//Create files in proper locations
			copyDir(expandpath('./src/config'),rt&'/config');
			copyDir(expandpath('./src/data'),rt&'/data');
			copyDir(expandpath('./src/style'),rt&'/style');
			copyDir(expandpath('./src/SOURCE'),rt&'/SOURCE');
			copyDir(expandpath('./src/BIN'),rt&'/js');

			r = chr(10);

			//AD
			str = "[default]"&r&"server="&session.ad.server&r&"port="&session.ad.port&r;
			if (session.ad.port is "689")
				str = str & "ssl=true";
			else
				str = str & "ssl=false";
			str = str&r&"basedn="&session.ad.dn&r&"username="&session.ad.bind&r&"password="&session.ad.pwd&r&r;

			//DSN
			str = str&"[dsn]"&r&"chglog="&session.dsn.dsn&r&r;

			//Storage
			str = str&"[storage]"&r&"##Absolute, Relative, or Mapped path to the drectory where reports are stored"&r;
			str = str&"reports=./store/reports"&r&r;

			//Stock Values
			str = str&"[values]"&r&"changeActions=Installation,Update,Uninstallation,General,Addition,Removal,Upgrade";
		</cfscript>
		<cffile action="write" file="#rt#/config/main.ini" output="#str#"/>
		<cffile action="read" file="#expandpath('./templates/addons.tpl')#" variable="out"/>
		<cfscript>
			str = "";
			if(listcontainsnocase(form.addon,"updates")) {
				out = replace(out,"@UPDATE","true");
				str = str&",{title:'Change History',		action:'changelog.cfm',			active:true,	description:'All of the changes registered, by computer.'}"&r;
			} else
				out = replace(out,"@UPDATE","false");
			if(listcontainsnocase(form.addon,"backup")) {
				out = replace(out,"@BACKUP","true");
				str = str&",{title:'Backup Schedule',		action:'backup.cfm?format=pdf',	active:true,	description:'A month-view (calendar style) list of backups.'}";
			} else
				out = replace(out,"@BACKUP","false");
			if (len(trim(str)))
				out = replace(out,"@REPORTS",str);
		</cfscript>
		<cffile action="write" file="#rt#/config/addons.js" output="#out#">
		<cffile action="read" file="#expandpath('./templates/index.tpl')#" variable="out"/>
		<cfscript>
			out = replace(out,"@CURRENTVERSIONNAME","AssetTracker RC1","ALL");
			out = replace(out,"@EXTJS",session.extjspath,"ALL");
		</cfscript>
		<cffile action="write" file="#rt#/index.htm" output="#out#">
		<cffile action="read" file="#expandpath('./templates/assettracker.tpl')#" variable="out"/>
		<cfscript>
			out = replace(out,"@CURRENTVERSIONNAME","AssetTracker RC1","ALL");
			out = replace(out,"@EXTJS",session.extjspath,"ALL");
		</cfscript>
		<cffile action="write" file="#rt#/js/assettracker.js" output="#out#">
		<cflocation url="cleanup.cfm" addtoken="false"/>
	</cfif>
</cfsilent>
<div class="header">
	<h2>Installation: Step 5 of <cfoutput>#totalsteps#</cfoutput></h2>
	<div class="done">Accept License</div>
	<div class="done">Configure Active Directory</div>
	<div class="done">Configure Data Sources</div>
	<div class="done">Download &amp; Configure ExtJS</div>
	<div class="current">Optionally Install Add-on Modules</div>
</div>
<div align="center">
	<div style="width:835px;text-align:left;margin-bottom:15px;">
	<h3>You're almost done!</h3>
	This installation of AssetTracker contains additional optional modules.
	Please check those that interest you, then complete the installation
	using the button at the bottom of the page.
	<br/><br/>
	<form action="addons.cfm" method="post">
		<table cellpadding="0" cellspacing="0" border="0" style="border:1px dashed #eee;">
			<tr>
				<td class="noborder" style="text-align:center;border-bottom:2px dashed #333 !important;background:#f5f293;" width="125"><input type="checkbox" checked="true" name="addon" value="updates"><b>Include</b></td>
				<td class="noborder" style="border-bottom:2px dashed #333 !important;padding-bottom:20px;">
					<h2 style="margin-top:4px;">Updates Module</h2>
					The updates module can be used to track when routine maintenance updates are needed &amp; completed.
					It is NOT a tool for actually performing system updates (Think of it as a log).
					When included, the module adds a tab to the web system, which contains the tools shown below:
					<br/><br/>
					The first tool is a master list of systems recognized by Active Directory. Notice the Update
					button in the grid (shown below). Clicking this will mark the system as updated.
					<img src="./images/updatetool.png" vspace="8" align="right" width="200" style="margin-left:4px;margin-top:42px;"/>
					<img src="./images/updatemain.png" vspace="12" width="540"/>
					A personal "shortcuts" tool also exists. Personal notes can be saved here, including update
					instructions, documentation, or anything else you may wish to remember. This is especially
					useful if you do not make updates very often. This also allows users to create a customized
					list of computers by dragging/dropping them in an order that makes sense to them. This is useful
					in situations where you may want to check off servers as you update them, and within a specific order.
					<div style="clear:both;"></div>
					<br/>This module also extends the main dashboard to show recent updates and computers that haven't received
					updates in a while.<br/>
				</td>
			</tr>
			<tr>
				<td class="noborder" style="text-align:center;background:#f5f293;padding-top:20px;"><input type="checkbox" checked="true" name="addon" value="backup"><b>Include</b></td>
				<td class="noborder" style="padding-top:20px;">
					<h2 style="margin-top:4px;">Backup Module</h2>
					The backup module is a scheduling tool used to keep track of computer backups. It
					provides a simple logging interface as well multiple HTML/PDF reports.
					<img src="./images/backup.png" vspace="12"/>
				</td>
			</tr>
		</table>
		<div align="right">
			<br/>
			<input type="submit" value="Complete Installation"/>
		</div>
	</form>
	</div>
</div>