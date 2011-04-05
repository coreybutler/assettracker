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
 

computer = function(config) {
	
	/************ DATA *******************/
	var storeChange = new Ext.data.SimpleStore({
		fields: ['id','dt','usr','act','ctg'],
		data: []
	});
	var changerec = new Ext.data.Record.create([
		{name:'id',mapping:'id'},
		{name:'dt',mapping:'dt'},
		{name:'usr',mapping:'usr'},
		{name:'act',mapping:'act'},
		{name:'ctg',mapping:'ctg'}
	]);
	var storeCategory = new Ext.data.SimpleStore({
		fields: ['ctg'],
		data: []
	});
	var storeAppCategory = new Ext.data.SimpleStore({
		fields: ['ctg'],
		data: []
	});
	var catrec = new Ext.data.Record.create([
		{name:'ctg',mapping:'ctg'}
	]);
	var storeApp = new Ext.data.SimpleStore({
		fields: ['appid','app','ctg'],
		data: []
	});
	var apprec = new Ext.data.Record.create([
		{name:'appid',mapping:'appid'},
		{name:'app',mapping:'app'},
		{name:'ctg',mapping:'ctg'}
	]); 
	
	var propertysource = {};
	
	//SPECIAL OVERRIDES
	Ext.override(Ext.grid.PropertyGrid, {
		getName: function(i){
			var r = this.propStore.store.getAt(i);
			return r.get('name');
		},
		removeProperty: function(prop){
			delete this.propStore.source[prop];
			var r = this.propStore.store.getById(prop);
			this.propStore.store.remove(r);
		}
	});
	
	/************* GLOBAL VARS *****************/
	var savemask = new Ext.LoadMask(Ext.getBody(),{msg:rb.defaults.savemessage});
	var loadmask = new Ext.LoadMask(Ext.getBody(),{msg:rb.defaults.loadmessage});
	var main = new Ext.Panel({
		layout:'border',
		border:false,
		defaults:{split:true},
		items:[{
			region:'center',
			layout:'border',
			border:false,
			defaults:{split:true},
			items:[{
				region:'center',
				layout:'border',
				border:false,
				defaults:{split:true},
				items:[new Ext.grid.GridPanel({
					region:'center',
					closable:false,
					store: storeApp,
					colModel: new Ext.grid.ColumnModel({
						defaults:{sortable:true},
						columns:[
							{header:rb.appTitle,dataIndex:'app'},
							{header:rb.appCategory,dataIndex:'ctg'}
						]
					}),
					viewConfig: {forceFit:true},
					sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
					listeners:{
						rowcontextmenu: function(grid,rindex,e) {
							var gr = grid.getStore().getAt(rindex);
							var ctx = new Ext.menu.Menu({
								items:[{
									text:rb.removeMenu,
									iconCls:'icon-remove',
									handler: function() {
										Ext.Ajax.request({
											url:rb.data,
											params:{post:'removeapplication',id:gr.data.appid},
											success:function(rsp,obj) {
												grid.getStore().remove(gr);
											}
										});
									}
								},'-',{
									text:rb.removeAndChangeMenu,
									iconCls:'icon-remove',
									handler: function() {
										Ext.Ajax.request({
											url:rb.data,
											params:{post:'removeapplication',id:gr.data.appid,change:Ext.encode(gr.data),sysid:main.ownerCt.id.replace(/tab\_/g,'')},
											success:function(rsp,obj) {
												var d = Ext.decode(rsp.responseText);
												grid.getStore().remove(gr);
												storeChange.insert(0,new changerec({
													id:d.id,
													dt:new Date(),
													usr:Ext.getUsername(),
													act:rb.appRmvChangeTpl+gr.data.app+' ('+gr.data.ctg+')',
													ctg:rb.appRmvDefaultCtg
												}));
												storeChange.sort('dt','DESC');
												var g = getel('changegrid');
												g.getSelectionModel().selectRow(g.getStore().find('id',d.id));
												g.getView().focusRow(g.getStore().find('id',d.id));
												
												var dtl = main.items.get(1).items.get(1).items.get(0);
												var r = g.getStore().getAt(g.getStore().find('id',d.id));
												//Update detail box
												dtl.removeAll();
												dtl.add({html:changeText(r.data)});
												dtl.doLayout();
												dtl.getBottomToolbar().enable();
											}
										});
									}
								}]
							});
							ctx.showAt(e.getXY());
						}
					},
					bbar: new Ext.Toolbar({
						items:[{
							text:rb.appAddButton,
							iconCls:'icon-add',
							handler:function() {
								w.show();
							}
						},'->',{
							text:rb.appRemoveInstruct,
							xtype:'tbtext'
						}]
					})
				}),new Ext.grid.PropertyGrid({
					region:'west',
					width:300,
					//title:rb.propertyTitle,
					source: propertysource,
					bbar: new Ext.Toolbar({
						hidden:false,
						items:[{
							text:rb.propertyButton,
							iconCls:'icon-add',
							handler:function() {
								var w = new Ext.Window({
									title:rb.propertyWindowTitle,
									width: 450,
									height:185,
									layout:'fit',
									modal:true,
									items:[new Ext.form.FormPanel({
										border:false,
										bodyStyle:'padding:10px',
										defaults:{width:250,xtype:'textfield',allowBlank:false},
										monitorValid:true,
										items:[{
											fieldLabel:rb.propertyFieldName,
											name:'prop',
											maskRe:/[^#\'\&\=\>\<\\\,\;]/
										},{
											fieldLabel:rb.propertyFieldValue,
											name:'val'						
										},{
											xtype:'checkbox',
											name:'check',
											checked:false,
											boxLabel:rb.propertyUseAll
										}],
										listeners:{
											clientvalidation:function(formpanel,valid) {
												formpanel.ownerCt.getBottomToolbar().items.get(formpanel.ownerCt.getBottomToolbar().items.length-1).setDisabled(!valid);
												formpanel.ownerCt.getBottomToolbar().items.get(formpanel.ownerCt.getBottomToolbar().items.length-3).setDisabled(!valid);
											}
										}
									})],
									bbar: new Ext.Toolbar({
										items:['->',{
											text:rb.propertyButtonSaveNew,
											disabled:true,
											iconCls:'icon-save',
											handler:function(){
												saveNewProperty(w.items.get(0).getForm());
												w.items.get(0).getForm().reset();
											}
										},'-',{
											text:rb.propertyButtonSaveClose,
											disabled:true,
											iconCls:'icon-save',
											handler:function(){
												saveNewProperty(w.items.get(0).getForm());
												w.hide();
												w.items.get(0).getForm().reset();
											}
										}]
									})
								});
								w.show();
							}
						},'->',{
							xtype:'tbtext',
							text:rb.propertyButtonRemove
						}]
					}),
					listeners:{
						propertychange:function(source,recordid,value,oldValue) {
							Ext.Ajax.request({
								url:rb.data,
								params:{post:'editproperty',id:getSystemID(),prop:recordid,value:value},
								success:function(){}
							});
						},
						rowcontextmenu:function(grid,index,e){
							var nm = getel('property').getName(index);
							var ctx = new Ext.menu.Menu({
								items:[{
									text:rb.removeProperty+' '+nm,
									iconCls:'icon-remove',
									handler:function(){
										Ext.Msg.show({
										   title:rb.removeProperty+' '+nm+'?',
										   msg: rb.removePropertyWarning,
										   buttons: Ext.Msg.YESNO,
										   fn: function(btn){
										   		if (btn=="yes") {
										   			Ext.Ajax.request({
										   				url:rb.data,
										   				params:{post:'removeproperty',prop:nm},
										   				success:function(rsp,obj){
										   					getel('property').removeProperty(nm);
												   			var tabs = main.ownerCt.ownerCt.items;
															for(var i=0;i<tabs.length;i++) {
																if (tabs.get(i).id != main.ownerCt.id && tabs.get(i).id.substring(0,7)=='tab_CN=') {
																	var prp = tabs.get(i).items.get(0).items.get(0).items.get(0).items.get(1);
																	prp.removeProperty(nm);
																}
															}
										   				}
										   			});
										   		}
										   },
										   icon: Ext.MessageBox.WARNING
										});
									}
								}]
							});
							ctx.showAt(e.getXY());
						}
					}
				})]
			},{
				region:'south',
				title:rb.systemNoteTitle,
				height:300,
				autoScroll:true,
				layout:'fit',
				defaults:{border:false,layout:'fit',autoScroll:true,bodyStyle:'padding:10px;font-family:Arial;font-size:small;'},
				bbar:new Ext.Toolbar({
					items:['->',{
						text:rb.systemNoteEditButton,
						iconCls:'icon-edit',
						handler:function(){
							var e = new Ext.Window({
								title:rb.systemNoteTitle,
								boder:false,
								modal:true,
								width:600,
								height:400,
								layout:'fit',
								items:[new Ext.form.HtmlEditor({
									autoScroll:true,
									name:'note',
									value:this.ownerCt.ownerCt.items.get(0).initialConfig.html
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
												params:{post:'note',id:getSystemID(),note:Ext.encode(note)},
												success: function(rsp,obj){
													var n = getel('notes');
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
			}]
		},{
			region:'east',
			width:425,
			layout:'border',
			border:false,
			defaults:{split:true},
			items:[new Ext.grid.GridPanel({
				region:'center',
				header:false,
				closable:false,
				store: storeChange,
				colModel: new Ext.grid.ColumnModel({
					defaults:{sortable:true},
					columns:[
						{header:rb.change,dataIndex:'act'},
						{header:rb.changeCategory,dataIndex:'ctg',width:25},
						{header:rb.changeDate,dataIndex:'dt',width:40,xtype:'datecolumn',format:'m-d-Y'},
						{header:rb.changeUser,dataIndex:'usr',width:60,hidden:true}
					]
				}),
				viewConfig: {forceFit:true},
				sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
				listeners:{
					rowclick:function(grid,index,e) {
						var d = storeChange.getAt(index).data;
						var dtl = grid.ownerCt.items.get(1).items.get(0);
						dtl.removeAll();
						dtl.add({html:changeText(d)});
						dtl.doLayout();
						dtl.getBottomToolbar().enable();
					},
					keypress:function(e) {
						var d = this.getSelectionModel().getSelected().data;
						var dtl = this.ownerCt.items.get(1).items.get(0);
						dtl.removeAll();
						dtl.add({html:changeText(d)});
						dtl.doLayout();
						dtl.getBottomToolbar().enable();
					}
				}
			}),{
				region:'south',
				layout:'border',
				border:false,
				height:430,
				defaults:{split:true},
				items:[{
					region:'center',
					layout:'fit',
					defaults:{bodyStyle:'padding:4px;font-family:Arial;font-size:x-small;color:#333;',border:false,header:false,layout:'fit',autoScroll:true},
					autScroll:true,
					bbar: new Ext.Toolbar({
						disabled:true,
						items:['->',{
							text:'Edit',
							iconCls:'icon-edit',
							handler: editChange
						},{
							text:'Delete',
							iconCls:'icon-remove',
							handler: deleteChange
						}]
					})
				},new Ext.form.FormPanel({
					height:300,
					title:rb.changeFormTitle,
					bodyStyle:'padding:10px;',
					region:'south',
					monitorValid:true,
					defaults:{width:260,xtype:'textfield'},
					items:[new Ext.form.ComboBox({
						fieldLabel:rb.changeFieldCategory,
					    store: storeCategory,
					    typeAhead: false,
					    mode:'local',
					    triggerAction:'all',
					    emptyText:'Unknown...',
					    selectOnFocus:true,
					    allowBlank: false,
					    forceSelection: false,
					    displayField:'ctg',
					    value:'Unknown',
					    name:'ctg'
					}),new Ext.form.DateField({
						fieldLabel:rb.changeFieldDate,
						allowBlank:false,
						value:new Date(),
					    name:'dt'
					}),{
						fieldLabel:rb.changeFieldUser,
						allowBlank:false,
						value:Ext.getUsername(),
					    name:'usr'
					},{
						fieldLabel:rb.changeFieldAction,
						xtype:'textarea',
						height:135,
						allowBlank:false,
						name:'act'
					}],
					bbar:new Ext.Toolbar({
						items:['->',{
							text:rb.changeResetButton,
							iconCls:'icon-refresh',
							handler: function(){
								this.ownerCt.ownerCt.getForm().reset();
							}
						},{
							text:rb.changeSaveNewButton,
							iconCls:'icon-save',
							disabled:true,
							handler: function() {
								var m = savemask;
								var grid = main.items.get(1).items.get(0);
								var s = grid.getStore();
								var form = this.ownerCt.ownerCt.getForm();
								var f = form.getFieldValues();
								var dtl = main.items.get(1).items.get(1).items.get(0);
								var tdt = f.dt;
								
								//Mask for save
								m.show();
								
								//Process new change
								f.id=main.ownerCt.id.replace(/tab\_/g,'');
								f.dt=f.dt.format('m-d-Y');
								Ext.Ajax.request({
									url:rb.data,
									params:{post:'newchange',data:Ext.encode(f)},
									success:function(rsp,obj) {
										var id = Ext.decode(rsp.responseText).id
										
										//Insert the new record at the top of the grid.
										s.insert(0,new changerec({
											id:id,
											dt:tdt,
											usr:f.usr,
											act:f.act,
											ctg:f.ctg
										}));
										grid.getSelectionModel().selectFirstRow();
										
										//Update detail pane
										dtl.removeAll();
										dtl.add({html:changeText(f)});
										dtl.doLayout();
										dtl.getBottomToolbar().enable();
										
										form.reset();
										
										m.hide();
									}
								});
							}							
						}]
					}),
					listeners:{
						clientvalidation: function(formpanel,valid) {
							formpanel.getBottomToolbar().items.get(formpanel.getBottomToolbar().items.length-1).setDisabled(!valid);
						}
					}
				})]
			}]
		}],
		tbar: new Ext.Toolbar({
			items:[{
				text:rb.rdp,
				iconCls:'icon-rdp',
				disabled:true,
				handler:function(){
					var record = main.ownerCt.data;
					window.open(rb.rdpurl+record.dns);
				}
			},{
				text:rb.ssh,
				iconCls:'icon-ssh',
				disabled:true,
				handler:function(){
					var record = main.ownerCt.data;
					window.open(rb.sshurl+record.dns)
				}
			},'-',{
				text:rb.reportButton,
				iconCls:'icon-pdf',
				menu:new Ext.menu.Menu({
					items:[{
						text:rb.reportMenuAll,
						handler: function(){
							document.location=rb.reportUrl+getSystemID()+'&report=all&format=pdf';
						}
					},{
						text:rb.reportMenuProp,
						handler: function(){
							document.location=rb.reportUrl+getSystemID()+'&report=properties&format=pdf';
						}
					},{
						text:rb.reportMenuHistory,
						handler: function(){
							document.location=rb.reportUrl+getSystemID()+'&report=history&format=pdf';
						}
					}]
				})
			}]
		})
	});
	var w = new Ext.Window({
		title:rb.appAddButton,
		height:165,
		width:400,
		layout:'fit',
		modal:true,
		closeAction:'hide',
		items:[new Ext.form.FormPanel({
			bodyStyle:'padding:10px',
			border:false,
			monitorValid:true,
			defaults:{xtype:'textfield',width:250},
			items:[{
				allowBlank:false,
				fieldLabel:rb.appFieldName,
				name:'nm'
			},new Ext.form.ComboBox({
				fieldLabel:rb.appFieldCategory,
			    store: storeAppCategory,
			    displayField:'ctg',
			    typeAhead:true,
			    mode: 'local',
			    triggerAction: 'all',
			    emptyText:rb.defaults.appCategory,
			    selectOnFocus:true,
			    allowBlank: false,
			    name:'ctg'
			}),new Ext.form.Checkbox({
				boxLabel:rb.appAddToChanges,
				checked:false,
				name:'chglog'
			})],
			listeners:{
				clientvalidation:function(fp,valid) {
					fp.ownerCt.getBottomToolbar().items.get(1).setDisabled(!valid);
				}
			}
		})],
		bbar:new Ext.Toolbar({
			items:['->',{
				text:rb.appSaveButton,
				iconCls:'icon-save',
				disabled:true,
				handler:function(){
					var f = this.ownerCt.ownerCt.items.get(0).getForm().getFieldValues();
					f.id = main.ownerCt.id.replace(/tab\_/g,'');
					Ext.Ajax.request({
						url:rb.data,
						params:{post:'newapplication',data:Ext.encode(f)},
						success:function(rsp,obj) {
							var d = Ext.decode(rsp.responseText);
							storeApp.insert(0,new apprec({
								appid:d.id,
								app:f.nm,
								ctg:f.ctg
							}));
							var ctgExists = false;
							for(var i=0;i<storeCategory.getCount();i++){
								if (storeCategory.getAt(i).data.ctg.trim()==f.ctg.trim()) {
									ctgExists=true;
									break;
								}
							}
							if (!ctgExists){
								storeCategory.add(new catrec({ctg:f.ctg.trim()}));
								storeCategory.sort('ctg');
							}
							if(d.chgid!=undefined){
								storeChange.insert(0,new changerec({
									id:d.chgid,
									dt:new Date(),
									usr:Ext.getUsername(),
									act:rb.appAddChangeTpl+f.nm+' ('+f.ctg+')',
									ctg:rb.appAddDefaultCtg
								}));
								storeChange.sort('dt','DESC');
								var g = getel('changegrid');
								g.getSelectionModel().selectRow(g.getStore().find('id',d.chgid));
								g.getView().focusRow(g.getStore().find('id',d.chgid));
								
								var dtl = main.items.get(1).items.get(1).items.get(0);
								var r = g.getStore().getAt(g.getStore().find('id',d.chgid));
								//Update detail box
								dtl.removeAll();
								dtl.add({html:changeText(r.data)});
								dtl.doLayout();
								dtl.getBottomToolbar().enable();
							}
							w.hide();
							w.items.get(0).getForm().reset();
							if (!ctgExists)
								w.doLayout();
						}
					});
				}
			}]
		})
	});
	
	
	/************* CONFIG *****************/
	Ext.apply(this, {
		layout:'fit',
		closable:true,
		border:false,
		plain:true,
		items:[main]
	});

	computer.superclass.constructor.apply(this, arguments);
	this.on('render', loadComputer, this);
	
	
	/************* CORE FUNCTIONS *****************/
	function loadComputer() {
		var m = loadmask;
		m.show();
		Ext.Ajax.request({
			url:rb.data,
			params:{get:'computer',id:this.id.replace(/tab\_/g,'')},
			success: function(rsp,obj) {
				var r = Ext.decode(rsp.responseText);
				var changes = query2object(r.computer.CHANGES);
				var prop = query2object(r.computer.PROPERTIES);
				var pl = query2object(r.computer.PROPERTYLIST);
				var app = query2object(r.computer.APPLICATIONS);
				var actg = query2object(r.computer.CATEGORIES);
				var note = r.computer.NOTES.trim();
				var cat = r.categories;
				
				//Enable appropriate toolbar buttons
				if (main.ownerCt.initialConfig.iconCls.toLowerCase().indexOf('win')>=0)
					main.getTopToolbar().items.get(0).enable();
				else
					main.getTopToolbar().items.get(1).enable();
				
				//Populate notes
				var n = getel('notes');
				n.add({
					border:false,
					header:false,
					html:note,
					layout:'fit',
					autoScroll:true,
					bodyStyle:'padding:6px;font-family:Arial;font-size:small;'
				});
				n.doLayout();
				
				//Populate application categories
				for(var i=0;i<actg.length;i++) {
					storeAppCategory.add(new catrec({
						ctg:actg[i].CTG
					}));
				}
				
				//Populate Applications
				for (i=0;i<app.length;i++) {
					storeApp.add(new apprec({
						appid:app[i].APPID,
						app:app[i].APP,
						ctg:app[i].CTG
					}));
				}

				//Populate properties list
				for (i=0;i<pl.length;i++)
					propertysource[pl[i].PROP]='';
				
				//Populate property values associated with system
				for (i=0;i<prop.length;i++)
					propertysource[prop[i].PROP]=prop[i].VAL;
				
				getel('property').setSource(propertysource);
				
				//Populate changes
				for(i=0;i<changes.length;i++) {
					var c = changes[i];
					storeChange.add(new changerec({
						id:c.CHGID,
						dt:c.CHGDT,
						usr:c.USR,
						act:c.ACT,
						ctg:c.CTG
					}));
				}
				
				//Populate categories
				for(i=0;i<r.categories.length;i++)
					storeCategory.add(new catrec({ctg:r.categories[i]}));
				
				//Hide the loading mask
				m.hide();
			}
		});
	}
	
	function getUsername() {
		return this.username;
	}
	
	function saveNewProperty(form) {
		var f = form.getFieldValues();
		var p = getel('property');
		
		//Set property
		propertysource[f.prop]=f.val;
		p.setSource(propertysource);
		
		//Save property
		f.id=getSystemID();
		Ext.Ajax.request({
			url:rb.data,
			params:{post:'newproperty',data:Ext.encode(f),check:f.check},
			success:function(rsp,obj){
				var tabs = main.ownerCt.ownerCt.items;
				for(var i=0;i<tabs.length;i++) {
					if (tabs.get(i).id != main.ownerCt.id && tabs.get(i).id.substring(0,7)=='tab_CN=') {
						var prp = tabs.get(i).items.get(0).items.get(0).items.get(0).items.get(1);
						var src = prp.getSource();
						if (src[f.prop]==undefined) {
							if (f.check)
								src[f.prop]=f.val;
							else
								src[f.prop]='';
						}
						prp.setSource(src);
					}
				}
			}
		});
	}
	
	function changeText(d) {
		var fdt = new Date(d.dt).format('m-d-Y').toString();
		return '<div style=\"width:33%;float:left;\"><b>'+rb.changeTypeTitle.toUpperCase()+':</b> '+d.ctg+'</div><div style=\"width:33%;float:left;\"><b>'+rb.changeUserTitle.toUpperCase()+':</b> ' +
				d.usr+'</div><div style=\"width:33%;float:left;\"><b>'+rb.changeDateTitle.toUpperCase()+':</b> '+fdt+
				'</div><div style=\"clear:both;height:3px;border-bottom:1px dotted #eee !important;margin-bottom:6px;width:100%;\"></div>'+
				d.act;
	}
	
	function deleteChange() {
		var grid = main.items.get(1).items.get(0).getSelectionModel();
		var record = grid.getSelected();
		var d = record.data;
		
		//Confirm Removal
		Ext.Msg.show({
			title:rb.changeRemoveTitle,
			msg:rb.changeRemoveText,
			buttons: Ext.Msg.YESNO,
			icon:Ext.MessageBox.QUESTION,
			fn: function(btn) {
				if (btn=="yes") {
					Ext.Ajax.request({
						url:rb.data,
						params:{post:'removechange',id:d.id},
						success:function(rsp,obj) {
							var dtl = main.items.get(1).items.get(1).items.get(0);
							dtl.removeAll();
							dtl.getBottomToolbar().disable();
							
							storeChange.remove(record);
						}
					});
				}
			}
		});
	}
	
	function editChange() {
		var record = main.items.get(1).items.get(0).getSelectionModel().getSelected();
		var d = record.data;
		var e = new Ext.Window({
			iconCls:'icon-edit',
			title:rb.changeEditTitle,
			modal:true,
			height:300,
			width:450,
			closeAction:'close',
			layout:'fit',
			items:[new Ext.form.FormPanel({
				bodyStyle:'padding:10px;',
				border:false,
				defaults:{width:300,xtype:'textfield'},
				items:[new Ext.form.ComboBox({
					fieldLabel:rb.changeFieldCategory,
				    store: storeCategory,
				    typeAhead: false,
				    mode:'local',
				    triggerAction:'all',
				    emptyText:'Unknown...',
				    selectOnFocus:true,
				    allowBlank: false,
				    forceSelection: false,
				    displayField:'ctg',
				    value:d.ctg,
				    name:'ctg'
				}),new Ext.form.DateField({
					fieldLabel:rb.changeFieldDate,
					allowBlank:false,
					value:new Date(d.dt),
				    name:'dt'
				}),{
					fieldLabel:rb.changeFieldUser,
					allowBlank:false,
					value:d.usr,
				    name:'usr'
				},{
					fieldLabel:rb.changeFieldAction,
					xtype:'textarea',
					height:75,
					value:d.act,
				    name:'act',
					allowBlank:false
				},new Ext.form.Hidden({
					name:'id',
					value:d.id
				})]
			})],
			bbar:new Ext.Toolbar({
				items:[{
					xtype:'tbtext',
					text:rb.changeWarning
				},'->',{
					text:'Save Changes',
					iconCls:'icon-save',
					handler: function() {
						var m = savemask;
						var f = this.ownerCt.ownerCt.items.get(0).getForm().getFieldValues();
						f.dt = f.dt.format('m/d/Y');
						
						//Create mask for saving
						m.show();
						e.hide();

						//Process form
						Ext.Ajax.request({
							url:rb.data,
							params:{post:'editchange',data:Ext.encode(f)},
							success: function(rsp,obj) {
								var dtl = main.items.get(1).items.get(1).items.get(0);
								var r = storeChange.getAt(storeChange.find('id',d.id));

								//Update detail box
								dtl.removeAll();
								dtl.add({html:changeText(f)});
								dtl.doLayout();
								
								//Update grid
								r.set('ctg',f.ctg);
								r.set('act',f.act);
								r.set('dt',f.dt);
								r.set('usr',f.usr);
			
								e.close();
								m.hide();
							}
						});
					}
				}]
			})
		});
		e.show();
	}
	
	function getel(type) {
		if (type=='property')
			return main.items.get(0).items.get(0).items.get(1);
		if (type=='appgrid')
			return main.items.get(0).items.get(0).items.get(0);
		if (type=='notes')
			return main.items.get(0).items.get(1);
		if (type=='changegrid')
			return main.items.get(1).items.get(0);
	}
	
	function getSystemID() {
		return main.ownerCt.id.replace(/tab\_/g,'');
	}
	
	//COMMON FUNCTIONS
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
	
	function nbsp(i) {
		var str = "";
		for(var y=0;y<i;y++)
			str += "&nbsp;";
		return str;
	}
	
	function arraycontains(array,item) {
		for (var i=0;i<array.length;i++) {
			if (array[i]==item)
				return true;
		}
		return false;
	}
};
Ext.extend(computer, Ext.Panel, {});