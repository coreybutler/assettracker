<cfsilent>
	<cfif StructKeyExists(url,"clear")>
		<cflocation url="../start.cfm?restart" addtoken="false"/>
	</cfif>
</cfsilent>
<div class="header">
	<h2>Installation Completed!</h2>
	<div class="notdone">Remove Installation Files</div>
	<div class="notdone">Launch AssetTracker</div>
</div>
<div align="center">
	<div style="width:785px;text-align:left;margin-bottom:15px;">
		<h2>You're all done!</h2>
		Now that you've completed the installation, you no longer need the files used
		during the installation process. We recommend keeping the original AssetTracker
		zip file in case you want to reinstall again at a later time, but the install
		files can be safely removed from the web root by deleting <b><cfoutput>#expandpath('../install')#</cfoutput></b>.
		<br/><br/><br/>
		<img src="./images/logon.png" hspace="4" align="right" style="border:1px solid #999;"/>
		When you launch AssetTracker, you will be required to login with your Active Directory credentials.
		By default, all authenticated users have access to AssetTracker. If you wish to setup additional
		security restrictions, please review the Guide.
		<br/><br/><br/>
		<a href="../start.cfm?restart&cleanupinstall">Yes, remove the installation files for me &amp; launch AssetTracker.</a><br/><br/>
		<a href="../start.cfm?restart">Just launch AssetTracker.</a><br/><i>I will manually remove the installation folder.</i>
		<br/><br/><br/>
		<b>Thanks for choosing AssetTracker!!</b>
	</div>
</div>