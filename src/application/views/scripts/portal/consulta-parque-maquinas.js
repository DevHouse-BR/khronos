Ext.namespace('Portal.ParqueMaquinas');
Portal.ParqueMaquinas.sm = new Ext.grid.CheckboxSelectionModel();

Portal.ParqueMaquinas.GridParqueMaquinas = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	stripeRows: true,
	loadMask: true,
	sm: Portal.ParqueMaquinas.sm,
	columnLines: true,
	viewConfig: {
		emptyText: Portal.Names.br.grid_empty,
		deferEmptyText: false
	},
	initComponent: function(){

		this.store = new Ext.data.JsonStore({
			url: Portal.baseUrl + '/portal/parquelist',
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
				start: 0,
				limit: 30
			},
			fields: [
				{name: 'id', type: 'int'},
				{name: 'nr_serie_imob', type: 'string'},
				{name: 'nr_serie_aux', type: 'string'},
				{name: 'nm_jogo', type: 'string'},
				{name: 'nr_versao_jogo', type: 'string'},
				{name: 'nm_gabinete', type: 'string'},
				{name: 'nm_moeda', type: 'string'},
				{name: 'vl_credito', type: 'float'},
				{name: 'dt_ultima_movimentacao', type: 'date', dateFormat: 'Y-m-d H:i:s'},
				{name: 'dt_ultimo_faturamento', type: 'date', dateFormat: 'Y-m-d H:i:s'},
				{name: 'dt_ultima_transformacao', type: 'date', dateFormat: 'Y-m-d H:i:s'},
				{name: 'dt_ultima_regularizacao', type: 'date', dateFormat: 'Y-m-d H:i:s'},
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
		  		dataIndex: 'nm_gabinete',
		  		header: Portal.Names.br.nm_gabinete
		  	}, {
		  		dataIndex: 'nm_moeda',
		  		header: Portal.Names.br.nm_moeda
		  	}, {
		  		dataIndex: 'vl_credito',
		  		header: Portal.Names.br.vl_credito
		  	}, {
		  		dataIndex: 'dt_ultima_movimentacao',
		  		header: Portal.Names.br.dt_ultima_movimentacao,
		  		renderer:  function(data, cell, record, rowIndex, columnIndex, store) {
		  			if(data != "")	return data.format("d/m/Y H:i \\h\\s");
		  		}
		  	}, {
		  		dataIndex: 'dt_ultimo_faturamento',
		  		header: Portal.Names.br.dt_ultimo_faturamento,
		  		renderer:  function(data, cell, record, rowIndex, columnIndex, store) {
		  			if(data != "")	return data.format("d/m/Y H:i \\h\\s");
		  		}
		  	}, {
		  		dataIndex: 'dt_ultima_transformacao',
		  		header: Portal.Names.br.dt_ultima_transformacao,
		  		renderer:  function(data, cell, record, rowIndex, columnIndex, store) {
		  			if(data != "")	return data.format("d/m/Y H:i \\h\\s");
		  		}
		  	}, {
		  		dataIndex: 'dt_ultima_regularizacao',
		  		header: Portal.Names.br.dt_ultima_regularizacao,
		  		renderer:  function(data, cell, record, rowIndex, columnIndex, store) {
		  			if(data != "")	return data.format("d/m/Y H:i \\h\\s");
		  		}
		  	}, {
		  		dataIndex: 'nr_serie_connect',
		  		header: Portal.Names.br.nr_serie_connect,
		  		sortable: true
		  	}]
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
		       comboPaginator
			]
		});
		
		this.bbar = paginator;
		
		Portal.ParqueMaquinas.GridParqueMaquinas.superclass.initComponent.call(this);
	}
});
Ext.reg('consulta-parque-maquinas', Portal.ParqueMaquinas.GridParqueMaquinas);