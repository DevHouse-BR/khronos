var sm = new Ext.grid.CheckboxSelectionModel();
var ParqueConsultaEntradasWindowFilter = new Ext.ux.grid.GridFilters({
	local: false,
	menuFilterText: '<?php echo DMG_Translate::_('grid.filter.label'); ?>',
	filters: [{
		type: 'string',
		dataIndex: 'nr_serie_imob',
		phpMode: true
	}]
});
var ParqueConsultaEntradasWindow = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	id: 'gridConsultaEntrada',
	title: '<?php echo DMG_Translate::_('menu.parque.consulta-entradas'); ?>',
	stripeRows: true,
	loadMask: true,
	sm: sm,
	columnLines: true,
	plugins: [ParqueConsultaEntradasWindowFilter],
	initComponent: function () {
		this.store = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'movimentacao', 'action' => 'consulta-entrada'), null, true); ?>',
			root: 'data',
			idProperty: 'id',
			totalProperty: 'total',
			//autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			sortInfo: {
				field: 'id',
				direction: 'ASC'
			},
			baseParams: {
				limit: <?php echo DMG_Config::get(6); ?>
			},
			fields: [
				{name: 'id', type: 'int'},
				{name: 'nr_serie_imob', type: 'string'},
				{name: 'dt_movimentacao', type: 'string'},
				{name: 'nm_filial_completo', type: 'string'},
				{name: 'nm_local', type: 'string'},
				{name: 'nm_usuario', type: 'string'},
				{name: 'fl_cont_manual', type: 'string'},
				{name: 'nr_dif_cont_1', type: 'int'},
				{name: 'nr_dif_cont_2', type: 'int'},
				{name: 'nr_dif_cont_3', type: 'int'},
				{name: 'nr_dif_cont_4', type: 'int'},
				{name: 'nr_dif_cont_4', type: 'int'},
				{name: 'nr_dif_cont_5', type: 'int'},
				{name: 'nr_dif_cont_6', type: 'int'},
			]
		});
		this.comboFilial = new Ext.form.ComboBox({
			name: 'id_filial',
			minChars: 3,
			typeAhead: true,
			emptyText: '<?php echo DMG_Translate::_('parque.consulta-entrada.selecione_filial'); ?>',
			store: new Ext.data.JsonStore({
				url: '<?php echo $this->url(array('controller' => 'movimentacao', 'action' => 'filiais'), null, true); ?>',
				root: 'data',
				fields: ['id', 'nome'],
			}),
			mode: 'remote',
			width: 200,
			triggerAction: 'all',
			displayField: 'nome',
			valueField: 'id',
			forceSelection: true,
			listeners: {
				scope: this,
				select: function(combo, record) {
					this.store.baseParams.id_filial = parseInt(record.get('id'));
					this.store.reload();
				}
			}
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
			pageSize: <?php echo DMG_Config::get(6); ?>,
			plugins: [ParqueConsultaEntradasWindowFilter],
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
			ParqueConsultaEntradasWindowFilter.clearFilters();
		});
		paginator.addButton(button);
		Ext.apply(this, {
			viewConfig: {
				emptyText: '<?php echo DMG_Translate::_('grid.empty'); ?>',
				deferEmptyText: false
			},
			bbar: paginator,
			tbar: [this.comboFilial],
			columns: [sm, {
				dataIndex: 'id',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id.text'); ?>',
				width: 30,
				sortable: true
			}, {
				dataIndex: 'nr_serie_imob',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_serie_imob.text'); ?>',
				sortable: true
			}, {
				dataIndex: 'dt_movimentacao',
				header: '<?php echo DMG_Translate::_('parque.consulta-entrada.dt_movimentacao'); ?>',
			}, {
				dataIndex: 'nm_filial_completo',
				header: '<?php echo DMG_Translate::_('parque.consulta-entrada.nm_filial'); ?>',
			}, {
				dataIndex: 'nm_local',
				header: '<?php echo DMG_Translate::_('parque.consulta-entrada.nm_local'); ?>',
			}, {
				dataIndex: 'nm_usuario',
				header: '<?php echo DMG_Translate::_('parque.consulta-entrada.nm_usuario'); ?>',
			}, {
				dataIndex: 'fl_cont_manual',
				header: '<?php echo DMG_Translate::_('parque.consulta-entrada.fl_cont_manual'); ?>',
				renderer: function (value) {
					if (value == 'true') {
						return '<?php echo DMG_Translate::_('yes'); ?>';
					} else {
						return '<?php echo DMG_Translate::_('no'); ?>';
					}
				}
			}, {
				dataIndex: 'nr_dif_cont_1',
				header: '<?php echo DMG_Translate::_('parque.consulta-entrada.nr_dif_cont_1'); ?>',
			}, {
				dataIndex: 'nr_dif_cont_2',
				header: '<?php echo DMG_Translate::_('parque.consulta-entrada.nr_dif_cont_2'); ?>',
			}, {
				dataIndex: 'nr_dif_cont_3',
				header: '<?php echo DMG_Translate::_('parque.consulta-entrada.nr_dif_cont_3'); ?>',
			}, {
				dataIndex: 'nr_dif_cont_4',
				header: '<?php echo DMG_Translate::_('parque.consulta-entrada.nr_dif_cont_4'); ?>',
			}, {
				dataIndex: 'nr_dif_cont_5',
				header: '<?php echo DMG_Translate::_('parque.consulta-entrada.nr_dif_cont_5'); ?>',
			}, {
				dataIndex: 'nr_dif_cont_6',
				header: '<?php echo DMG_Translate::_('parque.consulta-entrada.nr_dif_cont_6'); ?>',
			}]
		});
		ParqueConsultaEntradasWindow.superclass.initComponent.call(this);
	},
	initEvents: function () {
		ParqueConsultaEntradasWindow.superclass.initEvents.call(this);
		this.on({
			scope: this,
		});
	},
	_onBtnMovimentarSelecionadosClick: function(){
		this.el.mask('<?php echo DMG_Translate::_('i18n.loading'); ?>');
		var arrSelecionados = this.getSelectionModel().getSelections();
		var ids = [];
		if (arrSelecionados.length == 0) {
			for (var i = 0; i < this.store.data.items.length; i++) {
				ids[i] = this.store.data.items[i].id;
			}
		} else {
			for (var i = 0; i < arrSelecionados.length; i++) {
				ids[i] = arrSelecionados[i].id;
			}
		}
		var con = new Ext.data.Connection();
		con.request({
			disableCaching: true,
			url: '<?php echo $this->url(array('controller' => 'consulta-parque', 'action' => 'get'), null, true); ?>',
			method: 'post',
			params: {
				'id[]': ids
			},
			scope: this,
			success: function(response, opts){
				try {
					var data = Ext.decode(response.responseText);
					if (data.success == true) {
						var i = 0;
						while (true) {
							if (!data.data[i]) {
								break;
							}
							var idx = this.store.data.findIndex('id', data.data[i].id);
							var registro = this.store.getAt(idx);
							var dado = data.data[i];
							if (dado.online > 0) {
								registro.set('nr_cont_1', dado.nr_cont_1);
								registro.set('nr_cont_2', dado.nr_cont_2);
								registro.set('nr_cont_3', dado.nr_cont_3);
								registro.set('nr_cont_4', dado.nr_cont_4);
								registro.set('nr_cont_5', dado.nr_cont_5);
								registro.set('nr_cont_6', dado.nr_cont_6);
								registro.set('nr_cont_1_parcial', dado.nr_cont_1_parcial);
								registro.set('nr_cont_2_parcial', dado.nr_cont_2_parcial);
								registro.set('nr_cont_3_parcial', dado.nr_cont_3_parcial);
								registro.set('nr_cont_4_parcial', dado.nr_cont_4_parcial);
								registro.set('nr_cont_5_parcial', dado.nr_cont_5_parcial);
								registro.set('nr_cont_6_parcial', dado.nr_cont_6_parcial);
								registro.commit();
								if (dado.online == 3) {
									Ext.get(this.getView().getRow(idx)).addClass('tgridjogando');
									Ext.get(this.getView().getRow(idx)).removeClass('tgriderror');
								}
								else if (dado.online == 2) {
									Ext.get(this.getView().getRow(idx)).addClass('tgriderror');
									Ext.get(this.getView().getRow(idx)).removeClass('tgridjogando');
								}
								else if (dado.online == 1) {
									Ext.get(this.getView().getRow(idx)).removeClass('tgridjogando');
									Ext.get(this.getView().getRow(idx)).removeClass('tgriderror');
								}
							}
							else {
								registro.set('nr_cont_1', '');
								registro.set('nr_cont_2', '');
								registro.set('nr_cont_3', '');
								registro.set('nr_cont_4', '');
								registro.set('nr_cont_5', '');
								registro.set('nr_cont_6', '');
								registro.set('nr_cont_1_parcial', '');
								registro.set('nr_cont_2_parcial', '');
								registro.set('nr_cont_3_parcial', '');
								registro.set('nr_cont_4_parcial', '');
								registro.set('nr_cont_5_parcial', '');
								registro.set('nr_cont_6_parcial', '');
								registro.commit();
								Ext.get(this.getView().getRow(idx)).addClass('tgriderror');
								Ext.get(this.getView().getRow(idx)).removeClass('tgridjogando');
							}
							this.getSelectionModel().deselectRow(idx);
							i++;
						}
					} else {
						uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: data.message});
					}
				} catch (e) {};
				this.el.unmask();
			},
			failure: function(){}
		});
	},
});
Ext.reg('parque-consulta-entradas', ParqueConsultaEntradasWindow);