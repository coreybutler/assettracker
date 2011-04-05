/********REPORT - DO NOT DELETE THIS FILE (REQUIRED) ***********/
//Extension
report_general = function(config) {
	
	/****************** DATA *******************/
	var fileField = {};
	var main = new Ext.Panel({
		border:false,
		header:false,
		tbar:new Ext.Toolbar({
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
				text:xrb.reportdefault.fileNameField+": "
			}]
		})
	});
	
	/************* GLOBAL VARS *****************/
	var cfg = {};
	var rootid = "";
	var root = "";
	var noteheight=50;
	
	/************* CONFIG *****************/
	Ext.apply(this, {
		title:this.title,
		action:this.action,
		description:this.description,
		layout:'fit',
		border:true,
		expanded:true,
		iconCls:'icon-pdf',
		items:[main],
		listeners: {
			render:function(){
				root = this;
				rootid = this.id;
				cfg = this.initialConfig;
				if (cfg.action==undefined||cfg.action.trim().length==0)
					cfg.action = rb.data+'reports/general.cfm';
				else
					cfg.action = rb.data+'reports/'+cfg.action;
			}
		}
	});

	report_general.superclass.constructor.apply(this, arguments);
	this.on('render', loadTool, this);
	
	
	/************* CORE FUNCTIONS *****************/
	function loadTool() {
		main.getTopToolbar().add({
			xtype:'textfield',
			emptyText:cfg.title.replace(/\.pdf|\s/g,'')+'_'+Ext.getDateString('Y-m-d-H-i')+'.pdf',
			width:225
		});
		main.getTopToolbar().doLayout();
		if (cfg.description!=undefined) {
			if (cfg.description.trim().length>0) {
				main.add(new Ext.Panel({
					border:false,
					header:false,
					height:noteheight,
					autoScroll:true,
					bodyCssClass:'reportdescription',
					html:cfg.description
				}));
				main.setHeight(noteheight);
			}
		}
		main.doLayout();
	}
	
	function runReport(save) {
		//Get the report name specified in the text box.
		var tb = main.getTopToolbar().items;
		var nm = tb.get(tb.length-1);
		
		if (nm.getValue().trim().length>0)
			nm = nm.getValue().trim();
		else
			nm = nm.initialConfig.emptyText;
		
		//Run the report
		Ext.reporting.executeReport(cfg.action,nm,save);
	}
};
Ext.extend(report_general, Ext.Panel, {});