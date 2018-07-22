<?php

class LocalTipoController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(46)) {
			echo DMG_Crud::index($this, 'ScmTipoLocal', 'id, nm_tipo_local');
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(48)) {
			echo DMG_Crud::get($this, 'ScmTipoLocal', (int) $this->getRequest()->getParam('id'));
		}
	}
	public function saveAction () {
		$id = (int) $this->getRequest()->getParam('id');
		if ($id > 0) {
			if (DMG_Acl::canAccess(48)) {
				$obj = Doctrine::getTable('ScmTipoLocal')->find($id);
				if ($obj) {
					$obj->nm_tipo_local = $this->getRequest()->getParam('nm_tipo_local');
					try {
						$obj->save();
						echo Zend_Json::encode(array('success' => true));
					} catch (Exception $e) {
						echo Zend_Json::encode(array('success' => false));
					}
				}
			}
		} else {
			if (DMG_Acl::canAccess(47)) {
				$obj = new ScmTipoLocal();
				$obj->nm_tipo_local = $this->getRequest()->getParam('nm_tipo_local');
				$obj->fl_sistema = false;
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
		if (DMG_Acl::canAccess(49)) {
			$id = $this->getRequest()->getParam('id');
			if (!is_array($id)) {
				$id = array($id);
			}
			foreach ($id as $k) {
				$obj = Doctrine::getTable('ScmTipoLocal')->find($k);
				if ($obj) {
					try {
						if ($obj->fl_sistema) {
							throw new Exception();
						}
						$obj->delete();
						echo Zend_Json::encode(array('success' => true));
					} catch (Exception $e) {
						echo Zend_Json::encode(array('failure' => true, 'message' => DMG_Translate::_('parque.local-tipo.delete.cannot')));
					}
				}
			}
		}
	}
}