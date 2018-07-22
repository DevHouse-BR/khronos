<?php

class ConsultaParqueController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function getAction () {
		if (DMG_Acl::canAccess(30)) {
			try {
				$addr = @fsockopen(DMG_Config::get(7), DMG_Config::get(9), $errno, $errstr, DMG_Config::get(10));
				if ($errno != 0) {
					throw new Exception(DMG_Translate::_('parque.consulta.xml.errno.1'));
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
					throw new Exception(DMG_Translate::_('parque.consulta.xml.errno.2'));
				}
				$xml = preg_replace('/<machine name="(\w+)">0<jogo>/', '<machine name="$1"><jogo>', $xml);
				$xml = simplexml_load_string($xml);
				if (count($xml) == 0) {
					throw new Exception(DMG_Translate::_('parque.consulta.xml.errno.3'));
				}
				$data = array();
				foreach ($this->getRequest()->getParam('id') as $k) {
					$maquina = Doctrine::getTable('ScmMaquina')->find($k);
					if (!$maquina) {
						throw new Exception(DMG_Translate::_('parque.consulta.xml.errno.4'));
					}
					for ($i = 0; $i < count($xml); $i++) {
						if ($xml->machine[$i]->attributes()->name[0] == $maquina->nr_serie_connect) {
							$a = $xml->machine[$i]->children();
							if (reset($xml->machine[$i]->offline) == 1) {
								$online = false;
							} else {
								$online = true;
							}
							$data[] = array(
								'id' => (string) $maquina->id,
								'online' => (string) ($online ? (reset($xml->machine[$i]->creditos) > 0 ? 3 : 1) : 2),
								'nr_cont_1' => (string) reset($xml->machine[$i]->c1),
								'nr_cont_2' => (string) reset($xml->machine[$i]->c2),
								'nr_cont_3' => (string) reset($xml->machine[$i]->ds1) + reset($xml->machine[$i]->ds2),
								'nr_cont_4' => (string) reset($xml->machine[$i]->di),
								'nr_cont_1_parcial' => (string) reset($xml->machine[$i]->c1_parcial),
								'nr_cont_2_parcial' => (string) reset($xml->machine[$i]->c2_parcial),
								'nr_cont_3_parcial' => (string) reset($xml->machine[$i]->ds_parcial),
								'nr_cont_4_parcial' => (string) reset($xml->machine[$i]->di_parcial),
							);
							break;
						}
					}
					if ($i == count($xml)) {
						$data[] = array(
							'id' => $maquina->id,
							'online' => 0,
						);
					}
				}
				echo Zend_Json::encode(array('success' => true, 'data' => $data));
			} catch (Exception $e) {
				echo Zend_Json::encode(array('success' => false, 'message' => $e->getMessage()));
			}
		}
	}
	public function listAction () {
		if (DMG_Acl::canAccess(30)) {
			$query = Doctrine_Query::create()->from('ScmMaquina m');
			$query->innerJoin('m.ScmStatusMaquina s')->addWhere('s.fl_alta = ?', 1);
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
				$data[] = array(
					'id' => $k->id,
					'nr_serie_imob' => $k->nr_serie_imob,
					'nr_serie_aux' => $k->nr_serie_aux,
					'nm_jogo' => $k->ScmJogo->nm_jogo,
					'nr_versao_jogo' => $k->nr_versao_jogo,
					'simbolo_moeda' => $k->ScmMoeda->simbolo_moeda,
					'nm_status_maquina' => $k->ScmStatusMaquina->nm_status_maquina,
					'vl_credito' => $k->vl_credito,
				);
			}
			echo Zend_Json::encode(array('total' => $query->count(), 'data' => $data));
		}
	}
}