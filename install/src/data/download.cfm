<cfsilent>
	<cfscript>
		rt = expandpath('./store');
		if (StructkeyExists(url,"type")) {
			if (url.type is "report")
				rt = application.reportrootabsolute;
		}
	</cfscript>
</cfsilent>
<cfheader name="Content-Disposition" value="attachment;filename=#lcase(url.file)#;">
<cfcontent type="application/#lcase(listlast(url.file,'.'))#" file="#rt#/#url.file#" reset="true"/>