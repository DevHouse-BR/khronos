var AdministrationFilialForm = Ext.extend(Ext.Window, {
	filial: 0,
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 450,
	height: 125,
	title: '<?php echo DMG_Translate::_('administration.filial.form.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setFilial: function(filial) {
		this.filial = filial;
	},
	constructor: function() {
		this.addEvents({salvar: true, excluir: true});
		AdministrationFilialForm.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		this.formPanel = new Ext.form.FormPanel({
			bodyStyle: 'padding:10px;',
			border: false,
			autoScroll: true,
			defaultType: 'textfield',
			defaults: {anchor: '-19'},
			
			/*
			 * Alteração feita por Leonardo para impedir a edição do campo empresa após o load do registro
			 */
			
			
			
			
			listeners:{
				actioncomplete: function(form, action){
					if(action.type == 'load'){
						Ext.getCmp('idEmpresaField').disable();
					}
				}
			},
			
			
			
			
			
			
			items:[
				{fieldLabel: '<?php echo DMG_Translate::_('administration.filial.form.nm_filial.text'); ?>', name: 'nm_filial', allowBlank: false, maxLength: 255},
				new Ext.form.ComboBox({
					typeAhead: true,
					id: 'idEmpresaField',
					triggerAction: 'all',
					lazyRender:true,
					mode: 'remote',
					
					
					store: new Ext.data.JsonStore({
						autoLoad : true,  //Popula o store antes de mostrar a tela e assim permite a visualização do registro e não o código
						url: '<?php echo $this->url(array('controller' => 'empresa', 'action' => 'list'), null, true); ?>',
						baseParams: {
							dir: 'ASC',
							sort: 'nm_empresa',
							limit: 15,
							'filter[0][data][type]': 'string',
							'filter[0][field]': 'nm_empresa',
						},
						root: 'data',
						fields: ['id', 'nm_empresa'],
					}),
					minChars: 0,
					queryParam: 'filter[0][data][value]',
					hiddenName: 'id_empresa',
					allowBlank: false,
					displayField: 'nm_empresa',
					valueField: 'id',
					
					
					emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
					fieldLabel: '<?php echo DMG_Translate::_('administration.filial.form.nm_empresa.text'); ?>'
				}),
			]
		});
		Ext.apply(this, {
			items: this.formPanel,
			bbar: [
				'->',
				{text: '<?php echo DMG_Translate::_('grid.form.save'); ?>',iconCls: 'icon-save',scope: this,handler: this._onBtnSalvarClick},
				<?php if (DMG_Acl::canAccess(45)): ?>
				this.btnExcluir = new Ext.Button({text: '<?php echo DMG_Translate::_('grid.form.delete'); ?>', iconCls: 'silk-delete', scope: this, handler: this._onBtnDeleteClick}),
				<?php endif; ?>
				{text: '<?php echo DMG_Translate::_('grid.form.cancel'); ?>', iconCls: 'silk-cross', scope: this, handler: this._onBtnCancelarClick}
			]
		});
		AdministrationFilialForm.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.getForm().reset();
		Ext.getCmp('idEmpresaField').enable();
		AdministrationFilialForm.superclass.show.apply(this, arguments);
		if(this.filial !== 0) {
			<?php if (DMG_acl::canAccess(45)): ?>
			this.btnExcluir.show();
			<?php endif; ?>
			this.el.mask('<?php echo DMG_Translate::_('grid.form.loading'); ?>');
			this.formPanel.getForm().load({
				url: '<?php echo $this->url(array('controller' => 'filial', 'action' => 'get'), null, true); ?>',
				params: {
					id: this.filial
				},
				scope: this,
				success: this._onFormLoad
			});
		} else {
			<?php if (DMG_acl::canAccess(45)): ?>
			this.btnExcluir.hide();
			<?php endif; ?>
		}
	},
	onDestroy: function() {
		AdministrationFilialForm.superclass.onDestroy.apply(this, arguments);
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
			url: '<?php echo $this->url(array('controller' => 'filial', 'action' => 'save'), null, true); ?>',
			params: {
				id: this.filial
			},
			scope:this,
			success: function() {
				this.el.unmask();
				this.hide();
				this.fireEvent('salvar', this);
			},
			failure: function () {
				this.el.unmask();
			}
		});
	},
	<?php if (DMG_acl::canAccess(45)): ?>
	_onBtnDeleteClick: function() {
		uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('grid.form.confirm.delete'); ?>', function(opt) {
			if(opt === 'no') {
				return;
			}
			this.el.mask('<?php echo DMG_Translate::_('grid.form.deleting'); ?>');
			Ext.Ajax.request({
				url: '<?php echo $this->url(array('controller' => 'filial', 'action' => 'delete'), null, true); ?>',
				params: {
					id: this.filial
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