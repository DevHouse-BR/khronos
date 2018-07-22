
Ext.ns('Ext.ux', 'Ext.ux.plugins');
Ext.ux.plugins.ProgressPagingToolbar  = Ext.extend(Object, {
	progBarWidth   : 225,
	defaultText    : 'Carregando...',
	defaultAnimCfg : {
		duration   : 1,
		easing     : 'bounceOut'	
	},												  
	constructor : function(config) {
		if (config) {
			Ext.apply(this, config);
		}
	},
	//public
	init : function (parent) {
		
		if(parent.displayInfo){
			this.parent = parent;
			var ind  = parent.items.indexOf(parent.displayItem);
			parent.remove(parent.displayItem, true);
			parent.displayItem =  new Ext.ProgressBar({
				text  : this.defaultText,
				width : this.progBarWidth,
				animate: this.defaultAnimCfg
			});							
			parent.add(parent.displayItem);	
			parent.doLayout();
			Ext.apply(parent, this.parentOverrides);
		}

	},
	//overrides, private
	parentOverrides  : {
		updateInfo : function(){
			if(this.displayItem){
				var count   = this.store.getCount();
				var pgData  = this.getPageData();
				var pageNum = this.readPage(pgData);
				
				var msg    = count == 0 ?
					this.emptyMsg :
					String.format(
						this.displayMsg,
						this.cursor+1, this.cursor+count, this.store.getTotalCount()
					);
					
				pageNum = pgData.activePage; ;	
				
				var pct	= pageNum / pgData.pages;	
				
				this.displayItem.updateProgress(pct, msg, this.defaultAnimCfg);
			}
		}
	}
});