<?php

class DMG_Config {
	protected function __construct () {
		throw new Exception("This class can't be instanciated.");
	}
	public static function get ($id) {
		static $configs = array();
		if (empty($configs)) {
			foreach (Doctrine::getTable('ScmConfig')->findAll() as $k) {
				$configs[$k->id] = $k->value;
			}
		}
		return $configs[$id];
	}
}