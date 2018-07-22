Ext.apply(Ext.form.VTypes, {
	daterangeText: '<?php echo DMG_Translate::_('faturamento.filtro.erro.datas'); ?>',
	daterange : function(val, field) {
		var date = field.parseDate(val);
		
		if(!date){
			this.daterangeText = String.format(field.invalidText, val);
			return false;
		}
		if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime()))) {
			var start = Ext.getCmp(field.startDateField);
			start.setMaxValue(date);
			start.validate();
			this.dateRangeMax = date;
		}
		else if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime()))) {
			var end = Ext.getCmp(field.endDateField);
			end.setMinValue(date);
			end.validate();
			this.dateRangeMin = date;
		}
		/*
		* Always return true since we're only using this vtype to set the
		* min/max allowed values (these are tested for after the vtype test)
		*/
		return true;
	}
});


var sm = new Ext.grid.CheckboxSelectionModel();
var FaturamentoWindow = Ext.extend(Ext.grid.GridPanel, {
	id: 'FaturamentoWindow',
	border: false,
	stripeRows: true,
	loadMask: true,
	viewConfig: {
		autoFill: true,
		forceFit: true,
	},
	sm: sm,
	columnLines: true,
	_imprimirFatura: function () {
		var arrSelecionados = this.getSelectionModel().getSelections();
		if (arrSelecionados.length !== 1) {
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('faturamento.imprimir.selecione'); ?>'});
			return false;
		}
		var id = arrSelecionados[0].data.id_fatura;
		window.open('download.php?id=' + id + '&tipo=fatura&__dc=' + new Date().getTime(), 'print');
	},
	listeners:{
		rowdblclick: function(grid, rowIndex, event){
			<?php if (DMG_Acl::canAccess(91)): ?>
				var store = grid.getStore();
				var rec = store.getAt(rowIndex);
				if((rec.get('id_fatura_doc_status') != 1) || (rec.get('id_origem') != 2)){
					uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('faturamento.fatura.editar.erro.not.temp'); ?>'});
					return;
				}					
				this._gerarFaturaOffline(rec.get('id_fatura'));
			<?php endif; ?>
		},
		click:function(evento){
			var painel = Ext.getCmp('filterPanel_FaturamentoWindow');
			if(painel){
				if(painel.isVisible()){
					painel.hide();
					Ext.getCmp('filterButton_FaturamentoWindow').toggle(false);
				}
			}
		}
	},
	initComponent: function () {
		this.store = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'faturamento', 'action' => 'list'), null, true); ?>',
			root: 'data',
			idProperty: 'id',
			totalProperty: 'total',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			sortInfo: {
				field: 'id',
				direction: 'ASC'
			},
			baseParams: {
				status: 1,
				limit: 30
			},
			fields: [
				{name: 'id', type: 'string'},
				{name: 'id_fatura', type: 'int'},
				{name: 'id_origem', type: 'int'},
				{name: 'id_fatura_doc_status', type: 'int'},
				{name: 'nr_fatura', type: 'string'},
				{name: 'dt_fatura', type: "date", dateFormat: "Y-m-d H:i:s"},
				{name: 'simbolo_moeda', type: 'string'},
				{name: 'entradas', type: 'string'},
				{name: 'saidas', type: 'string'},
				{name: 'vl_bruto', type: 'string'},
				{name: 'vl_empresa', type: 'string'},
				{name: 'qtde_maquinas', type: 'int'},
				{name: 'qtde_excecoes', type: 'int'},
				{name: 'id_local', type: 'int'},
				{name: 'nm_local', type: 'string'},
				{name: 'nm_filial_completo', type: 'string'},
				{name: 'nm_usuario', type: 'string'},
				{name: 'nm_usuario_confirmacao', type: 'string'},
				{name: 'dt_confirmacao', type: "date", dateFormat: "Y-m-d H:i:s"}
			]
		});
		var paginator = new Ext.PagingToolbar({
			store: this.store,
			pageSize: 30,
		});
		this.comboTipo = new Ext.form.ComboBox({
			name: 'tipo',
			typeAhead: true,
			store: new Ext.data.SimpleStore({
				data: [
					[1, '<?php echo DMG_Translate::_('faturamento.temporaria'); ?>'],
					[2, '<?php echo DMG_Translate::_('faturamento.definitiva'); ?>'],
				],
				fields: ['id', 'nome']
			}),
			mode: 'local',
			width: 150,
			triggerAction: 'all',
			displayField: 'nome',
			valueField: 'id',
			forceSelection: true,
			listeners: {
				scope: this,
				select: function(combo, record) {
					this.store.baseParams.status = record.data.id;
					this.store.reload();
				}
			}
		});
		this.comboTipo.setValue(1);
		Ext.apply(this, {
			viewConfig: {
				emptyText: '<?php echo DMG_Translate::_('grid.empty'); ?>',
				deferEmptyText: false
			},
			bbar: paginator,
			tbar: [this.comboTipo, '-',
			
				{
				text: '<?php echo DMG_Translate::_('faturamento.window.filtro'); ?>',
				id:'filterButton_FaturamentoWindow',
				iconCls: 'icon-addfilter',
				enableToggle:true,
				handler: function(botao, evento){
					var painel = Ext.getCmp('filterPanel_FaturamentoWindow');
					if(painel){
						if(painel.isVisible()) painel.hide();
						else painel.show();
					}
					else{
						
						
						
						painel = new Ext.FormPanel({
							id:'filterPanel_FaturamentoWindow',
							width:450,
							height:98,
							monitorValid:true,
							labelWidth:70,
							labelAlign:'top',
							frame: true,
							border: false,
							bodyBorder: false,
							baseCls: 'floatfiltro',
							renderTo: Ext.getCmp('FaturamentoWindow').getGridEl(),
							listeners: {
								'render': 
									function(cmp){cmp.getEl().on('click', function(e){
										e.stopPropagation();
									}); 
								}
							},
							items:[{
								layout: 'column',
								bodyStyle: 'background:none',
								border:false,
								defaults: {
									border: false,
									bodyStyle:'padding:5px;background:none;'
								},
								items: [{
									columnWidth: 0.49,
									layout: 'form',
									items:[{
										id: 'filtroLocal_FaturamentoWindow',
										xtype: 'combo',
										fieldLabel: '<?php echo DMG_Translate::_('faturamento.id_local.text'); ?>',
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
										forceSelection: true
									}]
								},{
									columnWidth: 0.26,
									layout: 'form',
									items:[{
										fieldLabel: '<?php echo DMG_Translate::_('faturamento.window.dt_inicial'); ?>',
										xtype: 'datefield',
										name: 'startdt',
										id: 'startdt_FaturamentoWindow',
										vtype: 'daterange',
										format: 'd/m/Y',
										endDateField: 'enddt_FaturamentoWindow',
										listeners:{
											specialkey:function(owner,e){
												if (e.getKey() == 13){
													Ext.getCmp('btnexecfiltro_FaturamentoWindow').execFiltro();
												}
											}
										}
									}]
								},{
									columnWidth: 0.25,
									layout: 'form',
									items:[{
										fieldLabel: '<?php echo DMG_Translate::_('faturamento.window.dt_final'); ?>',
										xtype: 'datefield',
										name: 'enddt',
										id: 'enddt_FaturamentoWindow',
										format: 'd/m/Y',
										vtype: 'daterange',
										startDateField: 'startdt_FaturamentoWindow',
										listeners:{
											afterrender:function(owner){
												var now = new Date();
												var ant = new Date(now.getFullYear(), now.getMonth(), (now.getDate()-7), 0, 0);
												Ext.getCmp('startdt_FaturamentoWindow').setValue(ant);
												owner.setValue(now);
											},
											specialkey:function(owner,e){
												if (e.getKey() == 13){
													Ext.getCmp('btnexecfiltro_FaturamentoWindow').execFiltro();
												}
											}
										}
									}]
								}]
							}],
							buttons:[{
								text: '<?php echo DMG_Translate::_('faturamento.filtro.filtrar'); ?>',
								id:'btnexecfiltro_FaturamentoWindow',
								iconCls: 'ux-gridfilter-text-icon',
								formBind:true,
								execFiltro:function(){
									var local = Ext.getCmp('filtroLocal_FaturamentoWindow');
									var dtInicial = Ext.getCmp('startdt_FaturamentoWindow');
									var dtFinal = Ext.getCmp('enddt_FaturamentoWindow');
									var meBtn = Ext.getCmp('filterButton_FaturamentoWindow');
														
									if((local.getValue().length > 0) || (dtInicial.isValid() && (dtInicial.getValue() != "")) || (dtFinal.isValid() && (dtFinal.getValue() != ""))){
										meBtn.setIconClass('icon-filtered');
									} else {
										meBtn.setIconClass('icon-addfilter');
									}

									Ext.getCmp('FaturamentoWindow').store.on('beforeload', function(store, options) {
										options.params = options.params || {};
										
										if(local.getValue() > 0){
											Ext.apply(options.params, {
												'filter[0][data][type]': 'string',
												'filter[0][data][value]': local.getValue(),
												'filter[0][field]': 'fd.id_local'
											});
										}
										
										if (dtInicial.isValid() && (dtInicial.getValue() != "")) {
											Ext.apply(options.params, {
												'filter[1][data][comparison]': 'gt',
												'filter[1][data][type]': 'date',
												'filter[1][data][value]': dtInicial.getValue().format(dtInicial.format),
												'filter[1][field]': 'fd.dt_fatura'
											});
										}
										
										if (dtFinal.isValid() && (dtFinal.getValue() != "")) {
											Ext.apply(options.params, {
												'filter[2][data][comparison]': 'lt',
												'filter[2][data][type]': 'date',
												'filter[2][data][value]': dtFinal.getValue().format(dtFinal.format),
												'filter[2][field]': 'fd.dt_fatura'
											});
										}
									});
								
									Ext.getCmp('filterPanel_FaturamentoWindow').hide();
									Ext.getCmp('filterButton_FaturamentoWindow').toggle();
	
									Ext.getCmp('FaturamentoWindow').store.load();
								},
								handler: function(botao, evento){
									botao.execFiltro();
								}
							},{
								text: '<?php echo DMG_Translate::_('grid.form.cancel'); ?>',
								iconCls:'silk-cross',
								handler:function(){
									Ext.getCmp('filterPanel_FaturamentoWindow').hide();
									Ext.getCmp('filterButton_FaturamentoWindow').toggle(false);
								}
							}]
						});
					}
					//Ext.getCmp('filtro_ControlePostagensWindow').focus();
				}
			},{
				text: '<?php echo DMG_Translate::_('grid.bbar.clearfilter'); ?>',
				iconCls:'icon-removefilter',
				scope: this,
				handler: function(botao, evento){
					try {
						var fieldLocal = Ext.getCmp('filtroLocal_FaturamentoWindow');
						var fieldInicial = Ext.getCmp('startdt_FaturamentoWindow');
						var fieldFinal = Ext.getCmp('enddt_FaturamentoWindow');
						
						fieldLocal.reset();
						fieldInicial.reset();
						fieldFinal.reset();
						
						fieldInicial.maxValue = null;
						fieldInicial.minValue = null;
						fieldFinal.maxValue = null;
						fieldFinal.minValue = null;		
						
					}
					catch(e){}
					
					
					Ext.getCmp('FaturamentoWindow').store.on('beforeload', function(store, options) {
						options.params = options.params || {};
										
						Ext.apply(options.params, {
							'filter[0][data][type]': null,
							'filter[0][data][value]': null,
							'filter[0][field]': null
						});
						
						Ext.apply(options.params, {
							'filter[1][data][comparison]': null,
							'filter[1][data][type]': null,
							'filter[1][data][value]': null,
							'filter[1][field]': null
						});
						
						Ext.apply(options.params, {
							'filter[2][data][comparison]': null,
							'filter[2][data][type]': null,
							'filter[2][data][value]': null,
							'filter[2][field]': null
						});
					});
					
					
					
					Ext.getCmp('FaturamentoWindow').store.reload();
					
					var now = new Date();
					var ant = new Date(now.getFullYear(), now.getMonth(), (now.getDate()-7), 0, 0);
					
					fieldInicial.setValue(ant);
					fieldFinal.setValue(now);
						
					
					var painel = Ext.getCmp('filterPanel_FaturamentoWindow');
					if(painel){
						if(painel.isVisible()) painel.hide();
						meBtn = Ext.getCmp('filterButton_FaturamentoWindow');
						meBtn.toggle(false);
						meBtn.setIconClass('icon-addfilter');
					}
				}
			}
			
			, '->',
			<?php if (DMG_Acl::canAccess(84)): ?>
			{
				text: '<?php echo DMG_Translate::_('faturamento.confirmar_fatura'); ?>',
				iconCls: 'silk-add',
				scope: this,
				handler: this._confirmarFatura
			},
			<?php endif; ?>
			<?php if (DMG_Acl::canAccess(85)): ?>
			{
				text: '<?php echo DMG_Translate::_('faturamento.deletar_temporaria'); ?>',
				iconCls: 'silk-delete',
				scope: this,
				handler: this._deletarTemporaria
			},
			<?php endif; ?>
			
			
			<?php if (DMG_Acl::canAccess(91)): ?>
			{
				text: '<?php echo DMG_Translate::_('faturamento.btn.editar'); ?>',
				iconCls: 'icon-edit_fatura',
				scope:this,
				handler: function(botao, evento){
					var arrSelecionados = this.getSelectionModel().getSelections();
					
					if (arrSelecionados.length !== 1) {
						uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('faturamento.selecione.fatura.editar'); ?>'});
						return false;
					}
					if((arrSelecionados[0].data.id_fatura_doc_status != 1) || (arrSelecionados[0].data.id_origem != 2)){
						uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('faturamento.fatura.editar.erro.not.temp'); ?>'});
						return false;
					}
					var id = arrSelecionados[0].data.id_fatura;
					this._gerarFaturaOffline(id);
				}
			},
			<?php endif; ?>
			
			
			<?php if (DMG_Acl::canAccess(73)): ?>
			{
				text: '<?php echo DMG_Translate::_('faturamento.gerar_fatura.online'); ?>',
				iconCls: 'silk-add',
				scope: this,
				handler: this._gerarFaturaOnline
			},
			<?php endif; ?>
			<?php if (DMG_Acl::canAccess(89)): ?>
			{
				text: '<?php echo DMG_Translate::_('faturamento.gerar_fatura.offline'); ?>',
				iconCls: 'silk-add',
				scope: this,
				handler: function(botao, evento){
					this._gerarFaturaOffline();
				}
			},
			<?php endif; ?>
			<?php if (DMG_Acl::canAccess(79)): ?>
			{
				text: '<?php echo DMG_Translate::_('faturamento.imprimir_fatura'); ?>',
				iconCls: 'silk-printer',
				scope: this,
				handler: this._imprimirFatura
			},
			<?php endif; ?>
			],
			columns: [sm, {
				dataIndex: 'nr_fatura',
				header: '<?php echo DMG_Translate::_('faturamento.window.nr_fatura.text'); ?>',
				width:80,
			}, {
				dataIndex: 'nm_local',
				header: '<?php echo DMG_Translate::_('faturamento.window.nm_local.text'); ?>',
				width:170,
			}, {
				dataIndex: 'dt_fatura',
				header: '<?php echo DMG_Translate::_('faturamento.window.dt_fatura.text'); ?>',
				width:120,
				renderer:  function(data, cell, record, rowIndex, columnIndex, store) {
    				return data.format("d/m/Y H:i \\h\\s");
    			}
			}, {
				dataIndex: 'id_origem',
				header: '<?php echo DMG_Translate::_('faturamento.window.origem.text'); ?>',
				width:70,
				renderer: function (e) {
					switch (e) {
						case 1:
							return '<?php echo DMG_Translate::_('faturamento.window.origem.1'); ?>';
						break
						case 2:
							return '<?php echo DMG_Translate::_('faturamento.window.origem.2'); ?>';
						break;
					}
				}
			}, {
				dataIndex: 'simbolo_moeda',
				header: '<?php echo DMG_Translate::_('faturamento.window.simbolo_moeda.text'); ?>',
				width: 50
			}, {
				dataIndex: 'entradas',
				header: '<?php echo DMG_Translate::_('faturamento.window.entradas.text'); ?>',
				align:'right',
				width: 80
			}, {
				dataIndex: 'saidas',
				header: '<?php echo DMG_Translate::_('faturamento.window.saidas.text'); ?>',
				align:'right',
				width: 80
			}, {
				dataIndex: 'vl_bruto',
				header: '<?php echo DMG_Translate::_('faturamento.window.vl_bruto.text'); ?>',
				align:'right',
				width: 80
			}, {
				dataIndex: 'vl_empresa',
				header: '<?php echo DMG_Translate::_('faturamento.window.vl_empresa.text'); ?>',
				align:'right',
				width: 80
			}, {
				dataIndex: 'qtde_maquinas',
				header: '<?php echo DMG_Translate::_('faturamento.window.qtde_maquinas.text'); ?>',
				align:'right'
			}, {
				dataIndex: 'qtde_excecoes',
				header: '<?php echo DMG_Translate::_('faturamento.window.qtde_excecoes.text'); ?>',
				align:'right'
			}, {
				dataIndex: 'id_local',
				header: '<?php echo DMG_Translate::_('faturamento.window.id_local.text'); ?>',
				align:'right',
				width: 66
			}, {
				dataIndex: 'nm_filial_completo',
				header: '<?php echo DMG_Translate::_('faturamento.window.nm_filial_completo.text'); ?>'
			}, {
				dataIndex: 'nm_usuario',
				header: '<?php echo DMG_Translate::_('faturamento.window.nm_usuario.text'); ?>'
			}, {
				dataIndex: 'nm_usuario_confirmacao',
				header: '<?php echo DMG_Translate::_('faturamento.window.nm_usuario_confirmacao.text'); ?>'
			}, {
				dataIndex: 'dt_confirmacao',
				header: '<?php echo DMG_Translate::_('faturamento.window.dt_confirmacao.text'); ?>',
				renderer:  function(data, cell, record, rowIndex, columnIndex, store) {
    				return data.format("d/m/Y H:i \\h\\s");
    			}
			}]
		});
		FaturamentoWindow.superclass.initComponent.call(this);
	},
	initEvents: function () {
		this.on('activate', function () {
			this.store.reload();
		}, this);
		FaturamentoWindow.superclass.initEvents.call(this);
	},
	onDestroy: function () {
		FaturamentoWindow.superclass.onDestroy.apply(this, arguments);
		Ext.destroy(this.window);
		this.window = null;
	},
	<?php if (DMG_Acl::canAccess(73)): ?>
	_gerarFaturaOnline: function () {
		var titulo = '<?php echo DMG_Translate::_('faturamento.gerar_fatura.online'); ?>';
		var novaAba = tabs.items.find(function(aba){
			return aba.title === titulo;
		});
		if(!novaAba) {
			novaAba = tabs.add({
				title: titulo,
				xtype: 'faturamento-form-online',
				id: 'faturamento-form'
			});
		}
		tabs.activate(novaAba);
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(89)): ?>
	_gerarFaturaOffline: function (id_fatura) {
		var titulo = '<?php echo DMG_Translate::_('faturamento.gerar_fatura.offline'); ?>';
		var novaAba = tabs.items.find(function(aba){
			return aba.title === titulo;
		});
		if(!novaAba) {
			var conf = {
				title: titulo,
				xtype: 'faturamento-form-offline'
			};
			
			if(id_fatura) conf.docId = id_fatura;
			
			novaAba = tabs.add(conf);
		}
		else{
			if(id_fatura) novaAba.loadFatura();
		}
		tabs.activate(novaAba);
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(84)): ?>
	_confirmarFatura: function () {
		var arrSelecionados = this.getSelectionModel().getSelections();
		if (arrSelecionados.length !== 1) {
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('faturamento.confirmar.selecione'); ?>'});
			return false;
		}
		var id = arrSelecionados[0].data.id_fatura;
		uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('faturamento.confirm_question'); ?>', function (o) {
			if (o != 'yes') {
				return;
			}
			this.el.mask('<?php echo DMG_Translate::_('i18n.loading'); ?>');
			var conn = new Ext.data.Connection();
			conn.request({
				url: '<?php echo $this->url(array('controller' => 'faturamento', 'action' => 'confirm-fatura')); ?>',
				params: {
					id: id
				},
				scope: this,
				callback: function (a, b, c) {
					this.el.unmask();
					try {
						var data = Ext.decode(c.responseText);
						if (data.success) {
							uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('faturamento.confirmada'); ?>'});
							this.store.reload();
						} else {
							uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: data.message});
						}
					} catch (e) {};
				}
			});
		}, this);
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(85)): ?>
	_deletarTemporaria: function () {
		var arrSelecionados = this.getSelectionModel().getSelections();
		if (arrSelecionados.length !== 1) {
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('faturamento.deletar_temp.selecione'); ?>'});
			return false;
		}
		var id = arrSelecionados[0].data.id_fatura;
		uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('faturamento.delete_temp_question'); ?>', function (o) {
			if (o != 'yes') {
				return;
			}
			this.el.mask('<?php echo DMG_Translate::_('i18n.loading'); ?>');
			var conn = new Ext.data.Connection();
			conn.request({
				url: '<?php echo $this->url(array('controller' => 'faturamento', 'action' => 'delete-temp')); ?>',
				params: {
					id: id
				},
				scope: this,
				callback: function (a, b, c) {
					this.el.unmask();
					try {
						var data = Ext.decode(c.responseText);
						if (data.success) {
							uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('faturamento.deletada_temp'); ?>'});
							this.store.reload();
						} else {
							uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: data.message});
						}
					} catch (e) {};
				}
			});
		}, this);
	},
	<?php endif; ?>
});
Ext.reg('faturamento-window', FaturamentoWindow);