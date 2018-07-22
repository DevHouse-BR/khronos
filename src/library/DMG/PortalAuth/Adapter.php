<?php

class DMG_PortalAuth_Adapter implements Zend_Auth_Adapter_Interface {
	private $_username;
	private $_password;

	public function __construct($username, $password) {
		$this->_username = $username;
		$this->_password = $password;
	}
	public function authenticate() {
		try {
			$user = Doctrine_Query::create()->from('ScmLocal')
						->where('user_portal = ?', $this->_username)
						->addWhere('pass_portal = ?', $this->_password)
						->addWhere('fl_portal = ?', 1)
						->fetchOne();
			if (!$user) {
				return new Zend_Auth_Result(Zend_Auth_Result::FAILURE, null, array(DMG_Translate::_('auth.error')));
			}
			else {
				$identity = new stdClass();
				$identity->id = $user->id;
				$identity->name = $user->user_portal;
				$identity->id_local = $user->id;
				$identity->language = DMG_Config::get(1);
				$identity->nm_local = $user->nm_local;
				
				return new Zend_Auth_Result(Zend_Auth_Result::SUCCESS, $identity, array());
			}
		}
		catch(Exception $e) {
			return new Zend_Auth_Result(Zend_Auth_Result::FAILURE_CREDENTIAL_INVALID, null, array(DMG_Translate::_('auth.error')));
		}
	}
}