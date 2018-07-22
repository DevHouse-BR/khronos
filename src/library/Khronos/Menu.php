<?php

class Khronos_Menu {
	public static function getArray () {
		$menu = array(
			array('nome' => 'menu.administration', 'iconCls' => 'icon-admin', 'filhos' => array(
				array('nome' => 'menu.administration.group', 'iconCls' => 'silk-group', 'permissao' => 7, 'eXtype' => 'administration-group'),
				array('nome' => 'menu.administration.user', 'iconCls' => 'icon-user', 'permissao' => 3, 'eXtype' => 'administration-user'),
				array('nome' => 'menu.administration.empresa', 'iconCls' => 'icon-empresas', 'permissao' => 38, 'eXtype' => 'administration-empresa'),
				array('nome' => 'menu.administration.filial', 'iconCls' => 'icon-filiais', 'permissao' => 42, 'eXtype' => 'administration-filial'),
				array('nome' => 'menu.administration.parceiro', 'iconCls' => 'icon-parceiros', 'permissao' => 50, 'eXtype' => 'administration-parceiro'),
				array('nome' => 'menu.status-maquina', 'iconCls' => 'icon-status', 'permissao' => 54, 'eXtype' => 'status-maquina-window'),
				array('nome' => 'menu.administration.configuration', 'iconCls' => 'icon-config', 'permissao' => 1, 'eXtype' => 'administration-config'),
				array('nome' => 'menu.parque.maquina', 'iconCls' => 'icon-maquina', 'permissao' => 25, 'eXtype' => 'parque-maquina'),
				array('nome' => 'menu.parque.local', 'iconCls' => 'icon-locais', 'permissao' => 17, 'eXtype' => 'parque-local'),
				array('nome' => 'menu.parque.local-tipo', 'iconCls' => 'icon-tipo_local', 'permissao' => 46, 'eXtype' => 'parque-local-tipo'),
				array('nome' => 'menu.parque.jogo', 'iconCls' => 'icon-jogos', 'permissao' => 13, 'eXtype' => 'parque-jogo'),
				array('nome' => 'menu.parque.gabinete', 'iconCls' => 'icon-gabinete', 'permissao' => 21, 'eXtype' => 'parque-gabinete'),
				array('nome' => 'session.menu', 'iconCls' => 'icon-session', 'permissao' => 77, 'eXtype' => 'session-manager'),
			)),
			array('nome' => 'menu.parque', 'iconCls' => 'icon-parque', 'filhos' => array(
				array('nome' => 'menu.movimentacao-entrada', 'iconCls' => 'icon-entrada_maquina', 'permissao' => 58, 'eXtype' => 'movimentacao-entrada'),
				array('nome' => 'menu.movimentacao-saida', 'iconCls' => 'icon-saida_maquina', 'permissao' => 59, 'eXtype' => 'movimentacao-saida'),
				array('nome' => 'menu.parque.regularizacao', 'iconCls' => 'icon-ok_counter', 'permissao' => 62, 'eXtype' => 'parque-regularizacao'),
				array('nome' => 'menu.parque.transformacao', 'iconCls' => 'icon-trans_maquina', 'permissao' => 28, 'eXtype' => 'parque-transformacao'),
				//array('nome' => 'menu.status-maquina', 'iconCls' => 'icon-status', 'permissao' => 54, 'eXtype' => 'status-maquina-window'),
				array('nome' => 'menu.parque.status-maquina-assign', 'iconCls' => 'icon-exec_verde', 'permissao' => 65, 'eXtype' => 'parque-status-maquina-assign'),
				//array('nome' => 'menu.parque.consulta-parque', 'iconCls' => 'icon-admin', 'permissao' => 30, 'eXtype' => 'parque-consulta-parque'),
				array('nome' => 'reports', 'iconCls' => 'silk-report', 'permissao' => 36, 'eXtype' => 'reports'),
				array('nome' => 'menu.consultas', 'iconCls' => 'icon-report-magnify', 'permissao' => 70, 'eXtype' => 'consultas'),				
			)),
			array('nome' => 'menu.faturamento', 'iconCls' => 'icon-fechamento', 'filhos' => array(
				array('nome' => 'menu.faturamento.faturamento', 'iconCls' => 'icon-fechamento', 'permissao' => 72, 'eXtype' => 'faturamento-window'),
				array('nome' => 'menu.excecoes_faturas', 'iconCls' => 'icon-alert', 'permissao' => 76, 'eXtype' => 'faturamento-excecao'),
				array('nome' => 'faturamento.reports', 'iconCls' => 'icon-relatorio-fechamento',  'permissao' => 80, 'eXtype' => 'faturamento-reports'),
				array('nome' => 'faturamento.consultas', 'iconCls' => 'icon-consulta_fechamento',  'permissao' => 88, 'eXtype' => 'faturamento-consultas'),
			)),
			array('nome' => 'menu.financeiro', 'iconCls' => 'icon-admin'),
			array('nome' => 'menu.monitoramento-online', 'iconCls' => 'icon-admin'),
			array('nome' => 'menu.alertas', 'iconCls' => 'icon-admin')
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
						'iconCls' => $m['iconCls'],
						'eXtype' => $m['eXtype']
					);
				}
			}
			if (count($children)) {
				$json[] = array(
					'title' => DMG_Translate::_($k['nome']),
					'iconCls' => $k['iconCls'],
					'root' => array('children' => $children)
				);
			}
		}
		return $json;
	}
	public static function getJson () {
		return Zend_Json::encode(Khronos_Menu::getArray());
	}
}