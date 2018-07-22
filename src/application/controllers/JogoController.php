<?php

class JogoController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function listAction () {
		if (DMG_Acl::canAccess(13) || DMG_Acl::canAccess(26) || DMG_Acl::canAccess(27)) {
			echo DMG_Crud::index($this, 'ScmJogo', 'id, nm_jogo');
		}
	}
	public function getAction () {
		if (DMG_Acl::canAccess(14)) {
			echo DMG_Crud::get($this, 'ScmJogo', (int) $this->getRequest()->getParam('id'));
		}
	}
	public function saveAction () {
		try{
			$id = (int) $this->getRequest()->getParam('id');
			if ($id > 0) {
				if (DMG_Acl::canAccess(14)) {
					$obj = Doctrine::getTable('ScmJogo')->find($id);
					if ($obj) {
						$obj->nm_jogo = $this->getRequest()->getParam('nm_jogo');
						$obj->save();
						echo Zend_Json::encode(array('success' => true));
					}
				}
			} 
			else {
				if (DMG_Acl::canAccess(15)) {
					$obj = new ScmJogo();
					$obj->nm_jogo = $this->getRequest()->getParam('nm_jogo');
					$obj->save();
					echo Zend_Json::encode(array('success' => true));
				}
			}
		}
		catch (Exception $e) {
			echo Zend_Json::encode(array('success' => false, 'errormsg'=>$e->getMessage()));
		}
	}
	public function deleteAction () {
		if (DMG_Acl::canAccess(16)) {
			echo DMG_Crud::delete($this, 'ScmJogo', $this->getRequest()->getParam('id'));
		}
	}
	public function reloadChartAction(){
		try{
			if (!DMG_Acl::canAccess(83))
				throw new Exception(DMG_Translate::_('system.sem.permissao'));
				
			$versoes = array();
			foreach (Doctrine_Query::create()->select('m.nr_versao_jogo')->from('ScmMaquina m')->groupBy('m.nr_versao_jogo')->execute(array(), Doctrine::HYDRATE_SCALAR) as $k) {
				$versoes[] = $k['m_nr_versao_jogo'];
			}
			
			$query = Doctrine_Query::create()
				->select('j.nm_jogo, m.nr_versao_jogo, COUNT(m.id) AS total')
				->from('ScmMaquina m')
				->innerJoin('m.ScmJogo j')
				->innerJoin('m.ScmStatusMaquina st')
				->where('st.fl_alta = ?', 1)
				->groupBy('j.nm_jogo')
				->addGroupBy('m.nr_versao_jogo')
				->execute(array(), Doctrine::HYDRATE_SCALAR)
			;
			
			$nJogo = array();
			foreach ($query as $k) {
				$nJogo[$k['j_nm_jogo']][$k['m_nr_versao_jogo']] = $k['m_total']; 
			}
			
			$jogo = array();
			foreach ($nJogo as $k => $l) {
				$tmp = array('jogo' => $k);
				foreach ($l as $m => $n) {
					foreach ($versoes as $o => $p) {
						if ($p == $m) {
							$tmp['c_' . $o] = (int) $n;
						}
					}
				}
				$jogo[] = $tmp;
			}
			
			
			$fields = array(
				array('name' => 'jogo', 'type' => 'string')
			);
			foreach ($versoes as $key => $value) {
				$fields[] = array('name' => "c_" . $key,  'type' => "int"); 
			}
			
			$series = array();
			foreach ($versoes as $k => $l) {
				$series[] = array(
					'xField' => 'c_' . $k,
				    'displayName' => $l,
				   	'style' => array('size' => 15)
				);
			}			
			
			$this->_helper->json(array(
				'success' => true,
				'fields' => $fields,
				'data' => $jogo,
				'series' => $series
			));
		}
		catch (Exception $e){
			$this->_helper->json(array('success' => false, 'errormsg' => $e->getMessage()));
		}
	}
}