<?php

date_default_timezone_set('America/Sao_Paulo');

define('APPLICATION_ENV', 'development');
define('APPLICATION_PATH', realpath(dirname(__FILE__) . '/application'));

set_include_path(implode(PATH_SEPARATOR, array(realpath(APPLICATION_PATH . '/../library'), get_include_path(), )));

require_once 'Zend/Application.php';

$application = new Zend_Application(APPLICATION_ENV, APPLICATION_PATH . '/configs/application.ini');
$application -> getBootstrap() -> bootstrap('doctrine');

Zend_Loader_Autoloader::getInstance() -> registerNamespace('DMG');
Zend_Loader_Autoloader::getInstance() -> registerNamespace('Khronos');

$doctrineConfig = new Zend_Config_Ini('application/configs/application.ini', 'development');
$doctrineConfig = $doctrineConfig -> toArray();
$doctrineConfig = $doctrineConfig['doctrine'];

$manager = Doctrine_Manager::getInstance();

$connection = Doctrine_Manager::getInstance() -> getCurrentConnection();
$dbh = $connection -> getDbh();

$tables = $connection->import->listTables();
foreach ($tables as $table) {
	truncateTable($table);
}
 
$dbh->query("DROP SEQUENCE scm_numero_fatura_seq CASCADE");

unset($dbh);

function truncateTable($tableName) {
	global $dbh;
	
	$sql = sprintf('DROP TABLE %s CASCADE', $tableName);
	$dbh->query($sql);
}
?>