var AdministrationUserEmpresa = Ext.extend(Ext.Window, {
	user: 0,
	toSave: [],
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 600,
	height: 350,
	title: '<?php echo DMG_Translate::_('administration.user.empresa.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setUser: function(user) {
		this.user = user;
	},
	constructor: function() {
		this.addEvents({salvar: true, excluir: true});
		AdministrationUserEmpresa.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		var tree4 = new Ext.tree.TreePanel({
			name: 'tree4',
			id: 'tree4',
			autoWidth: true,
			height: 276,
			border: false,
			useArrows: true,
			enableDD: true,
			overflow: 'scroll',
			dragConfig: {
				ddGroup: 'tree4',
			},
			dropConfig: {
				ddGroup: 'tree5',
				onNodeDrop: function (a, b, c, data) {
					tree4.root.appendChild(data.node);
					tree4.root.expand();
					return true;
				}
			},
			loader: new Ext.tree.TreeLoader({
				dataUrl: '<?php echo $this->url(array('controller' => 'user', 'action' => 'empresa'), null, true); ?>',
				baseParams: {
					act: 'getUnassigned',
					user: this.user,
				}
			}),
			root: new Ext.tree.AsyncTreeNode({
				nodeType: 'async',
				text: '<?php echo DMG_Translate::_('administration.user.empresa.treeunassigned'); ?>',
				iconCls: 'folder',
				draggable: false,
				id: '0'
			})
		});
		var tree5 = new Ext.tree.TreePanel({
			name: 'tree5',
			id: 'tree5',
			autoWidth: true,
			height: 276,
			border: false,
			useArrows: true,
			enableDD: true,
			dragConfig: {
				ddGroup: 'tree5',
			},
			dropConfig: {
				ddGroup: 'tree4',
				onNodeDrop: function (a, b, c, data) {
					tree5.root.appendChild(data.node);
					tree5.root.expand();
					return true;
				}
			},
			loader: new Ext.tree.TreeLoader({
				dataUrl: '<?php echo $this->url(array('controller' => 'user', 'action' => 'empresa'), null, true); ?>',
				baseParams: {
					act: 'getAssigned',
					user: this.user,
				}
			}),
			root: new Ext.tree.AsyncTreeNode({
				nodeType: 'async',
				text: '<?php echo DMG_Translate::_('administration.user.empresa.treeassigned'); ?>',
				iconCls: 'folder',
				draggable: false,
				id: '0'
			})
		});
		tree4.on('load', function() {
			tree4.expandAll();
		});
		tree5.on('load', function() {
			tree5.expandAll();
		});
		this.formPanel = new Ext.form.FormPanel({
			bodyStyle: 'padding: 5px;',
			width: 600,
			draggable: false,
			border: false,
			height: 280,
			items: [{
				layout: 'column',
				height: 280,
				items: [{
					columnWidth: .5,
					autoHeight: true,
					layout: 'form',
					items: [tree4],
				}, {
					columnWidth: .5,
					autoHeight: true,
					layout: 'form',
					items: [tree5],
				}]
			}]
		});
		Ext.apply(this, {
			items: this.formPanel,
			bbar: [
				'->',
				{text: '<?php echo DMG_Translate::_('grid.form.save'); ?>', iconCls: 'icon-save', scope: this, handler: this._onBtnSalvarClick},
				{text: '<?php echo DMG_Translate::_('grid.form.cancel'); ?>', iconCls: 'silk-cross', scope: this, handler: this._onBtnCancelarClick}
			]
		});
		AdministrationUserEmpresa.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.user = this.user;
		var tree4 = this.formPanel.items.items[0].items.items[0].items.items[0];
		var tree5 = this.formPanel.items.items[0].items.items[1].items.items[0];
		tree4.loader.baseParams.user = this.user;
		tree5.loader.baseParams.user = this.user;
		tree4.root.reload();
		tree5.root.reload();
		AdministrationUserEmpresa.superclass.show.apply(this, arguments);
	},
	onDestroy: function() {
		AdministrationUserEmpresa.superclass.onDestroy.apply(this, arguments);
		this.formPanel = null;
	},
	_onFormLoad: function(form, request) {
		this.el.unmask();
	},
	_checkChild: function (node) {
		if (node.hasChildNodes()) {
			node.expand();
			for (var i = 0; i < node.childNodes.length; i++) {
				this._checkChild(node.childNodes[i]);
			}
		} else {
			this.toSave.push(node.id);
		}
	},
	_onBtnSalvarClick: function() {
		this.toSave = [];
		this._checkChild(this.formPanel.items.items[0].items.items[1].items.items[0].root);
		var dialog = this;
		dialog.el.mask("<?php echo DMG_Translate::_('grid.form.saving'); ?>");
		var con = new Ext.data.Connection();
		con.request({
			url: '<?php echo $this->url(array('controller' => 'user', 'action' => 'empresa'), null, true); ?>',
			method: 'post',
			params: {
				act: 'save',
				user: this.user,
				'node[]': this.toSave
			},
			callback: function (a, b, c)  {
				dialog.el.unmask();
				dialog.hide();
			}
		});
	},
	_onBtnCancelarClick: function() {
		this.hide();
	}
});