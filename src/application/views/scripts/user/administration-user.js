var sm = new Ext.grid.CheckboxSelectionModel();
var AdministrationUserWindowFilter = new Ext.ux.grid.GridFilters({
	local: false,
	menuFilterText: '<?php echo DMG_Translate::_('grid.filter.label'); ?>',
	filters: [{
		type: 'string',
		dataIndex: 'name',
		phpMode: true
	}, {
		type: 'string',
		dataIndex: 'username',
		phpMode: true
	}, {
		type: 'string',
		dataIndex: 'email',
		phpMode: true
	}, {
		type: 'list',
		dataIndex: 'language',
		options: languages,
		phpMode: true
	},{
		type: 'list',
		dataIndex: 'status',
		options: [
			[0, '<?php echo DMG_Translate::_('administration.user.form.status.inactive'); ?>'],
			[1, '<?php echo DMG_Translate::_('administration.user.form.status.active'); ?>']
		],
		phpMode: true
	}]
});
var AdministrationUserWindow = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	stripeRows: true,
	loadMask: true,
	sm: sm,
	columnLines: true,
	plugins: [AdministrationUserWindowFilter],
	initComponent: function () {
		this.store = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'user', 'action' => 'list'), null, true); ?>',
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
				{name: 'name', type: 'string'},
				{name: 'username', type: 'string'},
				{name: 'email', type: 'string'},
				{name: 'language', type: 'string'},
				{name: 'status', type: 'string'}
			]
		});
		var paginator = new Ext.PagingToolbar({
			store: this.store,
			pageSize: 30,
			plugins: [AdministrationUserWindowFilter]
		});
		paginator.addSeparator();
		var button = new Ext.Toolbar.Button();
		button.text = '<?php echo DMG_Translate::_('grid.bbar.clearfilter'); ?>';
		button.addListener('click', function(a, b) {
			AdministrationUserWindowFilter.clearFilters();
		});
		paginator.addButton(button);
		Ext.apply(this, {
			viewConfig: {
				emptyText: '<?php echo DMG_Translate::_('grid.empty'); ?>',
				deferEmptyText: false
			},
			bbar: paginator,
<?php if (DMG_Acl::canAccess(5) || DMG_Acl::canAccess(6)): ?>
			tbar: ['->',
<?php if (DMG_Acl::canAccess(5)): ?>
			{
				text: '<?php echo DMG_Translate::_('grid.form.add'); ?>',
				iconCls: 'silk-add',
				scope: this,
				handler: this._onBtnNovoUsuarioClick
			},
<?php endif; ?>
<?php if (DMG_Acl::canAccess(6)): ?>
			{
				text: '<?php echo DMG_Translate::_('grid.form.delete'); ?>',
				iconCls: 'silk-delete',
				scope: this,
				handler: this._onBtnExcluirSelecionadosClick
			},
<?php endif; ?>
<?php if (DMG_Acl::canAccess(12)): ?>
			{
				text: '<?php echo DMG_Translate::_('administration.user.group.label'); ?>',
				iconCls: 'silk-group',
				scope: this,
				handler: this._onBntGroupClick
			},
<?php endif; ?>
<?php if (DMG_Acl::canAccess(37)): ?>
			{
				text: '<?php echo DMG_Translate::_('administration.user.empresa.label'); ?>',
				iconCls: 'silk-group',
				scope: this,
				handler: this._onBntEmpresaClick
			},
<?php endif; ?>
			],
<?php endif; ?>
			columns: [sm, {
				dataIndex: 'id',
				header: '<?php echo DMG_Translate::_('administration.user.form.id.text'); ?>',
				width: 40,
				sortable: true
			}, {
				dataIndex: 'name',
				header: '<?php echo DMG_Translate::_('administration.user.form.name.text'); ?>',
				sortable: true
			},
			{
				dataIndex: 'username',
				header: '<?php echo DMG_Translate::_('administration.user.form.username.text'); ?>',
				sortable: true
			},
			{
				dataIndex: 'email',
				header: '<?php echo DMG_Translate::_('administration.user.form.email.text'); ?>',
				sortable: true
			},
			{
				dataIndex: 'language',
				header: '<?php echo DMG_Translate::_('administration.user.form.language.text'); ?>',
				sortable: true,
				renderer: function (e) {
					for (i = 0; i < languages.length; i++) {
						if (languages[i][0] == e) {
							return languages[i][1];
						}
					}
				}
			}, {
				dataIndex: 'status',
				header: '<?php echo DMG_Translate::_('administration.user.form.status.text'); ?>',
				sortable: true,
				width: 40,
				renderer: function (e) {
					if (e == '1') {
						return '<center><img src="extjs/resources/images/default/dd/drop-yes.gif" alt="<?php echo DMG_Translate::_('administration.user.form.status.active'); ?>" title="<?php echo DMG_Translate::_('administration.user.form.status.active'); ?>" /></center>';
					} else {
						return '<center><img src="extjs/resources/images/default/dd/drop-no.gif" alt="<?php echo DMG_Translate::_('administration.user.form.status.inactive'); ?>" title="<?php echo DMG_Translate::_('administration.user.form.status.inactive'); ?>" /></center>';
					}
				}
			}]
		});
		AdministrationUserWindow.superclass.initComponent.call(this);
	},
	initEvents: function () {
		AdministrationUserWindow.superclass.initEvents.call(this);
		this.on({
			scope: this,
			<?php if (DMG_Acl::canAccess(4)): ?>
			rowdblclick: this._onGridRowDblClick
			<?php endif; ?>
		});
	},
	onDestroy: function () {
		AdministrationUserWindow.superclass.onDestroy.apply(this, arguments);
		Ext.destroy(this.window);
		this.window = null;
	},
	<?php if (DMG_Acl::canAccess(12)): ?>
	_onBntGroupClick: function () {
		var arrSelecionados = this.getSelectionModel().getSelections();
		if (arrSelecionados.length > 1) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('administration.user.group.manyerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('administration.user.group.manyerror'); ?>'});
			return false;
		}
		if (arrSelecionados.length === 0) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('administration.user.group.oneerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('administration.user.group.oneerror'); ?>'});
			return false;
		}
		var id = arrSelecionados[0].get('id');
		this.newGroup();
		this.group.setUser(id);
		this.group.show();
		return true;
	},
	newGroup: function () {
		if (!this.group) {
			this.group = new AdministrationUserGroup({
				renderTo: this.body,
				listeners: {
					scope: this
				}
			});
		}
		return this.group;
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(37)): ?>
	_onBntEmpresaClick: function () {
		var arrSelecionados = this.getSelectionModel().getSelections();
		if (arrSelecionados.length > 1) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('administration.user.group.manyerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('administration.user.group.manyerror'); ?>'});
			return false;
		}
		if (arrSelecionados.length === 0) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('administration.user.group.oneerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('administration.user.group.oneerror'); ?>'});
			return false;
		}
		var id = arrSelecionados[0].get('id');
		this.newEmpresa();
		this.empresa.setUser(id);
		this.empresa.show();
		return true;
	},
	newEmpresa: function () {
		if (!this.empresa) {
			this.empresa = new AdministrationUserEmpresa({
				renderTo: this.body,
				listeners: {
					scope: this
				}
			});
		}
		return this.empresa;
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(6)): ?>
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
				url: '<?php echo $this->url(array('controller' => 'user', 'action' => 'delete'), null, true); ?>',
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
	<?php if (DMG_Acl::canAccess(4)): ?>
	_onGridRowDblClick: function (grid, rowIndex, e) {
		var record = grid.getStore().getAt(rowIndex);
		var id = record.get('id');
		this._newForm();
		this.window.setUser(id);
		this.window.show();
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(5)): ?>
	_onBtnNovoUsuarioClick: function () {
		this._newForm();
		this.window.setUser(0);
		this.window.show();
	},
	_onCadastroUsuarioSalvarExcluir: function () {
		this.store.reload();
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(4) || DMG_Acl::canAccess(5)): ?>
	_newForm: function () {
		if (!this.window) {
			this.window = new AdministrationUserForm({
				renderTo: this.body,
				listeners: {
					scope: this,
					salvar: this._onCadastroUsuarioSalvarExcluir,
					excluir: this._onCadastroUsuarioSalvarExcluir
				}
			});
		}
		return this.window;
	}
	<?php endif; ?>
});
Ext.reg('administration-user', AdministrationUserWindow);