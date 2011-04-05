<cfcomponent name="ldap" displayname="LDAP" hint="The LDAP object is an interface to an LDAP or Active Directory system. It supports AD Binding, and provides funcitonality for querying Active Directory/LDAP from a program. With the exception of generic modifications, most editing of the LDAP system should be done by extending this component with another component, taking proper security measures into account.">

	<cfproperty name="_ini" displayname="Configuration INI File" hint="The absolute path of the LDAP configuration INI file." type="string" required="true" />
	<cfproperty name="_key" displayname="Encryption Key" hint="A temporary encryption key for obfuscating username and passwords." type="string" required="true" default="G3N3R1C_K3Y"/>
	<cfproperty name="_server" hint="The LDAP server." type="string" required="true" default="localhost">
	<cfproperty name="_port" hint="The LDAP server port." type="numeric" required="true" default="389">
	<cfproperty name="_basedn" hint="The base distinguished name to start any LDAP query from." type="string" required="true">
	<cfproperty name="_username" hint="The BIND ID for LDAP. This value is encrypted. (Required for Active Directory)" type="string">
	<cfproperty name="_password" hint="The BIND Password for LDAP. This value is encrypted. (Required for Active Directory)" type="string">

	<cffunction name="init" displayname="Initialize" hint="Initialize the object and assure connectivity to LDAP" access="public" output="false" returntype="void">
		<cfargument name="ini" displayName="Configuration File" type="string" hint="Absolute path of configuration file." default="#expandpath('./ldap.ini')#" required="false" />
		<cfscript>
			this._cfg.key = generateKey(100);
			this._cfg.bindid = generateKey(30); //This is a false variable used to throw off hackers who may gain access to a web service.
			this._cfg.pwdKey = generateKey(65); //This is a false variable used to throw off hackers who may gain access to a web service.
			this._cfg.ini = arguments.ini;
			readConfig();
		</cfscript>
		<cfif this._cfg.ssl>
			<cfldap action="QUERY"
				name="LDAP"
				attributes="cn"
				scope="subtree"
				start="#trim(this._cfg.basedn)#"
				filter="uid=system"
				server="#trim(this._cfg.server)#"
				port="#trim(this._cfg.port)#"
				username="#trim(decrypt(this._cfg.username,this._cfg.key))#"
				password="#trim(decrypt(this._cfg.password,this._cfg.key))#"
				secure="CFSSL_BASIC">
		<cfelse>
			<cfldap action="QUERY"
				name="LDAP"
				attributes="cn"
				scope="subtree"
				start="#trim(this._cfg.basedn)#"
				filter="uid=system"
				server="#trim(this._cfg.server)#"
				port="#trim(this._cfg.port)#"
				username="#trim(decrypt(this._cfg.username,this._cfg.key))#"
				password="#trim(decrypt(this._cfg.password,this._cfg.key))#">
		</cfif>

	</cffunction>

	<cffunction name="readConfig" hint="Generates the INI configuration and populates the object properties with the corresponding values (ex: server, port, username, password, etc)." returntype="void" access="private" output="false">
		<cfif not FileExists(this._cfg.ini)>
			<cfthrow message="Cannot find configuration file." detail="INI cannot be found.">
		</cfif>
		<cfscript>
			this._cfg.server = getProfileString(this._cfg.ini,"default","server");
			this._cfg.port = getProfileString(this._cfg.ini,"default","port");
			this._cfg.basedn = getProfileString(this._cfg.ini,"default","basedn");
			this._cfg.username = encrypt(getProfileString(this._cfg.ini,"default","username"),this._cfg.key);
			this._cfg.password = encrypt(getProfileString(this._cfg.ini,"default","password"),this._cfg.key);
			this._cfg.ssl = getProfileString(this._cfg.ini,"default","ssl");
			this._sec = getProfileSections(this._cfg.ini);
			if (StructKeyexists(this._sec,"admin")) {
				this._cfg.noreply = getProfileString(this._cfg.ini,"admin","noreply");
				this._cfg.noreplyname = getProfileString(this._cfg.ini,"admin","noreplyname");
				this._cfg.registersubject = getProfileString(this._cfg.ini,"admin","registersubject");
				this._cfg.admindn = getProfileString(this._cfg.ini,"admin","dn");
				this._cfg.verifyurl = getProfileString(this._cfg.ini,"admin","verifyurlroot");
			}
			StructDelete(this,"_sec");
		</cfscript>
	</cffunction>

	<cffunction name="query" access="public" displayname="Query" hint="Runs the specfied LDAP query." returntype="query" output="false">
		<cfargument name="qry" displayname="Query" hint="The LDAP query to run." required="true" type="string">
		<cfargument name="attr" displayname="Attributes" hint="The attributes to return." required="false" default="*" type="string">
		<cfargument name="scope" displayname="Scope" hint="The scope of the query." default="subtree" required="false" type="string">
		<cfargument name="basedn" displayname="Base DN" hint="The Base DN if other than root." default="#this._cfg.basedn#" required="false" type="string">
		<!--- Connects to ADAM and runs UID query --->
		<cfif this._cfg.ssl>
			<cfldap action="QUERY" secure="CFSSL_BASIC"
				name="qryLDAP"
				attributes="#arguments.attr#"
				scope="#arguments.scope#"
				start="#trim(arguments.basedn)#"
				filter="#trim(arguments.qry)#"
				server="#trim(this._cfg.server)#"
				port="#trim(this._cfg.port)#"
				username="#decrypt(this._cfg.username,this._cfg.key)#"
				password="#decrypt(this._cfg.password,this._cfg.key)#">
		<cfelse>
			<cfldap action="QUERY"
				name="qryLDAP"
				attributes="#arguments.attr#"
				scope="#arguments.scope#"
				start="#trim(arguments.basedn)#"
				filter="#trim(arguments.qry)#"
				server="#trim(this._cfg.server)#"
				port="#trim(this._cfg.port)#"
				username="#decrypt(this._cfg.username,this._cfg.key)#"
				password="#decrypt(this._cfg.password,this._cfg.key)#">
		</cfif>
		<cfreturn qryLDAP>
	</cffunction>

	<cffunction name="dedupeList" access="private" hint="Deduplicates a list." returntype="String" output="false">
		<cfargument name="ary" type="String" required="true">
		<cfargument name="del" type="String" required="false" default=",">
		<cfscript>
			var _in = ListToArray(arguments.ary,arguments.del);
			for (i=1; i lte arraylen(_in); i=i+1) {
				for (j=1; j lte arraylen(_in); j=j+1) {
					if (i neq j) {
						if (_in[i] is _in[j])
							ArrayDeleteAt(_in,i);
					}
				}
			}
			return ArrayToList(_in,arguments.del);
		</cfscript>
	</cffunction>

	<cffunction name="generateKey" access="public" returntype="string" output="false" hint="Returns a random key for encryption use in the LDAP session.">
		<cfargument name="numberofCharacters" type="numeric" default="8" hint="Number of characters to generate.">
		<cfscript>
		  var placeCharacter = "";
		  var currentPlace=0;
		  var group=0;
		  var subGroup=0;

		  for(currentPlace=1; currentPlace lte numberofCharacters; currentPlace = currentPlace+1) {
		    group = randRange(1,4);
		    switch(group) {
		      case "1":
		        subGroup = rand();
				switch(subGroup) {
			      case "0":
			        placeCharacter = placeCharacter & chr(randRange(33,46));
			        break;
			      case "1":
			        placeCharacter = placeCharacter & chr(randRange(58,64));
			        break;
			    }
		      case "2":
		        placeCharacter = placeCharacter & chr(randRange(97,122));
		        break;
		      case "3":
		        placeCharacter = placeCharacter & chr(randRange(65,90));
		        break;
		      case "4":
		        placeCharacter = placeCharacter & chr(randRange(48,57));
		        break;
		    }
		  }
		  return placeCharacter;
		</cfscript>
	</cffunction>

	<cffunction name="cleanText" access="private" returntype="string" hint="Cleans text by replacing special characters with the equivalent ASCII text hex (Hx) code.">
		<cfargument name="txt" hint="Text to clean" required="true" type="string">
		<cfargument name="type" required="false" default="TXT2LDAP" type="string" hint="Cleans text by converting from text to LDAP-safe code or vice versa. Options are TXT2LDAP (default) and LDAP2TXT">
		<cfscript>
			var i = 1;
			var list = ArrayNew(2);
			//Codes used from asciitable.com on 12/10/2007
			list[arraylen(list)+1][1] = ",";
			list[arraylen(list)][2] = "/2C";
			list[arraylen(list)+1][1] = ";";
			list[arraylen(list)][2] = "/3B";
			for (i=1; i lte ArrayLen(list); i = i+1) {
				if (arguments.type is "TXT2LDAP")
					arguments.txt = Replace(arguments.txt,list[i][1],list[i][2],"ALL");
				else
					arguments.txt = Replace(arguments.txt,list[i][2],list[i][1],"ALL");
			}
			return arguments.txt;
		</cfscript>
	</cffunction>

	<cffunction name="bind" access="public" returntype="boolean" hint="Uses a username (sAMAccountName or uid) and password to bind to the LDAP directory. This is most commonly used authenticate a user.">
		<cfargument name="usr" required="true" type="string" hint="Username, uid, or distinguishedName.">
		<cfargument name="pwd" required="true" type="string" hint="Password">
		<cfscript>
			var filter = "";
			var qryAuth = "";
			var dn = query("(&(distinguishedName=#arguments.usr#)(!(userAccountControl:1.2.840.113556.1.4.803:=2))(objectCategory=user))","distinguishedName","subtree",this._cfg.basedn);

			if (not dn.recordcount)
				dn = query("(&(sAMAccountName=#arguments.usr#)(!(userAccountControl:1.2.840.113556.1.4.803:=2))(objectCategory=user))","distinguishedName","subtree",this._cfg.basedn);
			if (not dn.recordcount)
				dn = query("(&(uid=#arguments.usr#)(!(userAccountControl:1.2.840.113556.1.4.803:=2))(objectCategory=user))","distinguishedName","subtree",this._cfg.basedn);
			if (not dn.recordcount)
				return false;

			dn = trim(dn.distinguishedName[1]);

			//Filter
			filter = "distinguishedName="&dn;
		</cfscript>
		<cftry>
			<cfif this._cfg.ssl>
				<cfldap action="QUERY"
					name="qryAuth"
					attributes="cn"
					filter="#filter#"
					sort="sn"
					start="#this._cfg.basedn#"
					port="#this._cfg.port#"
					server="#this._cfg.server#"
					username="#dn#"
					password="#arguments.pwd#"
					secure="CFSSL_BASIC">
			<cfelse>
				<cfldap action="QUERY"
					name="qryAuth"
					attributes="cn"
					filter="#filter#"
					sort="sn"
					start="#this._cfg.basedn#"
					port="#this._cfg.port#"
					server="#this._cfg.server#"
					username="#dn#"
					password="#arguments.pwd#">
			</cfif>
			<cfscript>
				if (qryAuth.recordcount)
					return true;
				return false;
			</cfscript>
			<cfcatch type="any">
				<cfreturn false />
			</cfcatch>
		</cftry>
	</cffunction>

</cfcomponent>