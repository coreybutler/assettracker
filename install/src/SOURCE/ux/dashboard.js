/********UPDATE TRACKER***********/
//Resource Bundle/Language Pack
xrb.dash = {
	title:				'Home',
	changeLogTitle:		'Changes in Last 10 days',
	changeCompTitle:	'Computer',
	changeTypeTitle:	'Type',
	changeActTitle:		'Action',
	reportTitle:		'Report Archive',
	serverTitle:		'Environment Notices (Right Click for Options)',
	removeMenu:			'Remove Orphan',
	promptFileRmvTitle:	'Remove Computer',
	promptFileRmvText:	'You are about to remove all records for this computer. This cannot be undone. All records, including change history, applications, notes, and properties will be removed. Are you sure you want to do this?<br/><br/><i>This computer was not found and may no longer exist.</i>',
	rdp:				'Launch Computer',
	openTab:			'Edit Computer Properties',
	reloadPage:			'Refresh',
	welcomeLine:		'You are logged in as <b>{username}</b>.',	//{username} replace with real username
	dashURL:			rb.data+'dashboard.cfm',
	data:				rb.data										//Uses default URL from parent
};


//Extension
dashboard = function(config) {
	
	/****************** DATA *******************/
	
	/************* GLOBAL VARS *****************/
	var loadmask;
		
	var web = new Ext.Panel({
		region:'center',
		autoScroll:true,
		autoLoad:xrb.dash.dashURL,
		tbar:new Ext.Toolbar({
			items:[{
				text:xrb.dash.welcomeLine.toString().replace(/\{username\}/g,Ext.getUsername()),
				xtype:'tbtext'
			},'->',{
				iconCls:'icon-refresh',
				text:xrb.dash.reloadPage,
				handler:function(){
					this.ownerCt.ownerCt.load(xrb.dash.dashURL+'?refresh');
				}
			}]
		})
	});
	
	var recentreports = new Ext.grid.GridPanel({
		region:'center',
		title:xrb.dash.reportTitle+': '+xrb.reporting.existingInstruction,
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
		listeners:{
			rowdblclick:function(grid,rindex,e){
				document.location=xrb.reporting.download+grid.getStore().getAt(rindex).data.nm;
			}
		}
	});
	
	var recentchanges = new Ext.grid.GridPanel({
		region:'north',
		height:165,
		title:xrb.dash.changeLogTitle,
		store: Ext.storeRecentChange,
		iconCls:'icon-gear',
		colModel: new Ext.grid.ColumnModel({
			defaults:{sortable:true},
			columns:[
				new Ext.grid.RowNumberer(),
				{header:xrb.dash.changeCompTitle,dataIndex:'nm'},
				{header:xrb.dash.changeTypeTitle,dataIndex:'ctg'},
				{header:xrb.dash.changeActTitle,dataIndex:'act',width:175,fixed:true}
			]
		}),
		viewConfig: {forceFit:true},
		sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
		listeners:{
			rowdblclick:function(grid,rindex,e){
				Ext.openComputer(null,Ext.storeComputers.find('dn',grid.getStore().getAt(rindex).data.sysid));
			}
		}
	});
	
	var server = new Ext.grid.GridPanel({
		region:'center',
		title:xrb.dash.serverTitle,
		store: Ext.storeServerStatus,
		iconCls:'icon-computer',
		colModel: new Ext.grid.ColumnModel({
			defaults:{sortable:true},
			columns:[
				new Ext.grid.RowNumberer(),
				{header:xrb.dash.changeCompTitle,dataIndex:'nm',renderer:renderServer},
				{header:xrb.dash.changeTypeTitle,dataIndex:'type'}
			]
		}),
		viewConfig: {forceFit:true},
		sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
		listeners:{
			rowdblclick:function(grid,rindex,e){
				var d = grid.getStore().getAt(rindex).data;
				if (d.type.toLowerCase()=="new")
					Ext.openComputer(null,Ext.storeComputers.find('dn',d.sysid));
			},
			rowcontextmenu:function(grid,rindex,e) {
				var gr = grid.getStore().getAt(rindex);
				if (gr.data.type.toLowerCase()=="orphan") {
					var ctx = new Ext.menu.Menu({
						items:[{
							text:xrb.dash.removeMenu,
							iconCls:'icon-remove',
							handler: function() {
								Ext.Msg.show({
									title:xrb.dash.promptFileRmvTitle,
									msg: xrb.dash.promptFileRmvText,
									fn: function(btn){
										if (btn=='yes') {
											Ext.Ajax.request({
												url:rb.data,
												params:{post:'removeorphan',id:gr.data.sysid},
												success:function(rsp,obj) {
													grid.getStore().remove(gr);
												}
											});
										}
									},
									icon:Ext.MessageBox.WARNING,
									buttons:Ext.Msg.YESNO
								});
							}
						}]
					});
				} else {
					var ctx = new Ext.menu.Menu({
						items:[{
							text:xrb.dash.openTab,
							iconCls:'icon-edit',
							handler: function() {
								Ext.openComputer(null,Ext.storeComputers.find('dn',gr.data.sysid));
							}
						},'-',{
							text:xrb.dash.rdp,
							iconCls:'icon-rdp',
							handler: function() {
								Ext.launchRemote(gr.data.dns);
							}
						}]
					});
				}
				ctx.showAt(e.getXY());
			}
		}
	});
	
	var south = new Ext.Panel({
		region:'south',
		layout:'border',
		border:false,
		height:500,
		defaults:{split:true},
		items:[recentchanges,recentreports]
	});
	
	var alerts = new Ext.Panel({
		region:'east',
		width:'33%',
		layout:'border',
		border:false,
		defaults:{split:true},
		items:[server,south]
	});
	
	var main = new Ext.Panel({
		layout:'border',
		plain:true,
		border:false,
		defaults:{split:true},
		items:[web,alerts]
	});
	
	
	/************* CONFIG *****************/
	Ext.apply(this, {
		title:xrb.dash.title,
		layout:'fit',
		closable:false,
		border:false,
		iconCls:'icon-home',
		items:[main]
	});

	dashboard.superclass.constructor.apply(this, arguments);
	this.on('render', loadTool, this);
	
	
	/************* CORE FUNCTIONS *****************/
	function loadTool() {
		//loadmask = new Ext.LoadMask(this.getEl(),{msg:rb.defaults.loadmessage})
		//var m = loadmask;
		//m.show();
		//m.hide();
	}
	
	function renderServer(value,metaData,record,rowIndex,colIndex,store) {
		var str = "<div class=\"environment "+record.data.type.toLowerCase()+ "\">"+record.data.nm+"</div>";		
		return String.format(str);
	}
	
	function getSystemID() {
		return main.ownerCt.id.replace(/tab\_/g,'');
	}
	
	/********EXTEND GLOBAL FUNCTIONALITY*********/
	
};
Ext.extend(dashboard, Ext.Panel, {});