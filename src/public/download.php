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
	
	if (isset($_GET['fl_portal']) && $_GET['fl_portal'] == 'on') {
		Zend_Auth::getInstance()->setStorage(new Zend_Auth_Storage_Session(DMG_Config::get(19)));
	} else {
		Zend_Auth::getInstance()->setStorage(new Zend_Auth_Storage_Session(DMG_Config::get(18)));
	}
	
	switch (@Zend_Auth::getInstance()->getIdentity()->language) {
		case 'pt_BR':
			$locale = 'pt_BR';
		break;
		case 'en':
			$locale = 'en_US';
		break;
		case 'es':
		default:
			$locale = 'es_ES';
		break;
	}

	if ($_GET['tipo'] == 'report') {
		$id = (int) $_GET['id'];
		$xml = glob(realpath(APPLICATION_PATH . '/../tomcat/Reports/report/xml/') . DIRECTORY_SEPARATOR . '*.xml');
		foreach ($xml as $__k) {
			$k = simplexml_load_file($__k);
			if (reset($k->id) == $id) {
				if (!DMG_Acl::canAccess(reset($k->ruleID))) {
					die('erro download:' . __LINE__);
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
					die('erro download:' . __LINE__);
				}
				$url = '/' . DMG_Config::get(20) . '/run?__report=report/' . reset($k->arquivo) . '&__locale=' . $locale . '&__format=' . $format;
				$param = array();
				foreach ($k->filtros->filtro as $l) {
					if ($l->tipo == 'data') {
						$url .= "&" . reset($l->nome) . "=" . urlencode($_GET[reset($l->nome)] . '.000');
					}
					else {
						foreach ($_GET[reset($l->nome)] as $m) {
							//$param[reset($l->nome)][] = (int) $m;
							$param[reset($l->nome)][] = $m;
						}
					}
				}
				foreach ($param as $_k => $_l) {
					$url .= "&" . $_k . "=" . implode(",", $_l);
				}
				$url .= "&id_usuario=" . Zend_Auth::getInstance()->getIdentity()->id;				
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
					die('erro download:' . __LINE__);
				}
				header('Content-Disposition: attachment; filename=' . reset($k->saida) . '.' . $format);
				header('Content-type: ' . $formatMime);
				header('Cache-Control: private');
				echo $xml;
			}
		}
	} else if ($_GET['tipo'] == 'fatura') {
		$addr = @fsockopen(DMG_Config::get(8), DMG_Config::get(11), $errno, $errstr, DMG_Config::get(10));
		if ($errno != 0) {
			die('erro download:' . __LINE__);
		}
		$id = (int) $_GET['id'];
		$url = '/' . DMG_Config::get(20) . '/run?__report=report/fatura.rptdesign&__format=pdf&__locale=' . $locale;
		$url .= '&id=' . $id . "&id_usuario=" . Zend_Auth::getInstance()->getIdentity()->id;
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
			die('erro download:' . __LINE__);
		}
		header('Content-Disposition: attachment; filename=Fatura.pdf');
		header('Content-type: application/pdf');
		header('Cache-Control: private');
		echo $xml;
	} elseif ($_GET['tipo'] == 'report-faturamento') {
		$id = (int) $_GET['id'];
		$xml = glob(realpath(APPLICATION_PATH . '/../tomcat/Reports/report/xml-faturamento/') . DIRECTORY_SEPARATOR . '*.xml');
		foreach ($xml as $__k) {
			$k = simplexml_load_file($__k);
			if (reset($k->id) == $id) {
				if (!DMG_Acl::canAccess(reset($k->ruleID))) {
					die('erro download:' . __LINE__);
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
					die('erro download:' . __LINE__);
				}
				$url = '/' . DMG_Config::get(20) . '/run?__report=report/' . reset($k->arquivo) . '&__format=' . $format . '&__locale=' . $locale;
				$param = array();
				foreach ($k->filtros->filtro as $l) {
					if ($l->tipo == 'data_inicial') {
						$url .= "&" . reset($l->nome) . "=" . urlencode($_GET[reset($l->nome)] . '.000');
					} else if ($l->tipo == 'data_final') {
						$url .= "&" . reset($l->nome) . "=" . urlencode($_GET[reset($l->nome)] . '.000');
					} else {
						foreach ($_GET[reset($l->nome)] as $m) {
							//$param[reset($l->nome)][] = (int) $m;
							$param[reset($l->nome)][] = $m;
						}
					}
				}
				foreach ($param as $_k => $_l) {
					$url .= "&" . $_k . "=" . implode(",", $_l);
				}
				$url .= "&id_usuario=" . Zend_Auth::getInstance()->getIdentity()->id;
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
					die('resposta inválida');
				}
				header('Content-Disposition: attachment; filename=' . reset($k->saida) . '.' . $format);
				header('Content-type: ' . $formatMime);
				header('Cache-Control: private');
				echo $xml;
			}
		}
	}
