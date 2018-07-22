var AdministrationConfigForm = Ext.extend(Ext.Window, {
	id: 0,
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 450,
	height: 125,
	title: '<?php echo DMG_Translate::_('config.form.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setid: function(id) {
		this.id = id;
	},
	constructor: function() {
		this.addEvents({salvar: true});
		AdministrationConfigForm.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		this.formPanel = new Ext.form.FormPanel({
			bodyStyle: 'padding:10px;',
			border: false,
			autoScroll: true,
			defaultType: 'textfield',
			defaults: {anchor: '-19'},
			items:[
				{fieldLabel: '<?php echo DMG_Translate::_('administration.config.form.name.text'); ?>', disabled: 'disabled', name: 'name', allowBlank: false, maxLength: 255},
				{fieldLabel: '<?php echo DMG_Translate::_('administration.config.form.value.text'); ?>', name: 'value', allowBlank: false, maxLength: 255}
			]
		});
		Ext.apply(this, {
			items: this.formPanel,
			bbar: [
				'->',
				{text: '<?php echo DMG_Translate::_('grid.form.save'); ?>',iconCls: 'icon-save',scope: this,handler: this._onBtnSalvarClick},
				{text: '<?php echo DMG_Translate::_('grid.form.cancel'); ?>', iconCls: 'silk-cross', scope: this, handler: this._onBtnCancelarClick}
			]
		});
		AdministrationConfigForm.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.getForm().reset();
		AdministrationConfigForm.superclass.show.apply(this, arguments);
		if(this.id !== 0) {
			this.el.mask('<?php echo DMG_Translate::_('grid.form.loading'); ?>');
			this.formPanel.getForm().load({
				url: '<?php echo $this->url(array('controller' => 'config', 'action' => 'get'), null, true); ?>',
				params: {
					id: this.id
				},
				scope: this,
				success: this._onFormLoad
			});
		}
	},
	onDestroy: function() {
		AdministrationConfigForm.superclass.onDestroy.apply(this, arguments);
		this.formPanel = null;
	},
	_onFormLoad: function(form, request) {
		if (request.result.data.system == true) {
			this.el.unmask();
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('administration.config.form.systemerror'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('administration.config.form.systemerror'); ?>'});
			this.hide();
		} else {
			this.el.unmask();
		}
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
			url: '<?php echo $this->url(array('controller' => 'config', 'action' => 'save'), null, true); ?>',
			params: {
				id: this.id
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
	_onBtnCancelarClick: function() {
		this.hide();
	}
});