<?php

class MovimentacaoController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function filiaisAction () {
		if (DMG_Acl::canAccess(58) || DMG_Acl::canAccess(61) || DMG_Acl::canAccess(87)) {
			$query = Doctrine_Query::create()->from('ScmFilial f')->innerJoin('f.ScmEmpresa e')->innerJoin('e.ScmUserEmpresa ue')->addWhere('ue.user_id = ?', Zend_Auth::getInstance()->getIdentity()->id);
			$query->orderBy('e.nm_empresa ASC, f.nm_filial ASC');
			$json = array();
			foreach ($query->execute() as $k) {
				$json[] = array(
					'id' => $k->id,
					'nome' => $k->ScmEmpresa->nm_empresa . ' - ' . $k->nm_filial
				);
			}
			echo Zend_Json::encode(array('success' => true, 'data' => $json));
		}
	}
	public function locaisAction () {
		if (DMG_Acl::canAccess(59)) {
			$query = Doctrine_Query::create()->from('ScmLocal')->where("nm_local ilike '" . $this->getRequest()->getParam('query') . "%'")->orderBy('nm_local', 'ASC')->execute();
			echo Zend_Json::encode(array('success' => true, 'data' => $query->toArray()));
		}
	}
	public function listaEntradaAction () {
		if (DMG_Acl::canAccess(58)) {
			$filial = (int) $this->getRequest()->getParam('filial');
			$acl = Doctrine_Query::create()->from('ScmFilial f')->innerJoin('f.ScmEmpresa e')->innerJoin('e.ScmUserEmpresa ue')->addWhere('ue.user_id = ?', Zend_Auth::getInstance()->getIdentity()->id)->addWhere('f.id = ?', $filial);
			if ($acl->count()) {
				$query = Doctrine_Query::create()->from('ScmMaquina m')->addWhere('m.id_status = ?', 2)->addWhere('m.id_filial = ?', $filial);
				
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
						'id_status' => $k->ScmStatusMaquina->nm_status_maquina,
						'nr_cont_1' => $k->nr_cont_1,
						'nr_cont_2' => $k->nr_cont_2,
						'nr_cont_3' => $k->nr_cont_3,
						'nr_cont_4' => $k->nr_cont_4,
						'nr_cont_5' => $k->nr_cont_5,
						'nr_cont_6' => $k->nr_cont_6
					);
				}
				echo Zend_Json::encode(array('success' => true, 'data' => $json));
			}
		}
	}
	public function listaSaidaAction () {
		if (DMG_Acl::canAccess(59)) {
			$local = Doctrine::getTable('ScmLocal')->find((int) $this->getRequest()->getParam('local'));
			if ($local) {
				$query = Doctrine_Query::create()->from('ScmMaquina m')->innerJoin('m.ScmFilial f')->innerJoin('f.ScmEmpresa e')->innerJoin('e.ScmUserEmpresa ue')->addWhere('m.id_local = ?', $local->id)->addWhere('ue.user_id = ?', Zend_Auth::getInstance()->getIdentity()->id)->innerJoin('m.ScmStatusMaquina st')->addWhere('st.fl_alta = ?', 1);
				DMG_Crud::paginate($this, $query, $this->getRequest()->getParam('limit'), $this->getRequest()->getParam('start'), $this->getRequest()->getParam('sort'), $this->getRequest()->getParam('dir'));
				
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
						'id_status' => $k->ScmStatusMaquina->nm_status_maquina,
						'nr_cont_1' => $k->nr_cont_1,
						'nr_cont_2' => $k->nr_cont_2,
						'nr_cont_3' => $k->nr_cont_3,
						'nr_cont_4' => $k->nr_cont_4,
						'nr_cont_5' => $k->nr_cont_5,
						'nr_cont_6' => $k->nr_cont_6
					);
				}
				echo Zend_Json::encode(array('success' => true, 'total' => $query->count(), 'data' => $json));
			}
		}
	}
	public function contadoresAction () {
		if (DMG_Acl::canAccess(58) || DMG_Acl::canAccess(59)) {
			$id = (int) $this->getRequest()->getParam('id');
			$local = (int) $this->getRequest()->getParam('local');
			$status = 1;
			$data = array();
			try {
				$localObj = Doctrine::getTable('ScmLocal')->find($local);
				$data = Khronos_Servidor::getInfoMaquina($id, $local);
				if (!$data) {
					throw new Exception(DMG_Translate::_('movimentacao.contadores.nao-encontrado'));
				}
				if ($data['jogando']) {
					throw new Exception(DMG_Translate::_('movimentacao.contadores.jogando'));
				}
				if ($localObj) {
					$data['percent_local'] = $localObj->percent_local;	
				}
				echo Zend_Json::encode(array('success' => true, 'data' => $data));
			} catch (Exception $e) {
				echo Zend_Json::encode(array('failure' => true, 'message' => $e->getMessage()));
			}
		}
	}
	public function getMaquinaAction () {
		if (DMG_Acl::canAccess(58)) {
			$maquina = Doctrine::getTable('ScmMaquina')->find($this->getRequest()->getParam('id'));
			if ($maquina) {
				echo Zend_Json::encode(array('success' => true, 'data' => array(
					'id_filial' => $maquina->id_filial,
					'id_parceiro' => $maquina->id_parceiro,
				)));
			}
		}
	}
	public function entradaSaveAction () {
		if (DMG_Acl::canAccess(58)) {
			Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
			try {
				$maquina = Doctrine::getTable('ScmMaquina')->find((int) $this->getRequest()->getParam('id'));
				if (!$maquina) {
					throw new Exception('movimentacao.maquina-inexistente');
				}
				if ($maquina->ScmStatusMaquina->fl_permite_movimentacao == 0 || $maquina->id_status != 2) {
					throw new Exception(DMG_Translate::_('movimentacao.status.nao-permite'));
				}
				if (DMG_Acl::canAccess(61)) {
					$fid = (int) $this->getRequest()->getParam('id_filial');
				} else {
					$fid = $maquina->id_filial;
				}
				$filial = Doctrine::getTable('ScmFilial')->find($fid);
				if (!$filial) {
					throw new Exception('movimentacao.filial-inexistente');
				}
				if (!DMG_Acl::canAccess(60) && $this->getRequest()->getParam('cont_manual') == 'S') {
					throw new Exception('movimentacao.cont_manual.erro');
				}
				$mvDoc = new ScmMovimentacaoDoc();
				try {
					$dt_movimentacao = new Zend_Date($this->getRequest()->getParam('dt_movimentacao'));
					$dt_movimentacao->set($this->getRequest()->getParam('hora'), Zend_Date::HOUR);
					$dt_movimentacao->set($this->getRequest()->getParam('minuto'), Zend_Date::MINUTE);
				} catch (Exception $f) {
					throw new Exception('movimentacao-entrada.data.erro');
				}
				$mvDoc->dt_movimentacao = $dt_movimentacao->toString('YYYY-MM-dd HH:mm:ss');
				$mvDoc->id_filial = $filial->id;
				$parceiro = Doctrine::getTable('ScmParceiro')->find((int) $this->getRequest()->getParam('id_parceiro'));
				if ($parceiro) {
					$mvDoc->id_parceiro = $parceiro->id;
				} else {
					$mvDoc->id_parceiro = null;
				}
				$mvDoc->id_local = (int) $this->getRequest()->getParam('id_local');
				$mvDoc->id_origem = 1;
				$mvDoc->tp_movimento = 'E';
				$mvDoc->save();
				$qry = Doctrine_Query::create()->from('ScmMaquina')->addWhere('id_local = ?', $mvDoc->id_local)
					->addWhere('id <> ?', $maquina->id)
					->addWhere('nr_serie_connect = ?', $maquina->nr_serie_connect);
				if ($qry->count()) {
					throw new Exception('movimentacao-entrada.nr_serie_connect.repeaterror');
				}
				$mvItem = new ScmMovimentacaoItem();
				$mvItem->id_movimentacao_doc = $mvDoc->id;
				$mvItem->id_maquina = $maquina->id;
				
				$percent_local = $this->getRequest()->getParam('percent_local');
				if(((int)$percent_local < 0) || ((int)$percent_local > 100)){
					throw new Exception('parque.maquina.erro_percent_inv');
				}
				$mvItem->percent_local = (int) $percent_local;
				
				$mvItem->fl_cont_manual = ($this->getRequest()->getParam('cont_manual') == 'S' ? true : false);
				$error = array();
				$notEmpty = new Zend_Validate_NotEmpty();
				$Int = new Zend_Validate_Int();
				$cont = explode(",", DMG_Config::get(4));
				for ($i = 1; $i <= 6; $i++) {
					$_nm = 'nr_cont_' . $i;
					try {
						if (in_array($i, $cont)) {
							if (!$notEmpty->isValid($this->getRequest()->getParam($_nm))) {
								throw new Exception('movimentacao-saida.contador_vazio');
							}
						}
						if ($notEmpty->isValid($this->getRequest()->getParam($_nm))) {
							if (!$Int->isValid($this->getRequest()->getParam($_nm))) {
								throw new Exception('movimentacao-saida.contador_string');
							}
							$mvItem->$_nm = (int) $this->getRequest()->getParam($_nm);
						}
						if ($mvItem->$_nm < $maquina->$_nm) {
							throw new Exception('movimentacao-saida.contador_menor');
						}
					} catch (Exception $e) {
						$error[$_nm] = $e->getMessage();
					}
				}
				if (count($error)) {
					throw new Exception(reset($error));
				}
				$d1 = new Zend_Date($mvDoc->dt_movimentacao);
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
					throw new Exception(DMG_Translate::_('movimentacao-saida.data.least'));
				}
				if ($d1->get(Zend_Date::TIMESTAMP) > $now->get(Zend_Date::TIMESTAMP)) {
					throw new Exception(DMG_Translate::_('movimentacao-saida.data.future'));
				}
				$mvItem->nr_dif_cont_1 = $mvItem->nr_cont_1 - $maquina->nr_cont_1;
				$mvItem->nr_dif_cont_2 = $mvItem->nr_cont_2 - $maquina->nr_cont_2;
				$mvItem->nr_dif_cont_3 = $mvItem->nr_cont_3 - $maquina->nr_cont_3;
				$mvItem->nr_dif_cont_4 = $mvItem->nr_cont_4 - $maquina->nr_cont_4;
				$mvItem->nr_dif_cont_5 = $mvItem->nr_cont_5 - $maquina->nr_cont_5;
				$mvItem->nr_dif_cont_6 = $mvItem->nr_cont_6 - $maquina->nr_cont_6;
				if (($mvItem->nr_dif_cont_1 + $mvItem->nr_dif_cont_2 + $mvItem->nr_dif_cont_3 + $mvItem->nr_dif_cont_4 + $mvItem->nr_dif_cont_5 + $mvItem->nr_dif_cont_6) > 0) {
					$mvItem->fl_diferenca = true;
				}
				$mvItem->save();
				$hsMaq = new ScmHistoricoStatus();
				$hsMaq->dt_status = $mvDoc->dt_movimentacao;
				$hsMaq->id_status = 3;
				$hsMaq->id_maquina = $maquina->id;
				$hsMaq->id_filial = $mvDoc->id_filial;
				$hsMaq->id_local = $mvDoc->id_local;
				$hsMaq->id_parceiro = $mvDoc->id_parceiro;
				$hsMaq->id_usuario = $mvDoc->id_usuario;
				$hsMaq->save();
				$maquina->id_local = $mvDoc->id_local;
				$maquina->save();
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
				echo Zend_Json::encode(array('success' => true));
			} catch (Exception $e) {
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				echo Zend_Json::encode(array('failure' => true, 'message' => DMG_Translate::_($e->getMessage())));
			}
		}
	}
	public function consultaEntradaAction () {
		if (DMG_Acl::canAccess(87)) {
			$query = Doctrine_Query::create()
				->from('ScmMovimentacaoItem mi')
				->innerJoin('mi.ScmMovimentacaoDoc md')
				->addWhere('md.tp_movimento = ?', 'E')
				->addWhere('mi.fl_diferenca = ?', true)
				->addWhere('md.id_filial = ?', (int) $this->getRequest()->getParam('id_filial'))
				->orderBy('md.dt_movimentacao DESC')
			;
			DMG_Crud::paginate($this, $query, $this->getRequest()->getParam('limit'), $this->getRequest()->getParam('start'), $this->getRequest()->getParam('sort'), $this->getRequest()->getParam('dir'));
			$data = array();
			foreach ($query->execute() as $k) {
				$data[] = array(
					'id' => $k->id,
					'nr_serie_imob' => $k->ScmMaquina->nr_serie_imob,
					'dt_movimentacao' => $k->ScmMovimentacaoDoc->dt_movimentacao,
					'nm_filial_completo' => $k->ScmMovimentacaoDoc->ScmFilial->ScmEmpresa->nm_empresa . ' - ' . $k->ScmMovimentacaoDoc->ScmFilial->nm_filial,
					'nm_local' => $k->ScmMovimentacaoDoc->ScmLocal->nm_local,
					'nm_usuario' => $k->ScmMovimentacaoDoc->ScmUser->name,
					'fl_cont_manual' => $k->fl_cont_manual,
					'nr_dif_cont_1' => $k->nr_dif_cont_1,
					'nr_dif_cont_2' => $k->nr_dif_cont_2,
					'nr_dif_cont_3' => $k->nr_dif_cont_3,
					'nr_dif_cont_4' => $k->nr_dif_cont_4,
					'nr_dif_cont_5' => $k->nr_dif_cont_5,
					'nr_dif_cont_6' => $k->nr_dif_cont_6
				);
			}
			echo Zend_Json::encode(array('success' => true, 'data' => $data, 'total' => $query->count()));
		}
	}
	public function saidaSaveAction () {
		if (DMG_Acl::canAccess(59)) {
			if (!DMG_Acl::canAccess(60) && $this->getRequest()->getParam('cont_manual') == 'S') {
				return;
			}
			Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
			try {
				$maquina = Doctrine::getTable('ScmMaquina')->find($this->getRequest()->getParam('id'));
				if (!$maquina) {
					throw new Exception();
				}
				if ($maquina->ScmStatusMaquina->fl_permite_movimentacao == 0 || $maquina->id_status == 2) {
					throw new Exception(DMG_Translate::_('movimentacao.status.nao-permite'));
				}
				
				if(Khronos_Faturamento_Misc::maquinaFatTemp($maquina->id))
					throw new Exception(DMG_Translate::_('faturamento.operacoes.maquina.em.fatura.temp'));
				
				$mvDoc = new ScmMovimentacaoDoc();
				$dt_movimentacao = new Zend_Date($this->getRequest()->getParam('dt_movimentacao'));
				$dt_movimentacao->set($this->getRequest()->getParam('hora'), Zend_Date::HOUR);
				$dt_movimentacao->set($this->getRequest()->getParam('minuto'), Zend_Date::MINUTE);
				$mvDoc->dt_movimentacao = $dt_movimentacao->toString('YYYY-MM-dd HH:mm:ss');
				$mvDoc->id_filial = $maquina->id_filial;
				$mvDoc->id_parceiro = $maquina->id_parceiro;
				$mvDoc->id_local = $maquina->id_local;
				$mvDoc->id_origem = 1;
				$mvDoc->tp_movimento = 'S';
				$mvDoc->save();
				$mvItem = new ScmMovimentacaoItem();
				$mvItem->id_movimentacao_doc = $mvDoc->id;
				$mvItem->id_maquina = $maquina->id;
				$mvItem->fl_cont_manual = ($this->getRequest()->getParam('cont_manual') == 'S' ? true : false);
				$mvItem->nr_cont_1 = $this->getRequest()->getParam('nr_cont_1');
				$mvItem->nr_cont_2 = $this->getRequest()->getParam('nr_cont_2');
				$mvItem->nr_cont_3 = $this->getRequest()->getParam('nr_cont_3');
				$mvItem->nr_cont_4 = $this->getRequest()->getParam('nr_cont_4');
				$mvItem->nr_cont_5 = $this->getRequest()->getParam('nr_cont_5');
				$mvItem->nr_cont_6 = $this->getRequest()->getParam('nr_cont_6');
				$notEmpty = new Zend_Validate_NotEmpty();
				$Int = new Zend_Validate_Int();
				$Float = new Zend_Validate_Float();
				$cont = explode(",", DMG_Config::get(4));
				for ($i = 1; $i <= 6; $i++) {
					$_nm = 'nr_cont_' . $i;
					if (in_array($i, $cont)) {
						if (!$notEmpty->isValid($mvItem->$_nm)) {
							throw new Exception(DMG_Translate::_('movimentacao-saida.contador_vazio'));
						}
					}
					if ($notEmpty->isValid($mvItem->$_nm)) {
						if (!$Int->isValid($mvItem->$_nm)) {
							throw new Exception(DMG_Translate::_('movimentacao-saida.contador_string'));
						}
						if ($mvItem->$_nm != $maquina->$_nm) {
							throw new Exception(DMG_Translate::_('movimentacao-saida.contador_diferente'));
						}
					} else {
						$mvItem->$_nm = null;
					}
				}
				$d1 = new Zend_Date($mvDoc->dt_movimentacao);
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
					throw new Exception(DMG_Translate::_('movimentacao-saida.data.least'));
				}
				if ($d1->get(Zend_Date::TIMESTAMP) > $now->get(Zend_Date::TIMESTAMP)) {
					throw new Exception(DMG_Translate::_('movimentacao-saida.data.future'));
				}
				$mvItem->save();
				$hsMaq = new ScmHistoricoStatus();
				$hsMaq->dt_status = $mvDoc->dt_movimentacao;
				$hsMaq->id_status = 2;
				$hsMaq->id_maquina = $maquina->id;
				$hsMaq->id_filial = $mvDoc->id_filial;
				$hsMaq->id_local = $mvDoc->id_local;
				$hsMaq->id_parceiro = $mvDoc->id_parceiro;
				$hsMaq->id_usuario = $mvDoc->id_usuario;
				$hsMaq->save();
				$maquina->id_local = null;
				$maquina->save();
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
				echo Zend_Json::encode(array('success' => true));
			} catch (Exception $e) {
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				echo Zend_Json::encode(array('failure' => true, 'message' => $e->getMessage()));
			}
		}
	}
	public function listAction () {
		$filial = Doctrine::getTable('ScmFilial')->find((int) $this->getRequest()->getParam('filial'));
		if ($filial) {
			foreach ($filial->ScmEmpresa->ScmUserEmpresa as $k) {
				if (Zend_Auth::getInstance()->getIdentity()->id == $k->user_id) {
					$query = Doctrine_Query::create()->from('ScmMaquina m')->addWhere('m.id_status = ?', 2)->addWhere('m.id_filial = ?', $filial->id)->execute();
					$json = array();
					foreach ($query as $l) {
						$json[] = array(
							'id' => $l->id
						);
					}
					echo Zend_Json::encode(array('success' => true, 'data' => $json));
					return;
				}
			}
		}
	}
}