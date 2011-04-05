<cfif not StructKeyExists(url,"restart")>
	<cflocation url="#CGI.PATH_INFO#?restart" addtoken="false">
<cfelse>
	<cfif StructKeyExists(url,"cleanupinstall")>
		<cftry>
			<cfdirectory action="delete" directory="#expandpath('./install')#" recurse="true"/>
			<cfcatch type="any">
				<div style="border:2px dashed orange;color:maroon;padding:10px;width:600px;text-align:center;">
					<b>Installation could not be removed.</b><br/>
					<i>There was a problem removing the install folder. This is commonly caused by
					invalid permissions on the folder. This will not affect AssetTracker, but it
					will require you to manually remove the folder
					</i>
					<br/><br/>
					<strong><cfoutput>#expandpath('./install')#</cfoutput></strong>
					<br/><br/>
					<b><a href="./">Launch AssetTracker</a></b>
				</div>
				<cfabort>
			</cfcatch>
		</cftry>
	</cfif>
	<script type="text/javascript">
		document.location="./";
	</script>
</cfif>