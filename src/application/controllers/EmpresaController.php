<?php

class EmpresaController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(38) || DMG_Acl::canAccess(43) || DMG_Acl::canAccess(44)) {
			$query = Doctrine_Query::create()->from('ScmEmpresa e')->select('e.id, e.nm_empresa');
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
					$valor = "";
					switch ($k['data']['type']) {
						case 'string':
							if(array_key_exists('value', $k['data'])) $valor = $k['data']['value'];
							
							$query->addWhere($k['field'] . ' LIKE ?', '%' . $valor . '%');
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
			$query->innerJoin('e.ScmUserEmpresa ue')->addWhere('ue.user_id = ' . Zend_Auth::getInstance()->getIdentity()->id);
			echo Zend_Json::encode(array('total' => $query->count(), 'data' => $query->execute()->toArray()));
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(39)) {
			$obj = Doctrine::getTable('ScmEmpresa')->find((int) $this->getRequest()->getParam('id'));
			if ($obj) {
				foreach ($obj->ScmUserEmpresa as $k) {
					if ($k->user_id == Zend_Auth::getInstance()->getIdentity()->id) {
						echo Zend_Json::encode(array('success' => true, 'data' => array(
							'id' => $obj->id,
							'nm_empresa' => $obj->nm_empresa
						)));
						return;
					}
				}
			}
		}
	}
	public function deleteAction () {
		if (DMG_Acl::canAccess(41)) {
			$id = $this->getRequest()->getParam('id');
			try {
				Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
				if (is_array($id)) {
					foreach ($id as $k) {
						$this->deleteEmpresa($k);
					}
				} else {
					$this->deleteEmpresa($id);
				}
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
				echo Zend_Json::encode(array('success' => true));
			} catch (Exception $e) {
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				echo Zend_Json::encode(array('failure' => true, 'message' => DMG_Translate::_('administration.empresa.form.cannotdelete')));
			}
		}
	}
	protected function deleteEmpresa ($id) {
		$empresa = Doctrine::getTable('ScmEmpresa')->find($id);
		foreach ($empresa->ScmUserEmpresa as $k) {
			if ($k->user_id == Zend_Auth::getInstance()->getIdentity()->id) {
				for ($i = 0; $i < count($empresa->ScmUserEmpresa); $i++) {
					$empresa->ScmUserEmpresa[$i]->delete();
				}
				$empresa->delete();
				return;
			}
		}
	}
	public function saveAction () {
		$id = (int) $this->getRequest()->getParam('id');
		if ($id > 0) {
			if (DMG_Acl::canAccess(39)) {
				$obj = Doctrine::getTable('ScmEmpresa')->find($id);
				if ($obj) {
					foreach ($obj->ScmUserEmpresa as $k) {
						if ($k->user_id == Zend_Auth::getInstance()->getIdentity()->id) {
							$obj->nm_empresa = $this->getRequest()->getParam('nm_empresa');
							try {
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
			if (DMG_Acl::canAccess(40)) {
				$obj = new ScmEmpresa();
				$obj->nm_empresa = $this->getRequest()->getParam('nm_empresa');
				try {
					$obj->save();
					$a = new ScmUserEmpresa();
					$a->user_id = Zend_Auth::getInstance()->getIdentity()->id;
					$a->id_empresa = $obj->id;
					$a->save();
					echo Zend_Json::encode(array('success' => true));
				} catch (Exception $e) {
					echo Zend_Json::encode(array('success' => false));
				}
			}
		}
	}
}