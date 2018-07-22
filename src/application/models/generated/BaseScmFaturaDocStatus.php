<?php

/**
 * BaseScmFaturaDocStatus
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 * 
 * @property integer $id
 * @property string $nm_fatura_doc_status
 * @property Doctrine_Collection $ScmFaturaDoc
 * 
 * @package    ##PACKAGE##
 * @subpackage ##SUBPACKAGE##
 * @author     ##NAME## <##EMAIL##>
 * @version    SVN: $Id: Builder.php 6401 2009-09-24 16:12:04Z guilhermeblanco $
 */
abstract class BaseScmFaturaDocStatus extends Doctrine_Record
{
    public function setTableDefinition()
    {
        $this->setTableName('scm_fatura_doc_status');
        $this->hasColumn('id', 'integer', 4, array(
             'type' => 'integer',
             'unsigned' => 0,
             'primary' => true,
             'autoincrement' => false,
             'length' => '4',
             ));
        $this->hasColumn('nm_fatura_doc_status', 'string', 255, array(
             'type' => 'string',
             'notnull' => true,
             'length' => '255',
             ));

        $this->option('collate', 'utf8_unicode_ci');
        $this->option('charset', 'utf8');
    }

    public function setUp()
    {
        parent::setUp();
    $this->hasMany('ScmFaturaDoc', array(
             'local' => 'id',
             'foreign' => 'id_fatura_doc_status'));
    }
}