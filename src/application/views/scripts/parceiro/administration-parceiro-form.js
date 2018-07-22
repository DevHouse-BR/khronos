var AdministrationParceiroForm = Ext.extend(Ext.Window, {
	parceiro: 0,
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 450,
	height: 125,
	title: '<?php echo DMG_Translate::_('administration.parceiro.form.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setParceiro: function(parceiro) {
		this.parceiro = parceiro;
	},
	constructor: function() {
		this.addEvents({salvar: true, excluir: true});
		AdministrationParceiroForm.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		this.formPanel = new Ext.form.FormPanel({
			bodyStyle: 'padding:10px;',
			border: false,
			autoScroll: true,
			defaultType: 'textfield',
			defaults: {anchor: '-19'},
			items:[
				{fieldLabel: '<?php echo DMG_Translate::_('administration.parceiro.form.nm_parceiro.text'); ?>', name: 'nm_parceiro', allowBlank: false, maxLength: 255},
				new Ext.form.ComboBox({
					store: new Ext.data.JsonStore({
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
					mode: 'remote',
					triggerAction: 'all',
					emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
					fieldLabel: '<?php echo DMG_Translate::_('administration.parceiro.form.nm_empresa.text'); ?>'
				}),
			]
		});
		Ext.apply(this, {
			items: this.formPanel,
			bbar: [
				'->',
				{text: '<?php echo DMG_Translate::_('grid.form.save'); ?>',iconCls: 'icon-save',scope: this,handler: this._onBtnSalvarClick},
				<?php if (DMG_Acl::canAccess(53)): ?>
				this.btnExcluir = new Ext.Button({text: '<?php echo DMG_Translate::_('grid.form.delete'); ?>', iconCls: 'silk-delete', scope: this, handler: this._onBtnDeleteClick}),
				<?php endif; ?>
				{text: '<?php echo DMG_Translate::_('grid.form.cancel'); ?>', iconCls: 'silk-cross', scope: this, handler: this._onBtnCancelarClick}
			]
		});
		AdministrationParceiroForm.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.getForm().reset();
		AdministrationParceiroForm.superclass.show.apply(this, arguments);
		if(this.parceiro !== 0) {
			<?php if (DMG_acl::canAccess(53)): ?>
			this.btnExcluir.show();
			<?php endif; ?>
			this.el.mask('<?php echo DMG_Translate::_('grid.form.loading'); ?>');
			this.formPanel.getForm().load({
				url: '<?php echo $this->url(array('controller' => 'parceiro', 'action' => 'get'), null, true); ?>',
				params: {
					id: this.parceiro
				},
				scope: this,
				success: this._onFormLoad
			});
		} else {
			<?php if (DMG_acl::canAccess(53)): ?>
			this.btnExcluir.hide();
			<?php endif; ?>
		}
	},
	onDestroy: function() {
		AdministrationParceiroForm.superclass.onDestroy.apply(this, arguments);
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
			url: '<?php echo $this->url(array('controller' => 'parceiro', 'action' => 'save'), null, true); ?>',
			params: {
				id: this.parceiro
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
	<?php if (DMG_acl::canAccess(53)): ?>
	_onBtnDeleteClick: function() {
		uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('grid.form.confirm.delete'); ?>', function(opt) {
			if(opt === 'no') {
				return;
			}
			this.el.mask('<?php echo DMG_Translate::_('grid.form.deleting'); ?>');
			Ext.Ajax.request({
				url: '<?php echo $this->url(array('controller' => 'parceiro', 'action' => 'delete'), null, true); ?>',
				params: {
					id: this.parceiro
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