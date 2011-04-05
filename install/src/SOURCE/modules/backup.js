/********UPDATE TRACKER***********/
//Resource Bundle/Language Pack
xrb.backup = {
	title:				'Regular Backup Schedule',
	fieldComputer:		'Computer',
	fieldComputerEmpty:	'Select Computer...',
	fieldRecur:			'Runs Every',
	fieldRecurEmpty:	'Select Frequency...',
	fieldDur:			'Runs For',
	fieldDurEmpty:		'Select Frequency...',
	fieldDateStart:		'Started On',
	fieldDateStartTime:	'Runs At',
	fieldDateEnd:		'Expires On',
	fieldDateEndTime:	'Expires By',
	fieldNote:			'Notes',
	headerComputer:		'Computer',
	headerDuration:		'Runs For',
	headerDurtype:		'Type',
	headerRecur:		'Runs Every',
	headerRecurtype:	'Frequency',
	headerBegin:		'First Ran',
	headerBeginTime:	'Runs at',
	headerEnd:			'Expires On',
	warnRemoveTitle:	'Remove a Schedule',
	warnRmoveText:		'You are about to remove a backup from the schedule. This cannot be undone. Are you sure you wish to continue?',
	removeButton:		'Delete Backup from Schedule',
	newButton:			'Add New Backup to Schedule',
	updateButton:		'Save Changes',
	createButton:		'Create',
	cancelButton:		'Cancel',
	reportButton:		'Download Report',
	reportOptList:		'List of Backups',
	reportOptListNotes:	'List of Backups (w/Notes)',
	reportOptCal:		'Week View',
	reportOptCalNotes:	'Week View (w/Notes)',
	toggleTooltip:		'Expand/Collapse All',
	runEveryTitle:		'<i>- OR WEEKLY EVERY -</i>',
	reportURL:			rb.data+'reports/backup.cfm',
	data:				rb.data							//Uses default URL from parent
};


//Extension
backup = function(config) {
	
	/****************** DATA *******************/
	var storeBackup = new Ext.data.SimpleStore({
		fields: ['id','sysid','nm','recurtype','recur','durtype','dur','startdt','enddt','note'],
		data: []
	});
	var bkprec = new Ext.data.Record.create([
		{name:'id',mapping:'id'},
		{name:'sysid',mapping:'sysid'},
		{name:'nm',mapping:'nm'},
		{name:'recurtype',mapping:'recurtype'},
		{name:'recur',mapping:'recur'},
		{name:'durtype',mapping:'durtype'},
		{name:'dur',mapping:'dur'},
		{name:'startdt',mapping:'startdt'},
		{name:'enddt',mapping:'enddt'},
		{name:'note',mapping:'note'}
	]);
	var storeRecur = new Ext.data.SimpleStore({
		fields: ['nm','cd'],
		data: [['Minutes','n'],['Hours','h'],['Days','d'],['Weeks','w'],['Months','m']]
	});
	var recurrec = new Ext.data.Record.create([
		{name:'nm',mapping:'nm'},
		{name:'cd',mapping:'cd'}
	]);
	var storeDOW = new Ext.data.SimpleStore({
		fields: ['nm','cd'],
		data: [['Sunday',1],['Monday',2],['Tuesday',3],['Wednesday',4],['Thursday',5],['Friday',6],['Saturday',7]]
	});
	var dowrec = new Ext.data.Record.create([
		{name:'nm',mapping:'nm'},
		{name:'cd',mapping:'cd'}
	]);
	
	
	
	/************* GLOBAL VARS *****************/
	var spot = new Ext.ux.Spotlight({
        easing: 'easeOut',
        duration: .3
    });
	
	var expander = new Ext.ux.grid.RowExpander({
        tpl : new Ext.Template(
            '<p class=\"griddropdown\">{note}</p>'
        )
    });
    
    var form = new Ext.Panel({
    	region:'east',
    	iconCls:'icon-edit',
    	width:'33%',
    	boxMinWidth:300,
    	bodyStyle:'padding:10px;',
    	layout:'fit',
    	disabled:true,
    	defaults:{border:false,header:false},
    	items:[new Ext.form.FormPanel({
		    monitorValid:true,
	    	defaults:{xtype:'textfield',width:200},
	    	listeners:{
		    	render:function(){
		    		loadFormButtons();
		    	},
		    	clientvalidation:function(fp,valid) {
		    		tb = form.getTopToolbar(); 
		    		if (tb.items.length>0)
			    		tb.items.get(tb.items.length-1).setDisabled(!valid);
		    	}
		    },
    		items:[new Ext.form.ComboBox({
				fieldLabel:xrb.backup.fieldComputer+'*',
			    store: Ext.storeComputers,
			    displayField:'nm',
			    valueField:'nm',
			    typeAhead:false,
			    mode:'local',
			    triggerAction: 'all',
			    emptyText:xrb.backup.fieldComputerEmpty,
			    selectOnFocus:true,
			    allowBlank: false,
			    forceSelection: true,
				editable:false,
				name:'sysid'
			}),{
				fieldLabel:xrb.backup.fieldRecur+'*',
			    xtype:'panel',
			    layout:'border',
			    plain:true,
			    bodyStyle:'background:#fff;',
			    border:false,
			    header:false,
			    height:22,
			    items:[{
			    	region:'west',
			    	xtype:'textfield',
			    	width:40,
			    	split:true,
			    	emptyText:'#...',
			    	name:'recur',
			    	maskRe:/[0-9]/
			    },new Ext.form.ComboBox({
			    	region:'center',
			    	width:50,
					store: storeRecur,
				    displayField:'nm',
				    valueField:'cd',
				    typeAhead:false,
				    mode:'local',
				    triggerAction: 'all',
				    emptyText:xrb.backup.fieldRecurEmpty,
				    selectOnFocus:true,
				    forceSelection: true,
				    editable:false,
				    name:'recurtype'
				})]
			},{
				xtype:'panel',
				fieldLabel:' ',
				labelSeparator:' ',
				plain:true,
			    bodyStyle:'background:#fff;',
			    border:false,
			    header:false,
			    html:xrb.backup.runEveryTitle
			},{
				xtype:'panel',
				fieldLabel:' ',
				labelSeparator:' ',
				plain:true,
			    bodyStyle:'background:#fff;',
			    border:false,
			    header:false,
			    defaults:{xtype:'checkbox',bodyStyle:'font-size:x-small;'},
			    listeners:{
			    	render:function(){
			    		for(var i=0;i<storeDOW.getCount();i++) {
			    			this.add({
			    				boxLabel:storeDOW.getAt(i).data.nm,
			    				value:storeDOW.getAt(i).data.cd,
			    				checked:false,
			    				name:'dow',
			    				listeners:{
			    					check:function(cb,checked) {
			    						var x = this.ownerCt.items;
			    						var day = false;
			    						for(var i=0;i<x.length;i++) {
			    							if (x.get(i).checked) {
			    								this.ownerCt.ownerCt.items.get(1).disable();
			    								day = true;
			    								break;
			    							}
			    						}
			    						if (!day)
			    							this.ownerCt.ownerCt.items.get(1).enable();
			    					}
			    				}
			    			});
			    		}
			    	}
			    }
			},{
				fieldLabel:xrb.backup.fieldDur+'*',
			    xtype:'panel',
			    layout:'border',
			    plain:true,
			    bodyStyle:'background:#fff;',
			    border:false,
			    header:false,
			    height:22,
			    items:[{
			    	region:'west',
			    	xtype:'textfield',
			    	width:40,
			    	split:true,
			    	emptyText:'#...',
			    	name:'dur',
			    	maskRe:/[0-9]/,
			    	allowBlank:false
			    },new Ext.form.ComboBox({
			    	region:'center',
			    	width:50,
					store: storeRecur,
				    displayField:'nm',
				    valueField:'cd',
				    typeAhead:false,
				    mode:'local',
				    triggerAction: 'all',
				    emptyText:xrb.backup.fieldDurEmpty,
				    selectOnFocus:true,
				    forceSelection: true,
				    editable:false,
				    name:'durtype',
			    	allowBlank:false
				})]
			},new Ext.form.DateField({
				fieldLabel:xrb.backup.fieldDateStart+'*',
				allowBlank:false,
				value:new Date(),
				name:'start'
			}),new Ext.form.TimeField({
				fieldLabel:xrb.backup.fieldDateStartTime,
				allowBlank:false,
				increment:5,
				value:'12:00 AM',
				name:'starttime'
			}),new Ext.form.DateField({
				fieldLabel:xrb.backup.fieldDateEnd,
				name:'end'
			}),new Ext.form.TimeField({
				fieldLabel:xrb.backup.fieldDateEndTime,
				increment:5,
				name:'endtime'
			}),new Ext.form.TextArea({
				fieldLabel:xrb.backup.fieldNote,
				height:175
			}),new Ext.form.Hidden({
				name:'id',
				value:'new'
			})]
	    })],
	    tbar:new Ext.Toolbar()
    });

	var list = new Ext.grid.GridPanel({
		region:'center',
		header:false,
		closable:false,
		store: storeBackup,
		colModel: new Ext.grid.ColumnModel({
			defaults:{sortable:true},
			columns:[
				expander,
				{header:xrb.backup.headerComputer,dataIndex:'nm',css:'font-weight:bold;'},
				{header:xrb.backup.headerRecur,dataIndex:'durtype',renderer:renderRecur},
				{header:xrb.backup.headerDuration,dataIndex:'dur',renderer:renderDuration},
				{header:xrb.backup.headerBeginTime,dataIndex:'startdt',fixed:true,width:60,fixed:true,renderer:Ext.util.Format.dateRenderer('g:i a')},
				{header:xrb.backup.headerBegin,dataIndex:'startdt',fixed:true,width:100,fixed:true,renderer:Ext.util.Format.dateRenderer('D, M j, Y')},
				{header:xrb.backup.headerEnd,dataIndex:'enddt',fixed:true,width:145,fixed:true,renderer:Ext.util.Format.dateRenderer('D, M j, Y g:i a')}
			]
		}),
		viewConfig: {forceFit:true},
		sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
		plugins: expander,
		tbar:new Ext.Toolbar({
			items:[{
				iconCls:'icon-expandall',
				enableToggle:true,
				tooltip:xrb.backup.toggleTooltip,
				listeners:{
					toggle:function(btn,pressed){
						for(var i=0;i<list.store.getCount();i++) {
							if (pressed)
								list.plugins.expandRow(i);
							else
								list.plugins.collapseRow(i);
						}
					}
				}
			},'-',{
				text:xrb.backup.reportButton,
				iconCls:'icon-pdf',
				menu:new Ext.menu.Menu({
					items:[{
						text:xrb.backup.reportOptList,
						handler: function(){
							document.location=xrb.backup.reportURL+'?format=pdf&type=list&notes=0';
						}
					},{
						text:xrb.backup.reportOptListNotes,
						handler: function(){
							document.location=xrb.backup.reportURL+'?format=pdf&type=list&notes=1';
						}
					},'-',{
						text:xrb.backup.reportOptCal,
						handler: function(){
							document.location=xrb.backup.reportURL+'?format=pdf&type=calendar&notes=0';
						}
					},{
						text:xrb.backup.reportOptCalNotes,
						handler: function(){
							document.location=xrb.backup.reportURL+'?format=pdf&type=calendar&notes=1';
						}
					}]
				})
			},'->',{
				text:xrb.backup.removeButton,
				iconCls:'icon-remove',
				handler: function() {
					Ext.Msg.show({
						title:xrb.backup.warnRemoveTitle,
						msg:xrb.backup.warnRmoveText,
						buttons:Ext.Msg.YESNO,
						icon:Ext.MessageBox.WARNING,
						fn: function(btn) {
							if (btn=="yes") {
								var id = list.getSelectionModel().getSelected().data.id;
								Ext.Ajax.request({
									url:xrb.backup.data,
									params:{post:'removebackup',id:id},
									success: function(rsp,obj) {
										storeBackup.remove(storeBackup.getAt(storeBackup.find('id',id)));
										form.items.get(0).getForm().reset();
									}
								});
							}
						}
					});
				}
			},'-',{
				text:xrb.backup.newButton,
				iconCls:'icon-add',
				handler:function(){
					var f = form.items.get(0);
					var tb = form.getTopToolbar(); 
					f.getForm().reset();
					form.enable();
					spot.show(form.id);
					tb.removeAll();
					tb.add('->');
					tb.add({
						text:xrb.backup.cancelButton,
						iconCls:'icon-cancel',
						handler:function(){
							var d = list.getSelectionModel().getSelected();
							form.getTopToolbar().removeAll();
							if (d!=undefined) {
								loadForm(d.data);
								form.enable();
							} else
								form.disable();
							form.getTopToolbar().doLayout();
							spot.hide();
						}
					});
					tb.add({
						text:xrb.backup.createButton,
						disabled:true,
						iconCls:'icon-add',
						handler:function(){registerBackup(false);}
					});
					tb.doLayout();
					
				}
			}]
		}),
		listeners: {
			rowclick:function(grid,rindex,e) {
				var d = storeBackup.getAt(rindex).data;
				loadForm(d);
			}
		}
	});
	
	var main = new Ext.Panel({
		layout:'border',
		border:false,
		defaults:{split:true,layout:'fit'},
		items:[list,form]
	});
	
	
	/************* CONFIG *****************/
	Ext.apply(this, {
		title:xrb.backup.title,
		layout:'fit',
		closable:false,
		border:false,
		iconCls:'icon-calendar',
		items:[main]
	});

	backup.superclass.constructor.apply(this, arguments);
	this.on('render', loadTool, this);
	
	
	/************* CORE FUNCTIONS *****************/
	function loadTool() {
		Ext.loadmask.show();
		
		Ext.Ajax.request({
			url:xrb.backup.data,
			params:{get:'backup'},
			success: function(rsp,obj) {
				var r = Ext.decode(rsp.responseText);
				var bkp = Ext.query2object(r.bkp);
				
				for(var i=0;i<bkp.length;i++) {
					nm = bkp[i].SYSID.split(',')[0].split("=")[1];
					storeBackup.add(new bkprec({
						id:bkp[i].ID,
						sysid:bkp[i].SYSID,
						nm:nm,
						recurtype:bkp[i].RECURTYPE,
						recur:bkp[i].RECUR,
						durtype:bkp[i].DURTYPE,
						dur:bkp[i].DUR,
						startdt:bkp[i].STARTDT,
						starttm:bkp[i].STARTDT,
						enddt:bkp[i].ENDDT,
						endtm:bkp[i].ENDDT,
						note:bkp[i].NOTE
					}));
				}
				
				//Hide the loading mask
				Ext.loadmask.hide();
			}
		});
	}
	
	function loadFormButtons() {
		var tb = form.getTopToolbar();
		if (tb.items.length>0)
			tb.removeAll();
		tb.add('->');
		tb.add({
			text:xrb.backup.updateButton,
			iconCls:'icon-save',
			disabled:true,
			handler:function(){
				registerBackup(true);
			}
		});
		tb.doLayout();
	}
	
	function loadForm(d,newbkp) {
		var f = form.items.get(0).items;
		var id = "new";
		
		if (newbkp==undefined||newbkp==null)
			newbkp = false;
		if (!newbkp) {
			id = d.id;
			loadFormButtons();
		}
				
		f.get(0).setValue(d.nm,true);
		for(var i=0;i<f.get(3).items.length;i++)
			f.get(3).items.get(i).setValue(false);
		if (!isNaN(parseFloat(d.recurtype))) {
			for(var i=0;i<d.recurtype.toString().trim().length;i++)
				f.get(3).items.get(parseFloat(d.recurtype.toString().trim().substr(i,1))-1).setValue(true);
			f.get(1).items.get(0).disable();
		} else if (d.recur>0) {
			f.get(1).items.get(0).setValue(d.recur);
			f.get(1).items.get(1).setValue(d.recurtype,true);
			f.get(1).items.get(0).enable();
		} else {
			f.get(1).items.get(0).reset();
			f.get(1).items.get(1).reset();
			f.get(1).items.get(0).enable();
		}
		if (d.dur>0) {
			f.get(4).items.get(0).setValue(d.dur);
			f.get(4).items.get(1).setValue(d.durtype,true);
		} else {
			f.get(4).items.get(0).reset();
			f.get(4).items.get(1).reset();
		}
		f.get(5).setValue(new Date(d.startdt).format('m/d/Y'),true);
		f.get(6).setValue(new Date(d.startdt).format('g:i A'),true);
		f.get(6).validate();
		if (d.enddt==null) {
			f.get(7).reset();
			f.get(8).reset();
		} else if (d.enddt.trim().length>0) {
			f.get(7).setValue(new Date(d.enddt).format('m/d/Y'),true);
			f.get(8).setValue(new Date(d.enddt).format('g:i A'),true);
		} else {
			f.get(7).reset();
			f.get(8).reset();
		}
		f.get(8).validate();
		f.get(9).setValue(d.note,true);
		f.get(10).setValue(id);
		
		//Enable form
		form.enable();
	}
	
	function getFormValues() {
		var f = form.items.get(0);
		var d = {};
		
		//Create form data
		d.nm=f.items.get(0).getValue();
		d.sysid=Ext.storeComputers.getAt(Ext.storeComputers.find('nm',d.nm)).data.dn;
		d.recur = f.items.get(1).items.get(0).getValue();
		d.recurtype = f.items.get(1).items.get(1).getValue();
		d.dow = '';
		for (var i=0;i<f.items.get(3).items.length;i++) {
			if (f.items.get(3).items.get(i).checked) {
				var x = i+1;
				d.dow += x.toString();
			}
		}
		d.dur = f.items.get(4).items.get(0).getValue();
		d.durtype = f.items.get(4).items.get(1).getValue();
		d.startdt=f.items.get(5).getValue();
		d.starttm=f.items.get(6).getValue();
		d.enddt=f.items.get(7).getValue();
		d.endtm=f.items.get(8).getValue();
		d.note=f.items.get(9).getValue();
		d.id=f.items.get(10).getValue();
		
		return d;
	}
	
	function registerBackup(edt){
		var action = 'createbackup';
		var d = getFormValues();
		var tmp = d;

		if (edt==undefined||edt==null)
			edt=false;
		if (edt) {
			action='updatebackup';
			storeBackup.remove(storeBackup.getAt(storeBackup.find('id',d.id)));
		}
		
		//Format dates for processing
		d.startdt = new Date(d.startdt).format('Y-m-d').toString();
		if (d.enddt.toString().trim().length>0)
			d.enddt = new Date(d.enddt).format('Y-m-d').toString();
		
		Ext.savemessage.show();
		Ext.Ajax.request({
			url:xrb.backup.data,
			params:{post:action,data:Ext.encode(d)},
			success:function(rsp,obj) {
				var r = Ext.decode(rsp.responseText);
				var dt = d.startdt.split('-');
				tmp.startdt = new Date(dt[1]+'/'+dt[2]+'/'+dt[0]+' '+tmp.starttm);
				if (d.enddt.toString().trim().length>0) {
					dt = d.enddt.split('-');
					tmp.enddt = new Date(dt[1]+'/'+dt[2]+'/'+dt[0]+' '+tmp.endtm);
				}
				storeBackup.add(new bkprec({
					id:r.id,
					sysid:d.sysid,
					nm:d.nm,
					recurtype:d.recurtype.trim().length>0?d.recurtype:d.dow,
					recur:d.recur,
					durtype:d.durtype,
					dur:d.dur,
					startdt:tmp.startdt,
					starttm:tmp.starttm,
					enddt:tmp.enddt,
					endtm:tmp.endtm,
					note:d.note
				}));
				form.items.get(0).getForm().reset();
				loadFormButtons();
				if(!edt)
					spot.hide();
				list.getSelectionModel().selectRow(storeBackup.find('id',r.id));
				list.getView().focusRow(storeBackup.find('id',r.id));
				loadForm(storeBackup.getAt(storeBackup.find('id',r.id)).data);
				Ext.savemessage.hide();
			}
		});
	}
	
	function renderDuration(value,metaData,record,rowIndex,colIndex,store) {
		var str = "";
		var type = "";
		var d = record.data;

		if (d.dur<0)
			str += 'Unknown'
		else {
			type = Ext.getTimePeriodText(d.durtype,d.dur!=1);
			str += type;
			if (type.toLowerCase()!='unknown')
				str = d.dur+' '+str;
		}
		
		return String.format(str);
	}
	
	function renderRecur(value,metaData,record,rowIndex,colIndex,store) {
		var str = "";
		var type = "";
		var d = record.data;

		if (d.recur<0&&d.dow.toString().trim().length>0)
			str += 'Unknown'
		else {
			type = Ext.getTimePeriodText(d.recurtype,d.recur!=1);
			str += type;
			if (type.toLowerCase()!='unknown' && d.recur!=1)
				str = d.recur+' '+str;
			else if (d.recur==1)
				str = Ext.capitalize(str);
		}
		
		return String.format(str);
	}
	
	function getSystemID() {
		return main.ownerCt.id.replace(/tab\_/g,'');
	}
	
	/********EXTEND GLOBAL FUNCTIONALITY*********/
	
};
Ext.extend(backup, Ext.Panel, {});