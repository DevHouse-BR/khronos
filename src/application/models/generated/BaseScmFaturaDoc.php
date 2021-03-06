<?php

/**
 * BaseScmFaturaDoc
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 * 
 * @property integer $id
 * @property string $nr_fatura
 * @property integer $id_fatura_doc_status
 * @property timestamp $dt_fatura
 * @property integer $id_origem
 * @property integer $id_filial
 * @property integer $id_local
 * @property integer $id_parceiro
 * @property integer $id_moeda
 * @property integer $id_usuario
 * @property integer $id_usuario_confirmacao
 * @property timestamp $dt_sistema
 * @property ScmFilial $ScmFilial
 * @property ScmLocal $ScmLocal
 * @property ScmParceiro $ScmParceiro
 * @property ScmMoeda $ScmMoeda
 * @property ScmUser $ScmUser_1
 * @property ScmUser $ScmUser_2
 * @property ScmFaturaDocStatus $ScmFaturaDocStatus
 * @property Doctrine_Collection $ScmFaturaItem
 * @property Doctrine_Collection $ScmFaturaExcecao
 * 
 * @package    ##PACKAGE##
 * @subpackage ##SUBPACKAGE##
 * @author     ##NAME## <##EMAIL##>
 * @version    SVN: $Id: Builder.php 6401 2009-09-24 16:12:04Z guilhermeblanco $
 */
abstract class BaseScmFaturaDoc extends Doctrine_Record
{
    public function setTableDefinition()
    {
        $this->setTableName('scm_fatura_doc');
        $this->hasColumn('id', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'primary' => true,
             'autoincrement' => true,
             'length' => '4',
             ));
        $this->hasColumn('nr_fatura', 'string', 20, array(
             'type' => 'string',
             'unsigned' => 0,
             'notnull' => false,
             'unique' => true,
             'length' => '20',
             ));
        $this->hasColumn('id_fatura_doc_status', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'unique' => true,
             'autoincrement' => false,
             'length' => '4',
             ));
        $this->hasColumn('dt_fatura', 'timestamp', null, array(
             'type' => 'timestamp',
             'notnull' => true,
             ));
        $this->hasColumn('id_origem', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'notnull' => true,
             'autoincrement' => false,
             'length' => '4',
             ));
        $this->hasColumn('id_filial', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'notnull' => true,
             'autoincrement' => false,
             'length' => '4',
             ));
        $this->hasColumn('id_local', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'notnull' => true,
             'autoincrement' => false,
             'length' => '4',
             ));
        $this->hasColumn('id_parceiro', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'notnull' => false,
             'autoincrement' => false,
             'length' => '4',
             ));
        $this->hasColumn('id_moeda', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'notnull' => true,
             'autoincrement' => false,
             'length' => '4',
             ));
        $this->hasColumn('id_usuario', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'notnull' => true,
             'autoincrement' => false,
             'length' => '4',
             ));
        $this->hasColumn('id_usuario_confirmacao', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'notnull' => false,
             'autoincrement' => false,
             'length' => '4',
             ));
        $this->hasColumn('dt_sistema', 'timestamp', null, array(
             'type' => 'timestamp',
             'notnull' => true,
             ));

        $this->option('collate', 'utf8_unicode_ci');
        $this->option('charset', 'utf8');
    }

    public function setUp()
    {
        parent::setUp();
    $this->hasOne('ScmFilial', array(
             'local' => 'id_filial',
             'foreign' => 'id'));

        $this->hasOne('ScmLocal', array(
             'local' => 'id_local',
             'foreign' => 'id'));

        $this->hasOne('ScmParceiro', array(
             'local' => 'id_parceiro',
             'foreign' => 'id'));

        $this->hasOne('ScmMoeda', array(
             'local' => 'id_moeda',
             'foreign' => 'id'));

        $this->hasOne('ScmUser as ScmUser_1', array(
             'local' => 'id_usuario',
             'foreign' => 'id'));

        $this->hasOne('ScmUser as ScmUser_2', array(
             'local' => 'id_usuario_confirmacao',
             'foreign' => 'id'));

        $this->hasOne('ScmFaturaDocStatus', array(
             'local' => 'id_fatura_doc_status',
             'foreign' => 'id'));

        $this->hasMany('ScmFaturaItem', array(
             'local' => 'id',
             'foreign' => 'id_fatura_doc'));

        $this->hasMany('ScmFaturaExcecao', array(
             'local' => 'id',
             'foreign' => 'id_fatura_doc'));
    }
}