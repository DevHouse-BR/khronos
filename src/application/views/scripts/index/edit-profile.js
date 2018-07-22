var AdministrationUserFormEditPerfil = Ext.extend(Ext.Window, {
	user: 0,
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 450,
	height: 260,
	title: '<?php echo DMG_Translate::_('administration.user.form.editPerfil.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setUser: function(user) {
		this.user = user;
	},
	constructor: function() {
		this.addEvents({salvar: true, excluir: true});
		AdministrationUserFormEditPerfil.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		this.languages = new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields: ['code', 'name'],
				data: languages
			}),
			hiddenName: 'language',
			allowBlank: true,
			displayField: 'name',
			valueField: 'code',
			mode: 'local',
			triggerAction: 'all',
			emptyText: '<?php echo DMG_Translate::_('administration.user.form.language.helper'); ?>',
			fieldLabel: '<?php echo DMG_Translate::_('administration.user.form.language.text'); ?>'
		});
		this.formPanel = new Ext.form.FormPanel({
			bodyStyle: 'padding:10px;',
			border: false,
			autoScroll: true,
			defaultType: 'textfield',
			defaults: {anchor: '-19'},
			items:[
				{fieldLabel: '<?php echo DMG_Translate::_('administration.user.form.name.text'); ?>', name: 'name', allowBlank: false, maxLength: 255},
				{fieldLabel: '<?php echo DMG_Translate::_('administration.user.form.username.text'); ?>', name: 'username', allowBlank: false, maxLength: 255},
				{fieldLabel: '<?php echo DMG_Translate::_('administration.user.form.email.text'); ?>', name: 'email', allowBlank: false, maxLength: 255},
				{fieldLabel: '<?php echo DMG_Translate::_('administration.user.form.password.text'); ?>', name: 'password', allowBlank: false, maxLength: 64, inputType: 'password', id: 'password', vtype: 'password', initialPassField: 'password2'},
				{fieldLabel: '<?php echo DMG_Translate::_('administration.user.form.password2.text'); ?>', name: 'password2', allowBlank: false, maxLength: 64, inputType: 'password', id: 'password2', vtype: 'password', initialPassField: 'password'},
				this.languages
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
		AdministrationUserFormEditPerfil.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.getForm().reset();
		AdministrationUserFormEditPerfil.superclass.show.apply(this, arguments);
		if(this.user !== 0) {
			this.formPanel.findById("password").allowBlank = true;
			this.formPanel.findById("password2").allowBlank = true;
			this.el.mask('<?php echo DMG_Translate::_('grid.form.loading'); ?>');
			this.formPanel.getForm().load({
				url: '<?php echo $this->url(array('controller' => 'index', 'action' => 'user', 'do' => 'get'), null, true); ?>',
				params: {
					id: this.user
				},
				scope: this,
				success: this._onFormLoad
			});
		} else {
			this.formPanel.findById("password").allowBlank = false;
			this.formPanel.findById("password2").allowBlank = false;
		}
	},
	onDestroy: function() {
		AdministrationUserFormEditPerfil.superclass.onDestroy.apply(this, arguments);
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
			url: '<?php echo $this->url(array('controller' => 'index', 'action' => 'user', 'do' => 'update'), null, true); ?>',
			params: {
				id: this.user,
				status: 1
			},
			scope: this,
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
Ext.apply(Ext.form.VTypes, {
	password: function(value, field) {
		var pwd = Ext.getCmp(field.initialPassField);
		this.passwordText = '<?php echo DMG_Translate::_('administration.user.form.password.error'); ?>';
		return (value == pwd.getValue());
	}
});