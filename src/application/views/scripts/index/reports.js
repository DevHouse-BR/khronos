var Reports = Ext.extend(Ext.Panel, {
	border: false,
	stripeRows: true,
	loadMask: true,
	columnLines: true,
	initComponent: function () {
		this.printReport = function (format) {
			var url = "<?php echo $this->url(array('controller' => 'reports', 'action' => 'export')); ?>?format=" + format + "&report=" + this.reportName;
			this.formReport.items.each(function(c){
				try {
					var val = null;
					if (typeof c.value == 'undefined') {
						val = c.items.items[1].items.items[0];
					} else {
						val = c;
					}
					if (val.value.length == 0) {
						val.selectAll();
					}
					var values = val.value.split(",");
					for (var i = 0; i < values.length; i++) {
						url += "&" + val.name + "[]=" + values[i];
					}
				} catch (e){};
			});
			window.open(url, 'report');
		};
		this.formReport = new Ext.form.FormPanel({
			layout: 'form',
			id: 'formReports',
			border: false,
			bodyStyle: 'padding: 5px',
			items: [{border: false, html:'<?php echo DMG_Translate::_('reports.select'); ?>'}],
			bbar: [{
				text: '<?php echo DMG_Translate::_('reports.tipo.pdf'); ?>',
				scope: this,
				handler: function () {
					this.printReport('pdf');
				}
			},{
				text: '<?php echo DMG_Translate::_('reports.tipo.xls'); ?>',
				scope: this,
				handler: function () {
					this.printReport('xls');
				}
			}]
		});
		this.treeReport = new Ext.tree.TreePanel({
			name: 'tree1',
			id: 'tree1',
			autoWidth: true,
			autoHeight: true,
			border: false,
			useArrows: true,
			enableDD: true,
			overflow: 'scroll',
			root: new Ext.tree.AsyncTreeNode({
				text: '<?php echo DMG_Translate::_('reports'); ?>',
				iconCls: 'folder',
				draggable: false,
				id: '0',
				children: <?php echo Khronos_Reports::getJsonTreeList(); ?>
			})
		});
		this.panelReport = new Ext.Panel({
			border: false,
			items: [this.formReport]
		});
		Ext.apply(this, {
			bodyStyle: 'padding: 5px',
			width: '100%',
			height: '100%',
			layout: 'column',
			items: [{
				title: '<?php echo DMG_Translate::_('reports.disponible'); ?>',
				width: '200px',
				autoHeight: true,
				items: [this.treeReport]
			}, {
				width: '5px',
				autoHeight: true,
				html: '&nbsp;',
				border: false,
			}, {
				title: '<?php echo DMG_Translate::_('reports.filtering'); ?>',
				columnWidth: 1,
				autoHeight: true,
				items: [this.panelReport]
			}]
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
								html: '<b>' + data.titulo + '</b>',
								border: false
							}));
							this.formReport.add(new Ext.Panel({
								html: data.descricao,
								border: false,
								bodyStyle: 'margin-bottom: 10px',
							}));
							this.formReport.add(new Ext.Panel({
								html: '<b><?php echo DMG_Translate::_('reports.filters'); ?></b>',
								bodyStyle: 'margin-bottom: 5px',
								border: false,
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
												items: [{xtype: 'label', text: data.data[i].nome}]
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
														url: '<?php echo $this->url(array('controller' => 'reports', 'action' => 'get-combo', 'data' => 'jogo'), null, true); ?>?report=' + this.reportName,
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
												items: [{xtype: 'label', text: data.data[i].nome}]
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
														url: '<?php echo $this->url(array('controller' => 'reports', 'action' => 'get-combo', 'data' => 'gabinete'), null, true); ?>?report=' + this.reportName,
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
												items: [{xtype: 'label', text: data.data[i].nome}]
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
														url: '<?php echo $this->url(array('controller' => 'reports', 'action' => 'get-combo', 'data' => 'grupo'), null, true); ?>?report=' + this.reportName,
													}),
													mode: 'local',
													valueField: 'id',
													displayField: 'nome'
												}]
											}]
										}));
									break;
								}
							}
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
	},
});
Ext.reg('reports', Reports);