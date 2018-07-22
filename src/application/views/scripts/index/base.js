Ext.BLANK_IMAGE_URL = 'extjs/resources/images/default/s.gif';
var languages = [
	['', '<?php echo DMG_Translate::_('administration.user.form.language.helper'); ?>'],
	['pt_BR', 'Português'],
	['en', 'Inglês'],
	['es', 'Espanhol'],
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
		<?php if (DMG_Acl::canAccess(34)): ?>
		this.chart = new Ext.Panel({
			cls: 'x-portlet',
			bodyStyle: 'padding:10px',
			width: '100%',
			height: 300,
			items: {
				url: '<?php echo $this->BaseUrl(); ?>/extjs/resources/charts.swf',
				xtype: 'columnchart',
				store: new Ext.data.JsonStore({
					fields:['data', 'credito'],
					data: [
<?php
$query = Doctrine_Query::create()->select('to_char(d.dt_fechamento, \'YYYY-mm-dd\') AS data, SUM(i.nr_dif_cont_4) AS di')
->from('ScmFechamentoItem i')
->innerJoin('i.ScmFechamentoDoc d')
->groupBy('data')
->orderBy('data DESC')
->limit(7)->execute(array(), Doctrine::HYDRATE_NONE); ?>
<?php foreach (array_reverse($query) as $k): ?>
						{data: '<?php echo implode("/", array_reverse(explode("-", $k[0]))); ?>', credito: <?php echo floatval($k[1]); ?>},
<?php endforeach; ?>
					]
				}),
				yField: 'credito',
				xField: 'data',
				xAxis: new Ext.chart.CategoryAxis({
					title: '<?php echo DMG_Translate::_('window.portal.grafico_di.dias'); ?>'
				}),
				yAxis: new Ext.chart.NumericAxis({
					title: '<?php echo DMG_Translate::_('window.portal.grafico_di.credito'); ?>'
				}),
				extraStyle: {
					xAxis: {
						labelRotation: -90
					}
				}
			}
		});
		<?php endif; ?>
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
				],
			}),
			viewConfig: {
				forceFit: true,
			},
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
					},
					<?php if (DMG_ACl::canAccess(35)): ?>
					{
						title: '<?php echo DMG_Translate::_('window.portal.status_maquina'); ?>',
						items: [this.grid]
					}
					<?php endif; ?>
					]
				},
				{
					columnWidth: .5,
					style: 'padding:10px',
					items: [
						<?php if (DMG_ACl::canAccess(34)): ?>
						{
							title: '<?php echo DMG_Translate::_('window.portal.grafico_di'); ?>',
							items: [this.chart]
						}
						<?php endif; ?>
					]
				},
				]
			}]
		});
		new Ext.Viewport({
			layout: 'border',
			items: [{
				region: 'north',
				bodyStyle: 'border: 0',
				defaults: {
					border: false,
					rootVisible: false,
					bodyStyle: 'background:white;',
					listeners: {
						scope: this,
						click: this.onNodeClick
					}
				},
				height: 60,
				cls: 'x-toolbarWrite',
				tbar: new Ext.Toolbar({
					cls: 'x-btnblack',
					buttons: [{
						xtype: 'box',
						autoEl: {tag: 'img', src:'<?php echo DMG_Config::get(3); ?>'}
					}, {
						xtype: 'tbtext',
						cls: 'x-btnblack',
						text: '<div style="color: black; float: left; font-family: Arial; font-size: 20px; margin-left: 313px; margin-top: -5px;"><?php echo DMG_Config::get(2); ?></div>'
					}, '->', {
						text: '<?php echo DMG_Translate::_('window.ola'); ?> <?php echo Zend_Auth::getInstance()->getIdentity()->name; ?>.'
					}, {
						text: '<?php echo DMG_Translate::_('window.profile'); ?>',
						cls: 'x-btnblack',
						iconCls: 'silk-profile',
						scope: this,
						handler: this.editProfileClick
					}, {
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
				layoutConfig: {fill: false, animate:true},
				defaults: {
					border: false,
					rootVisible: false,
					bodyStyle: 'background:white;',
					listeners: {
						scope: this,
						click: this.onNodeClick
					}
				},
				items: [<?php echo Khronos_Menu::getJson(); ?>]
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
		window.location = '<?php echo $this->url(array('controller' => 'index', 'action' => 'logout'), null, true); ?>';
	}
});