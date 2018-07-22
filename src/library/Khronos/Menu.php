<?php

class Khronos_Menu {
	public function getArray () {
		$menu = array(
			array('nome' => 'menu.administration', 'filhos' => array(
				array('nome' => 'menu.administration.group', 'permissao' => 7, 'eXtype' => 'administration-group'),
				array('nome' => 'menu.administration.user', 'permissao' => 3, 'eXtype' => 'administration-user'),
				array('nome' => 'menu.administration.empresa', 'permissao' => 38, 'eXtype' => 'administration-empresa'),
				array('nome' => 'menu.administration.filial', 'permissao' => 42, 'eXtype' => 'administration-filial'),
				array('nome' => 'menu.administration.parceiro', 'permissao' => 50, 'eXtype' => 'administration-parceiro'),
				array('nome' => 'menu.status-maquina', 'permissao' => 54, 'eXtype' => 'status-maquina-window'),
				array('nome' => 'menu.administration.configuration', 'permissao' => 1, 'eXtype' => 'administration-config'),
				array('nome' => 'menu.parque.maquina', 'permissao' => 25, 'eXtype' => 'parque-maquina'),
				array('nome' => 'menu.parque.local', 'permissao' => 17, 'eXtype' => 'parque-local'),
				array('nome' => 'menu.parque.local-tipo', 'permissao' => 46, 'eXtype' => 'parque-local-tipo'),
				array('nome' => 'menu.parque.jogo', 'permissao' => 13, 'eXtype' => 'parque-jogo'),
				array('nome' => 'menu.parque.gabinete', 'permissao' => 21, 'eXtype' => 'parque-gabinete'),
			)),
			array('nome' => 'menu.parque', 'filhos' => array(
				array('nome' => 'menu.movimentacao-entrada', 'permissao' => 58, 'eXtype' => 'movimentacao-entrada'),
				array('nome' => 'menu.movimentacao-saida', 'permissao' => 59, 'eXtype' => 'movimentacao-saida'),
				array('nome' => 'menu.parque.regularizacao', 'permissao' => 62, 'eXtype' => 'parque-regularizacao'),
				array('nome' => 'menu.parque.transformacao', 'permissao' => 28, 'eXtype' => 'parque-transformacao'),
				array('nome' => 'menu.status-maquina', 'permissao' => 54, 'eXtype' => 'status-maquina-window'),
				array('nome' => 'menu.parque.status-maquina-assign', 'permissao' => 65, 'eXtype' => 'parque-status-maquina-assign'),
				array('nome' => 'menu.parque.consulta-parque', 'permissao' => 30, 'eXtype' => 'parque-consulta-parque'),
				array('nome' => 'reports', 'permissao' => 36, 'eXtype' => 'reports'),
			)),
			array('nome' => 'menu.faturamento'),
			array('nome' => 'menu.financeiro'),
			array('nome' => 'menu.monitoramento-online'),
			array('nome' => 'menu.alertas')
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
		return Zend_Json::encode(Khronos_Menu::getArray());
	}
}