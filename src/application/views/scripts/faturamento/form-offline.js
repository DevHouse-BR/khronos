Ext.namespace('Faturamento');

Faturamento.local = '<?php echo DMG_Translate::_('parque.maquina.form.id_local.text'); ?>';
Faturamento.empresa_filial = '<?php echo DMG_Translate::_('movimentacao-entrada.filial.text'); ?>';
Faturamento.parceiro = '<?php echo DMG_Translate::_('parque.maquina.form.id_parceiro.text'); ?>';
Faturamento.moeda = '<?php echo DMG_Translate::_('parque.maquina.form.id_moeda.text'); ?>';
Faturamento.maquinas_instaladas = '<?php echo DMG_Translate::_('faturamento.maquinas_instaladas'); ?>';
Faturamento.maquinas_faturar = '<?php echo DMG_Translate::_('faturamento.maquinas_faturar'); ?>';
Faturamento.num_serie = '<?php echo DMG_Translate::_('window.portal.nr_serie'); ?>';
Faturamento.jogo = '<?php echo DMG_Translate::_('parque.maquina.form.id_jogo.text'); ?>';
Faturamento.excecao = '<?php echo DMG_Translate::_('faturamento.excecao'); ?>';
Faturamento.total_bruto = '<?php echo DMG_Translate::_('faturamento.total_bruto'); ?>';
Faturamento.pagamento_manual = '<?php echo DMG_Translate::_('faturamento.pagamento_manual'); ?>';
Faturamento.perc_local = '<?php echo DMG_Translate::_('faturamento.perc_local'); ?>';
Faturamento.total_local = '<?php echo DMG_Translate::_('faturamento.total_local'); ?>';
Faturamento.total_oper = '<?php echo DMG_Translate::_('faturamento.total_oper'); ?>';
Faturamento.confirmar_fatura = '<?php echo DMG_Translate::_('faturamento.confirmar_fatura'); ?>';
Faturamento.total_pgmanual = '<?php echo DMG_Translate::_('faturamento.total_pgmanual'); ?>';
Faturamento.total_operadora = '<?php echo DMG_Translate::_('faturamento.total_operadora'); ?>';
Faturamento.cancelar_fatura = '<?php echo DMG_Translate::_('faturamento.cancelar_fatura'); ?>';
Faturamento.credito = '<?php echo DMG_Translate::_('faturamento.vl_credito'); ?>';

var FaturamentoFormOffline = Ext.extend(Ext.Panel, {
	id: 'FaturamentoFormOffline',
	docId: 0,
	height:500,
	layout: {
		type: 'vbox',
		padding: '5',
		align: 'stretch'
	},
	bodyStyle: 'padding:5px',
	defaults: {
		border: false
	},
	listeners:{
		afterrender: function(painel){
			/**
			 * CÓDIGO PARA EDIÇÃO DE FATURA MANUAL
			 * Autor: Leonardo 21/06/2010
			 */
			if(painel.docId > 0){
				//this.loadFatura();
				this.el.mask('<?php echo DMG_Translate::_('i18n.loading'); ?>');
				var task = new Ext.util.DelayedTask(function(){ Ext.getCmp('FaturamentoFormOffline').loadFatura(); }).delay(5000);
			}
		},
		beforeclose: function(painel){
			if(painel.docId > 0){
				this.fechaAba();
				return false;
			}
		}
	},
	clearTitulos: function () {
		Ext.getCmp('lbl_valor_fatura_offline').setText('');
	},
	limpaGrids: function () {
		//Ext.getCmp('gridFaturamento1').store.reload();
		Ext.getCmp('buscaFaturamentoField-offline').reset();
		Ext.getCmp('buscaFaturamentoField-offline').triggers[0].hide(); 
		this.primeiraGridStore.baseParams.nr_serie_imob = "";
		Ext.getCmp('gridFaturamento2-offline').store.removeAll();
	},
	recalcularFatura: function () {
		uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('faturamento.recalcular_confirm'); ?>', function (o) {
			if (o == 'yes') {
				var selecionados = new Array();
				for (var i = 0; i < this.segundaGrid.store.data.items.length; i++) {
					selecionados.push(this.segundaGrid.store.data.items[i].data.nr_serie);
				}
				if (selecionados.length == 0) {
					uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('faturamento.calcula_selecione_maquinas'); ?>'});
					return;
				}
				this.el.mask('<?php echo DMG_Translate::_('faturamento.calculando'); ?>');
				this.segundaGridStore.proxy.setUrl('<?php echo $this->url(array('controller' => 'faturamento', 'action' => 'list-grid')); ?>');
				Ext.getCmp('gridFaturamento2-offline').store.baseParams = {
					id_local: this.comboLocais.getValue(),
					id_parceiro: this.comboParceiro.getValue(),
					id_moeda: this.comboMoedas.getValue(),
					id_filial: this.comboFilial.getValue(),
					'maquina[]': selecionados
				};
				Ext.getCmp('gridFaturamento2-offline').store.reload();
				Ext.getCmp('gridFaturamento2-offline').store.sort('id_excecao', 'ASC');
			}
		}, this);
	},
	beforeSelectCombo: function (combo, record) {
		if (combo.getValue() == "") {
			return true;
		} else {
			if (Ext.getCmp('comboMoedasFaturamento-offline').getValue() != "" && Ext.getCmp('comboFilialFaturamento-offline').getValue() != "" && Ext.getCmp('comboLocalFaturamento-offline').getValue() != "" && combo.ownerCt.ownerCt.ownerCt.docId != 0) {
				uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('faturamento.reload_perder_dados'); ?>', function (o) {
					if (o == 'yes') {
						this.fireEvent('select', combo, record);
					}
				}, this);
				return false;
			} else {
				return true;
			}
		}
	},
	selectCombo: function (combo, record) {
		combo.setValue(record.id);
		if (Ext.getCmp('comboMoedasFaturamento-offline').getValue() != "" && Ext.getCmp('comboFilialFaturamento-offline').getValue() != "" && Ext.getCmp('comboLocalFaturamento-offline').getValue() != "") {
			Ext.getCmp('gridFaturamento1-offline').store.reload();
		}
	},
	initComponent: function() {
		var _this = this;
		this.comboLocais = new Ext.form.ComboBox({
			id: 'comboLocalFaturamento-offline',
			fieldLabel: Faturamento.local,
			name: 'local',
			minChars: 3,
			typeAhead: true,
			store: new Ext.data.JsonStore({
				autoLoad:true,
				url: '<?php echo $this->url(array('controller' => 'faturamento2', 'action' => 'combo-local')); ?>',
				root: 'data',
				fields: ['id', 'nm_local']
			}),
			mode: 'remote',
			width: 200,
			triggerAction: 'all',
			displayField: 'nm_local',
			valueField: 'id',
			forceSelection: true,
			listeners: {
				//beforeselect: _this.beforeSelectCombo,
				select: _this.selectCombo
			}
		});
		this.comboFilial = new Ext.form.ComboBox({
			name: 'filial',
			id: 'comboFilialFaturamento-offline',
			fieldLabel: Faturamento.empresa_filial,
			minChars: 3,
			typeAhead: true,
			autoSelect: true,
			store: new Ext.data.JsonStore({
				autoLoad:true,
				url: '<?php echo $this->url(array('controller' => 'faturamento2', 'action' => 'combo-filial')); ?>',
				root: 'data',
				fields: ['id', 'nm_completo']
			}),
			mode: 'remote',
			width: 200,
			triggerAction: 'all',
			displayField: 'nm_completo',
			valueField: 'id',
			forceSelection: true,
			listeners: {
				//beforeselect: _this.beforeSelectCombo,
				select: _this.selectCombo
			}
		});
		this.comboParceiro = new Ext.form.ComboBox({
			id: 'comboParceiroFaturamento-offline',
			store: new Ext.data.JsonStore({
				autoLoad:true,
				url: '<?php echo $this->url(array('controller' => 'faturamento2', 'action' => 'combo-parceiro')); ?>',
				root: 'data',
				fields: ['id', 'nm_parceiro']
			}),
			width: 200,
			minChars: 3,
			typeAhead: true,
			hiddenName: 'id_parceiro',
			allowBlank: true,
			displayField: 'nm_parceiro',
			valueField: 'id',
			mode: 'remote',
			fieldLabel: Faturamento.parceiro,
			triggerAction: 'all',
			listeners: {
				//beforeselect: _this.beforeSelectCombo,
				select: _this.selectCombo
			}
		});
		this.comboMoedas = new Ext.form.ComboBox({
			name: 'moeda',
			id: 'comboMoedasFaturamento-offline',
			fieldLabel: Faturamento.moeda,
			minChars: 3,
			typeAhead: true,
			autoSelect: true,
			store: new Ext.data.JsonStore({
				autoLoad:true,
				url: '<?php echo $this->url(array('controller' => 'faturamento2', 'action' => 'combo-moeda')); ?>',
				root: 'data',
				fields: ['id', 'nm_moeda']
			}),
			mode: 'remote',
			width: 200,
			triggerAction: 'all',
			displayField: 'nm_moeda',
			valueField: 'id',
			forceSelection: true,
			listeners: {
				//beforeselect: _this.beforeSelectCombo,
				select: _this.selectCombo
			}
		});
		this.form = new Ext.form.FormPanel({
			border: false,
			width: 330,
			height: 106,
			items: [this.comboLocais, this.comboFilial, this.comboParceiro, this.comboMoedas]
		});
		
		
		var _now = new Date();
		this.previewsDate = _now;

		this.dt_fatura = new Ext.form.Hidden({
			name: 'dt_fatura',
			value: _now.format('d/m/Y')
		});
		
		this.hora = new Ext.form.Hidden({
			name: 'hora',
			value: _now.getHours()
		});
		
		this.minuto = new Ext.form.Hidden({
			name: 'minuto',
			value: _now.getMinutes()
		});
		
		this.btnAjusteData = new Ext.Button({
			text:'<?php echo DMG_Translate::_('faturamento.ajuste.data'); ?>',
			handler: function(botao, evento){
				var form = Ext.getCmp('FaturamentoFormOffline');

				var window = new Ext.Window({
					id:'windowDataFaturamento',
					title:'<?php echo DMG_Translate::_('faturamento.ajuste.data'); ?>',
					width:300,
					height:120,
					bodyStyle:'padding:5px',
					modal:true,
					layout:'hbox',
					layoutConfig: {
						align:'stretch'
					},
					items:[{
						flex:2,
						xtype: 'datefield',
						format: 'd/m/Y',
						editable: false,
						labelStyle: 'display: none',
						ref:'../data',
						value: form.dt_fatura.getValue()
					},{
						flex:1,
						xtype: 'spinnerfield',
						minValue: 0,
						maxValue: 23,
						decimalPrecision: 1,
						accelerate: true,
						ref:'../hora',
						value: form.hora.getValue()
					},{
						flex:1,
						xtype: 'spinnerfield',
						minValue: 0,
						maxValue: 59,
						decimalPrecision: 1,
						accelerate: true,
						ref:'../minuto',
						value: form.minuto.getValue()
					}],
					buttons:[{
						text:'<?php echo DMG_Translate::_('faturamento.continuar'); ?>',
						handler:function(botao,evento){
							var window = Ext.getCmp('windowDataFaturamento');
							var form = Ext.getCmp('FaturamentoFormOffline');
							
							var d = form.dt_fatura.getValue().split('/');
							d = d[1] + "/" + d[0] + "/" + d[2];
							
							form.previewsDate = new Date(d + ' ' + form.hora.getValue() + ':' + form.minuto.getValue());
							
							form.dt_fatura.setValue(window.data.getValue().format('d/m/Y'));
							form.hora.setValue(window.hora.getValue());
							form.minuto.setValue(window.minuto.getValue());
							Ext.getCmp('lbl_data_fatura_offline').setText(window.data.getValue().format('d/m/Y') + ' ' + window.hora.getValue() + ':' + window.minuto.getValue() + ' hs');
							
							if(form.docId > 0)
								form.loadFaturaNovaData();
							else
								form.primeiraGridStore.reload();
								
							window.close();
						}
					},{
						text:'<?php echo DMG_Translate::_('faturamento.cancelar'); ?>',
						handler:function(botao, evento){
							Ext.getCmp('windowDataFaturamento').close();
						}
					}]
				});
				window.show();			
			}
		});

		this.totais = new Ext.form.FormPanel({
			border: false,
			width:400,
			items:[{
				fieldLabel: '<?php echo DMG_Translate::_('faturamento.window.dt_fatura.text'); ?>',
				layout:'hbox',
				border:false,
				items:[this.dt_fatura, this.hora, this.minuto,{
					xtype: 'label',
					width:150,
					id: 'lbl_data_fatura_offline',
					text: _now.format('d/m/Y H:i \\h\\s')
				}, this.btnAjusteData]
			},{
				xtype: 'label',
				id: 'lbl_valor_fatura_offline',
				style: 'display: block; font-size: 16px',
				text: ''
			}]
		});
		
		
		
		this.fields = [
			{name: 'id', type: 'int'},
			{name: 'nr_serie', type: 'string'},
			{name: 'nm_jogo', type: 'string'},
			{name: 'excecao', type: 'string'},
			{name: 'total_bruto', type: 'string'},
			{name: 'pago_manual', type: 'string'},
			{name: 'percent_local', type: 'int'},
			{name: 'total_local', type: 'string'},
			{name: 'total_operadora', type: 'string'},
			{name: 'id_excecao', type: 'int'},
			{name: 'vl_credito', type: 'string'},
			{name: 'nr_cont_1', type: 'int'},
			{name: 'nr_cont_2', type: 'int'},
			{name: 'nr_cont_3', type: 'int'},
			{name: 'nr_cont_4', type: 'int'},
			{name: 'nr_cont_5', type: 'int'},
			{name: 'nr_cont_6', type: 'int'},
			{name: 'nr_cont_1_new', type: 'int'},
			{name: 'nr_cont_2_new', type: 'int'},
			{name: 'nr_cont_3_new', type: 'int'},
			{name: 'nr_cont_4_new', type: 'int'},
			{name: 'nr_cont_5_new', type: 'int'},
			{name: 'nr_cont_6_new', type: 'int'},
			{name: 'canmove', type: 'int'},
			{name: 'em_temporaria', type: 'int'},
			{name: 'dt_ultimo_contador', type: 'string'}
		];
		
		this.primeiraGridStore = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'faturamento2', 'action' => 'maquinas')); ?>',
			root: 'data',
			idProperty: 'id',
			totalProperty: 'total',
			autoLoad: true,
			autoDestroy: true,
			fields: this.fields,
			listeners: {
				scope: this,
				exception: function(a, b, c, d){
					try {
						this.el.unmask();
						uiHelper.showMessageBox({msg: d.reader.jsonData.message, title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>'});
					} catch (e) {};
				},
				beforeLoad: function(){
					if (Ext.getCmp('comboMoedasFaturamento-offline').getValue() != "" && Ext.getCmp('comboFilialFaturamento-offline').getValue() != "" && Ext.getCmp('comboLocalFaturamento-offline').getValue() != "") {
						this.docId = 0;
						this.primeiraGridStore.baseParams.id_local = this.comboLocais.getValue();
						this.primeiraGridStore.baseParams.id_parceiro = this.comboParceiro.getValue();
						this.primeiraGridStore.baseParams.id_moeda = this.comboMoedas.getValue();
						this.primeiraGridStore.baseParams.id_filial = this.comboFilial.getValue();
						this.primeiraGridStore.baseParams.dt_fatura = this.dt_fatura.value;
						this.primeiraGridStore.baseParams.hora = this.hora.getValue();
						this.primeiraGridStore.baseParams.minuto = this.minuto.getValue();
						this.primeiraGridStore.removeAll();
						this.segundaGridStore.removeAll();
					} else {
						return false;
					}
				},
				load: function (store, records, options) {
					try {
						if (store.reader.jsonData.success == true && store.reader.jsonData.message != null) {
							<?php if (DMG_Acl::canAccess(85)): ?>
							/*uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('faturamento.carregamento.fatura.nao.confirmada'); ?>'});
							Ext.getCmp('FaturamentoFormOffline').docId = store.reader.jsonData.id;
							store.removeAll();
							Ext.getCmp('FaturamentoFormOffline').loadFatura();
							return;
							uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', store.reader.jsonData.message, function (o) {
								if (o == 'yes') {
									this.el.mask('<?php echo DMG_Translate::_('i18n.loading'); ?>');
									var conn = new Ext.data.Connection();
									conn.request({
										url: '<?php echo $this->url(array('controller' => 'faturamento', 'action' => 'delete-temp')); ?>',
										params: {
											id: store.reader.jsonData.id
										},
										scope: this,
										callback: function () {
											this.el.unmask();
										}
									});
								} else {
									this.docId = 0;
									this.primeiraGridStore.removeAll();
									this.segundaGridStore.removeAll();
								}
							}, this);*/
							<?php else: ?>
							uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('faturamento.delete_temp.sem_permissao'); ?>'});
							this.primeiraGridStore.removeAll();
							this.segundaGridStore.removeAll();
							this.docId = 0;
							<?php endif; ?>
						}
						if(records.length > 0){
							var selecionados = new Array();
							for(i = 0; i < records.length; i++){
								var index = this.segundaGridStore.find("id", records[i].data.id);
								if(index != -1){
									selecionados.push(records[i].data.id);
								}
							}
							for(i = 0; i < selecionados.length; i++){
								var reg = store.getById(selecionados[i]);
								store.remove(reg);
							}
						}
					} catch (e) {alert(e);};
				}
			}
		});
		this.primeiraGrid = new Ext.grid.GridPanel({
			title: Faturamento.maquinas_instaladas,
			flex:1,
			id:'gridFaturamento1-offline',
			ddGroup: 'secondGridDDGroup-offline',
			store: this.primeiraGridStore,
			view: new Ext.grid.GridView({
				getRowClass : function (row, index) {
					var cls = '';
					var data = row.data;
					if(data.canmove != 1) {
						cls = 'fatura-nao-move';
					}
					if(data.em_temporaria == 1)
						cls = 'fatura-em_temporaria';
					return cls;
				} 
			}),
			columns: [{
				dataIndex: 'nr_serie',
				header: Faturamento.num_serie
			},{
				dataIndex: 'nm_jogo',
				header: Faturamento.jogo
			}],
			stripeRows: true,
			tbar:{
				layout:'fit',
	        	items:[
					new Ext.ux.form.SearchField({
						id:'buscaFaturamentoField-offline',
						store: this.primeiraGridStore,
						paramName: 'nr_serie_imob'
					})
	        	]
	        }
		});
		this.segundaGridStore = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'faturamento2', 'action' => 'list-grid')); ?>',
			root: 'data',
			idProperty: 'id',
			fields: this.fields,
			listeners: {
				scope: this,
				load: function (a) {
					this.el.unmask();
					try {
						if (a.reader.jsonData.message && a.reader.jsonData.message.length > 0) {
							uiHelper.showMessageBox({msg: a.reader.jsonData.message, title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>'});
						} else {
							Ext.getCmp('lbl_valor_fatura_offline').setText('<?php echo DMG_Translate::_('faturamento.form.header.vl_fatura'); ?>' + a.reader.jsonData.vl_fatura);
						}
					} catch (e) {};
				},
				exception: function (a, b, c, d) {
					try {
						this.el.unmask();
						if (d.reader.jsonData.reload) {
							uiHelper.showMessageBox({msg: '<?php echo DMG_Translate::_('faturamento.recarregado'); ?>', title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>'});
						}
						if (d.reader.jsonData.faturado) {
							uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('faturamento.success'); ?>', function(o){
								if (o == 'no') {
									tabs.remove(tabs.activeTab, true);
								}
							}, this);
							this.comboFilial.clearValue();
							this.comboLocais.clearValue();
							this.comboMoedas.clearValue();
							this.comboParceiro.clearValue();
							this.clearTitulos();
							this.primeiraGridStore.removeAll();
							this.segundaGridStore.removeAll();
							this.docId = 0;
						} else {
							uiHelper.showMessageBox({msg: d.reader.jsonData.message, title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>'});
						}
					} catch (e) {};
				}
			}
		});
		var ccm = Ext.extend(Ext.grid.RowSelectionModel, {
			width: 30,
			sortable: false,
			dataIndex: 0,
			menuDisabled: true,
			fixed: true,
			scope: this,
			id: 'preencherManualmente',
			form: null,
			initEvents: function () {
				ccm.superclass.initEvents.call(this);
				this.grid.on('cellclick', function (grid, rowIndex, columnIndex, e) {
					if (columnIndex == grid.getColumnModel().getIndexById('preencherManualmente')) {

						this.form = new Faturamento.preencheManualForm({
							listeners: {
								scope: this,
								salvar: function (data, record) {
									if (data.docId > 0) {
										this.grid.ownerCt.ownerCt.docId = data.docId;
									}
									record.set('vl_operadora', data.vl_operadora);
									record.set('vl_bruto', data.vl_bruto);
									record.set('vl_local', data.vl_local);
									record.set('percent_local', data.percent_local);
									record.set('nr_cont_1_new', data.nr_cont_1);
									record.set('nr_cont_2_new', data.nr_cont_2);
									record.set('nr_cont_3_new', data.nr_cont_3);
									record.set('nr_cont_4_new', data.nr_cont_4);
									record.set('nr_cont_5_new', data.nr_cont_5);
									record.set('nr_cont_6_new', data.nr_cont_6);
									record.commit();
									Ext.getCmp('lbl_valor_fatura_offline').setText('<?php echo DMG_Translate::_('faturamento.form.header.vl_fatura'); ?>' + data.valor_fatura);
								}
							}
						});

						this.form.record = grid.getStore().getAt(rowIndex);
						this.form.dados = {};
						this.form.dados = grid.getStore().getAt(rowIndex).data;
						this.form.dados.id_local = this.grid.ownerCt.ownerCt.comboLocais.getValue();
						this.form.dados.id_moeda = this.grid.ownerCt.ownerCt.comboMoedas.getValue();
						this.form.dados.id_parceiro = this.grid.ownerCt.ownerCt.comboParceiro.getValue();
						this.form.dados.id_filial = this.grid.ownerCt.ownerCt.comboFilial.getValue();
						this.form.dados.dt_fatura = this.grid.ownerCt.ownerCt.dt_fatura.value;
						this.form.dados.hora = this.grid.ownerCt.ownerCt.hora.getValue();
						this.form.dados.minuto = this.grid.ownerCt.ownerCt.minuto.getValue();
						this.form.setDocId(this.grid.ownerCt.ownerCt.docId);
						this.form.show();
					}
				}, this);
			},
			renderer: function (v, p, record, rowIndex) {
				return '<img style="cursor:pointer" src="images/icons/edit.gif" />';
			}
		});
		this.preencherManualmente = new ccm();
		this.segundaGrid = new Ext.grid.GridPanel({
			title: Faturamento.maquinas_faturar,
			sm: this.preencherManualmente,
			ddGroup: 'firstGridDDGroup-offline',
			flex: 3,
			id:'gridFaturamento2-offline',
			store: this.segundaGridStore,
			columns: [{
				dataIndex: 'nr_serie',
				header: Faturamento.num_serie,
				sortable:true
			},{
				dataIndex: 'nm_jogo',
				header: Faturamento.jogo,
				sortable:true
			},{
				dataIndex: 'vl_credito',
				header: Faturamento.credito,
				sortable:true
			},{
				dataIndex: 'vl_operadora',
				header: Faturamento.total_oper,
				align: 'right',
				sortable:true
			},{
				dataIndex: 'vl_bruto',
				header: Faturamento.total_bruto,
				align: 'right',
				sortable:true
			},{
				dataIndex: 'percent_local',
				header: Faturamento.perc_local,
				align: 'right',
				width: 50,
				sortable:true
			},{
				dataIndex: 'vl_local',
				header: Faturamento.total_local,
				align: 'right',
				sortable:true
			}, this.preencherManualmente],
			stripeRows: true
		});
		this.botoes = new Ext.Panel({
			width:50,
			border:false,
			layout: {
		        type:'vbox',
		        padding:'5',
		        pack: 'center',
		        align: 'center'
		    },
		    defaults:{
		    	xtype: 'button',
		    	margins:'0 0 5 0'
		    },
		    items:[{
		    	iconCls:'icon-esquerda_todos',
		    	width:16,
		    	height:16,
				scope: this,
		    	handler: function(botao, evento){
		    		uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('faturamento.confirma.remover.maquinas'); ?>', function (o) {
		    			if (o == 'yes') {
				    		var origem = Ext.getCmp('gridFaturamento2-offline');
							if (origem.store.data.items.length == 0) {
								return false;
							}
							var ids = new Array();
							for (var i = 0; i < origem.store.data.items.length; i++) {
								//if ((origem.store.data.items[i].data.canmove == 1) && (origem.store.data.items[i].data.em_temporaria == 0)) {
									ids.push(origem.store.data.items[i].data.id);
								//}
							}
							var conn = new Ext.data.Connection();
							conn.request({
								url: '<?php echo $this->url(array('controller' => 'faturamento2', 'action' => 'delete-item-fatura'), null, true); ?>',
								method: 'post',
								params: {
									'id[]': ids,
									docId: _this.docId
								},
								callback: function (a, b, c) {
									try {
										var data = Ext.decode(c.responseText);
										if (data.success) {
											//_this.docId = data.docId;
								    		var destino = Ext.getCmp('gridFaturamento1-offline');
											var remove = new Array();
											for (var i = 0; i < origem.store.data.items.length; i++) {
												//if ((origem.store.data.items[i].data.canmove == 1) && (origem.store.data.items[i].data.em_temporaria == 0)){
													origem.store.data.items[i].set('vl_operadora', '');
													origem.store.data.items[i].set('vl_bruto', '');
													origem.store.data.items[i].set('vl_local', '');
													origem.store.data.items[i].set('nr_cont_1_new', '');
													origem.store.data.items[i].set('nr_cont_2_new', '');
													origem.store.data.items[i].set('nr_cont_3_new', '');
													origem.store.data.items[i].set('nr_cont_4_new', '');
													origem.store.data.items[i].set('nr_cont_5_new', '');
													origem.store.data.items[i].set('nr_cont_6_new', '');
													origem.store.data.items[i].commit();
													var rg = origem.store.data.items[i];
													destino.store.add(rg);
													remove.push(rg);
												//}
											}
											if (remove.length) {
												Ext.each(remove, origem.store.remove, origem.store);
											}
								    		destino.store.sort('id', 'ASC');
											if (origem.store.data.items.length == 0) {
												//_this.docId = 0;
												_this.clearTitulos();
											} else {
												Ext.getCmp('lbl_valor_fatura_offline').setText('<?php echo DMG_Translate::_('faturamento.form.header.vl_fatura'); ?>' + data.vl_fatura);
											}
										}
										else{
											uiHelper.showMessageBox({msg: data.message, title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>'});					
										}
									} catch (e) {};
								}
							});
		    			}
		    		}, this);
		    	}
		    },{
		    	iconCls:'icon-esquerda_um',
		    	width:16,
		    	height:16,
				scope: this,
		    	handler: function(botao, evento){
		    		uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('faturamento.confirma.remover.maquinas'); ?>', function (o) {
		    			if (o == 'yes') {
				    		var origem = Ext.getCmp('gridFaturamento2-offline');
				    		var registros = origem.getSelectionModel().getSelections();
							if (registros.length == 0) {
								return false;
							}
							var ids = new Array();
							for (var i = 0; i < registros.length; i++) {
								//if ((registros[i].data.canmove == 1) && (registros[i].data.em_temporaria == 0)) {
									ids.push(registros[i].data.id);
								//}
							}
							var conn = new Ext.data.Connection();
							conn.request({
								url: '<?php echo $this->url(array('controller' => 'faturamento2', 'action' => 'delete-item-fatura'), null, true); ?>',
								method: 'post',
								params: {
									'id[]': ids,
									docId: _this.docId
								},
								callback: function (a, b, c) {
									try {
										var data = Ext.decode(c.responseText);
										if (data.success) {
								    		var destino = Ext.getCmp('gridFaturamento1-offline');
											var remove = new Array();
											for (var i = 0; i < registros.length; i++) {
												//if ((registros[i].data.canmove == 1) && (registros[i].data.em_temporaria == 0)) {
													registros[i].set('vl_operadora', '');
													registros[i].set('vl_bruto', '');
													registros[i].set('vl_local', '');
													registros[i].set('nr_cont_1_new', '');
													registros[i].set('nr_cont_2_new', '');
													registros[i].set('nr_cont_3_new', '');
													registros[i].set('nr_cont_4_new', '');
													registros[i].set('nr_cont_5_new', '');
													registros[i].set('nr_cont_6_new', '');
													registros[i].commit();
													var rg = registros[i];
													destino.store.add(rg);
													remove.push(rg);
												//}
											}
											if (remove.length) {
												Ext.each(remove, origem.store.remove, origem.store);
											}
								    		destino.store.sort('id', 'ASC');
											if (origem.store.data.items.length == 0) {
												//_this.docId = 0;
												_this.clearTitulos();
											} else {
												if (data.vl_fatura.length) {
													Ext.getCmp('lbl_valor_fatura_offline').setText('<?php echo DMG_Translate::_('faturamento.form.header.vl_fatura'); ?>' + data.vl_fatura);
												} else {
													_this.clearTitulos();
												}
											}
										}
										else{
											uiHelper.showMessageBox({msg: data.message, title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>'});					
										}
									} catch (e) {};
								}
							});
		    			}
		    		}, this);
		    	}
		    },{
		    	iconCls:'icon-direita_um',
		    	width:16,
		    	height:16,
				scope: this,
		    	handler: function(botao, evento){
		    		var origem = Ext.getCmp('gridFaturamento1-offline');
		    		var registros = origem.getSelectionModel().getSelections();
					if (registros.length == 0) {
						return false;
					}
					var ids = new Array();
					for (var i = 0; i < registros.length; i++) {
						if ((registros[i].data.canmove == 1) && (registros[i].data.em_temporaria == 0)) {
							ids.push(registros[i].data.id);
						}
					}
					var conn = new Ext.data.Connection();
					conn.request({
						url: '<?php echo $this->url(array('controller' => 'faturamento2', 'action' => 'criar-fatura'), null, true); ?>',
						method: 'post',
						params: {
							'id[]': ids,
							docId: _this.docId,
							id_local: this.comboLocais.getValue(),
							id_filial: this.comboFilial.getValue(),
							id_moeda: this.comboMoedas.getValue(),
							id_parceiro: this.comboParceiro.getValue(),
							dt_fatura: this.dt_fatura.value,
							hora: this.hora.getValue(),
							minuto: this.minuto.getValue()
						},
						callback: function (a, b, c) {
							try {
								var data = Ext.decode(c.responseText);
								if (data.success) {
									_this.docId = data.docId;
						    		var destino = Ext.getCmp('gridFaturamento2-offline');
									var remove = new Array();
									for (var i = 0; i < registros.length; i++) {
										if ((registros[i].data.canmove == 1) && (registros[i].data.em_temporaria == 0)) {
											var rg = registros[i];
											destino.store.add(rg);
											remove.push(rg);
										}
									}
									if (remove.length) {
										Ext.each(remove, origem.store.remove, origem.store);
									}
						    		destino.store.sort('id', 'ASC');
								}
								else{
									uiHelper.showMessageBox({msg: data.message, title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>'});					
								}
							} catch (e) {};
						}
					});
		    	}
		    },{
		    	iconCls:'icon-direita_todos',
		    	width:16,
		    	height:16,
				scope: this,
		    	handler: function(botao, evento){
		    		var origem = Ext.getCmp('gridFaturamento1-offline');
					if (origem.store.data.items.length == 0) {
						return false;
					}
					var ids = new Array();
					for (var i = 0; i < origem.store.data.items.length; i++) {
						if ((origem.store.data.items[i].data.canmove == 1) && (origem.store.data.items[i].data.em_temporaria == 0)) {
							ids.push(origem.store.data.items[i].data.id);
						}
					}
					var conn = new Ext.data.Connection();
					conn.request({
						url: '<?php echo $this->url(array('controller' => 'faturamento2', 'action' => 'criar-fatura'), null, true); ?>',
						method: 'post',
						params: {
							'id[]': ids,
							docId: _this.docId,
							id_local: this.comboLocais.getValue(),
							id_filial: this.comboFilial.getValue(),
							id_moeda: this.comboMoedas.getValue(),
							id_parceiro: this.comboParceiro.getValue(),
							dt_fatura: this.dt_fatura.value,
							hora: this.hora.getValue(),
							minuto: this.minuto.getValue()
						},
						callback: function (a, b, c) {
							try {
								var data = Ext.decode(c.responseText);
								if (data.success) {
									_this.docId = data.docId;
						    		var destino = Ext.getCmp('gridFaturamento2-offline');
									var remove = new Array();
									for (var i = 0; i < origem.store.data.items.length; i++) {
										if ((origem.store.data.items[i].data.canmove == 1) && (origem.store.data.items[i].data.em_temporaria == 0)) {
											var rg = origem.store.data.items[i];
											destino.store.add(rg);
											remove.push(rg);
										}
									}
									if (remove.length) {
										Ext.each(remove, origem.store.remove, origem.store);
									}
						    		destino.store.sort('id', 'ASC');
								}
								else{
									uiHelper.showMessageBox({msg: data.message, title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>'});					
								}
							} catch (e) {};
						}
					});
		    	}
		    }]
		});
		this.ddGridsPanel = new Ext.Panel({
			flex:2.5,
			layout: 'hbox',
			border:false,
			layoutConfig: {
				align : 'stretch'
			},
			items: [
			    this.primeiraGrid,
			    this.botoes,
			    this.segundaGrid
			]
		});
		this.geraPanel = new Ext.Panel({
			layout: 'hbox',
			height: 23,
			width: '100%',
			layoutConfig: {
				align: 'middle',
				pack: 'center'
			},
			defaults: {
				margins: '0 50 0 50',
				xtype: 'button'
			},
			items: [{
				text: '<?php echo DMG_Translate::_('faturamento.fechar.btn.fechar'); ?>',
				iconCls: 'silk-cross',
				scope: this,
				handler: function () {
					/*this.comboFilial.clearValue();
					this.comboLocais.clearValue();
					this.comboMoedas.clearValue();
					this.docId = 0;
					this.clearTitulos();
					this.comboParceiro.clearValue();
					this.primeiraGridStore.removeAll();
					this.segundaGridStore.removeAll();*/

					this.fechaAba();

				}
			}]
		});
		this.items = [{
			layout: 'column',
			xtype: 'container',
			layoutConfig: {
				align: 'stretch'
			},
			border: false,
			height: 110,
			items: [this.form, this.totais]
		}, {
			html: '<hr />',
			width: '100%'
		}, this.ddGridsPanel, {
			html: '<hr />',
			width:'100%'
		}, this.geraPanel];
		FaturamentoFormOffline.superclass.initComponent.call(this);
	},
	fechaAba: function(){
		uiHelper.customAlert({
			title:'<?php echo DMG_Translate::_('grid.form.alert.title'); ?>',
			msg:'<?php echo DMG_Translate::_('faturamento.fechar.msg'); ?>',
			icon: Ext.MessageBox.QUESTION,
			btns:[{
				buttonText:'<?php echo DMG_Translate::_('faturamento.fechar.btn.fechar'); ?>',
				fn:function(){
					tabs.remove('FaturamentoFormOffline');
				}
			},{
				buttonText:'<?php echo DMG_Translate::_('faturamento.continuar.editando'); ?>',
				fn:function(){
					//Não precisa executar nada
				}
			}]
		});
	},
	/**
	 * FUNÇÃO PARA CARREGAMENTO DOS DADOS PARA EDIÇÃO DE FATURA MANUAL
	 * Autor: Leonardo 21/06/2010
	 */
	loadFaturaNovaData: function(){
		var d = this.dt_fatura.getValue().split('/');
		d = d[1] + "/" + d[0] + "/" + d[2];
		
		var hora = this.hora.getValue();
		var minuto = this.minuto.getValue();
		var novaData = new Date(d + ' ' + hora + ':' + minuto);
		Ext.getCmp('FaturamentoFormOffline').loadFatura(novaData);
	},
	loadFatura:function(novaData){
		//this.el.mask('<?php echo DMG_Translate::_('i18n.loading'); ?>');
		
		novaData = typeof(novaData) != 'undefined' ? novaData.format('Y-m-d H:i:s') : false;
		
		Ext.Ajax.request({
			url: '<?php echo $this->url(array('controller' => 'faturamento', 'action' => 'load-fatura'), null, true); ?>',
			params: {
				id: this.docId,
				novadata: novaData
			},
			scope: this,
			success: function (response, options) {
				try {
					var resposta = Ext.decode(response.responseText);
				} catch (e) {
					this.el.unmask();
					return;
				};
				if(resposta.success){
					
					var form = Ext.getCmp('FaturamentoFormOffline');
					
					if(resposta.maquinas_excluidas.length > 0){
						var alerta = new Ext.Window({
							id:'alertaExclusaoMaquinasFaturamento',
							title:'<?php echo DMG_Translate::_('grid.form.alert.title'); ?>',
							width:400,
							height:300,
							bodyStyle:'padding:5px',
							modal:true,
							layout:'vbox',
							layoutConfig: {
								align:'stretch'
							},
							items:[{
								xtype:'panel',
								bodyStyle: 'background-color:#DFE8F6;padding:5px',
								border:false,
								html:'<img align="left" hspace="6" src="extjs/resources/images/default/window/icon-warning.gif" /><?php echo DMG_Translate::_('faturamento.list.registros-posteriores.offline'); ?>',
								flex:1
							},{
								xtype:'grid',
								margins: '10 0 0 0',
								stripeRows: true,
								flex:2,
								ref: '../grid',
								store: new Ext.data.JsonStore({
									root: 'data',
									idProperty: 'id',
									totalProperty: 'total',
									fields: form.fields,
								}),
								columns: [{
									dataIndex: 'nr_serie',
									header: Faturamento.num_serie
								},{
									dataIndex: 'nm_jogo',
									header: Faturamento.jogo
								}]
							}],
							buttons:[{
								text:'<?php echo DMG_Translate::_('faturamento.continuar'); ?>',
								handler:function(botao,evento){
									var janela = Ext.getCmp('alertaExclusaoMaquinasFaturamento');
									var form = Ext.getCmp('FaturamentoFormOffline');
								
									janela.el.mask('<?php echo DMG_Translate::_('i18n.loading'); ?>');
								
									var data = form.dt_fatura.getValue();
									data = data.split('/');
									data = data[1] + "/" + data[0] + "/" + data[2];
									var hora = form.hora.getValue();
									var minuto = form.minuto.getValue();
									var novaData = new Date(data + ' ' + hora + ':' + minuto);
									novaData = novaData.format('Y-m-d H:i:s');
								
									Ext.Ajax.request({
										url: '<?php echo $this->url(array('controller' => 'faturamento', 'action' => 'altera-data-fatura'), null, true); ?>',
										params: {
											id: form.docId,
											novadata: novaData
										},
										scope: this,
										success: function (response, options) {
											try {
												var resposta = Ext.decode(response.responseText);
											} catch (e) {
												this.el.unmask();
												return;
											};
											if(resposta.success){
												Ext.getCmp('FaturamentoFormOffline').loadFatura();
												var janela = Ext.getCmp('alertaExclusaoMaquinasFaturamento');											
												janela.el.unmask();
												janela.close();
											}
										},
										failure: function(){
											this.el.unmask();
										}
									});
								}
							},{
								text:'<?php echo DMG_Translate::_('faturamento.cancelar'); ?>',
								handler:function(botao,evento){
									var form = Ext.getCmp('FaturamentoFormOffline');
									form.dt_fatura.setValue(form.previewsDate.format('d/m/Y'));
									form.hora.setValue(form.previewsDate.format('H'));
									form.minuto.setValue(form.previewsDate.format('i'));
									Ext.getCmp('lbl_data_fatura_offline').setText(form.dt_fatura.getValue() + ' ' + form.hora.getValue() + ':' + form.minuto.getValue() + ' hs');									
									Ext.getCmp('alertaExclusaoMaquinasFaturamento').close();
								}
							}]
						});
						
						alerta.show();
						
						var destino = alerta.grid;
			    		
			    		for(var i = 0; i < resposta.maquinas_excluidas.length; i++){
			    			var rec = new Ext.data.Record(resposta.maquinas_excluidas[i]);
			    			destino.store.add(rec);
			    		}
			    		
			    		destino.store.sort('nr_serie', 'ASC');
						
						return;
					}
					
					Ext.getCmp('comboLocalFaturamento-offline').setValue(resposta.fatura.local);
					Ext.getCmp('comboFilialFaturamento-offline').setValue(resposta.fatura.filial);
					Ext.getCmp('comboParceiroFaturamento-offline').setValue(resposta.fatura.parceiro);
					Ext.getCmp('comboMoedasFaturamento-offline').setValue(resposta.fatura.moeda);
					
					form.previewsDate = Date.parseDate(resposta.fatura.dt_fatura, "d/m/Y").add(Date.HOUR, resposta.fatura.hora).add(Date.MINUTE, resposta.fatura.minuto);
					Ext.getCmp('lbl_data_fatura_offline').setText(resposta.fatura.dt_fatura + ' ' + resposta.fatura.hora + ':' + resposta.fatura.minuto + ' hs');

					form.dt_fatura.setValue(resposta.fatura.dt_fatura);
					form.hora.setValue(resposta.fatura.hora);
					form.minuto.setValue(resposta.fatura.minuto);
					Ext.getCmp('lbl_valor_fatura_offline').setText('<?php echo DMG_Translate::_('faturamento.form.header.vl_fatura'); ?>' + resposta.fatura.simbolo_moeda + resposta.fatura.total_fatura);
					
		    		var destino = Ext.getCmp('gridFaturamento2-offline');
		    		destino.store.removeAll();
		    			    		
		    		for(var i = 0; i < resposta.maquinas_fatura.length; i++){
		    			var rec = new Ext.data.Record(resposta.maquinas_fatura[i]);
		    			destino.store.add(rec);
		    		}
		    		
		    		destino.store.sort('nr_serie', 'ASC');
		    		
		    		var destino = Ext.getCmp('gridFaturamento1-offline');
		    		destino.store.removeAll();
		    		for(var i = 0; i < resposta.maquinas_instaladas.length; i++){
		    			var rec = new Ext.data.Record(resposta.maquinas_instaladas[i]);
		    			destino.store.add(rec);
		    		}
		    		
		    		destino.store.sort('nr_serie', 'ASC');
				}
				else{
					uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: resposta.errormsg});
					if(options.params.novadata !== false){
						var form = Ext.getCmp('FaturamentoFormOffline');
						form.dt_fatura.setValue(form.previewsDate.format('d/m/Y'));
						form.hora.setValue(form.previewsDate.format('H'));
						form.minuto.setValue(form.previewsDate.format('i'));
						Ext.getCmp('lbl_data_fatura_offline').setText(form.dt_fatura.getValue() + ' ' + form.hora.getValue() + ':' + form.minuto.getValue() + ' hs');
					}
				}
				this.el.unmask();
			},
			failure: function(){
				this.el.unmask();
			}
		});
	},
	
	colorirExcecoes: function () {
		this.segundaGridStore.each(function(a){
			if (a.data.id_excecao > 0) {
				var idx = this.segundaGridStore.data.findIndex('id', a.data.id);
				var registro = this.segundaGridStore.getAt(idx);
				Ext.get(this.segundaGrid.getView().getRow(idx)).addClass('tgriderror');
				Ext.get(this.segundaGrid.getView().getRow(idx)).removeClass('tgridjogando');
			}
		}, this);
	},
	initEvents: function () {
		this.segundaGridStore.on('load', function(a){
			this.el.unmask();
			if (a.reader.jsonData.reload) {
				uiHelper.showMessageBox({msg: '<?php echo DMG_Translate::_('faturamento.recarregado'); ?>', title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>'});
			}
			this.colorirExcecoes();
		}, this);
		this.on({
			scope: this,
			afterlayout: function(painel){
				var blankRecord =  Ext.data.Record.create(this.fields);
				
				var firstGridDropTargetEl =  painel.primeiraGrid.getView().scroller.dom;
				var firstGridDropTarget = new Ext.dd.DropTarget(firstGridDropTargetEl, {
					ddGroup: 'firstGridDDGroup-offline',
					notifyDrop: function(ddSource, e, data){
						var records =  ddSource.dragData.selections;
						Ext.each(records, ddSource.grid.store.remove, ddSource.grid.store);
						painel.primeiraGrid.store.add(records);
						painel.primeiraGrid.store.sort('id', 'ASC');
						return true;
					}
				});
	
	
				var secondGridDropTargetEl = painel.segundaGrid.getView().scroller.dom;
				var secondGridDropTarget = new Ext.dd.DropTarget(secondGridDropTargetEl, {
					ddGroup    : 'secondGridDDGroup-offline',
					notifyDrop : function(ddSource, e, data){
						var records =  ddSource.dragData.selections;
						Ext.each(records, ddSource.grid.store.remove, ddSource.grid.store);
						painel.segundaGrid.store.add(records);
						painel.segundaGrid.store.sort('id', 'ASC');
						return true;
					}
				});
				
				
			}
		});
		FaturamentoFormOffline.superclass.initEvents.call(this);
	}
});
Ext.reg('faturamento-form-offline', FaturamentoFormOffline);