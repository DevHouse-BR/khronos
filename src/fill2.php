<?php

date_default_timezone_set('America/Sao_Paulo');

set_include_path(implode(PATH_SEPARATOR, array(get_include_path(), dirname(__FILE__) . '/library/')));

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

if (!Zend_Auth::getInstance()->authenticate(new DMG_Auth_Adapter('admin', 'e6X9hJssakZST/pdtA/Gqg'))->isValid()) {
	throw new Exception('não logou');
}

try {
	Doctrine_Manager::getInstance()->getCurrentConnection()->beginTransaction();
	
	for ($i = 1; $i <= 2; $i++) {
		$empresa = new ScmEmpresa();
		$empresa->nm_empresa = 'Empresa #' . $i;
		$empresa->save();
		for ($j = 1; $j <= 2; $j++) {
			$filial = new ScmFilial();
			$filial->nm_filial = 'Filial #' . $j;
			$filial->id_empresa = $empresa->id;
			$filial->save();
		}
	}
	for ($k = 1; $k <= 2; $k++) {
		$local = new ScmLocal();
		$local->nm_local = 'Local #' . $k;
	}

	$nr_serie = 0;
	foreach (Doctrine::getTable('ScmFilial')->findAll() as $filial) {
		foreach (Doctrine::getTable('ScmLocal')->findAll() as $local) {
			foreach (Doctrine::getTable('ScmMoeda')->findAll() as $moeda) {
				foreach (Doctrine::getTable('ScmJogo')->findAll() as $jogo) {
					$maquina = new ScmMaquina();
				    $maquina->nr_serie_imob = 'MAQ-'.$nr_serie;
				    $maquina->nr_serie_connect = $nr_serie;
				    $maquina->dt_cadastro = DMG_Date::now();
				    $maquina->id_usuario = 1;
				    $maquina->id_protocolo = 1;
				    $maquina->id_filial = $filial->id;
				    $maquina->id_local = $local->id;
				    $maquina->id_status = 1;
				    $maquina->id_jogo = $jogo->id;
				    $maquina->nr_versao_jogo = '4.17';
				    $maquina->vl_credito = 0.05;
				    $maquina->id_gabinete = 1;
				    $maquina->nr_cont_1 = 0;
				    $maquina->nr_cont_2 = 0;
				    $maquina->nr_cont_3 = 0;
				    $maquina->nr_cont_4 = 0;
				    $maquina->nr_cont_1_parcial = 0;
				    $maquina->nr_cont_2_parcial = 0;
				    $maquina->nr_cont_3_parcial = 0;
				    $maquina->nr_cont_4_parcial = 0;
				    $maquina->id_moeda = $moeda->id;
				    $maquina->id_parceiro = null;
					$maquina->percent_local = 50;
				    $maquina->save();
					$nr_serie++;
				}
			}
		}
	}

	foreach (Doctrine::getTable('ScmFilial')->findAll() as $filial) {
		foreach (Doctrine::getTable('ScmLocal')->findAll() as $local) {
			$fDoc = new ScmFaturaDoc();
			$fDoc->id_fatura_doc_status = 1;
			$fDoc->dt_fatura = DMG_Date::now();
			$fDoc->id_origem = 1;
			$fDoc->id_filial = $filial->id;
			$fDoc->id_local = $local->id;
			$fDoc->id_parceiro = null;
			$fDoc->id_usuario = 1;
			$fDoc->dt_sistema = DMG_Date::now();
			$fDoc->save();
			foreach (Doctrine::getTable('ScmMoeda')->findAll() as $moeda) {
				foreach (Doctrine::getTable('ScmJogo')->findAll() as $jogo) {
					foreach (Doctrine_Query::create()
						->from('ScmMaquina')
						->addWhere('id_filial = ?', $filial->id)
						->addWhere('id_local = ?', $local->id)
						->addWhere('id_moeda = ?', $moeda->id)
						->addWhere('id_jogo = ?', $jogo->id)
						->execute()
					 as $k) {
						$fItem = new ScmFaturaItem();
						$fItem->id_fatura_doc = $fDoc->id;
						$fItem->vl_credito = $k->vl_credito;
						$fItem->id_maquina = $k->id;
						$fItem->id_jogo = $k->id_jogo;
						$fItem->id_gabinete = $k->id_gabinete;
						$fItem->id_protocolo = $k->id_protocolo;
						$fItem->id_moeda = $k->id_moeda;
						$fItem->nr_cont_1 = rand(0, 10000);
						$fItem->nr_cont_2 = rand(0, 10000);
						$fItem->nr_cont_3 = rand(0, 10000);
						$fItem->nr_cont_4 = rand(0, 10000);
						$fItem->nr_cont_5 = rand(0, 10000);
						$fItem->nr_cont_6 = rand(0, 10000);
						$fItem->nr_cont_1_ant = $k->nr_cont_1;
						$fItem->nr_cont_2_ant = $k->nr_cont_2;
						$fItem->nr_cont_3_ant = $k->nr_cont_3;
						$fItem->nr_cont_4_ant = $k->nr_cont_4;
						$fItem->nr_cont_5_ant = $k->nr_cont_5;
						$fItem->nr_cont_6_ant = $k->nr_cont_6;
						$fItem->nr_dif_cont_1 = $fItem->nr_cont_1 - $fItem->nr_cont_1_ant;
						$fItem->nr_dif_cont_2 = $fItem->nr_cont_2 - $fItem->nr_cont_2_ant;
						$fItem->nr_dif_cont_3 = $fItem->nr_cont_3 - $fItem->nr_cont_3_ant;
						$fItem->nr_dif_cont_4 = $fItem->nr_cont_4 - $fItem->nr_cont_4_ant;
						$fItem->nr_dif_cont_5 = $fItem->nr_cont_5 - $fItem->nr_cont_5_ant;
						$fItem->nr_dif_cont_6 = $fItem->nr_cont_6 - $fItem->nr_cont_6_ant;
						$fItem->vl_dif_cont_1 = $fItem->nr_dif_cont_1 * $fItem->vl_credito;
						$fItem->vl_dif_cont_2 = $fItem->nr_dif_cont_2 * $fItem->vl_credito;
						$fItem->vl_dif_cont_3 = $fItem->nr_dif_cont_3 * $fItem->vl_credito;
						$fItem->vl_dif_cont_4 = $fItem->nr_dif_cont_4 * $fItem->vl_credito;
						$fItem->vl_dif_cont_5 = $fItem->nr_dif_cont_5 * $fItem->vl_credito;
						$fItem->vl_dif_cont_6 = $fItem->nr_dif_cont_6 * $fItem->vl_credito;
						$fItem->vl_bruto = $fItem->vl_dif_cont_4 - $fItem->vl_dif_cont_3;
						$fItem->vl_local = $fItem->vl_bruto * (100-$k->percent_local)/100;
						$fItem->vl_empresa = $fItem->vl_bruto - $fItem->vl_local;
						$fItem->percent_local = $k->percent_local;
						$fItem->save();
					}
				}
			}
		}
	}
	Doctrine_Manager::getInstance()->getCurrentConnection()->commit();
} catch (Exception $e) {
	Doctrine_Manager::getInstance()->getCurrentConnection()->rollback();
	var_dump($e->getMessage());
}

