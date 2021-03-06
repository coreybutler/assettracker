/*
 * Developed by Corey Butler, Chief Consultant
 * Copyright (c) 2010, Ecor Systems, LLC. All Rights Reserved.
 * Prepared by Ecor Group Consulting, an Ecor Systems Company.
 * 
 * This software is open source with attribution. It may not
 * be used or sold commercially for profit, but it may be used
 * within an enterprise or company for internal purposes. 
 * Please see the attached license.
 */

//INCLUDE APPROPRIATE MODULES
//Stock include function
function loadFile(filename){
	var filetype = filename.split(".");
	filetype = filetype[filetype.length-1].toLowerCase();
	if (filetype=="js"){ //if filename is a external JavaScript file
		var fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", filename);
	}
	else if (filetype=="css"){ //if filename is an external CSS file
		var fileref=document.createElement("link");
		fileref.setAttribute("rel", "stylesheet");
		fileref.setAttribute("type", "text/css");
		fileref.setAttribute("href", filename);
	}
	if (typeof fileref!="undefined")
		document.getElementsByTagName("head")[0].appendChild(fileref);
}

//Load the REQUIRED modules
loadFile("./style/main.css");
loadFile("./config/rb.js");
loadFile("./config/addons.js");
loadFile("./js/ux/TabCloseMenu.js");
loadFile("./js/ux/GridDragDropRowOrder.js");
loadFile("./js/ux/computer.js");
loadFile("./js/ux/reporting.js");
loadFile("./js/ux/dashboard.js");


//MAIN USER INTERFACE
Ext.onReady(function(){
	
	/*********PRELOAD ALL REQUIRED MODULES**********/
	var addons = [];
	var ux = [];
	addons.push('dashboard');
	
	//Load the OPTIONAL module files (eventually loaded as tabs)
	for (var _i=0;_i<modules.length;_i++) {
		if (modules[_i].active) {
			loadFile("./js/modules/"+modules[_i].module);
			addons.push(modules[_i].module.replace(/\.js/g,''));
			if (modules[_i].ux!=undefined) {
				var l = modules[_i].ux.split(',');
				for (var n=0;n<l.length;n++)
					if (!arraycontains(ux,l[n])) {
						loadFile("./js/ux/"+l[n]);
						ux.push(l[n]);
					}
			}
		}
	}
	//Load the OPTIONAL reports
	var _loadDefaultReportTemplate=false;
	for (var _i=0;_i<reports.length;_i++) {
		if (reports[_i].active) {
			if (reports[_i].ui!=undefined) {
				if (reports[_i].ux!=undefined) {
					var l = reports[_i].ux.split(',');
					for (var n=0;n<l.length;n++)
						if (!arraycontains(ux,l[n])) {
							loadFile("./js/ux/"+l[n]);
							ux.push(l[n]);
						}
				}
				loadFile("./js/modules/"+reports[_i].ui);
			} else
				_loadDefaultReportTemplate=true;
		}
	}
	if (_loadDefaultReportTemplate)
		loadFile("./js/modules/report_general.js");
	
	//Load the REQUIRED modules
	addons.push('reporting');
	
		
	/**************CORE APPLICATION**************/
	
	//Default Image (to prevent display issues)
	Ext.BLANK_IMAGE_URL='@EXTJS/resources/images/default/s.gif';
	
	//Quick Tips
	Ext.QuickTips.init();
	
	//Default location for alerts
	Ext.form.Field.prototype.msgTarget='under';
	
	//Ignore right clicking. Contextmenu listeners will override this.
	Ext.getBody().on('contextmenu', function(e){e.preventDefault();});
	
	//GLOBAL VARIABLES (shortcuts)
	var sysid = -1;
	var grid = Ext.grid.GridPanel;
	var ajax = Ext.Ajax;
	var confirm = Ext.Msg.confirm;
	var decode = Ext.decode;
	var encode = Ext.encode;
	var panel = Ext.Panel;
	var property = Ext.grid.GridEditor;
	var tp = Ext.TabPanel;
	var win = Ext.Window;
	var form = Ext.form.FormPanel;
	var record = Ext.data.Record;
	var rec = record;
	var toolbar = Ext.Toolbar;
	var store = Ext.data.SimpleStore;
	var tb = toolbar;
	var checkbox = Ext.form.Checkbox;
	var standard = 'padding:10px;font-family:Arial;font-size:x-small;';
	var mask = Ext.LoadMask;
	var ok = true;
	
	
	//INITIALIZE APPLICATION
	var cfg = {
		data:rb.data,
		load:new Ext.LoadMask(Ext.getBody(),{msg:rb.defaults.loadmessage}),
		save:new mask(Ext.getBody(),{msg:rb.defaults.savemessage})
	};
	var session = {};
	
	
	//DATA OBJECTS
	var storeComputers = new store({
		fields: ['dn','nm','dsc','dns','os','loc','logons','ossp','osver','oshfix','dns'],
		data: []
	});
	var comprec = new rec.create([
		{name:'dn',mapping:'dn'},
		{name:'nm',mapping:'nm'},
		{name:'dns',mapping:'dns'},
		{name:'dsc',mapping:'dsc'},
		{name:'dns',mapping:'dns'},
		{name:'os',mapping:'os'},
		{name:'loc',mapping:'loc'},
		{name:'logons',mapping:'logons'},
		{name:'ossp',mapping:'ossp'},
		{name:'osver',mapping:'osver'},
		{name:'oshfix',mapping:'oshfix'}
	]);
	var storeReports = new Ext.data.SimpleStore({
		fields: ['nm','dt'],
		data: []
	});
	var reportrec = new Ext.data.Record.create([
		{name:'nm',mapping:'nm'},
		{name:'dt',mapping:'dt'}
	]);
	var storeRecentChange = new Ext.data.SimpleStore({
		fields: ['id','dt','usr','act','ctg','sysid','nm'],
		data: []
	});
	var recentchangerec = new Ext.data.Record.create([
		{name:'id',mapping:'id'},
		{name:'dt',mapping:'dt'},
		{name:'usr',mapping:'usr'},
		{name:'act',mapping:'act'},
		{name:'ctg',mapping:'ctg'},
		{name:'sysid',mapping:'sysid'},
		{name:'nm',mapping:'nm'}
	]);
	var storeServerStatus = new Ext.data.SimpleStore({
		fields: ['sysid','type','nm','dns'],
		data: []
	});
	var serverstatusrec = new Ext.data.Record.create([
		{name:'sysid',mapping:'sysid'},
		{name:'type',mapping:'type'},
		{name:'nm',mapping:'nm'},
		{name:'dns',mapping:'dns'}
	]);
	
	//CUSTOM RENDERING UI OBJECTS
	function renderComputer(value,metaData,record,rowIndex,colIndex,store) {
		var tip = [];
		
		if (record.data.dns.trim().length>0)
			tip.push('<b>'+record.data.dns+'</b>');
		if (record.data.loc.trim().length>0)
			tip.push(record.data.loc);
		if (record.data.logons.toString().trim().length>0)
			tip.push(record.data.logons+' logons');
		if (record.data.osver.trim().length>0)
			tip.push('Version '+record.data.osver);
		if (record.data.ossp.trim().length>0)
			tip.push(record.data.ossp);
		if (record.data.oshfix.trim().length>0)
			tip.push(record.data.oshfix);
		if (tip.length>0) {
			var s = "";
			for(var i=0;i<tip.length;i++)
				s += tip[i]+'<br/>';
			metaData.attr='ext:qtip="'+s+'"';
		}
		
		var str = "<img src=\"./style/icons/";
		str += getOSIcon(record.data.os).replace(/\-/g,'_').replace(/_os_/g,'_');
		str += ".png\" align=\"left\" hspace=\"5\"/>";
		
		str += '<b>'+record.data.nm.toUpperCase()+'</b><br/>';
		if (record.data.dsc.length)
			str += "<i>"+record.data.dsc+"</i><br/>";
		str += "<font style=\"font-size:xx-small;color:#ccc;font-style:italic;\">"+record.data.os+"</font></td>";
		
		return String.format(str);
	}
	
	//ROOT UI OBJECTS
	var header = new tb({
		region:'north',
		height: 27,
		items: ['<img src="./style/icons/logo.png" style="margin-bottom:-2px;"/><b>'+rb.mainTitle+'</b>','->',{
			iconCls:'icon-ecor',
			text:'Powered by Ecor',
			handler: function() {window.open('http://www.ecorgroup.com');}
		},'-',{
			text:' &copy; 2010',
			handler: function() {window.open('http://www.ecorsystems.com');}
		}]
	});	
	
	var west = new grid({
		region:'west',
		width:225,
		title:rb.listTitle,
		collapsible:true,
		closable:false,
		store: storeComputers,
		colModel: new Ext.grid.ColumnModel({
			defaults:{sortable:true},
			columns:[
				{dataIndex:'dsc',renderer:renderComputer,hideable:false}
			]
		}),
		viewConfig: {forceFit:true},
		sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
		listeners:{
			rowdblclick:openTab,
			rowcontextmenu:function(grid,index,e) {
				var ctx = new Ext.menu.Menu({
					items:[{
						text:rb.opentabMenu+'('+grid.getStore().getAt(index).data.nm+')',
						iconCls:'icon-edit',
						handler: function(){
							openTabByDN(grid.getStore().getAt(index).data.dn);
						}
					}]
				});
				ctx.showAt(e.getXY());
			}
		}
	});
	
	var main = new tp({
		region:'center',
		border:false,
		defaults:{layout:'fit'},
		plain:true,
		activeTab:0,
		autoScroll:true,
		enableTabScroll:true,
		plugins: new Ext.ux.TabCloseMenu()
	});
	
	
	//MAIN LAYOUT
	new Ext.Viewport({
		layout: 'border',
		border: false,
		defaults: {split: true},
		items: [header,west,main],
		listeners: {
			render: authenticate
		}
	});
	
	
	
	//UNIQUE FUNCTIONS
	function authenticate() {
		if (session.username==undefined) {
			var authWin = new win({
				title:rb.authWindowTitle,
				iconCls:'icon-lock',
				width:400,
				height:160,
				layout:'fit',
				border:false,
				modal:true,
				closable:false,
				defaults:{bodyStyle:'padding:10px'},
				items:[new form({
					monitorValid:true,
					defaults:{xtype:'textfield',width:250},
					items:[{
						fieldLabel:rb.authLabelUser,
						allowBlank:false,
						name:'usr'
					},{
						fieldLabel:rb.authLabelPassword,
						allowBlank:false,
						inputType:'password',
						name:'pwd'
					}],
					listeners:{
						clientvalidation:function(fp,valid) {
							fp.ownerCt.getBottomToolbar().items.get(1).setDisabled(!valid);
						}
					}
				})],
				bbar: new tb({
					items:['->',{
						text:rb.authLabelButton,
						iconCls:'icon-login',
						disabled:true,
						handler: function() {
							var f = this.ownerCt.ownerCt.items.get(0).getForm().getFieldValues();
							var m = new Ext.LoadMask(authWin.getEl(),{msg:'...'});
							m.show();
							ajax.request({
								url:rb.data,
								params:{post:'login',data:encode(f)},
								success: function(rsp,obj) {
									var ok = decode(rsp.responseText).success;
									if (ok) {
										session.username=f.usr;
										init();
										authWin.close();
									} else {
										m.hide();
										Ext.Msg.alert(rb.authInvalidTitle,rb.authInvalidMessage);
									}
								}
							});
						}
					}]
				})
			});
			ajax.request({
				url:rb.data,
				params:{get:'user'},
				success:function(rsp,obj){
					var usr = decode(rsp.responseText).uid.trim();
					if (usr.length>2) {
						session.username=usr;
						init();
					} else
						authWin.show();
				}
			});
		} else
			init();
	}
	
	function init() {
		cfg.load.show();
		//Get the existing reports
		ajax.request({
			url:rb.data,
			params:{get:'reports'},
			success: function(rsp,obj) {
				var r = decode(rsp.responseText);
				var rpt = query2object(r.reports);
				
				//Populate existing reports
				for(var i=0;i<rpt.length;i++) {
					storeReports.add(new reportrec({
						nm:rpt[i].NAME,
						dt:rpt[i].DATELASTMODIFIED
					}));
				}
			}
		});
		//Get computer data
		ajax.request({
			url:cfg.data,
			params:{get:'init'},
			success: function(rsp,obj){
				var r = decode(rsp.responseText);
				
				//Populate recent change history
				var qhist = query2object(r.recentchanges);
				for (i=0;i<qhist.length;i++) {
					storeRecentChange.add(new recentchangerec({
						id:qhist[i].ID,
						dt:qhist[i].DT,
						usr:qhist[i].USR,
						act:qhist[i].ACT,
						ctg:qhist[i].CTG,
						sysid:qhist[i].SYSID,
						nm:qhist[i].SYSID.split(',')[0].split('=')[1]
					}));
				}
				
				//Populate Computer Data Store
				var qComp = query2object(r.computers);
				for (i=0;i<qComp.length;i++) {
					storeComputers.add(new comprec({
						dn:qComp[i].DISTINGUISHEDNAME,
						nm:qComp[i].DISTINGUISHEDNAME.split(",")[0].split("=")[1],
						dsc:qComp[i].DESCRIPTION,
						dns:qComp[i].DNSHOSTNAME,
						os:qComp[i].OPERATINGSYSTEM,
						ossp:qComp[i].OPERATINGSYSTEMSERVICEPACK,
						osver:qComp[i].OPERATINGSYSTEMVERSION,
						oshfix:qComp[i].OPERATINGSYSTEMHOTFIX,
						loc:qComp[i].LOCATION,
						logons:qComp[i].LOGONCOUNT
					}));
				}
				
				//Populate environment notices
				var e = r.environment;
				var idx = 0;
				for (i=0;i<e.length;i++) {
					if (e[i].TYPE.toLowerCase()=="orphan")
						tdns = null;
					else {
						idx = storeComputers.find('dn',e[i].SYSID);
						if (idx>=0)
							tdns = storeComputers.getAt(idx).data.dns;
						else
							tdns = e[i].SYSID.split(",")[0].split("=")[1];
					}
					storeServerStatus.add(new serverstatusrec({
						nm:e[i].SYSID.split(",")[0].split("=")[1],
						sysid:e[i].SYSID,
						type:e[i].TYPE,
						dns:tdns
					}));
				}
				
				//Add additional modules
				for(i=0;i<addons.length;i++)
					main.add(eval("new "+addons[i]+"()"));
				if (addons.length>0)
					main.doLayout();
				main.setActiveTab(0);
					
				//Hide the loading mask
				cfg.load.hide();
			}
		});
	}
	
	function openTabByDN(dn) {
		openTab(null,storeComputers.find('dn',dn));
	}
	
	function openTab(grid,index,event) {
		var d = storeComputers.getAt(index).data;
		var p = true;
		
		//Make sure the tab isn't already open
		for (i=0;i<main.items.length;i++) {
			if('tab_'+d.dn==main.items.get(i).id) {
				p = false;
				main.setActiveTab('tab_'+d.dn);
				break;
			}
		}
		
		//If the tab doesn't exist, create it
		main.add(new computer({
			title:d.nm,
			html:'test',
			id:'tab_'+d.dn,
			iconCls:getOSIcon(d.os),
			tabTip:d.dsc,
			data:d,
			username:session.username
		}));
		main.setActiveTab('tab_'+d.dn);
	}
	
	function getOSIcon(os) {
		var sys = os.trim().toLowerCase();
		if (sys.indexOf('mac')>=0)
			return "icon-os-mac";
		else if (sys.indexOf('samba')>=0||sys.indexOf('nix')>=0||sys.indexOf('debian')>=0||sys.indexOf('cent')>=0||sys.indexOf('ubuntu')>=0)
			return "icon-os-unix";
		else if (sys.indexOf('windows')>=0)
			return "icon-os-win";
		else {
			return "icon-os-server";
		}
	}
	
	//COMMON FUNCTIONS
	function newID() {
		sysid++;
		return sysid;
	}
	
	function query2object(q) {
		var a = new Array();
		for (var n=0;n<q.DATA.length;n++) {
			var row = {};
			for (i=0;i<q.COLUMNS.length;i++) {
				row[q.COLUMNS[i]]=q.DATA[n][i];
			}
			a.push(row);
		}
		return a;
	}
	
	function cleanHTML(str) {
		return str.replace(/\&gt\;/g,'>').replace(/\&lt\;/g,'<').replace(/\&nbsp\;/g,' ').replace(/\&amp\;amp\;/g,'&').replace(/\&amp\;/g,'&').replace(/\&apos\;/g,'\'');		
	}
	
	function capitalize(w) {
		var l = w.split(" ");
		var out = "";
		var wd = "";
		for (var i=0;i<l.length;i++) {
			wd = l[i].substring(0,1).toUpperCase()+l[i].substring(1,l[i].length);
			out = out+" "+wd;
		}
		return out.trim();
	}
	
	function listcontains(sub,list) {
		var a = list.split(",");
		for(var i=0;i<a.length;i++) {
			if (a[i]==sub)
				return true;
		}
		return false;
	}
	
	function getUsername(){
		return session.username;
	}
	
	function launchRemote(id) {
		document.location=rb.rdpurl+id
	}
	
	function cleanHTMLEditorContent(content) {
		content = content.replace(/\<br\>/g,'<br/>');
		if (content.substr(content.length-5,5)=='<br/>')
			content = content.substr(0,content.length-5);
		return content;
	}
	
	function getDateString(fmt) {
		dt = new Date();
		return dt.format(fmt).toString();
	}
	
	function arraycontains(array,item) {
		var str = ','+array.toString()+','; 
		return (str.indexOf(','+item+',')>=0);
	}
	
	function getTimePeriodText(period,plural) {
		var str = '';
		
		if (plural==undefined||plural==null)
			plural=false;

		if (!isNaN(parseFloat(period))) {
			var dowstr = period.toString().trim();
			var dow = [];
			var d = "";
			for(var i=0;i<dowstr.length;i++) {
				d = dowstr.substr(i,1);
				if (d==1)
					dow.push('Su');
				if (d==2)
					dow.push('M');
				if (d==3)
					dow.push('Tu');
				if (d==4)
					dow.push('W');
				if (d==5)
					dow.push('Th');
				if (d==6)
					dow.push('F');
				if (d==7)
					dow.push('Sa');
			}
			return dow.toString();
		} else {		
			switch (period) {
				case 'n':
					str += 'minute';
					break;
				case 'h':
					str += 'hour';
					break;
				case 'd':
					str += 'day';
					break;
				case 'w':
					str += 'week';
					break;
				case 'm':
					str += 'month';
					break;
				default:
					return 'Unknown';
					break;
			}		
			if(plural)
				return str+='s';
		}
		return str;
	}
	
	//Make some objects universally accessible
	Ext.getUsername = getUsername;
	Ext.query2object = query2object;
	Ext.listcontains = listcontains;
	Ext.capitalize = capitalize;
	Ext.cleanHTML = cleanHTML;
	Ext.cleanHTMLEditorContent = cleanHTMLEditorContent;
	Ext.newID = newID;
	Ext.launchRemote = launchRemote;
	Ext.savemask = new Ext.LoadMask(Ext.getBody(),{msg:rb.defaults.savemessage});
	Ext.loadmask = new Ext.LoadMask(Ext.getBody(),{msg:rb.defaults.loadmessage});
	Ext.standardBodyStyle = standard;
	Ext.getDateString = getDateString;
	Ext.arraycontains = arraycontains;
	Ext.storeComputers = storeComputers;
	Ext.storeReports = storeReports;
	Ext.reportrec = reportrec;
	Ext.getTimePeriodText = getTimePeriodText;
	Ext.savemessage = cfg.save;
	Ext.recentchangerec = recentchangerec;
	Ext.storeRecentChange = storeRecentChange;
	Ext.openComputer = openTab;
	Ext.storeServerStatus = storeServerStatus;
	Ext.serverstatusrec = serverstatusrec;
	Ext.openComputerByDN = openTabByDN;
});