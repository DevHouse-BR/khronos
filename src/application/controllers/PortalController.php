<?php

class PortalController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
	}
	public function logoutAction () {
		$session = Doctrine::getTable('ScmSession')->findOneByPhpsessid(session_id());
		$session->dt_fim_sessao = DMG_Date::now();
		$session->save();
		$auth = Zend_Auth::getInstance();
		$auth->setStorage(new Zend_Auth_Storage_Session('portalAuth'));
		$auth->clearIdentity();
		Zend_Session::regenerateId();
		$this->_helper->redirector('index', 'portal');
	}
	public function indexAction () {
		echo $this->view->render('portal/index.phtml');
	}
	public function authAction () {
		if (!$this->getRequest()->isPost()) {
			return;
		}
		$auth = Zend_Auth::getInstance();
		$auth->setStorage(new Zend_Auth_Storage_Session('portalAuth'));
		$resultado = $auth->authenticate(new DMG_PortalAuth_Adapter($this->getRequest()->getParam('loginUsername'),$this->getRequest()->getParam('loginPassword')));
		$this->getResponse()->setHeader('Content-Type', 'application/json');
		if (!$resultado->isValid()) {
			echo Zend_Json::encode(array('failure' => true, 'errormsg'=>$resultado->getMessages()));
		} else {
			$local = Doctrine::getTable('ScmLocal')->find($auth->getIdentity()->id);
			$session = new ScmSession();
			$session->id_local = $local->id;
			$session->dt_inicio_sessao = DMG_Date::now();
			$session->ip = $_SERVER['REMOTE_ADDR'];
			$session->hostname = gethostbyaddr($_SERVER['REMOTE_ADDR']);
			$session->navegador = $_SERVER['HTTP_USER_AGENT'];
			$session->phpsessid = session_id();
			$session->save();
		 	echo Zend_Json::encode(array('success' => true));
		}
	}
	
	public function desktopAction () {
		$auth = Zend_Auth::getInstance();
		$auth->setStorage(new Zend_Auth_Storage_Session('portalAuth'));
		if($auth->hasIdentity()) echo $this->view->render('portal/desktop.phtml');
		else echo $this->view->render('portal/index.phtml');
	}
	
	public function jsloginAction () {		
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'text/javascript; charset=UTF-8');
			
		$js = $this->view->render('index/i18n.js');
		$js .= $this->view->render('portal/pt-BR.js');
		
		
		/*$js = str_replace('"images/', '"../images/', $js);
		$js = str_replace("'images/", "'../images/", $js);
		$js = str_replace("'extjs/resources", "'../extjs/resources", $js);
		$js = str_replace('"extjs/resources', '"../extjs/resources', $js);*/
		
		if(getenv('APPLICATION_ENV') == 'development') echo($js);
		else echo(DMG_JSMin::minify($js));
	}
	
	public function jsAction () {
		$auth = Zend_Auth::getInstance();
		$auth->setStorage(new Zend_Auth_Storage_Session('portalAuth'));
		if(!$auth->hasIdentity()) return;
		
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'text/javascript; charset=UTF-8');
			
		$js = $this->view->render('index/i18n.js');
		$js .= $this->view->render('portal/base.js');
		$js .= $this->view->render('portal/pt-BR.js');
		
		
		$js = str_replace('"images/', '"../images/', $js);
		$js = str_replace("'images/", "'../images/", $js);
		$js = str_replace("'extjs/resources", "'../extjs/resources", $js);
		$js = str_replace('"extjs/resources', '"../extjs/resources', $js);
		
		$js .= $this->view->render('portal/consulta-parque-maquinas.js');
		$js .= $this->view->render('portal/consulta-contadores.js');
		$js .= $this->view->render('portal/consulta-faturas.js');

		if(getenv('APPLICATION_ENV') == 'development') echo($js);
		else echo DMG_JSMin::minify($js);
	}
	
	public function parquelistAction() {
		$auth = Zend_Auth::getInstance();
		$auth->setStorage(new Zend_Auth_Storage_Session('portalAuth'));
		if(!$auth->hasIdentity()) return;
		
		$id_local = $auth->getIdentity()->id_local;
		
		$query = Doctrine_Query::create()->from('ScmMaquina m');
		$query->where('m.id_local = ' . $id_local);
		$query->innerJoin('m.ScmStatusMaquina s')->addWhere('s.fl_alta = 1');
		
		$limit = (int) $this->getRequest()->getParam('limit');
		if ($limit > 0) $query->limit($limit);
		
		$offset = (int) $this->getRequest()->getParam('start');
		if ($offset > 0) $query->offset($offset);
		
		$sort = (string) $this->getRequest()->getParam('sort');
		$dir = (string) $this->getRequest()->getParam('dir');
		
		if ($sort && ($dir == 'ASC' || $dir == 'DESC')) {
			$query->orderby($sort . ' ' . $dir);
		}
		
		$data = array();
		foreach ($query->execute() as $k) {
			$data[] = array(
				'id' => $k->id,
				'nr_serie_imob' => $k->nr_serie_imob,
				'nr_serie_connect' => $k->nr_serie_connect,
				'nr_serie_aux' => $k->nr_serie_aux,
				'nm_jogo' => $k->ScmJogo->nm_jogo,
				'nr_versao_jogo' => $k->nr_versao_jogo,
				'nm_gabinete' => $k->ScmGabinete->nm_gabinete,
				'nm_moeda' => $k->ScmMoeda->nm_moeda,
				'vl_credito' => Khronos_Moeda::format($k->vl_credito),
				'dt_ultima_movimentacao' => $k->dt_ultima_movimentacao,
				'dt_ultimo_faturamento' => $k->dt_ultimo_faturamento,
				'dt_ultima_transformacao' => $k->dt_ultima_transformacao,
				'dt_ultima_regularizacao' => $k->dt_ultima_regularizacao
			);
		}
		echo Zend_Json::encode(array('success' => true,'total' => $query->count(), 'data' => $data));
	}
	
	public function contadoreslistAction() {
		$auth = Zend_Auth::getInstance();
		$auth->setStorage(new Zend_Auth_Storage_Session('portalAuth'));
		if(!$auth->hasIdentity()) return;
		
		$id_local = $auth->getIdentity()->id_local;
		
		$query = Doctrine_Query::create()->from('ScmMaquina m');
		$query->where('m.id_local = ' . $id_local);
		$query->innerJoin('m.ScmStatusMaquina s')->addWhere('s.fl_alta = 1');
		
		$limit = (int) $this->getRequest()->getParam('limit');
		if ($limit > 0) $query->limit($limit);
		
		$offset = (int) $this->getRequest()->getParam('start');
		if ($offset > 0) $query->offset($offset);
		
		$sort = (string) $this->getRequest()->getParam('sort');
		$dir = (string) $this->getRequest()->getParam('dir');
		
		if ($sort && ($dir == 'ASC' || $dir == 'DESC')) {
			$query->orderby($sort . ' ' . $dir);
		}
		
		$query->innerJoin('m.ScmFilial f')->innerJoin('f.ScmEmpresa e')->innerJoin('e.ScmUserEmpresa ue')->addWhere('ue.user_id = ' . $auth->getIdentity()->id);
		$data = array();
		foreach ($query->execute() as $k) {
			$data[] = array(
				'id' => $k->id,
				'nr_serie_imob' => $k->nr_serie_imob,
				'nr_serie_connect' => $k->nr_serie_connect,
				'nr_serie_aux' => $k->nr_serie_aux,
				'nm_jogo' => $k->ScmJogo->nm_jogo,
				'nr_versao_jogo' => $k->nr_versao_jogo,
				'nm_status_maquina' => $k->ScmStatusMaquina->nm_status_maquina,
				'nm_moeda' => $k->ScmMoeda->nm_moeda,
				'vl_credito' => Khronos_Moeda::format($k->vl_credito),
				'id_local' => $k->id_local,
				'id_protocolo' => $k->id_protocolo,
				'dt_ultima_movimentacao' => $k->dt_ultima_movimentacao,
				'dt_ultimo_faturamento' => $k->dt_ultimo_faturamento,
				'dt_ultima_transformacao' => $k->dt_ultima_transformacao,
				'dt_ultima_regularizacao' => $k->dt_ultima_regularizacao			
			);
		}
		echo Zend_Json::encode(array('success' => true,'total' => $query->count(), 'data' => $data));
	}
	
	public function getcontadoresAction() {
		Khronos_Servidor::getContadoresPorMaquinas($this->getRequest()->getParam('id'));
	}
	
	public function faturamentolistAction () {
		$query = Doctrine_Query::create()
			->select('f.id')
			->addSelect('f.dt_fatura')
			->addSelect('SUM(i.vl_empresa) as vl_fatura')
			->from('ScmFaturaDoc f')
			->innerJoin('f.ScmFaturaItem i')
			->groupBy('f.dt_fatura, f.id')
			->orderBy('f.dt_fatura DESC')
			->limit(DMG_Config::get(16));
		
		$data = array();
		foreach ($query->execute() as $k) {
			$data[] = array(
				'id' => $k->id,
				'dt_fatura' => $k->dt_fatura,
				'vl_fatura' => Khronos_Moeda::format($k->vl_fatura)
			);
		}
		echo Zend_Json::encode(array('success' => true,'total' => $query->count(), 'data' => $data));
	}
}