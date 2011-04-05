<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<cfsilent>
	<cfapplication name="assettrackerinstaller" sessionmanagement="true">

	<cfset totalsteps=5/>

	<cfif not findnocase("index.cfm",CGI.SCRIPT_NAME)>
		<cfif StructKeyExists(form,"accept")>
			<cfset session.license = true>
		</cfif>
		<cfif not StructKeyExists(session,"license")>
			<cflocation addtoken="false" url="./index.cfm">
		</cfif>
		<cfif not session.license>
			<cflocation addtoken="false" url="./index.cfm">
		</cfif>
	</cfif>
</cfsilent>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<meta http-equiv="Cache-Control" content="no-cache"/>
		<meta http-equiv="Pragma" content="no-cache"/>
		<meta http-equiv="Abstract" content="Manage customer pre-sales portals."/>
		<meta http-equiv="Author" content="Ecor Systems, LLC"/>
		<meta http-equiv="Copyright" content="Copyright 2010 Ecor Systems, LLC. All Rights Reserved."/>
		<meta http-equiv="Description" content="A server management system."/>
		<meta http-equiv="Distribution" content="Global"/>
		<meta http-equiv="Expires" content="0"/>
		<meta http-equiv="Revisit-After" content="365"/>
		<meta http-equiv="Keywords" content=""/>
		<meta http-equiv="Content-Language" content="en-us"/>
		<meta http-equiv="Robots" content="noindex,nofollow"/>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"/>
		<title>AssetTracker RC1 Installation</title>
		<link rel="shortcut icon" href="./images/favicon.ico">
		<style>
			html, body {background:url(./images/BG_Main.png) repeat;margin:0;padding:0;font-family:Tahoma,Arial,Helvetica;font-size:small;height:100%;}
			img {border: 0;}
			img.border {border:1px solid #333;margin:3px;}
			div.BGShell {min-width:100%;width:100%;margin:0 !important;height:100%;}
			div.shell {background:#fff;min-width:974px;max-width:974px;width:974px;margin:auto;margin-top:25px;margin-bottom:25px;min-height:90%;border:2px solid #222;padding:10px;}
			div.header{background:url('./images/logo.png') no-repeat;height:140px;width:934px;text-align:right;padding-right:40px;padding-top:50px;}
			h2{margin-bottom:8px;}
			div.footer{width:974px;color:#999;text-align:center;font-size:xx-small;border-top:1px dashed #eee;margin-top:8px;padding-top:8px;}
			TH {text-align:left;}
			TD,TH{vertical-align:top;border-top:1px dotted #ccc;padding:8px;}
			TD.note{color:#666;}
			TD.optional,TH.optional{color:#666;}
			DIV.alert{border:1px dashed maroon;padding:6px;color:maroon;margin-bottom:6px;}
			.noborder{border:0 !important;}
			TH.indent{padding-left:28px;}
			DIV.header{margin-bottom:15px;}
			DIV.header DIV.done,DIV.header DIV.notdone,DIV.header DIV.current{padding-left:20px;clear:both;float:right;width:210px;text-align:left;}
			DIV.header DIV.done{background:url('./images/accept.png') no-repeat;}
			DIV.header DIV.notdone{background:url('./images/exclamation.png') no-repeat;}
			DIV.header DIV.current{background:url('./images/add.png') no-repeat;background-color:#feffc0;color:#333;margin-top:2px;margin-bottom:2px;border:1px solid #ccc;}
		</style>
	</head>
	<body>
		<div class="BGShell">
			<div class="shell">