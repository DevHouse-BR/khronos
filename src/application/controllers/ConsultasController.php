<?php

class ConsultasController extends Zend_Controller_Action {
	
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
	}
	
	public function indexAction () {
		echo $this->view->render('portal/index.phtml');
	}
	
	public function historicomaquinasAction() {
		$id_maquina = $this->getRequest()->getParam('id_maquina');
		if(!$id_maquina){
			echo(Zend_Json::encode(array('success'=>true, 'rows'=>array())));
			return;
		}
		
		$movimentacoes = $this->getRequest()->getParam('movimentacoes');
		$transformacoes = $this->getRequest()->getParam('transformacoes');
		$regularizacoes = $this->getRequest()->getParam('regularizacoes');
		$status = $this->getRequest()->getParam('status');
		$percent = $this->getRequest()->getParam('percent');
		
		if($movimentacoes == "true") $movimentacoes = true;
		else $movimentacoes = false; 
		
		if($transformacoes == "true") $transformacoes = true;
		else $transformacoes = false; 
		
		if($regularizacoes == "true") $regularizacoes = true;
		else $regularizacoes = false; 
		
		if($status == "true") $status = true;
		else $status = false;
		
		if($percent == "true") $percent = true;
		else $percent = false;
		
		if(!$movimentacoes && !$transformacoes && !$regularizacoes && !$status){
			echo(Zend_Json::encode(array('success'=>true, 'rows'=>array())));
			return;
		} 
		
		$conn = Doctrine_Manager::getInstance()->getCurrentConnection();
		$dbhandler = $conn->getDbh();

		if($movimentacoes){
			$query = "
					SELECT
					1 AS ordem,
					mo.dt_sistema AS dt_sistema,
					mo.dt_movimentacao AS data,
					CASE WHEN mo.tp_movimento = 'E' THEN 'Mov. Entrada' ELSE 'Mov. Saída' END AS tipo,
					mo.id,
					f.nm_filial AS filial,
					l.nm_local AS local,
					u.name AS usuario,
					'' AS detalhes
					FROM scm_movimentacao_item mi
					INNER JOIN scm_movimentacao_doc mo ON mo.id = mi.id_movimentacao_doc
					INNER JOIN scm_filial f ON f.id = mo.id_filial
					INNER JOIN scm_local l ON l.id = mo.id_local
					INNER JOIN scm_user u ON u.id = mo.id_usuario
					INNER JOIN scm_user_empresa ue ON ue.id_empresa = f.id_empresa
					";
			$query .= " WHERE mi.id_maquina = " . $id_maquina;
			$query .= " AND ue.user_id = " . Zend_Auth::getInstance()->getIdentity()->id;
		}
		
		
		if($transformacoes){
			if($movimentacoes) $query .= " UNION ALL ";
			
			$query .= "					
					SELECT
					1 AS ordem,
					td.dt_sistema AS dt_sistema,
					td.dt_transformacao AS data,
					'Transformação' AS tipo,
					td.id,
					f.nm_filial AS filial,
					l.nm_local AS local,
					u.name AS usuario,
					'' AS detalhes
					FROM scm_transformacao_item ti
					INNER JOIN scm_transformacao_doc td ON td.id = ti.id_transformacao_doc
					INNER JOIN scm_filial f ON f.id = td.id_filial
					INNER JOIN scm_local l ON l.id = td.id_local
					INNER JOIN scm_user u ON u.id = td.id_usuario
					INNER JOIN scm_user_empresa ue ON ue.id_empresa = f.id_empresa
					";
			$query .= " WHERE ti.id_maquina = " . $id_maquina;
			$query .= " AND ue.user_id = " . Zend_Auth::getInstance()->getIdentity()->id;
		}
		
		if($regularizacoes){
			
			if($movimentacoes || $transformacoes) $query .= " UNION ALL ";
			
			$query .= "
					SELECT
					1 AS ordem,
					rd.dt_sistema AS dt_sistema,
					rd.dt_regularizacao AS data,
					CASE WHEN rd.tp_regularizacao = 'C' THEN 'Regularização-Cont.' ELSE 'Regularização-Falha' END AS tipo,
					rd.id,
					f.nm_filial AS filial,
					l.nm_local AS local,
					u.name AS usuario,
					'' AS detalhes
					FROM scm_regularizacao_item ri
					INNER JOIN scm_regularizacao_doc rd ON rd.id = ri.id_regularizacao_doc
					INNER JOIN scm_filial f ON f.id = rd.id_filial
					INNER JOIN scm_local l ON l.id = rd.id_local
					INNER JOIN scm_user u ON u.id = rd.id_usuario
					INNER JOIN scm_user_empresa ue ON ue.id_empresa = f.id_empresa
					";
			$query .= " WHERE ri.id_maquina = " . $id_maquina;
			$query .= " AND ue.user_id = " . Zend_Auth::getInstance()->getIdentity()->id;
		}
		
		if($status){
			
			if($movimentacoes || $transformacoes || $regularizacoes) $query .= " UNION ALL ";
			
			$query .= "
					SELECT
					2 AS ordem,
					hs.dt_sistema AS dt_sistema,
					hs.dt_status AS data,
					'Mudança Status' AS tipo,
					hs.id,
					f.nm_filial AS filial,
					l.nm_local AS local,
					u.name AS usuario,
					st.nm_status_maquina AS detalhes
					FROM scm_historico_status hs
					INNER JOIN scm_filial f ON f.id = hs.id_filial
					INNER JOIN scm_status_maquina st ON st.id = hs.id_status
					INNER JOIN scm_local l ON l.id = hs.id_local
					INNER JOIN scm_user u ON u.id = hs.id_usuario
					INNER JOIN scm_user_empresa ue ON ue.id_empresa = f.id_empresa
					";
			$query .= " WHERE hs.id_maquina = " . $id_maquina;
			$query .= " AND ue.user_id = " . Zend_Auth::getInstance()->getIdentity()->id;
		}
		
		if($percent){
			
			if($movimentacoes || $transformacoes || $regularizacoes || $status) $query .= " UNION ALL ";
			
			$query .= "
					SELECT
					3 AS ordem,
					a.dt_sistema AS dt_sistema,
					a.dt_sistema AS data,
					'Ajuste Percentual' AS tipo,
					a.id,
					f.nm_filial AS filial,
					l.nm_local AS local,
					u.name AS usuario,
					a.percent_local_old || '% => ' || a.percent_local_new ||  '%'  AS detalhes
					FROM scm_ajuste_percentual a
					INNER JOIN scm_filial f ON f.id = a.id_filial
					INNER JOIN scm_local l ON l.id = a.id_local
					INNER JOIN scm_user u ON u.id = a.id_usuario
					INNER JOIN scm_user_empresa ue ON ue.id_empresa = f.id_empresa
					";
			$query .= " WHERE a.id_maquina = " . $id_maquina;
			$query .= " AND ue.user_id = " . Zend_Auth::getInstance()->getIdentity()->id;
		}
		
		$query .= " ORDER BY data DESC, ordem DESC";
		
		$historico = $dbhandler->query($query);
		$data = Array();
		$i = 0;

		foreach($historico as $k){
			$k = array_merge(array('indice'=>$i), $k);
			$data[] = $k;
			$i++;
		}
		echo(Zend_Json::encode(array('success'=>true, 'rows'=>$data)));
	}
	
	public function maquinaslistAction () {
		if (DMG_Acl::canAccess(25)) {
			$query = Doctrine_Query::create()
				->from('ScmMaquina m')
				->innerJoin('m.ScmFilial f')
				->innerJoin('f.ScmEmpresa e')
				->innerJoin('e.ScmUserEmpresa ue')
				->addWhere('ue.user_id = ' . Zend_Auth::getInstance()->getIdentity()->id);
			
			
			$limit = (int) $this->getRequest()->getParam('limit');
			if ($limit > 0) {
				$query->limit($limit);
			}
			$offset = (int) $this->getRequest()->getParam('start');
			if ($offset > 0) {
				$query->offset($offset);
			}
			$sort = (string) $this->getRequest()->getParam('sort');
			$dir = (string) $this->getRequest()->getParam('dir');
			if ($sort && ($dir == 'ASC' || $dir == 'DESC')) {
				$query->orderby($sort . ' ' . $dir);
			}
			
			$filtro = $this->getRequest()->getParam('query');
			if($filtro) $query->addWhere('nr_serie_imob ILIKE ?', $filtro . '%');
			
			$data = array();
			foreach ($query->execute() as $k) {
				$data[] = array(
					'id' => $k->id,
					'nr_serie_imob' => $k->nr_serie_imob
				);
			}
			echo Zend_Json::encode(array('total' => $query->count(), 'data' => $data));
		}
	}
	
}