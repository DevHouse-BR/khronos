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
					'percent_local' => ($k->percent_local ? $k->percent_local . '%' : ''),
				);
			}
			echo Zend_Json::encode(array('total' => $query->count(), 'data' => $data));
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(18)) {
			echo DMG_Crud::get($this, 'ScmLocal', (int) $this->getRequest()->getParam('id'));
		}
	}
	public function percentAction () {
		if (DMG_Acl::canAccess(26) || DMG_Acl::canAccess(27)) {
			try {
				$local = Doctrine::getTable('ScmLocal')->find((int) $this->getRequest()->getParam('id_local'));
				if (!$local) {
					throw new Exception();
				}
				echo Zend_Json::encode(array('success' => true, 'percent_local' => $local->percent_local));
			} catch (Exception $e) {
				echo Zend_Json::encode(array('success' => false));
			}
		}
	}
	public function saveAction () {
		$id = (int) $this->getRequest()->getParam('id');
		if ($id > 0) {
			if (DMG_Acl::canAccess(18)) {
				$error = array();
				$obj = Doctrine::getTable('ScmLocal')->find($id);
				if ($obj) {
					$obj->nm_local = $this->getRequest()->getParam('nm_local');
					$obj->tp_local = $this->getRequest()->getParam('tp_local');
					$obj->percent_local = $this->getRequest()->getParam('percent_local');
					
					$notEmpty = new Zend_Validate_NotEmpty();
					$Int = new Zend_Validate_Int();
					
					if ($notEmpty->isValid($obj->percent_local)) {
						if (!$Int->isValid($obj->percent_local)) {
							$error['percent_local'] = DMG_Translate::_('parque.local.percent_local.string');
						} else if ($obj->percent_local < 0 || $obj->percent_local > 100) {
							$error['percent_local'] = DMG_Translate::_('parque.local.percent_local.negativo');
						}
					}
										
					if($this->getRequest()->getParam('fl_portal') == 'on'){
						$obj->fl_portal = 1;
						$obj->user_portal = $this->getRequest()->getParam('user_portal');
						$obj->pass_portal = $this->getRequest()->getParam('pass_portal');
					}
					else {
						$obj->fl_portal = 0;
					}

					try {
						if (count($error)) {
	 						throw new Exception();
						}
						$obj->save();
						echo Zend_Json::encode(array('success' => true));
					} catch (Exception $e) {
						if($e->getCode() == 23505){
							echo Zend_Json::encode(array('success' => false, 'message' => DMG_Translate::_('parque.local.form.unique_error')));
						} else {
							echo Zend_Json::encode(array('success' => false, 'message' => reset($error), 'error' => $error));
						}
					}
				}
			}
		} else {
			if (DMG_Acl::canAccess(19)) {
				$error = array();
				$obj = new ScmLocal();
				$obj->nm_local = $this->getRequest()->getParam('nm_local');
				$obj->tp_local = $this->getRequest()->getParam('tp_local');
				$obj->percent_local = $this->getRequest()->getParam('percent_local');
				
				$notEmpty = new Zend_Validate_NotEmpty();
				$Int = new Zend_Validate_Int();
				
				if ($notEmpty->isValid($obj->percent_local)) {
					if (!$Int->isValid($obj->percent_local)) {
						$error['percent_local'] = DMG_Translate::_('parque.local.percent_local.string');
					} else if ($obj->percent_local < 0 || $obj->percent_local > 100) {
						$error['percent_local'] = DMG_Translate::_('parque.local.percent_local.negativo');
					}
				}
								
				if($this->getRequest()->getParam('fl_portal') == 'on'){
					$obj->fl_portal = 1;
					$obj->user_portal = $this->getRequest()->getParam('user_portal');
					$obj->pass_portal = $this->getRequest()->getParam('pass_portal');
				}
				else {
					$obj->fl_portal = 0;
				}
				
				try {
					if (count($error)) {
 						throw new Exception();
					}
					$obj->save();
					echo Zend_Json::encode(array('success' => true));
				} catch (Exception $e) {
					if($e->getCode() == 23505){
						echo Zend_Json::encode(array('success' => false, 'message' => DMG_Translate::_('parque.local.form.unique_error')));
					} else {
						echo Zend_Json::encode(array('success' => false, 'message' => reset($error), 'error' => $error));
					}
				}
			}
		}
	}
	public function deleteAction () {
		if (DMG_Acl::canAccess(20)) {
			echo DMG_Crud::delete($this, 'ScmLocal', $this->getRequest()->getParam('id'));
		}
	}
}