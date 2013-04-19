<?php
session_name('linkedin');
session_start();
class SiteController extends Controller
{
	/**
	 * Declares class-based actions.
	 */
	public function actions()
	{
		return array(
			// captcha action renders the CAPTCHA image displayed on the contact page
			'captcha'=>array(
				'class'=>'CCaptchaAction',
				'backColor'=>0xFFFFFF,
			),
			// page action renders "static" pages stored under 'protected/views/site/pages'
			// They can be accessed via: index.php?r=site/page&view=FileName
			'page'=>array(
				'class'=>'CViewAction',
			),
		);
	}

	/**
	 * This is the default 'index' action that is invoked
	 * when an action is not explicitly requested by users.
	 */
	public function actionIndex()
	{
		// renders the view file 'protected/views/site/index.php'
		// using the default layout 'protected/views/layouts/main.php'
		$this->render('index');
	}

	/**
	 * This is the action to handle external exceptions.
	 */
	public function actionError()
	{
		if($error=Yii::app()->errorHandler->error)
		{
			if(Yii::app()->request->isAjaxRequest)
				echo $error['message'];
			else
				$this->render('error', $error);
		}
	}
	
	public function actionIntro() {
		$this->renderPartial('intro', array(
										'connected' => $this->checklinkedInConnection(),
							));
	}

	/**
	 * Displays the contact page
	 */
	public function actionContact()
	{
		$model=new ContactForm;
		if(isset($_POST['ContactForm']))
		{
			$model->attributes=$_POST['ContactForm'];
			if($model->validate())
			{
				$name='=?UTF-8?B?'.base64_encode($model->name).'?=';
				$subject='=?UTF-8?B?'.base64_encode($model->subject).'?=';
				$headers="From: $name <{$model->email}>\r\n".
					"Reply-To: {$model->email}\r\n".
					"MIME-Version: 1.0\r\n".
					"Content-type: text/plain; charset=UTF-8";

				mail(Yii::app()->params['adminEmail'],$subject,$model->body,$headers);
				Yii::app()->user->setFlash('contact','Thank you for contacting us. We will respond to you as soon as possible.');
				$this->refresh();
			}
		}
		$this->render('contact',array('model'=>$model));
	}

	/**
	 * Displays the login page
	 */
	public function actionLogin()
	{
		$model=new LoginForm;

		// if it is ajax validation request
		if(isset($_POST['ajax']) && $_POST['ajax']==='login-form')
		{
			echo CActiveForm::validate($model);
			Yii::app()->end();
		}

		// collect user input data
		if(isset($_POST['LoginForm']))
		{
			$model->attributes=$_POST['LoginForm'];
			// validate user input and redirect to the previous page if valid
			if($model->validate() && $model->login())
				$this->redirect(Yii::app()->user->returnUrl);
		}
		// display the login form
		$this->render('login',array('model'=>$model));
	}

	/**
	 * Logs out the current user and redirect to homepage.
	 */
	public function actionLogout()
	{
		Yii::app()->user->logout();
		$this->redirect(Yii::app()->homeUrl);
	}
	
	public function checklinkedInConnection() {

		if ((empty($_SESSION['expires_at'])) || (time() > $_SESSION['expires_at'])) {
			return false;
		}
		if (empty($_SESSION['access_token'])) {
			return false;		
		}
		return true;
	}
	
	public function actionGetLinkedinUserID() {
		$user = $this->fetch('GET', '/v1/people/~:(id)');
		echo json_encode(array('linkedinUserID' => $user['id']));
	}
	
	
	public function linkedIn($userID)
	{
		// Change these
		define('API_KEY', '01l2xzp0fr4k');
		define('API_SECRET', 'bVQjRWjdEk0fnka1');		
		define('REDIRECT_URI', 'http://vdab.boetn.be/site/connect');
		define('SCOPE', 'r_fullprofile r_basicprofile r_contactinfo');
		//define('REDIRECT_URI', 'http://' . $_SERVER['SERVER_NAME'] . $_SERVER['SCRIPT_NAME']);
		
		
		// You'll probably use a database
		
		
		// OAuth 2 Control Flow
		if (isset($_GET['error'])) {
			// LinkedIn returned an error
			print $_GET['error'] . ': ' . $_GET['error_description'];
			exit;
		} elseif (isset($_GET['code'])) {
			// User authorized your application
			if ($_SESSION['state'] == $_GET['state']) {
				// Get token so you can make API calls
        		$this->getAccessToken();
			} else {
        		// CSRF attack? Or did you mix up your states?
        		exit;
			}
		} else {
			if ((empty($_SESSION['expires_at'])) || (time() > $_SESSION['expires_at'])) {
				// Token has expired, clear the state
				$_SESSION = array();
			}
			if (empty($_SESSION['access_token'])) {
				// Start authorization process
				$this->getAuthorizationCode();
				
			}
		}
		$user = $this->fetch('GET', '/v1/people/~:(id)');
		$linkedinID = $user['id'];
		
		//Get skills
		$skills = $this->fetch('GET', '/v1/people/~:(skills)');	
		$values = $skills['skills']['values'];
		$length = count($values);
		
		//Get skills already in database for this user
		$skillsDatabase = Skill::model()->findAll('linkedinUserID=:linkedinUserID' , array(':linkedinUserID' => $linkedinID));
		$count = count($skillsDatabase);		
		//Foreach skill in skills from LinkedIn
		for ($i = 0; $i < $length; $i++) {
			$skillvalue = $values[$i]['skill']['name'];
		 	$test = false;
		 	foreach ($skillsDatabase as $skill)	{				
				if($skill->skill == $skillvalue){
					$test = true;
					break;
				}		
			}
			if($test == false){
				$count++;
				$this->saveSkill($userID, $skillvalue, $count, $linkedinID);
			}
		}
		
		//
		$others = $this->fetch('GET', '/v1/people/~:(following,suggestions,positions)');
		
		$companyDatabase = Company::model()->findAll('linkedinUserID=:linkedinUserID' , array(':linkedinUserID' => $linkedinID));	
		$count = count($companyDatabase);	
		$following = $others['following']['companies']['values'];
		$length = count($following);		
		
		for ($i = 0; $i < $length; $i++) 
		{	
			$test = false;
			foreach ($companyDatabase as $company)	{				
				if($company->linkedinCompanyID == $following[$i]['id']){
				 $test = true;
				}		
			}
			if($test == false){
				$count++;	
				$this->saveCompany($userID,$following[$i]['name'], $count,$following[$i]['id'],$linkedinID);
			}		
		}
	
		$companyDatabase = Company::model()->findAll('linkedinUserID=:linkedinUserID' , array(':linkedinUserID' => $linkedinID));	
		$suggestions = $others['suggestions']['toFollow']['companies']['values'];
		$length = count($suggestions);
		
		for ($i = 0; $i < $length; $i++) {
			$test = false;
			foreach ($companyDatabase as $company)	{				
				if($company->linkedinCompanyID == $suggestions[$i]['id']){
					$test = true;
				}		
			}
			if($test == false){	
				$count++;
				$this->saveCompany($userID, $suggestions[$i]['name'], $count, $suggestions[$i]['id'], $linkedinID);
			}
		}
				
		$companyDatabase = Company::model()->findAll('linkedinUserID=:linkedinUserID' , array(':linkedinUserID' => $linkedinID));		
		$positions = $others['positions']['values'];		
		$length = count($positions);
		
		for ($i = 0; $i < $length; $i++) {
			$test = false;
			foreach ($companyDatabase as $company) {
				if($company->linkedinCompanyID == $positions[$i]['company']['id']){
					$test = true;
				}		
			}
			if($test == false){	
				$count++;
				$this->saveCompany($userID,$positions[$i]['company']['name'], $count,$positions[$i]['company']['id'],$linkedinID);
			}
		}
	
	}
	
	//Skill to database
	public function saveSkill($userID,$desc,$position,$linkedinID)
	{
		$skill = new Skill();
		$skill->skill=(string)$desc;
		$skill->linkedinUserID = (string) $linkedinID;
		$skill->userID=(int)$userID;
		$skill->position=(int)$position;
		$skill->save();
	}
	
	
	//Company to database
	public function saveCompany($userID,$comp,$position,$id,$linkedinID)
	{
		$company = new Company();
		$company->company = (string)$comp;
		$company->position = (int)$position;
		$company->userID =(int)$userID;
		$company->linkedinCompanyID = (int)$id;
		$company->linkedinUserID = (string) $linkedinID;
		$company->save();	
	}
	
	public function actionConnect()
	{
		//HARDCODED USERID
		$userID = 1;		
		//LinkedIn => data ophalen
		$this->linkedIn($userID);
		
		$this->redirect(Yii::app()->homeUrl);		
	}
	
	public function actionVacancies() {
		$userID = (isset($_GET["userID"])) ? $_GET["userID"] : 0; // ToDo: if userID is linked to vdab dataset, implement it
		$linkedinUserID = (isset($_GET["linkedinUserID"])) ? $_GET["linkedinUserID"] : 0;
		
		// INPUT: the skills and companies fetched from linkedin
		$skills = Skill::model()->findAll(array(
			'select' => 'skill',
			'condition' => 'linkedinUserID=:linkedinUserID && position!=:position',
			'params' => array(
				'linkedinUserID' => $linkedinUserID,
				'position' => -1,
			),
			'order' => 'position',
			'limit' => 2,
		));
		$skillArray = array();
		foreach($skills as $skill) {
			$skillArray[] = $skill->skill;
		}
		$companies = Company::model()->findAll(array(
			'select' => 'company',
			'params' => array(
				'linkedinUserID' => $linkedinUserID,
				'position' => -1,
			),
			'params' => array('linkedinUserID' => $linkedinUserID),
			'order' => 'position',
			'limit' => 0,
		));
		$companyArray = array();
		/*foreach($companies as $company) {
			$companyArray[] = $company->company;
		}*/
		
		// search for some vacancies with the skills as keywords
		$jobs = VDAB::search_vacancies($skillArray, $companyArray);
		
		$jobArray = array();
		// OUTPUT: print info about each job
		for ($i = 0; $i < count($jobs); $i++)
		{
			$jobArray[$i]["title"] = $jobs[$i]->title;
			$jobArray[$i]["skillVector"] = array_sum($jobs[$i]->skill_vector);
			$jobArray[$i]["company"] = $jobs[$i]->company;
			$jobArray[$i]["location"] = $jobs[$i]->location;
			$jobArray[$i]["url"] = htmlspecialchars($jobs[$i]->url);
		}
		echo json_encode($jobArray);
	}
	
	public function getAuthorizationCode() {
		$params = array('response_type' => 'code',
						'client_id' => API_KEY,
						'scope' => SCOPE,
						'state' => uniqid('', true), // unique long string
						'redirect_uri' => REDIRECT_URI,
				  );
	 
		// Authentication request
		$url = 'https://www.linkedin.com/uas/oauth2/authorization?' . http_build_query($params);
		 
		// Needed to identify request when it returns to us
		$_SESSION['state'] = $params['state'];
	 
		// Redirect user to authenticate
		header("Location: $url");
		exit;
	}
     
	public function getAccessToken() {
		$params = array('grant_type' => 'authorization_code',
						'client_id' => API_KEY,
						'client_secret' => API_SECRET,
						'code' => $_GET['code'],
						'redirect_uri' => REDIRECT_URI,
				  );
		 
		// Access Token request
		$url = 'https://www.linkedin.com/uas/oauth2/accessToken?' . http_build_query($params);
		 
		// Tell streams to make a POST request
		$context = stream_context_create(
						array('http' =>
							array('method' => 'POST')
						));
	 
		// Retrieve access token information
		$response = file_get_contents($url, false, $context);
	 
		// Native PHP object, please
		$token = json_decode($response);
	 
		// Store access token and expiration time
		$_SESSION['access_token'] = $token->access_token; // guard this!
		$_SESSION['expires_in']   = $token->expires_in; // relative time (in seconds)
		$_SESSION['expires_at']   = time() + $_SESSION['expires_in']; // absolute time
		 
		return true;
	}
	 
	public function fetch($method, $resource, $body = '') {
		$params = array('oauth2_access_token' => $_SESSION['access_token'],
						'format' => 'json',
				  );
		 
		// Need to use HTTPS
		$url = 'https://api.linkedin.com' . $resource . '?' . http_build_query($params);
		// Tell streams to make a (GET, POST, PUT, or DELETE) request
		$context = stream_context_create(
						array('http' =>
							array('method' => $method)
						));
	  
		// Hocus Pocus
		$response = file_get_contents($url, false, $context);
	 
		// Native PHP object, please
		return json_decode($response, true);
	}
	
	public function actionGetMoreInfo() {
		$url = (isset($_GET["url"])) ? $_GET["url"] : "";
		$advanced = "";
		if($url != "") {
			$vac = new Vacancy('','',$url, '', '');
			$advanced = $vac->get_vacature_html();
		}
		echo json_encode(array('advanced' => $advanced));
	}
}
