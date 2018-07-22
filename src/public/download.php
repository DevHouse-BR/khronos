<?php

	defined('APPLICATION_PATH') || define('APPLICATION_PATH', realpath(dirname(__FILE__) . '/../application'));
	defined('APPLICATION_ENV') || define('APPLICATION_ENV', (getenv('APPLICATION_ENV') ? getenv('APPLICATION_ENV') : 'production'));

	set_include_path(implode(PATH_SEPARATOR, array(
		realpath(APPLICATION_PATH . '/../library'),
		get_include_path(),
	)));

	require_once 'Zend/Application.php';  

	$application = new Zend_Application(APPLICATION_ENV, APPLICATION_PATH . '/configs/application.ini');
	$application->bootstrap();

	if ($_GET['tipo'] == 'report') {
		$id = (int) $_GET['id'];
		$xml = glob(realpath(APPLICATION_PATH . '/../tomcat/Reports/report/xml/') . DIRECTORY_SEPARATOR . '*.xml');
		foreach ($xml as $__k) {
			$k = simplexml_load_file($__k);
			if (reset($k->id) == $id) {
				if (!DMG_Acl::canAccess(reset($k->ruleID))) {
					die();
				}
				switch ($_GET['format']) {
					case 'xls':
						$format = 'xls';
						$formatMime = 'text/plain';
					break;
					default:
					case 'pdf':
						$format = 'pdf';
						$formatMime = 'application/pdf';
					break;
				}
				$addr = @fsockopen(DMG_Config::get(8), DMG_Config::get(11), $errno, $errstr, DMG_Config::get(10));
				if ($errno != 0) {
					die();
					return;
				}
				$url = '/Reports/run?__report=report/' . reset($k->arquivo) . '&__format=' . $format;
				$param = array();
				foreach ($k->filtros->filtro as $l) {
					foreach ($_GET[reset($l->nome)] as $m) {
						$param[reset($l->nome)][] = (int) $m;
					}
				}
				foreach ($param as $_k => $_l) {
					$url .= "&" . $_k . "=" . implode(",", $_l);
				}
				fwrite($addr, "GET " . $url . " HTTP/1.0\r\nHost: " . DMG_Config::get(8) . "\r\nConnection: Close\r\n\r\n");
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
					return;
				}
				header('Content-Disposition: attachment; filename=' . reset($k->saida) . '.' . $format);
				header('Content-type: ' . $formatMime);
				header('Cache-Control: private');
				echo $xml;
			}
		}
	} else {
		if (DMG_Acl::canAccess(32) || DMG_Acl::canAccess(33)) {
			$relatorio = Doctrine::getTable('ScmFechamentoDoc')->find((int) $_GET['id']);
			if ($relatorio) {
				$addr = @fsockopen(DMG_Config::get(8), DMG_Config::get(11), $errno, $errstr, DMG_Config::get(10));
				if ($errno != 0) {
					return;
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
				fclose($addr);
				if (preg_match("/200 OK/", $header) !== 1) {
					return;
				}
				header('Content-Disposition: attachment; filename=Fechamento.pdf');
				header('Content-type: application/pdf');
				header('Cache-Control: private');
				echo $xml;
			}
		}
	}