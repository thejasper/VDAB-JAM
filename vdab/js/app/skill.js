var SkillPrototype = {
	/************************************************************************************************
	 * Properties																					*
	 ************************************************************************************************/
	parent: null,
	skillID: 0,
	skill: "",
	position: 0,
	
	/************************************************************************************************
	 * Functional methods																			*
	 ************************************************************************************************/
	 /**
	  * Save the changes to the skill to the database
	  */
	save: function() {
		_skill = this;
		
		var saveSkill = $.ajax({
			type: "POST",
			url: "/skill/update/"+ _skill.skillID,
			data: {
				'Skill[skill]': _skill.skill,
				'Skill[position]': _skill.position,
				'Skill[userID]': _skill.parent.userID,
				'Skill[linkedinUserID]': _skill.parent.linkedinUserID
			},
			dataType: "json"
		});
		
		saveSkill.done(function(data) {
			if(data.status == "saved") {
				// Todo: Saving was succesfull
			} else {
				//Todo: An error occured
			}
		});
	},
	
	create: function(created, failed) {
		_skill = this;
		
		var createSkill = $.ajax({
			type: "POST",
			url: "/skill/create",
			data: {
				'Skill[skill]': _skill.skill,
				'Skill[position]': _skill.position,
				'Skill[userID]': _skill.parent.userID,
				'Skill[linkedinUserID]': _skill.parent.linkedinUserID				
			},
			dataType: "json"
		});
		
		createSkill.done(function(data) {
			if(data.status == "created") {
				_skill.skillID = data.skillID;
				created(_skill);
			} else {
				//Todo: An error occured
			}
		});
	},
	
	/**
	 * Remove the skill from the database
	 * @params deleted: function			Callback function if the element was successfully deleted
	 * @params failed: function				Callback function for when the deletion of the skill failed
	 */
	remove: function(deleted, failed) {
		_skill = this;
		var removeSkill = $.ajax({
			type: "GET",
			url: "/skill/delete",
			data: {id: _skill.skillID},
			dataType: "json"
		});
		
		removeSkill.done(function(data) {
			if(data.status == "deleted") {
				deleted(_skill);
			}
		});
	},
	
	/************************************************************************************************
	 * Layout methods																				*
	 ************************************************************************************************/
	/**
	 * Draw the skill element as a part of the cube
	 */
	draw: function() {
		return '<div class="row" id="'+ this.skillID +'" draggable="true">'+ this.skill +'</div>';
	},
	
	/**
	 * Draw a skill suggestion element$
	 */
	drawSuggestion: function() {
		return '<div class="suggestion"  id="'+ this.skillID +'" draggable="true">'+ this.skill +'</div>';
	}
};

/************************************************************************************************
 * Constructor																					*
 ************************************************************************************************/
function Skill(parent, skillID, skill, position) {
	if(parent !== undefined) {
		this.parent = parent;
	}
	if(skillID !== undefined) {
		this.skillID = skillID;
	}
	if(skill !== undefined) {
		this.skill = skill;
	}
	if(position !== undefined) {
		this.position = position;
	}
}

Skill.prototype = SkillPrototype;
Skill.prototype.constructor = Skill;