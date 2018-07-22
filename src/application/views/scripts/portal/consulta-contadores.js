Ext.namespace('Portal.Contadores');
Portal.Contadores.sm = new Ext.grid.CheckboxSelectionModel();

Portal.Contadores.GridContadores = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	stripeRows: true,
	loadMask: true,
	sm: Portal.ParqueMaquinas.sm,
	columnLines: true,
	viewConfig: {
		emptyText: Portal.Names.br.grid_empty,
		deferEmptyText: false
	},
	_onBtnMovimentarSelecionadosClick: function () {
		this.el.mask(Portal.Names.br.loading);
		var arrSelecionados = this.getSelectionModel().getSelections();
		var ids = [];
		if (arrSelecionados.length == 0) {
			for (var i = 0; i < this.store.data.items.length; i++) {
				ids[i] = this.store.data.items[i].id;
			}
		} else {
			for (var i = 0; i < arrSelecionados.length; i++) {
				ids[i] = arrSelecionados[i].id;
			}
		}
		var con = new Ext.data.Connection();
		con.request({
			disableCaching: true,
			url: Portal.baseUrl + '/portal/getcontadores',
			method: 'post',
			params: {
				'id[]': ids
			},
			scope: this,
			success: function(response, opts){
				try {
					var data = Ext.decode(response.responseText);
					if (data.success == true) {
						var i = 0;
						while (true) {
							if (!data.data[i]) {
								break;
							}
							var idx = this.store.data.findIndex('id', data.data[i].id);
							var registro = this.store.getAt(idx);
							var dado = data.data[i];
							if (dado.online > 0) {
								registro.set('nr_cont_1', dado.nr_cont_1);
								registro.set('nr_cont_2', dado.nr_cont_2);
								registro.set('nr_cont_3', dado.nr_cont_3);
								registro.set('nr_cont_4', dado.nr_cont_4);
								registro.set('nr_cont_5', dado.nr_cont_5);
								registro.set('nr_cont_6', dado.nr_cont_6);
								registro.set('nr_cont_1_parcial', dado.nr_cont_1_parcial);
								registro.set('nr_cont_2_parcial', dado.nr_cont_2_parcial);
								registro.set('nr_cont_3_parcial', dado.nr_cont_3_parcial);
								registro.set('nr_cont_4_parcial', dado.nr_cont_4_parcial);
								registro.set('nr_cont_5_parcial', dado.nr_cont_5_parcial);
								registro.set('nr_cont_6_parcial', dado.nr_cont_6_parcial);
								registro.commit();
								if (dado.online == 3) {
									Ext.get(this.getView().getRow(idx)).addClass('tgridjogando');
									Ext.get(this.getView().getRow(idx)).removeClass('tgriderror');
								}
								else if (dado.online == 2) {
									Ext.get(this.getView().getRow(idx)).addClass('tgriderror');
									Ext.get(this.getView().getRow(idx)).removeClass('tgridjogando');
								}
								else if (dado.online == 1) {
									Ext.get(this.getView().getRow(idx)).removeClass('tgridjogando');
									Ext.get(this.getView().getRow(idx)).removeClass('tgriderror');
								}
							}
							else {
								registro.set('nr_cont_1', '');
								registro.set('nr_cont_2', '');
								registro.set('nr_cont_3', '');
								registro.set('nr_cont_4', '');
								registro.set('nr_cont_5', '');
								registro.set('nr_cont_6', '');
								registro.set('nr_cont_1_parcial', '');
								registro.set('nr_cont_2_parcial', '');
								registro.set('nr_cont_3_parcial', '');
								registro.set('nr_cont_4_parcial', '');
								registro.set('nr_cont_5_parcial', '');
								registro.set('nr_cont_6_parcial', '');
								registro.commit();
								Ext.get(this.getView().getRow(idx)).addClass('tgriderror');
								Ext.get(this.getView().getRow(idx)).removeClass('tgridjogando');
							}
							this.getSelectionModel().deselectRow(idx);
							i++;
						}
					} else {
						uiHelper.showMessageBox({title: Portal.Names.br.grid_alert_title, msg: data.message});
					}
				} catch (e) {};
				this.el.unmask();
			},
			failure:HttpHelpers.failHandler
		});
	},
	initComponent: function(){

		this.store = new Ext.data.JsonStore({
			url: Portal.baseUrl + '/portal/contadoreslist',
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
			listeners:{
				load: function(store, records, options){
					if(records.length == 0) Ext.getCmp('btnConsultaContadores').disable();
					else Ext.getCmp('btnConsultaContadores').enable();
				}
			},
			baseParams: {
				start: 0,
				limit: 30
			},
			fields: [
				{name: 'id', type: 'int'},
				{name: 'nr_serie_imob', type: 'string'},
				{name: 'nr_serie_aux', type: 'string'},
				{name: 'nm_jogo', type: 'string'},
				{name: 'nr_versao_jogo', type: 'string'},
				{name: 'nm_status_maquina', type: 'string'},
				{name: 'nm_moeda', type: 'string'},
				{name: 'vl_credito', type: 'float'},
				{name: 'id_local', type: 'int'},
				{name: 'id_protocolo', type: 'int'},
				{name: 'nr_cont_1', type: 'int'},
				{name: 'nr_cont_2', type: 'int'},
				{name: 'nr_cont_3', type: 'int'},
				{name: 'nr_cont_4', type: 'int'},
				{name: 'nr_cont_5', type: 'int'},
				{name: 'nr_cont_6', type: 'int'},
				{name: 'nr_cont_1_parcial', type: 'int'},
				{name: 'nr_cont_2_parcial', type: 'int'},
				{name: 'nr_cont_3_parcial', type: 'int'},
				{name: 'nr_cont_4_parcial', type: 'int'},
				{name: 'nr_cont_5_parcial', type: 'int'},
				{name: 'nr_cont_6_parcial', type: 'int'},
				{name: 'nr_serie_connect', type: 'string'}
			]
		});
		
		this.cm = new Ext.grid.ColumnModel({
			columns: [
		  	    Portal.ParqueMaquinas.sm,
		  	{
		  	    dataIndex: 'id',
		  		header: Portal.Names.br.grid_maquinas_id,
		  		width: 40,
		  		sortable: true
		  	}, {
		  		dataIndex: 'nr_serie_imob',
		  		header: Portal.Names.br.nr_serie_imob,
		  		sortable: true
		  	}, {
		  		dataIndex: 'nr_serie_aux',
		  		header: Portal.Names.br.nr_serie_aux,
		  		sortable: true
		  	}, {
		  		dataIndex: 'nm_jogo',
		  		header: Portal.Names.br.nm_jogo
		  	}, {
		  		dataIndex: 'nr_versao_jogo',
		  		header: Portal.Names.br.nr_versao_jogo
			}, {
		  		dataIndex: 'nm_status_maquina',
		  		header: Portal.Names.br.nm_status_maquina
		  	}, {
		  		dataIndex: 'nm_moeda',
		  		header: Portal.Names.br.nm_moeda
		  	}, {
		  		dataIndex: 'vl_credito',
		  		header: Portal.Names.br.vl_credito
		  	}, {
		  		dataIndex: 'nr_cont_1',
		  		header: Portal.Names.br.nr_cont_1
		  	}, {
		  		dataIndex: 'nr_cont_2',
		  		header: Portal.Names.br.nr_cont_2
		  	}, {
		  		dataIndex: 'nr_cont_3',
		  		header: Portal.Names.br.nr_cont_3
		  	}, {
		  		dataIndex: 'nr_cont_4',
		  		header: Portal.Names.br.nr_cont_4
		  	}, {
		  		dataIndex: 'nr_cont_5',
		  		header: Portal.Names.br.nr_cont_5
		  	}, {
		  		dataIndex: 'nr_cont_6',
		  		header: Portal.Names.br.nr_cont_6
		  	}, {
		  		dataIndex: 'nr_cont_1_parcial',
		  		header: Portal.Names.br.nr_cont_1_parcial
		  	}, {
		  		dataIndex: 'nr_cont_2_parcial',
		  		header: Portal.Names.br.nr_cont_2_parcial
		  	}, {
		  		dataIndex: 'nr_cont_3_parcial',
		  		header: Portal.Names.br.nr_cont_3_parcial
		  	}, {
		  		dataIndex: 'nr_cont_4_parcial',
		  		header: Portal.Names.br.nr_cont_4_parcial
		  	}, {
		  		dataIndex: 'nr_cont_5_parcial',
		  		header: Portal.Names.br.nr_cont_5_parcial
		  	}, {
		  		dataIndex: 'nr_cont_6_parcial',
		  		header: Portal.Names.br.nr_cont_6_parcial
		  	}, {
		  		dataIndex: 'nr_serie_connect',
		  		header: Portal.Names.br.nr_serie_connect,
		  		sortable: true
		  	}]
		});
		
		this.tbar = new  Ext.Toolbar({
			items:[
			       '->',
			       {
			    	   text: Portal.Names.br.grid_contadores_consulta,
			    	   iconCls: 'silk-cog',
			    	   scope: this,
			    	   id: 'btnConsultaContadores',
					   handler: this._onBtnMovimentarSelecionadosClick
			       }
			]
		});

		var comboPaginator = new Ext.form.ComboBox({
			name: 'perpage',
			width: 60,
			store: new Ext.data.ArrayStore({
				fields: ['id', 'name'],
				data  : [
					['15', '15'],
					['30', '30'],
					['50', '50'],
					['0', Portal.Names.br.all],
				]
			}),
			mode: 'local',
			value: 30,
			listWidth: 60,
			triggerAction: 'all',
			displayField: 'name',
			valueField: 'id',
			editable: false,
			forceSelection: true
		});
		
		comboPaginator.on('select', function(combo, record) {
			paginator.pageSize = parseInt(record.get('id'), 10);
			paginator.doLoad(paginator.cursor);
		}, this);
		
		var paginator = new Ext.PagingToolbar({
			store: this.store,
			pageSize: 30,
			displayInfo: true,
			animate: true,
			plugins: new Ext.ux.plugins.ProgressPagingToolbar(),
			items:[
			    '-',
		       	Portal.Names.br.por_pagina,
		       	comboPaginator,
				'-',
				'<img src="' + Portal.baseUrl + '/images/red_square.gif" align="left" />&nbsp;' + Portal.Names.br.status_maquina_offline,
				'-',
				'<img src="' + Portal.baseUrl + '/images/green_square.gif" align="left" />&nbsp;' + Portal.Names.br.status_maquina_jogando,
				'-',
				'<img src="' + Portal.baseUrl + '/images/white_square.gif" align="left" />&nbsp;' + Portal.Names.br.status_maquina_online
			]
		});
		
		this.bbar = paginator;
		
		Portal.Contadores.GridContadores.superclass.initComponent.call(this);
	}
});
Ext.reg('consulta-contadores', Portal.Contadores.GridContadores);