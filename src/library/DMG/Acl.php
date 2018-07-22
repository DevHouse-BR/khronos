<?php

class DMG_Acl {
	protected static $_user;
	protected static $_instance;
	protected function __construct () {
		//
	}
	public function canAccess ($rule) {
		if (Zend_Auth::getInstance()->hasIdentity()) {
			if (!self::$_instance) {
				self::$_instance = new self;
				self::$_user = Zend_Auth::getInstance()->getIdentity();
			}
			return Doctrine_Query::create()->from('ScmUser u')
				->innerJoin('u.ScmUserGroup ug')
				->innerJoin('ug.ScmGroup g')
				->innerJoin('g.ScmGroupRule gr')
				->innerJoin('gr.ScmRule r')
				->addWhere('r.id = ?', $rule)
				->addWhere('u.id = ?', self::$_user->id)->count();
		}
	}
}