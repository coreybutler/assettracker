Ext.namespace("Ext.ux.dd");Ext.ux.dd.GridDragDropRowOrder=Ext.extend(Ext.util.Observable,{copy:false,scrollable:false,constructor:function(a){if(a){Ext.apply(this,a);}this.addEvents({beforerowmove:true,afterrowmove:true,beforerowcopy:true,afterrowcopy:true});Ext.ux.dd.GridDragDropRowOrder.superclass.constructor.call(this);
},init:function(a){this.grid=a;a.enableDragDrop=true;a.on({render:{fn:this.onGridRender,scope:this,single:true}});},onGridRender:function(b){var a=this;this.target=new Ext.dd.DropTarget(b.getEl(),{ddGroup:b.ddGroup||"GridDD",grid:b,gridDropTarget:this,notifyDrop:function(m,k,h){if(this.currentRowEl){this.currentRowEl.removeClass("grid-row-insert-below");
this.currentRowEl.removeClass("grid-row-insert-above");}var o=Ext.lib.Event.getTarget(k);var j=this.grid.getView().findRowIndex(o);if(j===false||j==h.rowIndex){return false;}if(this.gridDropTarget.fireEvent(a.copy?"beforerowcopy":"beforerowmove",this.gridDropTarget,h.rowIndex,j,h.selections,123)===false){return false;
}var d=this.grid.getStore();var c=new Array();var n=d.data.keys;for(var l in n){for(var g=0;g<h.selections.length;g++){if(n[l]==h.selections[g].id){if(j==l){return false;}c.push(h.selections[g]);}}}if(j>h.rowIndex&&this.rowPosition<0){j--;}if(j<h.rowIndex&&this.rowPosition>0){j++;}if(j>h.rowIndex&&h.selections.length>1){j=j-(h.selections.length-1);
}if(j==h.rowIndex){return false;}if(!a.copy){for(var g=0;g<h.selections.length;g++){d.remove(d.getById(h.selections[g].id));}}for(var g=c.length-1;g>=0;g--){var p=j;d.insert(p,c[g]);}var f=this.grid.getSelectionModel();if(f){f.selectRecords(h.selections);}this.gridDropTarget.fireEvent(a.copy?"afterrowcopy":"afterrowmove",this.gridDropTarget,h.rowIndex,j,h.selections);
return true;},notifyOver:function(o,l,j){var r=Ext.lib.Event.getTarget(l);var k=this.grid.getView().findRowIndex(r);var d=this.grid.getStore();var q=d.data.keys;for(var n in q){for(var h=0;h<j.selections.length;h++){if(q[n]==j.selections[h].id){if(k==n){if(this.currentRowEl){this.currentRowEl.removeClass("grid-row-insert-below");
this.currentRowEl.removeClass("grid-row-insert-above");}return this.dropNotAllowed;}}}}if(k<0||k===false){this.currentRowEl.removeClass("grid-row-insert-above");return this.dropNotAllowed;}try{var m=this.grid.getView().getRow(k);var g=new Ext.Element(m).getY()-this.grid.getView().scroller.dom.scrollTop;
var c=m.offsetHeight;this.rowPosition=l.getPageY()-g-(c/2);if(this.currentRowEl){this.currentRowEl.removeClass("grid-row-insert-below");this.currentRowEl.removeClass("grid-row-insert-above");}if(this.rowPosition>0){this.currentRowEl=new Ext.Element(m);this.currentRowEl.addClass("grid-row-insert-below");
}else{if(k-1>=0){var p=this.grid.getView().getRow(k-1);this.currentRowEl=new Ext.Element(p);this.currentRowEl.addClass("grid-row-insert-below");}else{this.currentRowEl.addClass("grid-row-insert-above");}}}catch(f){console.warn(f);k=false;}return(k===false)?this.dropNotAllowed:this.dropAllowed;},notifyOut:function(c,f,d){if(this.currentRowEl){this.currentRowEl.removeClass("grid-row-insert-above");
this.currentRowEl.removeClass("grid-row-insert-below");}}});if(this.targetCfg){Ext.apply(this.target,this.targetCfg);}if(this.scrollable){Ext.dd.ScrollManager.register(b.getView().getEditorParent());b.on({beforedestroy:this.onBeforeDestroy,scope:this,single:true});}},getTarget:function(){return this.target;
},getGrid:function(){return this.grid;},getCopy:function(){return this.copy?true:false;},setCopy:function(a){this.copy=a?true:false;},onBeforeDestroy:function(a){Ext.dd.ScrollManager.unregister(a.getView().getEditorParent());}});