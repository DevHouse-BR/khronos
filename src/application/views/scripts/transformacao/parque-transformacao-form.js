var ParqueTransformacaoForm = Ext.extend(Ext.Window, {
	transformacao: 0,
	maximized: true,
	modal: true,
	constrain: true,
	maximizable: false,
	resizable: false,
	title: '<?php echo DMG_Translate::_('parque.transformacao.form.title'); ?>',
	layout: 'fit',
	closeAction: 'hide',
	settransformacao: function(transformacao) {
		this.transformacao = transformacao;
	},
	constructor: function() {
		this.addEvents({salvar: true});
		ParqueTransformacaoForm.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		this.data = new Ext.form.DateField({
			xtype: 'datetimefield',
			format: 'd/m/Y',
			editable: false,
			labelStyle: 'display: none',
			name: 'dt_transformacao' 
		});
		this.hora = new Ext.ux.form.SpinnerField({
			labelWidth: 40,
			width: 50,
			xtype: 'spinnerfield',
			labelStyle: 'display:none',
			name: 'hora',
			minValue: 0,
			maxValue: 23,
			decimalPrecision: 1,
			accelerate: true
		});
		this.minuto = new Ext.ux.form.SpinnerField({
			labelWidth: 40,
			width: 50,
			xtype: 'spinnerfield',
			labelStyle: 'display:none',
			name: 'minuto',
			minValue: 0,
			maxValue: 59,
			decimalPrecision: 1,
			accelerate: true
		});
		this.formPanel = new Ext.form.FormPanel({
			layout: 'form',
			height: '100%',
			autoScroll: true,
			border: false,
			bodyStyle: 'padding: 5px',
			labelWidth: 150,
			items: [{
				fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_serie_imob.text'); ?>',
				xtype: 'textfield',
				name: 'nr_serie_imob',
				allowBlank: true,
				disabled: true
			}, {
				fieldLabel: '<?php echo DMG_Translate::_('parque.transformacao.form.dt_transformacao.text'); ?>',
				layout: 'column',
				border: false,
				items:[{
					labelAlign: 'top',
					layout: 'form',
					border: false,
					items: [this.data]
				},{
					labelAlign: 'top',
					layout: 'form',
					border: false,
					items: [this.hora]
				},{
					labelAlign: 'top',
					layout: 'form',
					border: false,
					items: [this.minuto]
				}]
			}, {
				layout: 'column',
				border: false,
				bodyStyle: 'margin-bottom: 10px; border-top: 1px solid black; padding: 5px; border-bottom: 1px solid black',
				items: [{
					labelWidth: 150,
					columnWidth: .5,
					border: false,
					autoHeight: true,
					layout: 'form',
					items: [
						{xtype: 'label', text: '<?php echo DMG_Translate::_('parque.transformacao.situacao_atual'); ?>', style: 'font-weight: bold'},
						new Ext.form.ComboBox({
							store: new Ext.data.JsonStore({
								url: '<?php echo $this->url(array('controller' => 'jogo', 'action' => 'list'), null, true); ?>',
								root: 'data',
								fields: ['id', 'nm_jogo'],
							}),
							disabled: true,
							hiddenName: 'id_jogo_ant',
							allowBlank: false,
							displayField: 'nm_jogo',
							valueField: 'id',
							mode: 'remote',
							triggerAction: 'all',
							emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
							fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.id_jogo.text'); ?>'
						}),
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_versao_jogo.text'); ?>', disabled: true, xtype: 'textfield', name: 'nr_versao_jogo_ant', allowBlank: true},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.vl_credito.text'); ?>', disabled: true, xtype: 'textfield', name: 'vl_credito_ant', allowBlank: true},
						new Ext.form.ComboBox({
							store: new Ext.data.JsonStore({
								url: '<?php echo $this->url(array('controller' => 'gabinete', 'action' => 'list'), null, true); ?>',
								root: 'data',
								fields: ['id', 'nm_gabinete'],
							}),
							disabled: true,
							hiddenName: 'id_gabinete_ant',
							allowBlank: false,
							displayField: 'nm_gabinete',
							valueField: 'id',
							mode: 'remote',
							triggerAction: 'all',
							emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
							fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.id_gabinete.text'); ?>'
						}),
						new Ext.form.ComboBox({
							store: new Ext.data.SimpleStore({
								fields: ['code', 'name'],
								data: [
				<?php foreach (Doctrine::getTable('ScmMoeda')->findAll() as $k): ?>
									[<?php echo $k->id; ?>, '<?php echo $k->nm_moeda; ?>'],
				<?php endforeach; ?>
								]
							}),
							hiddenName: 'id_moeda_ant',
							allowBlank: true,
							displayField: 'name',
							disabled: true,
							valueField: 'code',
							mode: 'local',
							triggerAction: 'all',
							emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
							fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.id_moeda.text'); ?>'
						}),
					]
				}, {
					labelWidth: 150,
					columnWidth: .5,
					border: false,
					autoHeight: true,
					layout: 'form',
					items: [
						{xtype: 'label', text: '<?php echo DMG_Translate::_('parque.transformacao.situacao_nova'); ?>', style: 'font-weight: bold'},
						new Ext.form.ComboBox({
							store: new Ext.data.JsonStore({
								url: '<?php echo $this->url(array('controller' => 'jogo', 'action' => 'list'), null, true); ?>',
								baseParams: {
									dir: 'ASC',
									sort: 'nm_jogo',
									limit: 15,
									'filter[0][data][type]': 'string',
									'filter[0][field]': 'nm_jogo',
								},
								root: 'data',
								fields: ['id', 'nm_jogo'],
							}),
							minChars: 0,
							queryParam: 'filter[0][data][value]',
							hiddenName: 'id_jogo',
							allowBlank: true,
							displayField: 'nm_jogo',
							valueField: 'id',
							mode: 'remote',
							triggerAction: 'all',
							emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
							fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.id_jogo.text'); ?>'
						}),
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_versao_jogo.text'); ?>', xtype: 'textfield', id: 'nr_versao_jogo', name: 'nr_versao_jogo', allowBlank: true, maxLength: 255},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.vl_credito.text'); ?>', xtype: 'textfield', id: 'vl_credito', name: 'vl_credito', allowBlank: true, maxLength: 255},
						new Ext.form.ComboBox({
							store: new Ext.data.JsonStore({
								url: '<?php echo $this->url(array('controller' => 'gabinete', 'action' => 'list'), null, true); ?>',
								baseParams: {
									dir: 'ASC',
									sort: 'nm_gabinete',
									limit: 15,
									'filter[0][data][type]': 'string',
									'filter[0][field]': 'nm_gabinete',
								},
								root: 'data',
								fields: ['id', 'nm_gabinete'],
							}),
							minChars: 0,
							queryParam: 'filter[0][data][value]',
							hiddenName: 'id_gabinete',
							allowBlank: true,
							displayField: 'nm_gabinete',
							valueField: 'id',
							mode: 'remote',
							triggerAction: 'all',
							emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
							fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.id_gabinete.text'); ?>'
						}),
						new Ext.form.ComboBox({
							store: new Ext.data.SimpleStore({
								fields: ['code', 'name'],
								data: [
				<?php foreach (Doctrine::getTable('ScmMoeda')->findAll() as $k): ?>
									[<?php echo $k->id; ?>, '<?php echo $k->nm_moeda; ?>'],
				<?php endforeach; ?>
								]
							}),
							hiddenName: 'id_moeda',
							allowBlank: true,
							displayField: 'name',
							valueField: 'code',
							mode: 'local',
							triggerAction: 'all',
							emptyText: '<?php echo DMG_Translate::_('grid.form.combobox.select'); ?>',
							fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.id_moeda.text'); ?>'
						}),
					]
				}]
			}, {
				layout: 'column',
				border: false,
				bodyStyle: 'margin-bottom: 10px; padding: 5px;',
				items: [{
					labelWidth: 150,
					columnWidth: .5,
					border: false,
					autoHeight: true,
					layout: 'form',
					items: [
						{xtype: 'label', text: '<?php echo DMG_Translate::_('parque.transformacao.contadores_anteriores'); ?>', style: 'font-weight: bold'},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_1.text'); ?>', xtype: 'textfield', name: 'nr_cont_1_ant', allowBlank: true},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_2.text'); ?>', xtype: 'textfield', name: 'nr_cont_2_ant', allowBlank: true},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_3.text'); ?>', xtype: 'textfield', name: 'nr_cont_3_ant', allowBlank: true},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_4.text'); ?>', xtype: 'textfield', name: 'nr_cont_4_ant', allowBlank: true},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_5.text'); ?>', xtype: 'textfield', name: 'nr_cont_5_ant', allowBlank: true},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_6.text'); ?>', xtype: 'textfield', name: 'nr_cont_6_ant', allowBlank: true}
					]
				}, {
					labelWidth: 150,
					columnWidth: .5,
					border: false,
					autoHeight: true,
					layout: 'form',
					items: [
						{xtype: 'label', text: '<?php echo DMG_Translate::_('parque.transformacao.contadores_posteriores'); ?>', style: 'font-weight: bold'},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_1.text'); ?>', xtype: 'textfield', name: 'nr_cont_1', allowBlank: true},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_2.text'); ?>', xtype: 'textfield', name: 'nr_cont_2', allowBlank: true},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_3.text'); ?>', xtype: 'textfield', name: 'nr_cont_3', allowBlank: true},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_4.text'); ?>', xtype: 'textfield', name: 'nr_cont_4', allowBlank: true},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_5.text'); ?>', xtype: 'textfield', name: 'nr_cont_5', allowBlank: true},
						{fieldLabel: '<?php echo DMG_Translate::_('parque.maquina.form.nr_cont_6.text'); ?>', xtype: 'textfield', name: 'nr_cont_6', allowBlank: true}
					]
				}]
			}]
		});
		Ext.apply(this, {
			items: this.formPanel,
			bbar: [
				'->',
				{text: '<?php echo DMG_Translate::_('parque.transformacao.form.saving'); ?>', iconCls: 'icon-save',scope: this,handler: this._onBtnSalvarClick},
				{text: '<?php echo DMG_Translate::_('grid.form.cancel'); ?>', iconCls: 'silk-cross', scope: this, handler: this._onBtnCancelarClick}
			]
		});
		ParqueTransformacaoForm.superclass.initComponent.call(this);
	},
	show: function() {
		this.formPanel.getForm().reset();
		this.formPanel.getForm().findField('id_gabinete_ant').store.reload();
		this.formPanel.getForm().findField('id_jogo_ant').store.reload();
		ParqueTransformacaoForm.superclass.show.apply(this, arguments);
		this.el.mask('<?php echo DMG_Translate::_('grid.form.loading'); ?>');
		this.formPanel.getForm().load({
			url: '<?php echo $this->url(array('controller' => 'transformacao', 'action' => 'get'), null, true); ?>',
			params: {
				id: this.transformacao
			},
			scope: this,
			success: this._onFormLoad
		});
	},
	onDestroy: function() {
		ParqueTransformacaoForm.superclass.onDestroy.apply(this, arguments);
		this.formPanel = null;
	},
	_onFormLoad: function(form, request) {
		this.el.unmask();
		var data = new Date();
		this.formPanel.getForm().findField('dt_transformacao').setValue(data);
		this.formPanel.getForm().findField('hora').setValue(data.getHours());
		this.formPanel.getForm().findField('minuto').setValue(data.getMinutes());
	},
	_onBtnSalvarClick: function() {
		var form = this.formPanel.getForm();
		if(!form.isValid()) {
			//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', '<?php echo DMG_Translate::_('grid.form.alert.invalid'); ?>');
			uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: '<?php echo DMG_Translate::_('grid.form.alert.invalid'); ?>'});
			return false;
		}
		this.el.mask('<?php echo DMG_Translate::_('grid.form.saving'); ?>');
		form.submit({
			url: '<?php echo $this->url(array('controller' => 'transformacao', 'action' => 'save'), null, true); ?>',
			params: {
				id: this.transformacao
			},
			scope:this,
			success: function() {
				this.el.unmask();
				this.hide();
				this.fireEvent('salvar', this);
			},
			failure: function (form, request) {
				this.el.unmask();
				//Ext.Msg.alert('<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', request.result.message);
				uiHelper.showMessageBox({title: '<?php echo DMG_Translate::_('grid.form.alert.title'); ?>', msg: request.result.message});
			}
		});
	},
	_onBtnCancelarClick: function() {
		this.hide();
	}
});