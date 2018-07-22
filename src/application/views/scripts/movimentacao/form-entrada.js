var MovimentacaoEntradaForm = Ext.extend(Ext.Window, {
	maquina: 0,
	cont_manual: 'N',
	naoEnvia: 'S',
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 370,
	height: 340,
	title: '<?php echo DMG_Translate::_('movimentacao-entrada.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	setMaquina: function(maquina) {
		this.maquina = maquina;
	},
	constructor: function() {
		this.addEvents({salvar: true});
		MovimentacaoEntradaForm.superclass.constructor.apply(this, arguments);
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
				fieldLabel: '<?php echo DMG_Translate::_('movimentacao-entrada.form.data.text'); ?>',
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
			<?php if (DMG_Acl::canAccess(61)): ?>
			new Ext.form.ComboBox({
				store: new Ext.data.JsonStore({
					url: '<?php echo $this->url(array('controller' => 'movimentacao', 'action' => 'filiais'), null, true); ?>',
					baseParams: {
						limit: 15,
					},
					root: 'data',
					fields: ['id', 'nome'],
				}),
				minChars: 0,
				editable: false,
				forceSelection: true,
				queryParam: 'filter[0][data][value]',
				hiddenName: 'id_filial',
				allowBlank: false,
				displayField: 'nome',
				valueField: 'id',
				mode: 'remote',
				triggerAction: 'all',
				emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
				fieldLabel: '<?php echo DMG_Translate::_('movimentacao-entrada.filial.text'); ?>',
				width: 190,
			}),
			<?php endif; ?>
			new Ext.form.ComboBox({
				store: new Ext.data.JsonStore({
					url: '<?php echo $this->url(array('controller' => 'local', 'action' => 'list'), null, true); ?>',
					baseParams: {
						dir: 'ASC',
						sort: 'nm_local',
						limit: 15,
						'filter[0][data][type]': 'string',
						'filter[0][field]': 'nm_local',
					},
					root: 'data',
					fields: ['id', 'nm_local'],
				}),
				minChars: 0,
				editable: false,
				forceSelection: true,
				queryParam: 'filter[0][data][value]',
				hiddenName: 'id_local',
				allowBlank: false,
				displayField: 'nm_local',
				valueField: 'id',
				mode: 'remote',
				triggerAction: 'all',
				emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
				fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.id_local.text'); ?>',
				listeners: {
					scope: this,
					select: function (a, b, c) {
						this.el.mask('<?php echo DMG_Translate::_('movimentacao.contadores.buscando'); ?>');
						var conn = new Ext.data.Connection();
						conn.request({
							url: '<?php echo $this->url(array('controller' => 'movimentacao', 'action' => 'contadores')); ?>',
							params: {
								id: this.maquina,
								local: b.data.id,
							},
							method: 'post',
							scope: this,
							callback: function (d, e, f) {
								this.el.unmask();
								try {
									var data = Ext.decode(f.responseText);
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
										this.naoEnvia = 'N';
									} else {
										//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', data.message);
										uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: data.message});
										<?php if (DMG_Acl::canAccess(60)): ?>
										this.formPanel.getForm().findField('nr_cont_1').enable();
										this.formPanel.getForm().findField('nr_cont_1').setValue('');
										this.formPanel.getForm().findField('nr_cont_2').enable();
										this.formPanel.getForm().findField('nr_cont_2').setValue('');
										this.formPanel.getForm().findField('nr_cont_3').enable();
										this.formPanel.getForm().findField('nr_cont_3').setValue('');
										this.formPanel.getForm().findField('nr_cont_4').enable();
										this.formPanel.getForm().findField('nr_cont_4').setValue('');
										this.formPanel.getForm().findField('nr_cont_5').enable();
										this.formPanel.getForm().findField('nr_cont_5').setValue('');
										this.formPanel.getForm().findField('nr_cont_6').enable();
										this.formPanel.getForm().findField('nr_cont_6').setValue('');
										this.cont_manual = 'S';
										this.naoEnvia = 'N';
										<?php else: ?>
										this.naoEnvia = 'S';
										return;
										<?php endif; ?>
									}
								} catch (g) {};
							}
						});
					}
				}
			}),
			new Ext.form.ComboBox({
				store: new Ext.data.JsonStore({
					url: '<?php echo $this->url(array('controller' => 'parceiro', 'action' => 'list'), null, true); ?>',
					baseParams: {
						dir: 'ASC',
						sort: 'nm_parceiro',
						limit: 15,
						'filter[0][data][type]': 'string',
						'filter[0][field]': 'nm_parceiro',
					},
					root: 'data',
					fields: ['id', 'nm_parceiro'],
				}),
				minChars: 0,
				editable: false,
				forceSelection: true,
				queryParam: 'filter[0][data][value]',
				hiddenName: 'id_parceiro',
				allowBlank: true,
				displayField: 'nm_parceiro',
				valueField: 'id',
				mode: 'remote',
				triggerAction: 'all',
				emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
				fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.id_parceiro.text'); ?>'
			}),
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
		MovimentacaoEntradaForm.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.getForm().reset();
		var dtnow = new Date();
		var dtnow_month = dtnow.getMonth()+1;
		if (dtnow_month < 10) {
			dtnow_month = '0' + dtnow_month;
		}
		var dtnow_day = dtnow.getDate();
		if (dtnow_day < 10) {
			dtnow_day = '0' + dtnow_day;
		}
		this.formPanel.getForm().findField('dt_movimentacao').setValue(dtnow.getFullYear() + '-' + dtnow_month + '-' + dtnow_day);
		this.formPanel.getForm().findField('minuto').setValue(dtnow.getMinutes());
		this.formPanel.getForm().findField('hora').setValue(dtnow.getHours());
		<?php if (!DMG_Acl::canAccess(61)): ?>
		this.formPanel.getForm().findField('id_filial').store.reload();
		<?php endif; ?>
		this.formPanel.getForm().findField('id_parceiro').store.reload();
		this.formPanel.getForm().findField('id_filial').store.reload();
		this.formPanel.getForm().findField('id_local').store.reload();		
		this.formPanel.getForm().load({
			url: '<?php echo $this->url(array('controller' => 'movimentacao', 'action' => 'get-maquina'), null, true); ?>',
			params: {
				id: this.maquina
			},
			scope: this,
			success: this._onFormLoad
		});
		MovimentacaoEntradaForm.superclass.show.apply(this, arguments);
	},
	_onFormLoad: function () {
		this.el.unmask();
	},
	onDestroy: function() {
		MovimentacaoEntradaForm.superclass.onDestroy.apply(this, arguments);
		this.formPanel = null;
	},
	_onBtnSalvarClick: function() {
		var form = this.formPanel.getForm();
		if(!form.isValid()) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('grid.form.alert.invalid'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('grid.form.alert.invalid'); ?>'});
			return false;
		}
		if (this.naoEnvia == 'S') {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('movimentacao-entrada.contadores.naoEnviar'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('movimentacao-entrada.contadores.naoEnviar'); ?>'});
			return false;
		}
		this.el.mask('<?php echo DMG_Translate::_('grid.form.saving'); ?>');
		form.submit({
			url: '<?php echo $this->url(array('controller' => 'movimentacao', 'action' => 'entrada-save'), null, true); ?>',
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
			scope: this,
			success: function() {
				this.el.unmask();
				this.hide();
				this.fireEvent('salvar', this);
			},
			failure: function (form, request) {
				this.el.unmask();
				//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', request.result.message);
				uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>'});
			}
		});
	},
	_onBtnCancelarClick: function() {
		this.hide();
	}
	
});