var sm = new Ext.grid.CheckboxSelectionModel();
var SessionManagerWindowFilter = new Ext.ux.grid.GridFilters({
	local: false,
	menuFilterText: '<?php echo DMG_Translate::_('grid.filter.label'); ?>',
	filters: [{
		type: 'string',
		dataIndex: 'name',
		phpMode: true
	}]
});
var SessionManagerWindow = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	stripeRows: true,
	loadMask: true,
	sm: sm,
	columnLines: true,
	plugins: [SessionManagerWindowFilter],
	initComponent: function () {
		this.store = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'session', 'action' => 'list'), null, true); ?>',
			root: 'data',
			idProperty: 'id',
			totalProperty: 'total',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			sortInfo: {
				field: 'dt_ultimo_contato_sessao',
				direction: 'DESC'
			},
			baseParams: {
				start: 0,
				limit: 30
			},
			fields: [
				{name: 'id', type: 'int'},
				{name: 'nm_usuario', type: 'string'},
				{name: 'ip', type: 'string'},
				{name: 'dt_inicio_sessao', type: 'string'},
				{name: 'dt_ultimo_contato_sessao', type: 'string'}
			]
		});
		var paginator = new Ext.PagingToolbar({
			store: this.store,
			pageSize: 30,
			plugins: [SessionManagerWindowFilter]
		});
		paginator.addSeparator();
		var button = new Ext.Toolbar.Button();
		button.text = '<?php echo DMG_Translate::_('grid.bbar.clearfilter'); ?>';
		button.addListener('click', function(a, b) {
			SessionManagerWindowFilter.clearFilters();
		});
		paginator.addButton(button);
		Ext.apply(this, {
			viewConfig: {
				emptyText: '<?php echo DMG_Translate::_('grid.empty'); ?>',
				deferEmptyText: false
			},
			bbar: paginator,
			<?php if (DMG_Acl::canAccess(78)): ?>
			tbar: ['->',
			<?php if (DMG_Acl::canAccess(78)): ?>
			{
				text: '<?php echo DMG_Translate::_('session.delete'); ?>',
				iconCls: 'silk-delete',
				scope: this,
				handler: function () {
					var arrSelecionados = this.getSelectionModel().getSelections();
					if (arrSelecionados.length === 0) {
						uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('session.select'); ?>'});
						return false;
					}
					uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('session.delete.confirm'); ?>', function (opt) {
						if (opt === 'no') {
							return;
						}
						var id = [];
						for (var i = 0; i < arrSelecionados.length; i++) {
							id.push(arrSelecionados[i].get('id'));
						}
						this.el.mask('<?php echo DMG_Translate::_('session.desconectando'); ?>');
						Ext.Ajax.request({
							url: '<?php echo $this->url(array('controller' => 'session', 'action' => 'delete'), null, true); ?>',
							params: {
								'id[]': id
							},
							scope: this,
							success: function () {
								this.el.unmask();
								this.store.reload();
							}
						});
					},
					this);
				}
			},
			<?php endif; ?>
			],
			<?php endif; ?>
			columns: [sm, {
				dataIndex: 'id',
				header: '<?php echo DMG_Translate::_('session.id.text'); ?>',
				width: 40,
			},{
				dataIndex: 'nm_usuario',
				header: '<?php echo DMG_Translate::_('session.id_usuario.text'); ?>',
			},{
				dataIndex: 'ip',
				header: '<?php echo DMG_Translate::_('session.ip.text'); ?>',
			},{
				dataIndex: 'dt_inicio_sessao',
				header: '<?php echo DMG_Translate::_('session.dt_inicio_sessao.text'); ?>',
				width: 120,
			},{
				dataIndex: 'dt_ultimo_contato_sessao',
				header: '<?php echo DMG_Translate::_('session.dt_ultimo_contato_sessao.text'); ?>',
				width: 120,
			}]
		});
		SessionManagerWindow.superclass.initComponent.call(this);
	},
	initEvents: function () {
		SessionManagerWindow.superclass.initEvents.call(this);
		this.on({
			scope: this,
		});
	},
	onDestroy: function () {
		SessionManagerWindow.superclass.onDestroy.apply(this, arguments);
	},
});
Ext.reg('session-manager', SessionManagerWindow);