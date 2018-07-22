var sm = new Ext.grid.CheckboxSelectionModel();
var AdministrationGroupWindowFilter = new Ext.ux.grid.GridFilters({
	local: false,
	menuFilterText: '<?php echo DMG_Translate::_('grid.filter.label'); ?>',
	filters: [{
		type: 'string',
		dataIndex: 'name',
		phpMode: true
	}]
});
var AdministrationGroupWindow = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	stripeRows: true,
	loadMask: true,
	sm: sm,
	columnLines: true,
	plugins: [AdministrationGroupWindowFilter],
	initComponent: function () {
		this.store = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'group', 'action' => 'list'), null, true); ?>',
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
				{name: 'name', type: 'string'}
			]
		});
		var paginator = new Ext.PagingToolbar({
			store: this.store,
			pageSize: 30,
			plugins: [AdministrationGroupWindowFilter]
		});
		paginator.addSeparator();
		var button = new Ext.Toolbar.Button();
		button.text = '<?php echo DMG_Translate::_('grid.bbar.clearfilter'); ?>';
		button.addListener('click', function(a, b) {
			AdministrationGroupWindowFilter.clearFilters();
		});
		paginator.addButton(button);
		Ext.apply(this, {
			viewConfig: {
				emptyText: '<?php echo DMG_Translate::_('grid.empty'); ?>',
				deferEmptyText: false
			},
			bbar: paginator,
			<?php if (DMG_Acl::canAccess(9) || DMG_Acl::canAccess(10) ||  DMG_Acl::canAccess(11)): ?>
			tbar: ['->',
			<?php if (DMG_Acl::canAccess(9)): ?>
			{
				text: '<?php echo DMG_Translate::_('grid.form.add'); ?>',
				iconCls: 'silk-add',
				scope: this,
				handler: this._onBtnNovoUsuarioClick
			},
			<?php endif; ?>
			<?php if (DMG_Acl::canAccess(10)): ?>
			{
				text: '<?php echo DMG_Translate::_('grid.form.delete'); ?>',
				iconCls: 'silk-delete',
				scope: this,
				handler: this._onBtnExcluirSelecionadosClick
			},
			<?php endif; ?>
			<?php if (DMG_Acl::canAccess(11)): ?>
			{
				text: '<?php echo DMG_Translate::_('administration.group.permission.label'); ?>',
				iconCls: 'silk-key',
				scope: this,
				handler: this._onBntPermissionClick
			}
			<?php endif; ?>
			],
			<?php endif; ?>
			columns: [sm, {
				dataIndex: 'id',
				header: '<?php echo DMG_Translate::_('administration.group.form.id.text'); ?>',
				width: 40,
				sortable: true
			}, {
				dataIndex: 'name',
				header: '<?php echo DMG_Translate::_('administration.group.form.name.text'); ?>',
				sortable: true
			}]
		});
		AdministrationGroupWindow.superclass.initComponent.call(this);
	},
	initEvents: function () {
		AdministrationGroupWindow.superclass.initEvents.call(this);
		this.on({
			scope: this,
			<?php if (DMG_Acl::canAccess(8)): ?>
			rowdblclick: this._onGridRowDblClick
			<?php endif; ?>
		});
	},
	onDestroy: function () {
		AdministrationGroupWindow.superclass.onDestroy.apply(this, arguments);
		Ext.destroy(this.window);
		this.window = null;
	},
	<?php if (DMG_Acl::canAccess(11)): ?>
	_onBntPermissionClick: function () {
		var arrSelecionados = this.getSelectionModel().getSelections();
		if (arrSelecionados.length > 1) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('administration.group.permission.manyerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('administration.group.permission.manyerror'); ?>'});
			return false;
		}
		if (arrSelecionados.length === 0) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('administration.group.permission.oneerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('administration.group.permission.oneerror'); ?>'});
			return false;
		}
		var group = arrSelecionados[0].get('id');
		this.newPermission();
		this.permission.setGroup(group);
		this.permission.show();
		return true;
	},
	newPermission: function () {
		if (!this.permission) {
			this.permission = new AdministrationGroupPermission({
				renderTo: this.body,
				listeners: {
					scope: this
				}
			});
		}
		return this.permission;
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(9)): ?>
	_onBtnNovoUsuarioClick: function () {
		this._newForm();
		this.window.setGroup(0);
		this.window.show();
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(10)): ?>
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
			for (var i = 0; i < arrSelecionados.length; i++) {
				id.push(arrSelecionados[i].get('id'));
			}
			this.el.mask('<?php echo DMG_Translate::_('grid.form.deleting'); ?>');
			Ext.Ajax.request({
				url: '<?php echo $this->url(array('controller' => 'group', 'action' => 'delete'), null, true); ?>',
				params: {
					'id[]': id
				},
				scope: this,
				success: function (a, b) {
					try {
						var c = Ext.decode(a.responseText);
					} catch (e) {};
					if (c.failure == true) {
						//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', c.message);
						uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: c.message});
					}
					this.el.unmask();
					this.store.reload();
				},
			});
		},
		this);
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(8) || DMG_Acl::canAccess(9) || DMG_Acl::canAccess(10)): ?>
	_onCadastroUsuarioSalvarExcluir: function () {
		this.store.reload();
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(8)): ?>
	_onGridRowDblClick: function (grid, rowIndex, e) {
		var record = grid.getStore().getAt(rowIndex);
		var id = record.get('id');
		this._newForm();
		this.window.setGroup(id);
		this.window.show();
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(8) || DMG_Acl::canAccess(9)): ?>
	_newForm: function () {
		if (!this.window) {
			this.window = new AdministrationGroupForm({
				renderTo: this.body,
				listeners: {
					scope: this,
					salvar: this._onCadastroUsuarioSalvarExcluir,
					<?php if (DMG_Acl::canAccess(10)): ?>
					excluir: this._onCadastroUsuarioSalvarExcluir
					<?php endif; ?>
				}
			});
		}
		return this.window;
	}
	<?php endif; ?>
});
Ext.reg('administration-group', AdministrationGroupWindow);