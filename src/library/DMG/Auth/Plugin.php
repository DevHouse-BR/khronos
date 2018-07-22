<?php

class DMG_Auth_Plugin extends Zend_Controller_Plugin_Abstract {
	public function routeShutdown(Zend_Controller_Request_Abstract $request) {
		$controller = $this->getRequest()->getControllerName();
		if ($controller == 'portal') {
			Zend_Auth::getInstance()->setStorage(new Zend_Auth_Storage_Session(DMG_Config::get(19)));
		} else {
			Zend_Auth::getInstance()->setStorage(new Zend_Auth_Storage_Session(DMG_Config::get(18)));
		}
		$action = $this->getRequest()->getActionName();
		if ($controller == 'portal') {
			if (Zend_Auth::getInstance()->hasIdentity() && $action != 'logout') {
				$session = Doctrine::getTable('ScmSession')->findOneByPhpsessid(session_id());
				$session->dt_ultimo_contato_sessao = DMG_Date::now();
				$session->save();
			}
		} else {
			if (!Zend_Auth::getInstance()->hasIdentity()) {
				// usuário não autenticado
				// permissões: index/index, index/auth
				if (!($controller == 'index' && ($action == 'index' || $action == 'auth' || $action = 'js'))) {
					$request->setModuleName('default')->setControllerName('index')->setActionName('null')->setDispatched(false);
				}
			} else {
				if (!($controller == 'index' && $action == 'logout')) {
					$session = Doctrine::getTable('ScmSession')->findOneByPhpsessid(session_id());
					$session->dt_ultimo_contato_sessao = DMG_Date::now();
					$session->save();
				}
				// usuário autenticado
				// permissões: todas
				if ($controller == 'index' && $action == 'auth') {
					$request->setModuleName('default')->setControllerName('index')->setActionName('null')->setDispatched(false);
				}
			}
		}
	}
}