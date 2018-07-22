Ext.BLANK_IMAGE_URL = 'extjs/resources/images/default/s.gif';
var languages = [
	['', '<?php echo DMG_Translate::_('administration.user.form.language.helper'); ?>'],
	['pt_BR', 'Português'],
	['en', 'Inglês'],
	['es', 'Espanhol']
];
var PortalTools = [{
	id:'close',
	handler: function(e, target, panel){
		panel.ownerCt.remove(panel, true);
	}
}];
var onOfRenderer = function (e) {
	if (e == true) {
		return '<center><img src="extjs/resources/images/default/dd/drop-yes.gif" alt="<?php echo DMG_Translate::_('yes'); ?>" title="<?php echo DMG_Translate::_('yes'); ?>" /></center>';
	} else {
		return '<center><img src="extjs/resources/images/default/dd/drop-no.gif" alt="<?php echo DMG_Translate::_('no'); ?>" title="<?php echo DMG_Translate::_('no'); ?>" /></center>';
	}
};


Ext.override(Ext.form.ComboBox, {
	initList: (function(){
		if(!this.tpl) {
			this.tpl = new Ext.XTemplate(
				'<tpl for="."><div class="x-combo-list-item">{',
				this.displayField , 
				':this.blank}</div></tpl>', {
					blank: function(value){
						return value==='' ? '&nbsp' : value;
					}
			});
		}
	}).createSequence(Ext.form.ComboBox.prototype.initList)
});



Ext.override(Ext.layout.BorderLayout.Region, {
	slideOut : function(){
	    if(this.isSlid || this.el.hasActiveFx()){
	        return;
	    }
	    this.isSlid = true;
	    var ts = this.panel.tools, dh, pc;
	    if(ts && ts.toggle){
	        ts.toggle.hide();
	    }
	    this.el.show();
	
	    // Temporarily clear the collapsed flag so we can onResize the panel on the slide
	    pc = this.panel.collapsed;
	    this.panel.collapsed = false;
	
	    if(this.position == 'east' || this.position == 'west'){
	        // Temporarily clear the deferHeight flag so we can size the height on the slide
	        dh = this.panel.deferHeight;
	        this.panel.deferHeight = false;
	
	        this.panel.setSize(undefined, this.collapsedEl.getHeight());
	
	        // Put the deferHeight flag back after setSize
	        this.panel.deferHeight = dh;
	    }else{
	        this.panel.setSize(this.collapsedEl.getWidth(), undefined);
	    }
	
	    // Put the collapsed flag back after onResize
	    this.panel.collapsed = pc;
	
	    this.restoreLT = [this.el.dom.style.left, this.el.dom.style.top];
	    this.el.alignTo(this.collapsedEl, this.getCollapseAnchor());
	    //this.el.setStyle("z-index", this.floatingZIndex+2);
	    this.el.setStyle("z-index", 15000);
	    this.panel.el.replaceClass('x-panel-collapsed', 'x-panel-floating');
	    if(this.animFloat !== false){
	        this.beforeSlide();
	        this.el.slideIn(this.getSlideAnchor(), {
	            callback: function(){
	                this.afterSlide();
	                this.initAutoHide();
	                Ext.getDoc().on("click", this.slideInIf, this);
	            },
	            scope: this,
	            block: true
	        });
	    }else{
	        this.initAutoHide();
	         Ext.getDoc().on("click", this.slideInIf, this);
	    }
	}

});

var _syncAjax = function(url, passData) {
	var postString = Ext.isObject(passData) ? Ext.urlEncode(passData) : passData;
	
	if(window.XMLHttpRequest) {            
		AJAX = new XMLHttpRequest();              
	}
	else {                     
		AJAX = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	if(AJAX) {
		AJAX.open("POST", url, false);
		AJAX.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		AJAX.send(postString);
		return AJAX.responseText;                                         
	}
	else {
		return false;
	}                                             
};

var verificaMaquinaFaturaTemp = function(machine_id){
	try{
		var retorno = Ext.decode(_syncAjax('<?php echo $this->url(array('controller' => 'maquina', 'action' => 'verifica-maquina-fatura-temp'), null, true); ?>', {'id':machine_id}));
		if(retorno.success) return true;
		else return false;
	}
	catch(e){
		return false;
	}
}


var funcaoFormataLabelGraficoFaturamento = function(valor){
	var chart = Ext.getCmp('valoresChart');
	var index = chart.store.find('data', valor);
	var reg = chart.store.getAt(index);
	
	if(reg){
		if(reg.get('intervalo')) return reg.get('intervalo'); 
	}
}

var tabs;
var Principal = Ext.extend(Ext.util.Observable, {
	constructor: function() {
		<?php if (DMG_Acl::canAccess(83)): ?>
<?php

	$versoes = array();
	foreach (Doctrine_Query::create()->select('m.nr_versao_jogo')->from('ScmMaquina m')->groupBy('m.nr_versao_jogo')->execute(array(), Doctrine::HYDRATE_SCALAR) as $k) {
		$versoes[] = $k['m_nr_versao_jogo'];
	}
	
	$query = Doctrine_Query::create()
		->select('j.nm_jogo, m.nr_versao_jogo, COUNT(m.id) AS total')
		->from('ScmMaquina m')
		->innerJoin('m.ScmJogo j')
		->innerJoin('m.ScmStatusMaquina st')
		->where('st.fl_alta = ?', 1)
		->groupBy('j.nm_jogo')
		->addGroupBy('m.nr_versao_jogo')
		->execute(array(), Doctrine::HYDRATE_SCALAR)
	;
	
	$nJogo = array();
	foreach ($query as $k) {
		$nJogo[$k['j_nm_jogo']][$k['m_nr_versao_jogo']] = $k['m_total']; 
	}
	
	$jogo = array();
	foreach ($nJogo as $k => $l) {
		$tmp = array('jogo' => $k);
		foreach ($l as $m => $n) {
			foreach ($versoes as $o => $p) {
				if ($p == $m) {
					$tmp['c_' . $o] = (int) $n;
				}
			}
		}
		$jogo[] = $tmp;
	}
		
?>
		var store = new Ext.data.JsonStore({
			fields: [{name: 'jogo', type: 'string'}
				<?php
					foreach ($versoes as $key => $value) {
						echo ', {name: "c_' . $key . '", type: "int"}'; 
					}
				?>
			],
			data: <?php echo Zend_Json::encode($jogo); ?>
	    });
				
		this.parqueJogoChart = new Ext.Panel({
			cls: 'x-portlet',
		    width: '100%',
		    height: 467,
		    tbar:[{
		    	text: '<?php echo DMG_Translate::_('i18n.PagingToolbar.refreshText'); ?>',
				iconCls: 'x-tbar-loading',
				scope: this,
				handler: function(botao, evento){
		    		this.parqueJogoChart.el.mask('<?php echo DMG_Translate::_('i18n.loading'); ?>');
			    	Ext.Ajax.request({
						url: '<?php echo $this->url(array('controller' => 'jogo', 'action' => 'reload-chart'), null, true); ?>',
						scope: this,
						method: 'POST',
						success: function(response, options) {
							this.parqueJogoChart.el.unmask();
							
							try {
								var resposta = Ext.decode(response.responseText);
							} catch (e) {
								this.el.unmask();
								return;
							};
							
							if(resposta.success){
								var chart = Ext.getCmp('parqueJogoChart');
								chart.store.fields = new Ext.data.JsonReader({fields: resposta.fields});
								chart.series = resposta.series;
								chart.store.loadData(resposta.data);
							}
							else{
								uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: resposta.errormsg});
							}
						}
					});
		    	}
			}],
		    items: {
				id: 'parqueJogoChart',
				url: '<?php echo $this->BaseUrl(); ?>/extjs/resources/charts.swf',
		        xtype: 'stackedbarchart',
		        store: store,
		        yField: 'jogo',
		        style:{
					animationEnabled: false,
					seriesItemSpacing: 30
				},
		        xAxis: new Ext.chart.NumericAxis({
	                minorUnit: 1,
	                majorUnit: 1,
	                stackingEnabled: true
	            }),
		        series: [
		            <?php foreach ($versoes as $k => $l): ?>
					{
					    xField: 'c_<?php echo $k; ?>',
					    displayName: '<?php echo $l; ?>',
					    style:{size: 30}
					},
					<?php endforeach; ?>				
				]
		    }
		});
		<?php endif; ?>
		<?php if (DMG_Acl::canAccess(34)): ?>
			this.valoresLoad = function () {
				var conn = new Ext.data.Connection();
				conn.request({
					method:'POST',
	 				url: '<?php echo $this->url(array('controller' => 'index', 'action' => 'portal-faturamento')); ?>',
					scope: this,
					callback: function (a, b, c, d) {
						try {
							var data = Ext.decode(c.responseText);
							if (data.success) {
								this.valoresChart.items.items[0].series = data.series;
								this.valoresChart.items.items[0].store.reader = new Ext.data.JsonReader({fields: data.fields});
								this.valoresChart.items.items[0].store.loadData(data.data);
							}
						} catch (e) {};
					}
				});
			}
			this.valoresChart = new Ext.Panel({
				cls: 'x-portlet',
				width: '100%',
				height: 300,
				bodyStyle: 'padding:10px',
				tbar: [{
					text: '<?php echo DMG_Translate::_('i18n.PagingToolbar.refreshText'); ?>',
					iconCls: 'x-tbar-loading',
					scope: this,
					handler: function(botao, evento){
						this.valoresLoad();
					}
				}],
				items: {
					id:'valoresChart',
					xtype: 'columnchart',
					store: new Ext.data.JsonStore({
						fields: ['data', 'valor'],
						data: []
					}),
					url: '<?php echo $this->BaseUrl(); ?>/extjs/resources/charts.swf',
					yField: 'valor',
					xField: 'data',
					xAxis: new Ext.chart.CategoryAxis({
						title: '<?php echo DMG_Translate::_('window.portal.valores.semana'); ?>',
						labelFunction: 'funcaoFormataLabelGraficoFaturamento',
					}),
					yAxis: new Ext.chart.NumericAxis({
						title: '<?php echo DMG_Translate::_('window.portal.valores.valor'); ?>',
						labelRenderer: function(value){
							return "$" + Ext.util.Format.number(value, '0.000,00/i');
						}
					}),
					extraStyle: {
		                legend: {
		                    display: 'bottom',
		                    padding: 5,
		                    font: {
		                        family: 'Tahoma',
		                        size: 13
		                    }
		                },
		                xAxis: {
		                    //labelRotation: -45
		                }
		            }
				}
			});
			
			this.valoresLoad();
		<?php endif; ?>
		<?php if (DMG_ACl::canAccess(35)): ?>
		this.bntReload = new Ext.Toolbar.Button({
			text: '<?php echo DMG_Translate::_('i18n.PagingToolbar.refreshText'); ?>',
			iconCls: 'x-tbar-loading',
			scope: this,
			handler: function() {
				this.grid.store.reload();
			}
		});
		this.grid = new Ext.grid.GridPanel({
			cls: 'x-portlet',
			height: 117,
			store: new Ext.data.JsonStore({
				url: '<?php echo $this->url(array('controller' => 'index', 'action' => 'info', 'data' => 'status-maquina'), null, true); ?>',
				root: 'data',
				idProperty: 'id',
				totalProperty: 'total',
				autoLoad: true,
				autoDestroy: true,
				fields: [
					{name: 'st_nm_status_maquina', type: 'string'},
					{name: 'm_total', type: 'int'}
				]
			}),
			tbar: [this.bntReload],
			colModel: new Ext.grid.ColumnModel({
				defaults: {
					sortable: false
				},
				columns: [
					{header: '<?php echo DMG_Translate::_('window.portal.status_maquina.status'); ?>', dataIndex: 'st_nm_status_maquina'},
					{header: '<?php echo DMG_Translate::_('window.portal.status_maquina.qtde'); ?>', dataIndex: 'm_total'}
				]
			}),
			viewConfig: {
				forceFit: true
			}
		});
		<?php endif; ?>
		tabs = new Ext.TabPanel({
			region: 'center',
			activeTab: 0,
			defaults: {closable: true},
			items: [{
				title: '<?php echo DMG_Translate::_('window.title'); ?>',
				//bodyStyle: 'padding: 20px;',
				closable: false,
				frame:true,
				xtype: 'portal',
				region: 'center',
				margins: '0 0 0 0',
				items: [
				{
					columnWidth: .5,
					style: 'padding:10px',
					items:[
					<?php if (DMG_ACl::canAccess(83)): ?>
					{
						title: '<?php echo DMG_Translate::_('window.portal.parqueJogo'); ?>',
						items: [this.parqueJogoChart]
					},
					<?php endif; ?>
					]
				},
				{
					columnWidth: .5,
					style: 'padding:10px',
					items: [
						<?php if (DMG_ACl::canAccess(34)): ?>
						{
							title: '<?php echo DMG_Translate::_('window.portal.valores'); ?>',
							items: [this.valoresChart]
						},
						<?php endif; ?>
				   	 	<?php if (DMG_ACl::canAccess(35)): ?>
				   	 	{
				   	 		title: '<?php echo DMG_Translate::_('window.portal.status_maquina'); ?>',
				   	 		items: [this.grid]
				   	 	},
				   	 	<?php endif; ?>
					]
				}]
			}]
		});
		new Ext.Viewport({
			id: 'tabs',
			layout: 'border',
			items: [{
				region: 'south',
			    split: false,
			    height: 34,
			    minSize: 34,
			    maxSize: 34,
			    collapsible: true,
			    frame:true,
			    margins: '0 0 0 0',
			    bodyStyle: 'text-align:right',
			    html:'<span style="float:left;padding-top:3px;"><?php echo file_get_contents(APPLICATION_PATH . "/RELEASE.TXT"); ?></span><p><?php echo DMG_Config::get(13); ?></p>'
			},{
				region:'north',
				split: false,
				height: 90,
				minSize: 90,
				maxSize: 90,
				collapsible: false,
				frame:true,
				baseCls:'x-toolbar',
				layoutConfig: {
					padding:'0',
					align:'middle'
				},
				items: [{
					split: false,
					width: '100%',
					unstyled: true,
					height: 50,
					minSize: 50,
					maxSize: 50,
					collapsible: false,
					frame:true,
					layout:'hbox',
					layoutConfig: {
						align:'middle'
					},
					items: [{
						xtype: 'spacer',
						width:240
					},{
						unstyled: true,
						bodyStyle:'color:#242364; font-size:18px; line-height:18px; text-align: center;padding-top:16px',
						html: '<?php echo DMG_Config::get(2); ?>',
						flex:1
					},{
						xtype:'spacer',
						width:240
					}]
				},{
					split: false,
					height: 35,
					minSize: 35,
					maxSize: 35,
					collapsible: false,
					frame:true,
					layout:'hbox',
					width: '100%',
					layoutConfig: {
						padding: '0px'
					},
					items: [{
						unstyled: true,
						html: '<?php echo DMG_Translate::_('window.ola'); ?> <?php echo Zend_Auth::getInstance()->getIdentity()->name; ?>.',
						flex:1
					},{
						xtype:'button',
						text: '<?php echo DMG_Translate::_('window.profile'); ?>',
						iconCls: 'silk-profile',
						scope: this,
						handler: this.editProfileClick
					},{
						xtype:'button',
						text: '<?php echo DMG_Translate::_('window.exit'); ?>',
						iconCls: 'silk-close',
						scope: this,
						handler: this.logout
					}]
			     }]
			},{
				title: 'Menu',
				region: 'west',
				layout: 'accordion',
				defaultType: 'treepanel',
				width: 200,
				split: true,
				collapsible: true,
				collapsed:true,
				layoutConfig: {fill: false, animate:true},
				defaults: {
					border: false,
					rootVisible: false,
					bodyStyle: 'background:white;',
					listeners: {
						scope: this,
						click: this.onNodeClick
					}
				},
				items: [<?php echo Khronos_Menu::getJson(); ?>]
			},
			tabs]
		});
		
		Ext.getCmp('tabs').layout.west.getCollapsedEl().titleEl.dom.innerHTML = '<img src="images/menu.png" />';
		
		var logo = document.createElement("img");
    	logo.src = '<?php echo DMG_Config::get(3); ?>'
    	logo.style.zIndex = 5000;
		logo.style.position = "absolute";
		document.getElementsByTagName("body")[0].appendChild(logo);		
		
		Principal.superclass.constructor.apply(this,arguments);
	},
	onNodeClick: function(node) {
		if(!node.attributes.eXtype) {
			return;
		}
		var titulo = node.text;
		var novaAba = tabs.items.find(function(aba){
			return aba.xtype === node.attributes.eXtype;
		});
		if(!novaAba) {
			novaAba = tabs.add({
				title: titulo,
				xtype: node.attributes.eXtype
			});
		}
		tabs.activate(novaAba);
	},
	editProfileClick: function () {
		var id = <?php echo Zend_Auth::getInstance()->getIdentity()->id; ?>;
		this._newForm();
		this.window.setUser(id);
		this.window.show();
	},
	_newForm: function () {
		if (!this.window) {
			this.window = new AdministrationUserFormEditPerfil({
				renderTo: this.body,
				listeners: {
					scope: this
				}
			});
		}
		return this.window;
	},
	logout: function () {
		window.location = '<?php echo $this->url(array('controller' => 'index', 'action' => 'logout'), null, true); ?>';
	}
});