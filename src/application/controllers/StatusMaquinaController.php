<?php

class StatusMaquinaController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(54)) {
			echo DMG_Crud::index('ScmStatusMaquina', 'id, nm_status_maquina, fl_permite_movimentacao, fl_permite_transformacao, fl_permite_faturamento, fl_permite_regularizacao, fl_sistema, fl_operativa, fl_alta');
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(56)) {
			echo DMG_Crud::get('ScmStatusMaquina', (int) $this->getRequest()->getParam('id'));
		}
	}
	public function saveAction () {
		$id = (int) $this->getRequest()->getParam('id');
		if ($id > 0) {
			if (DMG_Acl::canAccess(56)) {
				$obj = Doctrine::getTable('ScmStatusMaquina')->find($id);
				if ($obj && $obj->fl_sistema == 0) {
					$obj->nm_status_maquina = $this->getRequest()->getParam('nm_status_maquina');
					$obj->fl_permite_movimentacao = (int) $this->getRequest()->getParam('fl_permite_movimentacao');
					$obj->fl_permite_transformacao = (int) $this->getRequest()->getParam('fl_permite_transformacao');
					$obj->fl_permite_faturamento = (int) $this->getRequest()->getParam('fl_permite_faturamento');
					$obj->fl_permite_regularizacao = (int) $this->getRequest()->getParam('fl_permite_regularizacao');
					$obj->fl_operativa = (int) $this->getRequest()->getParam('fl_operativa');
					$obj->fl_alta = (int) $this->getRequest()->getParam('fl_alta');
					try {
						$obj->save();
						echo Zend_Json::encode(array('success' => true));
					} catch (Exception $e) {
						echo Zend_Json::encode(array('success' => false));
					}
				}
			}
		} else {
			if (DMG_Acl::canAccess(55)) {
				$obj = new ScmStatusMaquina();
				$obj->nm_status_maquina = $this->getRequest()->getParam('nm_status_maquina');
				$obj->fl_permite_movimentacao = (int) $this->getRequest()->getParam('fl_permite_movimentacao');
				$obj->fl_permite_transformacao = (int) $this->getRequest()->getParam('fl_permite_transformacao');
				$obj->fl_permite_faturamento = (int) $this->getRequest()->getParam('fl_permite_faturamento');
				$obj->fl_permite_regularizacao = (int) $this->getRequest()->getParam('fl_permite_regularizacao');
				$obj->fl_operativa = (int) $this->getRequest()->getParam('fl_operativa');
				$obj->fl_alta = (int) $this->getRequest()->getParam('fl_alta');
				$obj->fl_sistema = 0;
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
		if (DMG_Acl::canAccess(57)) {
			Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
			$id = $this->getRequest()->getParam('id');
			if (!is_array($id)) {
				$id = array($id);
			}
			foreach ($id as $k) {
				$obj = Doctrine::getTable('ScmStatusMaquina')->find($k);
				if ($obj && $obj->fl_sistema == 0) {
					try {
						$obj->delete();
						Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
						echo Zend_Json::encode(array('success' => true));
					} catch (Exception $e) {
						Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
						echo Zend_Json::encode(array('failure' => true, 'message' => DMG_Translate::_('status-maquina.fl_sistema')));
					}
				} else {
					echo Zend_Json::encode(array('failure' => true, 'message' => DMG_Translate::_('status-maquina.fl_sistema')));
				}
			}
		}
	}
}