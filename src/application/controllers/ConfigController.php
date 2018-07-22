<?php

class ConfigController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(1)) {
			echo DMG_Crud::index('ScmConfig', 'id, name, value, system');
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(2)) {
			$id = (int) $this->getRequest()->getParam('id');
			$obj = Doctrine::getTable('ScmConfig')->find($id);
			if ($obj) {
				echo Zend_Json::encode(array('success' => true, 'data' => $obj->toArray()));
			}
		}
	}
	public function saveAction () {
		if (DMG_Acl::canAccess(2)) {
			echo DMG_Crud::save('ScmConfig', (int) $this->getRequest()->getParam('id'), array('value'));
		}
	}
}