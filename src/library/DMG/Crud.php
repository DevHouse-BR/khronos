<?php

class DMG_Crud {
	public function index ($model, $fields) {
		$query = Doctrine_Query::create()->from($model)->select($fields);
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
		return Zend_Json::encode(array('total' => $query->count(), 'data' => $query->execute()->toArray()));
	}
	public function get ($model, $id) {
		$obj = Doctrine::getTable($model)->find($id);
		if ($obj) {
			return Zend_Json::encode(array('success' => true, 'data' => $obj->toArray()));
		}
	}
	public function save ($model, $id, $fields) {
		if ($id == 0) {
			$obj = new $model();
		} else {
			$obj = Doctrine::getTable($model)->find($id);
		}
		foreach ($fields as $k) {
			$obj->$k = $this->getRequest()->getParam($k);
		}
		$obj->save();
		return Zend_Json::encode(array('success' => true, 'data' => $obj->toArray()));
	}
	public function delete ($model, $id) {
		if (!is_array($id)) {
			$id = array($id);
		}
		foreach ($id as $k) {
			$obj = Doctrine::getTable($model)->find($k);
			if ($obj) {
				try {
					$obj->delete();
				} catch (Exception $e) {
					#
				}
			}
		}
		return Zend_Json::encode(array('success' => true));
	}
}