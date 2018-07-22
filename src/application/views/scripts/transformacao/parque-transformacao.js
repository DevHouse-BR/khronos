var sm = new Ext.grid.CheckboxSelectionModel();
var ParqueTransformacaoWindowFilter = new Ext.ux.grid.GridFilters({
	local: false,
	menuFilterText: '<?php echo DMG_Translate::_('grid.filter.label'); ?>',
	filters: [{
		type: 'string',
		dataIndex: 'name',
		phpMode: true
	}]
});
var ParqueTransformacaoWindow = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	stripeRows: true,
	loadMask: true,
	sm: sm,
	columnLines: true,
	plugins: [ParqueTransformacaoWindowFilter],
	initComponent: function () {
		this.store = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'transformacao', 'action' => 'list'), null, true); ?>',
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
				local: 0,
				limit: 30
			},
			fields: [
				{name: 'id', type: 'int'},
				{name: 'nr_serie_imob', type: 'string'},
				{name: 'nr_serie_connect', type: 'string'},
				{name: 'nr_serie_aux', type: 'string'},
				{name: 'nr_versao_jogo', type: 'string'},
				{name: 'nm_jogo', type: 'string'},
				{name: 'nm_gabinete', type: 'string'},
				{name: 'simbolo_moeda', type: 'string'},
				{name: 'nm_status_maquina', type: 'string'},
				{name: 'vl_credito', type: 'string'},
			]
		});
		var paginator = new Ext.PagingToolbar({
			store: this.store,
			pageSize: 30,
			plugins: [ParqueTransformacaoWindowFilter]
		});
		paginator.addSeparator();
		var button = new Ext.Toolbar.Button();
		button.text = '<?php echo DMG_Translate::_('grid.bbar.clearfilter'); ?>';
		button.addListener('click', function(a, b) {
			ParqueTransformacaoWindowFilter.clearFilters();
		});
		paginator.addButton(button);
		Ext.apply(this, {
			viewConfig: {
				emptyText: '<?php echo DMG_Translate::_('grid.empty'); ?>',
				deferEmptyText: false
			},
			bbar: paginator,
			tbar: [new Ext.form.ComboBox({
				name: 'status',
				minChars:3,
				typeAhead: true,
				store: new Ext.data.JsonStore({
					url: '<?php echo $this->url(array('controller' => 'transformacao', 'action' => 'locais'), null, true); ?>',
					root: 'data',
					fields: ['id', 'nm_local']
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
			}), '->', {
				text: '<?php echo DMG_Translate::_('parque.transformacao.grid.transformar'); ?>',
				iconCls: 'silk-wrench',
				scope: this,
				handler: this._onBtnNovoUsuarioClick
			},
			],
			columns: [sm, {
				dataIndex: 'id',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id.text'); ?>',
				width: 40,
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
				dataIndex: 'nm_gabinete',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_gabinete.text'); ?>',
			}, {
				dataIndex: 'simbolo_moeda',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_moeda.text'); ?>',
			}, {
				dataIndex: 'vl_credito',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.vl_credito.text'); ?>',
			}, {
				dataIndex: 'nm_status_maquina',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_status.text'); ?>',
			}]
		});
		ParqueTransformacaoWindow.superclass.initComponent.call(this);
	},
	initEvents: function () {
		ParqueTransformacaoWindow.superclass.initEvents.call(this);
		this.on({
			scope: this,
			rowdblclick: this._onGridRowDblClick
		});
	},
	onDestroy: function () {
		ParqueTransformacaoWindow.superclass.onDestroy.apply(this, arguments);
		Ext.destroy(this.window);
		this.window = null;
	},
	_onBtnNovoUsuarioClick: function () {
		var arrSelecionados = this.getSelectionModel().getSelections();
		if (arrSelecionados.length > 1) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('parque.transformacao.manyerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('parque.transformacao.manyerror'); ?>'});
			return false;
		}
		if (arrSelecionados.length === 0) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('parque.transformacao.oneerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('parque.transformacao.oneerror'); ?>'});
			return false;
		}
		var record = this.getSelectionModel().getSelections();
		this._newForm();
		this.window.settransformacao(record[0].get('id'));
		this.window.show();
	},
	_onCadastroUsuarioSalvarExcluir: function () {
		this.store.reload();
	},
	_onGridRowDblClick: function (grid, rowIndex, e) {
		var record = grid.getStore().getAt(rowIndex);
		var id = record.get('id');
		this._newForm();
		this.window.settransformacao(id);
		this.window.show();
	},
	_newForm: function () {
		if (!this.window) {
			this.window = new ParqueTransformacaoForm({
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
Ext.reg('parque-transformacao', ParqueTransformacaoWindow);