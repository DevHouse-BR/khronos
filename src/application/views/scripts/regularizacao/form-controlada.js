var RegularizacaoFormControlada = Ext.extend(Ext.Window, {
	maquina: 0,
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 600,
	height: 310,
	title: '<?php echo DMG_Translate::_('regularizacao.controlada.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setMaquina: function(maquina) {
		this.maquina = maquina;
	},
	constructor: function() {
		this.addEvents({salvar: true});
		RegularizacaoFormControlada.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		this.data = new Ext.form.DateField({
			xtype: 'datetimefield',
			format: 'd/m/Y',
			editable: false,
			labelStyle: 'display: none',
			name: 'dt_regularizacao' 
		});
		this.hora = new Ext.ux.form.SpinnerField({
			labelWidth: 40,
			width: 50,
			xtype: 'spinnerfield',
			labelStyle: 'display:none',
			name: 'hora',
			minValue: 0,
			maxValue: 23,
			decimalPrecision: 1,
			accelerate: true
		});
		this.minuto = new Ext.ux.form.SpinnerField({
			labelWidth: 40,
			width: 50,
			xtype: 'spinnerfield',
			labelStyle: 'display:none',
			name: 'minuto',
			minValue: 0,
			maxValue: 59,
			decimalPrecision: 1,
			accelerate: true
		});	
		this.formPanel = new Ext.FormPanel({
			labelAlign: 'left',
			labelWidth: 120,
			border: false,
			bodyStyle: 'padding: 5px',
			items: [{
				layout: 'column',
				fieldLabel: '<?php echo DMG_Translate::_('regularizacao.data.text'); ?>',
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
			{fieldLabel: '<?php echo DMG_Translate::_('regularizacao.motivo.text'); ?>', name: 'motivo', allowBlank: false, maxLength: 255, width: 430, xtype: 'textfield'},
			{
				layout: 'column',
				border: false,
				items:[{
					columnWidth: .5,
					layout: 'form',
					border: false,
					items: [
						{xtype: 'label', text: '<?php echo DMG_Translate::_('regularizacao.contadores.anteriores'); ?>', style: 'font-weight: bold; padding-top: 5px; display: block; padding-bottom: 5px;'},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_1.text'); ?>', name: 'nr_cont_1_ant', allowBlank: false, maxLength: 100, xtype: 'textfield'},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_2.text'); ?>', name: 'nr_cont_2_ant', allowBlank: false, maxLength: 100, xtype: 'textfield'},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_3.text'); ?>', name: 'nr_cont_3_ant', allowBlank: false, maxLength: 100, xtype: 'textfield'},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_4.text'); ?>', name: 'nr_cont_4_ant', allowBlank: false, maxLength: 100, xtype: 'textfield'},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_5.text'); ?>', name: 'nr_cont_5_ant', allowBlank: true, maxLength: 100, xtype: 'textfield'},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_6.text'); ?>', name: 'nr_cont_6_ant', allowBlank: true, maxLength: 100, xtype: 'textfield'},
					]
				},{
					columnWidth: .5,
					layout: 'form',
					border: false,
					items: [
						{xtype: 'label', text: '<?php echo DMG_Translate::_('regularizacao.contadores.posteriores'); ?>', style: 'font-weight: bold; padding-top: 5px; display: block; padding-bottom: 5px;'},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_1.text'); ?>', name: 'nr_cont_1', allowBlank: false, maxLength: 100, xtype: 'textfield'},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_2.text'); ?>', name: 'nr_cont_2', allowBlank: false, maxLength: 100, xtype: 'textfield'},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_3.text'); ?>', name: 'nr_cont_3', allowBlank: false, maxLength: 100, xtype: 'textfield'},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_4.text'); ?>', name: 'nr_cont_4', allowBlank: false, maxLength: 100, xtype: 'textfield'},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_5.text'); ?>', name: 'nr_cont_5', allowBlank: true, maxLength: 100, xtype: 'textfield'},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_6.text'); ?>', name: 'nr_cont_6', allowBlank: true, maxLength: 100, xtype: 'textfield'},
					]
				}]
			}
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
		RegularizacaoFormControlada.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.getForm().reset();
		var data = new Date();
		this.formPanel.getForm().findField('dt_regularizacao').setValue(data);
		this.formPanel.getForm().findField('hora').setValue(data.getHours());
		this.formPanel.getForm().findField('minuto').setValue(data.getMinutes());
		RegularizacaoFormControlada.superclass.show.apply(this, arguments);
	},
	_onFormLoad: function () {
		this.el.unmask();
	},
	onDestroy: function() {
		RegularizacaoFormControlada.superclass.onDestroy.apply(this, arguments);
		this.formPanel = null;
	},
	_onBtnSalvarClick: function() {
		var form = this.formPanel.getForm();
		if(!form.isValid()) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('grid.form.alert.invalid'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('grid.form.alert.invalid'); ?>'});
			return false;
		}
		uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('regularizacao.confirmar'); ?>', function (o) {
			if (o == 'no') {
				return;
			}
			this.el.mask('<?php echo DMG_Translate::_('grid.form.saving'); ?>');
			form.submit({
				url: '<?php echo $this->url(array('controller' => 'regularizacao', 'action' => 'save-controlada'), null, true); ?>',
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
		}, this);
	},
	_onBtnCancelarClick: function() {
		this.hide();
	}
	
});