<?php

class Bootstrap extends Zend_Application_Bootstrap_Bootstrap {
	protected function _initDMG () {
		Zend_Loader_Autoloader::getInstance()->registerNamespace('DMG');
		Zend_Loader_Autoloader::getInstance()->registerNamespace('Khronos');
	}
	protected function _initDoctrine(){
	    $this->getApplication()->getAutoloader()
	                           ->pushAutoloader(array('Doctrine', 'autoload'));
	    spl_autoload_register(array('Doctrine', 'modelsAutoload'));
	
	    $manager = Doctrine_Manager::getInstance();
	    $manager->setAttribute(Doctrine::ATTR_AUTO_ACCESSOR_OVERRIDE, true);
	    $manager->setAttribute  (Doctrine::ATTR_MODEL_LOADING, Doctrine::MODEL_LOADING_CONSERVATIVE);
	    $manager->setAttribute(Doctrine::ATTR_AUTOLOAD_TABLE_CLASSES, true);
		$manager->setAttribute(Doctrine::ATTR_USE_DQL_CALLBACKS, true);
		$manager->setCollate('utf8_unicode_ci');
		$manager->setCharset('utf8');
	
	    $doctrineConfig = $this->getOption('doctrine');
	    /*$conn = Doctrine_Manager::connection($doctrineConfig['connection_string'], 'doctrine');
	    $conn->setAttribute(Doctrine::ATTR_USE_NATIVE_ENUM, true);
	    $conn->setCollate('utf8_unicode_ci');
	    $conn->setCharset('utf8');
	    $conn->setAttribute(Doctrine_Core::ATTR_AUTO_FREE_QUERY_OBJECTS, true );*/
	
		Doctrine::loadModels($doctrineConfig['models_path']);
		
		$manager->openConnection($doctrineConfig['connection_string']);
	    return $manager;
	}
	protected function _initPlugins () {
		$this->getPluginResource('frontcontroller')->getFrontController()->registerPlugin(new DMG_Auth_Plugin());
	}
	protected function _initRoute () {
		
		$router = Zend_Controller_Front::getInstance()->getRouter();
		
		$entry = new Zend_Controller_Router_Route_Static(
		    "showcase/khronos/",
		    array(
		    	'controller' => "index",
		        'action'     => "index" 
			)
		);
	
		$router->addRoute("khronos", $entry); 
	}
}