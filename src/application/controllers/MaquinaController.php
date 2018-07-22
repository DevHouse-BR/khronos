<?php

class MaquinaController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(25)) {
			$query = Doctrine_Query::create()->from('ScmMaquina m');
			$query->innerJoin('m.ScmStatusMaquina s')->addWhere('s.fl_alta = ?', (int) $this->getRequest()->getParam('status'));
			$limit = (int) $this->getRequest()->getParam('limit');
			if ($limit > 0) {
				$query->limit($limit);
			}
			$offset = (int) $this->getRequest()->getParam('start');
			if ($offset > 0) {
				$query->offset($offset);
			}
			$sort = (string) $this->getRequest()->getParam('sort');
			$dir = (string) $this->getRequest()->getParam('dir');
			if ($sort && ($dir == 'ASC' || $dir == 'DESC')) {
				$query->orderby($sort . ' ' . $dir);
			}
			$filter = $this->getRequest()->getParam('filter');
			if (is_array($filter)) {
				foreach ($filter as $k) {
					switch ($k['data']['type']) {
						case 'string':
							$query->addWhere($k['field'] . ' ILIKE ?', '%' . $k['data']['value'] . '%');
						break;
						case 'list':
							$l = explode(',', $k['data']['value']);
							foreach ($l as $m) {
								$query->orWhere($k['field'] . ' = ?', $m);
							}
						break;
					}
				}
			}
			$query->innerJoin('m.ScmFilial f')->innerJoin('f.ScmEmpresa e')->innerJoin('e.ScmUserEmpresa ue')->addWhere('ue.user_id = ' . Zend_Auth::getInstance()->getIdentity()->id);
			$data = array();
			foreach ($query->execute() as $k) {
				$data[] = array(
					'id' => $k->id,
					'nr_serie_imob' => $k->nr_serie_imob,
					'nr_serie_connect' => $k->nr_serie_connect,
					'nr_serie_aux' => $k->nr_serie_aux,
					'nm_jogo' => $k->ScmJogo->nm_jogo,
					'nm_filial' => $k->ScmFilial->nm_filial,
					'nm_local' => $k->ScmLocal->nm_local,
					'nm_parceiro' => $k->ScmParceiro->nm_parceiro,
					'simbolo_moeda' => $k->ScmMoeda->simbolo_moeda,
					'nm_status_maquina' => $k->ScmStatusMaquina->nm_status_maquina,
					'vl_credito' => $k->vl_credito,
					'nr_cont_1' => $k->nr_cont_1,
					'nr_cont_2' => $k->nr_cont_2,
					'nr_cont_3' => $k->nr_cont_3,
					'nr_cont_4' => $k->nr_cont_4,
					'nr_cont_5' => $k->nr_cont_5,
					'nr_cont_6' => $k->nr_cont_6,
				);
			}
			echo Zend_Json::encode(array('total' => $query->count(), 'data' => $data));
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(26)) {
			$obj = Doctrine::getTable('ScmMaquina')->find((int) $this->getRequest()->getParam('id'));
			if ($obj) {
				foreach ($obj->ScmFilial->ScmEmpresa->ScmUserEmpresa as $k) {
					if ($k->user_id == Zend_Auth::getInstance()->getIdentity()->id) {
						$data = new Zend_Date($obj->dt_cadastro);
						echo Zend_Json::encode(array('success' => true, 'data' => array(
							'id' => $obj->id,
							'dt_cadastro' => $data->toString('dd/MM/YYYY'),
							'hora' => $data->toString('HH'),
							'minuto' => $data->toString('mm'),
							'id_filial' => $obj->id_filial,
							'id_parceiro' => $obj->id_parceiro,
							'id_local' => $obj->id_local,
							'nr_serie_imob' => $obj->nr_serie_imob,
							'nr_serie_connect' => $obj->nr_serie_connect,
							'nr_serie_aux' => $obj->nr_serie_aux,
							'id_jogo' => $obj->id_jogo,
							'nr_versao_jogo' => $obj->nr_versao_jogo,
							'id_gabinete' => $obj->id_gabinete,
							'vl_credito' => $obj->vl_credito,
							'id_protocolo' => $obj->id_protocolo,
							'nr_cont_1' => $obj->nr_cont_1,
							'nr_cont_2' => $obj->nr_cont_2,
							'nr_cont_3' => $obj->nr_cont_3,
							'nr_cont_4' => $obj->nr_cont_4,
							'nr_cont_5' => $obj->nr_cont_5,
							'nr_cont_6' => $obj->nr_cont_6,
							'nr_cont_1_parcial' => $obj->nr_cont_1_parcial,
							'nr_cont_2_parcial' => $obj->nr_cont_2_parcial,
							'nr_cont_3_parcial' => $obj->nr_cont_3_parcial,
							'nr_cont_4_parcial' => $obj->nr_cont_4_parcial,
							'nr_cont_5_parcial' => $obj->nr_cont_5_parcial,
							'nr_cont_6_parcial' => $obj->nr_cont_6_parcial,
						)));
						return;
					}
				}
			}
		}
	}
	public function contadoresAction () {
		if (DMG_Acl::canAccess(27)) {
			try {
				$nr_serie = $this->getRequest()->getParam('nr_serie');
				$local = $this->getRequest()->getParam('local');
				$protocolo = $this->getRequest()->getParam('protocolo');
				$servidor = Doctrine_Query::create()->from('ScmLocalServer')->addWhere('id_local = ?', $local)->addWhere('id_protocolo = ?', $protocolo)->fetchOne();
				if (!$servidor) {
					throw new Exception(DMG_Translate::_('busca_contadores.servidor_inexistente'));
				}
				$data = Khronos_Servidor::getContadores($nr_serie, $servidor);
				if ($data['offline'] == 1) {
					throw new Exception(DMG_Translate::_('parque.maquina.busca_contadores.offline'));
				}
				if ($data['creditos'] > DMG_Config::get(12)) {
					throw new Exception(DMG_Translate::_('parque.maquina.busca_contadores.jogando'));
				}
				echo Zend_Json::encode(array(
					'success' => true,
					'nr_cont_1' => $data['nr_cont_1'],
					'nr_cont_2' => $data['nr_cont_2'],
					'nr_cont_3' => $data['nr_cont_3'],
					'nr_cont_4' => $data['nr_cont_4'],
					'nr_cont_5' => $data['nr_cont_5'],
					'nr_cont_6' => $data['nr_cont_6'],
					'nr_cont_1_parcial' => $data['nr_cont_1_parcial'],
					'nr_cont_2_parcial' => $data['nr_cont_2_parcial'],
					'nr_cont_3_parcial' => $data['nr_cont_3_parcial'],
					'nr_cont_4_parcial' => $data['nr_cont_4_parcial'],
					'nr_cont_5_parcial' => $data['nr_cont_5_parcial'],
					'nr_cont_6_parcial' => $data['nr_cont_6_parcial'],
				));
			} catch (Exception $e) {
				echo Zend_Json::encode(array('erro' => true, 'message' => $e->getMessage()));
				return;
			}
		}
	}
	public function saveAction () {
		$id = (int) $this->getRequest()->getParam('id');
		if ($id > 0) {
			if (DMG_Acl::canAccess(26)) {
				$obj = Doctrine::getTable('ScmMaquina')->find($id);
				if (!$obj) {
					echo Zend_Json::encode(array());
				} else {
					$error = $this->fillAndValidate($obj, $id);
					if (!count($error)) {
						Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
						try {
							$obj->save();
							Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
							echo Zend_Json::encode(array('success' => true));
						} catch (Exception $e) {
							Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
							echo Zend_Json::encode(array('failure' => true, 'message' => $e->getMessage()));
						}
					} else {
						echo Zend_Json::encode(array('success' => false, 'errors' => $error));
					}
				}
			}
		} else {
			if (DMG_Acl::canAccess(27)) {
				$obj = new ScmMaquina();
				$error = $this->fillAndValidate($obj, $id);
				if (!count($error)) {
					try {
						$obj->save();
						echo Zend_Json::encode(array('success' => true));
					} catch (Exception $e) {
						echo Zend_Json::encode(array('failure' => true, 'message' => $e->getMessage()));
					}
				} else {
					echo Zend_Json::encode(array('success' => false, 'errors' => $error));
				}
			}
		}
	}
	protected function fillAndValidate (&$obj, $id) {
		$error = array();
		// nr_serie_connect
		try {
			$obj->nr_serie_connect = $this->getRequest()->getParam('nr_serie_connect');
		} catch (Exception $e) {
			$error['nr_serie_connect'] = DMG_Translate::_('parque.maquina.form.nr_serie_connect.invalid');
		}
		// nr_serie_aux
		try {
			$obj->nr_serie_aux = $this->getRequest()->getParam('nr_serie_aux');
		} catch (Exception $e) {
			$error['nr_serie_aux'] = DMG_Translate::_('parque.maquina.form.nr_serie_aux.invalid');
		}
		if (!$id) {
			$obj->id_local = $this->getRequest()->getParam('id_local');
		}
		try {
			$nrq = Doctrine_Query::create()->from('ScmMaquina')->addWhere('nr_serie_connect = ?', $obj->nr_serie_connect)
				->addWhere('id_local = ?', $obj->id_local);
			if ($id) {
				$nrq->addWhere('id <> ?', $obj->id);
			}
			if ($nrq->count()) {
				throw new Exception();
			}
		} catch (Exception $e) {
			$error['nr_serie_connect'] = DMG_Translate::_('parque.maquina.nr_serie_connect.repeaterror');
		}
		if (!$id) {
			// id_local
			try {
				if (!Doctrine::getTable('ScmLocal')->find($obj->id_local)) {
					throw new Exception();
				}
			} catch (Exception $e) {
				$error['id_local'] = DMG_Translate::_('parque.maquina.form.id_local.invalid');
			}
			
			// nr_serie_imob
			try {
				$obj->nr_serie_imob = strtoupper($this->getRequest()->getParam('nr_serie_imob'));
				$qr1 = Doctrine_Query::create()->from('ScmMaquina')->addWhere('nr_serie_imob = ?', $obj->nr_serie_imob);
				if ($id > 0) {
					$qr1->addWhere('id <> ?', $id);
				}
				if ($qr1->count()) {
					throw new Exception('ja existe');
				}
			} catch (Exception $e) {
				$error['nr_serie_imob'] = DMG_Translate::_('parque.maquina.form.nr_serie_imob.invalid');
			}
			// id_filial
			try {
				$obj->id_filial = $this->getRequest()->getParam('id_filial');
				if (!Doctrine::getTable('ScmFilial')->find($obj->id_filial)) {
					throw new Exception();
				}
				$empresas = Doctrine_Query::create()->from('ScmFilial f')->innerJoin('f.ScmEmpresa e')->innerJoin('e.ScmUserEmpresa ue')->addWhere('ue.user_id = ' . Zend_Auth::getInstance()->getIdentity()->id)->addWhere('f.id = ?', $obj->id_filial);
				if($empresas->count() == 0) {
					throw new Exception();
				}
			} catch (Exception $e) {
				$error['id_filial'] = DMG_Translate::_('parque.maquina.form.id_filial.invalid');
			}
			// id_parceiro
			try {
				$obj->id_parceiro = (int) $this->getRequest()->getParam('id_parceiro');
				if ($obj->id_parceiro > 0) {
					$parceiro = Doctrine::getTable('ScmParceiro')->find($obj->id_parceiro);
					if (!$parceiro) {
						throw new Exception('1');
					}
					$empresas = Doctrine_Query::create()->from('ScmParceiro p')->innerJoin('p.ScmEmpresa e')->innerJoin('e.ScmUserEmpresa ue')->addWhere('ue.user_id = ' . Zend_Auth::getInstance()->getIdentity()->id)->addWhere('p.id = ?', $parceiro->id);
					if($empresas->count() == 0) {
						throw new Exception('2');
					}
				} else {
					$obj->id_parceiro = null;
				}
			} catch (Exception $e) {
				$error['id_parceiro'] = $e->getMessage() . DMG_Translate::_('parque.maquina.form.id_parceiro.invalid');
			}
			// id_jogo
			try {
				$obj->id_jogo = $this->getRequest()->getParam('id_jogo');
				if (!Doctrine::getTable('ScmJogo')->find($obj->id_jogo)) {
					throw new Exception();
				}
			} catch (Exception $e) {
				$error['id_jogo'] = DMG_Translate::_('parque.maquina.form.id_jogo.invalid');
			}
			// id_moeda
			try {
				$obj->id_moeda = $this->getRequest()->getParam('id_moeda');
				if (!Doctrine::getTable('ScmMoeda')->find($obj->id_moeda)) {
					throw new Exception();
				}
			} catch (Exception $e) {
				$error['id_moeda'] = DMG_Translate::_('parque.maquina.form.id_moeda.invalid');
			}
			// id_protocolo
			try {
				$obj->id_protocolo = $this->getRequest()->getParam('id_protocolo');
				if (!Doctrine::getTable('ScmProtocolo')->find($obj->id_protocolo)) {
					throw new Exception();
				}
			} catch (Exception $e) {
				$error['id_protocolo'] = DMG_Translate::_('parque.maquina.form.id_protocolo.invalid');
			}
			// nr_versao_jogo
			try {
				$obj->nr_versao_jogo = $this->getRequest()->getParam('nr_versao_jogo');
			} catch (Exception $e) {
				$error['nr_versao_jogo'] = DMG_Translate::_('parque.maquina.form.nr_versao_jogo.invalid');
			}
			// vl_credito
			try {
				$obj->vl_credito = str_replace(",", ".", $this->getRequest()->getParam('vl_credito'));
				$v2 = new Zend_Validate_Float();
				if (!$v2->isValid($obj->vl_credito)) {
					throw new Exception();
				}
			} catch (Exception $e) {
				$error['vl_credito'] = DMG_Translate::_('parque.maquina.form.vl_credito.invalid');
			}
			// dt_cadastro
			try {
				$dt_cadastro = new Zend_Date($this->getRequest()->getParam('dt_cadastro'));
				$dt_cadastro->set($this->getRequest()->getParam('hora'), Zend_Date::HOUR);
				$dt_cadastro->set($this->getRequest()->getParam('minuto'), Zend_Date::MINUTE);
				$dt_cadastro->set(0, Zend_Date::SECOND);
				$obj->dt_cadastro = $dt_cadastro->toString('YYYY-MM-dd HH:mm:ss');
				$now = new Zend_Date(time());
				if ($dt_cadastro->get(Zend_Date::TIMESTAMP) > $now->get(Zend_Date::TIMESTAMP)) {
					throw new Exception();
				}
			} catch (Exception $e) {
				$error['minuto'] = DMG_Translate::_('parque.maquina.form.dt_cadastro.invalid');
			}
			// id_gabinete
			try {
				$obj->id_gabinete = $this->getRequest()->getParam('id_gabinete');
				if (!Doctrine::getTable('ScmGabinete')->find($obj->id_gabinete)) {
					throw new Exception();
				}
			} catch (Exception $e) {
				$error['id_gabinete'] = DMG_Translate::_('parque.maquina.form.id_gabinete.invalid');
			}
			$notEmpty = new Zend_Validate_NotEmpty();
			$Int = new Zend_Validate_Int();
			$cont = explode(",", DMG_Config::get(4));
			for ($i = 1; $i <= 6; $i++) {
				$_nm = 'nr_cont_' . $i;
				try {
					if (in_array($i, $cont)) {
						if (!$notEmpty->isValid($this->getRequest()->getParam($_nm))) {
							throw new Exception(DMG_Translate::_('parque.transformacao.form.contador.empty'));
						}
					}
					if ($notEmpty->isValid($this->getRequest()->getParam($_nm))) {
						if (!$Int->isValid($this->getRequest()->getParam($_nm))) {
							throw new Exception(DMG_Translate::_('parque.transformacao.form.contador.string'));
						}
						$obj->$_nm = (int) $this->getRequest()->getParam($_nm);
					}
					if ($obj->$_nm < 0) {
						throw new Exception(DMG_Translate::_('parque.maquina.contadores-negativos'));
					}
				} catch (Exception $e) {
					$error[$_nm] = $e->getMessage();
				}
			}
			for ($i = 1; $i <= 6; $i++) {
				$_nm = 'nr_cont_' . $i . '_parcial';
				if ($notEmpty->isValid($this->getRequest()->getParam($_nm))) {
					if (!$Int->isValid($this->getRequest()->getParam($_nm))) {
						throw new Exception(DMG_Translate::_('parque.transformacao.form.contador.string'));
					}
					$obj->$_nm = (int) $this->getRequest()->getParam($_nm);
				}
			}
			$obj->id_usuario = Zend_Auth::getInstance()->getIdentity()->id;
		}
		return $error;
	}
}