var AdministrationGroupPermission = Ext.extend(Ext.Window, {
	group: 0,
	toSave: [],
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 600,
	height: 350,
	title: '<?php echo DMG_Translate::_('administration.group.permission.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setGroup: function(group) {
		this.group = group;
	},
	constructor: function() {
		this.addEvents({salvar: true, excluir: true});
		AdministrationGroupPermission.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		var tree1 = new Ext.tree.TreePanel({
			name: 'tree1',
			id: 'tree1',
			autoWidth: true,
			height: 276,
			border: false,
			useArrows: true,
			enableDD: true,
			overflow: 'scroll',
			dragConfig: {
				ddGroup: 'tree1',
			},
			dropConfig: {
				ddGroup: 'tree2',
				onNodeDrop: function (a, b, c, data) {
					if (data.node.isLeaf()) {
						var pai1 = data.node.parentNode;
						var pai2 = tree1.root.findChild('id', pai1.id);
						if (!pai2) {
							tree1.root.appendChild(new Ext.tree.TreeNode({
								id: pai1.id,
								text: pai1.text,
								iconCls: 'folder'
							}));
							pai2 = tree1.root.findChild('id', pai1.id);
						}
						pai2.appendChild(data.node);
						pai2.expand();
					} else {
						var pai1 = tree1.root.findChild('id', data.node.id);
						if (!pai1) {
							tree1.root.appendChild(data.node);
						} else {
							var pai2 = tree2.root.findChild('id', data.node.id);
							while (pai2.hasChildNodes()) {
								pai1.appendChild(pai2.firstChild);
							}
						}
					}
					return true;
				}
			},
			loader: new Ext.tree.TreeLoader({
				dataUrl: '<?php echo $this->url(array('controller' => 'group', 'action' => 'permission'), null, true); ?>',
				baseParams: {
					act: 'getUnassigned',
					group: this.group,
				}
			}),
			root: new Ext.tree.AsyncTreeNode({
				nodeType: 'async',
				text: '<?php echo DMG_Translate::_('administration.group.permission.treeunassigned'); ?>',
				iconCls: 'folder',
				draggable: false,
				id: '0'
			})
		});
		var tree2 = new Ext.tree.TreePanel({
			name: 'tree2',
			id: 'tree2',
			autoWidth: true,
			height: 276,
			border: false,
			useArrows: true,
			enableDD: true,
			dragConfig: {
				ddGroup: 'tree2',
			},
			dropConfig: {
				ddGroup: 'tree1',
				onNodeDrop: function (a, b, c, data) {
					if (data.node.isLeaf()) {
						var pai1 = data.node.parentNode;
						var pai2 = tree2.root.findChild('id', pai1.id);
						if (!pai2) {
							tree2.root.appendChild(new Ext.tree.TreeNode({
								id: pai1.id,
								text: pai1.text,
								iconCls: 'folder'
							}));
							pai2 = tree2.root.findChild('id', pai1.id);
						}
						pai2.appendChild(data.node);
						pai2.expand();
					} else {
						var pai1 = tree2.root.findChild('id', data.node.id);
						if (!pai1) {
							tree2.root.appendChild(data.node);
						} else {
							var pai2 = tree1.root.findChild('id', data.node.id);
							while (pai2.hasChildNodes()) {
								pai1.appendChild(pai2.firstChild);
							}
						}
					}
					return true;
				}
			},
			loader: new Ext.tree.TreeLoader({
				dataUrl: '<?php echo $this->url(array('controller' => 'group', 'action' => 'permission'), null, true); ?>',
				baseParams: {
					act: 'getAssigned',
					group: this.group,
				}
			}),
			root: new Ext.tree.AsyncTreeNode({
				nodeType: 'async',
				text: '<?php echo DMG_Translate::_('administration.group.permission.treeassigned'); ?>',
				iconCls: 'folder',
				draggable: false,
				id: '0'
			})
		});
		tree1.on('load', function() {
			tree1.expandAll();
		});
		tree2.on('load', function() {
			tree2.expandAll();
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
					items: [tree1],
				}, {
					columnWidth: .5,
					autoHeight: true,
					layout: 'form',
					items: [tree2],
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
		AdministrationGroupPermission.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.group = this.group;
		var tree1 = this.formPanel.items.items[0].items.items[0].items.items[0];
		var tree2 = this.formPanel.items.items[0].items.items[1].items.items[0];
		tree1.loader.baseParams.group = this.group;
		tree2.loader.baseParams.group = this.group;
		tree1.root.reload();
		tree2.root.reload();
		AdministrationGroupPermission.superclass.show.apply(this, arguments);
	},
	onDestroy: function() {
		AdministrationGroupPermission.superclass.onDestroy.apply(this, arguments);
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
			url: '<?php echo $this->url(array('controller' => 'group', 'action' => 'permission'), null, true); ?>',
			method: 'post',
			params: {
				act: 'save',
				group: this.group,
				'node[]': this.toSave
			},
			callback: function (a, b, c)  {
				dialog.el.unmask();
				dialog.hide();
			}
		});
	},
	_onBtnDeleteClick: function() {
		uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('grid.form.confirm.delete'); ?>', function(opt) {
			if(opt === 'no') {
				return;
			}
			this.el.mask('<?php echo DMG_Translate::_('grid.form.deleting'); ?>');
			Ext.Ajax.request({
				url: '<?php echo $this->url(array('controller' => 'group', 'action' => 'delete'), null, true); ?>',
				params: {
					id: this.group
				},
				scope: this,
				success: function() {
					this.el.unmask();
					this.hide();
					this.fireEvent('excluir', this);
				}
			});
		}, this);
	},
	_onBtnCancelarClick: function() {
		this.hide();
	}
});