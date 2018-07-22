var sm = new Ext.grid.CheckboxSelectionModel();
var ParqueMaquinaWindowFilter = new Ext.ux.grid.GridFilters({
	local: false,
	menuFilterText: '<?php echo DMG_Translate::_('grid.filter.label'); ?>',
	filters: [{
		type: 'string',
		dataIndex: 'name',
		phpMode: true
	}]
});
var ParqueMaquinaWindow = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	stripeRows: true,
	loadMask: true,
	sm: sm,
	columnLines: true,
	plugins: [ParqueMaquinaWindowFilter],
	initComponent: function () {
		this.store = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'maquina', 'action' => 'list'), null, true); ?>',
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
				limit: 30,
				status: 1
			},
			fields: [
				{name: 'id', type: 'int'},
				{name: 'nr_serie_imob', type: 'string'},
				{name: 'nr_serie_connect', type: 'string'},
				{name: 'nr_serie_aux', type: 'string'},
				{name: 'nm_jogo', type: 'string'},
				{name: 'nm_filial', type: 'string'},
				{name: 'nm_local', type: 'string'},
				{name: 'nm_parceiro', type: 'string'},
				{name: 'simbolo_moeda', type: 'string'},
				{name: 'nm_status_maquina', type: 'string'},
				{name: 'vl_credito', type: 'string'},
				{name: 'nr_cont_1', type: 'string'},
				{name: 'nr_cont_2', type: 'string'},
				{name: 'nr_cont_3', type: 'string'},
				{name: 'nr_cont_4', type: 'string'},
				{name: 'nr_cont_5', type: 'string'},
				{name: 'nr_cont_6', type: 'string'},
			]
		});
		var paginator = new Ext.PagingToolbar({
			store: this.store,
			pageSize: 30,
			plugins: [ParqueMaquinaWindowFilter]
		});
		paginator.addSeparator();
		var button = new Ext.Toolbar.Button();
		button.text = '<?php echo DMG_Translate::_('grid.bbar.clearfilter'); ?>';
		button.addListener('click', function(a, b) {
			ParqueMaquinaWindowFilter.clearFilters();
		});
		paginator.addButton(button);
		var comboStatus = new Ext.form.ComboBox({
			name: 'status',
			store: new Ext.data.ArrayStore({
				fields: ['id', 'name'],
				data  : [
					['0', '<?php echo DMG_Translate::_('parque.maquina.status.inativa'); ?>'],
					['1', '<?php echo DMG_Translate::_('parque.maquina.status.ativa'); ?>']
				]
			}),
			mode: 'local',
			value: '1',
			triggerAction: 'all',
			displayField: 'name',
			valueField: 'id',
			editable: false,
			forceSelection: true
		});
		comboStatus.on('select', function(combo, record) {
			this.store.baseParams.status = parseInt(record.get('id'), 10);
			this.store.reload();
		}, this);
		Ext.apply(this, {
			viewConfig: {
				emptyText: '<?php echo DMG_Translate::_('grid.empty'); ?>',
				deferEmptyText: false
			},
			bbar: paginator,
			<?php if (DMG_Acl::canAccess(27)): ?>
			tbar: [comboStatus, '->',
			<?php if (DMG_Acl::canAccess(27)): ?>
			{
				text: '<?php echo DMG_Translate::_('grid.form.add'); ?>',
				iconCls: 'silk-add',
				scope: this,
				handler: this._onBtnNovoUsuarioClick
			},
			<?php endif; ?>
			],
			<?php endif; ?>
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
				dataIndex: 'nm_filial',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_filial.text'); ?>',
			}, {
				dataIndex: 'nm_local',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_local.text'); ?>',
			}, {
				dataIndex: 'nm_parceiro',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_parceiro.text'); ?>',
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
				dataIndex: 'nr_serie_connect',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_serie_connect.text'); ?>',
				sortable: true
			}]
		});
		ParqueMaquinaWindow.superclass.initComponent.call(this);
	},
	initEvents: function () {
		ParqueMaquinaWindow.superclass.initEvents.call(this);
		this.on({
			scope: this,
			<?php if (DMG_Acl::canAccess(26)): ?>
			rowdblclick: this._onGridRowDblClick
			<?php endif; ?>
		});
	},
	onDestroy: function () {
		ParqueMaquinaWindow.superclass.onDestroy.apply(this, arguments);
		Ext.destroy(this.window);
		this.window = null;
	},
	<?php if (DMG_Acl::canAccess(27)): ?>
	_onBtnNovoUsuarioClick: function () {
		this._newForm();
		this.window.setmaquina(0);
		this.window.show();
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(26) || DMG_Acl::canAccess(27)): ?>
	_onCadastroUsuarioSalvarExcluir: function () {
		this.store.reload();
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(26)): ?>
	_onGridRowDblClick: function (grid, rowIndex, e) {
		var record = grid.getStore().getAt(rowIndex);
		var id = record.get('id');
		this._newForm();
		this.window.setmaquina(id);
		this.window.show();
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(26) || DMG_Acl::canAccess(27)): ?>
	_newForm: function () {
		if (!this.window) {
			this.window = new ParqueMaquinaForm({
				renderTo: this.body,
				listeners: {
					scope: this,
					salvar: this._onCadastroUsuarioSalvarExcluir,
				}
			});
		}
		return this.window;
	}
	<?php endif; ?>
});
Ext.reg('parque-maquina', ParqueMaquinaWindow);