/*
 * Ext JS Library 3.1.0
 * Copyright(c) 2006-2009 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
Ext.ux.Spotlight=function(a){Ext.apply(this,a);};Ext.ux.Spotlight.prototype={active:false,animate:true,duration:0.25,easing:"easeNone",animated:false,createElements:function(){var a=Ext.getBody();
this.right=a.createChild({cls:"x-spotlight"});this.left=a.createChild({cls:"x-spotlight"});this.top=a.createChild({cls:"x-spotlight"});this.bottom=a.createChild({cls:"x-spotlight"});this.all=new Ext.CompositeElement([this.right,this.left,this.top,this.bottom]);},show:function(b,c,a){if(this.animated){this.show.defer(50,this,[b,c,a]);
return;}this.el=Ext.get(b);if(!this.right){this.createElements();}if(!this.active){this.all.setDisplayed("");this.applyBounds(true,false);this.active=true;Ext.EventManager.onWindowResize(this.syncSize,this);this.applyBounds(false,this.animate,false,c,a);}else{this.applyBounds(false,false,false,c,a);}},hide:function(b,a){if(this.animated){this.hide.defer(50,this,[b,a]);
return;}Ext.EventManager.removeResizeListener(this.syncSize,this);this.applyBounds(true,this.animate,true,b,a);},doHide:function(){this.active=false;this.all.setDisplayed(false);},syncSize:function(){this.applyBounds(false,false);},applyBounds:function(e,d,j,i,k){var h=this.el.getRegion();var a=Ext.lib.Dom.getViewWidth(true);
var g=Ext.lib.Dom.getViewHeight(true);var f=0,b=false;if(d){b={callback:function(){f++;if(f==4){this.animated=false;if(j){this.doHide();}Ext.callback(i,k,[this]);}},scope:this,duration:this.duration,easing:this.easing};this.animated=true;}this.right.setBounds(h.right,e?g:h.top,a-h.right,e?0:(g-h.top),b);
this.left.setBounds(0,0,h.left,e?0:h.bottom,b);this.top.setBounds(e?a:h.left,0,e?0:a-h.left,h.top,b);this.bottom.setBounds(0,h.bottom,e?0:h.right,g-h.bottom,b);if(!d){if(j){this.doHide();}if(i){Ext.callback(i,k,[this]);}}},destroy:function(){this.doHide();Ext.destroy(this.right,this.left,this.top,this.bottom);
delete this.el;delete this.all;}};Ext.Spotlight=Ext.ux.Spotlight;