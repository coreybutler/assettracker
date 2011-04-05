<cfsilent>
	<cfsetting requesttimeout="600"/>
	<cfparam name="tmppth" default="./ext"/>
</cfsilent>
<script type="text/javascript">
	function validate(f) {
		var out = [];

		if(f.ext.value=="exist" && f.extjs.value.length<2)
			out.push('Path to ExtJS');
		if (out.length==0) {
			f.sbt.disabled=true;
			f.sbt.value="Please wait...";
			document.getElementById('jsf').style.visibility='hidden';
			document.getElementById('jsf').style.display='none';
			document.getElementById('dld').style.visibility='hidden';
			document.getElementById('dld').style.display='none';
			document.getElementById('notice').style.visibility='visible';
			document.getElementById('notice').style.display='block';
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
	<h2>Installation: Step 4 of <cfoutput>#totalsteps#</cfoutput></h2>
	<div class="done">Requirements & License Acceptance</div>
	<div class="done">Configure Active Directory</div>
	<div class="done">Configure Data Sources</div>
	<div class="current">Download &amp; Configure ExtJS</div>
	<div class="notdone">Optionally Install Add-on Modules</div>
</div>
<div align="center">
	<div style="width:785px;text-align:left;margin-bottom:15px;">
		<cfif StructKeyExists(form,"ext")>
			<cfif form.ext is "download">
				<cfif directoryexists(expandpath('../js'))>
					<cfdirectory action="delete" directory="#expandpath('../js')#" recurse="true"/>
				</cfif>
				<cfdirectory action="create" directory="#expandpath('../js')#"/>
				<b>Please be patient as this may take up to a few minutes.</b><br/>
				Downloading ExtJS...
				<cfflush>
				<cfhttp url="http://www.extjs.com/deploy/ext-3.1.0.zip" method="Get" file="ext.zip" path="#expandpath('../js/')#"/>
				DONE.<br/><br/>
				Installing ExtJS...
				<cfflush>
				<cfzip action="unzip" file="#expandpath('../js/ext.zip')#" recurse="true" destination="#expandpath('../js')#"/>
				DONE.<br/><br/>
				Configuring ExtJS...
				<cfflush>
				<cfdirectory action="list" directory="#expandpath('../js')#" filter="ext*" recurse="false" name="dir"/>
				<cfloop query="dir">
					<cfif dir.type is "dir">
						<cfset extjs = dir.name/>
						<cfbreak/>
					</cfif>
				</cfloop>
				DONE.
				<cffile action="delete" file="#expandpath('../js/ext.zip')#"/>
				<cfdirectory action="delete" directory="#expandpath('../js/#extjs#/docs')#" recurse="true"/>
				<cfdirectory action="delete" directory="#expandpath('../js/#extjs#/examples')#" recurse="true"/>
				<cfdirectory action="delete" directory="#expandpath('../js/#extjs#/pkgs')#" recurse="true"/>
				<cfdirectory action="delete" directory="#expandpath('../js/#extjs#/src')#" recurse="true"/>
				<cfset session.extjspath='./js/'&extjs/>
				</div></div>
				<script type="text/javascript">
					document.location = 'addons.cfm';
				</script>
				<cfflush>
			<cfelseif findnocase("http://",form.extjs)>
				<cfhttp method="get" url="#form.extjs#/ext-all.js" result="out">
				<cfscript>
					if (out.Statuscode is "200 OK")
						session.extjspath = form.extjs;
					else
						error = "ExtJS could not be found at "&form.extjs;
				</cfscript>
			<cfelse>
				<cfscript>
					if (fileexists(expandpath(form.extjs&"/ext-all.js")))
						session.extjspath=form.extjs;
					else
						error = "ExtJS could not be found at "&form.extjs;
				</cfscript>
			</cfif>
			<cfif not isdefined("error")>
				<cflocation url="addons.cfm" addtoken="false"/>
			</cfif>
		</cfif>
		<style>
			.hidden{visibility:hidden;display:none;}
		</style>
		<div id="notice" class="hidden" style="color:maroon;text-align:center;"><h3>Please be patient while ExtJS is installed.</h3><br/><i>This page will auto-reload when the ExtJS installation is complete.</i><br/><img src="./images/loading.gif"/></div>
		<div id="dld">
			This system uses the ExtJS 3.1 JavaScript/AJAX library (full edition, not the core). This is freely available software
			from <a href="http://www.extjs.com" target="_blank">www.extjs.com</a>. If you
			would like to use an existing installation, please specify the path to the root ExtJS folder. Alternatively,
			<b>this wizard can download and install it automatically for you</b>. <br/><br/>
			<div style="color:maroon;" class="">Download & installation may take several minutes depending on your internet connection speed.</div><br/>
			<br/><br/>
		</div>
		<cfif isdefined("error")>
		<div class="alert"><h3 style="margin-top:0;margin-bottom:6px;">SETUP/INSTALLATION FAILED</h3><font style="font-size:xx-small;"><cfoutput>#error#</cfoutput></font></div>
		</cfif>
		<div id="jsf">
			<form action="js.cfm" method="post">
				<form action="db.cfm" method="post">
				<table cellspacing="0" border="0" width="100%">
					<tr>
						<th class="noborder" width="165"><input type="radio" name="ext" value="exist"/>I already have ExtJS</th>
						<td class="noborder"><input type="text" size="50" name="extjs" value="<cfoutput>#tmppth#</cfoutput>"/></td>
						<td class="note noborder">This must be a relative path to this website or a full URL such as http://my.domain.com/ext</td>
					</tr>
					<tr>
						<th class="noborder" width="165"><input type="radio" name="ext" value="download" checked="true"/>Download &amp; Install</th>
						<td class="noborder"></td>
						<td class="note noborder"></td>
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
</div>