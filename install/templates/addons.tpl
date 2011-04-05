/*
 *  MODULES & REPORTS
 *  -------------------------------------------------
 *  Modules and reports must both mimick the name
 *  of the object they represent. For example,
 *  mymodule.js must contain an object that can be
 *  called by new mymodule().
 * 
 *  Modules are stored in the ./js/modules folder.
 *    
 *  See below for information about reports.
 */
 
var modules = [
	{module:'updatetracker.js',	active:@UPDATE,	dashboard:'updates.cfm'},
	{module:'backup.js',		active:@BACKUP,	dashboard:'backups.cfm', ux:'RowExpander.js,Spotlight.js'}
];



/*
 *  REPORTS
 *  -------------------------------------------------
 *  There are two kinds of reports: basic & custom.
 *  The reports both use the same CF processing
 *  technique, but differ in their JS implementation.
 *   
 *  All reports have a CFM file to generate the report.
 *  These are called action pages & work in a simple
 *  manner, similar to processing a form. A template,
 *  called general.cfm, has been included. The simplest
 *  way to get started creating your own simple reports
 *  is to make a copy of this file and modify it to fit
 *  your needs.
 *  
 *  Basic reports have a generic user interface that
 *  will show up in the Reports tab. Simply give the
 *  report a title and action page to configure it.
 *  The report can be turned on/off by setting the
 *  active property to true or false.
 *  
 *  Custom reports work the same way. However; a custom
 *  report is defined by the need to have a custom user
 *  interface shown on the Reports tab. This requires
 *  an ExtJS extension. This file must be named a specific
 *  way and saved in the ./js/modules folder. All custom
 *  report interfaces are defined with a prefix of "report_".
 *  So, if your custom interface is called myinterface, your
 *  extension would be called report_myinterface.js. These
 *  extensions must extend the Ext.Panel object. To add the
 *  extension to the tool, simply specify the name of the
 *  JS file in the ui attribute.
 *  
 *  The basic installation comes with one custom report for
 *  reporting on system inventory. Review report_systeminventory.js
 *  for an example. 
 *  
 *  CUSTOM REPORT EXAMPLE
 *	{title:'Network Inventory',action:'networkinventory.cfm',ui:'report_networkinventory.js',active:true}
 *	
 *  BASIC REPORT EXAMPLE
 *	{title:'Example Report',action:'general.cfm',active:true}
 */

var reports = [
	{title:'Administrator\'s Guide',action:'networkinventory.cfm',	active:true,	ui:'report_networkinventory.js'},
	{title:'Software Applications',	action:'applicationreport.cfm',	active:true,	description:'A list of systems using specific software applications.'}
	@REPORTS
];