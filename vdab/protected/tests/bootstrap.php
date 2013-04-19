<?php

// change the following paths if necessary
$yiit='F:\Documents\Dropbox\School\4IC\Sociale intelligente media\Labos\Project\Website\framework\yiit.php';
$config=dirname(__FILE__).'/../config/test.php';

require_once($yiit);
require_once(dirname(__FILE__).'/WebTestCase.php');

Yii::createWebApplication($config);
