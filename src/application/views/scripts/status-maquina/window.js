var sm = new Ext.grid.CheckboxSelectionModel();
var StatusMaquinaWindowFilter = new Ext.ux.grid.GridFilters({
	local: false,
	menuFilterText: '<?php echo DMG_Translate::_('grid.filter.label'); ?>',
	filters: [{
		type: 'string',
		dataIndex: 'nm_status_maquina',
		phpMode: true
	}]
});
var StatusMaquinaWindow = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	stripeRows: true,
	loadMask: true,
	sm: sm,
	columnLines: true,
	plugins: [StatusMaquinaWindowFilter],
	initComponent: function () {
		this.store = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'status-maquina', 'action' => 'list'), null, true); ?>',
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
				{name: 'nm_status_maquina', type: 'string'},
				{name: 'fl_permite_movimentacao', type: 'int'},
				{name: 'fl_permite_transformacao', type: 'int'},
				{name: 'fl_permite_faturamento', type: 'int'},
				{name: 'fl_permite_regularizacao', type: 'int'},
				{name: 'fl_operativa', type: 'int'},
				{name: 'fl_alta', type: 'int'}
			]
		});
		var paginator = new Ext.PagingToolbar({
			store: this.store,
			pageSize: 30,
			plugins: [StatusMaquinaWindowFilter]
		});
		paginator.addSeparator();
		var button = new Ext.Toolbar.Button();
		button.text = '<?php echo DMG_Translate::_('grid.bbar.clearfilter'); ?>';
		button.addListener('click', function(a, b) {
			StatusMaquinaWindowFilter.clearFilters();
		});
		paginator.addButton(button);
		Ext.apply(this, {
			viewConfig: {
				emptyText: '<?php echo DMG_Translate::_('grid.empty'); ?>',
				deferEmptyText: false
			},
			bbar: paginator,
			<?php if (DMG_Acl::canAccess(55) || DMG_Acl::canAccess(57)): ?>
			tbar: ['->',
			<?php if (DMG_Acl::canAccess(55)): ?>
			{
				text: '<?php echo DMG_Translate::_('grid.form.add'); ?>',
				iconCls: 'silk-add',
				scope: this,
				handler: this._onBtnNovoUsuarioClick
			},
			<?php endif; ?>
			<?php if (DMG_Acl::canAccess(57)): ?>
			{
				text: '<?php echo DMG_Translate::_('grid.form.delete'); ?>',
				iconCls: 'silk-delete',
				scope: this,
				handler: this._onBtnExcluirSelecionadosClick
			},
			<?php endif; ?>
			],
			<?php endif; ?>
			columns: [sm, {
				dataIndex: 'id',
				header: '<?php echo DMG_Translate::_('status-maquina.form.id.text'); ?>',
				width: 40,
				sortable: true
			}, {
				dataIndex: 'nm_status_maquina',
				header: '<?php echo DMG_Translate::_('status-maquina.form.nm_tipo_local.text'); ?>',
				sortable: true
			}, {
				dataIndex: 'fl_permite_movimentacao',
				header: '<?php echo DMG_Translate::_('status-maquina.form.fl_permite_movimentacao.text'); ?>',
				renderer: onOfRenderer
			}, {
				dataIndex: 'fl_permite_transformacao',
				header: '<?php echo DMG_Translate::_('status-maquina.form.fl_permite_transformacao.text'); ?>',
				renderer: onOfRenderer
			}, {
				dataIndex: 'fl_permite_faturamento',
				header: '<?php echo DMG_Translate::_('status-maquina.form.fl_permite_faturamento.text'); ?>',
				renderer: onOfRenderer
			}, {
				dataIndex: 'fl_permite_regularizacao',
				header: '<?php echo DMG_Translate::_('status-maquina.form.fl_permite_regularizacao.text'); ?>',
				renderer: onOfRenderer
			}, {
				dataIndex: 'fl_operativa',
				header: '<?php echo DMG_Translate::_('status-maquina.form.fl_operativa.text'); ?>',
				renderer: onOfRenderer
			}, {
				dataIndex: 'fl_alta',
				header: '<?php echo DMG_Translate::_('status-maquina.form.fl_alta.text'); ?>',
				renderer: onOfRenderer
			}]
		});
		StatusMaquinaWindow.superclass.initComponent.call(this);
	},
	initEvents: function () {
		StatusMaquinaWindow.superclass.initEvents.call(this);
		this.on({
			scope: this,
			<?php if (DMG_Acl::canAccess(56)): ?>
			rowdblclick: this._onGridRowDblClick
			<?php endif; ?>
		});
	},
	onDestroy: function () {
		StatusMaquinaWindow.superclass.onDestroy.apply(this, arguments);
		Ext.destroy(this.window);
		this.window = null;
	},
	<?php if (DMG_Acl::canAccess(55)): ?>
	_onBtnNovoUsuarioClick: function () {
		this._newForm();
		this.window.setStatusMaquina(0);
		this.window.show();
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(57)): ?>
	_onBtnExcluirSelecionadosClick: function () {
		var arrSelecionados = this.getSelectionModel().getSelections();
		if (arrSelecionados.length === 0) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('grid.form.alert.select'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('grid.form.alert.select'); ?>'});
			return false;
		}
		uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('grid.form.confirm.delete'); ?>', function (opt) {
			if (opt === 'no') {
				return;
			}
			var id = [];
			var n = 0;
			for (var i = 0; i < arrSelecionados.length; i++) {
				id.push(arrSelecionados[i].get('id'));
			}			
			this.el.mask('<?php echo DMG_Translate::_('grid.form.deleting'); ?>');
			Ext.Ajax.request({
				url: '<?php echo $this->url(array('controller' => 'status-maquina', 'action' => 'delete'), null, true); ?>',
				params: {
					'id[]': id
				},
				scope: this,
				scope: this,
				success: function (a, b) {
					this.el.unmask();
					try {
						var c = Ext.decode(a.responseText);
					} catch (e) {};
					if (c.failure == true) {
						//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', c.message);
						uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: c.message});
					}
					this.store.reload();
				},
			});
		},
		this);
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(55) || DMG_Acl::canAccess(56) || DMG_Acl::canAccess(57)): ?>
	_onCadastroUsuarioSalvarExcluir: function () {
		this.store.reload();
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(56)): ?>
	_onGridRowDblClick: function (grid, rowIndex, e) {
		var record = grid.getStore().getAt(rowIndex);
		if (record.get('fl_sistema') == '1') {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('status-maquina.error.system'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('status-maquina.error.system'); ?>'});
			return;
		}
		var id = record.get('id');
		this._newForm();
		this.window.setStatusMaquina(id);
		this.window.show();
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(55) || DMG_Acl::canAccess(56)): ?>
	_newForm: function () {
		if (!this.window) {
			this.window = new StatusMaquinaForm({
				renderTo: this.body,
				listeners: {
					scope: this,
					salvar: this._onCadastroUsuarioSalvarExcluir,
					<?php if (DMG_Acl::canAccess(49)): ?>
					excluir: this._onCadastroUsuarioSalvarExcluir
					<?php endif; ?>
				}
			});
		}
		return this.window;
	}
	<?php endif; ?>
});
Ext.reg('status-maquina-window', StatusMaquinaWindow);