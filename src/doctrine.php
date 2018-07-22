<?php

date_default_timezone_set('America/Sao_Paulo');

set_include_path(implode(PATH_SEPARATOR, array(get_include_path(), dirname(__FILE__) . '/library/')));

error_reporting(E_ALL && E_NOTICE);

define('APPLICATION_PATH', realpath('./application/'));

function __autoload ($a) {
	$a = explode('_', $a);
	$a = implode('/', $a);
	require_once('library/' . $a . '.php');
}

include_once 'library/Doctrine.php';

$loader = Zend_Loader_Autoloader::getInstance();
$loader->pushAutoloader(array('Doctrine', 'autoload'));
$doctrineConfig = new Zend_Config_Ini('application/configs/application.ini', 'development');
$doctrineConfig = $doctrineConfig->toArray();
$doctrineConfig = $doctrineConfig['doctrine'];
$manager = Doctrine_Manager::getInstance();
$manager->setAttribute(Doctrine::ATTR_USE_DQL_CALLBACKS, true);
$manager->setAttribute(Doctrine::ATTR_MODEL_LOADING, Doctrine::MODEL_LOADING_CONSERVATIVE);
Doctrine::loadModels($doctrineConfig['models_path']);
$manager->setCollate('utf8_unicode_ci');
$manager->setCharset('utf8');
$manager->openConnection($doctrineConfig['connection_string']);

$manager->getCurrentConnection()->getDbh()->query("CREATE SEQUENCE scm_numero_fatura_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1");
$manager->getCurrentConnection()->getDbh()->query("ALTER TABLE scm_numero_fatura_seq OWNER TO khronos");