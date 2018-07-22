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
		}
	}
}();
