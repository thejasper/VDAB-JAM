<?php
/* @var $this SkillController */
/* @var $data Skill */
?>

<div class="view">

	<b><?php echo CHtml::encode($data->getAttributeLabel('skillID')); ?>:</b>
	<?php echo CHtml::link(CHtml::encode($data->skillID), array('view', 'id'=>$data->skillID)); ?>
	<br />

	<b><?php echo CHtml::encode($data->getAttributeLabel('skill')); ?>:</b>
	<?php echo CHtml::encode($data->skill); ?>
	<br />

	<b><?php echo CHtml::encode($data->getAttributeLabel('userID')); ?>:</b>
	<?php echo CHtml::encode($data->userID); ?>
	<br />

	<b><?php echo CHtml::encode($data->getAttributeLabel('position')); ?>:</b>
	<?php echo CHtml::encode($data->position); ?>
	<br />


</div>