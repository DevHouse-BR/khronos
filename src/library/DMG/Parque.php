<?php

class DMG_Parque {
	public function transformarMaquina($id, $valores, $trid) {
		$maquina = Doctrine::getTable('ScmMaquina')->find($id);
		if (!$maquina) {
			throw new Exception("Invalid ScmMaquina entry");
		}
		$trDoc = Doctrine::getTable('ScmTransformacaoDoc')->find($trid);
		if (!$trDoc) {
			throw new Exception("Invalid ScmTransformacaoDoc entry");
		}
		if ($maquina->ScmStatusMaquina->fl_alta != 1) {
			throw new Exception(DMG_Translate::_('parque.transformacao.statuserror'));
		}
		$trItem = new ScmTransformacaoItem();
		$trItem->id_transformacao_doc = $trDoc->id;
		$trItem->id_maquina = $maquina->id;
		$notEmpty = new Zend_Validate_NotEmpty();
		$Int = new Zend_Validate_Int();
		$Float = new Zend_Validate_Float();
		$cont = explode(",", DMG_Config::get(4));
		for ($i = 1; $i <= 6; $i++) {
			$_nm = 'nr_cont_' . $i;
			if (in_array($i, $cont)) {
				if (!$notEmpty->isValid($this->getRequest()->getParam('new_' . $_nm))) {
					$error['new_nr_cont_' . $i] = DMG_Translate::_('parque.transformacao.form.contador.empty');
					continue;
				}
			}
			if ($notEmpty->isValid($this->getRequest()->getParam('new_' . $_nm))) {
				if (!$Int->isValid($this->getRequest()->getParam('new_' . $_nm))) {
					$error['new_' . $_nm] = DMG_Translate::_('parque.transformacao.form.contador.string');
					continue;
				}
				if ($this->getRequest()->getParam('new_nr_cont_' . $i) < $maquina->$_nm) {
					$error['new_' . $_nm] = DMG_Translate::_('parque.transformacao.form.contador.lessthan');
					continue;
				}
				$trItem->$_nm = $this->getRequest()->getParam('new_' . $_nm);
			}
		}
		if ($notEmpty->isValid($this->getRequest()->getParam('new_id_jogo'))) {
			try {
				$jogo = Doctrine::getTable('ScmJogo')->find($this->getRequest()->getParam('new_id_jogo'));
			} catch (Exception $e) {
				$jogo = false;
			}
			if (!$jogo) {
				$error['new_id_jogo'] = DMG_Translate::_('parque.maquina.form.id_jogo.invalid');
			} else {
				$trItem->id_jogo = $jogo->id;
			}
		} else {
			$trItem->id_jogo = $maquina->id_jogo;
		}
		if ($notEmpty->isValid($this->getRequest()->getParam('new_id_moeda'))) {
			try {
				$moeda = Doctrine::getTable('ScmMoeda')->find($this->getRequest()->getParam('new_id_moeda'));
			} catch (Exception $e) {
				$moeda = false;
			}
			if (!$moeda) {
				$error['new_id_moeda'] = DMG_Translate::_('parque.maquina.form.id_moeda.invalid');
			} else {
				$trItem->id_moeda = $moeda->id;
			}
		} else {
			$trItem->id_moeda = $maquina->id_moeda;
		}
		if ($notEmpty->isValid($this->getRequest()->getParam('new_nr_versao_jogo'))) {
			$trItem->nr_versao_jogo = $this->getRequest()->getParam('new_nr_versao_jogo');
		} else {
			$trItem->nr_versao_jogo = $maquina->nr_versao_jogo;
		}
		$vl_credito = str_replace(",", ".", $this->getRequest()->getParam('new_vl_credito'));
		if ($notEmpty->isValid($vl_credito)) {
			if (!$Float->isValid($vl_credito)) {
				$error['new_vl_credito'] = DMG_Translate::_('parque.maquina.form.vl_credito.invalid');
			} else {
				$trItem->vl_credito = $vl_credito;
			}
		} else {
			$trItem->vl_credito = $maquina->vl_credito;
		}
		if ($notEmpty->isValid($this->getRequest()->getParam('new_id_gabinete'))) {
			try {
				$gabinete = Doctrine::getTable('ScmGabinete')->find($this->getRequest()->getParam('new_id_gabinete'));
			} catch (Exception $e) {
				$gabinete = false;
			}
			if (!$gabinete) {
				$error['new_id_gabinete'] = DMG_Translate::_('parque.maquina.form.id_gabinete.invalid');
			} else {
				$trItem->id_gabinete = $gabinete->id;
			}
		} else {
			$trItem->id_gabinete = $maquina->id_gabinete;
		}
		$d1 = new Zend_Date($trDoc->dt_transformacao);
		$d2 = new Zend_Date((empty($maquina->dt_ultima_transformacao) ? 0 : $maquina->dt_ultima_transformacao));
		$d3 = new Zend_Date((empty($maquina->dt_ultimo_faturamento) ? 0 : $maquina->dt_ultimo_faturamento));
		$d4 = new Zend_Date((empty($maquina->dt_ultima_movimentacao) ? 0 : $maquina->dt_ultima_movimentacao));
		$now = new Zend_Date(time());
		if (!($d1->get(Zend_Date::TIMESTAMP) > $d2->get(Zend_Date::TIMESTAMP) && $d1->get(Zend_Date::TIMESTAMP) > $d3->get(Zend_Date::TIMESTAMP) && $d1->get(Zend_Date::TIMESTAMP) > $d4->get(Zend_Date::TIMESTAMP))) {
			throw new Exception(DMG_Translate::_('parque.transformacao.form.dt_transformacao.least'));
		} elseif ($d1->get(Zend_Date::TIMESTAMP) > $now->get(Zend_Date::TIMESTAMP)) {
			throw new Exception(DMG_Translate::_('parque.transformacao.form.dt_transformacao.future'));
		}
		// verifica se nada foi mudado
		$mudado = false;
		foreach (array('id_jogo', 'id_gabinete', 'nr_versao_jogo', 'vl_credito', 'id_moeda') as $k) {
			if ($maquina->$k != $trItem->$k) {
				$mudado = true;
				break;
			}
		}
		if (!$mudado) {
			throw new Exception(DMG_Translate::_('parque.transformacao.nada_alterado'));
		}
		$trItem->save();
		return $error;
	}
	public function movimentarMaquina($id, $valores, $mvid) {
		$maquina = Doctrine::getTable('ScmMaquina')->find($id);
		if (!$maquina) {
			throw new Exception("Invalid ScmMaquina entry");
		}
		$trDoc = Doctrine::getTable('ScmMovimentacaoDoc')->find($mvid);
		if (!$trDoc) {
			throw new Exception("Invalid ScmMovimentacaoDoc entry");
		}
		$trItem = new ScmMovimentacaoItem();
		$trItem->id_movimentacao_doc = $trDoc->id;
		$trItem->id_maquina = $maquina->id;
		$notEmpty = new Zend_Validate_NotEmpty();
		$Int = new Zend_Validate_Int();
		$Float = new Zend_Validate_Float();
		$cont = explode(",", DMG_Config::get(4));
		for ($i = 1; $i <= 6; $i++) {
			$_nm = 'nr_cont_' . $i;
			if (in_array($i, $cont)) {
				if (!$notEmpty->isValid($valores[$_nm])) {
					$error['nr_cont_' . $i] = DMG_Translate::_('parque.movimentacao.form.contador.empty');
					continue;
				}
			}
			if ($notEmpty->isValid($valores[$_nm])) {
				if (!$Int->isValid($valores[$_nm])) {
					$error[$_nm] = DMG_Translate::_('parque.movimentacao.form.contador.string');
					continue;
				}
				if ($valores[$_nm] < $maquina->$_nm) {
					$error[$_nm] = DMG_Translate::_('parque.movimentacao.form.contador.lessthan');
					continue;
				}
				$trItem->$_nm = $valores[$_nm];
			}
		}
		$d1 = new Zend_Date($trDoc->dt_movimentacao);
		$d2 = new Zend_Date((empty($maquina->dt_ultima_transformacao) ? 0 : $maquina->dt_ultima_transformacao));
		$d3 = new Zend_Date((empty($maquina->dt_ultimo_faturamento) ? 0 : $maquina->dt_ultimo_faturamento));
		$d4 = new Zend_Date((empty($maquina->dt_ultima_movimentacao) ? 0 : $maquina->dt_ultima_movimentacao));
		$now = new Zend_Date(time());
		if (!($d1->get(Zend_Date::TIMESTAMP) > $d2->get(Zend_Date::TIMESTAMP) && $d1->get(Zend_Date::TIMESTAMP) > $d3->get(Zend_Date::TIMESTAMP) && $d1->get(Zend_Date::TIMESTAMP) > $d4->get(Zend_Date::TIMESTAMP))) {
			throw new Exception(DMG_Translate::_('parque.transformacao.form.dt_transformacao.least'));
		} elseif ($d1->get(Zend_Date::TIMESTAMP) > $now->get(Zend_Date::TIMESTAMP)) {
			throw new Exception(DMG_Translate::_('parque.transformacao.form.dt_transformacao.future'));
		}
		$trItem->save();
		return $error;
	}
}