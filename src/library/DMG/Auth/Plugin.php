<?php

class DMG_Auth_Plugin extends Zend_Controller_Plugin_Abstract {
	public function routeShutdown(Zend_Controller_Request_Abstract $request) {
		$controller = $this->getRequest()->getControllerName();
		$action = $this->getRequest()->getActionName();
		if (!Zend_Auth::getInstance()->hasIdentity()) {
			// usuário não autenticado
			// permissões: index/index, index/auth
			if (!($controller == 'index' && ($action == 'index' || $action == 'auth' || $action = 'js'))) {
				$request->setModuleName('default')->setControllerName('index')->setActionName('null')->setDispatched(false);
			}
		} else {
			// usuário autenticado
			// permissões: todas
			if ($controller == 'index' && $action == 'auth') {
				$request->setModuleName('default')->setControllerName('index')->setActionName('null')->setDispatched(false);
			}
		}
	}
}