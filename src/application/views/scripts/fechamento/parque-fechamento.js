var sm = new Ext.grid.CheckboxSelectionModel();
var ParqueFechamentoWindowFilter = new Ext.ux.grid.GridFilters({
	local: false,
	menuFilterText: '<?php echo DMG_Translate::_('grid.filter.label'); ?>',
	filters: [{
		type: 'string',
		dataIndex: 'name',
		phpMode: true
	}]
});
var ParqueFechamentoWindow = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	stripeRows: true,
	loadMask: true,
	sm: sm,
	columnLines: true,
	plugins: [ParqueFechamentoWindowFilter],
	initComponent: function () {
		this.store = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'fechamento', 'action' => 'list'), null, true); ?>',
			root: 'data',
			idProperty: 'id',
			totalProperty: 'total',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			sortInfo: {
				field: 'id',
				direction: 'DESC'
			},
			baseParams: {
				limit: 30
			},
			fields: [
				{name: 'id', type: 'int'},
				{name: 'id_origem', type: 'int'},
				{name: 'dt_fechamento', type: 'string'},
				{name: 'id_status_fechamento_doc', type: 'string'},
				{name: 'diff_cont_4', type: 'int'},
				{name: 'diff_cont_3', type: 'int'},
				{name: 'diff_cont_1', type: 'int'},
				{name: 'diff_cont_2', type: 'int'},
			]
		});
		var comboPaginator = new Ext.form.ComboBox({
			name: 'perpage',
			width: 40,
			store: new Ext.data.ArrayStore({
				fields: ['id', 'name'],
				data  : [
					['15', '15'],
					['30', '30'],
					['50', '50'],
					['0', '<?php echo DMG_Translate::_('grid.paginator.all'); ?>'],
				]
			}),
			mode: 'local',
			value: <?php echo DMG_Config::get(6); ?>,
			listWidth: 40,
			triggerAction: 'all',
			displayField: 'name',
			valueField: 'id',
			editable: false,
			forceSelection: true
		});
		var paginator = new Ext.PagingToolbar({
			store: this.store,
			pageSize: 30,
			plugins: [ParqueFechamentoWindowFilter],
			displayInfo: true,
			items: [
				'-',
				'<?php echo DMG_Translate::_('grid.paginator.perpage'); ?>: ',
				comboPaginator,
			]
		});
		comboPaginator.on('select', function(combo, record) {
			paginator.pageSize = parseInt(record.get('id'), 10);
			paginator.doLoad(paginator.cursor);
		}, this);
		paginator.addSeparator();
		var button = new Ext.Toolbar.Button();
		button.text = '<?php echo DMG_Translate::_('grid.bbar.clearfilter'); ?>';
		button.addListener('click', function(a, b) {
			ParqueFechamentoWindowFilter.clearFilters();
		});
		paginator.addButton(button);
		Ext.apply(this, {
			viewConfig: {
				emptyText: '<?php echo DMG_Translate::_('grid.empty'); ?>',
				deferEmptyText: false
			},
			bbar: paginator,
			tbar: ['->',
			<?php if (DMG_Acl::canAccess(33)): ?>
			{
				text: '<?php echo DMG_Translate::_('parque.fechamento.grid.gerar'); ?>',
				iconCls: 'silk-report',
				scope: this,
				handler: this._gerarFechamento,
			},
			<?php endif; ?>
			{
				text: '<?php echo DMG_Translate::_('parque.fechamento.grid.imprimir'); ?>',
				iconCls: 'silk-printer',
				scope: this,
				handler: this._imprimirFechamento,
			},
			],
			columns: [sm, {
				dataIndex: 'id',
				header: '<?php echo DMG_Translate::_('parque.fechamento.form.id.text'); ?>',
			}, {
				dataIndex: 'dt_fechamento',
				header: '<?php echo DMG_Translate::_('parque.fechamento.form.dt_fechamento.text'); ?>',
				width: 140,
			}, {
				dataIndex: 'diff_cont_4',
				header: '<?php echo DMG_Translate::_('parque.fechamento.nr_cont.entradas'); ?>'
			}, {
				dataIndex: 'diff_cont_3',
				header: '<?php echo DMG_Translate::_('parque.fechamento.nr_cont.saidas'); ?>'
			}, {
				dataIndex: 'diff_cont_1',
				header: '<?php echo DMG_Translate::_('parque.fechamento.nr_cont.apostado'); ?>'
			}, {
				dataIndex: 'diff_cont_2',
				header: '<?php echo DMG_Translate::_('parque.fechamento.nr_cont.pago'); ?>'
			}]
		});
		ParqueFechamentoWindow.superclass.initComponent.call(this);
	},
	initEvents: function () {
		ParqueFechamentoWindow.superclass.initEvents.call(this);
		this.on({
			scope: this,
			rowdblclick: this._onGridRowDblClick
		});
	},
	onDestroy: function () {
		ParqueFechamentoWindow.superclass.onDestroy.apply(this, arguments);
		Ext.destroy(this.window);
		this.window = null;
	},
	<?php if (DMG_Acl::canAccess(33)): ?>
	_gerarFechamento: function () {
		Ext.MessageBox.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('parque.fechamento.confirm1'); ?>', function (a) {
			if (a == 'no') {
				return;
			} else {
				this.el.mask("<?php echo DMG_Translate::_('parque.fechamento.loading'); ?>");
				var con = new Ext.data.Connection();
				con.request({
					url: '<?php echo $this->url(array('controller' => 'fechamento', 'action' => 'execute'), null, true); ?>',
					method: 'post',
					scope: this,
					callback: function (a, b, c) {
						this.el.unmask();
						try {
							var data = Ext.decode(c.responseText);
							if (data.offline == true) {
								Ext.MessageBox.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('parque.fechamento.maquinasOffline.text'); ?>', function(d) {
									if (d == 'yes') {
										this.el.mask("<?php echo DMG_Translate::_('parque.fechamento.loading'); ?>");
										var con2 = new Ext.data.Connection();
										con2.request({
											url: '<?php echo $this->url(array('controller' => 'fechamento', 'action' => 'execute', 'ignora' => '1'), null, true); ?>',
											method: 'post',
											scope: this,
											callback: function (f, g, h) {
												this.el.unmask();
												try {
													var data3 = Ext.decode(h.responseText);
													this.parseJogando(data3);
												} catch (y) {};
											}
										});
									}
								}, this);
							} else {
								this.parseJogando(data);
							}
						} catch (e) {};
					}
				});
			}
		}, this);
	},
	parseJogando: function (data) {
		if (data.jogando == true) {
			Ext.MessageBox.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('parque.fechamento.maquinasJogando.text'); ?>', function(i) {
				if (i == 'yes') {
					this.el.mask("<?php echo DMG_Translate::_('parque.fechamento.loading'); ?>");
					var con3 = new Ext.data.Connection();
					con3.request({
						url: '<?php echo $this->url(array('controller' => 'fechamento', 'action' => 'execute', 'ignora' => '2'), null, true); ?>',
						method: 'post',
						scope: this,
						callback: function (j, k, l) {
							this.el.unmask();
							try {
								var data4 = Ext.decode(l.responseText);
								this.terminaFechamento(data4);
							} catch (x) {};
						}
					});
				}
			}, this);
		} else {
			this.terminaFechamento(data);
		}
	},
	terminaFechamento: function (data) {
		if (data.failure == true) {
			Ext.MessageBox.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', data.message);
		} else {
			Ext.MessageBox.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('parque.fechamento.confirm2'); ?>', function(a) {
				if (a == 'no') {
					return;
				} else {
					this.imprimirFechamento(data.id, data.data);
				}
			}, this);
		}
		this.store.reload();
	},
	<?php endif; ?>
	_imprimirFechamento: function (a) {
		var arrSelecionados = this.getSelectionModel().getSelections();
		if (arrSelecionados.length > 1) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('parque.fechamento.imprimir.manyerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('parque.fechamento.imprimir.manyerror'); ?>'});
			return false;
		}
		if (arrSelecionados.length === 0) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('parque.fechamento.imprimir.oneerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('parque.fechamento.imprimir.oneerror'); ?>'});
			return false;
		}
		this.imprimirFechamento(arrSelecionados[0].get('id'), arrSelecionados[0].get('dt_fechamento'));
	},
	imprimirFechamento: function (id) {
		window.open('download.php?id=' + id + '&__dc=' + new Date().getTime(), 'print');
	},
	_onCadastroUsuarioSalvarExcluir: function () {
		this.store.reload();
	},
	_onGridRowDblClick: function (grid, rowIndex, e) {
		var record = grid.getStore().getAt(rowIndex);
		var id = record.get('id');
		this._newForm();
		this.window.setfechamento(id);
		this.window.show();
	},
	_newForm: function () {
		if (!this.window) {
			this.window = new ParqueFechamentoForm({
				renderTo: this.body,
				listeners: {
					scope: this,
					salvar: this._onCadastroUsuarioSalvarExcluir,
				}
			});
		}
		return this.window;
	}
});
Ext.reg('parque-fechamento', ParqueFechamentoWindow);