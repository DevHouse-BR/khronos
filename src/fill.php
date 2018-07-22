<?php

if (!Zend_Auth::getInstance()->authenticate(new DMG_Auth_Adapter('admin', 'e6X9hJssakZST/pdtA/Gqg'))->isValid()) {
	throw new Exception('não logou');
}

foreach (array('0', '20000', '30000', '40000', '50000') as $k) {
	$maquina = new ScmMaquina();
    $maquina->nr_serie_imob = 'MAQ-'.$k;
    $maquina->nr_serie_connect = $k;
    $maquina->nr_serie_aux = 'AUX';
    $maquina->dt_cadastro = DMG_Date::now();
    $maquina->id_usuario = 1;
    $maquina->id_protocolo = 1;
    $maquina->id_filial = 1;
    $maquina->id_local = 2;
    $maquina->id_status = 1;
    $maquina->id_jogo = 4;
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
    $maquina->id_moeda = 1;
    $maquina->id_parceiro = null;
	$maquina->percent_local = 45;
    $maquina->save();
}

echo "Maquinas cadastradas no banco de dados\n";