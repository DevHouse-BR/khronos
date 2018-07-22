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
var consultas_movimentacoes = '<?php echo DMG_Translate::_('consultas.movimentacoes'); ?>';
var consultas_transformacoes = '<?php echo DMG_Translate::_('consultas.transformacoes'); ?>';
var consultas_regularizacoes = '<?php echo DMG_Translate::_('consultas.regularizacoes'); ?>';
var consultas_mudanca_status = '<?php echo DMG_Translate::_('consultas.mudanca_status'); ?>';
var consultas_ajuste_percentual = '<?php echo DMG_Translate::_('consultas.ajuste_percentual'); ?>';
var consultas_historico_maquinas = '<?php echo DMG_Translate::_('consultas.historico_maquinas'); ?>';


var ConsultaHistoricoMaquinaWindow = Ext.extend(Ext.grid.GridPanel, {
	width:'100%',
	title: consultas_historico_maquinas,
	id:'gridConsultaMaquina',
	loadMask: true,
	stripeRows:true,
	columnLines: true,
	viewConfig: {
		autoFill: true,
        forceFit:true
    },
    autoExpandColumn: 'filialCol',
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
	    	header: 'ID',
			dataIndex: 'id',
			width: 44,
			sortable: false
	    },{
	    	header: consultas_tipo,
			dataIndex: 'tipo',
			width: 100,
			sortable: false
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
	    	header: consultas_detalhes,
			dataIndex: 'detalhes',
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
	    }]
	),
    verificaCheckbox: function(){
    	var movimentacoes = Ext.getCmp('check_movimentacoes').checked;
    	var transformacoes = Ext.getCmp('check_transformacoes').checked;
    	var regularizacoes = Ext.getCmp('check_regularizacoes').checked;
    	var status = Ext.getCmp('check_status').checked;
    	var percent = Ext.getCmp('check_percent').checked;
    	
    	var grid = Ext.getCmp('gridConsultaMaquina');
    	
    	grid.store.baseParams['movimentacoes'] = movimentacoes;
    	grid.store.baseParams['transformacoes'] = transformacoes;
    	grid.store.baseParams['regularizacoes'] = regularizacoes;
    	grid.store.baseParams['status'] = status;
    	grid.store.baseParams['percent'] = percent;
    	
		grid.store.reload();
    },
    initComponent: function(){
    	this.store = new Ext.data.JsonStore({
    		url: urlBase + '/consultas/historicoMaquinas',
    		root: 'rows',
    		idProperty: 'indice',
    		baseParams:{
    			movimentacoes: true,
            	transformacoes: true,
            	regularizacoes: true,
            	status: true,
            	percent: true,
    		},
    		fields:[
    		    {name: 'indice', type: 'int'},
    			{name: 'data', type: 'date', dateFormat: "Y-m-d H:i:s"},
    			{name: 'id', type: 'int'},
    			{name: 'tipo', type: 'string'},
    			{name: 'filial', type: 'string'},
    			{name: 'local', type: 'string'},
    			{name: 'detalhes', type: 'string'},
    			{name: 'usuario', type: 'string'},
    			{name: 'dt_sistema', type: 'date', dateFormat: "Y-m-d H:i:s"}
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
        		'<div style="width:6px"></div>',
        		consultas_exibir + ':&nbsp;&nbsp;',
        		{
        	    	xtype:'checkbox',
        	    	id:'check_movimentacoes',
        	    	checked:true,
        	    	listeners:{
        	    		check: function(cbox, checked){
        	    			Ext.getCmp('gridConsultaMaquina').verificaCheckbox();
        	    		}
        	    	}
        		},
        		consultas_movimentacoes + '&nbsp;&nbsp;',
        	    {
        	    	xtype:'checkbox',
        	    	id:'check_transformacoes',
        	    	checked:true,
        	    	listeners:{
        	    		check: function(cbox, checked){
        	    			Ext.getCmp('gridConsultaMaquina').verificaCheckbox();
        	    		}
        	    	}
        		},
        		consultas_transformacoes + '&nbsp;&nbsp;',
        	    {
        	    	xtype:'checkbox',
        	    	id:'check_regularizacoes',
        	    	checked:true,
        	    	listeners:{
        	    		check: function(cbox, checked){
        	    			Ext.getCmp('gridConsultaMaquina').verificaCheckbox();
        	    		}
        	    	}
        		},
        		consultas_regularizacoes + '&nbsp;&nbsp;',
        	    {
        	    	xtype:'checkbox',
        	    	id:'check_status',
        	    	checked:true,
        	    	listeners:{
        	    		check: function(cbox, checked){
        	    			Ext.getCmp('gridConsultaMaquina').verificaCheckbox();
        	    		}
        	    	}
        		},
        		consultas_mudanca_status + '&nbsp;&nbsp;',
        	    {
        	    	xtype:'checkbox',
        	    	id:'check_percent',
        	    	checked:true,
        	    	listeners:{
        	    		check: function(cbox, checked){
        	    			Ext.getCmp('gridConsultaMaquina').verificaCheckbox();
        	    		}
        	    	}
        		},
        		consultas_ajuste_percentual + '&nbsp;&nbsp;',
        	]
        }
    	
    	ConsultaHistoricoMaquinaWindow.superclass.initComponent.call(this);
    }
});