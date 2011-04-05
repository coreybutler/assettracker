xrb.backup={title:"Regular Backup Schedule",fieldComputer:"Computer",fieldComputerEmpty:"Select Computer...",fieldRecur:"Runs Every",fieldRecurEmpty:"Select Frequency...",fieldDur:"Runs For",fieldDurEmpty:"Select Frequency...",fieldDateStart:"Started On",fieldDateStartTime:"Runs At",fieldDateEnd:"Expires On",fieldDateEndTime:"Expires By",fieldNote:"Notes",headerComputer:"Computer",headerDuration:"Runs For",headerDurtype:"Type",headerRecur:"Runs Every",headerRecurtype:"Frequency",headerBegin:"First Ran",headerBeginTime:"Runs at",headerEnd:"Expires On",warnRemoveTitle:"Remove a Schedule",warnRmoveText:"You are about to remove a backup from the schedule. This cannot be undone. Are you sure you wish to continue?",removeButton:"Delete Backup from Schedule",newButton:"Add New Backup to Schedule",updateButton:"Save Changes",createButton:"Create",cancelButton:"Cancel",reportButton:"Download Report",reportOptList:"List of Backups",reportOptListNotes:"List of Backups (w/Notes)",reportOptCal:"Week View",reportOptCalNotes:"Week View (w/Notes)",toggleTooltip:"Expand/Collapse All",runEveryTitle:"<i>- OR WEEKLY EVERY -</i>",reportURL:rb.data+"reports/backup.cfm",data:rb.data};
backup=function(s){var r=new Ext.data.SimpleStore({fields:["id","sysid","nm","recurtype","recur","durtype","dur","startdt","enddt","note"],data:[]});var t=new Ext.data.Record.create([{name:"id",mapping:"id"},{name:"sysid",mapping:"sysid"},{name:"nm",mapping:"nm"},{name:"recurtype",mapping:"recurtype"},{name:"recur",mapping:"recur"},{name:"durtype",mapping:"durtype"},{name:"dur",mapping:"dur"},{name:"startdt",mapping:"startdt"},{name:"enddt",mapping:"enddt"},{name:"note",mapping:"note"}]);
var c=new Ext.data.SimpleStore({fields:["nm","cd"],data:[["Minutes","n"],["Hours","h"],["Days","d"],["Weeks","w"],["Months","m"]]});var a=new Ext.data.Record.create([{name:"nm",mapping:"nm"},{name:"cd",mapping:"cd"}]);var n=new Ext.data.SimpleStore({fields:["nm","cd"],data:[["Sunday",1],["Monday",2],["Tuesday",3],["Wednesday",4],["Thursday",5],["Friday",6],["Saturday",7]]});
var o=new Ext.data.Record.create([{name:"nm",mapping:"nm"},{name:"cd",mapping:"cd"}]);var j=new Ext.ux.Spotlight({easing:"easeOut",duration:0.3});var k=new Ext.ux.grid.RowExpander({tpl:new Ext.Template('<p class="griddropdown">{note}</p>')});var d=new Ext.Panel({region:"east",iconCls:"icon-edit",width:"33%",boxMinWidth:300,bodyStyle:"padding:10px;",layout:"fit",disabled:true,defaults:{border:false,header:false},items:[new Ext.form.FormPanel({monitorValid:true,defaults:{xtype:"textfield",width:200},listeners:{render:function(){g();
},clientvalidation:function(u,v){tb=d.getTopToolbar();if(tb.items.length>0){tb.items.get(tb.items.length-1).setDisabled(!v);}}},items:[new Ext.form.ComboBox({fieldLabel:xrb.backup.fieldComputer+"*",store:Ext.storeComputers,displayField:"nm",valueField:"nm",typeAhead:false,mode:"local",triggerAction:"all",emptyText:xrb.backup.fieldComputerEmpty,selectOnFocus:true,allowBlank:false,forceSelection:true,editable:false,name:"sysid"}),{fieldLabel:xrb.backup.fieldRecur+"*",xtype:"panel",layout:"border",plain:true,bodyStyle:"background:#fff;",border:false,header:false,height:22,items:[{region:"west",xtype:"textfield",width:40,split:true,emptyText:"#...",name:"recur",maskRe:/[0-9]/},new Ext.form.ComboBox({region:"center",width:50,store:c,displayField:"nm",valueField:"cd",typeAhead:false,mode:"local",triggerAction:"all",emptyText:xrb.backup.fieldRecurEmpty,selectOnFocus:true,forceSelection:true,editable:false,name:"recurtype"})]},{xtype:"panel",fieldLabel:" ",labelSeparator:" ",plain:true,bodyStyle:"background:#fff;",border:false,header:false,html:xrb.backup.runEveryTitle},{xtype:"panel",fieldLabel:" ",labelSeparator:" ",plain:true,bodyStyle:"background:#fff;",border:false,header:false,defaults:{xtype:"checkbox",bodyStyle:"font-size:x-small;"},listeners:{render:function(){for(var u=0;
u<n.getCount();u++){this.add({boxLabel:n.getAt(u).data.nm,value:n.getAt(u).data.cd,checked:false,name:"dow",listeners:{check:function(w,A){var v=this.ownerCt.items;var y=false;for(var z=0;z<v.length;z++){if(v.get(z).checked){this.ownerCt.ownerCt.items.get(1).disable();y=true;break;}}if(!y){this.ownerCt.ownerCt.items.get(1).enable();
}}}});}}}},{fieldLabel:xrb.backup.fieldDur+"*",xtype:"panel",layout:"border",plain:true,bodyStyle:"background:#fff;",border:false,header:false,height:22,items:[{region:"west",xtype:"textfield",width:40,split:true,emptyText:"#...",name:"dur",maskRe:/[0-9]/,allowBlank:false},new Ext.form.ComboBox({region:"center",width:50,store:c,displayField:"nm",valueField:"cd",typeAhead:false,mode:"local",triggerAction:"all",emptyText:xrb.backup.fieldDurEmpty,selectOnFocus:true,forceSelection:true,editable:false,name:"durtype",allowBlank:false})]},new Ext.form.DateField({fieldLabel:xrb.backup.fieldDateStart+"*",allowBlank:false,value:new Date(),name:"start"}),new Ext.form.TimeField({fieldLabel:xrb.backup.fieldDateStartTime,allowBlank:false,increment:5,value:"12:00 AM",name:"starttime"}),new Ext.form.DateField({fieldLabel:xrb.backup.fieldDateEnd,name:"end"}),new Ext.form.TimeField({fieldLabel:xrb.backup.fieldDateEndTime,increment:5,name:"endtime"}),new Ext.form.TextArea({fieldLabel:xrb.backup.fieldNote,height:175}),new Ext.form.Hidden({name:"id",value:"new"})]})],tbar:new Ext.Toolbar()});
var q=new Ext.grid.GridPanel({region:"center",header:false,closable:false,store:r,colModel:new Ext.grid.ColumnModel({defaults:{sortable:true},columns:[k,{header:xrb.backup.headerComputer,dataIndex:"nm",css:"font-weight:bold;"},{header:xrb.backup.headerRecur,dataIndex:"durtype",renderer:h},{header:xrb.backup.headerDuration,dataIndex:"dur",renderer:l},{header:xrb.backup.headerBeginTime,dataIndex:"startdt",fixed:true,width:60,fixed:true,renderer:Ext.util.Format.dateRenderer("g:i a")},{header:xrb.backup.headerBegin,dataIndex:"startdt",fixed:true,width:100,fixed:true,renderer:Ext.util.Format.dateRenderer("D, M j, Y")},{header:xrb.backup.headerEnd,dataIndex:"enddt",fixed:true,width:145,fixed:true,renderer:Ext.util.Format.dateRenderer("D, M j, Y g:i a")}]}),viewConfig:{forceFit:true},sm:new Ext.grid.RowSelectionModel({singleSelect:true}),plugins:k,tbar:new Ext.Toolbar({items:[{iconCls:"icon-expandall",enableToggle:true,tooltip:xrb.backup.toggleTooltip,listeners:{toggle:function(v,w){for(var u=0;
u<q.store.getCount();u++){if(w){q.plugins.expandRow(u);}else{q.plugins.collapseRow(u);}}}}},"-",{text:xrb.backup.reportButton,iconCls:"icon-pdf",menu:new Ext.menu.Menu({items:[{text:xrb.backup.reportOptList,handler:function(){document.location=xrb.backup.reportURL+"?format=pdf&type=list&notes=0";}},{text:xrb.backup.reportOptListNotes,handler:function(){document.location=xrb.backup.reportURL+"?format=pdf&type=list&notes=1";
}},"-",{text:xrb.backup.reportOptCal,handler:function(){document.location=xrb.backup.reportURL+"?format=pdf&type=calendar&notes=0";}},{text:xrb.backup.reportOptCalNotes,handler:function(){document.location=xrb.backup.reportURL+"?format=pdf&type=calendar&notes=1";}}]})},"->",{text:xrb.backup.removeButton,iconCls:"icon-remove",handler:function(){Ext.Msg.show({title:xrb.backup.warnRemoveTitle,msg:xrb.backup.warnRmoveText,buttons:Ext.Msg.YESNO,icon:Ext.MessageBox.WARNING,fn:function(u){if(u=="yes"){var v=q.getSelectionModel().getSelected().data.id;
Ext.Ajax.request({url:xrb.backup.data,params:{post:"removebackup",id:v},success:function(w,x){r.remove(r.getAt(r.find("id",v)));d.items.get(0).getForm().reset();}});}}});}},"-",{text:xrb.backup.newButton,iconCls:"icon-add",handler:function(){var v=d.items.get(0);var u=d.getTopToolbar();v.getForm().reset();
d.enable();j.show(d.id);u.removeAll();u.add("->");u.add({text:xrb.backup.cancelButton,iconCls:"icon-cancel",handler:function(){var w=q.getSelectionModel().getSelected();d.getTopToolbar().removeAll();if(w!=undefined){e(w.data);d.enable();}else{d.disable();}d.getTopToolbar().doLayout();j.hide();}});u.add({text:xrb.backup.createButton,disabled:true,iconCls:"icon-add",handler:function(){m(false);
}});u.doLayout();}}]}),listeners:{rowclick:function(v,u,w){var x=r.getAt(u).data;e(x);}}});var i=new Ext.Panel({layout:"border",border:false,defaults:{split:true,layout:"fit"},items:[q,d]});Ext.apply(this,{title:xrb.backup.title,layout:"fit",closable:false,border:false,iconCls:"icon-calendar",items:[i]});
backup.superclass.constructor.apply(this,arguments);this.on("render",f,this);function f(){Ext.loadmask.show();Ext.Ajax.request({url:xrb.backup.data,params:{get:"backup"},success:function(u,y){var x=Ext.decode(u.responseText);var w=Ext.query2object(x.bkp);for(var v=0;v<w.length;v++){nm=w[v].SYSID.split(",")[0].split("=")[1];
r.add(new t({id:w[v].ID,sysid:w[v].SYSID,nm:nm,recurtype:w[v].RECURTYPE,recur:w[v].RECUR,durtype:w[v].DURTYPE,dur:w[v].DUR,startdt:w[v].STARTDT,starttm:w[v].STARTDT,enddt:w[v].ENDDT,endtm:w[v].ENDDT,note:w[v].NOTE}));}Ext.loadmask.hide();}});}function g(){var u=d.getTopToolbar();if(u.items.length>0){u.removeAll();
}u.add("->");u.add({text:xrb.backup.updateButton,iconCls:"icon-save",disabled:true,handler:function(){m(true);}});u.doLayout();}function e(x,v){var w=d.items.get(0).items;var y="new";if(v==undefined||v==null){v=false;}if(!v){y=x.id;g();}w.get(0).setValue(x.nm,true);for(var u=0;u<w.get(3).items.length;
u++){w.get(3).items.get(u).setValue(false);}if(!isNaN(parseFloat(x.recurtype))){for(var u=0;u<x.recurtype.toString().trim().length;u++){w.get(3).items.get(parseFloat(x.recurtype.toString().trim().substr(u,1))-1).setValue(true);}w.get(1).items.get(0).disable();}else{if(x.recur>0){w.get(1).items.get(0).setValue(x.recur);
w.get(1).items.get(1).setValue(x.recurtype,true);w.get(1).items.get(0).enable();}else{w.get(1).items.get(0).reset();w.get(1).items.get(1).reset();w.get(1).items.get(0).enable();}}if(x.dur>0){w.get(4).items.get(0).setValue(x.dur);w.get(4).items.get(1).setValue(x.durtype,true);}else{w.get(4).items.get(0).reset();
w.get(4).items.get(1).reset();}w.get(5).setValue(new Date(x.startdt).format("m/d/Y"),true);w.get(6).setValue(new Date(x.startdt).format("g:i A"),true);w.get(6).validate();if(x.enddt==null){w.get(7).reset();w.get(8).reset();}else{if(x.enddt.trim().length>0){w.get(7).setValue(new Date(x.enddt).format("m/d/Y"),true);
w.get(8).setValue(new Date(x.enddt).format("g:i A"),true);}else{w.get(7).reset();w.get(8).reset();}}w.get(8).validate();w.get(9).setValue(x.note,true);w.get(10).setValue(y);d.enable();}function p(){var w=d.items.get(0);var y={};y.nm=w.items.get(0).getValue();y.sysid=Ext.storeComputers.getAt(Ext.storeComputers.find("nm",y.nm)).data.dn;
y.recur=w.items.get(1).items.get(0).getValue();y.recurtype=w.items.get(1).items.get(1).getValue();y.dow="";for(var v=0;v<w.items.get(3).items.length;v++){if(w.items.get(3).items.get(v).checked){var u=v+1;y.dow+=u.toString();}}y.dur=w.items.get(4).items.get(0).getValue();y.durtype=w.items.get(4).items.get(1).getValue();
y.startdt=w.items.get(5).getValue();y.starttm=w.items.get(6).getValue();y.enddt=w.items.get(7).getValue();y.endtm=w.items.get(8).getValue();y.note=w.items.get(9).getValue();y.id=w.items.get(10).getValue();return y;}function m(x){var v="createbackup";var w=p();var u=w;if(x==undefined||x==null){x=false;
}if(x){v="updatebackup";r.remove(r.getAt(r.find("id",w.id)));}w.startdt=new Date(w.startdt).format("Y-m-d").toString();if(w.enddt.toString().trim().length>0){w.enddt=new Date(w.enddt).format("Y-m-d").toString();}Ext.savemessage.show();Ext.Ajax.request({url:xrb.backup.data,params:{post:v,data:Ext.encode(w)},success:function(y,B){var A=Ext.decode(y.responseText);
var z=w.startdt.split("-");u.startdt=new Date(z[1]+"/"+z[2]+"/"+z[0]+" "+u.starttm);if(w.enddt.toString().trim().length>0){z=w.enddt.split("-");u.enddt=new Date(z[1]+"/"+z[2]+"/"+z[0]+" "+u.endtm);}r.add(new t({id:A.id,sysid:w.sysid,nm:w.nm,recurtype:w.recurtype.trim().length>0?w.recurtype:w.dow,recur:w.recur,durtype:w.durtype,dur:w.dur,startdt:u.startdt,starttm:u.starttm,enddt:u.enddt,endtm:u.endtm,note:w.note}));
d.items.get(0).getForm().reset();g();if(!x){j.hide();}q.getSelectionModel().selectRow(r.find("id",A.id));q.getView().focusRow(r.find("id",A.id));e(r.getAt(r.find("id",A.id)).data);Ext.savemessage.hide();}});}function l(A,u,v,z,C,B){var x="";var y="";var w=v.data;if(w.dur<0){x+="Unknown";}else{y=Ext.getTimePeriodText(w.durtype,w.dur!=1);
x+=y;if(y.toLowerCase()!="unknown"){x=w.dur+" "+x;}}return String.format(x);}function h(A,u,v,z,C,B){var x="";var y="";var w=v.data;if(w.recur<0&&w.dow.toString().trim().length>0){x+="Unknown";}else{y=Ext.getTimePeriodText(w.recurtype,w.recur!=1);x+=y;if(y.toLowerCase()!="unknown"&&w.recur!=1){x=w.recur+" "+x;
}else{if(w.recur==1){x=Ext.capitalize(x);}}}return String.format(x);}function b(){return i.ownerCt.id.replace(/tab\_/g,"");}};Ext.extend(backup,Ext.Panel,{});