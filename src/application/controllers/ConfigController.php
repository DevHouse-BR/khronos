<?php

class ConfigController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(1)) {
                $query = Doctrine_Query::create()->from('ScmConfig');
		$query->addWhere('system = ?', false);
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
                echo Zend_Json::encode(array('total' => $query->count(), 'data' => $query->execute()->toArray()));
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(2)) {
			$id = (int) $this->getRequest()->getParam('id');
			$obj = Doctrine::getTable('ScmConfig')->find($id);
			if ($obj) {
				echo Zend_Json::encode(array('success' => true, 'data' => $obj->toArray()));
			}
		}
	}
	public function saveAction () {
		if (DMG_Acl::canAccess(2)) {
			echo DMG_Crud::save($this, 'ScmConfig', (int) $this->getRequest()->getParam('id'), array('value'));
		}
	}
}
