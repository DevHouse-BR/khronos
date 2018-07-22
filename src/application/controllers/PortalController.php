<?php

class PortalController extends Zend_Controller_Action {
	
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
	}
	
	public function indexAction () {
		echo $this->view->render('portal/index.phtml');
	}
	
	public function loginAction() {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->getResponse()->setHeader('Content-Type', 'application/json');
		echo Zend_Json::encode(array('success' => true));
	}
	
	public function desktopAction () {
		echo $this->view->render('portal/desktop.phtml');
	}
	
public function jsAction () {
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'text/javascript; charset=UTF-8');
		$js = $this->view->render('index/i18n.js');
		$js .= $this->view->render('portal/base.js');
		$js .= $this->view->render('index/edit-profile.js');
		if (DMG_Acl::canAccess(1)) {
			$js .= $this->view->render('config/administration-config.js');
		}
		if (DMG_Acl::canAccess(2)) {
			$js .= $this->view->render('config/administration-config-form.js');
		}
		if (DMG_Acl::canAccess(3)) {
			$js .= $this->view->render('user/administration-user.js');
		}
		if (DMG_Acl::canAccess(4) || DMG_Acl::canAccess(5)) {
			$js .= $this->view->render('user/administration-user-form.js');
		}
		if (DMG_Acl::canAccess(7)) {
			$js .= $this->view->render('group/administration-group.js');
		}
		if (DMG_Acl::canAccess(8) || DMG_Acl::canAccess(9)) {
			$js .= $this->view->render('group/administration-group-form.js');
		}
		if (DMG_Acl::canAccess(11)) {
			$js .= $this->view->render('group/administration-group-permission.js');
		}
		if (DMG_Acl::canAccess(12)) {
			$js .= $this->view->render('user/administration-user-group.js');
		}
		if (DMG_Acl::canAccess(37)) {
			$js .= $this->view->render('user/administration-user-empresa.js');
		}
		if (DMG_Acl::canAccess(38)) {
			$js .= $this->view->render('empresa/administration-empresa.js');
		}
		if (DMG_Acl::canAccess(39) || DMG_Acl::canAccess(40)) {
			$js .= $this->view->render('empresa/administration-empresa-form.js');
		}
		if (DMG_Acl::canAccess(50)) {
			$js .= $this->view->render('parceiro/administration-parceiro.js');
		}
		if (DMG_Acl::canAccess(51) || DMG_Acl::canAccess(52)) {
			$js .= $this->view->render('parceiro/administration-parceiro-form.js');
		}
		if (DMG_Acl::canAccess(42)) {
			$js .= $this->view->render('filial/administration-filial.js');
		}
		if (DMG_Acl::canAccess(43) || DMG_Acl::canAccess(44)) {
			$js .= $this->view->render('filial/administration-filial-form.js');
		}
		if (DMG_Acl::canAccess(13)) {
			$js .= $this->view->render('jogo/parque-jogo.js');
		}
		if (DMG_Acl::canAccess(14) || DMG_Acl::canAccess(15)) {
			$js .= $this->view->render('jogo/parque-jogo-form.js');
		}
		if (DMG_Acl::canAccess(17)) {
			$js .= $this->view->render('local/parque-local.js');
		}
		if (DMG_Acl::canAccess(18) || DMG_Acl::canAccess(19)) {
			$js .= $this->view->render('local/parque-local-form.js');
		}
		if (DMG_Acl::canAccess(46)) {
			$js .= $this->view->render('local-tipo/parque-local-tipo.js');
		}
		if (DMG_Acl::canAccess(47) || DMG_Acl::canAccess(48)) {
			$js .= $this->view->render('local-tipo/parque-local-tipo-form.js');
		}
		if (DMG_Acl::canAccess(21)) {
			$js .= $this->view->render('gabinete/parque-gabinete.js');
		}
		if (DMG_Acl::canAccess(22) || DMG_Acl::canAccess(23)) {
			$js .= $this->view->render('gabinete/parque-gabinete-form.js');
		}
		if (DMG_Acl::canAccess(25)) {
			$js .= $this->view->render('maquina/parque-maquina.js');
		}
		if (DMG_Acl::canAccess(26) || DMG_Acl::canAccess(27)) {
			$js .= $this->view->render('maquina/parque-maquina-form.js');
		}
		if (DMG_Acl::canAccess(28)) {
			$js .= $this->view->render('transformacao/parque-transformacao.js');
			$js .= $this->view->render('transformacao/parque-transformacao-form.js');
		}
		if (DMG_Acl::canAccess(30)) {
			$js .= $this->view->render('consulta-parque/parque-consulta-parque.js');
		}
		if (DMG_Acl::canAccess(32) || DMG_Acl::canAccess(33)) {
			$js .= $this->view->render('fechamento/parque-fechamento.js');
		}
		if (DMG_Acl::canAccess(36)) {
			$js .= $this->view->render('index/reports.js');
		}
		if (DMG_Acl::canAccess(54)) {
			$js .= $this->view->render('status-maquina/window.js');
		}
		if (DMG_Acl::canAccess(55) || DMG_Acl::canAccess(56)) {
			$js .= $this->view->render('status-maquina/form.js');
		}
		if (DMG_Acl::canAccess(58)) {
			$js .= $this->view->render('movimentacao/window-entrada.js');
			$js .= $this->view->render('movimentacao/form-entrada.js');
		}
		if (DMG_Acl::canAccess(59)) {
			$js .= $this->view->render('movimentacao/window-saida.js');
			$js .= $this->view->render('movimentacao/form-saida.js');
		}
		if (DMG_Acl::canAccess(62)) {
			$js .= $this->view->render('regularizacao/window.js');
			$js .= $this->view->render('regularizacao/form-controlada.js');
			$js .= $this->view->render('regularizacao/form-falha.js');
		}
		if (DMG_Acl::canAccess(65)) {
			$js .= $this->view->render('status-maquina-assign/window.js');
			$js .= $this->view->render('status-maquina-assign/form.js');
		}
		//echo DMG_JSMin::minify($js);
		$js = str_replace('"images/', '"../images/', $js);
		$js = str_replace("'images/", "'../images/", $js);
		$js = str_replace("'extjs/resources", "'../extjs/resources", $js);
		$js = str_replace('"extjs/resources', '"../extjs/resources', $js);
		
		echo($js);
	}
	
}