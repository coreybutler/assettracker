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
//Resource Bundle/Language Pack
xrb.rptsys = {
	instructions:			'Select the properties and items you wish to include in the report.',
	propertyFormTitle:		'<i><u>System Properties</u></i>',
	includeFormTitle:		'<i><u>Additional Options</u></i>',
	formAppLabel:			'Each Computer\'s Applications',
	formNotesLabel:			'Each Computer\'s Administrator Notes',
	formLocationLabel:		'Each Computer\'s Physical Location',
	fileName:				'adminguide.pdf',
	fileNameField:			'Save As',
	clearPropertyButton:	'Clear',
	invertPropertyButton:	'Invert',
	allPropertyButton:		'Select All',
	clearOptionButton:		'Clear',
	allOptionButton:		'Select All',
	invertOptionButton:		'Invert',
	data:					'./data/report.cfm'			//Uses default URL from parent
};


//Extension
report_networkinventory = function(config) {
	
	/****************** DATA *******************/
	
	/************* GLOBAL VARS *****************/
	var cfg = {};
	var rootid = "";
	var propList = [];
	var main = new Ext.Panel({
		iconCls:'icon-user-gray',
		layout:'fit',
		closable:false,
		collapsed:true,
		collapsible:true,
		border:false,
		titleCollapse:true,
		autoScroll:true,
		bbar: new Ext.Toolbar({
			items:[{
				text:xrb.reportdefault.generate,
				iconCls:'icon-play',
				handler:runReport
			},{
				text:xrb.reportdefault.generateSave,
				iconCls:'icon-folder-go',
				handler:function(){
					runReport(true);	
				}
			},'->',{
				xtype:'tbtext',
				text:xrb.rptsys.fileNameField+": "
			},{
				xtype:'textfield',
				emptyText:xrb.rptsys.fileName.replace(/\.pdf/g,'')+'_'+Ext.getDateString('Y-m-d-H-i')+'.pdf',
				width:225
			}]		
		})
	});
	
	
	/************* CONFIG *****************/
	Ext.apply(this, {
		title:this.title,
		action:this.action,
		header:false,
		layout:'fit',
		border:true,
		expanded:true,
		items:[main],
		listeners: {
			render:function(){
				rootid = this.id;
				cfg = this.initialConfig;
				if (cfg.action==undefined||cfg.action.trim().length==0)
					cfg.action = rb.data+'reports/general.cfm';
				else
					cfg.action = rb.data+'reports/'+cfg.action;
			}
		}
	});

	report_networkinventory.superclass.constructor.apply(this, arguments);
	this.on('render', loadTool, this);
	
	
	/************* CORE FUNCTIONS *****************/
	function loadTool() {
		loadmask = new Ext.LoadMask(this.getEl(),{msg:rb.defaults.loadmessage})
		var m = loadmask;
		m.show();
		
		main.setTitle(cfg.title+' &raquo; <font class=\"headerTip\">'+xrb.rptsys.instructions+'</font>');
		
		//Get data (properties)
		Ext.Ajax.request({
			url:rb.data,
			params:{get:'properties',user:Ext.getUsername()},
			success: function(rsp,obj) {
				var r = Ext.decode(rsp.responseText);
				var h = 110+(r.properties.length*25);
				h=h>300?300:h<200?200:h;
				propList = r.properties;
				
				//Create shell UI objects
				var form = new Ext.form.FormPanel({
					region:'center',
					header:false,
					border: false,
					height:h,
					autoScroll: true,
					defaults: {msgTarget:'under',width:165,xtype:'checkbox',hideLabel:true,border:false,header:false},
					items:[{
						xtype:'panel',
						html:xrb.rptsys.propertyFormTitle,
						height:25
					}],
					tbar:new Ext.Toolbar({
						items:[{
							text:xrb.rptsys.allPropertyButton,
							iconCls:'icon-check',
							handler:function(){
								main.items.get(0).items.get(0).getForm().reset();
							}
						},{
							text:xrb.rptsys.clearPropertyButton,
							iconCls:'icon-remove',
							handler:function(){
								var f = main.items.get(0).items.get(0).items;
								for (i=0;i<f.length;i++) {
									if (f.get(i).getXType()=='checkbox')
										f.get(i).setValue(false);
								}
							}
						},{
							text:xrb.rptsys.invertPropertyButton,
							iconCls:'icon-invert',
							handler:function(){
								var f = main.items.get(0).items.get(0).items;
								for (i=0;i<f.length;i++) {
									if (f.get(i).getXType()=='checkbox')
										f.get(i).setValue(!f.get(i).checked);
								}
							}
						},'->','-']
					})
				});
				main.setHeight(h+25);
				
				//Populate properties form
				for(var i=0;i<propList.length;i++) {
					form.add({
						boxLabel:propList[i],
						checked:true,
						name:'property',
						value:propList[i]
					});
				}
				
				var incForm = new Ext.form.FormPanel({
					region:'east',
					header:false,
					border:true,
					width: 330,
					autoScroll: true,
					defaults: {msgTarget:'under',width:280,xtype:'checkbox',hideLabel:true,border:false,header:false,bodyStyle:'color;#555;'},
					items:[{
						xtype:'panel',
						html:xrb.rptsys.includeFormTitle,
						height:25
					},{
						boxLabel:xrb.rptsys.formAppLabel,
						checked:true,
						name:'include',
						inputValue:'applications'
					},{
						boxLabel:xrb.rptsys.formNotesLabel,
						checked:true,
						name:'include',
						inputValue:'notes'
					},{
						boxLabel:xrb.rptsys.formLocationLabel,
						checked:true,
						name:'include',
						inputValue:'location'
					}],
					tbar:new Ext.Toolbar({
						items:[{
							text:xrb.rptsys.allOptionButton,
							iconCls:'icon-check',
							handler:function(){
								main.items.get(0).items.get(1).getForm().reset();
							}
						},{
							text:xrb.rptsys.clearOptionButton,
							iconCls:'icon-remove',
							handler:function(){
								var f = main.items.get(0).items.get(1).items;
								for (i=0;i<f.length;i++) {
									if (f.get(i).getXType()=='checkbox')
										f.get(i).setValue(false);
								}
							}
						},{
							text:xrb.rptsys.invertOptionButton,
							iconCls:'icon-invert',
							handler:function(){
								var f = main.items.get(0).items.get(1).items;
								for (i=0;i<f.length;i++) {
									if (f.get(i).getXType()=='checkbox')
										f.get(i).setValue(!f.get(i).checked);
								}
							}
						}]
					})
				});
				
				var shell = new Ext.Panel({
					layout:'border',
					border:false,
					defaults:{bodyStyle:Ext.standardBodyStyle,border:false},
					items:[form,incForm]
				});
				main.add(shell);
				main.doLayout();
				
				//Hide the loading mask
				m.hide();
			}
		});
	}
	
	function runReport(save) {
		var tb = main.getBottomToolbar().items;
		var nm = tb.get(tb.length-1);
		var shell = main.items.get(0);
		var p = shell.items.get(0).items;
		var o = shell.items.get(1).items;
		var act = cfg.action;
		var props = [];
		var includes = [];
		
		//Add basic parameters
		act += "?format=pdf";
		
		//Add properties
		for(var i=0;i<p.length;i++) {
			if (p.get(i).checked)
				props.push(p.get(i).initialConfig.boxLabel);
		}
		act += "&properties="+props.toString();
		
		//Add other includes
		if (o!=undefined) {
			for(var i=1;i<o.length;i++) {
				if (o.get(i).checked)
					includes.push(o.get(i).initialConfig.inputValue);
			}
		}
		act += "&includes="+includes.toString();
				
		//Get the report name specified in the text box.
		if (nm.getValue().trim().length>0)
			nm = nm.getValue().trim();
		else
			nm = nm.initialConfig.emptyText;

		//Execute report
		Ext.reporting.executeReport(act,nm,save);
	}
	
};
Ext.extend(report_networkinventory, Ext.Panel, {});