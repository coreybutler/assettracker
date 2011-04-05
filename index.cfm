<div class="header">
	<h2>Installation: Step 1 of <cfoutput>#totalsteps#</cfoutput></h2>
	<div class="current">Requirements & License Acceptance</div>
	<div class="notdone">Configure Active Directory</div>
	<div class="notdone">Configure Data Sources</div>
	<div class="notdone">Download &amp; Configure ExtJS</div>
	<div class="notdone">Optionally Install Add-on Modules</div>
</div>
<div align="center">
<b>Please review the requirements in the AssetTracker Guide before continuing.</b>
<form action="ad.cfm" method="post">
	<textarea name="accept" cols="100" rows="22"><cfinclude template="license.txt"></textarea>
	<div align="right" style="padding-right:75px;">
		<input type="submit" value="I have read & agree to the license terms."/>
	</div>
</form>
</div>