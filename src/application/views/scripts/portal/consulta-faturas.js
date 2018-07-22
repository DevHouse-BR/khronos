Ext.namespace('Portal.Faturas');
Portal.Faturas.sm = new Ext.grid.CheckboxSelectionModel();

Portal.Faturas.GridFaturas = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	id:'gridFaturas',
	stripeRows: true,
	loadMask: true,
	sm: Portal.Faturas.sm,
	columnLines: true,
	viewConfig: {
		emptyText: Portal.Names.br.grid_empty,
		deferEmptyText: false
	},
	initComponent: function(){

		this.store = new Ext.data.JsonStore({
			url: Portal.baseUrl + '/portal/faturamentolist',
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
			    {name: 'dt_fatura', type: 'date', dateFormat: 'Y-m-d H:i:s'},
				{name: 'id', type: 'int'},
				{name: 'vl_fatura', type: 'string'}
			]
		});
		
		this.cm = new Ext.grid.ColumnModel({
			columns: [
		  	    Portal.Faturas.sm,
		  	{
		  	    dataIndex: 'dt_fatura',
		  		header: Portal.Names.br.dt_fatura,
		  		sortable: true,
		  		width:150,
		  		renderer:  function(data, cell, record, rowIndex, columnIndex, store) {
		  			if(data != "")	return data.format("d/m/Y H:i \\h\\s");
		  		}
		  	}, {
		  		dataIndex: 'id',
		  		header: Portal.Names.br.nr_fatura,
		  		sortable: true
		  	}, {
		  		dataIndex: 'vl_fatura',
		  		header: Portal.Names.br.vl_fatura,
		  		sortable: true,
		  		align:'right'
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
		
		this.tbar = ['->',{
			text:Portal.Names.br.imp_fatura,
			iconCls:'silk-printer',
			handler: function(botao, evento){
				var arrSelecionados = Ext.getCmp('gridFaturas').getSelectionModel().getSelections();

				if (arrSelecionados.length > 1) {
					Ext.Msg.alert(Portal.Names.br.grid_alert_title, Portal.Names.br.imp_manyerror);
					return false;
				}
				if (arrSelecionados.length === 0) {
					Ext.Msg.alert(Portal.Names.br.grid_alert_title, Portal.Names.br.imp_oneerror);
					return false;
				}
				var id = arrSelecionados[0].id;
				window.open('<?php echo $this->BaseUrl(); ?>/download.php?fl_portal=on&tipo=fatura&id=' + id, 'print');
			}
		}];
		
		Portal.Faturas.GridFaturas.superclass.initComponent.call(this);
	}
});
Ext.reg('consulta-faturas', Portal.Faturas.GridFaturas);