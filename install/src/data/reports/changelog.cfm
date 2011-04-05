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
		SELECT		sysid,chgdt,ctg,usr,act
		FROM		chglog
		GROUP BY	sysid,chgdt,ctg,usr,act
		ORDER BY	sysid,chgdt desc
	</cfquery>
	<cfsavecontent variable="request.out">
		<link type="text/css" rel="stylesheet" href="../../style/report.css"/>
		<h2>Change History By Computer</h2>
		<table class="history" cellspacing="1">
			<cfoutput query="qry" group="sysid">
			<tr><th class="category" colspan="2">#ucase(listlast(listfirst(sysid),"="))#</th></tr>
			<cfoutput group="chgdt">
				<tr>
					<td width="250">#replace(dateFormat(chgdt,"Mmm dd, yyyy"),' ','&nbsp;','ALL')#</td>
					<td>
						<cfoutput group="ctg">
						<i>#ctg#:</i><br/>
						<cfset ct = 0/>
						<cfoutput><cfset ct = ct+1/></cfoutput>
						<cfoutput><li class="note<cfif ct gt 1> single</cfif>">#replace(act,chr(10),'<br/>','ALL')# (#usr#)</li></cfoutput>
						</cfoutput>
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