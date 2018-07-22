<?php

class Khronos_Faturamento_Misc {
	public static function maquinaFatTemp($machine_id){
		$fItem = Doctrine_Query::create()
			->from('ScmFaturaItem i')
			->innerJoin('i.ScmFaturaDoc d')
			->where('i.id_maquina = ?', $machine_id)
			->addWhere('d.id_fatura_doc_status = 1')
			->fetchOne();
		if($fItem) return true;
		else return false;
	}
}