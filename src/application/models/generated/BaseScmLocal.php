<?php

/**
 * BaseScmLocal
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 * 
 * @property integer $id
 * @property string $nm_local
 * @property integer $tp_local
 * @property integer $fl_portal
 * @property string $user_portal
 * @property string $pass_portal
 * @property integer $percent_local
 * @property ScmTipoLocal $ScmTipoLocal
 * @property Doctrine_Collection $ScmMaquina
 * @property Doctrine_Collection $ScmMovimentacaoDoc
 * @property Doctrine_Collection $ScmTransformacaoDoc
 * @property Doctrine_Collection $ScmRegularizacaoDoc
 * @property Doctrine_Collection $ScmSession
 * @property Doctrine_Collection $ScmHistoricoStatus
 * @property Doctrine_Collection $ScmFaturaDoc
 * @property Doctrine_Collection $ScmLocalServer
 * @property Doctrine_Collection $ScmAjustePercentual
 * 
 * @package    ##PACKAGE##
 * @subpackage ##SUBPACKAGE##
 * @author     ##NAME## <##EMAIL##>
 * @version    SVN: $Id: Builder.php 6401 2009-09-24 16:12:04Z guilhermeblanco $
 */
abstract class BaseScmLocal extends Doctrine_Record
{
    public function setTableDefinition()
    {
        $this->setTableName('scm_local');
        $this->hasColumn('id', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'primary' => true,
             'autoincrement' => true,
             'length' => '4',
             ));
        $this->hasColumn('nm_local', 'string', 45, array(
             'type' => 'string',
             'fixed' => 0,
             'primary' => false,
             'notnull' => true,
             'autoincrement' => false,
             'length' => '45',
             ));
        $this->hasColumn('tp_local', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'primary' => false,
             'notnull' => true,
             'autoincrement' => false,
             'length' => '4',
             ));
        $this->hasColumn('fl_portal', 'integer', 1, array(
             'type' => 'integer',
             'unsigned' => 0,
             'primary' => false,
             'notnull' => true,
             'autoincrement' => false,
             'default' => 0,
             'length' => '1',
             ));
        $this->hasColumn('user_portal', 'string', 50, array(
             'type' => 'string',
             'fixed' => 0,
             'primary' => false,
             'notnull' => false,
             'length' => '50',
             ));
        $this->hasColumn('pass_portal', 'string', 20, array(
             'type' => 'string',
             'fixed' => 0,
             'primary' => false,
             'notnull' => false,
             'length' => '20',
             ));
        $this->hasColumn('percent_local', 'integer', null, array(
             'type' => 'integer',
             'notnull' => false,
             ));


        $this->index('userunique', array(
             'fields' => 
             array(
              0 => 'user_portal',
             ),
             'type' => 'unique',
             ));
    }

    public function setUp()
    {
        parent::setUp();
    $this->hasOne('ScmTipoLocal', array(
             'local' => 'tp_local',
             'foreign' => 'id'));

        $this->hasMany('ScmMaquina', array(
             'local' => 'id',
             'foreign' => 'id_local'));

        $this->hasMany('ScmMovimentacaoDoc', array(
             'local' => 'id',
             'foreign' => 'id_local'));

        $this->hasMany('ScmTransformacaoDoc', array(
             'local' => 'id',
             'foreign' => 'id_local'));

        $this->hasMany('ScmRegularizacaoDoc', array(
             'local' => 'id',
             'foreign' => 'id_local'));

        $this->hasMany('ScmSession', array(
             'local' => 'id',
             'foreign' => 'id_local'));

        $this->hasMany('ScmHistoricoStatus', array(
             'local' => 'id',
             'foreign' => 'id_local'));

        $this->hasMany('ScmFaturaDoc', array(
             'local' => 'id',
             'foreign' => 'id_local'));

        $this->hasMany('ScmLocalServer', array(
             'local' => 'id',
             'foreign' => 'id_local'));

        $this->hasMany('ScmAjustePercentual', array(
             'local' => 'id',
             'foreign' => 'id_local'));
    }
}