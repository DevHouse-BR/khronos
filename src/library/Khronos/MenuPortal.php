<?php
class Khronos_MenuPortal {
	public function getArray () {
		$menu = array(
			array('nome' => 'menu.portal.menu', 'filhos' => array(
				array('nome' => 'menu.portal.parque_maquinas', 'permissao' => 7, 'eXtype' => 'administration-group'),
				array('nome' => 'menu.portal.consulta_contadores', 'permissao' => 7, 'eXtype' => 'administration-group'),
				array('nome' => 'menu.portal.consulta_faturas_emitidas', 'permissao' => 7, 'eXtype' => 'administration-group')
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
						'text' => DMG_Translate::_($m['nome']),
						'leaf' => true,
						'iconCls' => 'no-icon',
						'eXtype' => $m['eXtype']
					);
				}
			}
			if (count($children)) {
				$json[] = array(
					'title' => DMG_Translate::_($k['nome']),
					'iconCls' => 'silk-cog',
					'root' => array('children' => $children)
				);
			}
		}
		return $json;
	}
	public function getJson () {
		return Zend_Json::encode(Khronos_MenuPortal::getArray());
	}
}