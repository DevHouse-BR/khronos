var lista_de_consultas = <?php echo Khronos_Consultas::getJsonTreeList(); ?>;
var msgCarrega = '<?php echo DMG_Translate::_('i18n.loading'); ?>';

var ConsultasPanel = Ext.extend(Ext.Panel, {
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
				children: lista_de_consultas
			}),
			rootVisible: false
		});

		/*this.painelConsulta = new Ext.Panel({
			id:'painelConsulta',
			layout: 'fit',
			flex: 5
		});*/
		
		this.painelConsulta = new Ext.TabPanel({
			id:'painelConsulta',
			flex: 5,
			activeTab: 0,
			defaults: {
				closable: true
			},
			items:[{
				title: '<?php echo DMG_Translate::_('menu.consultas'); ?>',
				html:'&nbsp;',
				closable: false,
				id:'tabConsultaInicial'
			}]
		});
		
		Ext.apply(this,{
			items:[
			    this.treeConsulta,
			    this.painelConsulta
			]
		});
		ConsultasPanel.superclass.initComponent.call(this);
	},
	abreAbas: function(id, consulta){
		var painel = Ext.getCmp('painelConsulta');
		this.el.mask(msgCarrega);
		var abaInicial = painel.findById('tabConsultaInicial');
		if(abaInicial){
			painel.remove('tabConsultaInicial');
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
							
				
				if(consultaFile == 'parque-consulta-parque'){
					<?php if(DMG_Acl::canAccess(30)): ?>
						this.abreAbas('gridConsultaContadores', ParqueConsultaParqueWindow);
					<?php endif; ?>
				}
				else if(consultaFile == 'historicoMaquinas'){		
					<?php if(DMG_Acl::canAccess(71)): ?>					
						this.abreAbas('gridConsultaMaquina', ConsultaHistoricoMaquinaWindow);
					<?php endif; ?>
				}
				else if(consultaFile == 'parque-consulta-entradas'){		
					<?php if(DMG_Acl::canAccess(87)): ?>					
						this.abreAbas('gridConsultaEntrada', ParqueConsultaEntradasWindow);
					<?php endif; ?>
				}
			}
			else {
				node.expand();
			}
		}, this);
		ConsultasPanel.superclass.initEvents.call(this);
	},
	onDestroy: function () {
		ConsultasPanel.superclass.onDestroy.apply(this, arguments);
	}
});
Ext.reg('consultas', ConsultasPanel);