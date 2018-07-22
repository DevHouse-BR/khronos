<?php

class ReportsController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function getFilterAction () {
		$lang = DMG_Translate::getLang();
		preg_match_all('/r\_(\d+)/i', $this->getRequest()->getParam('id'), $id);
		$id = $id[1][0];
		$xml = glob(realpath(APPLICATION_PATH . '/../tomcat/Reports/report/xml/') . DIRECTORY_SEPARATOR . '*.xml');
		foreach ($xml as $k) {
			$l = simplexml_load_file($k);
			if (reset($l->id) == $id) {
				$nome = 'r_' . reset($l->id);
				$acl = reset($l->ruleID);
				$titulo = reset($l->traducao->{$lang});
				$descricao = reset($l->descricao->{$lang});
			}
		}
		if (DMG_Acl::canAccess($acl)) {
			echo Zend_Json::encode(array('success' => true, 'name' => $nome, 'titulo' => $titulo, 'descricao' => $descricao, 'data' => Khronos_Reports::getFilterList($id)));
		}
	}
	public function exportAction () {
		preg_match_all('/r\_(\d+)/i', $this->getRequest()->getParam('report'), $id);
		$id = $id[1][0];
		$xml = glob(realpath(APPLICATION_PATH . '/../tomcat/Reports/report/xml/') . DIRECTORY_SEPARATOR . '*.xml');
		$params = array();
		switch ($this->getRequest()->getParam('format')) {
			case 'xls':
				$format = 'xls';
			break;
			case 'pdf':
			default:
				$format = 'pdf';
			break;
		}
		$url = $this->view->baseUrl() . "/download.php?id=" . $id . "&tipo=report&format=" . $format;
		foreach ($xml as $__k) {
			$k = simplexml_load_file($__k);
			if (reset($k->id) == $id) {
				if (!DMG_Acl::canAccess(reset($k->ruleID))) {
					continue;
				}
				foreach ($k->filtros->filtro as $l) {
					if ($l->tipo == 'data') {
						$url .= "&" . reset($l->nome) . "=" . $this->getRequest()->getParam(reset($l->nome));
					}
					else {
						if($this->getRequest()->getParam(reset($l->nome))){
							foreach ($this->getRequest()->getParam(reset($l->nome)) as $m) {
								$url .= "&" . reset($l->nome) . "[]=" . $m;
							}
						}
						else{
							$url .= "&" . reset($l->nome) . "[]=all";
						}
					}
				}
				// 	Previnir CACHE
				$date = gmdate("D, d M Y H:i:s");
				$hash = md5($date);
				
				header('Location: ' . $url . '&_nocache=' . $hash);
				die();
			}
		}
	}
	public function getComboAction () {
		$data = $this->getRequest()->getParam('data');
		preg_match_all('/r\_(\d+)/i', $this->getRequest()->getParam('report'), $id);
		$id = $id[1][0];
		$xml = glob(realpath(APPLICATION_PATH . '/../tomcat/Reports/report/xml/') . DIRECTORY_SEPARATOR . '*.xml');
		$json = array();
		foreach ($xml as $__k) {
			$k = simplexml_load_file($__k);
			if (reset($k->id) == $id) {
				if (!DMG_Acl::canAccess(reset($k->ruleID))) {
					continue;
				}
				switch ($data) {
					case 'grupo':
						$data = Doctrine::getTable('ScmGroup')->findAll();
						foreach ($data as $l) {
							$json[] = array(
								'id' => $l->id,
								'nome' => $l->name,
							);
						}
					break;
					case 'jogo':
						$data = Doctrine::getTable('ScmJogo')->findAll();
						foreach ($data as $l) {
							$json[] = array(
								'id' => $l->id,
								'nome' => $l->nm_jogo,
							);
						}
					break;
					case 'gabinete':
						$data = Doctrine::getTable('ScmGabinete')->findAll();
						foreach ($data as $l) {
							$json[] = array(
								'id' => $l->id,
								'nome' => $l->nm_gabinete,
							);
						}
					break;
					case 'empresa':
						$query = Doctrine_Query::create()->from('ScmEmpresa e')
							->innerJoin('e.ScmUserEmpresa ue')
							->addWhere('ue.user_id = ' . Zend_Auth::getInstance()->getIdentity()->id)->execute();
						foreach ($query as $l) {
							$json[] = array(
								'id' => $l->id,
								'nome' => $l->nm_empresa,
							);
						}
					break;
					case 'filial':
						$query = Doctrine_Query::create()->from('ScmFilial f')
							->innerJoin('f.ScmEmpresa e')
							->innerJoin('e.ScmUserEmpresa ue')
							->addWhere('ue.user_id = ' . Zend_Auth::getInstance()->getIdentity()->id)->execute();
						foreach ($query as $l) {
							$json[] = array(
								'id' => $l->id,
								'nome' => $l->nm_filial,
							);
						}
					break;
					case 'local':
						$data = Doctrine::getTable('ScmLocal')->findAll();
						foreach ($data as $l) {
							$json[] = array(
								'id' => $l->id,
								'nome' => $l->nm_local,
							);
						}
					break;
				}
			}
		}
		echo Zend_Json::encode(array('success' => true, 'data' => $json));
	}
}