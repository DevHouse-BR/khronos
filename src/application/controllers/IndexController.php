<?php

class IndexController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
	}
	public function indexAction () {
		echo $this->view->render('index/index.phtml');
	}
	public function authAction () {
		if (!$this->getRequest()->isPost()) {
			return;
		}
		if (!Zend_Auth::getInstance()->authenticate(new DMG_Auth_Adapter($this->getRequest()->getParam('username'),$this->getRequest()->getParam('password')))->isValid()) {
			echo Zend_Json::encode(array('failure' => true));
		} else {
			$user = Doctrine::getTable('ScmUser')->find(Zend_Auth::getInstance()->getIdentity()->id);
			echo Zend_Json::encode(array('success' => true, 'user' => array(
				'id' => $user->id,
				'name' => $user->name
			)));
		}
	}
	public function userAction () {
		if (!Zend_Auth::getInstance()->hasIdentity()) {
			return;
		}
		switch ($this->getRequest()->getParam('do')) {
			case 'get':
				$user = Doctrine::getTable('ScmUser')->find(Zend_Auth::getInstance()->getIdentity()->id);
				echo Zend_Json::encode(array(
					'success' => true,
					'data' => array(
						'id' => $user->id,
						'name' => $user->name,
						'username' => $user->username,
						'email' => $user->email,
						'language' => $user->language,
					)
				));
			break;
			case 'update':
				$obj = Doctrine::getTable('ScmUser')->find(Zend_Auth::getInstance()->getIdentity()->id);
				if ($obj) {
					$obj->name = $this->getRequest()->getParam('name');
					$obj->username = $this->getRequest()->getParam('username');
					$obj->email = $this->getRequest()->getParam('email');
					$obj->language = (strlen($this->getRequest()->getParam('language')) ? $this->getRequest()->getParam('language') : null);
					$validation = $this->saveValidate($obj, Zend_Auth::getInstance()->getIdentity()->id);
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
			break;
		}
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
	public function jsAction () {
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'text/javascript; charset=UTF-8');
		$js = $this->view->render('index/i18n.js');
		$js .= $this->view->render('index/base.js');
		$js .= $this->view->render('index/edit-profile.js');
		if (DMG_Acl::canAccess(1)) {
			$js .= $this->view->render('config/administration-config.js');
		}
		if (DMG_Acl::canAccess(2)) {
			$js .= $this->view->render('config/administration-config-form.js');
		}
		if (DMG_Acl::canAccess(3)) {
			$js .= $this->view->render('user/administration-user.js');
		}
		if (DMG_Acl::canAccess(4) || DMG_Acl::canAccess(5)) {
			$js .= $this->view->render('user/administration-user-form.js');
		}
		if (DMG_Acl::canAccess(7)) {
			$js .= $this->view->render('group/administration-group.js');
		}
		if (DMG_Acl::canAccess(8) || DMG_Acl::canAccess(9)) {
			$js .= $this->view->render('group/administration-group-form.js');
		}
		if (DMG_Acl::canAccess(11)) {
			$js .= $this->view->render('group/administration-group-permission.js');
		}
		if (DMG_Acl::canAccess(12)) {
			$js .= $this->view->render('user/administration-user-group.js');
		}
		if (DMG_Acl::canAccess(37)) {
			$js .= $this->view->render('user/administration-user-empresa.js');
		}
		if (DMG_Acl::canAccess(38)) {
			$js .= $this->view->render('empresa/administration-empresa.js');
		}
		if (DMG_Acl::canAccess(39) || DMG_Acl::canAccess(40)) {
			$js .= $this->view->render('empresa/administration-empresa-form.js');
		}
		if (DMG_Acl::canAccess(50)) {
			$js .= $this->view->render('parceiro/administration-parceiro.js');
		}
		if (DMG_Acl::canAccess(51) || DMG_Acl::canAccess(52)) {
			$js .= $this->view->render('parceiro/administration-parceiro-form.js');
		}
		if (DMG_Acl::canAccess(42)) {
			$js .= $this->view->render('filial/administration-filial.js');
		}
		if (DMG_Acl::canAccess(43) || DMG_Acl::canAccess(44)) {
			$js .= $this->view->render('filial/administration-filial-form.js');
		}
		if (DMG_Acl::canAccess(13)) {
			$js .= $this->view->render('jogo/parque-jogo.js');
		}
		if (DMG_Acl::canAccess(14) || DMG_Acl::canAccess(15)) {
			$js .= $this->view->render('jogo/parque-jogo-form.js');
		}
		if (DMG_Acl::canAccess(17)) {
			$js .= $this->view->render('local/parque-local.js');
		}
		if (DMG_Acl::canAccess(18) || DMG_Acl::canAccess(19)) {
			$js .= $this->view->render('local/parque-local-form.js');
		}
		if (DMG_Acl::canAccess(46)) {
			$js .= $this->view->render('local-tipo/parque-local-tipo.js');
		}
		if (DMG_Acl::canAccess(47) || DMG_Acl::canAccess(48)) {
			$js .= $this->view->render('local-tipo/parque-local-tipo-form.js');
		}
		if (DMG_Acl::canAccess(21)) {
			$js .= $this->view->render('gabinete/parque-gabinete.js');
		}
		if (DMG_Acl::canAccess(22) || DMG_Acl::canAccess(23)) {
			$js .= $this->view->render('gabinete/parque-gabinete-form.js');
		}
		if (DMG_Acl::canAccess(25)) {
			$js .= $this->view->render('maquina/parque-maquina.js');
		}
		if (DMG_Acl::canAccess(26) || DMG_Acl::canAccess(27)) {
			$js .= $this->view->render('maquina/parque-maquina-form.js');
		}
		if (DMG_Acl::canAccess(28)) {
			$js .= $this->view->render('transformacao/parque-transformacao.js');
			$js .= $this->view->render('transformacao/parque-transformacao-form.js');
		}
		if (DMG_Acl::canAccess(30)) {
			$js .= $this->view->render('consulta-parque/parque-consulta-parque.js');
		}
		if (DMG_Acl::canAccess(32) || DMG_Acl::canAccess(33)) {
			$js .= $this->view->render('fechamento/parque-fechamento.js');
		}
		if (DMG_Acl::canAccess(36)) {
			$js .= $this->view->render('index/reports.js');
		}
		if (DMG_Acl::canAccess(54)) {
			$js .= $this->view->render('status-maquina/window.js');
		}
		if (DMG_Acl::canAccess(55) || DMG_Acl::canAccess(56)) {
			$js .= $this->view->render('status-maquina/form.js');
		}
		if (DMG_Acl::canAccess(58)) {
			$js .= $this->view->render('movimentacao/window-entrada.js');
			$js .= $this->view->render('movimentacao/form-entrada.js');
		}
		if (DMG_Acl::canAccess(59)) {
			$js .= $this->view->render('movimentacao/window-saida.js');
			$js .= $this->view->render('movimentacao/form-saida.js');
		}
		if (DMG_Acl::canAccess(62)) {
			$js .= $this->view->render('regularizacao/window.js');
			$js .= $this->view->render('regularizacao/form-controlada.js');
			$js .= $this->view->render('regularizacao/form-falha.js');
		}
		if (DMG_Acl::canAccess(65)) {
			$js .= $this->view->render('status-maquina-assign/window.js');
			$js .= $this->view->render('status-maquina-assign/form.js');
		}
		//echo DMG_JSMin::minify($js);
		echo($js);
	}
	public function logoutAction () {
		Zend_Auth::getInstance()->clearIdentity();
		$this->_helper->redirector('index', 'index');
	}
	public function infoAction () {
		switch ($this->getRequest()->getParam('data')) {
			case 'status-maquina':
				if (DMG_ACl::canAccess(35)) {
				try {
					$addr = @fsockopen(DMG_Config::get(7), DMG_Config::get(9), $errno, $errstr, DMG_Config::get(10));
					if ($errno != 0) {
						throw new Exception(DMG_Translate::_('parque.fechamento.xml.errno.1'));
					}
					fwrite($addr, "GET /machines HTTP/1.1\r\nHost: " . DMG_Config::get(7) . "\r\nConnection: Close\r\n\r\n");
					$xml = null;
					$header = null;
					do {
						$header .= fgets($addr);
					} while(strpos($header, "\r\n\r\n") === false);
					while (!feof($addr)) {
						$xml .= fgets($addr);
					}
					fclose($addr);
					if (preg_match("/200 OK/", $header) !== 1) {
						throw new Exception(DMG_Translate::_('parque.fechamento.xml.errno.2'));
					}
					$xml = preg_replace('/<machine name="(\w+)">0<jogo>/', '<machine name="$1"><jogo>', $xml);
					$xml = simplexml_load_string($xml);
					$maquinas = Doctrine::getTable('ScmMaquina')->findAll();
					$offline = $online = $jogando = 0;
					foreach ($maquinas as $k) {
						$m = 0;
						foreach ($xml as $l) {
							if ($k->nr_serie_connect == reset($l->attributes()->name)) {
								if (reset($l->offline) == 1) {
									$offline++;
								} else {
									$online++;
								}
								if (reset($l->creditos)*$k->vl_credito > DMG_Config::get(12)) {
									$jogando++;
								}
								break;
							}
							$m++;
						}
						if (count($xml) == $m) {
							$offline++;
						}
					}
					echo Zend_Json::encode(array('total' => 3, 'data' => array(
						array('status' => DMG_Translate::_('window.portal.status_maquina.online'), 'count' => $online),
						array('status' => DMG_Translate::_('window.portal.status_maquina.offline'), 'count' => $offline),
						array('status' => DMG_Translate::_('window.portal.status_maquina.jogando'), 'count' => $jogando),
					)));
				} catch (Exception $e) {
					echo $e->getMessage();
				}
			}
		}
	}
}