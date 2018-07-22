<?php

class RegularizacaoController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function locaisAction () {
		if (DMG_Acl::canAccess(62)) {
			$query = Doctrine_Query::create()->from('ScmLocal')->where("nm_local ilike '" . $this->getRequest()->getParam('query') . "%'")->orderBy('nm_local', 'ASC')->execute();
			echo Zend_Json::encode(array('success' => true, 'data' => $query->toArray()));
		}
	}
	public function listAction () {
		if (DMG_Acl::canAccess(62)) {
			$local = Doctrine::getTable('ScmLocal')->find((int) $this->getRequest()->getParam('local'));
			if ($local) {
				$query = Doctrine_Query::create()
					->from('ScmMaquina m')
					->innerJoin('m.ScmFilial f')
					->innerJoin('f.ScmEmpresa e')
					->innerJoin('e.ScmUserEmpresa ue')
					->addWhere('m.id_local = ?', $local->id)
					->addWhere('ue.user_id = ?', Zend_Auth::getInstance()->getIdentity()->id)
					->innerJoin('m.ScmStatusMaquina st')
					->addWhere('st.fl_permite_regularizacao = ?', 1);

				$filter = $this->getRequest()->getParam('filter');
				if (is_array($filter)) {
					foreach ($filter as $k) {
						$valor = "";
						switch ($k['data']['type']) {
							case 'string':
								if(array_key_exists('value', $k['data']))								
									$query->addWhere($k['field'] . ' ILIKE ?', '%' . $k['data']['value'] . '%');
							break;
						}
					}
				}
				
				$json = array();
				foreach ($query->execute() as $k) {
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
	public function saveFalhaAction () {
		if (DMG_Acl::canAccess(64)) {
			Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
			try {
				$maquina = Doctrine::getTable('ScmMaquina')->find((int) $this->getRequest()->getParam('id'));
				if (!$maquina) {
					throw new Exception('regularizacao.maquina.invalid');
				}
				if ($maquina->ScmStatusMaquina->fl_permite_regularizacao == 0) {
					throw new Exception('regularizacao.status.nao-permite');
				}
				if(Khronos_Faturamento_Misc::maquinaFatTemp($maquina->id))
					throw new Exception(DMG_Translate::_('faturamento.operacoes.maquina.em.fatura.temp'));
				$rgDoc = new ScmRegularizacaoDoc();
				try {
					$dt_regularizacao = new Zend_Date($this->getRequest()->getParam('dt_regularizacao'));
					$dt_regularizacao->set($this->getRequest()->getParam('hora'), Zend_Date::HOUR);
					$dt_regularizacao->set($this->getRequest()->getParam('minuto'), Zend_Date::MINUTE);
				} catch (Exception $f) {
					throw new Exception('regularizacao.data.erro');
				}
				$rgDoc->dt_regularizacao = $dt_regularizacao->toString('YYYY-MM-dd HH:mm:ss');
				$rgDoc->ds_motivo = $this->getRequest()->getParam('motivo');
				$rgDoc->tp_regularizacao = 'F';
				$rgDoc->id_filial = $maquina->id_filial;
				$rgDoc->id_local = $maquina->id_local;
				$rgDoc->id_parceiro = $maquina->id_parceiro;
				$rgDoc->id_usuario = Zend_Auth::getInstance()->getIdentity()->id;
				$rgDoc->save();
				$rgItem = new ScmRegularizacaoItem();
				$rgItem->id_regularizacao_doc = $rgDoc->id;
				$rgItem->id_maquina = $maquina->id;
				$notEmpty = new Zend_Validate_NotEmpty();
				$Int = new Zend_Validate_Int();
				$Float = new Zend_Validate_Float();
				$cont = explode(",", DMG_Config::get(4));
				$igual = true;
				for ($i = 1; $i <= 6; $i++) {
					$_nm = 'nr_cont_' . $i;
					if (in_array($i, $cont)) {
						if (!$notEmpty->isValid($this->getRequest()->getParam($_nm))) {
							throw new Exception('regularizacao.contador.empty');
						}
					}
					if ($notEmpty->isValid($this->getRequest()->getParam($_nm))) {
						if (!$Int->isValid($this->getRequest()->getParam($_nm))) {
							throw new Exception('regularizacao.contador.string');
						}
						$rgItem->$_nm = $this->getRequest()->getParam($_nm);
					}
					if ($rgItem->$_nm < 0) {
						throw new Exception('regularizacao.contador.negativo');
					}
					if ($rgItem->$_nm != $maquina->$_nm) {
						$igual = false;
					}
				}
				if ($igual) {
					throw new Exception('regularizacao.contador.nao-necessario');
				}
				if (!$notEmpty->isValid($rgDoc->ds_motivo)) {
					throw new Exception('regularizacao.motivo.erro');
				}
				$d1 = new Zend_Date($rgDoc->dt_regularizacao);
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
					throw new Exception('regularizacao.data.least');
				}
				if ($d1->get(Zend_Date::TIMESTAMP) > $now->get(Zend_Date::TIMESTAMP)) {
					throw new Exception('regularizacao.data.future');
				}
				$rgItem->save();
				echo Zend_Json::encode(array('success' => true));
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
			} catch (Exception $e) {
				echo Zend_Json::encode(array('failure' => true, 'message' => DMG_Translate::_($e->getMessage())));
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
			}
		}
	}
	public function saveControladaAction () {
		if (DMG_Acl::canAccess(63)) {
			Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
			try {
				$maquina = Doctrine::getTable('ScmMaquina')->find((int) $this->getRequest()->getParam('id'));
				if (!$maquina) {
					throw new Exception('regularizacao.maquina.invalid');
				}
				if ($maquina->ScmStatusMaquina->fl_permite_regularizacao == 0) {
					throw new Exception('regularizacao.status.nao-permite');
				}
				if(Khronos_Faturamento_Misc::maquinaFatTemp($maquina->id))
					throw new Exception(DMG_Translate::_('faturamento.operacoes.maquina.em.fatura.temp'));
					
				$rgDoc = new ScmRegularizacaoDoc();
				try {
					$dt_regularizacao = new Zend_Date($this->getRequest()->getParam('dt_regularizacao'));
					$dt_regularizacao->set($this->getRequest()->getParam('hora'), Zend_Date::HOUR);
					$dt_regularizacao->set($this->getRequest()->getParam('minuto'), Zend_Date::MINUTE);
				} catch (Exception $f) {
					throw new Exception('regularizacao.data.erro');
				}
				$rgDoc->dt_regularizacao = $dt_regularizacao->toString('YYYY-MM-dd HH:mm:ss');
				$rgDoc->ds_motivo = $this->getRequest()->getParam('motivo');
				$rgDoc->tp_regularizacao = 'C';
				$rgDoc->id_filial = $maquina->id_filial;
				$rgDoc->id_local = $maquina->id_local;
				$rgDoc->id_parceiro = $maquina->id_parceiro;
				$rgDoc->id_usuario = $maquina->id_usuario;
				$rgDoc->save();
				$rgItem = new ScmRegularizacaoItem();
				$rgItem->id_regularizacao_doc = $rgDoc->id;
				$rgItem->id_maquina = $maquina->id;
				$notEmpty = new Zend_Validate_NotEmpty();
				$Int = new Zend_Validate_Int();
				$Float = new Zend_Validate_Float();
				$cont = explode(",", DMG_Config::get(4));
				$igual = true;
				for ($i = 1; $i <= 6; $i++) {
					$_nm = 'nr_cont_' . $i;
					if (in_array($i, $cont)) {
						if (!$notEmpty->isValid($this->getRequest()->getParam($_nm))) {
							throw new Exception('regularizacao.contador.empty');
						}
					}
					if ($notEmpty->isValid($this->getRequest()->getParam($_nm))) {
						if (!$Int->isValid($this->getRequest()->getParam($_nm))) {
							throw new Exception('regularizacao.contador.string');
						}
						$rgItem->$_nm = $this->getRequest()->getParam($_nm);
					}
					if ($rgItem->$_nm < 0) {
						throw new Exception('regularizacao.contador.negativo');
					}
					if ($rgItem->$_nm != $maquina->$_nm) {
						$igual = false;
					}
				}
				if ($igual) {
					throw new Exception('regularizacao.contador.nao-necessario');
				}
				for ($i = 1; $i <= 6; $i++) {
					$_nm = 'nr_cont_' . $i . '_ant';
					if (in_array($i, $cont)) {
						if (!$notEmpty->isValid($this->getRequest()->getParam($_nm))) {
							throw new Exception('regularizacao.contador.empty');
						}
					}
					if ($notEmpty->isValid($this->getRequest()->getParam($_nm))) {
						if (!$Int->isValid($this->getRequest()->getParam($_nm))) {
							throw new Exception('regularizacao.contador.string');
						}
						if ($this->getRequest()->getParam($_nm) != $maquina->{'nr_cont_' . $i}) {
							throw new Exception('regularizacao.contador.diferente');
						}
						$rgItem->$_nm = $this->getRequest()->getParam($_nm);
						if ($rgItem->$_nm < 0) {
							throw new Exception('regularizacao.contador.negativo');
						}
					}
				}
				if (!$notEmpty->isValid($rgDoc->ds_motivo)) {
					throw new Exception('regularizacao.motivo.erro');
				}
				$d1 = new Zend_Date($rgDoc->dt_regularizacao);
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
					throw new Exception('regularizacao.data.least');
				}
				if ($d1->get(Zend_Date::TIMESTAMP) > $now->get(Zend_Date::TIMESTAMP)) {
					throw new Exception('regularizacao.data.future');
				}
				$rgItem->save();
				echo Zend_Json::encode(array('success' => true));
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
			} catch (Exception $e) {
				echo Zend_Json::encode(array('failure' => true, 'message' => DMG_Translate::_($e->getMessage())));
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
			}
		}
	}
}