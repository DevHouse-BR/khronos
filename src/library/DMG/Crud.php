<?php

class DMG_Crud {
	public static function filter ($_this, &$query, $filter) {
		if (is_array($filter)) {
			foreach ($filter as $k) {
				switch ($k['data']['type']) {
					case 'string':
						$query->addWhere($k['field'] . ' LIKE ?', '%' . $k['data']['value'] . '%');
					break;
					case 'list':
						$l = explode(',', $k['data']['value']);
						$i = 0;
						foreach ($l as $m) {
							if ($i++ == 0) {
								$query->addWhere($k['field'] . ' = ?', $m);
							} else {
								$query->orWhere($k['field'] . ' = ?', $m);
							}							
						}
					break;
				}
			}
		}
	}
	public static function index ($_this, $model, $fields) {
		$query = Doctrine_Query::create()->from($model)->select($fields);
		$limit = (int) $_this->getRequest()->getParam('limit');
		if ($limit > 0) {
			$query->limit($limit);
		}
		$offset = (int) $_this->getRequest()->getParam('start');
		if ($offset > 0) {
			$query->offset($offset);
		}
		$sort = (string) $_this->getRequest()->getParam('sort');
		$dir = (string) $_this->getRequest()->getParam('dir');
		if ($sort && ($dir == 'ASC' || $dir == 'DESC')) {
			$query->orderby($sort . ' ' . $dir);
		}
		$filter = $_this->getRequest()->getParam('filter');
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
	public static function get ($_this, $model, $id) {
		$obj = Doctrine::getTable($model)->find($id);
		if ($obj) {
			return Zend_Json::encode(array('success' => true, 'data' => $obj->toArray()));
		}
	}
	public static function save ($_this, $model, $id, $fields) {
		if ($id == 0) {
			$obj = new $model();
		} else {
			$obj = Doctrine::getTable($model)->find($id);
		}
		foreach ($fields as $k) {
			$obj->$k = $_this->getRequest()->getParam($k);
		}
		$obj->save();
		return Zend_Json::encode(array('success' => true, 'data' => $obj->toArray()));
	}
	public static function delete ($_this, $model, $id) {
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
	public static function paginate ($_this, &$query, $limit, $start, $sort, $dir) {
		$limit = (int) $limit;
		if ($limit > 0) {
			$query->limit($limit);
		}
		$offset = (int) $start;
		if ($offset > 0) {
			$query->offset($offset);
		}
		$sort = (string) $sort;
		$dir = (string) $dir;
		if ($sort && ($dir == 'ASC' || $dir == 'DESC')) {
			$query->orderby($sort . ' ' . $dir);
		}
		$filter = @$_GET['filter'];
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
	}
}