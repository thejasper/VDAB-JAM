<div class="intro">
	<h2>Vind je ideale job in 3 stappen:</h2>
    <ol>
    	<li><?php if($connected) echo "<s>" ?>Connecteer met LinkedIn!<?php if($connected) echo "</s>" ?></li>
        <li>Geef voor ieder onderwerp je top 6 </li>
        <li>Klik overbodige woorden weg!</li>
    </ol>
    <?php if(!$connected){ ?>
    	<a href="<?php echo $this->createUrl('site/connect'); ?>">
        	<img src="<?php echo Yii::app()->request->baseUrl; ?>/layout/connect.png" alt="connect" id="connectToLinkedin" />
        </a>
    <?php } ?>
</div>
