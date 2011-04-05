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
	<cfsilent>
		<cfparam name="url.type" default="calendar"/>
		<cfparam name="url.notes" default="0"/>
		<cfscript>
			request.filename = "backup_"&url.type;
			if (url.notes)
				request.filename = request.filename & "_notes";
			request.filename = request.filename & ".pdf";
		</cfscript>
		<cffunction name="formatRecur" returntype="string">
			<cfargument name="val"/>
			<cfargument name="type"/>
			<cfscript>
				var a = arguments;
				var out = "";
				var i = 0;
				var d = "";

				//Handle days of week
				if (isNumeric(a.type)) {
					for (i=1;i lte len(trim(a.type));i++) {
						d = mid(trim(a.type),i,1);
						if (d eq 1)
							out = listappend(out,"Su");
						if (d eq 2)
							out = listappend(out,"M");
						if (d eq 3)
							out = listappend(out,"Tu");
						if (d eq 4)
							out = listappend(out,"W");
						if (d eq 5)
							out = listappend(out,"Th");
						if (d eq 6)
							out = listappend(out,"F");
						if (d eq 7)
							out = listappend(out,"Sa");
					}
					return out;
				}

				//Handle Other recurrance
				if (a.val eq 1) {
					out = "A";
					if (a.type is "h")
						out = out & "n";
				} else
					out = a.val;
				out = out & ' ' & formatTimePeriod(a.type,a.val neq 1);

				return out;
			</cfscript>
		</cffunction>
		<cffunction name="formatTimePeriod">
			<cfargument name="tm"/>
			<cfargument name="plural" type="boolean" default="false"/>
			<cfscript>
				var a = arguments;
				var str = "";

				switch (lcase(a.tm)) {
					case 'n':
						str = 'minute';
						break;
					case 'h':
						str = 'hour';
						break;
					case 'd':
						str = 'day';
						break;
					case 'w':
						str = 'week';
						break;
					case 'm':
						str = 'month';
						break;
					default:
						return 'Unknown';
						break;
				}
				if(a.plural)
					str = str & 's';
				return str;
			</cfscript>
		</cffunction>
		<cfquery name="qry" datasource="#application.dsn.chglog#">
			SELECT		sysid,recurtype,recur,durtype,dur,startdt,enddt,note
			FROM		bkp
			<cfif url.type is "calendar">
			ORDER BY	tm asc
			<cfelse>
			ORDER BY	sysid,recurtype,recur,durtype,dur,startdt,enddt
			</cfif>
		</cfquery>
		<cfif url.type is "calendar">
			<cffunction name="displayDay">
				<cfargument name="day"/>
				<cfargument name="time"/>
				<cfscript>
					var d = arguments.day;
					var t = arguments.time;
					var str = "";
					var i = 0;
					var j = "";

					//If no values exist for the time, return nothing.
					if (not StructKeyExists(d,t))
						return "";

					//Return jobs
					j = d[t].jobs;
					for(i=1;i lte arraylen(j);i++) {
						str = str & "<div class=""job";
						if (not isNumeric(j[i].recurtype))
							str = str & " highlight";
						str = str & """>";
						str = str & "<u><b>" & ucase(j[i].nm) & "</b></u><br/>";
						str = str & j[i].dur;
						if (url.format is "html" and url.notes)
							str = str & "<br/><a href=""javascript:alert('"&JSStringFormat(j[i].note)&"');"">Notes</a>";
						else if (url.notes)
							str = str & "<div class=""calendarnote"">"&j[i].note&"</div>";
						if (not isNumeric(j[i].recurtype))
							str = str & "<div class=""calendarnote"">"&formatRecur(j[i].recur,j[i].recurtype)&"</div>";
						str = str & "</div>";
					}
					return str;
				</cfscript>
			</cffunction>
			<cffunction name="countJobs">
				<cfargument name="day"/>
				<cfscript>
					var d = arguments.day;
					var a = StructKeyArray(d);
					var i = 0;
					var ct = 0;

					for (i=1;i lte arraylen(a);i++)
						ct = ct+arraylen(d[a[i]].jobs);
					return ct;
				</cfscript>
			</cffunction>
			<cfscript>
				day = StructNew();
				StructInsert(day,'su',StructNew());
				StructInsert(day,'m',StructNew());
				StructInsert(day,'tu',StructNew());
				StructInsert(day,'w',StructNew());
				StructInsert(day,'th',StructNew());
				StructInsert(day,'f',StructNew());
				StructInsert(day,'sa',StructNew());

				for(i=1;i lte qry.recordcount; i++) {
					tmp = StructNew();
					tmp.dur = qry.dur[i]&' '&formatTimePeriod(qry.durtype[i],qry.dur[i] neq 1);
					tmp.nm = listlast(listfirst(qry.sysid[i]),"=");
					tmp.note = qry.note[i];
					tmp.recur=qry.recur[i];
					tmp.recurtype=qry.recurtype[i];

					tm = timeformat(qry.startdt[i],'HH:mm');
					dy = left(lcase(dayofweekasstring(dayofweek(qry.startdt[i]))),2);

					if (listcontains('mo,we,fr',dy))
						dy = left(dy,1);
					if (not StructKeyExists(day[dy],tm)) {
						tmp2=StructNew();
						tmp2.time=timeformat(qry.startdt[i],'hh:mm tt');
						tmp2.jobs = arraynew(1);
						StructInsert(day[dy],tm,tmp2);
					}

					if (isNumeric(qry.recurtype[i])){
						freq = formatRecur(qry.recur[i],qry.recurtype[i]);
						if (listlen(freq)) {
							freq = listtoarray(freq);
							for (n=1;n lte arraylen(freq);n++) {
								if (not StructKeyExists(day[lcase(freq[n])],tm)) {
									tmp2=StructNew();
									tmp2.time=timeformat(qry.startdt[i],'hh:mm tt');
									tmp2.jobs = arraynew(1);
									StructInsert(day[lcase(freq[n])],tm,tmp2);
								}
								arrayappend(day[lcase(freq[n])][tm].jobs,tmp);
							}
						} else
							arrayappend(day[dy][tm].jobs,tmp);
					} else
						arrayappend(day[dy][tm].jobs,tmp);
				}
				//Get max count
				times="";
				x = structkeyarray(day);
				for(i=1;i lte arraylen(x);i++) {
					y = structkeyarray(day[x[i]]);
					for(n=1;n lte arraylen(y);n++) {
						if (not listcontainsnocase(times,y[n]))
							times = listappend(times,y[n]);
					}
				}
				times = listsort(times,"textnocase");
			</cfscript>
			<cfsavecontent variable="request.out">
				<link rel="stylesheet" href="../../style/report.css" type="text/css">
				<h2>Backup Schedule (Week View)</h2>
				<table class="monthview" cellspacing="1" width="880px">
					<tr>
						<th class="header"><i>Schedule</i></th>
						<th class="header">Sunday</th>
						<th class="header">Monday</th>
						<th class="header">Tuesday</th>
						<th class="header">Wednesday</th>
						<th class="header">Thursday</th>
						<th class="header">Friday</th>
						<th class="header">Saturday</th>
					</tr>
					<cfoutput>
					<tr>
						<th class="jobcount">Jobs</th>
						<th class="jobcount">#countJobs(day['su'])#</th>
						<th class="jobcount">#countJobs(day['m'])#</th>
						<th class="jobcount">#countJobs(day['tu'])#</th>
						<th class="jobcount">#countJobs(day['w'])#</th>
						<th class="jobcount">#countJobs(day['th'])#</th>
						<th class="jobcount">#countJobs(day['f'])#</th>
						<th class="jobcount">#countJobs(day['sa'])#</th>
					</tr>
					</cfoutput>
					<cfloop list="#times#" index="i">
					<cfoutput>
						<tr>
							<th class="time">#replace(timeformat(i,"hh:mm tt"),' ','&nbsp;','ALL')#</th>
							<td class="display">#displayDay(day['su'],i)#</td>
							<td class="display">#displayDay(day['m'],i)#</td>
							<td class="display">#displayDay(day['tu'],i)#</td>
							<td class="display">#displayDay(day['w'],i)#</td>
							<td class="display">#displayDay(day['th'],i)#</td>
							<td class="display">#displayDay(day['f'],i)#</td>
							<td class="display" width="125">#displayDay(day['sa'],i)#</td>
						</tr>
					</cfoutput>
					</cfloop>
				</table>
			</cfsavecontent>
		<cfelse>
			<cfsavecontent variable="request.out">
				<link rel="stylesheet" href="../../style/report.css" type="text/css">
				<h2>Backup Schedule List</h2>
				<table cellspacing="1" class="listview">
					<tr>
						<th class="header">Computer</th>
						<th class="header">Frequency</th>
						<th class="header">Time</th>
						<th class="header">Duration</th>
						<th class="header">Start/End</th>
						<cfif url.notes>
						<th class="header" style="text-align:left !important;">Notes</th>
						</cfif>
					</tr>
					<cfoutput query="qry">
					<tr>
						<td class="system">#listlast(listfirst(sysid),"=")#</td>
						<td>#formatRecur(recur,recurtype)#</td>
						<td>#timeformat(startdt,"hh:mm tt")#</td>
						<td>#dur# #formatTimePeriod(durtype,dur neq 1)#</td>
						<td>#DateFormat(startdt,"Mmm dd, yyyy")# <cfif len(trim(enddt))>#DateFormat(enddt,"Mmm dd, yyyy")# (#timeformat(enddt,"HH:mm tt")#)<cfelse>(Indefinite)</cfif></td>
						<cfif url.notes>
						<td class="notes" width="270">#trim(note)#</td>
						</cfif>
					</tr>
					</cfoutput>
				</table>
			</cfsavecontent>
		</cfif>
		<cfif not qry.recordcount><cfset request.out = "No backups registered."/></cfif>
	</cfsilent>

	<!--- Use the built in generator & its parameters --->
	<cfscript>
		//STANDARD PARAMETERS
		if (url.type is "calendar") {
			request.orientation = "landscape";
			request.margintop = ".5";
		}

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