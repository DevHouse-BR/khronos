<?php

class DMG_Auth_Adapter implements Zend_Auth_Adapter_Interface {
	private $_username;
	private $_password;

	public function __construct($username, $password) {
		$this->_username = $username;
		$this->_password = $password;
	}
	public function authenticate() {
		try {
			$user = Doctrine_Query::create()->from('ScmUser')->where('username = ?', $this->_username)
					->addWhere('password = ?', $this->_password)->addWhere('status = ?', 1)->fetchOne();
			if (!$user) {
				return new Zend_Auth_Result(Zend_Auth_Result::FAILURE, null, array('auth.loginerror'));
			} else {
				return new Zend_Auth_Result(Zend_Auth_Result::SUCCESS, $user, array());
			}
		} catch(Exception $e) {
			return new Zend_Auth_Result(Zend_Auth_Result::FAILURE_CREDENTIAL_INVALID, null, array('auth.loginerror'));
		}
	}
}