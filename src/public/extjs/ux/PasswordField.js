Ext.namespace('Ext.ux');
 
/**
  * Ext.ux.PasswordField Extension Class
  *
  * @version 0.1
  *
  * Based on an original implementation by 'thejoker101' 
  * (http://extjs.com/forum/showthread.php?t=20210)
  *
  * @class Ext.ux.PasswordField
  * @extends Ext.form.Textfield
  * @constructor
  * @param {Object} config Configuration options
  */

Ext.ux.PasswordField = function(config) {

    // call parent constructor
    Ext.ux.PasswordField.superclass.constructor.call(this, config);
    
    this.showCapsWarning = config.showCapsWarning || true;

};

Ext.extend(Ext.ux.PasswordField, Ext.form.TextField, {
        /**
         * @cfg {String} inputType The type attribute for input fields -- e.g. text, password (defaults to "password").
         */
        inputType: 'password',
        // private
        onRender: function(ct, position) {
			Ext.ux.PasswordField.superclass.onRender.call(this, ct, position);
				var id = Ext.id();
				this.on('beforedestroy', function(){
			});

        },
        initEvents: function() {
            Ext.ux.PasswordField.superclass.initEvents.call(this);    
            
            this.el.on('keypress', this.keypress, this);
        },
        keypress: function(e) {
            var charCode = e.getCharCode();
            if(
                (e.shiftKey && charCode >= 97 && charCode <= 122) ||
                (!e.shiftKey && charCode >= 65 && charCode <= 90)
            ){
                if (this.showCapsWarning) {
                    this.showWarning(e.target); 
                }
            } else {
                this.hideWarning();
            }            
        },
        showWarning: function(el) {
			var msg = 'Capslock ligado';
			this.el.addClass(this.invalidClass);
            if(!this.errorEl){
                var elp = this.getErrorCt();
                if(!elp){ // field has no container el
                    this.el.dom.title = msg;
                    return;
                }
                this.errorEl = elp.createChild({cls:'x-form-invalid-msg'});
                this.errorEl.setWidth(elp.getWidth(true)-20);
            }
            this.errorEl.update(msg);
            Ext.form.Field.msgFx[this.msgFx].show(this.errorEl, this);
        },
        hideWarning: function() {
			this.el.removeClass(this.invalidClass);
            if(this.errorEl){
                Ext.form.Field.msgFx[this.msgFx].hide(this.errorEl, this);
            }else{
                this.el.dom.title = '';
            }  
        }
    }
);
Ext.reg('passwordfield', Ext.ux.PasswordField);