Ext.namespace('Faturamento');

Faturamento.preencheManualForm = Ext.extend(Ext.Window, {
	id:'FaturamentoPreencheManualForm',
	dados: [],
	record: null,
	docId: 0,
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	width: 583,
	height: 340,
	title: 'Preencher contadores manualmente',
	layout: 'fit',
	//closeAction: 'hide',
	setDocId: function (id) {
		this.docId = id;
	},
	setDados: function(dados) {
		this.dados = dados;
	},
	initComponent: function() {
		this.formPanel = new Ext.form.FormPanel({
			bodyStyle: 'padding:5px;',
			border: false,
			autoScroll: true,
			defaults: {anchor: '-19'},
			items: [{
				xtype: 'panel',
				id: 'nrMaquina_FaturamentoPreencheManualForm',
				border: false,
				html: '',
				style: 'padding: 5px 5px 10px 5px'
			},{
				xtype: 'panel',
				id: 'dt_cont_ant_lbl',
				border: false,
				html: '',
				style: 'padding: 5px 5px 10px 5px'
			},{
				layout: 'column',
				border: false,
				bodyStyle: 'margin-bottom: 10px; padding: 5px;',
				items: [{
					labelWidth: 80,
					columnWidth: .5,
					border: false,
					autoHeight: true,
					layout: 'form',
					items: [{
						xtype: 'panel', 
						html: '<?php echo DMG_Translate::_('parque.transformacao.contadores_anteriores'); ?>',
						border:false,
						style: 'font-weight: bold;padding-bottom:8px;'
					},{
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_1.text'); ?>', 
						xtype: 'textfield', 
						name: 'nr_cont_1', 
						disabled: true
					},{
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_2.text'); ?>', 
						xtype: 'textfield', 
						name: 'nr_cont_2', 
						disabled: true
					},{
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_3.text'); ?>', 
						xtype: 'textfield', 
						name: 'nr_cont_3', 
						disabled: true
					},{
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_4.text'); ?>', 
						xtype: 'textfield', 
						name: 'nr_cont_4', 
						disabled: true
					},{
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_5.text'); ?>', 
						xtype: 'textfield', 
						name: 'nr_cont_5', 
						disabled: true
					},{
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_6.text'); ?>', 
						xtype: 'textfield', 
						name: 'nr_cont_6', 
						disabled: true
					}]
				}, {
					labelWidth: 80,
					columnWidth: .5,
					border: false,
					autoHeight: true,
					layout: 'form',
					items: [{
						xtype: 'panel', 
						html: '<?php echo DMG_Translate::_('parque.transformacao.contadores_posteriores'); ?>', 
						border:false,
						style: 'font-weight: bold;padding-bottom:8px;'
					},{
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_1.text'); ?>', 
						xtype: 'textfield', 
						name: 'nr_cont_1_new',
						ref:'../../../nr_cont_1',
						allowBlank: false,
						listeners:{
							specialkey:function(owner,e){
								if (e.getKey() == 13){
									var form = Ext.getCmp('FaturamentoPreencheManualForm');
									form.nr_cont_2.focus(true);
								}
							}
						}
					},{
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_2.text'); ?>', 
						xtype: 'textfield', 
						name: 'nr_cont_2_new', 
						ref:'../../../nr_cont_2',
						allowBlank: false,
						listeners:{
							specialkey:function(owner,e){
								if (e.getKey() == 13){
									var form = Ext.getCmp('FaturamentoPreencheManualForm');
									form.nr_cont_3.focus(true);
								}
							}
						}
					},{
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_3.text'); ?>', 
						xtype: 'textfield', 
						name: 'nr_cont_3_new', 
						ref:'../../../nr_cont_3',
						allowBlank: false,
						listeners:{
							specialkey:function(owner,e){
								if (e.getKey() == 13){
									var form = Ext.getCmp('FaturamentoPreencheManualForm');
									form.nr_cont_4.focus(true);
								}
							}
						}
					},{
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_4.text'); ?>', 
						xtype: 'textfield', 
						name: 'nr_cont_4_new', 
						ref:'../../../nr_cont_4',
						allowBlank: false,
						listeners:{
							specialkey:function(owner,e){
								if (e.getKey() == 13){
									var form = Ext.getCmp('FaturamentoPreencheManualForm');
									form.nr_cont_5.focus(true);
								}
							}
						}
					},{
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_5.text'); ?>', 
						xtype: 'textfield', 
						name: 'nr_cont_5_new', 
						ref:'../../../nr_cont_5',
						allowBlank: true,
						listeners:{
							specialkey:function(owner,e){
								if (e.getKey() == 13){
									var form = Ext.getCmp('FaturamentoPreencheManualForm');
									form.nr_cont_6.focus(true);
								}
							}
						}
					},{
						fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_6.text'); ?>', 
						xtype: 'textfield', 
						name: 'nr_cont_6_new', 
						ref:'../../../nr_cont_6',
						allowBlank: true,
						listeners:{
							specialkey:function(owner,e){
								if (e.getKey() == 13){
									var form = Ext.getCmp('FaturamentoPreencheManualForm');
									form._onBtnSalvarClick();
								}
							}
						}
					}]
				}]
			}]
		});
		Ext.apply(this, {
			items: this.formPanel,
			bbar: ['->', {
				text: 'Salvar',
				iconCls: 'icon-save',
				scope: this,
				handler: this._onBtnSalvarClick
			}, {
				text: 'Cancelar',
				iconCls: 'silk-cross',
				scope: this,
				handler: function () {
					this.close();
				}
			}]
		});
		Faturamento.preencheManualForm.superclass.initComponent.call(this);
	},
	show: function () {
		this.formPanel.getForm().reset();
		
		var nrMaquina = Ext.getCmp('nrMaquina_FaturamentoPreencheManualForm');
		nrMaquina.html = '<h1 style="font-size:15px">' + Faturamento.num_serie + ': ' + this.dados.nr_serie + '</h1>';
		
		var dt = Date.parseDate(this.record.data.dt_ultimo_contador, "Y-m-d H:i:s");
		dt = dt.format("d/m/Y H:i \\h\\s");
		Ext.getCmp('dt_cont_ant_lbl').html = '<?php echo DMG_Translate::_('faturamento.offline.data_contadores'); ?>: ' + dt;
		Faturamento.preencheManualForm.superclass.show.apply(this, arguments);
		this.formPanel.getForm().setValues(this.dados);
	},
	onDestroy: function() {
		Faturamento.preencheManualForm.superclass.onDestroy.apply(this, arguments);
	},
	_onBtnSalvarClick: function() {
		var form = this.formPanel.getForm();
		if(!form.isValid()) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('grid.form.alert.invalid'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('grid.form.alert.invalid'); ?>'});
			return false;
		}
		this.params = form.getValues();
		Ext.apply(this.params, {
			id: this.docId,
			id_filial: this.dados.id_filial,
			id_parceiro: this.dados.id_parceiro,
			id_local: this.dados.id_local,
			id_moeda: this.dados.id_moeda,
			nr_serie: this.dados.nr_serie,
			dt_fatura: this.dados.dt_fatura,
			hora: this.dados.hora,
			minuto: this.dados.minuto
		});
		this.el.mask('<?php echo DMG_Translate::_('grid.form.saving'); ?>');
		form.submit({
			url: '<?php echo $this->url(array('controller' => 'faturamento2', 'action' => 'save-offline')); ?>',
			params: this.params,
			scope: this,
			success: function (a, b) {
				this.el.unmask();
				this.fireEvent('salvar', b.result, this.record);
				this.close();
			},
			failure: function (a, b) {
				this.el.unmask();
				if (b.result.message) {
					uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: b.result.message});
				} else {
					uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('faturamento.salvar-offline.erro'); ?>'});
				}
			},
		});
	}
});