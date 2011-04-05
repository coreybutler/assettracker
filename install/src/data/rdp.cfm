<cfheader name="Content-Disposition" value="inline;filename=#url.comp#.rdp">
<cfcontent type="application/txt" reset="true">
EnableCredSSPSupport:i:0
username:s:<cfoutput>#listlast(getAuthUser(),'/')#</cfoutput>
domain:s:<cfoutput><cfif listlen(getAuthUser(),"\") gt 1>#listlen(getAuthUser(),"\")#<cfelse>#replace(replace(ucase(application.ldap._cfg.basedn),',','.','ALL'),'DC=','','ALL')#</cfif></cfoutput>
screen mode id:i:2
desktopwidth:i:1024
desktopheight:i:768
session bpp:i:32
winposstr:s:0,1,1809,244,2634,463
full address:s:<cfoutput>#url.comp#</cfoutput>
compression:i:1
keyboardhook:i:2
audiomode:i:0
redirectprinters:i:0
redirectcomports:i:0
redirectsmartcards:i:1
redirectclipboard:i:1
redirectposdevices:i:0
drivestoredirect:s:*
displayconnectionbar:i:1
autoreconnection enabled:i:1
authentication level:i:0
prompt for credentials:i:0
negotiate security layer:i:1
remoteapplicationmode:i:0
alternate shell:s:
shell working directory:s:
disable wallpaper:i:0
disable full window drag:i:1
allow desktop composition:i:0
allow font smoothing:i:0
disable menu anims:i:1
disable themes:i:0
disable cursor setting:i:0
bitmapcachepersistenable:i:1
gatewayhostname:s:
gatewayusagemethod:i:0
gatewaycredentialssource:i:4
gatewayprofileusagemethod:i:0
<cfabort>