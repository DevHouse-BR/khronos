var ParqueLocalForm = Ext.extend(Ext.Window, {
	local: 0,
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 450,
	height: 260,
	title: '<?php echo DMG_Translate::_('parque.local.form.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setlocal: function(local) {
		this.local = local;
	},
	constructor: function() {
		this.addEvents({salvar: true, excluir: true});
		ParqueLocalForm.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		this.tp_local = new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields: ['id', 'nm_tp_local'],
				data: [
<?php

foreach (Doctrine::getTable('ScmTipoLocal')->findAll() as $k) {
	echo "					[{$k->id}, '{$k->nm_tipo_local}'],\n";
} 

?>
				]
			}),
			hiddenName: 'tp_local',
			allowBlank: false,
			displayField: 'nm_tp_local',
			valueField: 'id',
			mode: 'local',
			triggerAction: 'all',
			emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
			fieldLabel: '<?php echo DMG_Translate::_('parque.local.form.tp_local.text'); ?>'
		});
		this.formPanel = new Ext.form.FormPanel({
			bodyStyle: 'padding:10px;',
			border: false,
			autoScroll: true,
			defaultType: 'textfield',
			defaults: {anchor: '-19'},
			listeners:{
				actioncomplete: function(formulario, acao){
					if(acao.type == 'load'){
						if(acao.result.data.fl_portal == 1) Ext.getCmp('fl_portalFieldset').expand();
						else Ext.getCmp('fl_portalFieldset').collapse();
					}
				}
			},
			items:[{
				fieldLabel: '<?php echo DMG_Translate::_('parque.local.form.nm_local.text'); ?>', 
				name: 'nm_local', 
				allowBlank: false,
				maxLength: 255
			}, {
				fieldLabel: '<?php echo DMG_Translate::_('parque.local.form.percent_local.text'); ?>',
				name: 'percent_local',
				allowBlank: true,
				maxLenght: 50
			},
				this.tp_local,
			{
				xtype:'fieldset',
	            checkboxToggle:true,
	            animCollapse:true,
	            checkboxName: 'fl_portal',
	            id: 'fl_portalFieldset',
	            title: '<?php echo DMG_Translate::_('parque.local.form.fl_portal.text'); ?>',
	            autoHeight:true,
	            defaults: {width: 210},
	            defaultType: 'textfield',
	            collapsed: true,
	            items :[{
	                    fieldLabel: '<?php echo DMG_Translate::_('auth.username'); ?>',
	                    name:'user_portal',
	                    maxLength: 50,
						id: 'user_portalField'
	                },{
	                	fieldLabel: '<?php echo DMG_Translate::_('auth.password'); ?>',
						name:'pass_portal',
						id: 'pass_portalField',
						maxLength: 20,
						inputType:'password'
	                }
	             ]
			}]
		});
		Ext.apply(this, {
			items: this.formPanel,
			bbar: [
				'->',
				{text: '<?php echo DMG_Translate::_('grid.form.save'); ?>', iconCls: 'icon-save',scope: this,handler: this._onBtnSalvarClick},
				<?php if (DMG_Acl::canAccess(20)): ?>
				this.btnExcluir = new Ext.Button({text: '<?php echo DMG_Translate::_('grid.form.delete'); ?>', iconCls: 'silk-delete', scope: this, handler: this._onBtnDeleteClick}),
				<?php endif; ?>
				{text: '<?php echo DMG_Translate::_('grid.form.cancel'); ?>', iconCls: 'silk-cross', scope: this, handler: this._onBtnCancelarClick}
			]
		});
		ParqueLocalForm.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.getForm().reset();
		ParqueLocalForm.superclass.show.apply(this, arguments);
		if(this.local !== 0) {
			<?php if (DMG_acl::canAccess(20)): ?>
			this.btnExcluir.show();
			<?php endif; ?>
			this.el.mask('<?php echo DMG_Translate::_('grid.form.loading'); ?>');
			this.formPanel.getForm().load({
				url: '<?php echo $this->url(array('controller' => 'local', 'action' => 'get'), null, true); ?>',
				params: {
					id: this.local
				},
				scope: this,
				success: this._onFormLoad
			});
		} else {
			<?php if (DMG_acl::canAccess(20)): ?>
			this.btnExcluir.hide();
			<?php endif; ?>
		}
	},
	onDestroy: function() {
		ParqueLocalForm.superclass.onDestroy.apply(this, arguments);
		this.formPanel = null;
	},
	_onFormLoad: function(form, request) {
		this.el.unmask();
	},
	_onBtnSalvarClick: function() {
		var form = this.formPanel.getForm();
		if(!form.isValid()) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('grid.form.alert.invalid'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('grid.form.alert.invalid'); ?>'});
			return false;
		}
		this.el.mask('<?php echo DMG_Translate::_('grid.form.saving'); ?>');
		form.submit({
			url: '<?php echo $this->url(array('controller' => 'local', 'action' => 'save'), null, true); ?>',
			params: {
				id: this.local
			},
			scope:this,
			success: function() {
				this.el.unmask();
				this.hide();
				this.fireEvent('salvar', this);
			},
			failure: function (formulario, acao) {
				this.el.unmask();
				var obj = Ext.decode(acao.response.responseText)
				uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: obj.message});
			}
		});
	},
	<?php if (DMG_acl::canAccess(20)): ?>
	_onBtnDeleteClick: function() {
		uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('grid.form.confirm.delete'); ?>', function(opt) {
			if(opt === 'no') {
				return;
			}
			this.el.mask('<?php echo DMG_Translate::_('grid.form.deleting'); ?>');
			Ext.Ajax.request({
				url: '<?php echo $this->url(array('controller' => 'local', 'action' => 'delete'), null, true); ?>',
				params: {
					id: this.local
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
	<?php endif; ?>
	_onBtnCancelarClick: function() {
		this.hide();
	}
});