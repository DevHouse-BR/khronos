<?php

class LocalController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(17) || DMG_Acl::canAccess(26) || DMG_Acl::canAccess(27)) {
			$query = Doctrine_Query::create()->from('ScmLocal');
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
			$data = array();
			foreach ($query->execute() as $k) {
				$data[] = array(
					'id' => $k->id,
					'nm_local' => $k->nm_local,
					'tp_local' => $k->ScmTipoLocal->nm_tipo_local,
				);
			}
			echo Zend_Json::encode(array('total' => $query->count(), 'data' => $data));
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(18)) {
			echo DMG_Crud::get('ScmLocal', (int) $this->getRequest()->getParam('id'));
		}
	}
	public function saveAction () {
		$id = (int) $this->getRequest()->getParam('id');
		if ($id > 0) {
			if (DMG_Acl::canAccess(18)) {
				$obj = Doctrine::getTable('ScmLocal')->find($id);
				if ($obj) {
					$obj->nm_local = $this->getRequest()->getParam('nm_local');
					$obj->tp_local = $this->getRequest()->getParam('tp_local');
					
					if($this->getRequest()->getParam('fl_portal') == 'on'){
						$obj->fl_portal = 1;
						$obj->user_portal = $this->getRequest()->getParam('user_portal');
						$obj->pass_portal = $this->getRequest()->getParam('pass_portal');
					}
					else {
						$obj->fl_portal = 0;
					}

					try {
						$obj->save();
						echo Zend_Json::encode(array('success' => true));
					} catch (Exception $e) {
						if($e->getCode() == 23505){
							echo Zend_Json::encode(array('success' => false, 'errormsg' => DMG_Translate::_('parque.local.form.unique_error')));
						}
					}
				}
			}
		} else {
			if (DMG_Acl::canAccess(19)) {
				$obj = new ScmLocal();
				$obj->nm_local = $this->getRequest()->getParam('nm_local');
				$obj->tp_local = $this->getRequest()->getParam('tp_local');
				
				if($this->getRequest()->getParam('fl_portal') == 'on'){
					$obj->fl_portal = 1;
					$obj->user_portal = $this->getRequest()->getParam('user_portal');
					$obj->pass_portal = $this->getRequest()->getParam('pass_portal');
				}
				else {
					$obj->fl_portal = 0;
				}
				
				try {
					$obj->save();
					echo Zend_Json::encode(array('success' => true));
				} catch (Exception $e) {
					if($e->getCode() == 23505){
						echo Zend_Json::encode(array('success' => false, 'errormsg' => DMG_Translate::_('parque.local.form.unique_error')));
					}
				}
			}
		}
	}
	public function deleteAction () {
		if (DMG_Acl::canAccess(20)) {
			echo DMG_Crud::delete('ScmLocal', $this->getRequest()->getParam('id'));
		}
	}
}