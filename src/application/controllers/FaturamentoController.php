<?php

class FaturamentoController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function deleteTempAction () {
		if (DMG_Acl::canAccess(85)) {
			try {
				Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
				$fDoc = Doctrine::getTable('ScmFaturaDoc')->find((int) $this->getRequest()->getParam('id'));
				if (!$fDoc) {
					return;
				}
				if ($fDoc->id_fatura_doc_status != 1) {
					throw new Exception(DMG_Translate::_('faturamento.delete_temp.nao_temporaria'));
				}
				foreach ($fDoc->ScmFaturaItem as $k) {
					$k->delete();
				}
				foreach ($fDoc->ScmFaturaExcecao as $k) {
					$k->delete();
				}
				$fDoc->delete();
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
				echo Zend_Json::encode(array('success' => true));
			} catch (Exception $e) {
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				echo Zend_Json::encode(array('success' => false, 'message' => $e->getMessage()));
			}
		}
	}
	public function consultaAction () {
		if (DMG_Acl::canAccess(86)) {
			$id_maquina = $this->getRequest()->getParam('id_maquina');
			if(!$id_maquina){
				echo(Zend_Json::encode(array('success'=>true, 'rows'=>array())));
				return;
			}
			$conn = Doctrine_Manager::getInstance()->getCurrentConnection();
			$dbhandler = $conn->getDbh();
			$query = "
				SELECT
				4 AS ordem,
				a.dt_sistema AS dt_sistema,
				a.dt_fatura AS data,
				'Faturamento' AS tipo,
				a.nr_fatura as id,
				f.nm_filial AS filial,
				l.nm_local AS local,
				u.name AS usuario,
				''  AS detalhes,
				fi.nr_cont_1,
				fi.nr_cont_2,
				fi.nr_cont_3,
				fi.nr_cont_4,
				fi.nr_cont_5,
				fi.nr_cont_6,
				fi.vl_bruto,
				fi.vl_local,
				fi.vl_empresa
				FROM scm_fatura_doc a
				INNER JOIN scm_filial f ON f.id = a.id_filial
				INNER JOIN scm_local l ON l.id = a.id_local
				INNER JOIN scm_user u ON u.id = a.id_usuario
				INNER JOIN scm_fatura_item  fi ON fi.id_fatura_doc = a.id
				INNER JOIN scm_user_empresa ue ON ue.id_empresa = f.id_empresa
				";
			$query .= " WHERE fi.id_maquina = " . $id_maquina;
			$query .= " AND ue.user_id = " . Zend_Auth::getInstance()->getIdentity()->id;
			$query .= " AND a.id_fatura_doc_status = 2 ";
			$query .= " ORDER BY data DESC, ordem DESC";
			$historico = $dbhandler->query($query);
			$data = Array();
			$i = 0;
			foreach($historico as $k){
				$k = array_merge(array('indice'=>$i), $k);
				$data[] = array(
					"indice" => $k["indice"],
					"ordem" => $k["ordem"],
					"dt_sistema" => $k["dt_sistema"],
					"data" => $k["data"],
					"id" => $k["id"],
					"filial" => $k["filial"],
					"local" => $k["local"],
					"usuario" => $k["usuario"],
					"nr_cont_1" => $k["nr_cont_1"],
					"nr_cont_2" => $k["nr_cont_2"],
					"nr_cont_3" => $k["nr_cont_3"],
					"nr_cont_4" => $k["nr_cont_4"],
					"nr_cont_5" => $k["nr_cont_5"],
					"nr_cont_6" => $k["nr_cont_6"],
					"vl_bruto" => Khronos_Moeda::format($k["vl_bruto"]),
					"vl_local" => Khronos_Moeda::format($k["vl_local"]),
					"vl_empresa" => Khronos_Moeda::format($k["vl_empresa"])
				);
				$i++;
			}
			echo Zend_Json::encode(array('success' => true, 'rows' => $data));
		}
	}
	public function maquinasAction () {
		if (DMG_Acl::canAccess(73)) {
			try {
				$local = Doctrine::getTable('ScmLocal')->find((int) $this->getRequest()->getParam('id_local'));
				$filial = Doctrine::getTable('ScmFilial')->find((int) $this->getRequest()->getParam('id_filial'));
				$parceiro = Doctrine::getTable('ScmParceiro')->find((int) $this->getRequest()->getParam('id_parceiro'));
				$moeda = Doctrine::getTable('ScmMoeda')->find((int) $this->getRequest()->getParam('id_moeda'));
				if (!$local) {
					echo Zend_Json::encode(array('success' => true, 'total' => 0, 'data' => array()));
					return;
				}
				if (!$filial) {
					echo Zend_Json::encode(array('success' => true, 'total' => 0, 'data' => array()));
					return;
				}
				if (!$moeda) {
					echo Zend_Json::encode(array('success' => true, 'total' => 0, 'data' => array()));
					return;
				}
				$nr_serie_imob = $this->getRequest()->getParam('nr_serie_imob');
				$msg = "";
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
				$query = Doctrine_Query::create()
					->from('ScmMaquina m')
					->addWhere('m.id_local = ?', $local->id)
					->addWhere('m.id_filial = ?', $filial->id)
					->addWhere('m.id_moeda = ?', $moeda->id);
				if ($parceiro) {
					if($parceiro == "null"){
						$query->addWhere('m.id_parceiro IS NULL');
					}
					else {
						$query->addWhere('m.id_parceiro = ?', $parceiro);
					}
				}
				if(strlen($nr_serie_imob) > 0){
					$query->addWhere('m.nr_serie_imob ILIKE ?', '%' . $nr_serie_imob . '%');
				}
				$query->orderBy('m.nr_serie_imob ASC');
				//DMG_Crud::paginate($query, (int) $this->getRequest()->getParam('limit'), (int) $this->getRequest()->getParam('start'), $this->getRequest()->getParam('sort'), $this->getRequest()->getParam('dir'));
				//DMG_Crud::filter($query, $this->getRequest()->getParam('filter'));
				$data = array();
				foreach ($query->execute() as $k) {
					$data[] = array(
						'id' => $k->id,
						'nr_serie' => $k->nr_serie_imob,
						'nm_jogo' => $k->ScmJogo->nm_jogo,
						'vl_credito' => $k->ScmMoeda->simbolo_moeda . ' ' . $k->vl_credito
					);
				}
				echo Zend_Json::encode(array('success' => true, 'total' => $query->count(), 'data' => $data, 'message' => $msg, 'id' => ($fDoc ? $fDoc->id : null)));
			} catch (Exception $e) {
				echo Zend_Json::encode(array('success' => false, 'message' => $e->getMessage()));
			}
		}
	}
	public function listGridAction () {
		if (DMG_Acl::canAccess(73)) {
			try {
				Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
				if ($this->getRequest()->getParam('geraFatura')) {
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
					$maquinas = $this->getRequest()->getParam('maquina');
					if (count($maquinas) == 0) {
						throw new Exception(DMG_Translate::_('faturamento.calcula_selecione_maquinas'));
					}
					if (!$fDoc || $fDoc->id_usuario != Zend_Auth::getInstance()->getIdentity()->id) {
						throw new Exception(DMG_Translate::_('faturamento.calcular_antes_confirmar'));
					} else {
						$query2 = Doctrine_Query::create()->select()->from('ScmFaturaItem fi')->addWhere('fi.id_fatura_doc = ?', $fDoc->id);
						if (!$query2->count()) {
							throw new Exception(DMG_Translate::_('a#1'));
						} else {
							$fDoc->id_fatura_doc_status = 2;
							$fDoc->id_usuario_confirmacao = Zend_Auth::getInstance()->getIdentity()->id;
							$fDoc->nr_fatura = new Doctrine_Expression("nextval('scm_numero_fatura_seq')");
							$fDoc->dt_sistema = DMG_Date::now();
							$fDoc->save();
							$nr_fatura = Doctrine::getTable('ScmFaturaDoc')->find($fDoc->id)->nr_fatura;
							echo Zend_Json::encode(array('success' => true, 'faturado' => true, 'id' => $nr_fatura));
						}
					}
				} else {
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
					$maquinas = $this->getRequest()->getParam('maquina');
					if (!$fDoc) {
						$fDoc = new ScmFaturaDoc();
						$fDoc->id_fatura_doc_status = 1;
						$fDoc->dt_fatura = DMG_Date::now();
						$fDoc->id_origem = 1;
						$fDoc->id_filial = $filial->id;
						$fDoc->id_local = $local->id;
						$fDoc->id_parceiro = ($parceiro ? $parceiro->id : null);
						$fDoc->id_moeda = $moeda->id;
						$fDoc->save();
						$dados = Khronos_Servidor::getContadoresLocal($local);
						$query = Doctrine_Query::create()
							// A coluna dias_na_fatura será o calculo da diferença em dias da ultima fatura ou da ultima movimentacao 
							->select('m.*, st.*, (CASE dt_ultimo_faturamento > dt_ultima_movimentacao WHEN TRUE THEN current_date - dt_ultimo_faturamento::date ELSE current_date - dt_ultima_movimentacao::date END) as dias_na_fatura')
							->from('ScmMaquina m')
							->addWhere('m.id_local = ?', $local->id)
							->addWhere('m.id_filial = ?', $filial->id)
							->addWhere('m.id_moeda = ?', $moeda->id)
							->innerJoin('m.ScmStatusMaquina st')
							->addWhere('st.fl_alta = ?', 1)
						;
						if ($parceiro) {
							$query->addWhere('m.id_parceiro = ?', $parceiro->id);
						}
						echo $this->printListGrid($this->fillItemsAndExceptions($query, $fDoc, $maquinas, $dados), $maquinas, $dados, $fDoc->nr_fatura, $fDoc->dt_fatura, $moeda->simbolo_moeda);
					} else {
						if ($fDoc->id_usuario != Zend_Auth::getInstance()->getIdentity()->id) {
							throw new Exception(DMG_Translate::_('faturamento.usuario_bloqueado'));
						} else {
							$fDoc->id_fatura_doc_status = 1;
							$fDoc->dt_fatura = DMG_Date::now();
							$fDoc->id_origem = 1;
							$fDoc->id_filial = $filial->id;
							$fDoc->id_local = $local->id;
							$fDoc->id_parceiro = ($parceiro ? $parceiro->id : null);
							$fDoc->id_moeda = $moeda->id;
							$fDoc->dt_sistema = DMG_Date::now();
							$fDoc->save();
							foreach ($fDoc->ScmFaturaItem as $k) {
								$k->delete();
							}
							foreach ($fDoc->ScmFaturaExcecao as $l) {
								$l->delete();
							}
							$dados = Khronos_Servidor::getContadoresLocal($local);
							$query = Doctrine_Query::create()
								// A coluna dias_na_fatura será o calculo da diferença em dias da ultima fatura ou da ultima movimentacao 
								->select('m.*, st.*, (CASE dt_ultimo_faturamento > dt_ultima_movimentacao WHEN TRUE THEN current_date - dt_ultimo_faturamento::date ELSE current_date - dt_ultima_movimentacao::date END) as dias_na_fatura')
								->from('ScmMaquina m')
								->addWhere('m.id_local = ?', $local->id)
								->addWhere('m.id_filial = ?', $filial->id)
								->addWhere('m.id_moeda = ?', $moeda->id)
								->innerJoin('m.ScmStatusMaquina st')
								->addWhere('st.fl_alta = ?', 1)
							;
							if ($parceiro) {
								$query->addWhere('m.id_parceiro = ?', $parceiro->id);
							}
							echo $this->printListGrid($this->fillItemsAndExceptions($query, $fDoc, $maquinas, $dados), $maquinas, $dados, $fDoc->nr_fatura, $fDoc->dt_fatura, $moeda->simbolo_moeda);
						}
					}
				}
				if (Doctrine_Manager::getInstance()->getCurrentConnection()->getTransactionLevel() != 0) {
					Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
				}
			} catch (Exception $e) {
				echo Zend_Json::encode(array('success' => false, 'message' => $e->getMessage()));
				if (Doctrine_Manager::getInstance()->getCurrentConnection()->getTransactionLevel() != 0) {
					Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				}
			}
		}
	}
	public function confirmFaturaAction () {
		if (DMG_Acl::canAccess(84)) {
			try {
				Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
				$fDoc = Doctrine::getTable('ScmFaturaDoc')->find((int) $this->getRequest()->getParam('id'));
				if (!$fDoc) {
					return;
				}
				if ($fDoc->id_fatura_doc_status == 2) {
					throw new Exception(DMG_Translate::_('faturamento.fatura_ja_confirmada'));
				}
				if ($fDoc->id_origem == 2) {
					$dbhandler = Doctrine_Manager::getInstance()->getCurrentConnection()->getDbh();
					$query = "SELECT
						md.tp_movimento,
						md.dt_movimentacao,
						md.id_local,
						md.id_filial,
						CASE WHEN md.id_parceiro is null THEN 0 else md.id_parceiro END as id_parceiro,
						mi.id_maquina
						FROM
						scm_movimentacao_doc md,
						scm_movimentacao_item mi,
						scm_maquina m
						WHERE md.id = mi.id_movimentacao_doc
						AND mi.id_maquina = m.id
						AND md.dt_movimentacao = (
							SELECT max(md2.dt_movimentacao)
							FROM scm_movimentacao_doc md2, scm_movimentacao_item mi2
							WHERE md2.id = mi2.id_movimentacao_doc
							AND md2.id_local = md.id_local
							AND md2.id_filial = md.id_filial
							AND CASE WHEN md2.id_parceiro is null THEN 0 else md2.id_parceiro END = CASE WHEN md.id_parceiro is null THEN 0 else md.id_parceiro END
							AND mi2.id_maquina = mi.id_maquina
							AND md2.dt_movimentacao <=  '" . $fDoc->dt_fatura . "'
						)
						AND md.tp_movimento = 'E'
						AND m.id NOT IN (SELECT fi.id_maquina FROM scm_fatura_item fi WHERE fi.id_fatura_doc = " . $fDoc->id . ")
					";
					$query .= " AND md.id_local = " . $fDoc->id_local;
					$query .= " AND md.id_filial = " . $fDoc->id_filial; 
					$query .= " AND m.id_moeda = ". $fDoc->id_moeda;
					if ($fDoc->id_parceiro) {
						$query .= " AND md.id_parceiro = " . $fDoc->id_parceiro;
					}
					$result = $dbhandler->query($query);
					$data = array();
					$i = 0;
					foreach ($result as $k) {
						$fExc = new ScmFaturaExcecao();
						$fExc->id_fatura_doc = $fDoc->id;
						$fExc->id_maquina = $k['id_maquina'];
						$fExc->id_fatura_excecao_tipo = 1;
						$fExc->save();
					}
					$query2 = Doctrine_Query::create()
						->from('ScmFaturaItem fi')
						->addWhere('fi.id_fatura_doc = ?', $fDoc->id)
						->addWhere('fi.nr_cont_1 IS NULL')
						->addWhere('fi.nr_cont_2 IS NULL')
						->addWhere('fi.nr_cont_3 IS NULL')
						->addWhere('fi.nr_cont_4 IS NULL')
						->addWhere('fi.nr_cont_5 IS NULL')
						->addWhere('fi.nr_cont_6 IS NULL')
					;
					foreach ($query2->execute() as $l) {
						$fExc = new ScmFaturaExcecao();
						$fExc->id_fatura_doc = $fDoc->id;
						$fExc->id_maquina = $l->id_maquina;
						$fExc->id_fatura_excecao_tipo = 1;
						$fExc->save();
					}
					Doctrine_Query::create()
						->from('ScmFaturaItem fi')
						->addWhere('fi.id_fatura_doc = ?', $fDoc->id)
						->addWhere('fi.nr_cont_1 IS NULL')
						->addWhere('fi.nr_cont_2 IS NULL')
						->addWhere('fi.nr_cont_3 IS NULL')
						->addWhere('fi.nr_cont_4 IS NULL')
						->addWhere('fi.nr_cont_5 IS NULL')
						->addWhere('fi.nr_cont_6 IS NULL')
						->delete()
						->execute()
					;
				}
				$fDoc->id_fatura_doc_status = 2;
				$fDoc->id_usuario_confirmacao = Zend_Auth::getInstance()->getIdentity()->id;
				$fDoc->nr_fatura = new Doctrine_Expression("nextval('scm_numero_fatura_seq')");
				$fDoc->dt_sistema = DMG_Date::now();
				$query = Doctrine_Query::create()
					->from('ScmFaturaItem fi')
					->addWhere('fi.id_fatura_doc = ?', $fDoc->id)
				;
				if (!$query->count()) {
					throw new Exception(DMG_Translate::_('faturamento.nenhuma_maquina_confirm'));
				}
				$fDoc->save();
				echo Zend_Json::encode(array('success' => true));
				Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
			} catch (Exception $e) {
				Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
				echo Zend_Json::encode(array('success' => false, 'message' => $e->getMessage()));
			}
		}
	}
	public function listAction () {
		if (DMG_Acl::canAccess(72)) {
			$query = Doctrine_Query::create()
				->from('ScmFaturaDoc fd')				
				->addSelect('fd.id')
				->addSelect('fd.id_origem')
				->addSelect('fd.id_fatura_doc_status')
				->addSelect('fd.nr_fatura')
				->addSelect('fd.dt_fatura')
				->addSelect('fd.id_moeda')
				->addSelect('mo.simbolo_moeda')
				->addSelect('SUM(fi.vl_dif_cont_4) AS entradas')
				->addSelect('SUM(fi.vl_dif_cont_3) AS saidas')
				->addSelect('SUM(fi.vl_bruto) AS vl_bruto')
				->addSelect('SUM(fi.vl_empresa) AS vl_empresa')
				->addSelect('(SELECT COUNT(fi2.id) FROM ScmFaturaItem fi2 WHERE fi2.id_fatura_doc = fd.id) AS qtde_maquinas')
				->addSelect('(SELECT COUNT(fe.id) FROM ScmFaturaExcecao fe WHERE fe.id_fatura_doc = fd.id) AS qtde_excecoes')
				->addSelect('fd.id_local')
				->addSelect('lo.nm_local')
				->addSelect('(em.nm_empresa || \' - \' || fl.nm_filial) AS nm_filial_completo')
				->addSelect('(SELECT u1.name FROM ScmUser u1 WHERE u1.id = fd.id_usuario) AS nm_usuario')
				->addSelect('(SELECT u2.name FROM ScmUser u2 WHERE u2.id = fd.id_usuario_confirmacao) AS nm_usuario_confirmacao')
				->addSelect('(CASE WHEN fd.dt_fatura <> fd.dt_sistema THEN fd.dt_sistema ELSE null END) AS dt_confirmacao')
				
				->leftJoin('fd.ScmFaturaItem fi')
				->innerJoin('fd.ScmMoeda mo')
				->innerJoin('fd.ScmLocal lo')
				->innerJoin('fd.ScmFilial fl')
				->innerJoin('fl.ScmEmpresa em')
				->innerJoin('em.ScmUserEmpresa ue')
				
				->addWhere('fd.id_fatura_doc_status = ?', (int) $this->getRequest()->getParam('status'))
				->addWhere('ue.user_id = ?', Zend_Auth::getInstance()->getIdentity()->id)
				
				->addGroupBy('fd.id')
				->addGroupBy('fd.id_origem')
				->addGroupBy('fd.nr_fatura')
				->addGroupBy('fd.dt_fatura')
				->addGroupBy('mo.simbolo_moeda')
				->addGroupBy('fd.id_moeda')
				->addGroupBy('fd.id_local')
				->addGroupBy('lo.nm_local')
				->addGroupBy('nm_filial_completo')
				->addGroupBy('nm_usuario')
				->addGroupBy('nm_usuario_confirmacao')
				->addGroupBy('dt_confirmacao')
				->addGroupBy('fd.id_fatura_doc_status')
				
				->orderBy('fd.dt_fatura DESC')
			;
			//DMG_Crud::paginate($query, (int) $this->getRequest()->getParam('limit'), (int) $this->getRequest()->getParam('start'), $this->getRequest()->getParam('sort'), $this->getRequest()->getParam('dir'));
			//DMG_Crud::filter($this, $query, $this->getRequest()->getParam('filter'));
			
			
			
			
			
			$filter = $this->getRequest()->getParam('filter');
			if (is_array($filter)) {
				foreach ($filter as $k) {
					if(isset($k['data']['value']) && $k['data']['type'] != 'string') {
						$dataExp = explode('/' ,$k['data']['value']);
						$k['data']['value'] = $dataExp[2] . '-' . $dataExp[1] . '-'.$dataExp[0];
						$dt_fatura = new Zend_Date($k['data']['value']);
					}

					switch ($k['data']['type']) {
						case 'string':
							$query->addWhere($k['field'] . ' = ?', $k['data']['value']);
							break;
						case 'date':
							if($k['data']['comparison'] == 'lt'){
								$query->addWhere($k['field'] . " <= '" . $dt_fatura->toString('YYYY-MM-dd HH:mm:ss') . "'");
							}
							if($k['data']['comparison'] == 'gt'){
								$query->addWhere($k['field'] . " >= '" . $dt_fatura->toString('YYYY-MM-dd HH:mm:ss') . "'");
							}
							if($k['data']['comparison'] == 'eq'){
								$query->addWhere($k['field'] . " = '" . $dt_fatura->toString('YYYY-MM-dd HH:mm:ss') . "'");
							}
							break;
					}
				}
			}			
			
			
			$data = array();
			foreach ($query->execute(array(), Doctrine::HYDRATE_SCALAR) as $k) {
				$data[] = array(
					'id' => $k['fd_id'] . '-' . $k['fd_id_moeda'],
					'id_origem' => $k['fd_id_origem'],
					'id_fatura_doc_status' => $k['fd_id_fatura_doc_status'],
					'id_fatura' => $k['fd_id'],
					'nr_fatura' => $k['fd_nr_fatura'],
					'dt_fatura' => $k['fd_dt_fatura'],
					'nm_usuario' => $k['fd_nm_usuario'],
					'simbolo_moeda' => $k['mo_simbolo_moeda'],
					'entradas' => Khronos_Moeda::format($k['fi_entradas']),
					'saidas' => Khronos_Moeda::format($k['fi_saidas']),
					'vl_bruto' => Khronos_Moeda::format($k['fi_vl_bruto']),
					'vl_empresa' => Khronos_Moeda::format($k['fi_vl_empresa']),
					'qtde_maquinas' => $k['fd_qtde_maquinas'],
					'qtde_excecoes' => $k['fd_qtde_excecoes'],
					'id_local' => $k['fd_id_local'],
					'nm_local' => $k['lo_nm_local'],
					'nm_filial_completo' => $k['em_nm_filial_completo'],
					'nm_usuario' => $k['fd_nm_usuario'],
					'nm_usuario_confirmacao' => $k['fd_nm_usuario_confirmacao'],
					'dt_confirmacao' => $k['fd_dt_confirmacao']
				);
			}
			echo Zend_Json::encode(array('total' => 1, 'data' => $data));
		}
	}
	public function excecoeslistAction() {
		if (DMG_Acl::canAccess(72)){
			$query = Doctrine_Query::create()
				->select('e.id')
				->addSelect('e.id_fatura_doc')
				->addSelect('d.dt_fatura')
				->addSelect('m.nr_serie_imob')
				->addSelect('m.nr_serie_aux')
				->addSelect('te.nm_fatura_excecao_tipo')
				->addSelect('u.name')
				->from('ScmFaturaExcecao e')
				->innerJoin('e.ScmFaturaDoc d')
				->innerJoin('e.ScmMaquina m')
				->innerJoin('e.ScmFaturaExcecaoTipo te ON te.id = e.id_fatura_excecao_tipo')
				->innerJoin('m.ScmFilial f')
				->innerJoin('f.ScmEmpresa em')
				->innerJoin('m.ScmUser u')
				->innerJoin('em.ScmUserEmpresa ue')
				->where('ue.user_id = ' . Zend_Auth::getInstance()->getIdentity()->id)
				->addWhere("COALESCE(m.dt_ultimo_faturamento, timestamp '0001-01-01')  < d.dt_fatura")
				->addWhere('d.id_fatura_doc_status = ?', 2)
				->orderBy('e.id_fatura_doc DESC');
				
			$data = array();
			foreach ($query->execute() as $k) {
				$data[] = array(
					'id' => $k->id,
					'id_fatura_doc' => $k->ScmFaturaDoc->nr_fatura,
					'dt_fatura' => $k->ScmFaturaDoc->dt_fatura,
					'nr_serie_imob' => $k->ScmMaquina->nr_serie_imob,
					'nr_serie_aux' => $k->ScmMaquina->nr_serie_aux,
					'nm_fatura_excecao_tipo' => $k->ScmFaturaExcecaoTipo->nm_fatura_excecao_tipo,
					'usuario' => $k->ScmMaquina->ScmUser->name,
				);
			}
			echo Zend_Json::encode(array('success'=> true, 'total' => $query->count(), 'data' => $data));
		}
	}
	public function combofilialAction() {
		if (DMG_Acl::canAccess(72)){
			$id_local = (int)$this->getRequest()->getParam('id_local');
			if($id_local == 0){
				echo Zend_Json::encode(array('success'=> true, 'total'=> 0, 'data'=>array()));
				return;
			}
			
			$query = Doctrine_Query::create()
				->select('f.id')->distinct()
				->addSelect("(e.nm_empresa || ' - ' || f.nm_filial) as nm_completo")
				->from('ScmFilial f')
				->innerJoin('f.ScmMaquina m')
				->innerJoin('f.ScmEmpresa e')
				->innerJoin('m.ScmStatusMaquina s')
				->innerJoin('e.ScmUserEmpresa ue')
				->where('ue.user_id = ' . Zend_Auth::getInstance()->getIdentity()->id)
				->addWhere('s.fl_alta = 1')
				->addWhere('m.id_local = ?', $id_local);
	
			$data = array();
			foreach ($query->execute(array(), Doctrine::HYDRATE_SCALAR) as $k) {
				$data[] = array(
					'id' => $k["f_id"],
					'nm_completo' => $k["e_nm_completo"]
				);
			}
			echo Zend_Json::encode(array('success'=> true, 'total' => $query->count(), 'data' => $data));
		}
	}
	
	public function comboparceirosAction() {
		if (DMG_Acl::canAccess(72)){
			$id_local = (int)$this->getRequest()->getParam('id_local');
			if($id_local == 0){
				echo Zend_Json::encode(array('success'=> true, 'total'=> 0, 'data'=>array()));
				return;
			}
			$id_filial = (int)$this->getRequest()->getParam('id_filial');
			if($id_filial == 0){
				echo Zend_Json::encode(array('success'=> true, 'total'=> 0, 'data'=>array()));
				return;
			}

			$conn = Doctrine_Manager::getInstance()->getCurrentConnection();
			$dbhandler = $conn->getDbh();
			
			$query = "
					SELECT 
					DISTINCT m.id_parceiro AS id, 
					COALESCE(p.nm_parceiro, '') AS nm_parceiro 
					FROM scm_maquina m
					LEFT OUTER JOIN scm_parceiro p ON p.id = m.id_parceiro
					INNER JOIN scm_status_maquina s ON s.id = m.id_status
					INNER JOIN scm_filial f ON f.id = m.id_filial
					INNER JOIN scm_empresa e ON e.id = f.id_empresa
					INNER JOIN scm_user_empresa ue ON ue.id_empresa = e.id
					";
			$query .= " WHERE ue.user_id = " . Zend_Auth::getInstance()->getIdentity()->id;
			$query .= " AND s.fl_alta = 1 ";
			$query .= " AND m.id_local = " . $id_local;
			$query .= " AND m.id_filial = " . $id_filial;
			
			$parceiro = $dbhandler->query($query);
			$data = Array();
			foreach($parceiro as $k){
				$id = ($k["id"] == "") ? 'null' : $k["id"];
				$nm_parceiro = $k["nm_parceiro"];
				$data[] = array("id"=>$id, "nm_parceiro"=>$nm_parceiro);
			}
			
			echo Zend_Json::encode(array('success'=> true, 'total' => count($data), 'data' => $data));
		}
	}
	
	public function combomoedasAction() {
		if (DMG_Acl::canAccess(72)){
			$id_local = (int)$this->getRequest()->getParam('id_local');
			if($id_local == 0){
				echo Zend_Json::encode(array('success'=> true, 'total'=> 0, 'data'=>array()));
				return;
			}
			$id_filial = (int)$this->getRequest()->getParam('id_filial');
			if($id_filial == 0){
				echo Zend_Json::encode(array('success'=> true, 'total'=> 0, 'data'=>array()));
				return;
			}
			$query = Doctrine_Query::create()
				->select('mo.id')->distinct()
				->addSelect("mo.nm_moeda")
				->addSelect("mo.simbolo_moeda")
				->from('ScmMoeda mo')
				->innerJoin('mo.ScmMaquina m')
				->innerJoin('m.ScmStatusMaquina s')
				->innerJoin('m.ScmFilial f')
				->innerJoin('f.ScmEmpresa e')
				->innerJoin('e.ScmUserEmpresa ue')
				->where('ue.user_id = ' . Zend_Auth::getInstance()->getIdentity()->id)
				->addWhere('s.fl_alta = 1')
				->addWhere('m.id_local = ?', $id_local)
				->addWhere('m.id_filial = ?', $id_filial);

			$data = array();
			foreach ($query->execute() as $k) {
				$data[] = array(
					'code' => $k->id,
					'name' => $k->nm_moeda,
					'simbol' => $k->simbolo_moeda
				);
			}
			echo Zend_Json::encode(array('success'=> true, 'total' => $query->count(), 'data' => $data));
		}		
	}
	
	public function reportGetFilterAction () {
		$lang = DMG_Translate::getLang();
		preg_match_all('/r\_(\d+)/i', $this->getRequest()->getParam('id'), $id);
		$id = $id[1][0];
		$xml = glob(realpath(APPLICATION_PATH . '/../tomcat/Reports/report/xml-faturamento/') . DIRECTORY_SEPARATOR . '*.xml');
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
			echo Zend_Json::encode(array('success' => true, 'name' => $nome, 'titulo' => $titulo, 'descricao' => $descricao, 'data' => Khronos_FaturamentoReports::getFilterList($id)));
		}
	}
	public function reportExportAction () {
		preg_match_all('/r\_(\d+)/i', $this->getRequest()->getParam('report'), $id);
		$id = $id[1][0];
		$xml = glob(realpath(APPLICATION_PATH . '/../tomcat/Reports/report/xml-faturamento/') . DIRECTORY_SEPARATOR . '*.xml');
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
		$url = $this->view->baseUrl() . "/download.php?id=" . $id . "&tipo=report-faturamento&format=" . $format;
		foreach ($xml as $__k) {
			$k = simplexml_load_file($__k);
			if (reset($k->id) == $id) {
				if (!DMG_Acl::canAccess(reset($k->ruleID))) {
					continue;
				}
				foreach ($k->filtros->filtro as $l) {
					if ($l->tipo == 'data_inicial') {
						$url .= "&" . reset($l->nome) . "=" . $this->getRequest()->getParam(reset($l->nome));
					} else if ($l->tipo == 'data_final') {
						$url .= "&" . reset($l->nome) . "=" . $this->getRequest()->getParam(reset($l->nome));
					} else {
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
	public function reportGetComboAction () {
		$data = $this->getRequest()->getParam('data');
		preg_match_all('/r\_(\d+)/i', $this->getRequest()->getParam('report'), $id);
		$id = $id[1][0];
		$xml = glob(realpath(APPLICATION_PATH . '/../tomcat/Reports/report/xml-faturamento/') . DIRECTORY_SEPARATOR . '*.xml');
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
	protected function printListGrid ($exc, $maquinas, $dados, $id_fatura, $data, $simbolo_moeda) {
		$returnData = array();
		$total_oper_moeda = 0;
		foreach ($maquinas as $k) {
			$maquina = Doctrine::getTable('ScmMaquina')->findOneByNrSerieImob((string) $k);
			$excecao = 0;
			if (DMG_Config::get(17) != 'S' && $dados[$k]['jogando']) {
				$excecao = 2;
			}
			if ($dados[$k]['offline']) {
				$excecao = 3;
			}
			if ($dados[$k]['repetida']) {
				$excecao = 4;
			}
			if (!$dados[$k]) {
				$excecao = 5;
			}
			if ($maquina->ScmStatusMaquina->fl_permite_faturamento == 0) {
				$excecao = 6;
			}
			if ($maquina->dt_ultima_movimentacao > DMG_Date::now() || $maquina->dt_ultima_transformacao > DMG_Date::now() || $maquina->dt_ultimo_faturamento > DMG_Date::now() || $maquina->dt_ultimo_status > DMG_Date::now() || $maquina->dt_ultima_regularizacao > DMG_Date::now()) {
				$excecao = 7;
			}
			$dts = array();
			if ($excecao == 0) {
				$dts['total_entradas'] = ($dados[$k]['nr_cont_4'] - $maquina->nr_cont_4) * (float) $maquina->vl_credito;
				$dts['total_saidas'] = ($dados[$k]['nr_cont_3'] - $maquina->nr_cont_3) * $maquina->vl_credito;
				$dts['total_bruto'] = $dts['total_entradas'] - $dts['total_saidas'];
				$dts['pago_manual'] = ($dados[$k]['nr_cont_5'] - $maquina->nr_cont_5) * $maquina->vl_credito;
				$dts['percent_local'] = $maquina->percent_local;
				$dts['total_local'] = (($dts['total_entradas'] - $dts['total_saidas']) * ($dts['percent_local']/100)) + $dts['pago_manual'];
				$dts['total_operadora'] = (100-$dts['percent_local'])/100 * ($dts['total_entradas'] - $dts['total_saidas']);
				$total_oper_moeda += $dts['total_operadora'];
			 	$dts['total_operadora'] = Khronos_Moeda::format($dts['total_operadora']);
			 	$dts['total_local'] = Khronos_Moeda::format($dts['total_local']);
			 	$dts['total_bruto'] = Khronos_Moeda::format($dts['total_bruto']);
			}
			$returnData[] = array_merge($dts, array(
				'id' => $maquina->id,
				'nr_serie' => $maquina->nr_serie_imob,
				'nm_jogo' => $maquina->ScmJogo->nm_jogo,
				'id_excecao' => $excecao,
				'excecao' => Doctrine::getTable('ScmFaturaExcecaoTipo')->find($excecao)->nm_fatura_excecao_tipo,
				'percent_local' => $maquina->percent_local
			));
		}
		$response = array('success' => true, 'data' => $returnData,  'id_fatura' => $id_fatura, 'dt_fatura' => date('d/m/Y H:i', strtotime($data)), 'vl_fatura' => $simbolo_moeda . ' ' . Khronos_Moeda::format($total_oper_moeda));
		if (!$exc) {
			$response['message'] = DMG_Translate::_('faturamento.nenhuma_maquina');
			Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
		} else {
			Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
		}
		echo Zend_Json::encode($response);
		die();
	}
	protected function fillItemsAndExceptions (&$query, &$fDoc, $maquinas, $dados) {
		$temItems = false;
		foreach ($query->execute() as $k) {
			if (in_array($k->nr_serie_imob, $maquinas)) {
				$fExc = null;
				if (!$dados[$k->nr_serie_imob]) {
					// gera excecao de máquina não existente no XML
					$fExc = new ScmFaturaExcecao();
					$fExc->id_fatura_doc = $fDoc->id;
					$fExc->id_maquina = $k->id;
					$fExc->id_fatura_excecao_tipo = 5;
					$fExc->save();	
				} else if ($dados[$k->nr_serie_imob]['offline']) {
					// gera excecao de máquina offline
					$fExc = new ScmFaturaExcecao();
					$fExc->id_fatura_doc = $fDoc->id;
					$fExc->id_maquina = $k->id;
					$fExc->id_fatura_excecao_tipo = 3;
					$fExc->save();
				} else if (DMG_Config::get(17) != 'S' && $dados[$k->nr_serie_imob]['jogando']) {
					// gera excecao de máquina jogando
					$fExc = new ScmFaturaExcecao();
					$fExc->id_fatura_doc = $fDoc->id;
					$fExc->id_maquina = $k->id;
					$fExc->id_fatura_excecao_tipo = 2;
					$fExc->save();
				} else if ($dados[$k->nr_serie_imob]['repetida']) {
					// gera excecao de máquina repetida no XML
					$fExc = new ScmFaturaExcecao();
					$fExc->id_fatura_doc = $fDoc->id;
					$fExc->id_maquina = $k->id;
					$fExc->id_fatura_excecao_tipo = 4;
					$fExc->save();
				} else if ($k->ScmStatusMaquina->fl_permite_faturamento == 0) {
					// gera excecao de status nao permite faturamento
					$fExc = new ScmFaturaExcecao();
					$fExc->id_fatura_doc = $fDoc->id;
					$fExc->id_maquina = $k->id;
					$fExc->id_fatura_excecao_tipo = 6;
					$fExc->save();
				} else if ($k->dt_ultima_movimentacao > DMG_Date::now() || $k->dt_ultima_transformacao > DMG_Date::now() || $k->dt_ultimo_faturamento > DMG_Date::now() || $k->dt_ultimo_status > DMG_Date::now() || $k->dt_ultima_regularizacao > DMG_Date::now()) {
					// gera excecao de máquina com data de última interação no futuro
					$fExc = new ScmFaturaExcecao();
					$fExc->id_fatura_doc = $fDoc->id;
					$fExc->id_maquina = $k->id;
					$fExc->id_fatura_excecao_tipo = 7;
					$fExc->save();
				} else {
					$temItems = true;
					$fItem = new ScmFaturaItem();
					$fItem->id_fatura_doc = $fDoc->id;
					$fItem->vl_credito = $k->vl_credito;
					$fItem->nr_credito = $dados[$k->nr_serie_imob]['creditos'];
					$fItem->id_maquina = $k->id;
					$fItem->id_jogo = $k->id_jogo;
					$fItem->nr_versao_jogo = $k->nr_versao_jogo;
					$fItem->id_gabinete = $k->id_gabinete;
					$fItem->id_protocolo = $k->id_protocolo;
					$fItem->id_moeda = $k->id_moeda;
					$fItem->nr_cont_1 = $dados[$k->nr_serie_imob]['nr_cont_1'];
					$fItem->nr_cont_2 = $dados[$k->nr_serie_imob]['nr_cont_2'];
					$fItem->nr_cont_3 = $dados[$k->nr_serie_imob]['nr_cont_3'];
					$fItem->nr_cont_4 = $dados[$k->nr_serie_imob]['nr_cont_4'];
					$fItem->nr_cont_5 = $dados[$k->nr_serie_imob]['nr_cont_5'];
					$fItem->nr_cont_6 = $dados[$k->nr_serie_imob]['nr_cont_6'];
					$fItem->nr_cont_1_ant = $k->nr_cont_1;
					$fItem->nr_cont_2_ant = $k->nr_cont_2;
					$fItem->nr_cont_3_ant = $k->nr_cont_3;
					$fItem->nr_cont_4_ant = $k->nr_cont_4;
					$fItem->nr_cont_5_ant = $k->nr_cont_5;
					$fItem->nr_cont_6_ant = $k->nr_cont_6;
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
					$fItem->vl_bruto = $fItem->vl_dif_cont_4 - $fItem->vl_dif_cont_3;
					$fItem->vl_local = $fItem->vl_bruto * ($k->percent_local)/100;
					$fItem->vl_empresa = $fItem->vl_bruto - $fItem->vl_local;
					$fItem->percent_local = $k->percent_local;
					$fItem->dias_na_fatura = $k->dias_na_fatura;
					$fItem->save();
				}
			} else {
				// gera excecao de máquina não selecionada
				$fExc = new ScmFaturaExcecao();
				$fExc->id_fatura_doc = $fDoc->id;
				$fExc->id_maquina = $k->id;
				$fExc->id_fatura_excecao_tipo = 1;
				$fExc->save();
			}
		}
		return $temItems;
	}
	
	/**
	 * FUNÇÃO PARA CARREGAMENTO DOS DADOS PARA EDIÇÃO DE FATURA MANUAL
	 * Autor: Leonardo 21/06/2010
	 */
	public function loadFaturaAction(){
		try{
			if (!DMG_Acl::canAccess(91)) 
				throw new Exception(DMG_Translate::_('system.sem.permissao'));
				
			$id = (int) $this->getRequest()->getParam('id');
			
			$novaData = $this->getRequest()->getParam('novadata');
			if($novaData == "false") $novaData = false;
			if($novaData){
				$data = new Zend_Date($novaData, Zend_Date::ISO_8601);
				if($data->isLater(DMG_Date::now())) 
					throw new Exception(DMG_Translate::_('faturamento.ajuste.data.posterior'));
			}
			
			$fDoc = Doctrine_Query::create()
				->select("fd.*, fd.dt_fatura, TO_CHAR(fd.dt_fatura, 'DD/MM/YYYY') AS dt_fatura_formatada, TO_CHAR(fd.dt_fatura, 'HH24') AS hora, TO_CHAR(fd.dt_fatura, 'MI') AS minuto")
				->from('ScmFaturaDoc fd')
				->where('fd.id = ?', $id);
			
			$fDoc = $fDoc->fetchOne();
			
			if((int)$fDoc->id_fatura_doc_status != 1)
				throw new Exception(DMG_Translate::_('faturamento.fatura.editar.erro.not.temp'));
				
			if((int)$fDoc->id_origem != 2)
				throw new Exception(DMG_Translate::_('faturamento.fatura.editar.erro.not.temp'));
			
			$fatura = array(
				'local' => $fDoc->id_local,
				'filial' => $fDoc->id_filial,
				'parceiro' => $fDoc->id_parceiro,
				'dt_fatura' => $fDoc->dt_fatura_formatada,
				'moeda' => $fDoc->id_moeda,
				'simbolo_moeda' => $fDoc->ScmMoeda->simbolo_moeda,
				'hora' => $fDoc->hora,
				'minuto' => $fDoc->minuto
			);
			
			$fItems = Doctrine_Query::create()
				->select('fi.*, m.*, j.*')
				->addSelect('greatest(m.dt_ultima_movimentacao, m.dt_ultima_transformacao, m.dt_ultima_regularizacao, m.dt_ultimo_faturamento) AS maior_data')
				->addSelect("(CASE WHEN greatest(m.dt_ultima_movimentacao, m.dt_ultima_transformacao, m.dt_ultima_regularizacao, m.dt_ultimo_faturamento) >= '" . $fDoc->dt_fatura . "' THEN 0 ELSE 1 END) AS canmove")
				->addSelect("COALESCE(fi.percent_local, m.percent_local) as percent_local")
				->addSelect("COALESCE(fi.nr_cont_1_ant, m.nr_cont_1) as nr_cont_1_ant")
				->addSelect("COALESCE(fi.nr_cont_2_ant, m.nr_cont_2) as nr_cont_2_ant")
				->addSelect("COALESCE(fi.nr_cont_3_ant, m.nr_cont_3) as nr_cont_3_ant")
				->addSelect("COALESCE(fi.nr_cont_4_ant, m.nr_cont_4) as nr_cont_4_ant")
				->addSelect("COALESCE(fi.nr_cont_5_ant, m.nr_cont_5) as nr_cont_5_ant")
				->addSelect("COALESCE(fi.nr_cont_6_ant, m.nr_cont_6) as nr_cont_6_ant")
				->from('ScmFaturaItem fi')
				->innerJoin('fi.ScmMaquina m')
				->innerJoin('fi.ScmJogo j')
				->where('fi.id_fatura_doc = ?', $id);
			
			$maquinas_fatura = array();
			$maquinas_fatura_id = array();
			$total_fatura = 0;
			foreach ($fItems->execute() as $maquina) {
				$maquinas_fatura[] = array(
					"id" => $maquina->id_maquina,
					"nr_serie" => $maquina->ScmMaquina->nr_serie_imob,
					"nr_cont_1" => $maquina->nr_cont_1_ant,
					"nr_cont_2" => $maquina->nr_cont_2_ant,
					"nr_cont_3" => $maquina->nr_cont_3_ant,
					"nr_cont_4" => $maquina->nr_cont_4_ant,
					"nr_cont_5" => $maquina->nr_cont_5_ant,
					"nr_cont_6" => $maquina->nr_cont_6_ant,
					"nr_cont_1_new" => $maquina->nr_cont_1,
					"nr_cont_2_new" => $maquina->nr_cont_2,
					"nr_cont_3_new" => $maquina->nr_cont_3,
					"nr_cont_4_new" => $maquina->nr_cont_4,
					"nr_cont_5_new" => $maquina->nr_cont_5,
					"nr_cont_6_new" => $maquina->nr_cont_6,
					"nm_jogo" => $maquina->ScmJogo->nm_jogo,
					"percent_local" => $maquina->percent_local,
					"vl_credito" => $fDoc->ScmMoeda->simbolo_moeda . ' ' . Khronos_Moeda::format($maquina->vl_credito),
					"vl_bruto" => ($maquina->nr_cont_1 == NULL) ? NULL : Khronos_Moeda::format($maquina->vl_bruto),
					"vl_operadora" => ($maquina->nr_cont_1 == NULL) ? NULL : Khronos_Moeda::format($maquina->vl_empresa),
					"vl_local" => ($maquina->nr_cont_1 == NULL) ? NULL : Khronos_Moeda::format($maquina->vl_local),
					"dt_ultimo_contador" => $maquina->maior_data,
					"canmove" => $maquina->canmove
				);
				$maquinas_fatura_id[] = $maquina->id_maquina;
				$total_fatura = $total_fatura + $maquina->vl_empresa;
			}
			$fatura['total_fatura'] = Khronos_Moeda::format($total_fatura);
			
			$dbhandler = Doctrine_Manager::getInstance()->getCurrentConnection()->getDbh();
			$query = "SELECT
				md.tp_movimento,
				md.dt_movimentacao,
				md.id_local,
				md.id_filial,
				greatest(m.dt_ultima_movimentacao, m.dt_ultima_transformacao, m.dt_ultima_regularizacao, m.dt_ultimo_faturamento) AS maior_data,
				CASE WHEN greatest(m.dt_ultima_movimentacao, m.dt_ultima_transformacao, m.dt_ultima_regularizacao, m.dt_ultimo_faturamento) >= '" . $fDoc->dt_fatura . "' THEN 0 ELSE 1 END AS canmove,
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
					AND md2.dt_movimentacao <=  '" . $fDoc->dt_fatura . "'
				)
				AND md.tp_movimento = 'E'
			";
			$query .= " AND md.id_local = " . $fDoc->id_local;
			$query .= " AND md.id_filial = " . $fDoc->id_filial; 
			$query .= " AND m.id_moeda = " . $fDoc->id_moeda;
			
			if ((int)$fDoc->id_parceiro > 0) {
				$query .= " AND md.id_parceiro = " . $fDoc->id_parceiro;
			}
			
			if(count($maquinas_fatura_id)>0)
				$query .= " AND m.id NOT IN (" . implode(',',$maquinas_fatura_id) . ") ";
			
			$query .= " ORDER BY m.nr_serie_imob";
			$result = $dbhandler->query($query);
			
			$maquinasInstaladas = array();
			foreach ($result as $k) {
				$maquinasInstaladas[] = array(
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
			
			/*
			 * 
			 * CASO A DATA SEJA DIFERENTE DE false FAZER UMA VERIFICAÇÃO NAS MAQUINAS QUE ESTÃO NA FATURA MAS NÃO PODERIAM ESTAR NESTA DATA
			 */
			$maquinasExcluidas = array();
			if(($novaData) && (count($maquinas_fatura_id)>0)){
				$dbhandler = Doctrine_Manager::getInstance()->getCurrentConnection()->getDbh();
				$query = "SELECT DISTINCT
					md.tp_movimento,
					md.id_local,
					md.id_filial,
					greatest(m.dt_ultima_movimentacao, m.dt_ultima_transformacao, m.dt_ultima_regularizacao, m.dt_ultimo_faturamento) AS maior_data,
					CASE WHEN greatest(m.dt_ultima_movimentacao, m.dt_ultima_transformacao, m.dt_ultima_regularizacao, m.dt_ultimo_faturamento) >= '" . $novaData . "' THEN 0 ELSE 1 END AS canmove,
					CASE WHEN md.id_parceiro is null THEN 0 else md.id_parceiro END as id_parceiro,
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
					AND m.id_moeda = mo.id ";
					/*"AND md.dt_movimentacao = (
						SELECT max(md2.dt_movimentacao)
						FROM scm_movimentacao_doc md2, scm_movimentacao_item mi2
						WHERE md2.id = mi2.id_movimentacao_doc
						AND md2.id_local = md.id_local
						AND md2.id_filial = md.id_filial
						AND CASE WHEN md2.id_parceiro is null THEN 0 else md2.id_parceiro END = CASE WHEN md.id_parceiro is null THEN 0 else md.id_parceiro END
						AND mi2.id_maquina = mi.id_maquina
						AND md2.dt_movimentacao >=  '" . $novaData . "'
					)";*/
				
				$query .= " AND md.tp_movimento = 'E'
				";
				$query .= " AND md.id_local = " . $fDoc->id_local;
				$query .= " AND md.id_filial = " . $fDoc->id_filial; 
				$query .= " AND m.id_moeda = " . $fDoc->id_moeda;
				
				if ((int)$fDoc->id_parceiro > 0) {
					$query .= " AND md.id_parceiro = " . $fDoc->id_parceiro;
				}
				
				if(count($maquinas_fatura_id)>0)
					$query .= " AND m.id IN (" . implode(',',$maquinas_fatura_id) . ") ";
				
				$query .= " ORDER BY m.nr_serie_imob";
				
				$result = $dbhandler->query($query);
				
				foreach ($result as $k) {
					if(((int) $k['canmove']) != 1){
						$maquinasExcluidas[] = array(
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
							'canmove' => (int) $k['canmove']
						);
					}
				}
			}
			
			if(($novaData) && (count($maquinasExcluidas) == 0)){
				$this->mudaDataFatura($fDoc->id, $novaData);
				$this->_forward('load-fatura', null, null, array('id' => $fDoc->id, 'novadata' => 'false'));
				return;
			}
			
			$this->_helper->json(array(
				'success' => true,
				'fatura' => $fatura,
				'maquinas_fatura' => $maquinas_fatura,
				'maquinas_instaladas' => $maquinasInstaladas,
				'maquinas_excluidas' => $maquinasExcluidas
			));
		}
		catch (Exception $e){
			$this->_helper->json(array('success' => false, 'errormsg' => $e->getMessage()));
		}
	}
	
	public function alteraDataFaturaAction(){
		try{
			if (!DMG_Acl::canAccess(91)) 
				throw new Exception(DMG_Translate::_('system.sem.permissao'));
				
			$id = (int) $this->getRequest()->getParam('id');
			
			$novaData = $this->getRequest()->getParam('novadata');
			if($novaData == "false") $novaData = false;
			
			$this->mudaDataFatura($id, $novaData);
			$this->_helper->json(array('success' => true));
		}
		catch (Exception $e){
			$this->_helper->json(array('success' => false, 'errormsg' => $e->getMessage()));
		}
	}
	
	private function mudaDataFatura($id, $novaData){	    
		try{			
			Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();

			$fDoc = Doctrine::getTable('ScmFaturaDoc')->find($id);
			$fDoc->dt_fatura = $novaData;
			
			if ($fDoc->id_fatura_doc_status != 1) {
				throw new Exception(DMG_Translate::_('faturamento.erro.fatura.confirmada'));
			}
			
			
			$fDoc->save();
			
			$fItems = Doctrine_Query::create()
				->from('ScmFaturaItem fi')
				->where('fi.id_fatura_doc = ?', $fDoc->id);
			
			$maquinas_fatura_id = array();
			foreach ($fItems->execute() as $item) {
				$maquinas_fatura_id[] = $item->id_maquina;
			}
			if(count($maquinas_fatura_id)>0){
				$dbhandler = Doctrine_Manager::getInstance()->getCurrentConnection()->getDbh();
				$query = "SELECT
					md.tp_movimento,
					md.dt_movimentacao,
					md.id_local,
					md.id_filial,
					greatest(m.dt_ultima_movimentacao, m.dt_ultima_transformacao, m.dt_ultima_regularizacao, m.dt_ultimo_faturamento) AS maior_data,
					CASE WHEN greatest(m.dt_ultima_movimentacao, m.dt_ultima_transformacao, m.dt_ultima_regularizacao, m.dt_ultimo_faturamento) >= '" . $novaData . "' THEN 0 ELSE 1 END AS canmove,
					CASE WHEN md.id_parceiro is null THEN 0 else md.id_parceiro END as id_parceiro,
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
					AND m.id_moeda = mo.id";
				
					/*"
					AND md.dt_movimentacao = (
						SELECT max(md2.dt_movimentacao)
						FROM scm_movimentacao_doc md2, scm_movimentacao_item mi2
						WHERE md2.id = mi2.id_movimentacao_doc
						AND md2.id_local = md.id_local
						AND md2.id_filial = md.id_filial
						AND CASE WHEN md2.id_parceiro is null THEN 0 else md2.id_parceiro END = CASE WHEN md.id_parceiro is null THEN 0 else md.id_parceiro END
						AND mi2.id_maquina = mi.id_maquina
						AND md2.dt_movimentacao <=  '" . $novaData . "'
					)";*/
				
				$query .= " AND md.tp_movimento = 'E'
				";
				$query .= " AND md.id_local = " . $fDoc->id_local;
				$query .= " AND md.id_filial = " . $fDoc->id_filial; 
				$query .= " AND m.id_moeda = " . $fDoc->id_moeda;
				
				if ((int)$fDoc->id_parceiro > 0) {
					$query .= " AND md.id_parceiro = " . $fDoc->id_parceiro;
				}
				$query .= " AND m.id IN (" . implode(',',$maquinas_fatura_id) . ") ";
	
				$result = $dbhandler->query($query);
				
				foreach ($result as $k) {
					if(((int) $k['canmove']) != 1){
						$query = Doctrine_Query::create()
						    ->delete('ScmFaturaItem fi')
						    ->where('fi.id_maquina = ?', $k['id_maquina'])
						    ->addWhere('fi.id_fatura_doc = ?', $fDoc->id);
				    	$rows = $query->execute();
					}
				}
			}
			Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
		}
		catch (Exception $e){
			Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
			$this->_helper->json(array('success' => false, 'errormsg' => $e->getMessage()));
		}
	}
}