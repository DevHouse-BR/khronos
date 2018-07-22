<?php

class ParceiroController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(50) || DMG_Acl::canAcces(26) || DMG_Acl::canAcces(27)) {
			$query = Doctrine_Query::create()->from('ScmParceiro p')->select('p.id, p.nm_parceiro');
			$filial = Doctrine::getTable('ScmFilial')->find((int) $this->getRequest()->getParam('id_filial'));
			if ($filial) {
				$query->addWhere('p.id_empresa = ?', $filial->id_empresa);
			}
			$query->innerJoin('p.ScmEmpresa e')->innerJoin('e.ScmUserEmpresa ue')->addWhere('ue.user_id = ' . Zend_Auth::getInstance()->getIdentity()->id);
			$data = array();
			foreach ($query->execute() as $k) {
				$data[] = array(
					'id' => $k->id,
					'nm_parceiro' => $k->nm_parceiro,
					'nm_empresa' => $k->ScmEmpresa->nm_empresa
				);
			}
			echo Zend_Json::encode(array('total' => $query->count(), 'data' => $data));
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(51)) {
			$obj = Doctrine::getTable('ScmParceiro')->find((int) $this->getRequest()->getParam('id'));
			if ($obj) {
				foreach ($obj->ScmEmpresa->ScmUserEmpresa as $k) {
					if ($k->user_id == Zend_Auth::getInstance()->getIdentity()->id) {
						echo Zend_Json::encode(array('success' => true, 'data' => array(
							'id' => $obj->id,
							'nm_parceiro' => $obj->nm_parceiro,
							'id_empresa' => $obj->id_empresa
						)));
						return;
					}
				}
			}
		}
	}
	public function deleteAction () {
		if (DMG_Acl::canAccess(53)) {
			$id = $this->getRequest()->getParam('id');
			try {
				Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
				if (is_array($id)) {
					foreach ($id as $k) {
						$this->deleteParceiro($k);
					}
				} else {
					$this->deleteParceiro($id);
				}
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
				echo Zend_Json::encode(array('success' => true));
			} catch (Exception $e) {
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				echo Zend_Json::encode(array('failure' => true, 'message' => DMG_Translate::_('administration.parceiro.form.cannotdelete')));
			}
		}
	}
	protected function deleteParceiro ($id) {
		$parceiro = Doctrine::getTable('ScmParceiro')->find($id);
		foreach ($parceiro->ScmEmpresa->ScmUserEmpresa as $k) {
			if ($k->user_id == Zend_Auth::getInstance()->getIdentity()->id) {
				if (count($parceiro->ScmMaquina)) {
					throw new Exception();
				}
				$parceiro->delete();
				return;
			}
		}
	}
	public function saveAction () {
		$id = (int) $this->getRequest()->getParam('id');
		if ($id > 0) {
			if (DMG_Acl::canAccess(51)) {
				$obj = Doctrine::getTable('ScmParceiro')->find($id);
				if ($obj) {
					foreach ($obj->ScmEmpresa->ScmUserEmpresa as $k) {
						if ($k->user_id == Zend_Auth::getInstance()->getIdentity()->id) {
							$obj->nm_parceiro = $this->getRequest()->getParam('nm_parceiro');
							$qr = Doctrine_Query::create()->from('ScmUserEmpresa')->addWhere('id_empresa = ?', $this->getRequest()->getParam('id_empresa'))->addWhere('user_id = ?', Zend_Auth::getInstance()->getIdentity()->id);
							$obj->id_empresa = $this->getRequest()->getParam('id_empresa');
							try {
								if (!$qr->count()) {
									throw new Exception();
								}
								$obj->save();
								echo Zend_Json::encode(array('success' => true));
							} catch (Exception $e) {
								echo Zend_Json::encode(array('success' => false));
							}
							return;
						}
					}
				}
			}
		} else {
			if (DMG_Acl::canAccess(52)) {
				$obj = new ScmParceiro();
				$obj->nm_parceiro = $this->getRequest()->getParam('nm_parceiro');
				$qr = Doctrine_Query::create()->from('ScmUserEmpresa')->addWhere('id_empresa = ?', $this->getRequest()->getParam('id_empresa'))->addWhere('user_id = ?', Zend_Auth::getInstance()->getIdentity()->id);
				$obj->id_empresa = $this->getRequest()->getParam('id_empresa');
				try {
					if (!$qr->count()) {
						throw new Exception();
					}
					$obj->save();
					echo Zend_Json::encode(array('success' => true));
				} catch (Exception $e) {
					echo Zend_Json::encode(array('success' => false));
				}
			}
		}
	}
}