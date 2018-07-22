<?php

class ConsultaParqueController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	/*
	 *  o metodo getAction busca os servidores para as maquinas com ids passados via POST 
	 *  em um determinado local (pesquisado na lista das maquinas, se existir mais de um local apenas o primeiro da lista será usado)
	 *  e retorna o id de cada maquina com seu status e contadores.
	 */
	public function getAction () {
		Khronos_Servidor::getContadoresPorMaquinas($this->getRequest()->getParam('id'));
	}
	public function listAction () {
		if (DMG_Acl::canAccess(30)) {
			$local = $this->getRequest()->getParam('local');
			
			if($local){
				$query = Doctrine_Query::create()->from('ScmMaquina m')->where('m.id_local = ' . $local);
				$query->innerJoin('m.ScmStatusMaquina s')->addWhere('s.fl_alta = ?', 1);
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
				$filter = $this->getRequest()->getParam('filter');
				if (is_array($filter)) {
					foreach ($filter as $k) {
						switch ($k['data']['type']) {
							case 'string':
								$query->addWhere($k['field'] . ' ILIKE ?', '%' . $k['data']['value'] . '%');
							break;
							case 'list':
								$l = explode(',', $k['data']['value']);
								foreach ($l as $m) {
									$query->orWhere($k['field'] . ' = ?', $m);
								}
							break;
						}
					}
				}
				$data = array();
				foreach ($query->execute() as $k) {
					$data[] = array(
						'id' => $k->id,
						'nr_serie_imob' => $k->nr_serie_imob,
						'nr_serie_aux' => $k->nr_serie_aux,
						'nm_jogo' => $k->ScmJogo->nm_jogo,
						'nr_versao_jogo' => $k->nr_versao_jogo,
						'simbolo_moeda' => $k->ScmMoeda->simbolo_moeda,
						'nm_status_maquina' => $k->ScmStatusMaquina->nm_status_maquina,
						'id_local' => $k->id_local,
						'id_protocolo' => $k->id_protocolo,
						'nr_serie_connect' => $k->nr_serie_connect,
						'vl_credito' => Khronos_Moeda::format($k->vl_credito),
					);
				}
				echo Zend_Json::encode(array('total' => $query->count(), 'data' => $data));
			}
		}
	}
}