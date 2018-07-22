<?php

class GabineteController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(21) || DMG_Acl::canAccess(26) || DMG_Acl::canAccess(27)) {
			echo DMG_Crud::index('ScmGabinete', 'id, nm_gabinete');
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(22)) {
			echo DMG_Crud::get('ScmGabinete', (int) $this->getRequest()->getParam('id'));
		}
	}
	public function saveAction () {
		$id = (int) $this->getRequest()->getParam('id');
		if ($id > 0) {
			if (DMG_Acl::canAccess(22)) {
				$obj = Doctrine::getTable('ScmGabinete')->find($id);
				if ($obj) {
					$obj->nm_gabinete = $this->getRequest()->getParam('nm_gabinete');
					try {
						$obj->save();
						echo Zend_Json::encode(array('success' => true));
					} catch (Exception $e) {
						echo Zend_Json::encode(array('success' => false));
					}
				}
			}
		} else {
			if (DMG_Acl::canAccess(23)) {
				$obj = new ScmGabinete();
				$obj->nm_gabinete = $this->getRequest()->getParam('nm_gabinete');
				try {
					$obj->save();
					echo Zend_Json::encode(array('success' => true));
				} catch (Exception $e) {
					echo Zend_Json::encode(array('success' => false));
				}
			}
		}
	}
	public function deleteAction () {
		if (DMG_Acl::canAccess(24)) {
			echo DMG_Crud::delete('ScmGabinete', $this->getRequest()->getParam('id'));
		}
	}
}