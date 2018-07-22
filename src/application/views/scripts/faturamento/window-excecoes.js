Ext.namespace('Faturamento.Excecoes');

Faturamento.Excecoes.baseUrl = '<?php echo $this->BaseUrl(); ?>';
Faturamento.Excecoes.grid_empty = '<?php echo DMG_Translate::_('grid.empty'); ?>';
Faturamento.Excecoes.all = '<?php echo DMG_Translate::_('grid.paginator.all'); ?>';
Faturamento.Excecoes.por_pagina = '<?php echo DMG_Translate::_('grid.paginator.perpage'); ?>';
Faturamento.Excecoes.nr_fatura = '<?php echo DMG_Translate::_('window.portal.nr_fatura'); ?>';
Faturamento.Excecoes.dt_fatura = '<?php echo DMG_Translate::_('window.portal.dt_fatura'); ?>';
Faturamento.Excecoes.nr_serie = '<?php echo DMG_Translate::_('window.portal.nr_serie'); ?>';
Faturamento.Excecoes.nr_serie_aux = '<?php echo DMG_Translate::_('parque.maquina.form.nr_serie_aux.text'); ?>';
Faturamento.Excecoes.descricao = '<?php echo DMG_Translate::_('faturamento.descricao'); ?>';
Faturamento.Excecoes.username = '<?php echo DMG_Translate::_('faturamento.excecao.usuario'); ?>';

Faturamento.Excecoes.sm = new Ext.grid.CheckboxSelectionModel();

Faturamento.Excecoes.GridExcecoes = Ext.extend(Ext.grid.GridPanel, {
	border: false,
	id:'gridFaturas',
	stripeRows: true,
	loadMask: true,
	sm: Faturamento.Excecoes.sm,
	columnLines: true,
	viewConfig: {
		emptyText: Faturamento.Excecoes.grid_empty,
		deferEmptyText: false
	},
	initComponent: function(){

		this.store = new Ext.data.JsonStore({
			url: Faturamento.Excecoes.baseUrl + '/faturamento/excecoeslist',
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
			    {name: 'id_fatura_doc', type: 'int'},
			    {name: 'dt_fatura', type: 'date', dateFormat: 'Y-m-d H:i:s'},
				{name: 'nr_serie_imob', type: 'string'},
				{name: 'nr_serie_aux', type: 'string'},
				{name: 'nm_fatura_excecao_tipo', type: 'string'},
				{name: 'usuario', type: 'string'}
			]
		});
		
		this.cm = new Ext.grid.ColumnModel({
			columns: [
		  	    Faturamento.Excecoes.sm,
		  	{
		  	    dataIndex: 'id_fatura_doc',
		  		header: Faturamento.Excecoes.nr_fatura,
		  		width:140,
		  		sortable: true
		  	},{
		  	    dataIndex: 'dt_fatura',
		  		header: Faturamento.Excecoes.dt_fatura,
		  		sortable: true,
		  		width:150,
		  		renderer:  function(data, cell, record, rowIndex, columnIndex, store) {
		  			if(data != "")	return data.format("d/m/Y H:i \\h\\s");
		  		}
		  	}, {
		  		dataIndex: 'nr_serie_imob',
		  		header: Faturamento.Excecoes.nr_serie,
		  		width:130,
		  		sortable: true
		  	}, {
		  		dataIndex: 'nr_serie_aux',
		  		header: Faturamento.Excecoes.nr_serie_aux,
		  		width:130,
		  		sortable: true
		  	}, {
		  		dataIndex: 'nm_fatura_excecao_tipo',
		  		header: Faturamento.Excecoes.descricao,
		  		width:180,
		  		sortable: true
		  	}, {
		  		dataIndex: 'usuario',
		  		header: Faturamento.Excecoes.username,
		  		width:150,
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
					['0', Faturamento.Excecoes.all],
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
		       Faturamento.Excecoes.por_pagina,
		       comboPaginator
			]
		});
		
		this.bbar = paginator;		
		Faturamento.Excecoes.GridExcecoes.superclass.initComponent.call(this);
	}
});
Ext.reg('faturamento-excecao', Faturamento.Excecoes.GridExcecoes);