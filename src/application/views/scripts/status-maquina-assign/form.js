var StatusMaquinaAssignForm = Ext.extend(Ext.Window, {
	maquina: 0,
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 370,
	height: 130,
	title: '<?php echo DMG_Translate::_('status-maquina-assin.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setMaquina: function(maquina) {
		this.maquina = maquina;
	},
	constructor: function() {
		this.addEvents({salvar: true});
		StatusMaquinaAssignForm.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		this.data = new Ext.form.DateField({
			id:'dt_statusField',
			format: 'd/m/Y',
			editable: false,
			labelStyle: 'display: none',
			name: 'dt_status'
		});
		this.hora = new Ext.ux.form.SpinnerField({
			labelWidth: 40,
			width: 50,
			labelStyle: 'display:none',
			id: 'horaField',
			name: 'hora',
			minValue: 0,
			maxValue: 23,
			decimalPrecision: 1,
			accelerate: true
		});
		this.minuto = new Ext.ux.form.SpinnerField({
			labelWidth: 40,
			width: 50,
			labelStyle: 'display:none',
			name: 'minuto',
			id: 'minutoField',
			minValue: 0,
			maxValue: 59,
			decimalPrecision: 1,
			accelerate: true
		});	
		this.formPanel = new Ext.FormPanel({
			labelAlign: 'left',
			labelWidth: 130,
			border: false,
			bodyStyle: 'padding: 5px',
			items: [{
				layout: 'column',
				fieldLabel: '<?php echo DMG_Translate::_('status-maquina-assign.data.text'); ?>',
				border: false,
				items:[{
					labelAlign: 'top',
					layout: 'form',
					border: false,
					items: [this.data]
				},{
					labelAlign: 'top',
					layout: 'form',
					border: false,
					items: [this.hora]
				},{
					labelAlign: 'top',
					layout: 'form',
					border: false,
					items: [this.minuto]
				}]
			},
			new Ext.form.ComboBox({
				store: new Ext.data.JsonStore({
					autoLoad: true,
					url: '<?php echo $this->url(array('controller' => 'status-maquina-assign', 'action' => 'status'), null, true); ?>',
					baseParams: {
						limit: 15,
					},
					root: 'data',
					fields: ['id', 'nm_status_maquina'],
				}),
				minChars: 0,
				editable: false,
				hiddenName: 'id_status_maquina',
				allowBlank: false,
				displayField: 'nm_status_maquina',
				valueField: 'id',
				mode: 'remote',
				triggerAction: 'all',
				emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
				fieldLabel: '<?php echo DMG_Translate::_('status-maquina-assign.nm_status_maquina.text'); ?>'
			}),
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
		StatusMaquinaAssignForm.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.getForm().reset();
		var d = new Date();
		
		Ext.getCmp('dt_statusField').setValue(d);
		Ext.getCmp('horaField').setValue(d.getHours());
		Ext.getCmp('minutoField').setValue(d.getMinutes());
		
		StatusMaquinaAssignForm.superclass.show.apply(this, arguments);
	},
	_onFormLoad: function () {
		this.el.unmask();
	},
	onDestroy: function() {
		StatusMaquinaAssignForm.superclass.onDestroy.apply(this, arguments);
		this.formPanel = null;
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
			url: '<?php echo $this->url(array('controller' => 'status-maquina-assign', 'action' => 'save'), null, true); ?>',
			params: {
				id: this.maquina,
			},
			scope:this,
			success: function() {
				this.el.unmask();
				this.hide();
				this.fireEvent('salvar', this);
			},
			failure: function (form, request) {
				this.el.unmask();
				//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', request.result.message);
				uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: request.result.message});
			}
		});
	},
	_onBtnCancelarClick: function() {
		this.hide();
	}
	
});