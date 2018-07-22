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
Faturamento.gerar_fatura = '<?php echo DMG_Translate::_('faturamento.gerar_fatura'); ?>';
Faturamento.credito = '<?php echo DMG_Translate::_('faturamento.vl_credito'); ?>';

var FaturamentoFormOnline = Ext.extend(Ext.Panel, {
	id:'FaturamentoFormOnline',
	layout: {
        type: 'vbox',
        padding: '5',
        align: 'stretch'
    },
	bodyStyle: 'padding:5px',
	defaults:{
		border: false
	},
	clearTitulos: function () {
		Ext.getCmp('lbl_data_fatura').setText('');
		Ext.getCmp('lbl_valor_fatura').setText('');

	},
	limpaGrids: function () {
		//Ext.getCmp('gridFaturamento1').store.reload();
		Ext.getCmp('buscaFaturamentoField').reset();
		Ext.getCmp('buscaFaturamentoField').triggers[0].hide(); 
		this.primeiraGridStore.baseParams.nr_serie_imob = "";
		Ext.getCmp('gridFaturamento2').store.removeAll();
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
				Ext.getCmp('gridFaturamento2').store.baseParams = {
					id_local: this.comboLocais.getValue(),
					id_parceiro: this.comboParceiro.getValue(),
					id_moeda: this.comboMoedas.getValue(),
					id_filial: this.comboFilial.getValue(),
					'maquina[]': selecionados
				};
				Ext.getCmp('gridFaturamento2').store.reload();
				Ext.getCmp('gridFaturamento2').store.sort('id_excecao', 'ASC');
			}
		}, this);
	},
	limpaRegistros: function () {
		Ext.each(this.segundaGridStore.data.items, function(a){
			a.set('percent_local', '');
			a.set('total_operadora', '');
			a.set('total_bruto', '');
			a.set('total_local', '');
			a.set('excecao', '');
			a.set('id_excecao', '');
			a.set('nr_cont_1', '');
			a.set('nr_cont_2', '');
			a.set('nr_cont_3', '');
			a.set('nr_cont_4', '');
			a.set('nr_cont_5', '');
			a.set('nr_cont_6', '');
			a.set('pago_manual', '');
		});
	},
	initComponent: function(){
		
		this.comboLocais = new Ext.form.ComboBox({
			fieldLabel: Faturamento.local,
			name: 'local',
			minChars:3,
			typeAhead: true,
			store: new Ext.data.JsonStore({
				url: '<?php echo $this->url(array('controller' => 'local', 'action' => 'list')); ?>',
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
				scope: this,
				select: function(combo, record) {
					this.el.mask('<?php echo DMG_Translate::_('i18n.ComboBox.loadingText'); ?>');
					this.clearTitulos();
					this.limpaGrids();
					//Ext.getCmp('gridFaturamento1').store.reload();
					Ext.getCmp('comboFilialFaturamento').getStore().baseParams.id_local = record.id;
					Ext.getCmp('comboFilialFaturamento').getStore().reload();
				}
			}
		});
		
		this.comboFilial = new Ext.form.ComboBox({
			name: 'filial',
			id: 'comboFilialFaturamento',
			fieldLabel: Faturamento.empresa_filial,
			minChars:3,
			typeAhead: true,
			autoSelect:true,
			store: new Ext.data.JsonStore({
				url: '<?php echo $this->url(array('controller' => 'faturamento', 'action' => 'combofilial')); ?>',
				root: 'data',
				fields: ['id', 'nm_completo'],
				listeners:{
					load: function(store, registro, opcoes){
						if(registro.length > 0){
							Ext.getCmp('comboFilialFaturamento').setValue(registro[0].data.id);
						}
						else {
							Ext.getCmp('comboFilialFaturamento').clearValue();
						}
						Ext.getCmp('comboParceiroFaturamento').getStore().baseParams.id_local = Ext.getCmp('comboFilialFaturamento').getStore().baseParams.id_local;
						Ext.getCmp('comboParceiroFaturamento').getStore().baseParams.id_filial = Ext.getCmp('comboFilialFaturamento').getValue();
						Ext.getCmp('comboParceiroFaturamento').getStore().reload();
					}
				}
			}),
			mode: 'remote',
			width: 200,
			triggerAction: 'all',
			displayField: 'nm_completo',
			valueField: 'id',
			forceSelection: true,
			listeners: {
				scope: this,
				select: function(combo, record) {
					this.el.mask('<?php echo DMG_Translate::_('i18n.ComboBox.loadingText'); ?>');
					this.clearTitulos();
					this.limpaGrids();
					//Ext.getCmp('gridFaturamento1').store.reload();
					Ext.getCmp('comboParceiroFaturamento').getStore().baseParams.id_local = Ext.getCmp('comboFilialFaturamento').getStore().baseParams.id_local;
					Ext.getCmp('comboParceiroFaturamento').getStore().baseParams.id_filial = Ext.getCmp('comboFilialFaturamento').getValue();
					Ext.getCmp('comboParceiroFaturamento').getStore().reload();
				}
			}
		});
		
		this.comboParceiro = new Ext.form.ComboBox({
			id: 'comboParceiroFaturamento',
			store: new Ext.data.JsonStore({
				url: '<?php echo $this->url(array('controller' => 'faturamento', 'action' => 'comboparceiros')); ?>',
				baseParams: {
					dir: 'ASC',
					limit: 15,
					id_filial: 0
				},
				root: 'data',
				fields: ['id', 'nm_parceiro'],
				listeners:{
					load: function(store, registro, opcoes){
						if(registro.length > 0){
							Ext.getCmp('comboParceiroFaturamento').setValue(registro[0].data.id);
						}
						else {
							Ext.getCmp('comboParceiroFaturamento').clearValue();
						}
						Ext.getCmp('comboMoedasFaturamento').getStore().baseParams.id_local = Ext.getCmp('comboFilialFaturamento').getStore().baseParams.id_local;
						Ext.getCmp('comboMoedasFaturamento').getStore().baseParams.id_filial = Ext.getCmp('comboFilialFaturamento').getValue();
						Ext.getCmp('comboMoedasFaturamento').getStore().reload();
					}
				}
			}),
			width: 200,
			minChars:3,
			typeAhead: true,
			//queryParam: 'filter[0][data][value]',
			hiddenName: 'id_parceiro',
			allowBlank: true,
			displayField: 'nm_parceiro',
			valueField: 'id',
			mode: 'remote',
			fieldLabel: Faturamento.parceiro,
			triggerAction: 'all',
			listeners: {
				scope: this,
				select: function(combo, record) {
					this.clearTitulos();
					this.limpaGrids();
					//Ext.getCmp('gridFaturamento1').store.reload();
					Ext.getCmp('comboMoedasFaturamento').getStore().baseParams.id_local = Ext.getCmp('comboFilialFaturamento').getStore().baseParams.id_local;
					Ext.getCmp('comboMoedasFaturamento').getStore().baseParams.id_filial = Ext.getCmp('comboFilialFaturamento').getValue();
					Ext.getCmp('comboMoedasFaturamento').getStore().reload();
				}
			}
		});
		
		this.comboMoedas = new Ext.form.ComboBox({
			id: 'comboMoedasFaturamento',
			store: new Ext.data.JsonStore({
				url: '<?php echo $this->url(array('controller' => 'faturamento', 'action' => 'combomoedas')); ?>',
				root: 'data',
				fields: ['code', 'name', 'simbol'],
				listeners:{
					scope:this,
					load: function(store, registro, opcoes){
						if(registro.length > 0){
							Ext.getCmp('comboMoedasFaturamento').setValue(registro[0].data.code);
						}
						else {
							Ext.getCmp('comboMoedasFaturamento').clearValue();
						}
						Ext.getCmp('gridFaturamento1').store.reload();
						this.el.unmask();
					}
				}
			}),
			hiddenName: 'id_moeda',
			allowBlank: false,
			displayField: 'name',
			valueField: 'code',
			mode: 'local',
			width: 200,
			triggerAction: 'all',
			fieldLabel: Faturamento.moeda,
			listeners: {
				scope: this,
				select: function(combo, record) {
					this.clearTitulos();
					this.limpaGrids();
					Ext.getCmp('gridFaturamento1').store.reload();
				}
			}
		});
		

		this.form = new Ext.form.FormPanel({
			border: false,
			flex: 1,
			height: 106,
			items:[
				this.comboLocais,
				this.comboFilial,
				this.comboParceiro,
				this.comboMoedas
			]
		});
		
		this.totais = new Ext.form.FormPanel({
			border: false,
			flex: 2,
			items:[{
				xtype: 'label',
				id: 'lbl_data_fatura',
				style: 'display: block; font-size: 16px'
			}, {
				xtype: 'label',
				id: 'lbl_valor_fatura',
				style: 'display: block; font-size: 16px'
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
			{name: 'nr_cont_6', type: 'int'}			
	      ];
		
		
		this.primeiraGridStore = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'faturamento', 'action' => 'maquinas')); ?>',
			root: 'data',
			idProperty: 'id',
			totalProperty: 'total',
			autoLoad: true,
			autoDestroy: true,
			/*sortInfo: {
				field: 'id',
				direction: 'ASC'
			},*/
			/*baseParams: {
				id_local: "",
				id_parceiro:  = this.comboParceiro.getValue();
				id_moeda = this.comboMoedas.getValue();
				id_filial = this.comboFilial.getValue();
			},*/
			fields: this.fields,
			listeners: {
				scope: this,
				exception: function (a, b, c, d) {
					try {
						this.el.unmask();
						uiHelper.showMessageBox({msg: d.reader.jsonData.message, title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>'});
					} catch (e) {};
				},
				beforeLoad: function () {
					this.primeiraGridStore.baseParams.id_local = this.comboLocais.getValue();
					this.primeiraGridStore.baseParams.id_parceiro = this.comboParceiro.getValue();
					this.primeiraGridStore.baseParams.id_moeda = this.comboMoedas.getValue();
					this.primeiraGridStore.baseParams.id_filial = this.comboFilial.getValue();
					this.primeiraGridStore.removeAll();
					this.segundaGridStore.removeAll();
				},
				load: function(store, records, options){
					try {
						if (store.reader.jsonData.success == true && store.reader.jsonData.message.length > 0) {
							<?php if (DMG_Acl::canAccess(85)): ?>
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
									this.primeiraGridStore.removeAll();
									this.segundaGridStore.removeAll();
								}
							}, this);
							<?php else: ?>
							uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('faturamento.delete_temp.sem_permissao'); ?>'});
							this.primeiraGridStore.removeAll();
							this.segundaGridStore.removeAll();
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
					} catch (e) {};
				}
			}
		});
		
		
		this.primeiraGrid = new Ext.grid.GridPanel({
			title: Faturamento.maquinas_instaladas,
			flex:1,
			id:'gridFaturamento1',
			ddGroup: 'secondGridDDGroup',
			store: this.primeiraGridStore,
			columns: [{
				dataIndex: 'nr_serie',
				header: Faturamento.num_serie
			},{
				dataIndex: 'nm_jogo',
				header: Faturamento.jogo
			}],
			enableDragDrop: true,
			stripeRows: true,
			tbar:{
				layout:'fit',
	        	items:[
					new Ext.ux.form.SearchField({
						id:'buscaFaturamentoField',
						store: this.primeiraGridStore,
						paramName: 'nr_serie_imob'
					})
	        	]
	        }
		});
		
		this.segundaGridStore = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'faturamento', 'action' => 'list-grid')); ?>',
			root: 'data',
			idProperty: 'id',
			/*sortInfo: {
				field: 'id',
				direction: 'ASC'
			},*/
			/*baseParams: {
				limit: 30,
				status: 1
			},*/
			fields: this.fields,
			listeners: {
				scope: this,
				load: function (a) {
					this.el.unmask();
					try {
						if (a.reader.jsonData.message && a.reader.jsonData.message.length > 0) {
							uiHelper.showMessageBox({msg: a.reader.jsonData.message, title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>'});
						} else {
							Ext.getCmp('lbl_data_fatura').setText('<?php echo DMG_Translate::_('faturamento.form.header.dt_fatura'); ?>' + a.reader.jsonData.dt_fatura);
							Ext.getCmp('lbl_valor_fatura').setText('<?php echo DMG_Translate::_('faturamento.form.header.vl_fatura'); ?>' + a.reader.jsonData.vl_fatura);
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
						} else {
							uiHelper.showMessageBox({msg: d.reader.jsonData.message, title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>'});
						}
					} catch (e) {};
				}
			}
		});

		this.segundaGrid = new Ext.grid.GridPanel({
			title: Faturamento.maquinas_faturar,
			ddGroup: 'firstGridDDGroup',
			flex: 3,
			id:'gridFaturamento2',
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
				dataIndex: 'total_operadora',
				header: Faturamento.total_oper,
				align: 'right',
				sortable:true
			},{
				dataIndex: 'total_bruto',
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
				dataIndex: 'total_local',
				header: Faturamento.total_local,
				align: 'right',
				sortable:true
			},{
				dataIndex: 'excecao',
				header: Faturamento.excecao,
				width: 150,
				sortable:true
			}],
			enableDragDrop: true,
			stripeRows: true,
			tbar:[{
				iconCls:'icon-calcular',
				text: Faturamento.gerar_fatura,
				scope: this,
				handler: this.recalcularFatura
			}]
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
		    		var origem = Ext.getCmp('gridFaturamento2');
		    		var destino = Ext.getCmp('gridFaturamento1');
		    		var registros = origem.store.data.items;
					this.limpaRegistros();
		    		destino.store.add(registros);
		    		destino.store.sort('id', 'ASC');
		    		origem.store.removeAll();
		    	}
		    },{
		    	iconCls:'icon-esquerda_um',
		    	width:16,
		    	height:16,
				scope: this,
		    	handler: function(botao, evento){
		    		var origem = Ext.getCmp('gridFaturamento2');
		    		var destino = Ext.getCmp('gridFaturamento1');
		    		var registros = origem.getSelectionModel().getSelections();
					this.limpaRegistros();
		    		destino.store.add(registros);
		    		destino.store.sort('id', 'ASC');
		    		Ext.each(registros, origem.store.remove, origem.store);
		    	}
		    },{
		    	iconCls:'icon-direita_um',
		    	width:16,
		    	height:16,
				scope: this,
		    	handler: function(botao, evento){
		    		var origem = Ext.getCmp('gridFaturamento1');
		    		var destino = Ext.getCmp('gridFaturamento2');
		    		var registros = origem.getSelectionModel().getSelections();
					this.limpaRegistros();
		    		destino.store.add(registros);
		    		destino.store.sort('id', 'ASC');
		    		Ext.each(registros, origem.store.remove, origem.store);
		    	}
		    },{
		    	iconCls:'icon-direita_todos',
		    	width:16,
		    	height:16,
				scope: this,
		    	handler: function(botao, evento){
		    		var origem = Ext.getCmp('gridFaturamento1');
		    		var destino = Ext.getCmp('gridFaturamento2');
		    		var registros = origem.store.data.items;
					this.limpaRegistros();
		    		destino.store.add(registros);
		    		destino.store.sort('id', 'ASC');
		    		origem.store.removeAll();
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
			layout:'hbox',
			height:23,
			width:'100%',
			layoutConfig: {
			    align : 'middle',
			    pack  : 'center'
			},
			defaults:{
				margins:'0 50 0 50',
				xtype:'button'
			},
			items:[{
				text: Faturamento.cancelar_fatura,
				iconCls: 'silk-cross',
				scope: this,
				handler: function () {
					this.comboFilial.clearValue();
					this.comboLocais.clearValue();
					this.comboMoedas.clearValue();
					this.clearTitulos();
					this.comboParceiro.clearValue();
					this.primeiraGridStore.removeAll();
					this.segundaGridStore.removeAll();
				}
			},{
				text: Faturamento.confirmar_fatura,
				iconCls: 'icon-moedas',
				scope: this,
				handler: function () {
					if (this.segundaGrid.store.data.items.length == 0) {
						uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('faturamento.calcula_selecione_maquinas'); ?>'});
						return;
					}
					uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('faturamento.confirm_question'); ?>', function (o) {
						if (o != 'yes') {
							return;
						}
						this.el.mask('<?php echo DMG_Translate::_('faturamento.gerando'); ?>');
						var url = '<?php echo $this->url(array('controller' => 'faturamento', 'action' => 'list-grid')); ?>?geraFatura=ok';
						this.segundaGridStore.baseParams = {};
						for (var i = 0; i < this.segundaGrid.store.data.items.length; i++) {
							url += '&maquina[' + i + ']=' + this.segundaGridStore.data.items[i].data.nr_serie;
						}
						url += '&id_local=' + this.comboLocais.getValue();
						url += '&id_parceiro=' + this.comboParceiro.getValue();
						url += '&id_moeda=' + this.comboMoedas.getValue();
						url += '&id_filial=' + this.comboFilial.getValue();
						this.segundaGridStore.proxy.setUrl(url);
						Ext.getCmp('gridFaturamento2').store.reload();
						Ext.getCmp('gridFaturamento2').store.sort('id_excecao', 'ASC');
					}, this);
				}
			}]
		});
		
		this.items = [
			{
				layout: 'hbox',
				xtype: 'container',
				layoutConfig: {
					align : 'stretch'
				},
				border: false,
				height: 110,
				items: [this.form, this.totais]
			},
			{html:'<hr />', width:'100%'},
			this.ddGridsPanel,
			{html:'<hr />', width:'100%'},
			this.geraPanel
		];
		
		FaturamentoFormOnline.superclass.initComponent.call(this);		
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
					ddGroup: 'firstGridDDGroup',
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
					ddGroup    : 'secondGridDDGroup',
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
		FaturamentoFormOnline.superclass.initEvents.call(this);
	}
});
Ext.reg('faturamento-form-online', FaturamentoFormOnline);