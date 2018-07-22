<?php

/**
 * BaseScmFaturaExcecao
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 * 
 * @property integer $id
 * @property integer $id_fatura_doc
 * @property integer $id_maquina
 * @property integer $id_fatura_excecao_tipo
 * @property ScmMaquina $ScmMaquina
 * @property ScmFaturaDoc $ScmFaturaDoc
 * @property ScmFaturaExcecaoTipo $ScmFaturaExcecaoTipo
 * 
 * @package    ##PACKAGE##
 * @subpackage ##SUBPACKAGE##
 * @author     ##NAME## <##EMAIL##>
 * @version    SVN: $Id: Builder.php 6401 2009-09-24 16:12:04Z guilhermeblanco $
 */
abstract class BaseScmFaturaExcecao extends Doctrine_Record
{
    public function setTableDefinition()
    {
        $this->setTableName('scm_fatura_excecao');
        $this->hasColumn('id', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'primary' => true,
             'autoincrement' => true,
             'length' => '4',
             ));
        $this->hasColumn('id_fatura_doc', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'notnull' => true,
             'autoincrement' => false,
             'length' => '4',
             ));
        $this->hasColumn('id_maquina', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'notnull' => true,
             'autoincrement' => false,
             'length' => '4',
             ));
        $this->hasColumn('id_fatura_excecao_tipo', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'notnull' => true,
             'autoincrement' => false,
             'length' => '4',
             ));

        $this->option('collate', 'utf8_unicode_ci');
        $this->option('charset', 'utf8');
    }

    public function setUp()
    {
        parent::setUp();
    $this->hasOne('ScmMaquina', array(
             'local' => 'id_maquina',
             'foreign' => 'id'));

        $this->hasOne('ScmFaturaDoc', array(
             'local' => 'id_fatura_doc',
             'foreign' => 'id'));

        $this->hasOne('ScmFaturaExcecaoTipo', array(
             'local' => 'id_fatura_excecao_tipo',
             'foreign' => 'id'));
    }
}