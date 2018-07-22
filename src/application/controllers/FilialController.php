<?php

class FilialController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(42) || DMG_Acl::canAccess(26) || DMG_Acl::canAccess(27)) {
			$query = Doctrine_Query::create()->from('ScmFilial f')->select('f.id, f.nm_filial');
			$limit = (int) $this->getRequest()->getParam('limit');
			if ($limit > 0) {
				$query->limit($limit);
			}
			$offset = (int) $this->getRequest()->getParam('start');
			if ($offset > 0) {
				$query->offset($offset);
			}
			$sort = (string) $this->getRequest()->getParam('sort');
			$dir = (string) $this->getRequest()->getParam('dir');
			if ($sort && ($dir == 'ASC' || $dir == 'DESC')) {
				$query->orderby($sort . ' ' . $dir);
			}
			$filter = $this->getRequest()->getParam('filter');
			if (is_array($filter)) {
				foreach ($filter as $k) {
					switch ($k['data']['type']) {
						case 'string':
							$query->addWhere($k['field'] . ' LIKE ?', '%' . $k['data']['value'] . '%');
						break;
						case 'list':
							$l = explode(',', $k['data']['value']);
							foreach ($l as $m) {
								$query->orWhere($k['field'] . ' = ?', $m);
							}
						break;
					}
				}
			}
			$query->innerJoin('f.ScmEmpresa e')->innerJoin('e.ScmUserEmpresa ue')->addWhere('ue.user_id = ' . Zend_Auth::getInstance()->getIdentity()->id);
			foreach ($query->execute() as $k) {
				$data[] = array(
					'id' => $k->id,
					'nm_filial' => $k->nm_filial,
					'nm_empresa' => $k->ScmEmpresa->nm_empresa,
					'nm_completo' => $k->ScmEmpresa->nm_empresa . ' - ' . $k->nm_filial
				);
			}
			echo Zend_Json::encode(array('total' => $query->count(), 'data' => $data));
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(43)) {
			$obj = Doctrine::getTable('ScmFilial')->find((int) $this->getRequest()->getParam('id'));
			if ($obj) {
				foreach ($obj->ScmEmpresa->ScmUserEmpresa as $k) {
					if ($k->user_id == Zend_Auth::getInstance()->getIdentity()->id) {
						echo Zend_Json::encode(array('success' => true, 'data' => array(
							'id' => $obj->id,
							'nm_filial' => $obj->nm_filial,
							'id_empresa' => $obj->id_empresa
						)));
						return;
					}
				}
			}
		}
	}
	public function deleteAction () {
		if (DMG_Acl::canAccess(45)) {
			$id = $this->getRequest()->getParam('id');
			try {
				Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
				if (is_array($id)) {
					foreach ($id as $k) {
						$this->deleteFilial($k);
					}
				} else {
					$this->deleteFilial($id);
				}
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
				echo Zend_Json::encode(array('success' => true));
			} catch (Exception $e) {
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				echo Zend_Json::encode(array('failure' => true, 'message' => DMG_Translate::_('administration.filial.form.cannotdelete')));
			}
		}
	}
	protected function deleteFilial ($id) {
		$filial = Doctrine::getTable('ScmFilial')->find($id);
		foreach ($filial->ScmEmpresa->ScmUserEmpresa as $k) {
			if ($k->user_id == Zend_Auth::getInstance()->getIdentity()->id) {
				$filial->delete();
				return;
			}
		}
	}
	public function saveAction () {
		$id = (int) $this->getRequest()->getParam('id');
		if ($id > 0) {
			if (DMG_Acl::canAccess(43)) {
				$obj = Doctrine::getTable('ScmFilial')->find($id);
				if ($obj) {
					foreach ($obj->ScmEmpresa->ScmUserEmpresa as $k) {
						if ($k->user_id == Zend_Auth::getInstance()->getIdentity()->id) {
							$obj->nm_filial = $this->getRequest()->getParam('nm_filial');
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
			if (DMG_Acl::canAccess(44)) {
				$obj = new ScmFilial();
				$obj->nm_filial = $this->getRequest()->getParam('nm_filial');
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