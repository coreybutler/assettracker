/********UPDATE TRACKER***********/
//Resource Bundle/Language Pack
xrb.updatetracker = {
	title:				'OS Update Checklist',
	noticeTitle:		'Outdated Systems',
	headerSystem:		'Computer Name',
	headerDate:			'Last Update',
	headerOS:			'Operating System',
	headerOSHotfix:		'Latest Hotfix',
	headerOSVersion:	'OS Version',
	headerOSServicePk:	'Service Pack',
	headerUpdate:		'Action',
	prefHeaderSystem:	'Computer Name',
	prefHeaderUpdate:	'Actions',
	prefTitle:			'Ordered Personal Shortcuts',
	prefTooltip:		'<font class="help">Drag computer to reorder.</font>',
	prefNoteTitle:		'Update Notes',
	savePrefButton:		'Save Order',
	editNoteButton:		'Edit',
	linkUpdate:			'Update',
	linkLaunch:			'RDP',
	outdatedCount:		'outdated systems',
	updateAllButton:	'Mark <b>all</b> as updated',
	doubleClick:		'<font class="help"><u>Click Update</u> to mark updated systems. <u>Double click</u> a row to edit computer details.</font>',
	data:				rb.data							//Uses default URL from parent
};


//Extension
updatetracker = function(config) {
	
	/****************** DATA *******************/
	var storeComputers = new Ext.data.SimpleStore({
		fields: ['id','nm','os','dt','dsc','overdue','ossp','osver','oshf'],
		data: []
	});
	var comprec = new Ext.data.Record.create([
		{name:'id',mapping:'id'},
		{name:'nm',mapping:'nm'},
		{name:'os',mapping:'os'},
		{name:'ossp',mapping:'ossp'},
		{name:'osver',mapping:'osver'},
		{name:'oshf',mapping:'oshf'},
		{name:'dt',mapping:'dt',type:'date'},
		{name:'dsc',mapping:'dsc'},
		{name:'dns',mapping:'dns'},
		{name:'overdue',mapping:'overdue'}
	]);
	var storePref = new Ext.data.SimpleStore({
		fields: ['id','nm','overdue',],
		data: []
	});
	var prefrec = new Ext.data.Record.create([
		{name:'id',mapping:'id'},
		{name:'nm',mapping:'nm'},
		{name:'overdue',mapping:'overdue'},
		{name:'dns',mapping:'dns'}
	]);
	var storeOverdue = new Ext.data.SimpleStore({
		fields: ['id'],
		data: []
	});
	var odrec = new Ext.data.Record.create([
		{name:'id',mapping:'id'}
	]);
	
	
	
	/************* GLOBAL VARS *****************/
	var list = new Ext.grid.GridPanel({
		region:'center',
		header:false,
		closable:false,
		store: storeComputers,
		colModel: new Ext.grid.ColumnModel({
			defaults:{sortable:true},
			columns:[
				new Ext.grid.RowNumberer(),
				{header:xrb.updatetracker.headerDate,dataIndex:'dt',width:95,fixed:true,renderer:Ext.util.Format.dateRenderer('Y-m-d')},
				{header:xrb.updatetracker.headerUpdate,dataIndex:'id',renderer:updateButton,width:75,fixed:true},
				{header:xrb.updatetracker.headerSystem,dataIndex:'nm',renderer:displayName},
				{header:xrb.updatetracker.headerOS,dataIndex:'os'},
				{header:xrb.updatetracker.headerOSVersion,dataIndex:'osver',width:65},
				{header:xrb.updatetracker.headerOSServicePk,dataIndex:'ossp',width:65}
				//,{header:xrb.updatetracker.headerOSHotfix,dataIndex:'oshf'}
			]
		}),
		viewConfig: {forceFit:true},
		sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
		tbar:new Ext.Toolbar({
			items:[{
				text:'',
				iconCls:'icon-old',
				disabled:true,
				hidden:true
			},'-',{
				text:xrb.updatetracker.updateAllButton,
				iconCls:'icon-todo',
				handler:function(){
					list.getTopToolbar().items.get(2).disable();
					Ext.Ajax.request({
						url:xrb.updatetracker.data,
						params:{post:'updatelogall'},
						success:function(rsp,obj){
							var s = storeComputers;
							for (var i=0;i<s.getCount();i++) {
								r=s.getAt(i);
								r.set('dt',new Date());
								r.set('overdue',false);
							}
							s.commitChanges();
							s = storePref;
							for (var i=0;i<s.getCount();i++) {
								r=s.getAt(i);
								r.set('dt',new Date());
								r.set('overdue',false);
							}
							s.commitChanges();
							list.getTopToolbar().items.get(0).setVisible(false);
							list.getTopToolbar().items.get(1).setVisible(false);
							list.getTopToolbar().items.get(2).setVisible(false);
						},
						failure:function(){
							list.getTopToolbar().items.get(2).enable();
						}
					});
				}
			},'->',{xtype:'tbtext',text:xrb.updatetracker.doubleClick}]
		}),
		listeners: {
			rowdblclick:function(grid,rindex,e){
				var g = main.ownerCt.ownerCt.ownerCt.items.get(1);
				var r = grid.getStore().getAt(rindex);
				var i = g.getStore().find('dn',r.data.id);
				var d = g.getStore().getAt(i);
				
				g.fireEvent('rowclick',d,i);
				g.fireEvent('rowdblclick',d,i);
			},
			rowclick:function(grid,rindex,e) {
				var id = grid.getStore().getAt(rindex).data.id;
				var alt = preflist;
				alt.getSelectionModel().selectRow(alt.getStore().find('id',id));
				alt.getView().focusRow(alt.getStore().find('id',id));
			}
		}
	});
	
	var preflist = new Ext.grid.GridPanel({
		region:'center',
		layout:'fit',
		header:false,
		closable:false,
		store: storePref,
		enableDragDrop:true,
		ddGroup:'updateprefs',
		colModel: new Ext.grid.ColumnModel({
			defaults:{sortable:true},
			columns:[
				{header:xrb.updatetracker.prefHeaderSystem,dataIndex:'nm',renderer:displayNamePref},
				{header:xrb.updatetracker.prefHeaderUpdate,dataIndex:'id',renderer:actionButton,width:105,sortable:false}
			]
		}),
		view: new Ext.grid.GridView({
			forceFit:true,
			listeners: {
				rowsinserted:function(view,firstrow,record){
					preflist.getTopToolbar().items.get(0).enable();
				}
			}
		}),
		sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
		tbar:new Ext.Toolbar({
			items:[{
				text:xrb.updatetracker.savePrefButton,
				disabled:true,
				iconCls:'icon-save',
				handler:function(){
					var f = [];
					var d = "";
					for (var i=0;i<storePref.getCount();i++) {
						d = storePref.getAt(i).data;
						f.push({
							order:i+1,
							dn:d.id
						});
					}
					Ext.Ajax.request({
						url:xrb.updatetracker.data,
						params:{post:'shortcuts',data:Ext.encode(f),user:Ext.getUsername()},
						success:function(rsp,obj) {
							preflist.getTopToolbar().items.get(0).setDisabled(true);
						}
					});
				}
			},'->',{
				text:xrb.updatetracker.prefTooltip,
				xtype:'tbtext'
			}]
		}),
		plugins:[new Ext.ux.dd.GridDragDropRowOrder({scrollable:true})],
		listeners: {
			render:function(grid){
				grid.getView().suspendEvents(false);
			},
			rowclick:function(grid,rindex,e) {
				var id = grid.getStore().getAt(rindex).data.id;
				var alt = list;
				alt.getSelectionModel().selectRow(alt.getStore().find('id',id));
				alt.getView().focusRow(alt.getStore().find('id',id));
			},
			rowdblclick:function(grid,rindex,e){
				Ext.launchRemote(grid.getStore().getAt(rindex).data.dns);
			}
		}
	});
	
	var prefnotes = new Ext.Panel({
		region:'south',
		height:250,
		border:true,
		layout:'fit',
		autoScroll:true,
		bodyStyle:'padding:10px;font-size:small;',
		defaults:{border:false,header:false},
		items:[],
		tbar:new Ext.Toolbar({
			items:[{
				text:'<b>'+xrb.updatetracker.prefNoteTitle+'</b>',
				xtype:'tbtext'
			},'->',{
				text:xrb.updatetracker.editNoteButton,
				iconCls:'icon-edit',
				handler: function() {
					var e = new Ext.Window({
						title:xrb.updatetracker.prefNoteTitle,
						boder:false,
						modal:true,
						width:600,
						height:400,
						layout:'fit',
						items:[new Ext.form.HtmlEditor({
							autoScroll:true,
							name:'note',
							value:prefnotes.items.get(0)==undefined?'':prefnotes.items.get(0).initialConfig.html
						})],
						bbar:new Ext.Toolbar({
							items:['->',{
								text:rb.saveNoteButton,
								iconCls:'icon-save',
								handler:function() {
									var note = this.ownerCt.ownerCt.items.get(0).getValue();
									note = Ext.cleanHTMLEditorContent(note);
									Ext.Ajax.request({
										url:rb.data,
										params:{post:'updatenote',note:Ext.encode(note),user:Ext.getUsername()},
										success: function(rsp,obj){
											var n = prefnotes;
											n.removeAll();
											n.add({html:note,autoScroll:true});
											n.doLayout();
											e.close();
										}
									});
								}
							}]
						})
					});
					e.show();
				}
			}]
		})
	});
	
	var pref = new Ext.Panel({
		region:'east',
		width:300,
		collapsible:true,
		collapsed:false,
		layout:'fit',
		title:xrb.updatetracker.prefTitle,
		items:[{
			layout:'border',
			border:false,
			defaults:{split:true,border:false},
			items:[preflist,prefnotes]
		}],
		listeners:{
			expand: function(panel) {
				var v = preflist.getView(); 
				v.resumeEvents();
				if (preflist.getSelectionModel().getSelected()!=undefined)
					v.focusRow(preflist.getStore().find('id',preflist.getSelectionModel().getSelected().data.id));
			}
		}
	});	
	
	
	var main = new Ext.Panel({
		layout:'border',
		border:false,
		defaults:{split:true,layout:'fit'},
		items:[list,pref]
	});
	
	
	/************* CONFIG *****************/
	Ext.apply(this, {
		title:xrb.updatetracker.title,
		layout:'fit',
		closable:false,
		border:false,
		iconCls:'icon-computer',
		items:[main]
	});

	updatetracker.superclass.constructor.apply(this, arguments);
	this.on('render', loadTool, this);
	
	
	/************* CORE FUNCTIONS *****************/
	function loadTool() {
		Ext.loadmask.show();
		Ext.Ajax.request({
			url:rb.data,
			params:{get:'updatelog',user:Ext.getUsername()},
			success: function(rsp,obj) {
				var r = Ext.decode(rsp.responseText);
				var sys = Ext.query2object(r.log.SYSTEMS);
				var log = Ext.query2object(r.log.LOG);
				var prf = Ext.query2object(r.shortcuts);
				var od = 0;
				//var old = "";
				
				//Collapse Shortcuts
				pref.collapse();
				
				//Update notes
				prefnotes.add({html:r.notes,bodyStyle:'font-family:Tahoma,Arial;font-size:small;'});
				prefnotes.doLayout();
				
				//Populate Preferences
				for(var i=0;i<prf.length;i++) {
					var d = prf[i];
					var nm = d.SYSID.split(",");
					nm = nm[0].split("=")[1];
					storePref.add(new prefrec({
						id:d.SYSID,
						nm:nm,
						dns:'',
						overdue:false
					}));
				}
				
				//Populate System List
				for(var i=0;i<sys.length;i++) {
					var d = sys[i];
					var nm = d.DISTINGUISHEDNAME.split(",");
					nm = nm[0].split("=")[1];
					storeComputers.add(new comprec({
						id:d.DISTINGUISHEDNAME,
						nm:nm,
						os:d.OPERATINGSYSTEM,
						ossp:d.OPERATINGSYSTEMSERVICEPACK,
						oshf:d.OPERATINGSYSTEMHOTFIX,
						osver:d.OPERATINGSYSTEMVERSION,
						dt:null,
						dsc:d.DESCRIPTION,
						dns:d.DNSHOSTNAME,
						overdue:false
					}));
				}
				//Update with logs
				for(var i=0;i<log.length;i++) {
					var d = log[i];
					var recno = storeComputers.find('id',d.SYSID);
					var rec = storeComputers.getAt(recno);

					if (d.DT.toString().trim().length==0) {
						rec.set('dt',new Date('1/1/1600'));
						rec.set('overdue',true);
					} else {
						rec.set('dt',d.DT);
						rec.set('overdue',d.EXPIRED);
					}					
				}
				//Account for non-existant records (i.e. no updates registered)
				for(var i=0;i<storeComputers.getCount();i++) {
					var rec = storeComputers.getAt(i);
					if (rec.data.dt==null) {
						rec.set('dt',new Date('1/1/1600'));
						rec.set('overdue',true);
					}
					var idx = storePref.find('id',rec.data.id);
					if (idx>=0) {
						storePref.getAt(idx).set('overdue',rec.data.overdue);
						storePref.getAt(idx).set('dns',rec.data.dns);
					} else {
						storePref.add(new prefrec({
							id:rec.data.id,
							nm:rec.data.nm,
							dns:rec.data.dns,
							overdue:rec.data.overdue
						}));
					}
					if (rec.data.overdue)
						od++;
				}
				storePref.commitChanges();
				storeComputers.commitChanges();
				storeComputers.setDefaultSort('dt','DESC');
				
				if (od>0)
					list.getTopToolbar().items.get(0).setText('<b>'+od+' '+xrb.updatetracker.outdatedCount)+'</b>';
				list.getTopToolbar().items.get(0).setVisible(od>0);
				list.getTopToolbar().items.get(1).setVisible(od>0);
				list.getTopToolbar().items.get(2).setVisible(od>0);
				
				
				//Hide the loading mask
				Ext.loadmask.hide();
			}
		});
	}
	
	function updateButton(value,metaData,record,rowIndex,colIndex,store) {
		var str = "<input type=\"button\" value=\""+xrb.updatetracker.linkUpdate+"\" class=\"update\" onClick=\"javascript:Ext.update('"+record.data.id+"');\"/>";		
		return String.format(str);
	}
	
	function actionButton(value,metaData,record,rowIndex,colIndex,store) {
		var str = "<input type=\"button\" value=\""+xrb.updatetracker.linkLaunch+"\" class=\"launch\" onClick=\"javascript:Ext.launchRemote('"+record.data.dns+"');\" style=\"padding-right:10px;border-right:1px dotted #999;\"/>";
		str += "<input type=\"button\" value=\""+xrb.updatetracker.linkUpdate+"\" class=\"update\" onClick=\"javascript:Ext.update('"+record.data.id+"');\"/>";		
		return String.format(str);
	}
	
	function update(dn) {
		Ext.Ajax.request({
			url:xrb.updatetracker.data,
			params:{post:'updatelog',id:dn},
			success:function(rsp,obj) {}
		});
		var rec = storeComputers.getAt(storeComputers.find('id',dn));
		var rec2 = storePref.getAt(storePref.find('id',dn));
		rec2.set('overdue',false);
		rec.set('overdue',false);
		rec.set('dt',new Date());
	}
	
	function displayName(value,metaData,record,rowIndex,colIndex,store) {
		var str = "<div class=\"update";
		if (record.data.overdue)
			str += " overdue";
		str += "\"><h4>"+record.data.nm+"</h4>"+record.data.dsc+"</div>";		
		return String.format(str);
	}
	
	function displayNamePref(value,metaData,record,rowIndex,colIndex,store) {
		var str = "<div class=\"update";
		if (record.data.overdue)
			str += " overdue";
		str += "\" style=\"color:#333;font-style:italic;height:16px;\"><h4>"+record.data.nm+"</h4></div>";		
		return String.format(str);
	}
	
	function getSystemID() {
		return main.ownerCt.id.replace(/tab\_/g,'');
	}
	
	/********EXTEND GLOBAL FUNCTIONALITY*********/
	Ext.update = update;
	
};
Ext.extend(updatetracker, Ext.Panel, {});