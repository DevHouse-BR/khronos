var sm = new Ext.grid.CheckboxSelectionModel();
var MovimentacaoEntradaWindowFilter = new Ext.ux.grid.GridFilters({
	local: false,
	menuFilterText: '<?php echo DMG_Translate::_('grid.filter.label'); ?>',
	filters: []
});
var MovimentacaoEntradaWindow = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	stripeRows: true,
	loadMask: true,
	sm: sm,
	columnLines: true,
	plugins: [MovimentacaoEntradaWindowFilter],
	initComponent: function () {
		MovimentacaoEntradaWindowFilter.addFilter({
			type: 'string',
			dataIndex: 'nr_serie_imob',
			phpMode: true
		});
		this.store = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'movimentacao', 'action' => 'lista-entrada'), null, true); ?>',
			root: 'data',
			idProperty: 'id',
			totalProperty: 'total',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			sortInfo: {
				field: 'id',
				direction: 'ASC'
			},
			baseParams: {
				limit: 30
			},
			fields: [
				{name: 'id', type: 'int'},
				{name: 'nr_serie_imob', type: 'string'},
				{name: 'id_status', type: 'string'},
				{name: 'dt_ultima_movimentacao', type: 'string'},
				{name: 'dt_ultima_transformacao', type: 'string'},
				{name: 'id_delegacao', type: 'string'},
				{name: 'nr_cont_1', type: 'int'},
				{name: 'nr_cont_2', type: 'int'},
				{name: 'nr_cont_3', type: 'int'},
				{name: 'nr_cont_4', type: 'int'},
				{name: 'nr_cont_5', type: 'int'},
				{name: 'nr_cont_6', type: 'int'}
			]
		});
		
		var paginator = new Ext.PagingToolbar({
			store: this.store,
			pageSize: 30,
			plugins: [MovimentacaoEntradaWindowFilter],
			buttons:['-', {
				text: '<?php echo DMG_Translate::_('grid.bbar.clearfilter'); ?>',
				scope:this,
				handler: function(botao, evento){
					MovimentacaoEntradaWindowFilter.clearFilters();
					this.filtroField.reset();
				}
			}]
		});

		var comboFilial = new Ext.form.ComboBox({
			name: 'status',
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
			editable: false,
			forceSelection: true
		});
		comboFilial.on('select', function(combo, record) {
			this.store.baseParams.filial = parseInt(record.get('id'));
			MovimentacaoEntradaWindowFilter.getFilter(0).active = true;
			MovimentacaoEntradaWindowFilter.getFilter(0).setValue(this.filtroField.getValue());
			//this.store.reload();
		}, this);
		Ext.apply(this, {
			viewConfig: {
				emptyText: '<?php echo DMG_Translate::_('grid.empty'); ?>',
				deferEmptyText: false
			},
			bbar: paginator,
			tbar: [comboFilial,
			{
				xtype:'textfield',
				style:'margin-left:5px',
				ref: '../filtroField',
				listeners:{
					specialkey:function(campo, e){
						if (e.getKey() == 13){
							MovimentacaoEntradaWindowFilter.getFilter(0).active = true;
							MovimentacaoEntradaWindowFilter.getFilter(0).setValue(campo.getValue());
						}
					}
				}
			}, 
			'->',
			{
				text: '<?php echo DMG_Translate::_('movimentacao-entrada.adicionar'); ?>',
				iconCls: 'silk-cog',
				scope: this,
				handler: this._onBtnMovimentar
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
				dataIndex: 'id_status',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_status.text'); ?>',
				sortable: true
			}, {
				dataIndex: 'nr_cont_1',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_1.text'); ?>',
				sortable: true
			}, {
				dataIndex: 'nr_cont_2',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_2.text'); ?>',
				sortable: true
			}, {
				dataIndex: 'nr_cont_3',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_3.text'); ?>',
				sortable: true
			}, {
				dataIndex: 'nr_cont_4',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_4.text'); ?>',
				sortable: true
			}, {
				dataIndex: 'nr_cont_5',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_5.text'); ?>',
				sortable: true
			}, {
				dataIndex: 'nr_cont_6',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_6.text'); ?>',
				sortable: true
			}]
		});
		MovimentacaoEntradaWindow.superclass.initComponent.call(this);
	},
	initEvents: function () {
		MovimentacaoEntradaWindow.superclass.initEvents.call(this);
		this.on({
			scope: this,
			rowdblclick: this._onGridRowDblClick
		});
	},
	_onBtnMovimentar: function () {
		var arrSelecionados = this.getSelectionModel().getSelections();
		if (arrSelecionados.length > 1) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('movimentacao.manyerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('movimentacao.manyerror'); ?>'});
			return false;
		}
		if (arrSelecionados.length === 0) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('movimentacao.oneerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('movimentacao.oneerror'); ?>'});
			return false;
		}
		var record = this.getSelectionModel().getSelections();
		this._newForm(record[0].get('id'));
	},
	_onCadastroUsuarioSalvarExcluir: function () {
		this.store.reload();
	},
	_onGridRowDblClick: function (grid, rowIndex, e) {
		var record = grid.getStore().getAt(rowIndex);
		var id = record.get('id');
		this._newForm(id);
	},
	_newForm: function (id) {
		if (!this.window) {
			this.window = new MovimentacaoEntradaForm({
				renderTo: this.body,
				listeners: {
					scope: this,
					salvar: this._onCadastroUsuarioSalvarExcluir,
				}
			});
		}
		this.window.setMaquina(id);
		this.window.show();
	}
});
Ext.reg('movimentacao-entrada', MovimentacaoEntradaWindow);