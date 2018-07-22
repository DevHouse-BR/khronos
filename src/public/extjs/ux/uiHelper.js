/**
 * @author Leonardo
 */

var uiHelper = function(){
	return {
		showMessageBox: function(config){
			var defaults = ({
				title: 'Error',
				msg: 'Error processing request.',
				width: 350,
				buttons: Ext.MessageBox.OK,
	            icon: Ext.MessageBox.ERROR
			});
			Ext.MessageBox.show(Ext.apply(defaults, config));
		},
		confirm: function(titulo, mensagem, funcao, scope){
			Ext.Msg.show({
				title: titulo,
				msg: mensagem,
				buttons: Ext.Msg.YESNO,
				fn: funcao,
				width: 350,
				//animEl: 'elId',
				icon: Ext.MessageBox.QUESTION,
				scope: scope
			});
		},
		customAlert: function(config){
			var labels=['ok', 'cancel', 'yes', 'no'], savedLabels=Ext.apply({},Ext.Msg.buttonText);
			
			Ext.applyIf(config,{buttons:{}, method: 'show', fn: function(buttonId){
				
				for (i=0; i < config.btns.length; i++){				
					var btn=config.btns[i], label=labels[i];
					if (buttonId == label){
						if (btn.fn) return btn.fn.apply(btn, arguments);
					}
				}
			}});
			
			for (i=0; i < config.btns.length && i < 4; i++){
				var btn=config.btns[i], label=labels[i];
				Ext.Msg.buttonText[label]=btn.buttonText;
				config.buttons[label]=true;
			}

			Ext.Msg[config.method](config);

			Ext.apply(Ext.Msg.buttonText, savedLabels);		
		}
	}
}();
