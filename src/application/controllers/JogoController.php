<?php

class JogoController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(13) || DMG_Acl::canAccess(26) || DMG_Acl::canAccess(27)) {
			echo DMG_Crud::index('ScmJogo', 'id, nm_jogo');
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(14)) {
			echo DMG_Crud::get('ScmJogo', (int) $this->getRequest()->getParam('id'));
		}
	}
	public function saveAction () {
		$id = (int) $this->getRequest()->getParam('id');
		if ($id > 0) {
			if (DMG_Acl::canAccess(14)) {
				$obj = Doctrine::getTable('ScmJogo')->find($id);
				if ($obj) {
					$obj->nm_jogo = $this->getRequest()->getParam('nm_jogo');
					try {
						$obj->save();
						echo Zend_Json::encode(array('success' => true));
					} catch (Exception $e) {
						echo Zend_Json::encode(array('success' => false));
					}
				}
			}
		} else {
			if (DMG_Acl::canAccess(15)) {
				$obj = new ScmJogo();
				$obj->nm_jogo = $this->getRequest()->getParam('nm_jogo');
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
		if (DMG_Acl::canAccess(16)) {
			echo DMG_Crud::delete('ScmJogo', $this->getRequest()->getParam('id'));
		}
	}
}