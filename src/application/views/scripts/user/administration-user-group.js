var AdministrationUserGroup = Ext.extend(Ext.Window, {
	user: 0,
	toSave: [],
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 600,
	height: 350,
	title: '<?php echo DMG_Translate::_('administration.user.group.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setUser: function(user) {
		this.user = user;
	},
	constructor: function() {
		this.addEvents({salvar: true, excluir: true});
		AdministrationUserGroup.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		var tree6 = new Ext.tree.TreePanel({
			name: 'tree6',
			id: 'tree6',
			autoWidth: true,
			height: 276,
			border: false,
			useArrows: true,
			enableDD: true,
			overflow: 'scroll',
			dragConfig: {
				ddGroup: 'tree6',
			},
			dropConfig: {
				ddGroup: 'tree7',
				onNodeDrop: function (a, b, c, data) {
					tree6.root.appendChild(data.node);
					tree6.root.expand();
					return true;
				}
			},
			loader: new Ext.tree.TreeLoader({
				dataUrl: '<?php echo $this->url(array('controller' => 'user', 'action' => 'group'), null, true); ?>',
				baseParams: {
					act: 'getUnassigned',
					user: this.user,
				}
			}),
			root: new Ext.tree.AsyncTreeNode({
				nodeType: 'async',
				text: '<?php echo DMG_Translate::_('administration.user.group.treeunassigned'); ?>',
				iconCls: 'folder',
				draggable: false,
				id: '0'
			})
		});
		var tree7 = new Ext.tree.TreePanel({
			name: 'tree7',
			id: 'tree7',
			autoWidth: true,
			height: 276,
			border: false,
			useArrows: true,
			enableDD: true,
			dragConfig: {
				ddGroup: 'tree7',
			},
			dropConfig: {
				ddGroup: 'tree6',
				onNodeDrop: function (a, b, c, data) {
					tree7.root.appendChild(data.node);
					tree7.root.expand();
					return true;
				}
			},
			loader: new Ext.tree.TreeLoader({
				dataUrl: '<?php echo $this->url(array('controller' => 'user', 'action' => 'group'), null, true); ?>',
				baseParams: {
					act: 'getAssigned',
					user: this.user,
				}
			}),
			root: new Ext.tree.AsyncTreeNode({
				nodeType: 'async',
				text: '<?php echo DMG_Translate::_('administration.user.group.treeassigned'); ?>',
				iconCls: 'folder',
				draggable: false,
				id: '0'
			})
		});
		tree6.on('load', function() {
			tree6.expandAll();
		});
		tree7.on('load', function() {
			tree7.expandAll();
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
					items: [tree6],
				}, {
					columnWidth: .5,
					autoHeight: true,
					layout: 'form',
					items: [tree7],
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
		AdministrationUserGroup.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.user = this.user;
		var tree6 = this.formPanel.items.items[0].items.items[0].items.items[0];
		var tree7 = this.formPanel.items.items[0].items.items[1].items.items[0];
		tree6.loader.baseParams.user = this.user;
		tree7.loader.baseParams.user = this.user;
		tree6.root.reload();
		tree7.root.reload();
		AdministrationUserGroup.superclass.show.apply(this, arguments);
	},
	onDestroy: function() {
		AdministrationUserGroup.superclass.onDestroy.apply(this, arguments);
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
			url: '<?php echo $this->url(array('controller' => 'user', 'action' => 'group'), null, true); ?>',
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