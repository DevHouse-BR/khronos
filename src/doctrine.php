<?php

date_default_timezone_set('America/Sao_Paulo');

define('APPLICATION_ENV', 'development');
define('APPLICATION_PATH', realpath(dirname(__FILE__) . '/application'));

set_include_path(implode(PATH_SEPARATOR, array(
	realpath(APPLICATION_PATH . '/../library'),
	get_include_path(),
)));

require_once 'Zend/Application.php';

$application = new Zend_Application(APPLICATION_ENV, APPLICATION_PATH . '/configs/application.ini');
$application->getBootstrap()->bootstrap('doctrine');

Zend_Loader_Autoloader::getInstance()->registerNamespace('DMG');
Zend_Loader_Autoloader::getInstance()->registerNamespace('Khronos');

$doctrineConfig = new Zend_Config_Ini('application/configs/application.ini', 'development');
$doctrineConfig = $doctrineConfig->toArray();
$doctrineConfig = $doctrineConfig['doctrine'];

$manager = Doctrine_Manager::getInstance();

$manager->getCurrentConnection()->getDbh()->query("CREATE SEQUENCE scm_numero_fatura_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1");
$manager->getCurrentConnection()->getDbh()->query("ALTER TABLE scm_numero_fatura_seq OWNER TO " . $doctrineConfig['user']);

ob_start();
echo "Comandos extras de DDL executados\n";

require("fill.php");

require("fill2.php");