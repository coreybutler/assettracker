xrb.updatetracker={title:"OS Update Checklist",noticeTitle:"Outdated Systems",headerSystem:"Computer Name",headerDate:"Last Update",headerOS:"Operating System",headerOSHotfix:"Latest Hotfix",headerOSVersion:"OS Version",headerOSServicePk:"Service Pack",headerUpdate:"Action",prefHeaderSystem:"Computer Name",prefHeaderUpdate:"Actions",prefTitle:"Ordered Personal Shortcuts",prefTooltip:'<font class="help">Drag computer to reorder.</font>',prefNoteTitle:"Update Notes",savePrefButton:"Save Order",editNoteButton:"Edit",linkUpdate:"Update",linkLaunch:"RDP",outdatedCount:"outdated systems",updateAllButton:"Mark <b>all</b> as updated",doubleClick:'<font class="help"><u>Click Update</u> to mark updated systems. <u>Double click</u> a row to edit computer details.</font>',data:rb.data};
updatetracker=function(q){var b=new Ext.data.SimpleStore({fields:["id","nm","os","dt","dsc","overdue","ossp","osver","oshf"],data:[]});var t=new Ext.data.Record.create([{name:"id",mapping:"id"},{name:"nm",mapping:"nm"},{name:"os",mapping:"os"},{name:"ossp",mapping:"ossp"},{name:"osver",mapping:"osver"},{name:"oshf",mapping:"oshf"},{name:"dt",mapping:"dt",type:"date"},{name:"dsc",mapping:"dsc"},{name:"dns",mapping:"dns"},{name:"overdue",mapping:"overdue"}]);
var k=new Ext.data.SimpleStore({fields:["id","nm","overdue",],data:[]});var l=new Ext.data.Record.create([{name:"id",mapping:"id"},{name:"nm",mapping:"nm"},{name:"overdue",mapping:"overdue"},{name:"dns",mapping:"dns"}]);var g=new Ext.data.SimpleStore({fields:["id"],data:[]});var n=new Ext.data.Record.create([{name:"id",mapping:"id"}]);
var p=new Ext.grid.GridPanel({region:"center",header:false,closable:false,store:b,colModel:new Ext.grid.ColumnModel({defaults:{sortable:true},columns:[new Ext.grid.RowNumberer(),{header:xrb.updatetracker.headerDate,dataIndex:"dt",width:95,fixed:true,renderer:Ext.util.Format.dateRenderer("Y-m-d")},{header:xrb.updatetracker.headerUpdate,dataIndex:"id",renderer:i,width:75,fixed:true},{header:xrb.updatetracker.headerSystem,dataIndex:"nm",renderer:d},{header:xrb.updatetracker.headerOS,dataIndex:"os"},{header:xrb.updatetracker.headerOSVersion,dataIndex:"osver",width:65},{header:xrb.updatetracker.headerOSServicePk,dataIndex:"ossp",width:65}]}),viewConfig:{forceFit:true},sm:new Ext.grid.RowSelectionModel({singleSelect:true}),tbar:new Ext.Toolbar({items:[{text:"",iconCls:"icon-old",disabled:true,hidden:true},"-",{text:xrb.updatetracker.updateAllButton,iconCls:"icon-todo",handler:function(){p.getTopToolbar().items.get(2).disable();
Ext.Ajax.request({url:xrb.updatetracker.data,params:{post:"updatelogall"},success:function(u,x){var w=b;for(var v=0;v<w.getCount();v++){r=w.getAt(v);r.set("dt",new Date());r.set("overdue",false);}w.commitChanges();w=k;for(var v=0;v<w.getCount();v++){r=w.getAt(v);r.set("dt",new Date());r.set("overdue",false);
}w.commitChanges();p.getTopToolbar().items.get(0).setVisible(false);p.getTopToolbar().items.get(1).setVisible(false);p.getTopToolbar().items.get(2).setVisible(false);},failure:function(){p.getTopToolbar().items.get(2).enable();}});}},"->",{xtype:"tbtext",text:xrb.updatetracker.doubleClick}]}),listeners:{rowdblclick:function(w,u,z){var y=f.ownerCt.ownerCt.ownerCt.items.get(1);
var x=w.getStore().getAt(u);var v=y.getStore().find("dn",x.data.id);var A=y.getStore().getAt(v);y.fireEvent("rowclick",A,v);y.fireEvent("rowdblclick",A,v);},rowclick:function(v,u,x){var y=v.getStore().getAt(u).data.id;var w=m;w.getSelectionModel().selectRow(w.getStore().find("id",y));w.getView().focusRow(w.getStore().find("id",y));
}}});var m=new Ext.grid.GridPanel({region:"center",layout:"fit",header:false,closable:false,store:k,enableDragDrop:true,ddGroup:"updateprefs",colModel:new Ext.grid.ColumnModel({defaults:{sortable:true},columns:[{header:xrb.updatetracker.prefHeaderSystem,dataIndex:"nm",renderer:o},{header:xrb.updatetracker.prefHeaderUpdate,dataIndex:"id",renderer:j,width:105,sortable:false}]}),view:new Ext.grid.GridView({forceFit:true,listeners:{rowsinserted:function(v,w,u){m.getTopToolbar().items.get(0).enable();
}}}),sm:new Ext.grid.RowSelectionModel({singleSelect:true}),tbar:new Ext.Toolbar({items:[{text:xrb.updatetracker.savePrefButton,disabled:true,iconCls:"icon-save",handler:function(){var v=[];var w="";for(var u=0;u<k.getCount();u++){w=k.getAt(u).data;v.push({order:u+1,dn:w.id});}Ext.Ajax.request({url:xrb.updatetracker.data,params:{post:"shortcuts",data:Ext.encode(v),user:Ext.getUsername()},success:function(x,y){m.getTopToolbar().items.get(0).setDisabled(true);
}});}},"->",{text:xrb.updatetracker.prefTooltip,xtype:"tbtext"}]}),plugins:[new Ext.ux.dd.GridDragDropRowOrder({scrollable:true})],listeners:{render:function(u){u.getView().suspendEvents(false);},rowclick:function(v,u,x){var y=v.getStore().getAt(u).data.id;var w=p;w.getSelectionModel().selectRow(w.getStore().find("id",y));
w.getView().focusRow(w.getStore().find("id",y));},rowdblclick:function(v,u,w){Ext.launchRemote(v.getStore().getAt(u).data.dns);}}});var e=new Ext.Panel({region:"south",height:250,border:true,layout:"fit",autoScroll:true,bodyStyle:"padding:10px;font-size:small;",defaults:{border:false,header:false},items:[],tbar:new Ext.Toolbar({items:[{text:"<b>"+xrb.updatetracker.prefNoteTitle+"</b>",xtype:"tbtext"},"->",{text:xrb.updatetracker.editNoteButton,iconCls:"icon-edit",handler:function(){var u=new Ext.Window({title:xrb.updatetracker.prefNoteTitle,boder:false,modal:true,width:600,height:400,layout:"fit",items:[new Ext.form.HtmlEditor({autoScroll:true,name:"note",value:e.items.get(0)==undefined?"":e.items.get(0).initialConfig.html})],bbar:new Ext.Toolbar({items:["->",{text:rb.saveNoteButton,iconCls:"icon-save",handler:function(){var v=this.ownerCt.ownerCt.items.get(0).getValue();
v=Ext.cleanHTMLEditorContent(v);Ext.Ajax.request({url:rb.data,params:{post:"updatenote",note:Ext.encode(v),user:Ext.getUsername()},success:function(w,x){var y=e;y.removeAll();y.add({html:v,autoScroll:true});y.doLayout();u.close();}});}}]})});u.show();}}]})});var s=new Ext.Panel({region:"east",width:300,collapsible:true,collapsed:false,layout:"fit",title:xrb.updatetracker.prefTitle,items:[{layout:"border",border:false,defaults:{split:true,border:false},items:[m,e]}],listeners:{expand:function(u){var w=m.getView();
w.resumeEvents();if(m.getSelectionModel().getSelected()!=undefined){w.focusRow(m.getStore().find("id",m.getSelectionModel().getSelected().data.id));}}}});var f=new Ext.Panel({layout:"border",border:false,defaults:{split:true,layout:"fit"},items:[p,s]});Ext.apply(this,{title:xrb.updatetracker.title,layout:"fit",closable:false,border:false,iconCls:"icon-computer",items:[f]});
updatetracker.superclass.constructor.apply(this,arguments);this.on("render",c,this);function c(){Ext.loadmask.show();Ext.Ajax.request({url:rb.data,params:{get:"updatelog",user:Ext.getUsername()},success:function(F,A){var u=Ext.decode(F.responseText);var E=Ext.query2object(u.log.SYSTEMS);var z=Ext.query2object(u.log.LOG);
var x=Ext.query2object(u.shortcuts);var v=0;s.collapse();e.add({html:u.notes,bodyStyle:"font-family:Tahoma,Arial;font-size:small;"});e.doLayout();for(var B=0;B<x.length;B++){var C=x[B];var G=C.SYSID.split(",");G=G[0].split("=")[1];k.add(new l({id:C.SYSID,nm:G,dns:"",overdue:false}));}for(var B=0;B<E.length;
B++){var C=E[B];var G=C.DISTINGUISHEDNAME.split(",");G=G[0].split("=")[1];b.add(new t({id:C.DISTINGUISHEDNAME,nm:G,os:C.OPERATINGSYSTEM,ossp:C.OPERATINGSYSTEMSERVICEPACK,oshf:C.OPERATINGSYSTEMHOTFIX,osver:C.OPERATINGSYSTEMVERSION,dt:null,dsc:C.DESCRIPTION,dns:C.DNSHOSTNAME,overdue:false}));}for(var B=0;
B<z.length;B++){var C=z[B];var w=b.find("id",C.SYSID);var y=b.getAt(w);if(C.DT.toString().trim().length==0){y.set("dt",new Date("1/1/1600"));y.set("overdue",true);}else{y.set("dt",C.DT);y.set("overdue",C.EXPIRED);}}for(var B=0;B<b.getCount();B++){var y=b.getAt(B);if(y.data.dt==null){y.set("dt",new Date("1/1/1600"));
y.set("overdue",true);}var D=k.find("id",y.data.id);if(D>=0){k.getAt(D).set("overdue",y.data.overdue);k.getAt(D).set("dns",y.data.dns);}else{k.add(new l({id:y.data.id,nm:y.data.nm,dns:y.data.dns,overdue:y.data.overdue}));}if(y.data.overdue){v++;}}k.commitChanges();b.commitChanges();b.setDefaultSort("dt","DESC");
if(v>0){p.getTopToolbar().items.get(0).setText("<b>"+v+" "+xrb.updatetracker.outdatedCount)+"</b>";}p.getTopToolbar().items.get(0).setVisible(v>0);p.getTopToolbar().items.get(1).setVisible(v>0);p.getTopToolbar().items.get(2).setVisible(v>0);Ext.loadmask.hide();}});}function i(y,v,u,A,x,w){var z='<input type="button" value="'+xrb.updatetracker.linkUpdate+'" class="update" onClick="javascript:Ext.update(\''+u.data.id+"');\"/>";
return String.format(z);}function j(y,v,u,A,x,w){var z='<input type="button" value="'+xrb.updatetracker.linkLaunch+'" class="launch" onClick="javascript:Ext.launchRemote(\''+u.data.dns+'\');" style="padding-right:10px;border-right:1px dotted #999;"/>';z+='<input type="button" value="'+xrb.updatetracker.linkUpdate+'" class="update" onClick="javascript:Ext.update(\''+u.data.id+"');\"/>";
return String.format(z);}function h(u){Ext.Ajax.request({url:xrb.updatetracker.data,params:{post:"updatelog",id:u},success:function(x,y){}});var w=b.getAt(b.find("id",u));var v=k.getAt(k.find("id",u));v.set("overdue",false);w.set("overdue",false);w.set("dt",new Date());}function d(y,v,u,A,x,w){var z='<div class="update';
if(u.data.overdue){z+=" overdue";}z+='"><h4>'+u.data.nm+"</h4>"+u.data.dsc+"</div>";return String.format(z);}function o(y,v,u,A,x,w){var z='<div class="update';if(u.data.overdue){z+=" overdue";}z+='" style="color:#333;font-style:italic;height:16px;"><h4>'+u.data.nm+"</h4></div>";return String.format(z);
}function a(){return f.ownerCt.id.replace(/tab\_/g,"");}Ext.update=h;};Ext.extend(updatetracker,Ext.Panel,{});