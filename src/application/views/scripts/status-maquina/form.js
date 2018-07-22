var StatusMaquinaForm = Ext.extend(Ext.Window, {
	statusMaquina: 0,
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 330,
	height: 280,
	title: '<?php echo DMG_Translate::_('status-maquina.form.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setStatusMaquina: function(id) {
		this.statusMaquina = id;
	},
	constructor: function() {
		this.addEvents({salvar: true});
		StatusMaquinaForm.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		this.formPanel = new Ext.form.FormPanel({
			bodyStyle: 'padding:10px;',
			border: false,
			autoScroll: true,
			defaultType: 'textfield',
			labelWidth: 150,
			items:[
				{fieldLabel: '<?php echo DMG_Translate::_('status-maquina.form.nm_status_maquina.text'); ?>', name: 'nm_status_maquina', allowBlank: false, maxLength: 255},
				{fieldLabel: '<?php echo DMG_Translate::_('status-maquina.form.fl_permite_movimentacao.text'); ?>', xtype: 'radiogroup', name: 'fl_permite_movimentacao', items: [
					{boxLabel: '<?php echo DMG_Translate::_('yes'); ?>', name: 'fl_permite_movimentacao', inputValue: '1'},
					{boxLabel: '<?php echo DMG_Translate::_('no'); ?>', name: 'fl_permite_movimentacao', inputValue: '0'}
				], allowBlank: false},
				{fieldLabel: '<?php echo DMG_Translate::_('status-maquina.form.fl_permite_transformacao.text'); ?>', xtype: 'radiogroup', name: 'fl_permite_transformacao', items: [
					{boxLabel: '<?php echo DMG_Translate::_('yes'); ?>', name: 'fl_permite_transformacao', inputValue: '1'},
					{boxLabel: '<?php echo DMG_Translate::_('no'); ?>', name: 'fl_permite_transformacao', inputValue: '0'}
				], allowBlank: false},
				{fieldLabel: '<?php echo DMG_Translate::_('status-maquina.form.fl_permite_faturamento.text'); ?>', xtype: 'radiogroup', name: 'fl_permite_faturamento', items: [
					{boxLabel: '<?php echo DMG_Translate::_('yes'); ?>', name: 'fl_permite_faturamento', inputValue: '1'},
					{boxLabel: '<?php echo DMG_Translate::_('no'); ?>', name: 'fl_permite_faturamento', inputValue: '0'}
				], allowBlank: false},
				{fieldLabel: '<?php echo DMG_Translate::_('status-maquina.form.fl_permite_regularizacao.text'); ?>', xtype: 'radiogroup', name: 'fl_permite_regularizacao', items: [
					{boxLabel: '<?php echo DMG_Translate::_('yes'); ?>', name: 'fl_permite_regularizacao', inputValue: '1'},
					{boxLabel: '<?php echo DMG_Translate::_('no'); ?>', name: 'fl_permite_regularizacao', inputValue: '0'}
				], allowBlank: false},
				{fieldLabel: '<?php echo DMG_Translate::_('status-maquina.form.fl_operativa.text'); ?>', xtype: 'radiogroup', name: 'fl_operativa', items: [
					{boxLabel: '<?php echo DMG_Translate::_('yes'); ?>', name: 'fl_operativa', inputValue: '1'},
					{boxLabel: '<?php echo DMG_Translate::_('no'); ?>', name: 'fl_operativa', inputValue: '0'}
				], allowBlank: false},
				{fieldLabel: '<?php echo DMG_Translate::_('status-maquina.form.fl_alta.text'); ?>', xtype: 'radiogroup', name: 'fl_alta', items: [
					{boxLabel: '<?php echo DMG_Translate::_('yes'); ?>', name: 'fl_alta', inputValue: '1'},
					{boxLabel: '<?php echo DMG_Translate::_('no'); ?>', name: 'fl_alta', inputValue: '0'}
				], allowBlank: false},
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
		StatusMaquinaForm.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.getForm().reset();
		StatusMaquinaForm.superclass.show.apply(this, arguments);
		if(this.statusMaquina !== 0) {
			this.el.mask('<?php echo DMG_Translate::_('grid.form.loading'); ?>');
			this.formPanel.getForm().load({
				url: '<?php echo $this->url(array('controller' => 'status-maquina', 'action' => 'get'), null, true); ?>',
				params: {
					id: this.statusMaquina
				},
				scope: this,
				success: this._onFormLoad
			});
		}
	},
	onDestroy: function() {
		StatusMaquinaForm.superclass.onDestroy.apply(this, arguments);
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
			url: '<?php echo $this->url(array('controller' => 'status-maquina', 'action' => 'save'), null, true); ?>',
			params: {
				id: this.statusMaquina
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