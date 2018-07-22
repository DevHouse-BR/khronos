var Reports = Ext.extend(Ext.Panel, {
	id:'ReportsPanel',
	layout: 'hbox',
	height: '100%',
	layoutConfig: {
		padding: '5',
		align: 'stretch',
	    pack: 'start',
	},	
	defaults: {
		margins: '0 5 0 0'
	},	
	border: false,
	stripeRows: true,
	loadMask: true,
	columnLines: true,
	initComponent: function () {
		this.printReport = function (format) {
			var url = "<?php echo $this->url(array('controller' => 'reports', 'action' => 'export')); ?>?format=" + format + "&report=" + this.reportName;
			this.formReport.items.each(function(c){
				try {
					if (c.items.items[1].items.items[0].name == 'data') {
						var tmp = c.items.items[1].items.items[0].getValue();
						var data = new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate(), c.items.items[2].items.items[0].getValue(), c.items.items[3].items.items[0].getValue());
						url += "&data=" + data.format('Y-m-d H:i:s');
					}
					else if (typeof c.value == 'undefined') {
						if (typeof c.items.items[2].items.items[0] == 'object') {
							val = c.items.items[2].items.items[0];
							values = val.getValue();
							if(((val.store.totalLength == values.length) || (val.value == "")) && ((Ext.getCmp('ReportsPanel').reportName == 'r_3') || (Ext.getCmp('ReportsPanel').reportName == 'r_1'))) return;
							for (var i = 0; i < values.length; i++) {
								url += "&" + val.name + "[]=" + values[i];
							}
						} else {
							return;
						}
					}
				} catch (e){};
			});
			window.open(url, 'report');
		};
		this.formReport = new Ext.form.FormPanel({
			layout: 'form',
			flex: 1,
			id: 'formReports',
			bodyStyle: 'padding: 5px',
			items: [{border: false, html:'<span style="padding-left:20px;background:url(images/icons/bullet_error.png) no-repeat top left;"><?php echo DMG_Translate::_('faturamento.reports.select'); ?></span>'}],
			bbar: ['&nbsp;']
		});
		this.treeReport = new Ext.tree.TreePanel({
			name: 'tree3',
			id: 'tree3',
			width:260,
			useArrows: true,
			rootVisible: false,
			overflow: 'scroll',
			expanded: true,
			root: new Ext.tree.AsyncTreeNode({
				expanded: true,
				text: '<?php echo DMG_Translate::_('reports'); ?>',
				iconCls: 'folder',
				draggable: false,
				id: '0',
				children: <?php echo Khronos_Reports::getJsonTreeList(); ?>
			})
		});
		Ext.apply(this,{
			items:[
			    this.treeReport,
			    this.formReport
			]
		});
		Reports.superclass.initComponent.call(this);
	},
	initEvents: function () {
		this.treeReport.on('click', function(node) {
			if (node.isLeaf()) {
				this.el.mask('<?php echo DMG_Translate::_('i18n.loading'); ?>');
				var id = node.id;
				var con1 = new Ext.data.Connection();
				con1.request({
					url: '<?php echo $this->url(array('controller' => 'reports', 'action' => 'get-filter')); ?>',
					params: {
						id: id
					},
					scope: this,
					callback: function (a, b, c) {
						var data;
						try {
							data = Ext.decode(c.responseText);
						}catch(e){};
						if (data.success) {
							if (data.data.length) {
								try {
									this.formReport.removeAll();
								} catch (e) {}
							}
							this.reportName = data.name;
							this.formReport.add(new Ext.Panel({
								html: '<span style="font-size:25px;text-shadow:#999999 2px 2px 2px;color:#15428B">' + data.titulo + '</span>',
								border: false
							}));
							this.formReport.add(new Ext.Panel({
								html: data.descricao,
								border: false,
								bodyStyle: 'margin:20px 0px 20px 0px;padding:0px 0px 20px 20px;border-bottom:solid 2px #99bbe8;background:url(images/icons/info.png) no-repeat top left'
							}));
							this.formReport.add(new Ext.Panel({
								html: '<span style="font-weight:bold;padding-left:20px;background:url(images/icons/find.png) no-repeat top left"><?php echo DMG_Translate::_('faturamento.reports.filters'); ?></span><br/><br/>',
								bodyStyle: 'margin-bottom: 5px',
								border: false
							}));
							for (var i = 0; i < data.data.length; i++) {
								switch (data.data[i].tipo) {
									case 'jogo':
										this.formReport.add(new Ext.Panel({
											layout: 'column',
											border: false,
											items: [{
												width: 100,
												border: false,
items: [{
													xtype: 'label', 
													text: data.data[i].nome,
													style: 'line-height:24px'
												}]
											}, {
												width: 20,
												border: false,
												autoHeight: true,
												bodyStyle: 'padding-top: 4px; padding-left: 2px;',
												items: [{
													border: false,
													xtype: 'checkbox',
													checked: true,
													listeners: {
														check: function (a, b) {
															var box = this.ownerCt.ownerCt.items.items[2].items.items[0];
															if (b) {
																box.disable();
																box.selectAll();
															} else {
																box.enable();
																box.deselectAll();
															}
														}
													}
												}]
											},{
												border: false,
												autoHeight: true,
												items: [{
													border: false,
													xtype: 'lovcombo',
													name: data.data[i].campo,
													value: '',
													disabled: true,
													fieldLabel: data.data[i].nome,
													store: new Ext.data.JsonStore({
														autoLoad:true,
														root:'data',
														fields: ['id', 'nome'],
														id: 'id',
														url: '<?php echo $this->url(array('controller' => 'reports', 'action' => 'get-combo', 'data' => 'jogo'), null, true); ?>?report=' + this.reportName
													}),
													mode: 'local',
													valueField: 'id',
													displayField: 'nome'
												}]
											}]
										}));
									break;
									case 'empresa':
										this.formReport.add(new Ext.Panel({
											layout: 'column',
											border: false,
											items: [{
												width: 100,
												border: false,
												items: [{
													xtype: 'label', 
													text: data.data[i].nome,
													style: 'line-height:24px'
												}]
											}, {
												width: 20,
												border: false,
												autoHeight: true,
												bodyStyle: 'padding-top: 4px; padding-left: 2px;',
												items: [{
													border: false,
													xtype: 'checkbox',
													checked: true,
													listeners: {
														check: function (a, b) {
															var box = this.ownerCt.ownerCt.items.items[2].items.items[0];
															if (b) {
																box.disable();
																box.selectAll();
															} else {
																box.enable();
																box.deselectAll();
															}
														}
													}
												}]
											},{
												border: false,
												autoHeight: true,
												items: [{
													border: false,
													xtype: 'lovcombo',
													name: data.data[i].campo,
													value: '',
													disabled: true,
													fieldLabel: data.data[i].nome,
													store: new Ext.data.JsonStore({
														autoLoad:true,
														root:'data',
														fields: ['id', 'nome'],
														id: 'id',
														url: '<?php echo $this->url(array('controller' => 'reports', 'action' => 'get-combo', 'data' => 'empresa'), null, true); ?>?report=' + this.reportName
													}),
													mode: 'local',
													valueField: 'id',
													displayField: 'nome'
												}]
											}]
										}));
									break;
									case 'filial':
										this.formReport.add(new Ext.Panel({
											layout: 'column',
											border: false,
											items: [{
												width: 100,
												border: false,
												items: [{
													xtype: 'label', 
													text: data.data[i].nome,
													style: 'line-height:24px'
												}]
											}, {
												width: 20,
												border: false,
												autoHeight: true,
												bodyStyle: 'padding-top: 4px; padding-left: 2px;',
												items: [{
													border: false,
													xtype: 'checkbox',
													checked: true,
													listeners: {
														check: function (a, b) {
															var box = this.ownerCt.ownerCt.items.items[2].items.items[0];
															if (b) {
																box.disable();
																box.selectAll();
															} else {
																box.enable();
																box.deselectAll();
															}
														}
													}
												}]
											},{
												border: false,
												autoHeight: true,
												items: [{
													border: false,
													xtype: 'lovcombo',
													name: data.data[i].campo,
													value: '',
													disabled: true,
													fieldLabel: data.data[i].nome,
													store: new Ext.data.JsonStore({
														autoLoad:true,
														root:'data',
														fields: ['id', 'nome'],
														id: 'id',
														url: '<?php echo $this->url(array('controller' => 'reports', 'action' => 'get-combo', 'data' => 'filial'), null, true); ?>?report=' + this.reportName
													}),
													mode: 'local',
													valueField: 'id',
													displayField: 'nome'
												}]
											}]
										}));
									break;
									case 'local':
										this.formReport.add(new Ext.Panel({
											layout: 'column',
											border: false,
											items: [{
												width: 100,
												border: false,
												items: [{
													xtype: 'label', 
													text: data.data[i].nome,
													style: 'line-height:24px'
												}]
											}, {
												width: 20,
												border: false,
												autoHeight: true,
												bodyStyle: 'padding-top: 4px; padding-left: 2px;',
												items: [{
													border: false,
													xtype: 'checkbox',
													checked: true,
													listeners: {
														check: function (a, b) {
															var box = this.ownerCt.ownerCt.items.items[2].items.items[0];
															if (b) {
																box.disable();
																box.selectAll();
															} else {
																box.enable();
																box.deselectAll();
															}
														}
													}
												}]
											},{
												border: false,
												autoHeight: true,
												items: [{
													border: false,
													xtype: 'lovcombo',
													name: data.data[i].campo,
													value: '',
													disabled: true,
													fieldLabel: data.data[i].nome,
													store: new Ext.data.JsonStore({
														autoLoad:true,
														root:'data',
														fields: ['id', 'nome'],
														id: 'id',
														url: '<?php echo $this->url(array('controller' => 'reports', 'action' => 'get-combo', 'data' => 'local'), null, true); ?>?report=' + this.reportName,
													}),
													mode: 'local',
													valueField: 'id',
													displayField: 'nome'
												}]
											}]
										}));
									break;
									case 'gabinete':
										this.formReport.add(new Ext.Panel({
											layout: 'column',
											border: false,
											items: [{
												width: 100,
												border: false,
												items: [{
													xtype: 'label', 
													text: data.data[i].nome,
													style: 'line-height:24px'
												}]
											}, {
												width: 20,
												border: false,
												autoHeight: true,
												bodyStyle: 'padding-top: 4px; padding-left: 2px;',
												items: [{
													border: false,
													xtype: 'checkbox',
													checked: true,
													listeners: {
														check: function (a, b) {
															var box = this.ownerCt.ownerCt.items.items[2].items.items[0];
															if (b) {
																box.disable();
																box.selectAll();
															} else {
																box.enable();
																box.deselectAll();
															}
														}
													}
												}]
											},{
												border: false,
												autoHeight: true,
												items: [{
													border: false,
													xtype: 'lovcombo',
													name: data.data[i].campo,
													value: '',
													disabled: true,
													fieldLabel: data.data[i].nome,
													store: new Ext.data.JsonStore({
														autoLoad:true,
														root:'data',
														fields: ['id', 'nome'],
														id: 'id',
														url: '<?php echo $this->url(array('controller' => 'reports', 'action' => 'get-combo', 'data' => 'gabinete'), null, true); ?>?report=' + this.reportName
													}),
													mode: 'local',
													valueField: 'id',
													displayField: 'nome'
												}]
											}]
										}));
									break;
									case 'grupo':
										this.formReport.add(new Ext.Panel({
											layout: 'column',
											border: false,
											items: [{
												width: 100,
												border: false,
												items: [{
													xtype: 'label', 
													text: data.data[i].nome,
													style: 'line-height:24px'
												}]
											}, {
												width: 20,
												border: false,
												autoHeight: true,
												bodyStyle: 'padding-top: 4px; padding-left: 2px;',
												items: [{
													border: false,
													xtype: 'checkbox',
													checked: true,
													listeners: {
														check: function (a, b) {
															var box = this.ownerCt.ownerCt.items.items[2].items.items[0];
															if (b) {
																box.disable();
																box.selectAll();
															} else {
																box.enable();
																box.deselectAll();
															}
														}
													}
												}]
											},{
												border: false,
												autoHeight: true,
												items: [{
													border: false,
													xtype: 'lovcombo',
													name: data.data[i].campo,
													value: '',
													disabled: true,
													fieldLabel: data.data[i].nome,
													store: new Ext.data.JsonStore({
														autoLoad:true,
														root:'data',
														fields: ['id', 'nome'],
														id: 'id',
														url: '<?php echo $this->url(array('controller' => 'reports', 'action' => 'get-combo', 'data' => 'grupo'), null, true); ?>?report=' + this.reportName
													}),
													mode: 'local',
													valueField: 'id',
													displayField: 'nome'
												}]
											}]
										}));
									break;
									case 'data':
										this.formReport.add(new Ext.Panel({
											layout: 'column',
											border: false,
											items: [{
												width: 100,
												border: false,
												items: [{
													xtype: 'label', 
													text: data.data[i].nome,
													style: 'line-height:30px'
												}]
											}, {
												labelAlign: 'top',
												layout: 'form',
												border: false,
												items: [new Ext.form.DateField({
													xtype: 'datetimefield',
													format: 'd/m/Y',
													editable: false,
													labelStyle: 'display: none',
													name: 'data',
													value: new Date()
												})]
											}, {
												labelAlign: 'top',
												layout: 'form',
												border: false,
												items: [new Ext.ux.form.SpinnerField({
													labelWidth: 40,
													width: 50,
													xtype: 'spinnerfield',
													labelStyle: 'display:none',
													name: 'data_hora',
													minValue: 0,
													maxValue: 23,
													value: new Date().getHours(),
													decimalPrecision: 1,
													accelerate: true
												})]
											}, {
												labelAlign: 'top',
												layout: 'form',
												border: false,
												items: [new Ext.ux.form.SpinnerField({
													labelWidth: 40,
													width: 50,
													xtype: 'spinnerfield',
													labelStyle: 'display:none',
													name: 'data_minuto',
													minValue: 0,
													maxValue: 59,
													value: new Date().getMinutes(),
													decimalPrecision: 1,
													accelerate: true
												})]
											}]
										}));
									break;
								}
							}
							this.formReport.add(new Ext.Panel({
								html: '&nbsp;',
								border: false,
								bodyStyle: 'margin:20px 0px 0px 0px;padding:0px 0px 0px 20px;border-top:solid 2px #99bbe8;'
							}));
							this.formReport.add(new Ext.Panel({
								layout: 'column',
								border: false,
								items: [{
									width: 110,
									border: false,
									items: [{
										border:false,
										xtype: 'panel', 
										html: '<span style="line-height:26px;margin-right:10px;font-weight:bold;"><?php echo DMG_Translate::_('reports.gen'); ?></span>'
									}]
								},{
									width: 90,
									border: false,
									items: [{
										xtype: 'button', 
										width:70,
										text: '<?php echo DMG_Translate::_('faturamento.reports.tipo.pdf'); ?>',
										iconCls: 'silk-PDF',
										scope: this,
										handler: function () {
											this.printReport('pdf');
										}
									}]
								},{
									width: 90,
									border: false,
									items: [{
										xtype: 'button',
										width:70,
										text: '<?php echo DMG_Translate::_('faturamento.reports.tipo.xls'); ?>',
										iconCls: 'silk-Excel',
										scope: this,
										handler: function () {
											this.printReport('xls');
										}
									}]
								}]
							}));
							this.el.unmask();
							this.formReport.doLayout();
						}
					}
				});
			} else {
				node.expand();
			}
		}, this);
		Reports.superclass.initEvents.call(this);
	},
	onDestroy: function () {
		Reports.superclass.onDestroy.apply(this, arguments);
	}
});
Ext.reg('reports', Reports);