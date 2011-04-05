<!---
	THIS IS A REPORT TEMPLATE
	New reports can be created using this as a guideline.
	A built-in PDF generator is automatically included
	at the end of the request (via Application.cfc).

	In order for the generator to work properly, all of the
	content must be wrapped in a variable called out. Most
	output will be HTML or PDF format. If no format is
	specified, the content of the "out" variable will be
	written to the screen as HTML. If PDF format is selected,
	it will be streamed to the browser for download.

	The generator accepts a variable called "save". Setting
	this to true for a PDF will save a copy of the report in
	the ./store/reports folder (unless otherwise specified).
	The PDF will still be streamed to the browser for download.

	If the save variable is set to true for HTML format, a PDF
	copy of the HTML output will be saved to the ./store/reports
	folder (unless otherwise specified).
 --->
<cfsilent>
	<!--- Create the report content --->
	<cfquery name="qry" datasource="#application.dsn.chglog#">
		SELECT		ctg,app,crtdt,sysid
		FROM		sysapps
		GROUP BY	ctg,app,sysid,crtdt
		ORDER BY 	ctg,app,crtdt,sysid
	</cfquery>
	<cfsavecontent variable="request.out">
		<link type="text/css" rel="stylesheet" href="../../style/report.css"/>
		<h2>Software & Applications</h2>
		<table class="software" cellspacing="1">
			<tr><th>Application</th><th>Computer/Register Date</th></tr>
			<cfoutput query="qry" group="ctg">
				<tr><td class="category" colspan="2"><i>#ctg#</i></td></tr>
				<cfoutput group="app">
				<tr>
					<th class="app">#app#</th>
					<td>
						<table cellpadding="0" cellspacing="2" border="0">
							<cfoutput>
								<tr><td width="100" style="font-size:10px;">#listlast(listfirst(sysid),"=")#</td><td style="font-size:10px;" class="smalllight">#dateformat(crtdt,"Mmm dd, yyyy")#</td></tr></li>
							</cfoutput>
						</table>
					</td>
				</tr>
				</cfoutput>
			</cfoutput>
		</table>
	</cfsavecontent>

	<!--- Use the built in generator & its parameters --->
	<cfscript>
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