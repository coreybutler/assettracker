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
 
/********REPORTING SYSTEM***********/
//Resource Bundle/Language Packs
xrb.reporting = {
	title:					'Reports',
	overview:				'<b>Create a new report below or download an existing one from the archive.</b>',
	existingTitle:			'Archive',
	existingInstruction:	'<font class="help" style="font-weight:none !important;">Double click a report to download it.</font>',
	headerName:				'Report',
	headerDate:				'Generated',
	removeMenu:				'Remove Report',
	removeMenuAll:			'<b>Remove ALL</b>',
	promptFileRmvTitle:		'Remove Saved Report',
	promptFileRmvText:		'You are about to delete a report. This cannot be undone. Are you sure you want to do this?',
	promptFileRmvAllTitle:	'REMOVE ALL REPORTS!!!',
	promptFileRmvAllText:	'You are about to remove all recently created reports. This cannot be undone. Are you sure you want to remove all of the saved reports?',
	download:				'./data/download.cfm?type=report&file=',
	data:					rb.data							//Uses default URL from parent
};

xrb.reportdefault={
	generate:			'Run Report',
	generateSave:		'Run & Archive',
	fileName:			'general.pdf',
	fileNameField:		'Save As'
};


//Extension
reporting = function(config) {
	
	/****************** DATA *******************/
	//All data supplied by core application.	
	
	/************* GLOBAL VARS *****************/
	var loadmask;
	
	var current = new Ext.grid.GridPanel({
		region:'east',
		title:xrb.reporting.existingTitle,
		width:"30%",
		store: Ext.storeReports,
		iconCls:'icon-archive-reports',
		colModel: new Ext.grid.ColumnModel({
			defaults:{sortable:true},
			columns:[
				new Ext.grid.RowNumberer(),
				{header:xrb.reporting.headerName,dataIndex:'nm'},
				{header:xrb.reporting.headerDate,dataIndex:'dt',width:95,fixed:true,renderer:Ext.util.Format.dateRenderer('Y-m-d')}
			]
		}),
		viewConfig: {forceFit:true},
		sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
		tbar:new Ext.Toolbar({
			items:[xrb.reporting.existingInstruction]
		}),
		bbar:new Ext.Toolbar({
			items:[{
				text:xrb.reporting.removeMenu,
				iconCls:'icon-remove',
				disabled:true,
				handler: function() {
					var gr = current.getSelectionModel().getSelected();
					Ext.Msg.show({
						title:xrb.reporting.promptFileRmvTitle,
						msg: xrb.reporting.promptFileRmvText,
						fn: function(btn){
							if (btn=='yes') {
								Ext.Ajax.request({
									url:rb.data,
									params:{post:'removereport',id:gr.data.nm},
									success:function(rsp,obj) {
										Ext.storeReports.remove(gr);
									}
								});
							}
						},
						icon:Ext.MessageBox.QUESTION,
						buttons:Ext.Msg.YESNO
					});
				}
			},'-',{
				text:xrb.reporting.removeMenuAll,
				iconCls:'icon-remove',
				disabled:true,
				handler: function() {
					var gr = current.getSelectionModel().getSelected();
					Ext.Msg.show({
						title:xrb.reporting.promptFileRmvAllTitle,
						msg: xrb.reporting.promptFileRmvAllText,
						fn: function(btn){
							if (btn=='yes') {
								Ext.Ajax.request({
									url:rb.data,
									params:{post:'removereportall'},
									success:function(rsp,obj) {
										Ext.storeReports.removeAll();
										current.getBottomToolbar().items.get(0).disable();
										current.getBottomToolbar().items.get(2).disable();
									}
								});
							}
						},
						icon:Ext.MessageBox.WARNING,
						buttons:Ext.Msg.YESNO
					});
				}
			}]
		}),
		listeners:{
			rowclick:function(grid,rindex,e){
				grid.getBottomToolbar().items.get(0).enable();
			},
			rowdblclick:function(grid,rindex,e){
				grid.getBottomToolbar().items.get(0).enable();
				document.location=xrb.reporting.download+grid.getStore().getAt(rindex).data.nm;
			},
			rowcontextmenu:function(grid,rindex,e) {
				var gr = grid.getStore().getAt(rindex);
				var ctx = new Ext.menu.Menu({
					items:[{
						text:xrb.reporting.removeMenu,
						iconCls:'icon-remove',
						handler: function() {
							Ext.Msg.show({
								title:xrb.reporting.promptFileRmvTitle,
								msg: xrb.reporting.promptFileRmvText,
								fn: function(btn){
									if (btn=='yes') {
										Ext.Ajax.request({
											url:rb.data,
											params:{post:'removereport',id:gr.data.nm},
											success:function(rsp,obj) {
												grid.getStore().remove(gr);
												grid.getBottomToolbar().items.get(0).disable();
											}
										});
									}
								},
								icon:Ext.MessageBox.QUESTION,
								buttons:Ext.Msg.YESNO
							});
						}
					}]
				});
				ctx.showAt(e.getXY());
			}
		}
	});
	
	var list = new Ext.Panel({
		region:'center',
		border:false,
		autoScroll:true,
		layout:'anchor',
		defaults:{bodyStyle:'font-family:Tahoma,Arial;font-size:small;'},
		items:[{
			border:false,
			height:0,
			layout:'anchor'
		}]
	});
	
	var main = new Ext.Panel({
		layout:'border',
		border:false,
		bodyStyle:'background:#fff;',
		defaults:{split:true},
		plain:true,
		items:[list,current]
	});
	
	
	/************* CONFIG *****************/
	Ext.apply(this, {
		title:xrb.reporting.title,
		layout:'fit',
		closable:false,
		border:true,
		iconCls:'icon-report',
		bodyStyle:'padding:15px;',
		items:[main],
		tbar: new Ext.Toolbar({
			items:[{
				xtype:'tbtext',
				text:xrb.reporting.overview
			}]
		})
	});

	reporting.superclass.constructor.apply(this, arguments);
	this.on('render', loadTool, this);
	
	
	/************* CORE FUNCTIONS *****************/
	function loadTool() {
		loadmask = new Ext.LoadMask(this.getEl(),{msg:rb.defaults.loadmessage})
		var m = loadmask;
		
		//Mask the load process
		m.show();
		
		//Add all reports to interface
		for (var i=0;i<reports.length;i++) {
			if (reports[i].active) {
				if (reports[i].ui!==undefined)
					list.add(eval("new "+reports[i].ui.replace(/\.js/g,'')+"({action:reports[i].action,title:reports[i].title,description:reports[i].description})"));
				else
					list.add(new report_general({title:reports[i].title,action:reports[i].action,description:reports[i].description}));
				list.add({border:false,height:8,header:false});
			}
		}
		list.doLayout();
		
		if (Ext.storeReports.getCount()>0)
			current.getBottomToolbar().items.get(2).enable();
			
		m.hide();				
	}
		
	
	function getSystemID() {
		return main.ownerCt.id;
	}
	
	function saveReport(name) {
		var s = Ext.storeReports;
		var i = s.find('nm',name);
		if (i<0) {
			s.add(new Ext.reportrec({
				nm:name,
				dt:new Date()
			}));
		} else {
			current.getSelectionModel().selectRow(i);
			s.getAt(i).set('dt',new Date());
			s.commitChanges();
		}
		current.getBottomToolbar().items.get(2).enable();
	}
	
	function executeReport(file,name,save) {
		if (file==undefined) {
			Ext.Msg.show({
				title:rb.reportNotFoundTitle,
				msg:rb.reportNotFoundText,
				icon:Ext.MessageBox.WARNING
			});
			return;
		}
		if (name==undefined||name==null)
			name="Unknown";
		if (save!=true)
			save = false;
		if (file.indexOf('?')<0)
			file += "?";
		else
			file += "&";
		file.replace(/\?\&/g,'');
		document.location=file+'save='+save.toString()+'&file='+name;
		
		//Add report to recently saved reports if it is saved
		if (save)
			saveReport(name);
	}
	
	/********EXTEND GLOBAL FUNCTIONALITY*********/
	Ext.reporting = {
		executeReport:executeReport
	};
	
};
Ext.extend(reporting, Ext.Panel, {});