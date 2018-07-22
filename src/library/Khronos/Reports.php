<?php

class Khronos_Reports {
	public static $xmlGrupos = '/../tomcat/Reports/report/grupos.xml';
	public static $xmlRelatorios = '/../tomcat/Reports/report/xml/';
	public function getJsonTreeList () {
		$lang = DMG_Translate::getLang();
		$a = realpath(APPLICATION_PATH . Khronos_Reports::$xmlGrupos);
		$b = realpath(APPLICATION_PATH . Khronos_Reports::$xmlRelatorios) . DIRECTORY_SEPARATOR . '*.xml';
		$json = array();
		if ($a && $b) {
			$fg = simplexml_load_file($a);
			$fr = glob($b);
			foreach ($fg->grupo as $k) {
				$tmpgrupo = array(
					'text' => reset($k->traducao->{$lang}),
					'id' => 'g_' .  reset($k->nome),
					'leaf' => false,
					'cls' => 'folder',
					'children' => array()
				);
				$i = 0;
				foreach ($fr as $l) {
					$xml = simplexml_load_file($l);
					if (!DMG_Acl::canAccess(reset($xml->ruleID))) {
						continue;
					}
					if (reset($k->attributes()->id) == reset($xml->grupo)) {
						$tmpgrupo['children'][] = array(
							'text' => reset($xml->traducao->{$lang}),
							'id' => 'r_' . reset($xml->id),
							'leaf' => true
						);
						$i++;
					}
				}
				if ($i > 0) {
					$json[] = $tmpgrupo;
				}
			}
		}
		return Zend_Json::encode($json);
	}
	public function getFilterList ($reportID) {
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