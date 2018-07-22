var sm = new Ext.grid.CheckboxSelectionModel();
var ParqueMaquinaWindowFilter = new Ext.ux.grid.GridFilters({
	local: false,
	menuFilterText: '<?php echo DMG_Translate::_('grid.filter.label'); ?>',
	filters: []
});
var PMWStore = "";
var ParqueMaquinaWindow = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	stripeRows: true,
	loadMask: true,
	sm: sm,
	columnLines: true,
	plugins: [ParqueMaquinaWindowFilter],
	initComponent: function () {
		ParqueMaquinaWindowFilter.addFilter({
			type: 'string',
			dataIndex: 'nr_serie_imob',
			phpMode: true
		});
		this.store = new Ext.data.JsonStore({
			url: '<?php echo $this->url(array('controller' => 'maquina', 'action' => 'list'), null, true); ?>',
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
				limit: 30,
				status: 1
			},
			fields: [
				{name: 'id', type: 'int'},
				{name: 'nr_serie_imob', type: 'string'},
				{name: 'nr_serie_connect', type: 'string'},
				{name: 'nr_serie_aux', type: 'string'},
				{name: 'nm_jogo', type: 'string'},
				{name: 'nm_filial', type: 'string'},
				{name: 'nm_local', type: 'string'},
				{name: 'nm_parceiro', type: 'string'},
				{name: 'simbolo_moeda', type: 'string'},
				{name: 'nm_status_maquina', type: 'string'},
				{name: 'vl_credito', type: 'string'},
				{name: 'nr_cont_1', type: 'string'},
				{name: 'nr_cont_2', type: 'string'},
				{name: 'nr_cont_3', type: 'string'},
				{name: 'nr_cont_4', type: 'string'},
				{name: 'nr_cont_5', type: 'string'},
				{name: 'nr_cont_6', type: 'string'},
				{name: 'percent_local', type: 'float'}
			]
		});
		PMWStore = this.store;
		
		var paginator = new Ext.PagingToolbar({
			store: this.store,
			pageSize: 30,
			plugins: [ParqueMaquinaWindowFilter],
			buttons:['-', {
				text: '<?php echo DMG_Translate::_('grid.bbar.clearfilter'); ?>',
				scope:this,
				handler: function(botao, evento){
					this.comboLocais.reset();
					this.filtroField.reset();
					this.store.baseParams.local = 0;
					ParqueMaquinaWindowFilter.clearFilters();
				}
			}]
		});
		
		var comboStatus = new Ext.form.ComboBox({
			width:75,
			name: 'status',
			store: new Ext.data.ArrayStore({
				fields: ['id', 'name'],
				data  : [
					['0', '<?php echo DMG_Translate::_('parque.maquina.status.inativa'); ?>'],
					['1', '<?php echo DMG_Translate::_('parque.maquina.status.ativa'); ?>']
				]
			}),
			mode: 'local',
			value: '1',
			triggerAction: 'all',
			displayField: 'name',
			valueField: 'id',
			editable: false,
			forceSelection: true
		});
		comboStatus.on('select', function(combo, record) {
			this.store.baseParams.status = parseInt(record.get('id'), 10);
			this.store.reload();
		}, this);
		
		
		this.comboLocais = new Ext.form.ComboBox({
			name: 'status',
			minChars:3,
			typeAhead: true,
			store: new Ext.data.JsonStore({
				url: '<?php echo $this->url(array('controller' => 'regularizacao', 'action' => 'locais'), null, true); ?>',
				root: 'data',
				fields: ['id', 'nm_local'],
			}),
			mode: 'remote',
			width: 170,
			triggerAction: 'all',
			displayField: 'nm_local',
			valueField: 'id',
			style:'margin-left:5px',
			//editable: false,
			forceSelection: true,
			listeners: {
				scope: this,
				select: function(combo, record) {
					this.store.baseParams.local = parseInt(record.get('id'));
					ParqueMaquinaWindowFilter.getFilter(0).active = true;
					ParqueMaquinaWindowFilter.getFilter(0).setValue(this.filtroField.getValue());
					//this.store.reload();
				}
			}
		});
		
		
		Ext.apply(this, {
			viewConfig: {
				emptyText: '<?php echo DMG_Translate::_('grid.empty'); ?>',
				deferEmptyText: false
			},
			bbar: paginator,
			tbar: [comboStatus, this.comboLocais, {
				xtype:'textfield',
				style:'margin-left:10px',
				ref: '../filtroField',
				listeners:{
					specialkey:function(campo, e){
						if (e.getKey() == 13){
							ParqueMaquinaWindowFilter.getFilter(0).active = true;
							ParqueMaquinaWindowFilter.getFilter(0).setValue(campo.getValue());
						}
					}
				}
			}, '->'
			<?php if (DMG_Acl::canAccess(27)): ?>
			,{
				text: '<?php echo DMG_Translate::_('grid.form.add'); ?>',
				iconCls: 'silk-add',
				scope: this,
				handler: this._onBtnNovoUsuarioClick
			}
			<?php endif; ?>
			<?php if (DMG_Acl::canAccess(75)): ?>
			,{
				style:'margin:5px 5px 5px 0px',
				xtype: 'button',
				iconCls:'icon-percent',
				text: '<?php echo DMG_Translate::_('parque.maquina.ajustar_percentual'); ?>',
				scope: this,
				handler: function(botao, evento){
					if(this.sm.getCount() != 1){
						uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('parque.maquina.bntstatus.manyerror'); ?>'});
						return;
					}
					var registro = this.sm.getSelected(); 
					var form = new Ext.FormPanel({
						bodyStyle: 'padding:10px;',
						id:'formPercent',
						border: false,
						monitorValid:true,
						autoScroll: true,
						defaults: {
							anchor: '-19',
							xtype:'textfield'
						},
						items:[{
							id: 'id_maquinaField',
        					name: 'id_maquina',
        					allowBlank: false,
        					xtype: 'hidden',
        					inputType: 'hidden',
        					value: registro.data.id
						},{
							name:'nr_serie_imob',
							id: 'nrMaquina',
							fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_serie_imob.text'); ?>',
							disabled:true,
							value: registro.data.nr_serie_imob
						},{
							name:'percent_local_old',
							id: 'percent_local_old',
							fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.percent_atual'); ?>',
							disabled:true,
							value: registro.data.percent_local
						},{
							name:'percent_local_new',
							id: 'percent_local_new',
							fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.percent_novo'); ?>',
							maskRe: /[0-9]/,
							maxLength: 3,
							allowBlank: false
						}],
						buttons:[{
							text: '<?php echo DMG_Translate::_('grid.form.save'); ?>',
							iconCls: 'icon-save',
							scope: this,
							formBind: true,
							handler: function(botao, evento){
								uiHelper.confirm('<?php echo DMG_Translate::_('grid.form.confirm.title'); ?>', '<?php echo DMG_Translate::_('parque.maquina.confirma_percent'); ?>', function (opt) {
									if (opt === 'no') {
										return;
									}
									
									var form = Ext.getCmp('formPercent');
									form.getForm().submit({
										method:'POST',
										url:'<?php echo $this->url(array('controller' => 'maquina', 'action' => 'percent')); ?>',
										waitMsg: '<?php echo DMG_Translate::_('parque.maquina.gravando'); ?>',
										waitTitle: '<?php echo DMG_Translate::_('parque.maquina.aguarde'); ?>',
										success:function(){
											Ext.getCmp('janelaPerc').close();
											PMWStore.reload();
										},
										failure: function(form, action){
											var obj = Ext.decode(action.response.responseText);
											uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: obj.errormsg});
										}
									});
									
								});
							}
						},{
							text: '<?php echo DMG_Translate::_('grid.form.cancel'); ?>',
							iconCls: 'silk-cross',
							scope: this,
							handler: function(botao, evento){
								Ext.getCmp('janelaPerc').close();
							}
						}]
					});
					
					var janela = new Ext.Window({
						id:'janelaPerc',
						modal: true,
						constrain: true,
						maximizable: false,
						resizable: false,
						width: 350,
						height: 170,
						title: '<?php echo DMG_Translate::_('parque.local-tipo.form.title'); ?>',
						layout: 'fit',
						items:[form],
						listeners:{
							show: function(){
								Ext.getCmp('percent_local_new').focus(false, 500);
							}
						}
					});
					
					janela.show();
				}
			}
			<?php endif; ?>
			<?php if (DMG_Acl::canAccess(71)): ?>
			,{
				style:'margin:5px 5px 5px 0px',
				xtype: 'button',
				iconCls:'icon-book',
				text: '<?php echo DMG_Translate::_('consultas.historico_maquinas'); ?>',
				scope: this,
				handler: function(botao, evento){
					if(this.sm.getCount() != 1){
						uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('parque.maquina.bntstatus.manyerror'); ?>'});
						return;
					}
					var registro = this.sm.getSelected();
					var titulo = '<?php echo DMG_Translate::_('menu.consultas'); ?>';
					var novaAba = tabs.items.find(function(aba){
						return aba.title === titulo;
					});
					if(!novaAba) {
						novaAba = tabs.add({
							title: titulo,
							xtype: 'consultas'
						});
					}
					tabs.activate(novaAba);
					var tree = Ext.getCmp('treeConsulta');
					var node = tree.getNodeById('id_historicoMaquinas');
					var path = node.getPath();
					node.fireEvent('click', node);
					tree.expandPath(path);
					var combo = Ext.getCmp('comboConsultaMaquinas');
				    combo.setValue(registro.data.nr_serie_imob);
					var grid = Ext.getCmp('gridConsultaMaquina');
	                grid.store.baseParams['id_maquina'] = registro.data.id;
	                grid.store.reload();
				}
			}
			<?php endif; ?>
			],
			columns: [sm, {
				dataIndex: 'id',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id.text'); ?>',
				width: 40,
				sortable: true
			}, {
				dataIndex: 'nr_serie_imob',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_serie_imob.text'); ?>',
				sortable: true
			}, {
				dataIndex: 'nr_serie_aux',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_serie_aux.text'); ?>',
				sortable: true
			}, {
				dataIndex: 'nm_jogo',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_jogo.text'); ?>',
			}, {
				dataIndex: 'nm_filial',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_filial.text'); ?>',
			}, {
				dataIndex: 'nm_local',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_local.text'); ?>',
			}, {
				dataIndex: 'nm_parceiro',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_parceiro.text'); ?>',
			}, {
				dataIndex: 'nm_status_maquina',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_status.text'); ?>',
			}, {
				dataIndex: 'simbolo_moeda',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.id_moeda.text'); ?>',
			}, {
				dataIndex: 'vl_credito',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.vl_credito.text'); ?>',
			}, {
				dataIndex: 'nr_cont_1',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_1.text'); ?>',
			}, {
				dataIndex: 'nr_cont_2',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_2.text'); ?>',
			}, {
				dataIndex: 'nr_cont_3',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_3.text'); ?>',
			}, {
				dataIndex: 'nr_cont_4',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_4.text'); ?>',
			}, {
				dataIndex: 'nr_cont_5',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_5.text'); ?>',
			}, {
				dataIndex: 'nr_cont_6',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_6.text'); ?>',
			}, {
				dataIndex: 'nr_serie_connect',
				header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_serie_connect.text'); ?>',
				sortable: true
			}]
		});
		ParqueMaquinaWindow.superclass.initComponent.call(this);
	},
	initEvents: function () {
		ParqueMaquinaWindow.superclass.initEvents.call(this);
		this.on({
			scope: this,
			<?php if (DMG_Acl::canAccess(26)): ?>
			rowdblclick: this._onGridRowDblClick
			<?php endif; ?>
		});
	},
	onDestroy: function () {
		ParqueMaquinaWindow.superclass.onDestroy.apply(this, arguments);
		Ext.destroy(this.window);
		this.window = null;
	},
	<?php if (DMG_Acl::canAccess(27)): ?>
	_onBtnNovoUsuarioClick: function () {
		this._newForm();
		this.window.setmaquina(0);
		this.window.show();
		document.getElementById('parqueMaquinaWindow').style.zIndex = 50;
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(26) || DMG_Acl::canAccess(27)): ?>
	_onCadastroUsuarioSalvarExcluir: function () {
		this.store.reload();
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(26)): ?>
	_onGridRowDblClick: function (grid, rowIndex, e) {
		var record = grid.getStore().getAt(rowIndex);
		var id = record.get('id');
		this._newForm();
		this.window.setmaquina(id);
		this.window.show();
	},
	<?php endif; ?>
	<?php if (DMG_Acl::canAccess(26) || DMG_Acl::canAccess(27)): ?>
	_newForm: function () {
		if (!this.window) {
			this.window = new ParqueMaquinaForm({
				renderTo: this.body,
				listeners: {
					scope: this,
					salvar: this._onCadastroUsuarioSalvarExcluir,
				}
			});
		}
		return this.window;
	}
	<?php endif; ?>
});
Ext.reg('parque-maquina', ParqueMaquinaWindow);