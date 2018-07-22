<?php

class Khronos_Servidor {
	public static function getContadores ($nr_serie, ScmLocalServer $servidor) {
		switch ($servidor->id_protocolo) {
			case 1:
				$data = Khronos_Servidor::getFromTSG($servidor->ip_server, $servidor->num_port, $servidor->timeout);
				$achou = false;
				foreach ($data as $k) {
					if (reset($k->attributes()->name) == $nr_serie) {
						$achou = true;
						return array(
							'creditos' => reset($k->creditos),
							'offline' => reset($k->offline),
							'nr_cont_1' => reset($k->c1),
							'nr_cont_2' => reset($k->c2),
							'nr_cont_3' => reset($k->ds1) + reset($k->ds2),
							'nr_cont_4' => reset($k->di),
							'nr_cont_5' => 0, # pagamento_manual
							'nr_cont_6' => null,
							'nr_cont_1_parcial' => reset($k->c1_parcial),
							'nr_cont_2_parcial' => reset($k->c2_parcial),
							'nr_cont_3_parcial' => reset($k->ds1_parcial) + reset($k->ds2_parcialj),
							'nr_cont_4_parcial' => reset($k->di_parcial),
							'nr_cont_5_parcial' => 0, # pagamento_manual
							'nr_cont_6_parcial' => null
						);
					}
				}
				if ($achou === false) {
					throw new Exception(DMG_Translate::_('contadores.inexistente'));
				}
				echo Zend_Json::encode($data);
			break;
			case 2:
				throw new Exception('protocolo SAS não implementado');
			break;
			default:
				throw new Exception('protocolo não suportado');
			break;
		}
		// pega contadores
		// se jogando throw
		// se offline throw
		// se não achar throw
	}
	public static function getInfoMaquina ($id, $lid) {
		$local = Doctrine::getTable('ScmLocal')->find($lid);
		$maquina = Doctrine::getTable('ScmMaquina')->find($id);
		if ($maquina) {
			if ($local) {
				$lid = $local->id;
			} else {
				$lid = $maquina->id_local;
			}
			$servidor = Doctrine_Query::create()->from('ScmLocalServer')->addWhere('id_protocolo = ?', $maquina->id_protocolo)->addWhere('id_local = ?', $lid);
			if ($servidor->count()) {
				$servidor = $servidor->fetchOne();
				switch ($servidor->id_protocolo) {
					case 1:
						$data = Khronos_Servidor::getFromTSG($servidor->ip_server, $servidor->num_port, $servidor->timeout);
						foreach ($data as $k) {
							if (reset($k->attributes()->name) == $maquina->nr_serie_connect) {
								return array(
									'jogando' => (reset($k->creditos) > 0 ? true : false),
									'nr_cont_1' => reset($k->c1),
									'nr_cont_2' => reset($k->c2),
									'nr_cont_3' => reset($k->ds1) + reset($k->ds2),
									'nr_cont_4' => reset($k->di)
								);
							}
						}	
						return false;
					break;
					case 2:
						// SAS
					break;
					default:
						return false;
					break;
				}
			} else {
				throw new Exception(DMG_Translate::_('movimentacao.servidor-inexistente'));
			}
		}
	}
	public static function getFromTSG ($ip, $port, $timeout) {
		error_reporting(0);
		$sock = fsockopen($ip, $port, $errno, $errstr, $timeout); 
		if ($errno != 0) {
			throw new Exception(DMG_Translate::_('contadores.timeout'));
		}
		fwrite($sock, "GET /machines HTTP/1.1\r\nHost: " . $ip . "\r\nConnection: Close\r\n\r\n");
		$xml = null;
		$header = null;
		do {
			$header .= fgets($sock);
		} while(strpos($header, "\r\n\r\n") === false);
		while (!feof($sock)) {
			$xml .= fgets($sock);
		}
		fclose($sock);
		if (preg_match("/200 OK/", $header) !== 1) {
			throw new Exception(DMG_Translate::_('contadores.inesperado'));
		}
		$xml = preg_replace('/<machine name="(\w+)">0<jogo>/', '<machine name="$1"><jogo>', $xml);
		$xml = simplexml_load_string($xml);
		return $xml;
	}
	public static function getContadoresLocal (ScmLocal $local) {
		$maquina = array();
		$query = Doctrine_Query::create()->from('ScmLocalServer s')->addWhere('s.id_local = ?', $local->id);
		foreach ($query->execute() as $k) {
			switch ($k->id_protocolo) {
				case 1:
					$data = Khronos_Servidor::getFromTSG($k->ip_server, $k->num_port, $k->timeout);
					$nr_serie = array();
					foreach ($data as $l) {
						$nr_serie[reset($l->attributes()->name)]++;
					}
					foreach ($data->machine as $l) {
						$mq = Doctrine_Query::create()->from('ScmMaquina')->where('nr_serie_connect = ?', reset($l->attributes()->name))->addWhere('id_local = ?', $local->id)->fetchOne();
						$maquina[$mq->nr_serie_imob] = array(
							'offline' => (reset($l->offline) ? true : false),
							'jogando' => (reset($l->creditos) > 0 ? true : false),
							'creditos' => (int) $l->creditos,
							'repetida' => ($nr_serie[$mq->nr_serie_connect] > 1 ? true : false),
							'nr_cont_1' => reset($l->c1),
							'nr_cont_2' => reset($l->c2),
							'nr_cont_3' => (string) (reset($l->ds1) + reset($l->ds2)),
							'nr_cont_4' => reset($l->di),
							'nr_cont_5' => 0, # pagamento_manual
							'nr_cont_6' => null,
						);
					}
				break;
			}
		}
		return $maquina;
	}
	public static function getContadoresPorMaquinas($ids_maquinas) {
		try {
			if(count($ids_maquinas) == 0) throw new Exception(DMG_Translate::_('parque.consulta.xml.errno.5'));
			else{
				$locais = Doctrine_Query::create()->select('DISTINCT id_local as local')->from('ScmMaquina')->whereIn('id', $ids_maquinas)->fetchOne();
				$id_local = $locais->local;
			}
			
			$servidores = Doctrine_Query::create()
						->select('DISTINCT s.ip_server, s.id_protocolo, s.num_port, s.timeout')
						->from('ScmLocalServer s')
						->innerJoin('s.ScmLocal l')
						->innerJoin('l.ScmMaquina m')
						->addWhere('m.id_local = ' . $id_local)
						->execute();

			foreach ($servidores as $s){
				if((int)$s->id_protocolo == 1){
					$ctx = stream_context_create(array(
					    'http' => array(
					        'timeout' => $s->timeout
					        )
					    )
					);
					$xml = @file_get_contents('http://' . $s->ip_server . ':' . $s->num_port . '/machines', 0, $ctx);
					
					if(!$xml) throw new Exception(DMG_Translate::_('parque.consulta.xml.errno.1'));
										
					$xml = simplexml_load_string($xml);
					if (count($xml) == 0) {
						throw new Exception(DMG_Translate::_('parque.consulta.xml.errno.3'));
					}
					$data = array();
					foreach ($ids_maquinas as $k) {
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
				}
			}
			echo Zend_Json::encode(array('success' => true, 'data' => $data));
		}
		catch(Exception $e){
			echo Zend_Json::encode(array('success' => false, 'message' => $e->getMessage()));
		}
	}
}