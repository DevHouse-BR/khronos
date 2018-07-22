<?php

class UserController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(3)) {
			echo DMG_Crud::index('ScmUser', 'id, name, username, email, language, status');
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(4)) {
			$id = (int) $this->getRequest()->getParam('id');
			$obj = Doctrine::getTable('ScmUser')->find($id);
			if ($obj) {
				$obj->password = null;
				echo Zend_Json::encode(array('success' => true, 'data' => $obj->toArray()));
			}
		}
	}
	public function saveAction () {
		$id = (int) $this->getRequest()->getParam('id');
		if ($id > 0) {
			if (DMG_Acl::canAccess(4)) {
				$obj = Doctrine::getTable('ScmUser')->find($id);
				if ($obj) {
					$obj->name = $this->getRequest()->getParam('name');
					$obj->username = $this->getRequest()->getParam('username');
					$obj->email = $this->getRequest()->getParam('email');
					$obj->language = (strlen($this->getRequest()->getParam('language')) ? $this->getRequest()->getParam('language') : null);
					$obj->status = (int) $this->getRequest()->getParam('status');
					$validation = $this->saveValidate($obj, $id);
					if (!$validation) {
						try {
							$obj->save();
							echo Zend_Json::encode(array('success' => true));
						} catch (Exception $e) {
							echo Zend_Json::encode(array('success' => false));
						}
					} else {
						echo Zend_Json::encode(array('success' => false, 'errors' => $validation));
					}
				}
			}
		} else {
			if (DMG_Acl::canAccess(5)) {
				$obj = new ScmUser();
				$obj->name = $this->getRequest()->getParam('name');
				$obj->username = $this->getRequest()->getParam('username');
				$obj->email = $this->getRequest()->getParam('email');
				$obj->language = (strlen($this->getRequest()->getParam('language')) ? $this->getRequest()->getParam('language') : null);
				$obj->status = (int) $this->getRequest()->getParam('status');
				$obj->password = $this->getRequest()->getParam('password');
				$validation = $this->saveValidate($obj, $id);
				if (!$validation) {
					try {
						$obj->save();
						echo Zend_Json::encode(array('success' => true));
					} catch (Exception $e) {
						echo Zend_Json::encode(array('success' => false));
					}
				} else {
					echo Zend_Json::encode(array('success' => false, 'errors' => $validation));
				}
			}
		}
	}
	public function deleteAction () {
		if (DMG_Acl::canAccess(6)) {
			$id = $this->getRequest()->getParam('id');
			try {
				Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
				if (is_array($id)) {
					foreach ($id as $k) {
						$this->deleteUser($k);
					}
				} else {
					$this->deleteUser($id);
				}
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
				echo Zend_Json::encode(array('success' => true));
			} catch (Exception $e) {
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				echo Zend_Json::encode(array('failure' => true, 'message' => DMG_Translate::_('administration.user.form.cannotdelete')));
			}
		}
	}
	protected function deleteUser ($id) {
		$user = Doctrine::getTable('ScmUser')->find($id);
		for ($i = 0; $i < count($user->ScmUserGroup); $i++) {
			$user->ScmUserGroup[$i]->delete();
		}
		$user->delete();
	}
	protected function saveValidate (&$obj, $id) {
		$errors = array();
		$qr1 = Doctrine_Query::create()->from('ScmUser')->addWhere('username = ?', $obj->username);
		$qr2 = Doctrine_Query::create()->from('ScmUser')->addWhere('email = ?', $obj->email);
		if ($id > 0) {
			$qr1->addWhere('id <> ?', $id);
			$qr2->addWhere('id <> ?', $id);
		}
		if ($qr1->count() > 0) {
			$errors['username'] = DMG_Translate::_('administration.user.form.username.invalid');
		}
		if ($qr2->count() > 0) {
			$errors['email'] = DMG_Translate::_('administration.user.form.email.invalid');
		}
		$validator = new Zend_Validate_EmailAddress();
		if (!$validator->isValid($obj->email)) {
			$errors['email'] = DMG_Translate::_('administration.user.form.email.invalidsyntax');
		}
		if (!strlen($this->getRequest()->getParam('username'))) {
			$errors['username'] = DMG_Translate::_('administration.user.form.username.validation');
		}
		// valida idioma
		if ($id == 0) {
			if (!strlen($this->getRequest()->getParam('password'))) {
				$errors['password'] = DMG_Translate::_('administration.user.form.password.validation');
			} else {
				$obj->password = $this->getRequest()->getParam('password');
			}
		} else {
			if (strlen($this->getRequest()->getParam('password'))) {
				$obj->password = $this->getRequest()->getParam('password');
			}
		}
		if ($obj->status == '1') {
			$obj->status = '1';
		} else {
			$obj->status = '0';
		}
		if (count($errors)) {
			return $errors;
		} else {
			return false;
		}
	}
	public function groupAction () {
		if (DMG_Acl::canAccess(12)) {
			$this->user = Doctrine::getTable('ScmUser')->find((int) $this->getRequest()->getParam('user'));
			if (!$this->user) {
				return;
			}
			switch ((string) $this->getRequest()->getParam('act')) {
				case 'save':
					$this->saveGroup();
				break;
				case 'getAssigned':
					$this->getAssignedGroup();
				break;
				case 'getUnassigned':
					$this->getUnassignedGroup();
				break;
			}
		}
	}
	protected function saveGroup () {
		$nodes = $this->getRequest()->getParam('node');
		Doctrine_Query::create()->delete()->from('ScmUserGroup')->addWhere('user_id = ?', $this->user->id)->execute();
		foreach ($nodes as $node) {
			if (substr($node, 0, 1) == 'g') {
				$ug = new ScmUserGroup();
				$ug->user_id = $this->user->id;
				$ug->group_id = substr($node, 1);
				try {
					$ug->save();
				} catch (Exception $e) {
					//
				}
				unset($ug);
			}
		}
		echo Zend_Json::encode(array('success' => true));
	}
	protected function getUnassignedGroup () {
		// pega grupos dos quais o usuário não está
		$query = Doctrine_Query::create()->from('ScmGroup g')->addWhere('g.id NOT IN (SELECT ug.group_id FROM ScmUserGroup ug WHERE ug.user_id = ?)', $this->user->id)->execute();
		$data = array();
		foreach ($query as $l) {
			$data[] = array(
				'id' => 'g' . $l->id,
				'text' => $l->name,
				'leaf' => true
			);
		}
		echo Zend_Json::encode($data);
	}
	protected function getAssignedGroup () {
		// pega grupos dos quais o usuário está
		$query = Doctrine::getTable('ScmUserGroup')->findByUserId($this->user->id);
		$data = array();
		foreach ($query as $l) {
			$data[] = array(
				'id' => 'g' . $l->ScmGroup->id,
				'text' => $l->ScmGroup->name,
				'leaf' => true
			);
		}
		echo Zend_Json::encode($data);
	}
	public function empresaAction () {
		if (DMG_Acl::canAccess(37)) {
			$this->user = Doctrine::getTable('ScmUser')->find((int) $this->getRequest()->getParam('user'));
			if (!$this->user) {
				return;
			}
			switch ((string) $this->getRequest()->getParam('act')) {
				case 'save':
					$this->saveEmpresa();
				break;
				case 'getAssigned':
					$this->getAssignedEmpresa();
				break;
				case 'getUnassigned':
					$this->getUnassignedEmpresa();
				break;
			}
		}
	}
	protected function saveEmpresa () {
		$nodes = $this->getRequest()->getParam('node');
		Doctrine_Query::create()->delete()->from('ScmUserEmpresa')->addWhere('user_id = ?', $this->user->id)->execute();
		foreach ($nodes as $node) {
			if (substr($node, 0, 1) == 'e') {
				$ug = new ScmUserEmpresa();
				$ug->user_id = $this->user->id;
				$ug->id_empresa = substr($node, 1);
				try {
					$ug->save();
				} catch (Exception $e) {
					//
				}
				unset($ug);
			}
		}
		echo Zend_Json::encode(array('success' => true));
	}
	protected function getUnassignedEmpresa () {
		// pega grupos dos quais o usuário não está
		$query = Doctrine_Query::create()->from('ScmEmpresa e')->addWhere('e.id NOT IN (SELECT ue.id_empresa FROM ScmUserEmpresa ue WHERE ue.user_id = ?)', $this->user->id)->execute();
		$data = array();
		foreach ($query as $l) {
			$data[] = array(
				'id' => 'e' . $l->id,
				'text' => $l->nm_empresa,
				'leaf' => true
			);
		}
		echo Zend_Json::encode($data);
	}
	protected function getAssignedEmpresa () {
		// pega grupos dos quais o usuário está
		$query = Doctrine::getTable('ScmUserEmpresa')->findByUserId($this->user->id);
		$data = array();
		foreach ($query as $l) {
			$data[] = array(
				'id' => 'e' . $l->ScmEmpresa->id,
				'text' => $l->ScmEmpresa->nm_empresa,
				'leaf' => true
			);
		}
		echo Zend_Json::encode($data);
	}
}