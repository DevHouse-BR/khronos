var MovimentacaoSaidaForm = Ext.extend(Ext.Window, {
	maquina: 0,
	cont_manual: 'N',
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 370,
	height: 320,
	title: '<?php echo DMG_Translate::_('movimentacao-saida.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setMaquina: function(maquina) {
		this.maquina = maquina;
	},
	constructor: function() {
		this.addEvents({salvar: true});
		MovimentacaoSaidaForm.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		this.data = new Ext.form.DateField({
			xtype: 'datetimefield',
			format: 'd/m/Y',
			editable: false,
			labelStyle: 'display: none',
			name: 'dt_movimentacao' 
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
			labelWidth: 130,
			width: 600,
			border: false,
			bodyStyle: 'padding: 5px',
			items: [{
				layout: 'column',
				fieldLabel: '<?php echo DMG_Translate::_('movimentacao-saida.form.data.text'); ?>',
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
			{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_1.text'); ?>', disabled: 'disabled', name: 'nr_cont_1', allowBlank: false, maxLength: 100, xtype: 'textfield'},
			{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_2.text'); ?>', disabled: 'disabled', name: 'nr_cont_2', allowBlank: false, maxLength: 100, xtype: 'textfield'},
			{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_3.text'); ?>', disabled: 'disabled', name: 'nr_cont_3', allowBlank: false, maxLength: 100, xtype: 'textfield'},
			{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_4.text'); ?>', disabled: 'disabled', name: 'nr_cont_4', allowBlank: false, maxLength: 100, xtype: 'textfield'},
			{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_5.text'); ?>', disabled: 'disabled', name: 'nr_cont_5', allowBlank: true, maxLength: 100, xtype: 'textfield'},
			{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_6.text'); ?>', disabled: 'disabled', name: 'nr_cont_6', allowBlank: true, maxLength: 100, xtype: 'textfield'},
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
		MovimentacaoSaidaForm.superclass.initComponent.call(this);
	},
	show: function() {
		MovimentacaoSaidaForm.superclass.show.apply(this, arguments);
		this.el.mask('<?php echo DMG_Translate::_('movimentacao.contadores.buscando'); ?>');
		var conn = new Ext.data.Connection();
		conn.request({
			url: '<?php echo $this->url(array('controller' => 'movimentacao', 'action' => 'contadores')); ?>',
			params: {
				id: this.maquina
			},
			method: 'post',
			scope: this,
			callback: function (a, b, c) {
				this.el.unmask();
				try {
					var data = Ext.decode(c.responseText);
					this.formPanel.getForm().reset();
					var date = new Date();
					this.formPanel.getForm().findField('dt_movimentacao').setValue(date);
					this.formPanel.getForm().findField('hora').setValue(date.getHours());
					this.formPanel.getForm().findField('minuto').setValue(date.getMinutes());
					if (data.success) {
						this.formPanel.getForm().findField('nr_cont_1').disable();
						this.formPanel.getForm().findField('nr_cont_1').setValue(data.data.nr_cont_1);
						this.formPanel.getForm().findField('nr_cont_2').disable();
						this.formPanel.getForm().findField('nr_cont_2').setValue(data.data.nr_cont_2);
						this.formPanel.getForm().findField('nr_cont_3').disable();
						this.formPanel.getForm().findField('nr_cont_3').setValue(data.data.nr_cont_3);
						this.formPanel.getForm().findField('nr_cont_4').disable();
						this.formPanel.getForm().findField('nr_cont_4').setValue(data.data.nr_cont_4);
						this.formPanel.getForm().findField('nr_cont_5').disable();
						this.formPanel.getForm().findField('nr_cont_5').setValue(data.data.nr_cont_5);
						this.formPanel.getForm().findField('nr_cont_6').disable();
						this.formPanel.getForm().findField('nr_cont_6').setValue(data.data.nr_cont_6);
						this.cont_manual = 'N';						
					} else {
						//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', data.message);
						uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: data.message});
						<?php if (DMG_Acl::canAccess(60)): ?>
						this.formPanel.getForm().findField('nr_cont_1').enable();
						this.formPanel.getForm().findField('nr_cont_2').enable();
						this.formPanel.getForm().findField('nr_cont_3').enable();
						this.formPanel.getForm().findField('nr_cont_4').enable();
						this.formPanel.getForm().findField('nr_cont_5').enable();
						this.formPanel.getForm().findField('nr_cont_6').enable();
						this.cont_manual = 'S';
						<?php else: ?>
						this.formPanel.getForm().findField('nr_cont_1').disable();
						this.formPanel.getForm().findField('nr_cont_2').disable();
						this.formPanel.getForm().findField('nr_cont_3').disable();
						this.formPanel.getForm().findField('nr_cont_4').disable();
						this.formPanel.getForm().findField('nr_cont_5').disable();
						this.formPanel.getForm().findField('nr_cont_6').disable();
						<?php endif; ?>
					}
				} catch (e) {};
			}
		});
	},
	onDestroy: function() {
		MovimentacaoSaidaForm.superclass.onDestroy.apply(this, arguments);
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
			url: '<?php echo $this->url(array('controller' => 'movimentacao', 'action' => 'saida-save'), null, true); ?>',
			params: {
				id: this.maquina,
				cont_manual: this.cont_manual,
				nr_cont_1: this.formPanel.getForm().findField('nr_cont_1').getValue(),
				nr_cont_2: this.formPanel.getForm().findField('nr_cont_2').getValue(),
				nr_cont_3: this.formPanel.getForm().findField('nr_cont_3').getValue(),
				nr_cont_4: this.formPanel.getForm().findField('nr_cont_4').getValue(),
				nr_cont_5: this.formPanel.getForm().findField('nr_cont_5').getValue(),
				nr_cont_6: this.formPanel.getForm().findField('nr_cont_6').getValue(),
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