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
		Zend_Auth::getInstance()->setStorage(new Zend_Auth_Storage_Session(DMG_Config::get(18)));
		if (!Zend_Auth::getInstance()->authenticate(new DMG_Auth_Adapter($this->getRequest()->getParam('username'),$this->getRequest()->getParam('password')))->isValid()) {
			echo Zend_Json::encode(array('failure' => true));
		} else {
			$user = Doctrine::getTable('ScmUser')->find(Zend_Auth::getInstance()->getIdentity()->id);
			
			$session = Doctrine::getTable('ScmSession')->findOneByPhpsessid(session_id());
			if ($session) {
				$session->dt_fim_sessao = null;
			}
			else{
				$session = new ScmSession();
				$session->id_usuario = $user->id;
				$session->dt_inicio_sessao = DMG_Date::now();
				$session->ip = $_SERVER['REMOTE_ADDR'];
				$session->hostname = gethostbyaddr($_SERVER['REMOTE_ADDR']);
				$session->navegador = $_SERVER['HTTP_USER_AGENT'];
				$session->phpsessid = session_id();
			}
			$session->save();
			echo Zend_Json::encode(array('success' => true, 'user' => array(
				'id' => $user->id,
				'name' => $user->name
			)));
		}
	}
	
	public function logoutAction () {
		Zend_Auth::getInstance()->setStorage(new Zend_Auth_Storage_Session(DMG_Config::get(18)));
		$session = Doctrine::getTable('ScmSession')->findOneByPhpsessid(session_id());
		if ($session) {
			$session->dt_fim_sessao = DMG_Date::now();
			$session->save();
		}
		//Zend_Session::regenerateId();
		Zend_Auth::getInstance()->clearIdentity();
		
		$this->_helper->redirector('index', 'index');
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
		/*if ($id == 0) {
			if (!strlen($this->getRequest()->getParam('password'))) {
				$errors['password'] = DMG_Translate::_('administration.user.form.password.validation');
			} else {
				$obj->password = $this->getRequest()->getParam('password');
			}
		} else {
			if (strlen($this->getRequest()->getParam('password'))) {
				$obj->password = $this->getRequest()->getParam('password');
			}
		}*/
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
		if ((DMG_Acl::canAccess(70)) || DMG_Acl::canAccess(71)){
			$js .= $this->view->render('index/consultas.js');
		}
		if (DMG_Acl::canAccess(71)) {
			$js .= $this->view->render('maquina/consulta-historico-maquina.js');
		}
		if (DMG_Acl::canAccess(72)) {
			$js .= $this->view->render('faturamento/window.js');
		}
		if (DMG_Acl::canAccess(73)) {
			$js .= $this->view->render('faturamento/form-online.js');
		}
		if (DMG_Acl::canAccess(89)) {
			$js .= $this->view->render('faturamento/form-offline.js');
			$js .= $this->view->render('faturamento/form-offline-manual.js');
		}
		if (DMG_Acl::canAccess(76)) {
			$js .= $this->view->render('faturamento/window-excecoes.js');
		}
		if (DMG_Acl::canAccess(77)) {
			$js .= $this->view->render('session/window.js');
		}
		if (DMG_Acl::canAccess(80)) {
			$js .= $this->view->render('faturamento/reports.js');
		}
		if (DMG_Acl::canAccess(88)) {
			$js .= $this->view->render('faturamento/consultas.js');
		}
		if (DMG_Acl::canAccess(86)) {
			$js .= $this->view->render('faturamento/consulta-historico.js');
		}
		if (DMG_Acl::canAccess(87)) {
			$js .= $this->view->render('movimentacao/consulta-entrada.js');
		}
		echo DMG_JSMin::minify($js);
		//echo $js;
	}
	
	public function infoAction () {
		switch ($this->getRequest()->getParam('data')) {
			case 'status-maquina':
				if (DMG_ACl::canAccess(35)) {
					$query = Doctrine_Query::create()
						->from('ScmStatusMaquina st')
						->innerJoin('st.ScmMaquina m')
						->where('st.fl_alta = ?', 1)
						->select('COUNT(m.id) AS total')
						->addSelect('st.nm_status_maquina')
						->groupBy('st.nm_status_maquina')
						->execute(array(), Doctrine::HYDRATE_SCALAR)
					;
				}
				echo Zend_Json::encode(array('success' => true, 'data' => $query));
			break;
		}
	}
	public function portalFaturamentoAction () {
		if (DMG_Acl::canAccess(34)) {
			$moedas = Doctrine::getTable('ScmMoeda')->createQuery('m');
			$data = array();
			$series = array();
			$fields = array('data', 'intervalo');
			foreach($moedas->execute() as $moeda){
				$fields[] = $moeda->nm_moeda;
				
				$series[] = array(
					'yField' => $moeda->nm_moeda,
				    'displayName' => $moeda->nm_moeda,
				   	'style' => array('size' => 15)
				);
				
				$dias = Doctrine_Query::create()
					->select('to_char(fd.dt_fatura, \'WW\') AS semana')
					->addSelect('to_char(fd.dt_fatura, \'YYYY\') AS ano')
					->addSelect('SUM(fi.vl_empresa) AS valor_empresa')
					->from('ScmFaturaDoc fd')
					->innerJoin('fd.ScmFaturaItem fi')
					->orderBy('semana DESC')
					->groupBy('semana, ano')
					->addWhere('fi.id_moeda = ?', $moeda->id)
					->addWhere('fd.id_fatura_doc_status = ?', 2)
					->addWhere('fd.dt_fatura > (current_date - 70)')
				;
				
				foreach ($dias->execute(array(), Doctrine::HYDRATE_SCALAR) as $k) {
					
					$intervalo = DMG_Date::getDaysInWeek($k['fd_semana'], $k['fd_ano']);
					$intervalo = strftime('%d/%m/%Y', $intervalo[0]) . chr(10) . strftime('%d/%m/%Y', $intervalo[6]);
					
					$flag = false;
					foreach($data as &$d){
						if($d['data'] == $k['fd_semana']){
							$d[$moeda->nm_moeda] = (float) $k['fi_valor_empresa'];
							$flag = true;
							break;
						}
					}
					if(!$flag){
						$data[] = array(
							'data' => $k['fd_semana'],
							'intervalo' => $intervalo,
							$moeda->nm_moeda => (float) $k['fi_valor_empresa']
						);
					}
				}
			}
			echo Zend_Json::encode(array('success' => true, 'data' => $data, 'series' => $series, 'fields' => $fields));
		}
	}
}