var sm = new Ext.grid.CheckboxSelectionModel();
var RegularizacaoWindowFilter = new Ext.ux.grid.GridFilters({
	local: false,
	menuFilterText: '<?php echo DMG_Translate::_('grid.filter.label'); ?>',
	filters: [{
		type: 'string',
		dataIndex: 'name',
		phpMode: true
	}]
});
var RegularizacaoWindow = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	stripeRows: true,
	loadMask: true,
	sm: sm,
	columnLines: true,
	plugins: [RegularizacaoWindowFilter],
	initComponent: function () {
		this.store = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'regularizacao', 'action' => 'list'), null, true); ?>',
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
			plugins: [RegularizacaoWindowFilter]
		});
		paginator.addSeparator();
		var button = new Ext.Toolbar.Button();
		button.text = '<?php echo DMG_Translate::_('grid.bbar.clearfilter'); ?>';
		button.addListener('click', function(a, b) {
			RegularizacaoWindowFilter.clearFilters();
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
					url: '<?php echo $this->url(array('controller' => 'regularizacao', 'action' => 'locais'), null, true); ?>',
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
			}), '->',
			<?php if (DMG_Acl::canAccess(63)): ?>
			{
				text: '<?php echo DMG_Translate::_('regularizacao.grid.regularizar.controlada'); ?>',
				iconCls: 'silk-wrench',
				scope: this,
				handler: this._doRegularizarControlada
			},
			<?php endif; ?>
			<?php if (DMG_Acl::canAccess(64)): ?>
			{
				text: '<?php echo DMG_Translate::_('regularizacao.grid.regularizar.falha'); ?>',
				iconCls: 'silk-wrench',
				scope: this,
				handler: this._doRegularizarFalha
			},
			<?php endif; ?>
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
		RegularizacaoWindow.superclass.initComponent.call(this);
	},
	initEvents: function () {
		RegularizacaoWindow.superclass.initEvents.call(this);
	},
	onDestroy: function () {
		RegularizacaoWindow.superclass.onDestroy.apply(this, arguments);
		Ext.destroy(this.window);
		this.window = null;
	},
	<?php if (DMG_Acl::canAccess(63)): ?>
	_doRegularizarControlada: function () {
		var arrSelecionados = this.getSelectionModel().getSelections();
		if (arrSelecionados.length > 1) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('regularizacao.manyerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('regularizacao.manyerror'); ?>'});
			return false;
		}
		if (arrSelecionados.length === 0) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('regularizacao.oneerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('regularizacao.oneerror'); ?>'});
			return false;
		}
		var record = this.getSelectionModel().getSelections();
		this._newFormControlada();
		this.windowControlada.setMaquina(record[0].get('id'));
		this.windowControlada.show();
	},
	_newFormControlada: function () {
		if (!this.windowControlada) {
			this.windowControlada = new RegularizacaoFormControlada({
				renderTo: this.body,
				listeners: {
					scope: this,
					salvar: this._reload,
				}
			});
		}
		return this.windowControlada;
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(64)): ?>
	_doRegularizarFalha: function () {
		var arrSelecionados = this.getSelectionModel().getSelections();
		if (arrSelecionados.length > 1) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('regularizacao.manyerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('regularizacao.manyerror'); ?>'});
			return false;
		}
		if (arrSelecionados.length === 0) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('regularizacao.oneerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('regularizacao.oneerror'); ?>'});
			return false;
		}
		var record = this.getSelectionModel().getSelections();
		this._newFormFalha();
		this.windowFalha.setMaquina(record[0].get('id'));
		this.windowFalha.show();
	},
	_newFormFalha: function () {
		if (!this.windowFalha) {
			this.windowFalha = new RegularizacaoFormFalha({
				renderTo: this.body,
				listeners: {
					scope: this,
					salvar: this._reload,
				}
			});
		}
		return this.windowFalha;
	},
	<?php endif; ?>
	_reload: function () {
		this.store.reload();
	},
});
Ext.reg('parque-regularizacao', RegularizacaoWindow);