<?php

class GroupController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(7)) {
			echo DMG_Crud::index($this, 'ScmGroup', 'id, name');
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(8)) {
			echo DMG_Crud::get($this, 'ScmGroup', (int) $this->getRequest()->getParam('id'));
		}
	}
	public function deleteAction () {
		if (DMG_Acl::canAccess(10)) {
			$id = $this->getRequest()->getParam('id');
			try {
				Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
				if (is_array($id)) {
					foreach ($id as $k) {
						$this->deleteGroup($k);
					}
				} else {
					$this->deleteGroup($id);
				}
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
				echo Zend_Json::encode(array('success' => true));
			} catch (Exception $e) {
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				echo Zend_Json::encode(array('failure' => true, 'message' => DMG_Translate::_('administration.group.form.cannotdelete')));
			}
		}
	}
	protected function deleteGroup ($id) {
		$group = Doctrine::getTable('ScmGroup')->find($id);
		for ($i = 0; $i < count($group->ScmGroupRule); $i++) {
			$group->ScmGroupRule[$i]->delete();
		}
		$group->delete();
	}
	public function saveAction () {
		$id = (int) $this->getRequest()->getParam('id');
		if ($id > 0) {
			if (DMG_Acl::canAccess(8)) {
				$obj = Doctrine::getTable('ScmGroup')->find($id);
				if ($obj) {
					$obj->name = $this->getRequest()->getParam('name');
					try {
						$obj->save();
						echo Zend_Json::encode(array('success' => true));
					} catch (Exception $e) {
						echo Zend_Json::encode(array('success' => false));
					}
				}
			}
		} else {
			if (DMG_Acl::canAccess(9)) {
				$obj = new ScmGroup();
				$obj->name = $this->getRequest()->getParam('name');
				try {
					$obj->save();
					echo Zend_Json::encode(array('success' => true));
				} catch (Exception $e) {
					echo Zend_Json::encode(array('success' => false));
				}
			}
		}
	}
	public function permissionAction () {
		if (DMG_Acl::canAccess(11)) {
			$this->group = Doctrine::getTable('ScmGroup')->find((int) $this->getRequest()->getParam('group'));
			if (!$this->group) {
				return;
			}
			switch ((string) $this->getRequest()->getParam('act')) {
				case 'save':
					$this->save();
				break;
				case 'getAssigned':
					$this->getAssigned();
				break;
				case 'getUnassigned':
					$this->getUnassigned();
				break;
			}
		}
	}
	protected function save () {
		$nodes = $this->getRequest()->getParam('node');
		Doctrine_Query::create()->delete()->from('ScmGroupRule')->addWhere('group_id = ?', $this->group->id)->execute();
		foreach ($nodes as $node) {
			if (substr($node, 0, 1) == 'p') {
				$pr = new ScmGroupRule();
				$pr->group_id = $this->group->id;
				$pr->rule_id = substr($node, 1);
				try {
					$pr->save();
				} catch (Exception $e) {
					//
				}
				unset($pr);
			}
		}
		echo Zend_Json::encode(array('success' => true));
	}
	protected function getUnassigned () {
		$grouprule = array();
		foreach (Doctrine::getTable('ScmGroupRule')->findByGroupId($this->group->id) as $k) {
			$grouprule[] = $k->rule_id;
		}
		$rule = array();
		foreach (Doctrine::getTable('ScmRule')->findAll() as $k) {
			$rule[] = $k->id;
		}
		$diff = array_diff($rule, $grouprule);
		if(empty($diff)) {
			$diff[] = 0;
		}
		$data = array();
		$modules = Doctrine::getTable('ScmModule')->findAll();
		if (!$modules) {
			return;
		}
		foreach ($modules as $k) {
			$children = array();
			foreach (Doctrine_Query::create()->from('ScmRule')->addWhere('module_id = ?', $k->id)->whereIn('id', $diff)->orderBy('name ASC')->execute() as $l) {
				$children[] = array(
					'id' => 'p' . $l->id,
					'text' => $l->name,
					'leaf' => true
				);
			}
			if (count($children)) {
				$data[] = array(
					'id' => 'm' . $k->id,
					'text' => $k->name,
					'iconCls' => true,
					'children' => $children
				);
			}
		}
		echo Zend_Json::encode($data);
	}
	protected function getAssigned () {
		$grouprule = array();
		foreach (Doctrine::getTable('ScmGroupRule')->findByGroupId($this->group->id) as $k) {
			$grouprule[] = $k->rule_id;
		}
		if (empty($grouprule)) {
			$grouprule[] = 0;
		}
		$data = array();
		$modules = Doctrine::getTable('ScmModule')->findAll();
		if (!$modules) {
			return;
		}
		foreach ($modules as $k) {
			$children = array();
			foreach (Doctrine_Query::create()->from('ScmRule')->addWhere('module_id = ?', $k->id)->whereIn('id', $grouprule)->orderBy('name ASC')->execute() as $l) {
				$children[] = array(
					'id' => 'p' . $l->id,
					'text' => $l->name,
					'leaf' => true
				);
			}
			if (count($children)) {
				$data[] = array(
					'id' => 'm' . $k->id,
					'text' => $k->name,
					'iconCls' => true,
					'expand' => true,
					'children' => $children
				);
			}
		}
		echo Zend_Json::encode($data);
	}
}