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
	<cfsavecontent variable="request.out">
		This is a general <b>template</b>. Report content/HTML goes here.
	</cfsavecontent>

	<!--- Use the built in generator & its parameters --->
	<cfscript>
		//STANDARD PARAMETERS
		//request.filename="general.pdf";
		//request.format = "html";
		//request.save = false;
		//request.overwrite = true;
		//request.orientation = "portrait";
		//request.marginleft=".25";
		//request.marginright=".25";
		//request.marginbottom=".25";
		//request.margintop=".25";

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