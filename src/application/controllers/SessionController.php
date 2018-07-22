<?php

class SessionController extends Zend_Controller_Action {
	public function init () {
		$this->_helper->viewRenderer->setNoRender(true);
		$this->view->headMeta()->appendHttpEquiv('Content-Type', 'application/json; charset=UTF-8');
	}
	public function deleteAction () {
		if (DMG_Acl::canAccess(78)) {
			$id = $this->getRequest()->getParam('id');
			if (!is_array($id)) {
				$id = array($id);
			}
			$query = Doctrine_Query::create()
				->from('ScmSession s')
				->whereIn('s.id', $id)
			;
			foreach ($query->execute() as $k) {
				@unlink(session_save_path() . DIRECTORY_SEPARATOR . 'sess_' . $k->phpsessid);
				$k->disconnected = 1;
				$k->save();
			}
			echo Zend_Json::encode(array('success' => true));
		}
	}
	public function listAction () {
		if (DMG_Acl::canAccess(77)) {
			$query = Doctrine_Query::create()
				->from('ScmSession s')
				->innerJoin('s.ScmUser u')
				->orderBy('s.dt_ultimo_contato_sessao DESC')
				->where('s.dt_fim_sessao IS NULL')
				->addWhere('s.dt_ultimo_contato_sessao + interval \'' . DMG_Config::get(15) . ' minutes\' > NOW()')
			;
			DMG_Crud::paginate($this, $query, (int) $this->getRequest()->getParam('limit'), (int) $this->getRequest()->getParam('start'), $this->getRequest()->getParam('sort'), $this->getRequest()->getParam('dir'));
			DMG_Crud::filter($this, $query, $this->getRequest()->getParam('filter'));
			$data = array();
			foreach ($query->execute() as $k) {
				$data[] = array(
					'id' => $k->id,
					'nm_usuario' => $k->ScmUser->name,
					'ip' => $k->ip,
					'dt_inicio_sessao' => $k->dt_inicio_sessao,
					'dt_ultimo_contato_sessao' => $k->dt_ultimo_contato_sessao,
				);
			}
			echo Zend_Json::encode(array('success' => true, 'total' => $query->count(), 'data' => $data));
		}
	}
}