<?php

class StatusMaquinaAssignController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function locaisAction () {
		if (DMG_Acl::canAccess(65)) {
			$query = Doctrine_Query::create()->from('ScmLocal')->where("nm_local ilike '" . $this->getRequest()->getParam('query') . "%'")->orderBy('nm_local', 'ASC')->execute();
			echo Zend_Json::encode(array('success' => true, 'data' => $query->toArray()));
		}
	}
	public function statusAction () {
		if (DMG_Acl::canAccess(65)) {
			$query = Doctrine_Query::create()->from('ScmStatusMaquina')->addWhere('fl_sistema = ?', 0)->execute();
			echo Zend_Json::encode(array('success' => true, 'data' => $query->toArray()));
		}
	}
	public function saveAction () {
		if (DMG_Acl::canAccess(65)) {
			Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
			try {
				$maquina = Doctrine::getTable('ScmMaquina')->find((int) $this->getRequest()->getParam('id'));
			
				if (!$maquina) {
					throw new Exception();
				}

				if((int)$maquina->ScmStatusMaquina->id == (int)$this->getRequest()->getParam('id_status_maquina')){
					throw new Exception('status-maquina.error.sameoldstatus');
				}
				
				if(Khronos_Faturamento_Misc::maquinaFatTemp($maquina->id))
					throw new Exception(DMG_Translate::_('faturamento.operacoes.maquina.em.fatura.temp'));

				$hs = new ScmHistoricoStatus();
				try {
					$dt_status = new Zend_Date($this->getRequest()->getParam('dt_status'));
					$dt_status->set($this->getRequest()->getParam('hora'), Zend_Date::HOUR);
					$dt_status->set($this->getRequest()->getParam('minuto'), Zend_Date::MINUTE);
				} catch (Exception $f) {
					throw new Exception('status-maquina-assign.data.erro');
				}
				$hs->dt_status = $dt_status->toString('YYYY-MM-dd HH:mm:ss');
				$status = Doctrine::getTable('ScmStatusMaquina')->find((int) $this->getRequest()->getParam('id_status_maquina'));
				if (!$status) {
					throw new Exception();
				}
				if ($status->fl_sistema == 1) {
					throw new Exception('status-maquina-assign.fl_sistema');
				}
				$d1 = new Zend_Date($hs->dt_status);
				$d2 = new Zend_Date((strlen($maquina->dt_ultima_movimentacao) ? $maquina->dt_ultima_movimentacao : 0));
				$d3 = new Zend_Date((strlen($maquina->dt_ultima_transformacao) ? $maquina->dt_ultima_transformacao : 0));
				$d4 = new Zend_Date((strlen($maquina->dt_ultimo_faturamento) ? $maquina->dt_ultimo_faturamento : 0));
				$d5 = new Zend_Date((strlen($maquina->dt_ultima_regularizacao) ? $maquina->dt_ultima_regularizacao : 0));
				$d6 = new Zend_Date((strlen($maquina->dt_ultimo_status) ? $maquina->dt_ultimo_status : 0));
				$datas = array(
					'd2' => $d2->get(Zend_Date::TIMESTAMP),
					'd3' => $d3->get(Zend_Date::TIMESTAMP),
					'd4' => $d4->get(Zend_Date::TIMESTAMP),
					'd5' => $d5->get(Zend_Date::TIMESTAMP),
					'd6' => $d6->get(Zend_Date::TIMESTAMP),
				);
				arsort($datas);
				$datas = reset(array_keys($datas));
				$datas = $$datas;
				$now = new Zend_Date(time());
				if ($d1->get(Zend_Date::TIMESTAMP) < $datas->get(Zend_Date::TIMESTAMP)) {
					throw new Exception('status-maquina-assign.data.least');
				}
				if ($d1->get(Zend_Date::TIMESTAMP) > $now->get(Zend_Date::TIMESTAMP)) {
					throw new Exception('status-maquina-assign.data.future');
				}
				$hs->id_status = $status->id;
				$hs->id_maquina = $maquina->id;
				$hs->id_filial = $maquina->id_filial;
				$hs->id_local = $maquina->id_local;
				$hs->id_parceiro = $maquina->id_parceiro;
				$hs->id_usuario = Zend_Auth::getInstance()->getIdentity()->id;
				$hs->save();
				echo Zend_Json::encode(array('success' => true));
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
			} catch (Exception $e) {
				echo Zend_Json::encode(array('failure' => true, 'message' => DMG_Translate::_($e->getMessage())));
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
			}
		}
	}
	public function listAction () {
		if (DMG_Acl::canAccess(65)) {
			$local = Doctrine::getTable('ScmLocal')->find((int) $this->getRequest()->getParam('local'));
			if ($local) {
				$query = Doctrine_Query::create()
					->from('ScmMaquina m')
					->innerJoin('m.ScmFilial f')
					->innerJoin('f.ScmEmpresa e')
					->innerJoin('e.ScmUserEmpresa ue')
					->addWhere('m.id_local = ?', $local->id)
					->addWhere('ue.user_id = ?', Zend_Auth::getInstance()->getIdentity()->id)
					//->innerJoin('m.ScmStatusMaquina st')
					//->addWhere('st.fl_permite_regularizacao = ?', 1)
					->execute();		
				
				$json = array();
				foreach ($query as $k) {
					$json[] = array(
						'id' => $k->id,
						'nr_serie_imob' => $k->nr_serie_imob,
						'nr_serie_aux' => $k->nr_serie_aux,
						'nm_jogo' => $k->ScmJogo->nm_jogo,
						'nr_versao_jogo' => $k->nr_versao_jogo,
						'nm_gabinete' => $k->ScmGabinete->nm_gabinete,
						'simbolo_moeda' => $k->ScmMoeda->simbolo_moeda,
						'vl_credito' => Khronos_Moeda::format($k->vl_credito),
						'nm_status_maquina' => $k->ScmStatusMaquina->nm_status_maquina
					);
				}
				echo Zend_Json::encode(array('success' => true, 'data' => $json));
			}
		}
	}
}