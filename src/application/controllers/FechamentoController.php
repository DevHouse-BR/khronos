<?php

class FechamentoController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(32) || DMG_Acl::canAccess(33)) {
			$query = Doctrine_Query::create()->from('ScmFechamentoDoc');
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
			$data = array();
			foreach ($query->execute() as $k) {
				$diff4 = $diff3 = $diff1 = $diff2 = 0;
				foreach ($k->ScmFechamentoItem as $l) {
					$diff4 += $l->nr_dif_cont_4;
					$diff3 += $l->nr_dif_cont_3;
					$diff1 += $l->nr_dif_cont_1;
					$diff2 += $l->nr_dif_cont_2;
				}
				$data[] = array(
					'id' => $k->id,
					'id_origem' => $k->id_origem,
					'dt_fechamento' => $k->dt_fechamento,
					'id_status_fechamento_doc' => $k->ScmStatusFechamentoDoc->nm_status_fechamento_doc,
					'diff_cont_4' => $diff4,
					'diff_cont_3' => $diff3,
					'diff_cont_1' => $diff1,
					'diff_cont_2' => $diff2,
				);
			}
			echo Zend_Json::encode(array('total' => $query->count(), 'data' => $data));
		}
	}
	public function executeAction () {
		if (DMG_Acl::canAccess(33)) {
			try {
				$addr = @fsockopen(DMG_Config::get(7), DMG_Config::get(9), $errno, $errstr, DMG_Config::get(10));
				if ($errno != 0) {
					throw new Exception(DMG_Translate::_('parque.fechamento.xml.errno.1'));
				}
				fwrite($addr, "GET /machines HTTP/1.1\r\nHost: " . DMG_Config::get(7) . "\r\nConnection: Close\r\n\r\n");
				$xml = null;
				$header = null;
				do {
					$header .= fgets($addr);
				} while(strpos($header, "\r\n\r\n") === false);
				while (!feof($addr)) {
					$xml .= fgets($addr);
				}
				fclose($addr);
				if (preg_match("/200 OK/", $header) !== 1) {
					throw new Exception(DMG_Translate::_('parque.fechamento.xml.errno.2'));
				}
				$xml = preg_replace('/<machine name="(\w+)">0<jogo>/', '<machine name="$1"><jogo>', $xml);
				$xml = simplexml_load_string($xml);
				if (count($xml) == 0) {
					throw new Exception(DMG_Translate::_('parque.fechamento.xml.errno.3'));
				}
				$offline = $jogando = array();
				$maquinas = Doctrine::getTable('ScmMaquina')->findAll();
				foreach ($maquinas as $maquina) {
					$i = 0;
					foreach ($xml as $k) {
						if (reset($k->attributes()->name) == $maquina->nr_serie_connect) {
							if (reset($k->offline) == 1) {
								$offline[] = $maquina->nr_serie_imob;
							}
							if (reset($k->offline) == 0 && reset($k->creditos)*$maquina->vl_credito > DMG_Config::get(12)) {
								$jogando[] = $maquina->nr_serie_imob;
							}
							continue 2;
						}
					}
					$offline[] = $maquina->nr_serie_imob;
				}
				if ($this->getRequest()->getParam('ignora') == 1) {
					$offline = array();
				}
				if ($this->getRequest()->getParam('ignora') == 2) {
					$offline = $jogando = array();
				}
				if (count($offline) > 0) {
					echo Zend_Json::encode(array('offline' => true, 'message' => implode("; ", $offline)));
					return;
				}
				if (count($jogando) > 0) {
					echo Zend_Json::encode(array('jogando' => true, 'message' => implode("; ", $jogando)));
					return;
				}
				if (count($offline) == 0 || count($jogando) == 0) {
					try {
						Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
						$fDoc = new ScmFechamentoDoc();
						$fDoc->id_origem = 1;
						$fDoc->id_filial = 1;
						$fDoc->id_local = DMG_Config::get(5);
						$fDoc->id_usuario = Zend_Auth::getInstance()->getIdentity()->id;
						$fDoc->id_status_fechamento_doc = 9;
						$fDoc->dt_fechamento = DMG_Date::now();
						$fDoc->save();
						foreach ($xml as $k) {
							$maquina = Doctrine::getTable('ScmMaquina')->findOneByNrSerieConnect(reset($k->attributes()->name));
							if ($maquina) {
								if ($maquina->ScmStatusMaquina->fl_alta == 0) {
									continue;
								}
								$fItem = new ScmFechamentoItem();
								$fItem->id_fechamento_doc = $fDoc->id;
								$fItem->id_maquina = $maquina->id;
								$fItem->vl_credito = $maquina->vl_credito;
								$fItem->id_moeda = $maquina->id_moeda;
								$fItem->id_jogo = $maquina->id_jogo;
								$fItem->nr_cont_1 = reset($k->c1);
								$fItem->nr_cont_2 = reset($k->c2);
								$fItem->nr_cont_3 = reset($k->ds1) + reset($k->ds2);
								$fItem->nr_cont_4 = reset($k->di);
								$fItem->nr_cont_1_ant = $maquina->nr_cont_1;
								$fItem->nr_cont_2_ant = $maquina->nr_cont_2;
								$fItem->nr_cont_3_ant = $maquina->nr_cont_3;
								$fItem->nr_cont_4_ant = $maquina->nr_cont_4;
								$fItem->nr_dif_cont_1 = reset($k->c1) - $maquina->nr_cont_1; 
								$fItem->nr_dif_cont_2 = reset($k->c2) - $maquina->nr_cont_2; 
								$fItem->nr_dif_cont_3 = reset($k->ds1) + reset($k->ds2) - $maquina->nr_cont_3; 
								$fItem->nr_dif_cont_4 = reset($k->di) - $maquina->nr_cont_4; 
								$fItem->vl_dif_cont_1 = $fItem->nr_dif_cont_1 * $fItem->vl_credito;
								$fItem->vl_dif_cont_2 = $fItem->nr_dif_cont_2 * $fItem->vl_credito;
								$fItem->vl_dif_cont_3 = $fItem->nr_dif_cont_3 * $fItem->vl_credito;
								$fItem->vl_dif_cont_4 = $fItem->nr_dif_cont_4 * $fItem->vl_credito;
								$fItem->save();
							}
						}
						Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
						echo Zend_Json::encode(array('success' => true, 'id' => $fDoc->id, 'data' => $fDoc->dt_fechamento, 'local' => 'nome do local'));
						return;
					} catch (Exception $e) {
						Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
						throw new Exception(DMG_Translate::_('parque.fechamento.xml.errno.4'));
					}
				}
			} catch (Exception $e) {
				echo Zend_Json::encode(array('failure' => true, 'message' => $e->getMessage()));
				return;
			}
		}
	}
	public function downloadAction () {
		if (DMG_Acl::canAccess(32) || DMG_Acl::canAccess(33)) {
			$relatorio = Doctrine::getTable('ScmFechamentoDoc')->find((int) $this->getRequest()->getParam('id'));
			if ($relatorio) {
				$addr = @fsockopen(DMG_Config::get(8), DMG_Config::get(11), $errno, $errstr, DMG_Config::get(10));
				if ($errno != 0) {
					echo $errno . $errsrt;
				}
				$url = '/Reports/run?__report=report/Fechamento.rptdesign&__format=pdf&id=' . urlencode($relatorio->id) . '&data=' . urlencode($relatorio->dt_fechamento) . '&local=' . urlencode($relatorio->ScmLocal->nm_local);
				fwrite($addr, "GET " . $url . " HTTP/1.0\r\nHost: " . DMG_Config::get(8) . "\r\nConnection: Close\r\n\r\n");
				$xml = null;
				$header = null;
				do {
					$header .= fgets($addr);
				} while(strpos($header, "\r\n\r\n") === false);
				while (!feof($addr)) {
					$xml .= fgets($addr);
				}
				file_put_contents('log.txt', $xml);
				fclose($addr);
				if (preg_match("/200 OK/", $header) !== 1) {
					return;
				}
				$this->_helper->viewRenderer->setNoRender(true);
				$this->getResponse()->setHeader('Content-Disposition', 'attachment; filename=Fechamento.pdf');
				$this->getResponse()->setHeader('Content-type', 'application/pdf');
				$this->getResponse()->setHeader('Cache-Control', 'private');
				$this->getResponse()->setBody($xml);
			}
		}
	}
}