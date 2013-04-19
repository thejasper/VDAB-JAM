<?php

class SkillController extends Controller
{
	/**
	 * @var string the default layout for the views. Defaults to '//layouts/column2', meaning
	 * using two-column layout. See 'protected/views/layouts/column2.php'.
	 */
	public $layout='//layouts/column2';

	/**
	 * @return array action filters
	 */
	public function filters()
	{
		return array(
			//'accessControl', // perform access control for CRUD operations
			//'postOnly + delete', // we only allow deletion via POST request
		);
	}

	/**
	 * Specifies the access control rules.
	 * This method is used by the 'accessControl' filter.
	 * @return array access control rules
	 */
	public function accessRules()
	{
		return array(
			array('allow',  // allow all users to perform 'index' and 'view' actions
				'actions'=>array('index','view', 'getAll', 'delete', 'admin'),
				'users'=>array('*'),
			),
			array('allow', // allow authenticated user to perform 'create' and 'update' actions
				'actions'=>array('create','update'),
				'users'=>array('@'),
			),
			array('allow', // allow admin user to perform 'admin' and 'delete' actions
				'actions'=>array(),
				'users'=>array('admin'),
			),
			array('deny',  // deny all users
				'users'=>array('*'),
			),
		);
	}

	/**
	 * Displays a particular model.
	 * @param integer $id the ID of the model to be displayed
	 */
	public function actionView($id)
	{
		$this->render('view',array(
			'model'=>$this->loadModel($id),
		));
	}
	
	public function actionGetAll() {
		$userID = (isset($_GET['userID'])) ? $_GET["userID"] : 0;
		$linkedinUserID = (isset($_GET['linkedinUserID'])) ? $_GET["linkedinUserID"] : 0;
		
		if($userID != 0) {
			$skillArray = array();
			$skills = Skill::model()->findAll(array(
				'condition' => 'linkedinUserID=:linkedinUserID and position!=:position', 
				'params' => array(':linkedinUserID' => $linkedinUserID, ':position' => -1),
				'order' => 'position, skillID'
			));
			
			foreach($skills as $skill) {
				$skillArray[] = [
							"skillID" => $skill->skillID,
							"skill" => $skill->skill,
							"position" => $skill->position];
			}
			echo json_encode($skillArray);
		}
	}	
	

	/**
	 * Creates a new model.
	 * If creation is successful, the browser will be redirected to the 'view' page.
	 */
	public function actionCreate()
	{
		$model=new Skill;

		if(isset($_POST['Skill']))
		{
			$model->attributes=$_POST['Skill'];
			if($model->save())
				echo json_encode(array('status' => 'created', 'skillID' => $model->skillID));
		}
	}

	/**
	 * Updates a particular model.
	 * If update is successful, the browser will be redirected to the 'view' page.
	 * @param integer $id the ID of the model to be updated
	 */
	public function actionUpdate($id)
	{
		$model=$this->loadModel($id);

		if(isset($_POST['Skill']))
		{
			$model->attributes = $_POST['Skill'];
			if($model->save())
				echo json_encode(array('status' => 'saved'));
		}
	}

	/**
	 * Deletes a particular model.
	 * If deletion is successful, the browser will be redirected to the 'admin' page.
	 * @param integer $id the ID of the model to be deleted
	 */
	public function actionDelete($id)
	{
		if($id != 0){
			Skill::model()->updateByPk($id, array('position' => -1));
			echo json_encode(array('status' => 'deleted'));
		}
	}

	/**
	 * Lists all models.
	 */
	public function actionIndex()
	{
		$dataProvider=new CActiveDataProvider('Skill');
		$this->render('index',array(
			'dataProvider'=>$dataProvider,
		));
	}

	/**
	 * Manages all models.
	 */
	public function actionAdmin()
	{
		$model=new Skill('search');
		$model->unsetAttributes();  // clear any default values
		if(isset($_GET['Skill']))
			$model->attributes=$_GET['Skill'];

		$this->render('admin',array(
			'model'=>$model,
		));
	}

	/**
	 * Returns the data model based on the primary key given in the GET variable.
	 * If the data model is not found, an HTTP exception will be raised.
	 * @param integer $id the ID of the model to be loaded
	 * @return Skill the loaded model
	 * @throws CHttpException
	 */
	public function loadModel($id)
	{
		$model=Skill::model()->findByPk($id);
		if($model===null)
			throw new CHttpException(404,'The requested page does not exist.');
		return $model;
	}

	/**
	 * Performs the AJAX validation.
	 * @param Skill $model the model to be validated
	 */
	protected function performAjaxValidation($model)
	{
		if(isset($_POST['ajax']) && $_POST['ajax']==='skill-form')
		{
			echo CActiveForm::validate($model);
			Yii::app()->end();
		}
	}
}
