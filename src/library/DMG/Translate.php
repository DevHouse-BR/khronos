<?php

class DMG_Translate {
	protected function __construct () {
		throw new Exception("This class can't be instanciated.");
	}
	public function _($text) {
		static $instance = null;
		static $log = null;
		static $write = null;
		if (!isset($write)) {
			$writer = new Zend_Log_Writer_Stream(dirname(APPLICATION_PATH) . DIRECTORY_SEPARATOR . 'log-translate.txt');
		}
		if (!isset($log)) {
			$log = new Zend_Log($writer);
		}
		if(!isset($instance)) {
			if (Zend_Auth::getInstance()->hasIdentity()) {
				$language = Zend_Auth::getInstance()->getIdentity()->language;
				if (!$language) {
					$language = DMG_Config::get(1);
				}
			} else {
				$language = DMG_Config::get(1);
			}
			$locale = new Zend_Locale($language);
			$instance = new Zend_Translate('array', APPLICATION_PATH . '/translations', $locale, array(
				'scan' => Zend_Translate::LOCALE_FILENAME,
				'disableNotices' => true,
				'log' => $log,
				'logUntranslated' => true
			));
		}
		return utf8_encode($instance->_($text));
	}
	public function getLang () {
		if (Zend_Auth::getInstance()->hasIdentity()) {
			$lang = Zend_Auth::getInstance()->getIdentity()->language;
		}
		if (!isset($lang) || is_null($lang)) {
			$lang = DMG_Config::get(1);
		}
		return $lang;
	}
}