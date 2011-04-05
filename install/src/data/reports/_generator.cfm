<!--- DEFAULT SETTINGS --->
<cfscript>
	if (not StructKeyExists(request,"out"))
		request.out="No content defined.";
	if (not StructKeyExists(request,"filename"))
		request.filename="general.pdf";
	if (not StructKeyExists(request,"save"))
		request.save = false;
	if (not StructKeyExists(request,"format"))
		request.format = listlast(request.filename,".");
	if (not StructKeyExists(request,"overwrite"))
		request.overwrite = true;
	if (not StructKeyExists(request,"orientation"))
		request.orientation = "portrait";
	if (not StructKeyExists(request,"marginleft"))
		request.marginleft=".25";
	if (not StructKeyExists(request,"marginright"))
		request.marginright=".25";
	if (not StructKeyExists(request,"marginbottom"))
		request.marginbottom=".25";
	if (not StructKeyExists(request,"margintop"))
		request.margintop=".25";
</cfscript>

<!--- Stock Footer --->
<cfsavecontent variable="footer">
	<div class="footer" style="font-family: Arial !important; text-align: right; width: 100%;"><img src='../../style/icons/logo.png'>AssetTracker Reporting Provided By <a href="http://open.ecorgroup.com" style="text-decoration:none;">Ecor Group</a> -
</cfsavecontent>

<!--- STANDARD HTML --->
<cfif lcase(trim(request.format)) is "html">
	<cfoutput>#request.out#</cfoutput>
	<cfif request.save>
		<cfdocument format="PDF" pagetype="letter" orientation="#request.orientation#" filename="#application.reportrootabsolute#/#request.filename#" overwrite="#request.overwrite#" marginleft="#request.marginleft#" marginright="#request.marginright#" margintop="#request.margintop#" marginbottom="#request.marginbottom#">
			<cfoutput>#request.out#</cfoutput>
			<cfdocumentitem type="footer"><cfoutput>#footer#Page #cfdocument.currentpagenumber# of #cfdocument.totalpagecount# (#dateformat(now(),"Mmm dd, yyyy")# @ #timeformat(now(),"hh:mm tt")#)</div></cfoutput></cfdocumentitem>
		</cfdocument>
	</cfif>
	<cfexit>
</cfif>

<!--- DEFAULT OUTPUT (streams a PDF file to browser by default) --->
<cfif request.save>
	<cfset fl = "#application.reportrootabsolute#/#request.filename#"/>
	<cfdocument format="PDF" pagetype="letter" orientation="#request.orientation#" filename="#fl#" overwrite="#request.overwrite#" marginleft="#request.marginleft#" marginright="#request.marginright#" margintop="#request.margintop#" marginbottom="#request.marginbottom#">
		<cfoutput>#request.out#</cfoutput>
		<cfdocumentitem type="footer"><cfoutput>#footer#Page #cfdocument.currentpagenumber# of #cfdocument.totalpagecount# (#dateformat(now(),"Mmm dd, yyyy")# @ #timeformat(now(),"hh:mm tt")#)</div></cfoutput></cfdocumentitem>
	</cfdocument>
	<cfheader name="Content-Disposition" value="attachment;filename=#request.filename#;">
	<cfcontent type="application/pdf" file="#fl#" reset="true"/>
<cfelse>
	<cfheader name="Content-Disposition" value="attachment;filename=#request.filename#;">
	<cfdocument format="PDF" pagetype="letter" orientation="#request.orientation#" name="fl" marginleft="#request.marginleft#" marginright="#request.marginright#" margintop="#request.margintop#" marginbottom="#request.marginbottom#">
		<cfoutput>#request.out#</cfoutput>
		<cfdocumentitem type="footer"><cfoutput>#footer#Page #cfdocument.currentpagenumber# of #cfdocument.totalpagecount# (#dateformat(now(),"Mmm dd, yyyy")# @ #timeformat(now(),"hh:mm tt")#)</div></cfoutput></cfdocumentitem>
	</cfdocument>
	<cfcontent type="application/pdf" variable="#fl#" reset="true"/>
</cfif>