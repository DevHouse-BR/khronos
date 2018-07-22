var lista_de_consultas_faturamento = <?php echo Khronos_Faturamento_Consultas::getJsonTreeList(); ?>;
var msgCarrega = '<?php echo DMG_Translate::_('i18n.loading'); ?>';

var FaturamentoConsultasPanel = Ext.extend(Ext.Panel, {
	layout:'hbox',
	height: '100%',
	layoutConfig: {
		padding:'5',
		align : 'stretch',
	    pack  : 'start'
	},
	
	defaults:{margins:'0 5 0 0'},
	
	initComponent: function(){
		
		this.treeConsulta = new Ext.tree.TreePanel({
			id:'treeConsulta',
			flex: 1,
			autoScroll: true,
			useArrows: true,
			loader: new Ext.tree.TreeLoader({
				preloadChildren:true
			}),
			root: new Ext.tree.AsyncTreeNode({
				expanded: true,
				children: lista_de_consultas_faturamento
			}),
			rootVisible: false
		});

		/*this.painelConsulta = new Ext.Panel({
			id:'painelConsulta',
			layout: 'fit',
			flex: 5
		});*/
		
		this.painelConsulta = new Ext.TabPanel({
			id:'painelConsultaFaturamento',
			flex: 5,
			activeTab: 0,
			defaults: {
				closable: true
			},
			items:[{
				title: '<?php echo DMG_Translate::_('menu.consultas'); ?>',
				html:'&nbsp;',
				closable: false,
				id:'tabConsultaInicialFaturamento'
			}]
		});
		
		Ext.apply(this,{
			items:[
			    this.treeConsulta,
			    this.painelConsulta
			]
		});
		FaturamentoConsultasPanel.superclass.initComponent.call(this);
	},
	abreAbas: function(id, consulta){
		var painel = Ext.getCmp('painelConsultaFaturamento');
		this.el.mask(msgCarrega);
		var abaInicial = painel.findById('tabConsultaInicialFaturamento');
		if(abaInicial){
			painel.remove('tabConsultaInicialFaturamento');
		}
		var aba = painel.findById(id);
		if(!aba){
			var c = new consulta();
			var aba = painel.add(c);
		}
		painel.activate(aba);
		this.el.unmask();
	},
	initEvents: function () {
		this.treeConsulta.on('click', function(node) {
			if (node.isLeaf()) {
				
				var consultaFile = node.attributes.eXtype;
				
				if(consultaFile == 'historicoMaquinaFaturamento'){
					<?php if(DMG_Acl::canAccess(86)): ?>
						this.abreAbas('historicoMaquinaFaturamento', FaturamentoConsultaWindow);
					<?php endif; ?>
				}
			}
			else {
				node.expand();
			}
		}, this);
		FaturamentoConsultasPanel.superclass.initEvents.call(this);
	},
	onDestroy: function () {
		FaturamentoConsultasPanel.superclass.onDestroy.apply(this, arguments);
	}
});
Ext.reg('faturamento-consultas', FaturamentoConsultasPanel);