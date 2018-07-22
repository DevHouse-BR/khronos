var ParqueGabineteForm = Ext.extend(Ext.Window, {
	gabinete: 0,
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 450,
	height: 100,
	title: '<?php echo DMG_Translate::_('parque.gabinete.form.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setgabinete: function(gabinete) {
		this.gabinete = gabinete;
	},
	constructor: function() {
		this.addEvents({salvar: true, excluir: true});
		ParqueGabineteForm.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		this.formPanel = new Ext.form.FormPanel({
			bodyStyle: 'padding:10px;',
			border: false,
			autoScroll: true,
			defaultType: 'textfield',
			defaults: {anchor: '-19'},
			items:[
				{fieldLabel: '<?php echo DMG_Translate::_('parque.gabinete.form.nm_gabinete.text'); ?>', name: 'nm_gabinete', allowBlank: false, maxLength: 255}
			]
		});
		Ext.apply(this, {
			items: this.formPanel,
			bbar: [
				'->',
				{text: '<?php echo DMG_Translate::_('grid.form.save'); ?>', iconCls: 'icon-save',scope: this,handler: this._onBtnSalvarClick},
				<?php if (DMG_Acl::canAccess(24)): ?>
				this.btnExcluir = new Ext.Button({text: '<?php echo DMG_Translate::_('grid.form.delete'); ?>', iconCls: 'silk-delete', scope: this, handler: this._onBtnDeleteClick}),
				<?php endif; ?>
				{text: '<?php echo DMG_Translate::_('grid.form.cancel'); ?>', iconCls: 'silk-cross', scope: this, handler: this._onBtnCancelarClick}
			]
		});
		ParqueGabineteForm.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.getForm().reset();
		ParqueGabineteForm.superclass.show.apply(this, arguments);
		if(this.gabinete !== 0) {
			<?php if (DMG_acl::canAccess(24)): ?>
			this.btnExcluir.show();
			<?php endif; ?>
			this.el.mask('<?php echo DMG_Translate::_('grid.form.loading'); ?>');
			this.formPanel.getForm().load({
				url: '<?php echo $this->url(array('controller' => 'gabinete', 'action' => 'get'), null, true); ?>',
				params: {
					id: this.gabinete
				},
				scope: this,
				success: this._onFormLoad
			});
		} else {
			<?php if (DMG_acl::canAccess(24)): ?>
			this.btnExcluir.hide();
			<?php endif; ?>
		}
	},
	onDestroy: function() {
		ParqueGabineteForm.superclass.onDestroy.apply(this, arguments);
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
			url: '<?php echo $this->url(array('controller' => 'gabinete', 'action' => 'save'), null, true); ?>',
			params: {
				id: this.gabinete
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
	<?php if (DMG_acl::canAccess(24)): ?>
	_onBtnDeleteClick: function() {
		uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('grid.form.confirm.delete'); ?>', function(opt) {
			if(opt === 'no') {
				return;
			}
			this.el.mask('<?php echo DMG_Translate::_('grid.form.deleting'); ?>');
			Ext.Ajax.request({
				url: '<?php echo $this->url(array('controller' => 'gabinete', 'action' => 'delete'), null, true); ?>',
				params: {
					id: this.gabinete
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