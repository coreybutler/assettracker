<cfcomponent>

	<cffunction name="onRequestEnd">
		<cfargument name="requestname" required=true/>
		<cfinclude template="./_generator.cfm"/>
	</cffunction>

</cfcomponent>