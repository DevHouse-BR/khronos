<?php

class Faturamento2Controller extends Zend_Controller_Action {
	public function init () {
		$this->getHelper('ViewRenderer')->setNoRender(true);
	}
	public function maquinasAction () {
		if (DMG_Acl::canAccess(89)) {
			try {
				$msg = null;
				$local = Doctrine::getTable('ScmLocal')->find((int) $this->_getParam('id_local'));
				$filial = Doctrine::getTable('ScmFilial')->find((int) $this->_getParam('id_filial'));
				$moeda = Doctrine::getTable('ScmMoeda')->find((int) $this->_getParam('id_moeda'));
				$parceiro = Doctrine::getTable('ScmMoeda')->find((int) $this->_getParam('id_parceiro'));
				if (!$local) {
					throw new Exception(DMG_Translate::_('faturamento.local.invalid'));
				}
				if (!$filial) {
					throw new Exception(DMG_Translate::_('faturamento.filial.invalid'));
				}
				if (!$moeda) {
					throw new Exception(DMG_Translate::_('faturamento.moeda.invalid'));
				}
				$fDoc = Doctrine_Query::create()
					->from('ScmFaturaDoc fd')
					//->innerJoin('fd.ScmFaturaItem fi')
					->addWhere('fd.id_local = ?', $local->id)
					->addWhere('fd.id_filial = ?', $filial->id)
					->addWhere('fd.id_moeda = ?', $moeda->id)
					->addWhere('fd.id_fatura_doc_status = ?', 1)
				;
				if ($parceiro) {
					$fDoc->addWhere('fd.id_parceiro = ?', $parceiro->id);
				}
				$fDoc = $fDoc->fetchOne();
				if ($fDoc) {
					if ($fDoc->id_usuario != Zend_Auth::getInstance()->getIdentity()->id) {
						throw new Exception(DMG_Translate::_('faturamento.usuario_bloqueado'));
					} else {
						$msg = DMG_Translate::_('faturamento.ja_existe');
					}
				}
				try {
					$dt_fatura = new Zend_Date($this->getRequest()->getParam('dt_fatura'));
					$dt_fatura->set($this->getRequest()->getParam('hora'), Zend_Date::HOUR);
					$dt_fatura->set($this->getRequest()->getParam('minuto'), Zend_Date::MINUTE);
				} catch (Exception $f) {
					throw new Exception(DMG_Translate::_('faturamento.data.invalida'));
				}
				$dbhandler = Doctrine_Manager::getInstance()->getCurrentConnection()->getDbh();
				$query = "SELECT
					md.tp_movimento,
					md.dt_movimentacao,
					md.id_local,
					md.id_filial,
					greatest(m.dt_ultima_movimentacao, m.dt_ultima_transformacao, m.dt_ultima_regularizacao, m.dt_ultimo_faturamento) AS maior_data,
					CASE WHEN greatest(m.dt_ultima_movimentacao, m.dt_ultima_transformacao, m.dt_ultima_regularizacao, m.dt_ultimo_faturamento) >= '" . $dt_fatura->toString('YYYY-MM-dd HH:mm:ss') . "' THEN 0 ELSE 1 END AS canmove,
					CASE WHEN md.id_parceiro is null THEN 0 else md.id_parceiro END as id_parceiro,
					CASE (
						SELECT 
						scm_fatura_doc.id_fatura_doc_status
						FROM 
						scm_fatura_doc,
						scm_fatura_item,
						scm_maquina
						WHERE scm_fatura_item.id_fatura_doc = scm_fatura_doc.id
						AND scm_fatura_item.id_maquina = scm_maquina.id
						AND scm_maquina.id = m.id
						AND scm_fatura_doc.id_fatura_doc_status = 1
						GROUP BY scm_fatura_doc.id, scm_fatura_doc.id_fatura_doc_status
					) WHEN 1 THEN 1 ELSE 0 END AS em_temporaria,
					mi.id_maquina,
					m.nr_serie_imob,
					m.nr_cont_1,
					m.nr_cont_2,
					m.nr_cont_3,
					m.nr_cont_4,
					m.nr_cont_5,
					m.nr_cont_6,
					j.nm_jogo,
					m.percent_local,
					m.vl_credito,
					mo.simbolo_moeda
					FROM
					scm_movimentacao_doc md,
					scm_movimentacao_item mi,
					scm_maquina m,
					scm_moeda mo,
					scm_jogo j
					WHERE md.id = mi.id_movimentacao_doc
					AND mi.id_maquina = m.id
					AND m.id_jogo = j.id
					AND m.id_moeda = mo.id
					AND md.dt_movimentacao = (
						SELECT max(md2.dt_movimentacao)
						FROM scm_movimentacao_doc md2, scm_movimentacao_item mi2
						WHERE md2.id = mi2.id_movimentacao_doc
						AND md2.id_local = md.id_local
						AND md2.id_filial = md.id_filial
						AND CASE WHEN md2.id_parceiro is null THEN 0 else md2.id_parceiro END = CASE WHEN md.id_parceiro is null THEN 0 else md.id_parceiro END
						AND mi2.id_maquina = mi.id_maquina
						AND md2.dt_movimentacao <=  '" . $dt_fatura->toString('YYYY-MM-dd HH:mm:ss') . "'
					)
					AND md.tp_movimento = 'E'
				";
				$query .= " AND md.id_local = " . $local->id;
				$query .= " AND md.id_filial = " . $filial->id; 
				$query .= " AND m.id_moeda = ". $moeda->id;
				if ($parceiro) {
					$query .= " AND md.id_parceiro = " . $parceiro->id;
				}
				if (strlen($this->_getParam('nr_serie_imob'))) {
					$query .= " AND m.nr_serie_imob ILIKE '%" . $this->_getParam('nr_serie_imob') . "%'";
				}
				$query .= " ORDER BY m.nr_serie_imob";
				$result = $dbhandler->query($query);
				$data = array();
				$i = 0;
				foreach ($result as $k) {
					$data[] = array(
						'id' => $k['id_maquina'],
						'nr_serie' => $k['nr_serie_imob'],
						'nr_cont_1' => $k['nr_cont_1'],
						'nr_cont_2' => $k['nr_cont_2'],
						'nr_cont_3' => $k['nr_cont_3'],
						'nr_cont_4' => $k['nr_cont_4'],
						'nr_cont_5' => $k['nr_cont_5'],
						'nr_cont_6' => $k['nr_cont_6'],
						'nm_jogo' => $k['nm_jogo'],
						'percent_local' => $k['percent_local'],
						'vl_credito' => $k['simbolo_moeda'] . ' ' . $k['vl_credito'],
						'dt_ultimo_contador' => $k['maior_data'],
						'canmove' => (int) $k['canmove'],
						'em_temporaria' => (int) $k['em_temporaria']
					);
				}
				echo Zend_Json::encode(array('success' => true, 'data' => $data, 'message' => $msg, 'id' => ($fDoc ? $fDoc->id : null)));
			} catch (Exception $e) {
				echo Zend_Json::encode(array('success' => false, 'message' => $e->getMessage()));
			}
		}
	}
	public function saveOfflineAction () {
		if (DMG_Acl::canAccess(89)) {
			try {
				$errors = array();
				Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
				$local = Doctrine::getTable('ScmLocal')->find((int) $this->getRequest()->getParam('id_local'));
				$filial = Doctrine::getTable('ScmFilial')->find((int) $this->getRequest()->getParam('id_filial'));
				$parceiro = Doctrine::getTable('ScmParceiro')->find((int) $this->getRequest()->getParam('id_parceiro'));
				$moeda = Doctrine::getTable('ScmMoeda')->find((int) $this->getRequest()->getParam('id_moeda'));
				if (!$local) {
					throw new Exception(DMG_Translate::_('faturamento.local.invalid'));
				}
				if (!$filial) {
					throw new Exception(DMG_Translate::_('faturamento.filial.invalid'));
				}
				if (!$moeda) {
					throw new Exception(DMG_Translate::_('faturamento.moeda.invalid'));
				}
				
				
				$fDoc = Doctrine::getTable('ScmFaturaDoc')->find((int) $this->_getParam('id'));
				if (!$fDoc) {
					throw new Exception();
				}
				
				//Verifica se a fatura já foi confirmada
				if($this->checkConfirmada($fDoc->id))
					throw new Exception(DMG_Translate::_('faturamento.erro.fatura.confirmada'));
				
				$dt_fatura = new Zend_Date($fDoc->dt_fatura);
								
				$maquina = Doctrine_Query::create()
					// A coluna dias_na_fatura será o calculo da diferença em dias da ultima fatura ou da ultima movimentacao 
					->select("m.*, (CASE dt_ultimo_faturamento > dt_ultima_movimentacao WHEN TRUE THEN (date('" . $dt_fatura->toString('YYYY-MM-dd HH:mm:ss') . "') - dt_ultimo_faturamento::date) ELSE (date('" . $dt_fatura->toString('YYYY-MM-dd HH:mm:ss') . "') - dt_ultima_movimentacao::date) END) as dias_na_fatura")
					->from('ScmMaquina m')
					->addWhere('m.nr_serie_imob = ?', $this->_getParam('nr_serie'))
				;
				$maquina = $maquina->fetchOne();
				if (!$maquina) {
					throw new Exception();
				}
				
				$aa = array($maquina->dt_ultima_movimentacao, $maquina->dt_ultima_transformacao, $maquina->dt_ultima_regularizacao, $maquina->dt_ultimo_faturamento);
				rsort($aa);
				if ($dt_fatura->toString('YYYY-MM-dd HH:mm:ss') < reset($aa)) {
					throw new Exception(DMG_Translate::_('faturamento.registros-posteriores.offline'));
				}
				
				if ($parceiro) {
					$maquina->addWhere('m.id_parceiro = ?', $parceiro->id);
				}
						
				$fItem = Doctrine_Query::create()
					->from('ScmFaturaItem fi')
					->addWhere('fi.id_fatura_doc = ?', $fDoc->id)
					->addWhere('fi.id_maquina = ?', $maquina->id)
					->fetchOne()
				;
				if (!$fItem) {
					$fItem = new ScmFaturaItem();
				}
				$fItem->id_fatura_doc = $fDoc->id;
				$fItem->vl_credito = $maquina->vl_credito;
				$fItem->nr_credito = 0; # TODO: WTF?
				$fItem->id_maquina = $maquina->id;
				$fItem->id_jogo = $maquina->id_jogo;
				$fItem->nr_versao_jogo = $maquina->nr_versao_jogo;
				$fItem->id_gabinete = $maquina->id_gabinete;
				$fItem->id_protocolo = $maquina->id_protocolo;
				$fItem->id_moeda = $maquina->id_moeda;
				$Int = new Zend_Validate_Int();
				$notEmpty = new Zend_Validate_NotEmpty();
				$cont = explode(",", DMG_Config::get(4));
				for ($i = 1; $i <= 6; $i++) {
					$_nm = 'nr_cont_' . $i;
					if (in_array($i, $cont)) {
						if (!$notEmpty->isValid($this->getRequest()->getParam($_nm . '_new'))) {
							$errors[$_nm . '_new'] = DMG_Translate::_('parque.transformacao.form.contador.empty');
						}
					}
					if ($notEmpty->isValid($this->getRequest()->getParam($_nm . '_new'))) {
						if (!$Int->isValid($this->getRequest()->getParam($_nm . '_new'))) {
							$errors[$_nm . '_new'] = DMG_Translate::_('parque.transformacao.form.contador.string');
						} else {
							$fItem->$_nm = $this->getRequest()->getParam($_nm . '_new');
						}
					} else {
						$fItem->$_nm = null;
					}
					if ($fItem->$_nm < $maquina->$_nm) {
						$errors[$_nm . '_new'] = DMG_Translate::_('faturamento.contadores.menor');
					}
				}
				$fItem->nr_cont_1_ant = $maquina->nr_cont_1;
				$fItem->nr_cont_2_ant = $maquina->nr_cont_2;
				$fItem->nr_cont_3_ant = $maquina->nr_cont_3;
				$fItem->nr_cont_4_ant = $maquina->nr_cont_4;
				$fItem->nr_cont_5_ant = $maquina->nr_cont_5;
				$fItem->nr_cont_6_ant = $maquina->nr_cont_6;
				$fItem->nr_dif_cont_1 = $fItem->nr_cont_1 - $fItem->nr_cont_1_ant;
				$fItem->nr_dif_cont_2 = $fItem->nr_cont_2 - $fItem->nr_cont_2_ant;
				$fItem->nr_dif_cont_3 = $fItem->nr_cont_3 - $fItem->nr_cont_3_ant;
				$fItem->nr_dif_cont_4 = $fItem->nr_cont_4 - $fItem->nr_cont_4_ant;
				$fItem->nr_dif_cont_5 = $fItem->nr_cont_5 - $fItem->nr_cont_5_ant;
				$fItem->nr_dif_cont_6 = $fItem->nr_cont_6 - $fItem->nr_cont_6_ant;
				$fItem->vl_dif_cont_1 = $fItem->nr_dif_cont_1 * $fItem->vl_credito;
				$fItem->vl_dif_cont_2 = $fItem->nr_dif_cont_2 * $fItem->vl_credito;
				$fItem->vl_dif_cont_3 = $fItem->nr_dif_cont_3 * $fItem->vl_credito;
				$fItem->vl_dif_cont_4 = $fItem->nr_dif_cont_4 * $fItem->vl_credito;
				$fItem->vl_dif_cont_5 = $fItem->nr_dif_cont_5 * $fItem->vl_credito;
				$fItem->vl_dif_cont_6 = $fItem->nr_dif_cont_6 * $fItem->vl_credito;
				$fItem->percent_local = $maquina->percent_local;
				$fItem->vl_bruto = $fItem->vl_dif_cont_4 - $fItem->vl_dif_cont_3; # TODO: verificar
				$fItem->vl_local = round($fItem->vl_bruto * $fItem->percent_local / 100, 2);
				$fItem->vl_empresa = $fItem->vl_bruto - $fItem->vl_local;
				$fItem->dias_na_fatura = $maquina->dias_na_fatura;
				$fItem->save();
				$valor_fatura = Doctrine_Query::create()
					->addSelect('SUM(fi.vl_empresa) AS valor_fatura')
					->from('ScmFaturaItem fi')
					->addWhere('fi.id_fatura_doc = ?', $fDoc->id)
					->execute(array(), Doctrine::HYDRATE_SCALAR)
				;
				$valor_fatura = $valor_fatura[0]['fi_valor_fatura'];
				if (count($errors)) {
					throw new Exception(DMG_Translate::_('faturamento.form.errors'));
				}
				echo Zend_Json::encode(array(
					'success' => true,
					'docId' => $fDoc->id,
					'vl_operadora' => Khronos_Moeda::format($fItem->vl_empresa),
					'vl_local' => Khronos_Moeda::format($fItem->vl_local),
					'vl_bruto' => Khronos_Moeda::format($fItem->vl_bruto),
					'percent_local' => $fItem->percent_local,
					'nr_cont_1' => $fItem->nr_cont_1,
					'nr_cont_2' => $fItem->nr_cont_2,
					'nr_cont_3' => $fItem->nr_cont_3,
					'nr_cont_4' => $fItem->nr_cont_4,
					'nr_cont_5' => $fItem->nr_cont_5,
					'nr_cont_6' => $fItem->nr_cont_6,
					'valor_fatura' => $maquina->ScmMoeda->simbolo_moeda . ' ' . Khronos_Moeda::format($valor_fatura)
				));
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
			} catch (Exception $e) {
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				echo Zend_Json::encode(array('success' => false, 'errors' => $errors, 'message' => $e->getMessage()));
			}
		}
	}
	public function comboLocalAction () {
		if (DMG_Acl::canAccess(89)) {
			$query = Doctrine_Query::create()
				->select('id, nm_local')
				->from('ScmLocal')
				->orderBy('nm_local ASC')
			;
			$data = array();
			foreach ($query->execute() as $k) {
				$data[] = array(
					'id' => $k->id,
					'nm_local' => $k->nm_local
				);
			}
			echo Zend_Json::encode(array('success' => true, 'total' => $query->count(), 'data' => $data));
		}
	}
	public function comboFilialAction () {
		if (DMG_Acl::canAccess(89)) {
			$query = Doctrine_Query::create()
				->select('f.id, f.nm_filial, e.nm_empresa')
				->from('ScmFilial f')
				->innerJoin('f.ScmEmpresa e')
				->orderBy('e.nm_empresa ASC, f.nm_filial ASC')
			;
			$data = array();
			foreach ($query->execute() as $k) {
				$data[] = array(
					'id' => $k->id,
					'nm_completo' => $k->ScmEmpresa->nm_empresa . ' - ' . $k->nm_filial
				);
			}
			echo Zend_Json::encode(array('success' => true, 'total' => $query->count(), 'data' => $data));
		}
	}
	public function comboParceiroAction () {
		if (DMG_Acl::canAccess(89)) {
			$query = Doctrine_Query::create()
				->select('id, nm_parceiro')
				->from('ScmParceiro')
				->orderBy('nm_parceiro ASC')
			;
			$data = array();
			foreach ($query->execute() as $k) {
				$data[] = array(
					'id' => $k->id,
					'nm_parceiro' => $k->nm_parceiro
				);
			}
			echo Zend_Json::encode(array('success' => true, 'total' => $query->count(), 'data' => $data));
		}
	}
	public function comboMoedaAction () {
		if (DMG_Acl::canAccess(89)) {
			$query = Doctrine_Query::create()
				->select('id, nm_moeda')
				->from('ScmMoeda')
				->orderBy('nm_moeda ASC')
			;
			$data = array();
			foreach ($query->execute() as $k) {
				$data[] = array(
					'id' => $k->id,
					'nm_moeda' => $k->nm_moeda
				);
			}
			echo Zend_Json::encode(array('success' => true, 'total' => $query->count(), 'data' => $data));
		}
	}
	public function criarFaturaAction () {
		if (DMG_Acl::canAccess(89)) {
			try {
				Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
				
				$ids = $this->_getParam('id');
				
				//Se a variavel $ids nao for um array nao existia maquina possivel de faturamento na selecao
				if(!is_array($ids))
					throw new Exception(DMG_Translate::_('faturamento.erro.nenhuma.maquina.para.fatura'));
				
				//Verifica se a fatura já foi confirmada
				if($this->checkConfirmada($this->_getParam('docId')))
					throw new Exception(DMG_Translate::_('faturamento.erro.fatura.confirmada'));
				
				
				$local = Doctrine::getTable('ScmLocal')->find((int) $this->getRequest()->getParam('id_local'));
				$filial = Doctrine::getTable('ScmFilial')->find((int) $this->getRequest()->getParam('id_filial'));
				$parceiro = Doctrine::getTable('ScmParceiro')->find((int) $this->getRequest()->getParam('id_parceiro'));
				$moeda = Doctrine::getTable('ScmMoeda')->find((int) $this->getRequest()->getParam('id_moeda'));
				if (!$local) {
					throw new Exception(DMG_Translate::_('faturamento.local.invalid'));
				}
				if (!$filial) {
					throw new Exception(DMG_Translate::_('faturamento.filial.invalid'));
				}
				if (!$moeda) {
					throw new Exception(DMG_Translate::_('faturamento.moeda.invalid'));
				}
				try {
					$dt_fatura = new Zend_Date($this->getRequest()->getParam('dt_fatura'));
					$dt_fatura->set($this->getRequest()->getParam('hora'), Zend_Date::HOUR);
					$dt_fatura->set($this->getRequest()->getParam('minuto'), Zend_Date::MINUTE);
				} catch (Exception $f) {
					throw new Exception(DMG_Translate::_('faturamento.data.invalida'));
				}
				$fDoc = Doctrine::getTable('ScmFaturaDoc')->find((int) $this->_getParam('docId'));
				if (!$fDoc) {
					$fDoc = new ScmFaturaDoc();
				}
				$fDoc->dt_fatura = $dt_fatura->toString('YYYY-MM-dd HH:mm:ss');
				$fDoc->id_origem = 2;
				$fDoc->id_fatura_doc_status = 1;
				$fDoc->id_filial = $filial->id;
				$fDoc->id_local = $local->id;
				$fDoc->id_parceiro = ($parceiro ? $parceiro->id : null);
				$fDoc->id_moeda = $moeda->id;
				$fDoc->id_usuario = Zend_Auth::getInstance()->getIdentity()->id;
				$fDoc->id_usuario_confirmacao = null;
				$fDoc->save();
				
				
				$dbhandler = Doctrine_Manager::getInstance()->getCurrentConnection()->getDbh();
				$query = "
					SELECT m.*,
					CASE WHEN greatest(m.dt_ultima_movimentacao, m.dt_ultima_transformacao, m.dt_ultima_regularizacao, m.dt_ultimo_faturamento) >= '" . $dt_fatura->toString('YYYY-MM-dd HH:mm:ss') . "' THEN 0 ELSE 1 END AS canmove,
					CASE (
						SELECT 
						scm_fatura_doc.id_fatura_doc_status
						FROM 
						scm_fatura_doc,
						scm_fatura_item,
						scm_maquina
						WHERE scm_fatura_item.id_fatura_doc = scm_fatura_doc.id
						AND scm_fatura_item.id_maquina = scm_maquina.id
						AND scm_maquina.id = m.id
						AND scm_fatura_doc.id_fatura_doc_status = 1
						GROUP BY scm_fatura_doc.id, scm_fatura_doc.id_fatura_doc_status
					) WHEN 1 THEN 1 ELSE 0 END AS em_temporaria
					FROM scm_maquina m
					WHERE m.id IN (" . implode(',', $ids) . ")
					AND m.id_local = " . $local->id . "
					AND m.id_filial = " . $filial->id . "
					AND m.id_moeda = " . $moeda->id;

				if ($parceiro) {
					$query .= " AND m.id_parceiro = " . $parceiro->id;
				}
				
				$result = $dbhandler->query($query);
				
				foreach ($result as $maquina){
					if(($maquina['canmove'] == "1") && ($maquina['em_temporaria'] == "0")){
						$fItem = new ScmFaturaItem();
						$fItem->id_fatura_doc = $fDoc->id;
						$fItem->id_maquina = $maquina['id'];
						$fItem->vl_credito = $maquina['vl_credito'];
						$fItem->nr_credito = 0; # TODO: ???
						$fItem->id_jogo = $maquina['id_jogo'];
						$fItem->nr_versao_jogo = $maquina['nr_versao_jogo'];
						$fItem->id_gabinete = $maquina['id_gabinete'];
						$fItem->id_protocolo = $maquina['id_protocolo'];
						$fItem->id_moeda = $moeda->id;
						$fItem->vl_bruto = 0;
						$fItem->vl_local = 0;
						$fItem->vl_empresa = 0;
						$fItem->save();
					}
				}	
				
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
				echo Zend_Json::encode(array('success' => true, 'docId' => $fDoc->id));
			} catch (Exception $e) {
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				echo Zend_Json::encode(array('success' => false, 'message' => $e->getMessage()));
			}
		}
	}
	public function deleteItemFaturaAction () {
		if (DMG_Acl::canAccess(89)) {
			try {
				Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
				
				//Verifica se a fatura já foi confirmada
				if($this->checkConfirmada($this->_getParam('docId')))
					throw new Exception(DMG_Translate::_('faturamento.erro.fatura.confirmada'));
				
				$ids = $this->_getParam('id');
				$id = array();
				foreach ($ids as $k) {
					$id[] = (int) $k;
				}
				if(count($id)>0){
					$query = Doctrine_Query::create()
						->addSelect('fi.id')
						->from('ScmFaturaItem fi')
						->whereIn('fi.id_maquina', $id)
						->addWhere('fi.id_fatura_doc = ?', (int) $this->_getParam('docId'))
						->delete()
					;
					$query->execute();
				}
				$query2 = Doctrine_Query::create()
					->addSelect('mo.simbolo_moeda')
					->addSelect('SUM(fi.vl_empresa) AS valor_empresa')
					->from('ScmMoeda mo')
					->innerJoin('mo.ScmFaturaItem fi')
					->addGroupBy('mo.simbolo_moeda')
					->addWhere('fi.id_fatura_doc = ?', (int) $this->_getParam('docId'))
					->execute(array(), Doctrine::HYDRATE_SCALAR)
				;
				$vl_fatura = '';
				if (count($query2)) {
					$vl_fatura = $query2[0]['mo_simbolo_moeda'] . ' ' . Khronos_Moeda::format($query2[0]['fi_valor_empresa']);
				}
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
				echo Zend_Json::encode(array('success' => true, 'vl_fatura' => $vl_fatura));
			} catch (Exception $e) {
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				echo Zend_Json::encode(array('success' => false, 'message' => $e->getMessage()));
			}
		}
	}
	
	private function checkConfirmada($id_fatura){
		$fDoc = Doctrine::getTable('ScmFaturaDoc')->find($id_fatura);
		if (!$fDoc) {
			return false;
		}
		if ($fDoc->id_fatura_doc_status != 1) {
			return true;
		}
		else return false;
	}
}