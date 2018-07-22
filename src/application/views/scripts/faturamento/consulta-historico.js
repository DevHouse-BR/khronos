Ext.namespace('Faturamento');

Faturamento.total_bruto = '<?php echo DMG_Translate::_('faturamento.total_bruto'); ?>';
Faturamento.total_local = '<?php echo DMG_Translate::_('faturamento.total_local'); ?>';
Faturamento.total_oper = '<?php echo DMG_Translate::_('faturamento.total_oper'); ?>';

var urlBase = '<?php echo $this->BaseUrl(); ?>';
var consultas_data_historico = '<?php echo DMG_Translate::_('consultas.data_historico'); ?>';
var consultas_tipo = '<?php echo DMG_Translate::_('parque.local.form.tp_local.text'); ?>';
var consultas_filial = '<?php echo DMG_Translate::_('parque.maquina.form.id_filial.text'); ?>';
var consultas_local = '<?php echo DMG_Translate::_('faturamento.id_local.text'); ?>';
var consultas_detalhes = '<?php echo DMG_Translate::_('consultas.detalhes'); ?>';
var consultas_usuario = '<?php echo DMG_Translate::_('auth.username'); ?>';
var consultas_data_sistema = '<?php echo DMG_Translate::_('consultas.data_sistema'); ?>';
var consultas_loading = '<?php echo DMG_Translate::_('i18n.loading'); ?>';
var consultas_selecione = '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>';
var consultas_exibir = '<?php echo DMG_Translate::_('consultas.exibir'); ?>';

var FaturamentoConsultaWindow = Ext.extend(Ext.grid.GridPanel, {
	width:'100%',
	title: '<?php echo DMG_Translate::_('consultas.historico_maquinas'); ?>',
	id:'gridConsultaMaquina',
	loadMask: true,
	stripeRows:true,
	columnLines: true,
	cm: new Ext.grid.ColumnModel(
	    [{
			header: consultas_data_historico,
			dataIndex: 'data',
			width: 100,
			sortable: false,
			renderer:  function(data, cell, record, rowIndex, columnIndex, store) {
				if(data) return data.format("d/m/Y H:i \\h\\s");
			}
	    },{
	    	header: '<?php echo DMG_Translate::_('faturamento.historico.num.fatura'); ?>',
			dataIndex: 'id',
			width: 44,
	    },{
	    	header: consultas_filial,
			dataIndex: 'filial',
			id: 'filialCol',
			width: 100,
			sortable: false
	    },{
	    	header: consultas_local,
			dataIndex: 'local',
			width: 100,
			sortable: false
	    },{
	    	header: consultas_usuario,
			dataIndex: 'usuario',
			width: 100,
			sortable: false
	    },{
	    	header: consultas_data_sistema,
			dataIndex: 'dt_sistema',
			width: 100,
			sortable: false,
			renderer:  function(data, cell, record, rowIndex, columnIndex, store) {
				if(data) return data.format("d/m/Y H:i \\h\\s");
			}
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
			header: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_6.text'); ?>'
		},{
			dataIndex: 'vl_empresa',
			header: Faturamento.total_oper,
			align: 'right'
		},{
			dataIndex: 'vl_bruto',
			header: Faturamento.total_bruto,
			align: 'right'
		},{
			dataIndex: 'vl_local',
			header: Faturamento.total_local,
			align: 'right'
	    }]
	),
    initComponent: function(){
    	this.store = new Ext.data.JsonStore({
    		url: '<?php echo $this->url(array('controller' => 'faturamento', 'action' => 'consulta')); ?>',
    		root: 'rows',
    		idProperty: 'indice',
    		fields:[
    		    {name: 'indice', type: 'int'},
    			{name: 'data', type: 'date', dateFormat: "Y-m-d H:i:s"},
    			{name: 'id', type: 'int'},
    			{name: 'filial', type: 'string'},
    			{name: 'local', type: 'string'},
    			{name: 'usuario', type: 'string'},
    			{name: 'dt_sistema', type: 'date', dateFormat: "Y-m-d H:i:s"},
    			{name: 'nr_cont_1', type: 'string'},
				{name: 'nr_cont_2', type: 'string'},
				{name: 'nr_cont_3', type: 'string'},
				{name: 'nr_cont_4', type: 'string'},
				{name: 'nr_cont_5', type: 'string'},
				{name: 'nr_cont_6', type: 'string'},
				{name: 'vl_bruto', type: 'string'},
				{name: 'vl_empresa', type: 'string'},
				{name: 'vl_local', type: 'string'}
    		]
    	});
    	
    	
    	this.tbar = {
        	items:[
        	    'Maquina:',
        		new Ext.form.ComboBox({
        			id:'comboConsultaMaquinas',
        			typeAhead: true,
        		    triggerAction: 'all',
        		    //lazyRender:false,
        		    mode: 'remote',
        			loadingText: consultas_loading,
        			emptyText:consultas_selecione,
        			pageSize:10,
        			listWidth:260,
        			minChars:3,
        			valueField: 'id',
        		    displayField: 'nr_serie_imob',
        		    listeners:{
        				select: function(combo, record, index ){
        					var grid = Ext.getCmp('gridConsultaMaquina');
        					grid.store.baseParams['id_maquina'] = record.id;
        					grid.store.reload();
        				}
        			},
        			store: new Ext.data.Store({
        			    id: 0,
        			    autoLoad:true,
        				remoteSort: true,
        			    proxy: new Ext.data.HttpProxy({
        			    	url: urlBase + '/consultas/maquinaslist',
        			        method: 'POST'
        			    }),
        			    reader: new Ext.data.JsonReader({
        			    	root: 'data',
        			    	totalProperty: 'total'
        			    },[ 
        					{name: "id", type: "int"},
        					{name: "nr_serie_imob", type: "string"}
        			    ]),
        			    sortInfo:{field: 'nr_serie_imob', direction: "ASC"}
        			})
        		}),
        	]
        }
    	
    	FaturamentoConsultaWindow.superclass.initComponent.call(this);
    }
});
Ext.reg('historicoMaquinaFaturamento', FaturamentoConsultaWindow);