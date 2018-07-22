<?php

class TransformacaoController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function getAction () {
		if (DMG_Acl::canAccess(28)) {
			try {
				$maquina = Doctrine::getTable('ScmMaquina')->find((int) $this->getRequest()->getParam('id'));
				if ($maquina) {
					echo Zend_Json::encode(array('success' => true, 'data' => array(
						'nr_serie_imob' => $maquina->nr_serie_imob,
						'id_jogo_ant' => $maquina->ScmJogo->id,
						'nr_versao_jogo_ant' => $maquina->nr_versao_jogo,
						'vl_credito_ant' => $maquina->vl_credito,
						'id_gabinete_ant' => $maquina->ScmGabinete->id,
						'id_moeda_ant' => $maquina->ScmMoeda->id,
					)));
				}
			} catch (Exception $e) {
				//
			}
		}
	}
	public function locaisAction () {
		if (DMG_Acl::canAccess(28)) {
			$query = Doctrine_Query::create()->from('ScmLocal')->where("nm_local ilike '" . $this->getRequest()->getParam('query') . "%'")->orderBy('nm_local', 'ASC')->execute();
			echo Zend_Json::encode(array('success' => true, 'data' => $query->toArray()));
		}
	}
	public function listAction () {
		if (DMG_Acl::canAccess(28)) {
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
					->addWhere('st.fl_permite_transformacao = ?', 1)
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
						'vl_credito' => $k->vl_credito,
						'nm_status_maquina' => $k->ScmStatusMaquina->nm_status_maquina
					);
				}
				echo Zend_Json::encode(array('success' => true, 'data' => $json));
			}
		}
	}
	public function saveAction () {
		if (DMG_Acl::canAccess(28)) {
			Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
			try {
				$maquina = Doctrine_Query::create()
					->from('ScmMaquina m')
					->innerJoin('m.ScmFilial f')
					->innerJoin('f.ScmEmpresa e')
					->innerJoin('e.ScmUserEmpresa ue')
					->addWhere('ue.user_id = ?', Zend_Auth::getInstance()->getIdentity()->id)
					->addWhere('m.id = ?', (int) $this->getRequest()->getParam('id'))
					->fetchOne();
				if (!$maquina) {
					throw new Exception('transformacao.maquina.invalid');
				}
				$trDoc = new ScmTransformacaoDoc();
				$trDoc->id_origem = 1;
				try {
					$dt_transformacao = new Zend_Date($this->getRequest()->getParam('dt_transformacao'));
					$dt_transformacao->set($this->getRequest()->getParam('hora'), Zend_Date::HOUR);
					$dt_transformacao->set($this->getRequest()->getParam('minuto'), Zend_Date::MINUTE);
				} catch (Exception $f) {
					throw new Exception('transformacao.data.erro');
				}
				$trDoc->dt_transformacao = $dt_transformacao->toString('YYYY-MM-dd HH:mm:ss');
				$trDoc->id_filial = $maquina->id_filial;
				$trDoc->id_local = $maquina->id_local;
				$trDoc->id_parceiro = $maquina->id_parceiro;
				$trDoc->id_usuario = Zend_Auth::getInstance()->getIdentity()->id;
				$trDoc->save();
				$trItem = new ScmTransformacaoItem();
				$trItem->id_transformacao_doc = $trDoc->id;
				$trItem->id_maquina = $maquina->id;
				$trItem->id_jogo = $this->getRequest()->getParam('id_jogo');
				$trItem->nr_versao_jogo = $this->getRequest()->getParam('nr_versao_jogo');
				$trItem->vl_credito = $this->getRequest()->getParam('vl_credito');
				$trItem->id_gabinete = $this->getRequest()->getParam('id_gabinete');
				$trItem->id_moeda = $this->getRequest()->getParam('id_moeda');
				$notEmpty = new Zend_Validate_NotEmpty();
				$Int = new Zend_Validate_Int();
				$Float = new Zend_Validate_Float();
				$cont = explode(",", DMG_Config::get(4));
				for ($i = 1; $i <= 6; $i++) {
					$_nm = 'nr_cont_' . $i;
					if (in_array($i, $cont)) {
						if (!$notEmpty->isValid($this->getRequest()->getParam($_nm))) {
							throw new Exception('parque.transformacao.form.contador.empty');
						}
					}
					if ($notEmpty->isValid($this->getRequest()->getParam($_nm))) {
						if (!$Int->isValid($this->getRequest()->getParam($_nm))) {
							throw new Exception('parque.transformacao.form.contador.string');
						}
						$trItem->$_nm = $this->getRequest()->getParam($_nm);
					}
					if ($trItem->$_nm < 0) {
						throw new Exception('parque.transformacao.form.contador.negativo');
					}
				}
				for ($i = 1; $i <= 6; $i++) {
					$_nm = 'nr_cont_' . $i . '_ant';
					if (in_array($i, $cont)) {
						if (!$notEmpty->isValid($this->getRequest()->getParam($_nm))) {
							throw new Exception('parque.transformacao.form.contador.empty');
						}
					}
					if ($notEmpty->isValid($this->getRequest()->getParam($_nm))) {
						if (!$Int->isValid($this->getRequest()->getParam($_nm))) {
							throw new Exception('parque.transformacao.form.contador.string');
						}
						if ($this->getRequest()->getParam($_nm) != $maquina->{'nr_cont_' . $i}) {
							throw new Exception('parque.transformacao.form.contador.diferente');
						}
						$trItem->$_nm = $this->getRequest()->getParam($_nm);
						if ($trItem->$_nm < 0) {
							throw new Exception('parque.transformacao.form.contador.negativo');
						}
					}
				}
				$mudou = false;
				if ($notEmpty->isValid($this->getRequest()->getParam('id_jogo'))) {
					try {
						$jogo = Doctrine::getTable('ScmJogo')->find($this->getRequest()->getParam('id_jogo'));
					} catch (Exception $e) {
						$jogo = false;
					}
					if (!$jogo) {
						throw new Exception('parque.maquina.form.id_jogo.invalid');
					} else {
						$mudou = true;
						$trItem->id_jogo = $jogo->id;
					}
				} else {
					$trItem->id_jogo = $maquina->id_jogo;
				}
				if ($notEmpty->isValid($this->getRequest()->getParam('id_moeda'))) {
					try {
						$moeda = Doctrine::getTable('ScmMoeda')->find($this->getRequest()->getParam('id_moeda'));
					} catch (Exception $e) {
						$moeda = false;
					}
					if (!$moeda) {
						throw new Exception('parque.maquina.form.id_moeda.invalid');
					} else {
						$mudou = true;
						$trItem->id_moeda = $moeda->id;
					}
				} else {
					$trItem->id_moeda = $maquina->id_moeda;
				}
				if ($notEmpty->isValid($this->getRequest()->getParam('nr_versao_jogo'))) {
					$mudou = true;
					$trItem->nr_versao_jogo = $this->getRequest()->getParam('nr_versao_jogo');
				} else {
					$trItem->nr_versao_jogo = $maquina->nr_versao_jogo;
				}
				$vl_credito = str_replace(",", ".", $this->getRequest()->getParam('vl_credito'));
				if ($notEmpty->isValid($vl_credito)) {
					if (!$Float->isValid($vl_credito)) {
						throw new Exception('parque.maquina.form.vl_credito.invalid');
					} else {
						$mudou = true;
						$trItem->vl_credito = $vl_credito;
					}
				} else {
					$trItem->vl_credito = $maquina->vl_credito;
				}
				if ($notEmpty->isValid($this->getRequest()->getParam('id_gabinete'))) {
					try {
						$gabinete = Doctrine::getTable('ScmGabinete')->find($this->getRequest()->getParam('id_gabinete'));
					} catch (Exception $e) {
						$gabinete = false;
					}
					if (!$gabinete) {
						throw new Exception('parque.maquina.form.id_gabinete.invalid');
					} else {
						$mudou = true;
						$trItem->id_gabinete = $gabinete->id;
					}
				} else {
					$trItem->id_gabinete = $maquina->id_gabinete;
				}
				if (!$mudou) {
					throw new Exception('parque.transformacao.nada_alterado');
				}
				$d1 = new Zend_Date($trDoc->dt_transformacao);
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
					throw new Exception(DMG_Translate::_('transformacao.data.least'));
				}
				if ($d1->get(Zend_Date::TIMESTAMP) > $now->get(Zend_Date::TIMESTAMP)) {
					throw new Exception(DMG_Translate::_('transformacao.data.future'));
				}
				$trItem->save();
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
				echo Zend_Json::encode(array('success' => true));
			} catch (Exception $e) {
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				echo Zend_Json::encode(array('failure' => true, 'message' => DMG_Translate::_($e->getMessage())));
			}
			return;



			$data = $this->getRequest()->getPost();
			$error = array();
			try {
				$trDoc = new ScmTransformacaoDoc();
				$trDoc->id_origem = 1;
				$trDoc->id_filial = 1;
				$trDoc->id_usuario = Zend_Auth::getInstance()->getIdentity()->id;
				$trDoc->id_local = DMG_Config::get(5);
				try {
					$dt_transformacao = new Zend_Date($data['dt_transformacao'], 'pt_BR');
					$dt_transformacao->set($data['hora'], Zend_Date::HOUR);
					$dt_transformacao->set($data['minuto'], Zend_Date::MINUTE);
					$dt_transformacao->set(0, Zend_Date::SECOND);
					$trDoc->dt_transformacao = $dt_transformacao->toString('YYYY-MM-dd HH:mm:ss');
				} catch (Exception $e) {
					$error['new_dt_transformacao'] = DMG_Translate::_('parque.transformacao.form.dt_transformacao.invalid') . $e->getMessage();
				}
				$trDoc->save();
				$error = DMG_Parque::transformarMaquina($data['id'], $data, $trDoc->id);
				if (count($error)) {
					throw new Exception(DMG_Translate::_('parque.transformacao.errofatal'));
				}
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
				echo Zend_Json::encode(array('success' => true));
			} catch (Exception $e) {
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				echo Zend_Json::encode(array('failure' => true, 'message' => $e->getMessage(), 'errors' => $error));
			}
		}
	}
}