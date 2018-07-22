<?php

class Khronos_Consultas {
	public static function getJsonTreeList () {
		$menu = array(
			array('nome' => 'menu.parque', 'filhos' => array(
				array('nome' => 'consultas.historico_maquinas', 'permissao' => 71, 'eXtype' => 'historicoMaquinas'),
				array('nome' => 'menu.parque.consulta-parque', 'permissao' => 30, 'eXtype' => 'parque-consulta-parque'),
				array('nome' => 'menu.parque.consulta-entradas', 'permissao' => 87, 'eXtype' => 'parque-consulta-entradas'),
			))
		);
		$json = array();
		foreach ($menu as $k) {
			$children = array();
			if (!isset($k['filhos']) || !count($k['filhos'])) {
				continue;
			}
			foreach ($k['filhos'] as $m) {
				if (DMG_Acl::canAccess($m['permissao'])) {
					$children[] = array(
						'text' 	=> DMG_Translate::_($m['nome']),
						'id'	=> 'id_' . $m['eXtype'],
						'leaf' 	=> true,
						'eXtype'=> $m['eXtype']
					);
				}
			}
			$json[] = array(
				'text' => DMG_Translate::_($k['nome']),
				'leaf' => false,
				'expanded' => true,
				'children' => $children
			);
		}
		echo Zend_Json::encode($json);
	}
	public static function getFilterList ($reportID) {
		$lang = DMG_Translate::getLang();
		$b = glob(realpath(APPLICATION_PATH . Khronos_Reports::$xmlRelatorios) . DIRECTORY_SEPARATOR . '*.xml');
		foreach ($b as $k) {
			$xml = simplexml_load_file($k);
			if (reset($xml->id) == $reportID) {
				if (!DMG_Acl::canAccess(reset($xml->ruleID))) {
					continue;
				}
				$array = array();
				foreach ($xml->filtros->filtro as $l) {
					$array[] = array(
						'tipo' => reset($l->tipo),
						'campo' => reset($l->nome),
						'nome' => reset($l->traducao->{$lang})
					);
				}
			}
		}
		return $array;
	}
}