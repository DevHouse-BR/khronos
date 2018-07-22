var sm = new Ext.grid.CheckboxSelectionModel();
var ParqueConsultaParqueWindowFilter = new Ext.ux.grid.GridFilters({
	local: false,
	menuFilterText: '<?php echo DMG_Translate::_('grid.filter.label'); ?>',
	filters: [{
		type: 'string',
		dataIndex: 'nr_serie_imob',
		phpMode: true
	}]
});
var ParqueConsultaParqueWindow = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	id:'gridConsultaContadores',
	title: '<?php echo DMG_Translate::_('menu.parque.consulta-parque'); ?>',
	stripeRows: true,
	loadMask: true,
	sm: sm,
	columnLines: true,
	plugins: [ParqueConsultaParqueWindowFilter],
	initComponent: function () {
		this.store = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'consulta-parque', 'action' => 'list'), null, true); ?>',
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
			listeners:{
				load: function(store, records, options){
					if(records.length == 0) Ext.getCmp('btnConsultaContadores').disable();
					else Ext.getCmp('btnConsultaContadores').enable();
				}
			},
			fields: [
				{name: 'id', type: 'int'},
				{name: 'nr_serie_imob', type: 'string'},
				{name: 'nr_serie_aux', type: 'string'},
				{name: 'nr_serie_connect', type: 'string'},
				{name: 'nm_jogo', type: 'string'},
				{name: 'nr_versao_jogo', type: 'string'},
				{name: 'simbolo_moeda', type: 'string'},
				{name: 'nm_status_maquina', type: 'string'},
				{name: 'vl_credito', type: 'string'},
				{name: 'id_local', type: 'int'},
				{name: 'id_protocolo', type: 'int'},
				{name: 'nr_cont_1', type: 'int'},
				{name: 'nr_cont_2', type: 'int'},
				{name: 'nr_cont_3', type: 'int'},
				{name: 'nr_cont_4', type: 'int'},
				{name: 'nr_cont_1_parcial', type: 'int'},
				{name: 'nr_cont_2_parcial', type: 'int'},
				{name: 'nr_cont_3_parcial', type: 'int'},
				{name: 'nr_cont_4_parcial', type: 'int'},
			]
		});
		

		var comboLocal = new Ext.form.ComboBox({
			name: 'status',
			minChars:3,
			typeAhead: true,
			emptyText: '<?php echo DMG_Translate::_('parque.maquina.form.id_local.invalid'); ?>',
			store: new Ext.data.JsonStore({
				url: '<?php echo $this->url(array('controller' => 'movimentacao', 'action' => 'locais'), null, true); ?>',
				root: 'data',
				fields: ['id', 'nm_local'],
			}),
			mode: 'remote',
			width: 200,
			triggerAction: 'all',
			displayField: 'nm_local',
			valueField: 'id',
			//editable: false,
			forceSelection: true,
			listeners: {
				scope: this,
				select: function(combo, record) {
					this.store.baseParams.local = parseInt(record.get('id'));
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
			plugins: [ParqueConsultaParqueWindowFilter],
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
			ParqueConsultaParqueWindowFilter.clearFilters();
		});
		paginator.addButton(button);
		Ext.apply(this, {
			viewConfig: {
				emptyText: '<?php echo DMG_Translate::_('grid.empty'); ?>',
				deferEmptyText: false
			},
			bbar: paginator,
			tbar: [comboLocal, '->',
			{
				text: '<?php echo DMG_Translate::_('parque.consulta-parque.grid.movimentar'); ?>',
				iconCls: 'silk-cog',
				id: 'btnConsultaContadores',
				scope: this,
				disabled:true,
				handler: this._onBtnMovimentarSelecionadosClick
			},
			],
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
				dataIndex: 'nr_serie_aux',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_serie_aux.text'); ?>',
				sortable: true
			}, {
				dataIndex: 'nm_jogo',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_jogo.text'); ?>',
			}, {
				dataIndex: 'nr_versao_jogo',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_versao_jogo.text'); ?>',
			}, {
				dataIndex: 'nm_status_maquina',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_status.text'); ?>',
			}, {
				dataIndex: 'simbolo_moeda',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_moeda.text'); ?>',
			}, {
				dataIndex: 'vl_credito',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.vl_credito.text'); ?>',
			}, {
				dataIndex: 'nr_cont_1',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_1.text'); ?>',
			}, {
				dataIndex: 'nr_cont_2',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_2.text'); ?>',
			}, {
				dataIndex: 'nr_cont_3',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_3.text'); ?>',
			}, {
				dataIndex: 'nr_cont_4',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_4.text'); ?>',
			}, {
				dataIndex: 'nr_cont_5',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_5.text'); ?>',
			}, {
				dataIndex: 'nr_cont_6',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_6.text'); ?>',
			}, {
				dataIndex: 'nr_cont_1_parcial',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_1_parcial.text'); ?>',
			}, {
				dataIndex: 'nr_cont_2_parcial',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_2_parcial.text'); ?>',
			}, {
				dataIndex: 'nr_cont_3_parcial',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_3_parcial.text'); ?>',
			}, {
				dataIndex: 'nr_cont_4_parcial',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_4_parcial.text'); ?>',
			}, {
				dataIndex: 'nr_cont_5_parcial',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_5_parcial.text'); ?>',
			}, {
				dataIndex: 'nr_cont_6_parcial',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_6_parcial.text'); ?>',
			}]
		});
		ParqueConsultaParqueWindow.superclass.initComponent.call(this);
	},
	initEvents: function () {
		ParqueConsultaParqueWindow.superclass.initEvents.call(this);
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
	_onCadastroUsuarioSalvarExcluir: function () {
		this.store.reload();
	},
	_newForm: function () {
		if (!this.window) {
			this.window = new ParqueConsultaParqueForm({
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
Ext.reg('parque-consulta-parque', ParqueConsultaParqueWindow);