/**
 * @author Leonardo
 */

var HttpHelpers = function(){
	
	var switchResponseStatus = function(status){
		var mensagem = "";
		
		switch(status){
			case 0:
				mensagem = Ext.names.ErroHTTPComunication;
				break;
			case '404':
				mensagem = Ext.names.ErroHTTP404;
				break;
			case '200':
				mensagem = Ext.names.ErroHTTPNotJSON;
				break;
			default:
				mensagem = Ext.names.ErroHTTP;
		}
		return mensagem;
	}
	
	var executaExcluirRegistro = function(btn, input, objeto, parametros){
		var grid = Ext.getCmp(parametros.grid);
		if(btn=='yes'){
			var selections = grid.selModel.getSelections();
			var itens = [];
			for(i = 0; i< grid.selModel.getCount(); i++){
				itens.push(selections[i].json[parametros.campoid]);
			}
			var encoded_array = Ext.encode(itens);
			Ext.Ajax.request({
				url: parametros.url, 
				params: { 
					ids:  encoded_array
				}, 
				success: function(response){
					var contentType = response.getResponseHeader('Content-Type');
					if(contentType != "application/json"){
						showMessageBox({msg: Ext.names.ErroHTTPNotJSON + response.responseText});
					}
					else{
						var result = Ext.decode(response.responseText);
						if(result.success){
							if(Number(result.qtd) == 1) 
								DesktopHelpers.showNotification({title:Ext.names.Concluido, iconCls:'alerta', html: Ext.names.RegRemovido});
							else
								DesktopHelpers.showNotification({title:Ext.names.Concluido, iconCls:'alerta', html: result.qtd + Ext.names.RegsRemovidos});
							grid.store.reload();
						}
						else{
							showMessageBox({msg: result.errormsg});
						}	
					}
				},
				failure: HttpHelpers.failHandler
			});
		}  
	}
	
	var showMessageBox = function(config){
		var defaults = ({
			title: Ext.names.Erro,
			msg: Ext.names.ErroHTTP,
			width: 350,
			buttons: Ext.MessageBox.OK,
            icon: Ext.MessageBox.ERROR
		});
		Ext.MessageBox.show(Ext.apply(defaults, config));
	}

	Ext.override(Ext.form.Action.Submit, {
		handleResponse : function(response){
			
			if(this.form.errorReader){
	            var rs = this.form.errorReader.read(response);
	            var errors = [];
	            if(rs.records){
	                for(var i = 0, len = rs.records.length; i < len; i++) {
	                    var r = rs.records[i];
	                    errors[i] = r.data;
	                }
	            }
	            if(errors.length < 1){
	                errors = null;
	            }
	            return {
	                success : rs.success,
	                errors : errors
	            };
	        }
	
			var contentType = response.getResponseHeader('Content-Type');
			if((contentType != "application/json")&& (response.responseText.charAt(0) != "{")){
				return Ext.decode('{success:false, errormsg:"' + Ext.names.ErroHTTPNotJSON + String.escape(response.responseText)+'"}');
			}
	        else{
		        return Ext.decode(response.responseText);
			}
	    }
	});
	
	Ext.override(Ext.form.Action.Load, {
		success : function(response){
			var contentType = response.getResponseHeader('Content-Type');
			if((contentType != "application/json")&& (response.responseText.charAt(0) != "{")){
				//return Ext.decode('{success:false, errormsg:"' + Ext.names.ErroHTTPNotJSON + String.escape(response.responseText)+'"}');
				showMessageBox({title:Ext.names.Erro, msg: Ext.names.ErroHTTPNotJSON + response.responseText});
			}
			else{
				var result = this.processResponse(response);
				if(result === true || !result.success || !result.data){
					this.failureType = Ext.form.Action.LOAD_FAILURE;
					this.form.afterAction(this, false);
					return;
				}
				this.form.clearInvalid();
				this.form.setValues(result.data);
				this.form.afterAction(this, true);
			}
		}
	}); 
	
	
	return{
			
		excluirRegistro: function(btn, event, parametros){
			var grid = Ext.getCmp(parametros.grid);
	
			if(grid.selModel.getCount() == 1)	{
				Ext.MessageBox.confirm(Ext.names.Confirmacao,Ext.names.RemoveUmReg, executaExcluirRegistro.createDelegate(this, parametros, true));
			}
			else if(grid.selModel.getCount() > 1){
				Ext.MessageBox.confirm(Ext.names.Confirmacao,Ext.names.RemoveVariosReg, executaExcluirRegistro.createDelegate(this, parametros, true));
			} 
			else {
				showMessageBox({title:Ext.names.Atencao, msg: Ext.names.NenhumSelecionado, icon: Ext.MessageBox.WARNING});
			}
		},
		
		salvaGrid: function(config, store){
			Ext.Ajax.request(Ext.apply({
				url: 'grid/urlPadrao',
				params: {
					parametro: "Parametro padrão"
				},
				success: function(response){
						var contentType = response.getResponseHeader('Content-Type');
						if(contentType != "application/json"){
							showMessageBox({msg: Ext.names.ErroHTTPNotJSON + response.responseText});
						}
						else{
							var result = Ext.decode(response.responseText);
							if(result.success){
								DesktopHelpers.showNotification({title:Ext.names.Concluido,iconCls:'alerta',html: Ext.names.SaveSuccess});
								store.commitChanges();
							}
							else{
								showMessageBox({msg: result.errormsg});
							}	
						}
					},
					failure: function(response){
						showMessageBox({msg: Ext.names.ErroHTTPComunication + 'Status '+response.status+': '+ response.statusText});
					}
			}, config));
		},
		
		
		failHandler: function(){
			switch(HttpHelpers.failHandler.arguments.length) {
				case 2:
					var arg1 = HttpHelpers.failHandler.arguments[0];
					var arg2 = HttpHelpers.failHandler.arguments[1];
				
					if((arg1.isAbort != undefined) && (arg2.headers != undefined)){
						var response = arg1;
						var options = arg2;
						
						showMessageBox({msg: switchResponseStatus(response.status)});
					}
					else if((arg1.url != undefined)&&(arg2.response != undefined)){
						var form = arg1;
						var action = arg2;
	
						if (action.failureType === Ext.form.Action.CONNECT_FAILURE) {
							showMessageBox({msg: Ext.names.ErroHTTPComunication + 'Status '+action.response.status+': '+ action.response.statusText});
			            }
						else{
							var contentType = action.response.getResponseHeader('Content-Type');
							if (contentType != "application/json") {
								showMessageBox({msg: Ext.names.ErroHTTPNotJSON + action.response.responseText});
							}
							else{
								var obj = Ext.decode(action.response.responseText);
								showMessageBox({msg: obj.errormsg});
							}
					    }
					}
					else{
						showMessageBox({msg: Ext.names.ErroIndefinido});
					}
					break;
				case 5:
					var DataProxy = HttpHelpers.failHandler.arguments[0];
					var type = HttpHelpers.failHandler.arguments[1];
					var action = HttpHelpers.failHandler.arguments[2];
					var options = HttpHelpers.failHandler.arguments[3];
					var response = HttpHelpers.failHandler.arguments[4];
					
					if (response.status == 0) {
						showMessageBox({msg: Ext.names.ErroHTTPComunication + 'Status '+response.status+': '+ response.statusText});
		            }
					else showMessageBox({msg: switchResponseStatus(response.status) + response.responseText});
					break;
				case 6:
					var DataProxy = HttpHelpers.failHandler.arguments[0];
					var type = HttpHelpers.failHandler.arguments[1];
					var action = HttpHelpers.failHandler.arguments[2];
					var options = HttpHelpers.failHandler.arguments[3];
					var response = HttpHelpers.failHandler.arguments[4];
					var arg = HttpHelpers.failHandler.arguments[5];
					
					showMessageBox({msg: switchResponseStatus(response.status) + response.responseText});
					break;
				default:
					showMessageBox({msg: Ext.names.ErroIndefinido});
					break;
			}
		}
	}
}();
