<?php

/**
 * ScmMovimentacaoItem
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 * 
 * @package    ##PACKAGE##
 * @subpackage ##SUBPACKAGE##
 * @author     ##NAME## <##EMAIL##>
 * @version    SVN: $Id: Builder.php 6401 2009-09-24 16:12:04Z guilhermeblanco $
 */
class ScmMovimentacaoItem extends BaseScmMovimentacaoItem
{
	public function postInsert ($event) {
		$this->ScmMaquina->dt_ultima_movimentacao = $this->ScmMovimentacaoDoc->dt_movimentacao;
		$this->ScmMaquina->nr_cont_1 = $this->nr_cont_1;
		$this->ScmMaquina->nr_cont_2 = $this->nr_cont_2;
		$this->ScmMaquina->nr_cont_3 = $this->nr_cont_3;
		$this->ScmMaquina->nr_cont_4 = $this->nr_cont_4;
		$this->ScmMaquina->nr_cont_5 = $this->nr_cont_5;
		$this->ScmMaquina->nr_cont_6 = $this->nr_cont_6;
		$this->ScmMaquina->id_filial = $this->ScmMovimentacaoDoc->id_filial;
		$this->ScmMaquina->id_parceiro = $this->ScmMovimentacaoDoc->id_parceiro;
		if ($this->percent_local) {
			$this->ScmMaquina->percent_local = $this->percent_local;
		}
		$this->ScmMaquina->save();
	}
}