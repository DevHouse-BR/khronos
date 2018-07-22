Ext.BLANK_IMAGE_URL = '../extjs/resources/images/default/s.gif';
var languages = [
	['', '<?php echo DMG_Translate::_('administration.user.form.language.helper'); ?>'],
	['pt_BR', 'Português'],
	['en', 'Inglês'],
	['es', 'Espanhol']
];
var PortalTools = [{
	id:'close',
	handler: function(e, target, panel){
		panel.ownerCt.remove(panel, true);
	}
}];
var onOfRenderer = function (e) {
	if (e == true) {
		return '<center><img src="extjs/resources/images/default/dd/drop-yes.gif" alt="<?php echo DMG_Translate::_('yes'); ?>" title="<?php echo DMG_Translate::_('yes'); ?>" /></center>';
	} else {
		return '<center><img src="extjs/resources/images/default/dd/drop-no.gif" alt="<?php echo DMG_Translate::_('no'); ?>" title="<?php echo DMG_Translate::_('no'); ?>" /></center>';
	}
};
var tabs;
var Principal = Ext.extend(Ext.util.Observable, {
	constructor: function() {
		
		<?php if (DMG_ACl::canAccess(35)): ?>
		this.bntReload = new Ext.Toolbar.Button({
			text: '<?php echo DMG_Translate::_('i18n.PagingToolbar.refreshText'); ?>',
			scope: this,
			handler: function() {
				this.grid.store.reload();
			}
		});
		this.grid = new Ext.grid.GridPanel({
			cls: 'x-portlet',
			height: 117,
			store: new Ext.data.JsonStore({
				url: '<?php echo $this->url(array('controller' => 'index', 'action' => 'info', 'data' => 'status-maquina'), null, true); ?>',
				root: 'data',
				idProperty: 'id',
				totalProperty: 'total',
				autoLoad: true,
				autoDestroy: true,
				fields: [
					{name: 'status', type: 'string'},
					{name: 'count', type: 'int'},
				]
			}),
			tbar: [this.bntReload],
			colModel: new Ext.grid.ColumnModel({
				defaults: {
					sortable: false
				},
				columns: [
					{header: '<?php echo DMG_Translate::_('window.portal.status_maquina.status'); ?>', dataIndex: 'status'},
					{header: '<?php echo DMG_Translate::_('window.portal.status_maquina.qtde'); ?>', dataIndex: 'count'}
				]
			}),
			viewConfig: {
				forceFit: true,
			}
		});
		<?php endif; ?>
		tabs = new Ext.TabPanel({
			region: 'center',
			activeTab: 0,
			defaults: {closable: true},
			items: [{
				title: '<?php echo DMG_Translate::_('window.title'); ?>',
				bodyStyle: 'padding: 20px;',
				closable: false,
				xtype: 'portal',
				region: 'center',
				margins: '35 5 5 0',
				items: [
				{
					columnWidth: .5,
					style: 'padding:10px',
					items:[{
						title: '<?php echo DMG_Translate::_('window.welcome'); ?>',
						bodyStyle: 'padding:10px',
						html: '<?php echo DMG_Translate::_('window.saudacao'); ?>'
					}]
				}]
			}]
		});
		new Ext.Viewport({
			layout: 'border',
			id: 'tabs',
			items: [{
				region: 'south',
                split: false,
                height: 34,
                minSize: 34,
                maxSize: 34,
                collapsible: true,
                frame:true,
                margins: '0 0 0 0',
                bodyStyle: 'text-align:right',
                html:'<p><?php echo DMG_Config::get(13); ?></p>'
			},{
				region: 'north',
				bodyStyle: 'border: 0',
				defaults: {
					border: false,
					rootVisible: false,
					//bodyStyle: 'background:white;',
					listeners: {
						scope: this,
						click: this.onNodeClick
					}
				},
				height: 54,
				//cls: 'x-toolbarWrite',
				tbar: new Ext.Toolbar({
					cls: 'x-btnblack',
					buttons: [{
						xtype: 'box',
						autoEl: {tag: 'img', src:'<?php echo DMG_Config::get(3); ?>'}
					}, {
						xtype: 'tbtext',
						cls: 'x-btnblack',
						text: '<div style="color: black; float: left; font-family: Arial; font-size: 18px; margin-left: 60px; margin-top: 0px;"><?php echo DMG_Config::get(14); ?></div>'
					}, '->', {
						text: '<?php echo DMG_Translate::_('window.ola'); ?> <?php echo Zend_Auth::getInstance()->getIdentity()->name; ?> (<?php echo Zend_Auth::getInstance()->getIdentity()->nm_local; ?>).'
					}, {
/*						text: '<?php echo DMG_Translate::_('window.profile'); ?>',
						cls: 'x-btnblack',
						iconCls: 'silk-profile',
						scope: this,
						handler: this.editProfileClick
					}, { */
						text: '<?php echo DMG_Translate::_('window.exit'); ?>',
						iconCls: 'silk-close',
						scope: this,
						handler: this.logout
					}]
				})
			},{
				title: 'Menu',
				region: 'west',
				layout: 'accordion',
				defaultType: 'treepanel',
				width: 200,
				split: true,
				collapsible: true,
				collapsed:true,
				layoutConfig: {fill: false, animate:true},
				defaults: {
					border: false,
					rootVisible: false,
					bodyStyle: 'background:white;',
					listeners: {
						scope: this,
						click: this.onNodeClick,
						afterrender: function(painel){
							Ext.getCmp('tabs').layout.west.getCollapsedEl().titleEl.dom.innerHTML = '<img style="margin:5px" src="images/menu.png" />';
						}
					}
				},
				items: [<?php echo Khronos_MenuPortal::getJson(); ?>]
			},
			tabs]
		});
		Principal.superclass.constructor.apply(this,arguments);
	},
	onNodeClick: function(node) {
		if(!node.attributes.eXtype) {
			return;
		}
		var titulo = node.text;
		var novaAba = tabs.items.find(function(aba){
			return aba.title === titulo;
		});
		if(!novaAba) {
			novaAba = tabs.add({
				title: titulo,
				xtype: node.attributes.eXtype
			});
		}
		tabs.activate(novaAba);
	},
	editProfileClick: function () {
		var id = <?php echo Zend_Auth::getInstance()->getIdentity()->id; ?>;
		this._newForm();
		this.window.setUser(id);
		this.window.show();
	},
	_newForm: function () {
		if (!this.window) {
			this.window = new AdministrationUserFormEditPerfil({
				renderTo: this.body,
				listeners: {
					scope: this
				}
			});
		}
		return this.window;
	},
	logout: function () {
		window.location = '<?php echo $this->url(array('controller' => 'portal', 'action' => 'logout'), null, true); ?>';
	}
});