<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="language" content="en" />

	<!-- blueprint CSS framework -->
	<link rel="stylesheet" type="text/css" href="<?php echo Yii::app()->request->baseUrl; ?>/css/main.css" media="screen, projection" />
	<title><?php echo CHtml::encode($this->pageTitle); ?></title>

    
     <?php  
		$baseUrl = Yii::app()->baseUrl; 
	  	$js = Yii::app()->getClientScript();
		$js->registerScriptFile($baseUrl .'/js/jquery/jquery-1.9.1.js');
		$js->registerScriptFile($baseUrl .'/js/app/skill.js');
		$js->registerScriptFile($baseUrl .'/js/app/company.js');
		$js->registerScriptFile($baseUrl .'/js/app/side.js');
		$js->registerScriptFile($baseUrl .'/js/app/cube.js');
		$js->registerScriptFile($baseUrl .'/js/app/app.js');
	?>
   	
    <script>
		$(document).ready(function(e) {
			var app = new App();
			app.init();
		});
	</script>
</head>
<body>

<div class="container">

    <header>
    	<div class="heading">
        	<a href="<?php echo Yii::app()->homeUrl; ?>">
            	<img src="<?php echo Yii::app()->request->baseUrl; ?>/layout/vdab-flag.png" alt="vdab-flag"/>
            </a>
            <h1>Skills</h1>
            <h2>Jobadvisor</h2>
        </div>
    </header>
    
    <div class="content">
        <div class="advisor">
            <img src="<?php echo Yii::app()->request->baseUrl; ?>/layout/arrowLeft.png" alt="Arrow-left" class="arrowLeft" />
            <section class="cubeContainer">
              <div id="cube" class="show-front">
                
              </div>
            </section>
            <img src="<?php echo Yii::app()->request->baseUrl; ?>/layout/arrowRight.png" alt="Arrow-right" class="arrowRight" />
        </div>
        
        <div class="skill suggestions">
        </div>
        <div class="company suggestions">
        </div>
	</div>

</div><!-- page -->

</body>
</html>
