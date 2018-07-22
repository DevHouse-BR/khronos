<?php

class Khronos_Servidor {
	public function getContadores ($nr_serie, ScmLocalServer $servidor) {
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
							'nr_cont_5' => null,
							'nr_cont_6' => null,
							'nr_cont_1_parcial' => reset($k->c1_parcial),
							'nr_cont_2_parcial' => reset($k->c2_parcial),
							'nr_cont_3_parcial' => reset($k->ds1_parcial) + reset($k->ds2_parcialj),
							'nr_cont_4_parcial' => reset($k->di_parcial),
							'nr_cont_5_parcial' => null,
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
	public function getInfoMaquina ($id, $lid) {
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
									'jogando' => (reset($k->creditos)*$maquina->vl_credito > DMG_Config::get(12) ? true : false),
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
	public function getFromTSG ($ip, $port, $timeout) {
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
			throw new Exception();
		}
		$xml = preg_replace('/<machine name="(\w+)">0<jogo>/', '<machine name="$1"><jogo>', $xml);
		$xml = simplexml_load_string($xml);
		return $xml;
	}
}