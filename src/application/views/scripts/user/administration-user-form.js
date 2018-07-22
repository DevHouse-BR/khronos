var AdministrationUserForm = Ext.extend(Ext.Window, {
	user: 0,
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 450,
	height: 270,
	title: '<?php echo DMG_Translate::_('administration.user.form.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setUser: function(user) {
		this.user = user;
	},
	constructor: function() {
		this.addEvents({salvar: true, excluir: true});
		AdministrationUserForm.superclass.constructor.apply(this, arguments);
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
				{fieldLabel: '<?php echo DMG_Translate::_('administration.user.form.status.text'); ?>', xtype: 'radiogroup', name: 'status', items: [
					{boxLabel: '<?php echo DMG_Translate::_('administration.user.form.status.active'); ?>', name: 'status', inputValue: '1'},
					{boxLabel: '<?php echo DMG_Translate::_('administration.user.form.status.inactive'); ?>', name: 'status', inputValue: '0'}
				]},
				this.languages
			]
		});
		Ext.apply(this, {
			items: this.formPanel,
			bbar: [
				'->',
				{text: '<?php echo DMG_Translate::_('grid.form.save'); ?>',iconCls: 'icon-save',scope: this,handler: this._onBtnSalvarClick},
				<?php if (DMG_Acl::canAccess(6)): ?>
				this.btnExcluir = new Ext.Button({text: '<?php echo DMG_Translate::_('grid.form.delete'); ?>', iconCls: 'silk-delete', scope: this, handler: this._onBtnDeleteClick}),
				<?php endif; ?>
				{text: '<?php echo DMG_Translate::_('grid.form.cancel'); ?>', iconCls: 'silk-cross', scope: this, handler: this._onBtnCancelarClick}
			]
		});
		AdministrationUserForm.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.getForm().reset();
		AdministrationUserForm.superclass.show.apply(this, arguments);
		if(this.user !== 0) {
			this.formPanel.findById("password").allowBlank = true;
			this.formPanel.findById("password2").allowBlank = true;
			<?php if (DMG_Acl::canAccess(6)): ?>
			this.btnExcluir.show();
			<?php endif; ?>
			this.el.mask('<?php echo DMG_Translate::_('grid.form.loading'); ?>');
			this.formPanel.getForm().load({
				url: '<?php echo $this->url(array('controller' => 'user', 'action' => 'get'), null, true); ?>',
				params: {
					id: this.user
				},
				scope: this,
				success: this._onFormLoad
			});
		} else {
			this.formPanel.findById("password").allowBlank = false;
			this.formPanel.findById("password2").allowBlank = false;
			<?php if (DMG_Acl::canAccess(6)): ?>
			this.btnExcluir.hide();
			<?php endif; ?>
		}
	},
	onDestroy: function() {
		AdministrationUserForm.superclass.onDestroy.apply(this, arguments);
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
			url: '<?php echo $this->url(array('controller' => 'user', 'action' => 'save'), null, true); ?>',
			params: {
				id: this.user
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
	<?php if (DMG_Acl::canAccess(6)): ?>
	_onBtnDeleteClick: function() {
		uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('grid.form.confirm.delete'); ?>', function(opt) {
			if(opt === 'no') {
				return;
			}
			this.el.mask('<?php echo DMG_Translate::_('grid.form.deleting'); ?>');
			Ext.Ajax.request({
				url: '<?php echo $this->url(array('controller' => 'user', 'action' => 'delete'), null, true); ?>',
				params: {
					id: this.user
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
Ext.apply(Ext.form.VTypes, {
	password: function(value, field) {
		var pwd = Ext.getCmp(field.initialPassField);
		this.passwordText = '<?php echo DMG_Translate::_('administration.user.form.password.error'); ?>';
		return (value == pwd.getValue());
	}
});