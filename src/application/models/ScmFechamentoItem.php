<?php

/**
 * ScmFechamentoItem
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 * 
 * @package    ##PACKAGE##
 * @subpackage ##SUBPACKAGE##
 * @author     ##NAME## <##EMAIL##>
 * @version    SVN: $Id: Builder.php 6401 2009-09-24 16:12:04Z guilhermeblanco $
 */
class ScmFechamentoItem extends BaseScmFechamentoItem
{
	public function postInsert () {
		$this->ScmMaquina->nr_cont_1 = $this->nr_cont_1;
		$this->ScmMaquina->nr_cont_2 = $this->nr_cont_2;
		$this->ScmMaquina->nr_cont_3 = $this->nr_cont_3;
		$this->ScmMaquina->nr_cont_4 = $this->nr_cont_4;
		$this->ScmMaquina->nr_cont_5 = $this->nr_cont_5;
		$this->ScmMaquina->nr_cont_6 = $this->nr_cont_6;
		$this->ScmMaquina->dt_ultimo_fechamento = $this->ScmFechamentoDoc->dt_sistema;
		$this->ScmMaquina->save();
	}
}