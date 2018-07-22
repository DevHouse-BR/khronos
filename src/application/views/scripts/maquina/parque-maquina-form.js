var ParqueMaquinaForm = Ext.extend(Ext.Window, {
	maquina: 0,
	maximized: true,
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	title: '<?php echo DMG_Translate::_('parque.maquina.form.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	limpaContadores: function () {
		this.formPanel.getForm().findField('nr_cont_1').setValue('');
		this.formPanel.getForm().findField('nr_cont_2').setValue('');
		this.formPanel.getForm().findField('nr_cont_3').setValue('');
		this.formPanel.getForm().findField('nr_cont_4').setValue('');
		this.formPanel.getForm().findField('nr_cont_5').setValue('');
		this.formPanel.getForm().findField('nr_cont_6').setValue('');
		this.formPanel.getForm().findField('nr_cont_1_parcial').setValue('');
		this.formPanel.getForm().findField('nr_cont_2_parcial').setValue('');
		this.formPanel.getForm().findField('nr_cont_3_parcial').setValue('');
		this.formPanel.getForm().findField('nr_cont_4_parcial').setValue('');
		this.formPanel.getForm().findField('nr_cont_5_parcial').setValue('');
		this.formPanel.getForm().findField('nr_cont_6_parcial').setValue('');
	},
	setmaquina: function(maquina) {
		this.maquina = maquina;
	},
	constructor: function() {
		this.addEvents({salvar: true});
		ParqueMaquinaForm.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		this.formPanel = new Ext.form.FormPanel({
			layout: 'column',
			height: '100%',
			autoScroll: true,
			border: false,
			bodyStyle: 'padding: 5px',
			items: [{
				labelWidth: 120,
				columnWidth: .5,
				border: false,
				autoHeight: true,
				layout: 'form',
				items: [
					{
						layout: 'column',
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.dt_cadastro.text'); ?>',
						labelStyle: 'margin-top: 4px',
						border: false,
						items:[{
							labelAlign: 'top',
							layout: 'form',
							border: false,
							items: [new Ext.form.DateField({
								xtype: 'datetimefield',
								format: 'd/m/Y',
								editable: false,
								labelStyle: 'display: none',
								name: 'dt_cadastro' 
							})]
						},{
							labelAlign: 'top',
							layout: 'form',
							border: false,
							items: [new Ext.ux.form.SpinnerField({
								labelWidth: 40,
								width: 50,
								xtype: 'spinnerfield',
								labelStyle: 'display:none',
								name: 'hora',
								minValue: 0,
								maxValue: 23,
								decimalPrecision: 1,
								accelerate: true
							})]
						},{
							labelAlign: 'top',
							layout: 'form',
							border: false,
							width: '70px',
							items: [new Ext.ux.form.SpinnerField({
								labelWidth: 40,
								width: 50,
								xtype: 'spinnerfield',
								labelStyle: 'display:none',
								fieldStyle: 'width: 68px',
								name: 'minuto',
								minValue: 0,
								maxValue: 59,
								decimalPrecision: 1,
								accelerate: true,
							})]
						}]
					},
					new Ext.form.ComboBox({
						store: new Ext.data.JsonStore({
							url: '<?php echo $this->url(array('controller' => 'filial', 'action' => 'list'), null, true); ?>',
							baseParams: {
								dir: 'ASC',
								sort: 'nm_filial',
								limit: 15,
								'filter[0][data][type]': 'string',
								'filter[0][field]': 'nm_filial',
							},
							root: 'data',
							fields: ['id', 'nm_filial', 'nm_completo'],
						}),
						minChars: 0,
						width: 200,
						queryParam: 'filter[0][data][value]',
						hiddenName: 'id_filial',
						allowBlank: false,
						displayField: 'nm_completo',
						valueField: 'id',
						mode: 'remote',
						triggerAction: 'all',
						emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.id_filial.text'); ?>',
						listeners: {
							scope: this,
							select: function (a) {
								var val = a.getValue();
								this.formPanel.getForm().findField('id_parceiro').setValue('');
								this.formPanel.getForm().findField('id_parceiro').store.baseParams.id_filial = val;
								this.formPanel.getForm().findField('id_parceiro').store.reload();
							}
						}
					}),
					new Ext.form.ComboBox({
						store: new Ext.data.JsonStore({
							url: '<?php echo $this->url(array('controller' => 'parceiro', 'action' => 'list'), null, true); ?>',
							baseParams: {
								dir: 'ASC',
								limit: 15,
								id_filial: 0
							},
							root: 'data',
							fields: ['id', 'nm_parceiro'],
						}),
						width: 200,
						minChars: 0,
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
							change: this.limpaContadores
						}
					}),
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_serie_imob.text'); ?>', xtype: 'textfield', id: 'nr_serie_imob', name: 'nr_serie_imob', allowBlank: false, maxLength: 255},
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_serie_connect.text'); ?>', xtype: 'textfield', id: 'nr_serie_connect', name: 'nr_serie_connect', allowBlank: false, maxLength: 255, listeners: {scope: this, change: this.limpaContadores}},
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_serie_aux.text'); ?>', xtype: 'textfield', id: 'nr_serie_aux', name: 'nr_serie_aux', allowBlank: true, maxLength: 255},
					new Ext.form.ComboBox({
						store: new Ext.data.JsonStore({
							url: '<?php echo $this->url(array('controller' => 'jogo', 'action' => 'list'), null, true); ?>',
							baseParams: {
								dir: 'ASC',
								sort: 'nm_jogo',
								limit: 15,
								'filter[0][data][type]': 'string',
								'filter[0][field]': 'nm_jogo',
							},
							root: 'data',
							fields: ['id', 'nm_jogo'],
						}),
						minChars: 0,
						queryParam: 'filter[0][data][value]',
						hiddenName: 'id_jogo',
						allowBlank: false,
						displayField: 'nm_jogo',
						valueField: 'id',
						mode: 'remote',
						triggerAction: 'all',
						emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.id_jogo.text'); ?>'
					}),
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_versao_jogo.text'); ?>', xtype: 'textfield', id: 'nr_versao_jogo', name: 'nr_versao_jogo', allowBlank: false, maxLength: 255},
					new Ext.form.ComboBox({
						store: new Ext.data.JsonStore({
							url: '<?php echo $this->url(array('controller' => 'gabinete', 'action' => 'list'), null, true); ?>',
							baseParams: {
								dir: 'ASC',
								sort: 'nm_gabinete',
								limit: 15,
								'filter[0][data][type]': 'string',
								'filter[0][field]': 'nm_gabinete',
							},
							root: 'data',
							fields: ['id', 'nm_gabinete'],
						}),
						minChars: 0,
						queryParam: 'filter[0][data][value]',
						hiddenName: 'id_gabinete',
						allowBlank: false,
						displayField: 'nm_gabinete',
						valueField: 'id',
						mode: 'remote',
						triggerAction: 'all',
						emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.id_gabinete.text'); ?>'
					}),
					new Ext.form.ComboBox({
						store: new Ext.data.SimpleStore({
							fields: ['code', 'name'],
							data: [
<?php foreach (Doctrine::getTable('ScmMoeda')->findAll() as $k): ?>
								[<?php echo $k->id; ?>, '<?php echo $k->nm_moeda; ?>'],
<?php endforeach; ?>
							]
						}),
						hiddenName: 'id_moeda',
						allowBlank: false,
						displayField: 'name',
						valueField: 'code',
						mode: 'local',
						triggerAction: 'all',
						emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.id_moeda.text'); ?>'
					}),
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.vl_credito.text'); ?>', xtype: 'textfield', id: 'vl_credito', name: 'vl_credito', allowBlank: false, maxLength: 255},
					new Ext.form.ComboBox({
						store: new Ext.data.SimpleStore({
							fields: ['code', 'name'],
							data: [
<?php foreach (Doctrine::getTable('ScmProtocolo')->findAll() as $k): ?>
								[<?php echo $k->id; ?>, '<?php echo $k->nm_protocolo; ?>'],
<?php endforeach; ?>
							]
						}),
						hiddenName: 'id_protocolo',
						allowBlank: false,
						displayField: 'name',
						valueField: 'code',
						mode: 'local',
						triggerAction: 'all',
						emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.id_protocolo.text'); ?>',
						listeners: {
							scope: this,
							change: this.limpaContadores
						}
					}),
				]
			},{
				labelWidth: 140,
				columnWidth: .5,
				border: false,
				autoHeight: true,
				layout: 'form',
				items: [
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_1.text'); ?>', xtype: 'textfield', id: 'nr_cont_1', name: 'nr_cont_1', allowBlank: true, maxLength: 255, plugins: [new Ext.ux.Mask('########')]},
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_2.text'); ?>', xtype: 'textfield', id: 'nr_cont_2', name: 'nr_cont_2', allowBlank: true, maxLength: 255, plugins: [new Ext.ux.Mask('########')]},
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_3.text'); ?>', xtype: 'textfield', id: 'nr_cont_3', name: 'nr_cont_3', allowBlank: true, maxLength: 255, plugins: [new Ext.ux.Mask('########')]},
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_4.text'); ?>', xtype: 'textfield', id: 'nr_cont_4', name: 'nr_cont_4', allowBlank: true, maxLength: 255, plugins: [new Ext.ux.Mask('########')]},
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_5.text'); ?>', xtype: 'textfield', id: 'nr_cont_5', name: 'nr_cont_5', allowBlank: true, maxLength: 255, plugins: [new Ext.ux.Mask('########')]},
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_6.text'); ?>', xtype: 'textfield', id: 'nr_cont_6', name: 'nr_cont_6', allowBlank: true, maxLength: 255, plugins: [new Ext.ux.Mask('########')]},
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_1_parcial.text'); ?>', xtype: 'textfield', id: 'nr_cont_1_parcial', name: 'nr_cont_1_parcial', allowBlank: true, maxLength: 255, plugins: [new Ext.ux.Mask('########')]},
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_2_parcial.text'); ?>', xtype: 'textfield', id: 'nr_cont_2_parcial', name: 'nr_cont_2_parcial', allowBlank: true, maxLength: 255, plugins: [new Ext.ux.Mask('########')]},
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_3_parcial.text'); ?>', xtype: 'textfield', id: 'nr_cont_3_parcial', name: 'nr_cont_3_parcial', allowBlank: true, maxLength: 255, plugins: [new Ext.ux.Mask('########')]},
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_4_parcial.text'); ?>', xtype: 'textfield', id: 'nr_cont_4_parcial', name: 'nr_cont_4_parcial', allowBlank: true, maxLength: 255, plugins: [new Ext.ux.Mask('########')]},
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_5_parcial.text'); ?>', xtype: 'textfield', id: 'nr_cont_5_parcial', name: 'nr_cont_5_parcial', allowBlank: true, maxLength: 255, plugins: [new Ext.ux.Mask('########')]},
					{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_6_parcial.text'); ?>', xtype: 'textfield', id: 'nr_cont_6_parcial', name: 'nr_cont_6_parcial', allowBlank: true, maxLength: 255, plugins: [new Ext.ux.Mask('########')]},
					{
						id: 'busca_contadores',
						xtype: 'button',
 						text: '<?php echo DMG_Translate::_('parque.maquina.busca_contadores.text'); ?>',
						scope: this,
						handler: function () {
							uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title') ?>', '<?php echo DMG_Translate::_('parque.maquina.busca_contadores.message'); ?>', function (opt) {
								if (opt == 'yes') {
									var nr_serie = this.formPanel.getForm().findField('nr_serie_connect').getValue();
									if (nr_serie.length == 0) {
										//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('parque.maquina.busca_contadores.preencha-nr_serie'); ?>');
										uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('parque.maquina.busca_contadores.preencha-nr_serie'); ?>'});
										return;
									}
									var local = this.formPanel.getForm().findField('id_local').getValue();
									if (local.length == 0) {
										//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('parque.maquina.busca_contadores.preencha-local'); ?>');
										uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('parque.maquina.busca_contadores.preencha-local'); ?>'});
										return;
									}
									var protocolo = this.formPanel.getForm().findField('id_protocolo').getValue();
									if (protocolo.length == 0) {
										//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('parque.maquina.busca_contadores.preencha-protocolo'); ?>');
										uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('parque.maquina.busca_contadores.preencha-protocolo'); ?>'});
										return;
									}
									this.el.mask('<?php echo DMG_Translate::_('i18n.loading'); ?>');
									var conn = new Ext.data.Connection();
									conn.request({
										url: '<?php echo $this->url(array('controller' => 'maquina', 'action' => 'contadores')); ?>',
										scope: this,
										params: {
											nr_serie: nr_serie,
											local: local,
											protocolo: protocolo
										},
										callback: function (a, b, c) {
											try {
												this.el.unmask();
												var data = Ext.decode(c.responseText);
												if (data.success) {
													this.formPanel.getForm().findField('nr_cont_1').setValue(data.nr_cont_1);
													this.formPanel.getForm().findField('nr_cont_2').setValue(data.nr_cont_2);
													this.formPanel.getForm().findField('nr_cont_3').setValue(data.nr_cont_3);
													this.formPanel.getForm().findField('nr_cont_4').setValue(data.nr_cont_4);
													this.formPanel.getForm().findField('nr_cont_5').setValue(data.nr_cont_5);
													this.formPanel.getForm().findField('nr_cont_6').setValue(data.nr_cont_6);
													this.formPanel.getForm().findField('nr_cont_1_parcial').setValue(data.nr_cont_1_parcial);
													this.formPanel.getForm().findField('nr_cont_2_parcial').setValue(data.nr_cont_2_parcial);
													this.formPanel.getForm().findField('nr_cont_3_parcial').setValue(data.nr_cont_3_parcial);
													this.formPanel.getForm().findField('nr_cont_4_parcial').setValue(data.nr_cont_4_parcial);
													this.formPanel.getForm().findField('nr_cont_5_parcial').setValue(data.nr_cont_5_parcial);
													this.formPanel.getForm().findField('nr_cont_6_parcial').setValue(data.nr_cont_6_parcial);
													this.formPanel.getForm().findField('nr_cont_1').enable();
													this.formPanel.getForm().findField('nr_cont_2').enable();
													this.formPanel.getForm().findField('nr_cont_3').enable();
													this.formPanel.getForm().findField('nr_cont_4').enable();
													this.formPanel.getForm().findField('nr_cont_5').enable();
													this.formPanel.getForm().findField('nr_cont_6').enable();
													this.formPanel.getForm().findField('nr_cont_1_parcial').enable();
													this.formPanel.getForm().findField('nr_cont_2_parcial').enable();
													this.formPanel.getForm().findField('nr_cont_3_parcial').enable();
													this.formPanel.getForm().findField('nr_cont_4_parcial').enable();
													this.formPanel.getForm().findField('nr_cont_5_parcial').enable();
													this.formPanel.getForm().findField('nr_cont_6_parcial').enable();
												} else {
													this.formPanel.getForm().findField('nr_cont_1').setValue('');
													this.formPanel.getForm().findField('nr_cont_2').setValue('');
													this.formPanel.getForm().findField('nr_cont_3').setValue('');
													this.formPanel.getForm().findField('nr_cont_4').setValue('');
													this.formPanel.getForm().findField('nr_cont_5').setValue('');
													this.formPanel.getForm().findField('nr_cont_6').setValue('');
													this.formPanel.getForm().findField('nr_cont_1_parcial').setValue('');
													this.formPanel.getForm().findField('nr_cont_2_parcial').setValue('');
													this.formPanel.getForm().findField('nr_cont_3_parcial').setValue('');
													this.formPanel.getForm().findField('nr_cont_4_parcial').setValue('');
													this.formPanel.getForm().findField('nr_cont_5_parcial').setValue('');
													this.formPanel.getForm().findField('nr_cont_6_parcial').setValue('');
													if (data.erro == true) {
														//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', data.message);
														uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: data.message});
													}
													<?php if (DMG_Acl::canAccess(67)): ?>
														this.formPanel.getForm().findField('nr_cont_1').enable();
														this.formPanel.getForm().findField('nr_cont_2').enable();
														this.formPanel.getForm().findField('nr_cont_3').enable();
														this.formPanel.getForm().findField('nr_cont_4').enable();
														this.formPanel.getForm().findField('nr_cont_5').enable();
														this.formPanel.getForm().findField('nr_cont_6').enable();
														this.formPanel.getForm().findField('nr_cont_1_parcial').enable();
														this.formPanel.getForm().findField('nr_cont_2_parcial').enable();
														this.formPanel.getForm().findField('nr_cont_3_parcial').enable();
														this.formPanel.getForm().findField('nr_cont_4_parcial').enable();
														this.formPanel.getForm().findField('nr_cont_5_parcial').enable();
														this.formPanel.getForm().findField('nr_cont_6_parcial').enable();
													<?php else: ?>
														this.formPanel.getForm().findField('nr_cont_1').disable();
														this.formPanel.getForm().findField('nr_cont_2').disable();
														this.formPanel.getForm().findField('nr_cont_3').disable();
														this.formPanel.getForm().findField('nr_cont_4').disable();
														this.formPanel.getForm().findField('nr_cont_5').disable();
														this.formPanel.getForm().findField('nr_cont_6').disable();
														this.formPanel.getForm().findField('nr_cont_1_parcial').disable();
														this.formPanel.getForm().findField('nr_cont_2_parcial').disable();
														this.formPanel.getForm().findField('nr_cont_3_parcial').disable();
														this.formPanel.getForm().findField('nr_cont_4_parcial').disable();
														this.formPanel.getForm().findField('nr_cont_5_parcial').disable();
														this.formPanel.getForm().findField('nr_cont_6_parcial').disable();
													<?php endif; ?>
												}
												return;
											} catch (e) {};
										}
									});
								}
							}, this);
						}
					}
				]
			}]
		});
		Ext.apply(this, {
			items: this.formPanel,
			bbar: [
				'->',
				{text: '<?php echo DMG_Translate::_('grid.form.save'); ?>', iconCls: 'icon-save',scope: this,handler: this._onBtnSalvarClick},
				{text: '<?php echo DMG_Translate::_('grid.form.cancel'); ?>', iconCls: 'silk-cross', scope: this, handler: this._onBtnCancelarClick}
			]
		});
		ParqueMaquinaForm.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.getForm().reset();
		ParqueMaquinaForm.superclass.show.apply(this, arguments);
		this.formPanel.getForm().findField('id_gabinete').store.reload();
		this.formPanel.getForm().findField('id_jogo').store.reload();
		this.formPanel.getForm().findField('id_filial').store.reload();
		this.formPanel.getForm().findField('id_local').store.reload();
		this.formPanel.getForm().findField('id_parceiro').store.reload();
		if(this.maquina !== 0) {
			this.formPanel.getForm().findField('nr_cont_1').disable();
			this.formPanel.getForm().findField('nr_cont_2').disable();
			this.formPanel.getForm().findField('nr_cont_3').disable();
			this.formPanel.getForm().findField('nr_cont_4').disable();
			this.formPanel.getForm().findField('nr_cont_5').disable();
			this.formPanel.getForm().findField('nr_cont_6').disable();
			this.formPanel.getForm().findField('nr_cont_1_parcial').disable();
			this.formPanel.getForm().findField('nr_cont_2_parcial').disable();
			this.formPanel.getForm().findField('nr_cont_3_parcial').disable();
			this.formPanel.getForm().findField('nr_cont_4_parcial').disable();
			this.formPanel.getForm().findField('nr_cont_5_parcial').disable();
			this.formPanel.getForm().findField('nr_cont_6_parcial').disable();
			this.formPanel.findById('busca_contadores').disable();
			this.formPanel.getForm().findField('nr_serie_imob').disable();
			this.formPanel.getForm().findField('dt_cadastro').disable();
			this.formPanel.getForm().findField('hora').disable();
			this.formPanel.getForm().findField('minuto').disable();
			this.formPanel.getForm().findField('hora').disable();
			this.formPanel.getForm().findField('minuto').disable();
			this.formPanel.getForm().findField('id_local').disable();
			this.formPanel.getForm().findField('id_moeda').disable();
			this.formPanel.getForm().findField('id_jogo').disable();
			this.formPanel.getForm().findField('id_filial').disable();
			this.formPanel.getForm().findField('id_parceiro').disable();
			this.formPanel.getForm().findField('nr_versao_jogo').disable();
			this.formPanel.getForm().findField('vl_credito').disable();
			this.formPanel.getForm().findField('id_gabinete').disable();
			this.el.mask('<?php echo DMG_Translate::_('grid.form.loading'); ?>');
			this.formPanel.getForm().load({
				url: '<?php echo $this->url(array('controller' => 'maquina', 'action' => 'get'), null, true); ?>',
				params: {
					id: this.maquina
				},
				scope: this,
				success: this._onFormLoad
			});
		} else {
			<?php if (DMG_Acl::canAccess(67)): ?>
			this.formPanel.getForm().findField('nr_cont_1').enable();
			this.formPanel.getForm().findField('nr_cont_2').enable();
			this.formPanel.getForm().findField('nr_cont_3').enable();
			this.formPanel.getForm().findField('nr_cont_4').enable();
			this.formPanel.getForm().findField('nr_cont_5').enable();
			this.formPanel.getForm().findField('nr_cont_6').enable();
			this.formPanel.getForm().findField('nr_cont_1_parcial').enable();
			this.formPanel.getForm().findField('nr_cont_2_parcial').enable();
			this.formPanel.getForm().findField('nr_cont_3_parcial').enable();
			this.formPanel.getForm().findField('nr_cont_4_parcial').enable();
			this.formPanel.getForm().findField('nr_cont_5_parcial').enable();
			this.formPanel.getForm().findField('nr_cont_6_parcial').enable();
			<?php else: ?>
			this.formPanel.getForm().findField('nr_cont_1').disable();
			this.formPanel.getForm().findField('nr_cont_2').disable();
			this.formPanel.getForm().findField('nr_cont_3').disable();
			this.formPanel.getForm().findField('nr_cont_4').disable();
			this.formPanel.getForm().findField('nr_cont_5').disable();
			this.formPanel.getForm().findField('nr_cont_6').disable();
			this.formPanel.getForm().findField('nr_cont_1_parcial').disable();
			this.formPanel.getForm().findField('nr_cont_2_parcial').disable();
			this.formPanel.getForm().findField('nr_cont_3_parcial').disable();
			this.formPanel.getForm().findField('nr_cont_4_parcial').disable();
			this.formPanel.getForm().findField('nr_cont_5_parcial').disable();
			this.formPanel.getForm().findField('nr_cont_6_parcial').disable();
			<?php endif; ?>
			this.formPanel.findById('busca_contadores').enable();
			var dtnow = new Date();
			var dtnow_month = dtnow.getMonth()+1;
			if (dtnow_month < 10) {
				dtnow_month = '0' + dtnow_month;
			}
			var dtnow_day = dtnow.getDate();
			if (dtnow_day < 10) {
				dtnow_day = '0' + dtnow_day;
			}
			this.formPanel.getForm().findField('dt_cadastro').setValue(dtnow.getFullYear() + '-' + dtnow_month + '-' + dtnow_day);
			this.formPanel.getForm().findField('minuto').setValue(dtnow.getMinutes());
			this.formPanel.getForm().findField('hora').setValue(dtnow.getHours());
			this.formPanel.getForm().findField('nr_serie_imob').enable();
			this.formPanel.getForm().findField('dt_cadastro').enable();
			this.formPanel.getForm().findField('hora').enable();
			this.formPanel.getForm().findField('minuto').enable();
			this.formPanel.getForm().findField('hora').enable();
			this.formPanel.getForm().findField('minuto').enable();
			this.formPanel.getForm().findField('id_moeda').enable();
			this.formPanel.getForm().findField('id_local').enable();
			this.formPanel.getForm().findField('id_jogo').enable();
			this.formPanel.getForm().findField('id_filial').enable();
			this.formPanel.getForm().findField('id_parceiro').enable();
			this.formPanel.getForm().findField('nr_versao_jogo').enable();
			this.formPanel.getForm().findField('vl_credito').enable();
			this.formPanel.getForm().findField('id_gabinete').enable();
		}
	},
	onDestroy: function() {
		ParqueMaquinaForm.superclass.onDestroy.apply(this, arguments);
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
			url: '<?php echo $this->url(array('controller' => 'maquina', 'action' => 'save'), null, true); ?>',
			params: {
				id: this.maquina,
				nr_cont_1: this.formPanel.getForm().findField('nr_cont_1').getValue(),
				nr_cont_2: this.formPanel.getForm().findField('nr_cont_2').getValue(),
				nr_cont_3: this.formPanel.getForm().findField('nr_cont_3').getValue(),
				nr_cont_4: this.formPanel.getForm().findField('nr_cont_4').getValue(),
				nr_cont_5: this.formPanel.getForm().findField('nr_cont_5').getValue(),
				nr_cont_6: this.formPanel.getForm().findField('nr_cont_6').getValue(),
				nr_cont_1_parcial: this.formPanel.getForm().findField('nr_cont_1_parcial').getValue(),
				nr_cont_2_parcial: this.formPanel.getForm().findField('nr_cont_2_parcial').getValue(),
				nr_cont_3_parcial: this.formPanel.getForm().findField('nr_cont_3_parcial').getValue(),
				nr_cont_4_parcial: this.formPanel.getForm().findField('nr_cont_4_parcial').getValue(),
				nr_cont_5_parcial: this.formPanel.getForm().findField('nr_cont_5_parcial').getValue(),
				nr_cont_6_parcial: this.formPanel.getForm().findField('nr_cont_6_parcial').getValue(),
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