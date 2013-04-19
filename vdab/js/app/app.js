var AppPrototype = {
	/************************************************************************************************
	 * Properties																					*
	 ************************************************************************************************/
	cube: null,
	state: "",
	userID: 1,
	linkedinUserID: "",
	skills: Array(),
	companies: Array(),
	skillPosition: 0,
	companyPosition: 0,
	
	dragSrcEl: null, // Source element that is dragged
	inputLength: 0,
	/************************************************************************************************
	 * Init																							*
	 ************************************************************************************************/
	init: function() {
		_app = this;
		this.cube = new Cube(this);
		this.cube.init();
		
		intro = new Side("Start", this.cube);
		intro.getContent("intro", this.introLoaded);
		intro.side = "front";
		this.cube.addSide(intro);
		
		skills = new Side('Skills', this.cube);
		skills.side = "right";
		this.cube.addSide(skills);
		
		companies = new Side('Companies', this.cube);
		companies.side = "back";
		this.cube.addSide(companies);
		
		this.updateState();
		this.updateSuggestions();
		
		// Event handlers for the suggestions
		$('.skill').on('mousedown', '.close', {self: this}, this.deleteSkill);
		$('.company').on('mousedown', '.close', {self: this}, this.deleteCompany);
		$('.suggestions').on('mouseenter', '.suggestion', this.showClose);
		$('.suggestions').on('mousedown', '.suggestion', this.hideClose);
		$('.suggestions').on('mouseleave', '.suggestion', this.hideClose);		
		
		// Button event handlers
		$('.advisor').on('click', '.arrowLeft', {self: this}, this.prev);
		$('.advisor').on('click', '.arrowRight', {self: this}, this.next);	
		console.log(window.navigator.appName);
		if(window.navigator.appName == "Microsoft Internet Explorer" || window.navigator.appName == "msie") {
			_app.renderUserOtherBrowser();
		}
			
	},
	
	renderUserOtherBrowser: function() {
		$('body').append('<div class="otherbrowserOverlay"></div><div class="otherBrowser">Internet explorer is momenteel nog niet ondersteund</div>');
	},
	
	/************************************************************************************************
	 * Application logic																			*
	 ************************************************************************************************/
	/**
	 * Callback function for when the intro is loaded
	 */
	introLoaded: function(cube) {
		_app = cube.parent;
		
		// Get the Linkedin userID if the user is connected to Linkedin
		if($('#connectToLinkedin').length == 0) {
			_app.getLinkedinUserID();
		} else {
			lUserID = new Date();
			_app.linkedinUserID = lUserID.toUTCString();
			_app.loadEmptyCube();
			_app.appendAddSkill();
			_app.appendAddCompany();
		}
	},
	
	/**
	 * Get the Linkedin userID from the server
	 * Store it in the app
	 */
	getLinkedinUserID: function() {
		_app = this;
		var linkedinUserIDRequest = $.ajax({
			type: "GET",
			url: "/site/getLinkedinUserID",
			dataType: "json"
		});
		
		linkedinUserIDRequest.done(function(data){
			_app.linkedinUserID = data.linkedinUserID;
			_app.getAppData();		
		});
	},
	
	/**
	 * Get the skills and companies from the server
	 */
	getAppData: function() {
		this.getSkills();
		this.getCompanies();
	},
	
	/**
	 * Get all the skills from the server
	 * Fill in the top 6 skills in the cube and display the side
	 * Place the other skills in the suggestions
	 * #using userID
	 * #using linkedinUserID
	 */
	getSkills: function() {
		_app = this;
		var skillRequest = $.ajax({
			type: "GET",
			url: "/skill/getAll",
			data: {userID: _app.userID, linkedinUserID: _app.linkedinUserID},
			dataType: "json"
		});
		
		skillRequest.done(function(data){
			// Add all the skills to the application
			$.each(data, function(i, val) {
				_app.skills.push(new Skill(_app, val.skillID, val.skill, val.position));
			});
			_app.skillPosition = _app.skills[_app.skills.length-1].position;
			// Add the top 6 skills to the cube
			side = _app.cube.getSide('Skills');
			var i = 0;
			
			for(; i < _app.skills.length; i++) {
				if(i == 6) {
					break; // Only 6 elements are allowed in the cube
				}
				side.addContent(_app.skills[i].draw());
			}
			// If there are less then 6 skills defined add empty ones
			for(; i < 6; i++) {
				side.addContent(new Skill().draw());
			}
			side.display();
			
			var skillSuggestions = $('.skill.suggestions');
			for(; i < _app.skills.length; i++) {
				skillSuggestions.append(_app.skills[i].drawSuggestion());
			}
			_app.appendAddSkill();
			
			_app.enableNext();		
		});
		
	},
	
	appendAddSkill: function() {
		_app = this;
		var skillSuggestions = $('.skill.suggestions');
		// Appand a plus sign to add skills to the suggestion box
		skillSuggestions.append('<img src="/layout/plus.png" alt="plus" class="add" />');
		$('.skill.suggestions').on('click', '.add', {self: _app}, _app.addSkillLayout);
		
		// Add event handlers for suggestions
		_app.addSuggestionEventHandlers('.skill.suggestions .suggestion');
		_app.addSuggestionEventHandlers('.Skills .row');	
		_app.addDropzoneEventHandlers('.Skills .row');	
	},
	
	/**
	 * Get all the companies from the server
	 * Fill in the top 6 companies in the cube and display the side
	 * Place the other companies in the suggestions
	 * #using userID
	 * #using linkedinUserID
	 */
	getCompanies: function() {
		_app = this;
		var companyRequest = $.ajax({
			type: "GET",
			url: "/company/getAll",
			data: {userID: _app.userID, linkedinUserID: _app.linkedinUserID},
			dataType: "json"
		});
		
		companyRequest.done(function(data){
			// Add all the skills to the application
			$.each(data, function(i, val) {
				_app.companies.push(new Company(_app, val.companyID, val.company, val.position, val.linkedinCompanyID));
			});
			_app.companyPosition = _app.companies[_app.companies.length-1].position;
			
			// Add the top 6 companies to the cube
			side = _app.cube.getSide('Companies');
			var i = 0;
			
			for(; i < _app.companies.length; i++) {
				if(i == 6) {
					break; // Only 6 elements are allowed in the cube
				}
				side.addContent(_app.companies[i].draw());
			}
			// If there are less then 6 skills defined add empty ones
			for(; i < 6; i++) {
				side.addContent(new Company().draw());
			}
			side.display();
			
			// Add all other the companies to the suggestion box
			var companySuggestions = $('.company.suggestions');
			for(; i < _app.companies.length; i++) {
				companySuggestions.append(_app.companies[i].drawSuggestion());
			}
			_app.appendAddCompany();
		});
	},
	
	appendAddCompany: function() {
		_app = this;
		// Add all other the companies to the suggestion box
		var companySuggestions = $('.company.suggestions');
		// Appand a plus sign to add companies to the suggestion box
		companySuggestions.append('<img src="/layout/plus.png" alt="plus" class="add" />');
		$('.company.suggestions').on('click', '.add', {self: _app}, _app.addCompanyLayout);
			
		// Add event handlers for suggestions
		_app.addSuggestionEventHandlers('.company.suggestions .suggestion');
		_app.addSuggestionEventHandlers('.Companies .row');
		_app.addDropzoneEventHandlers('.Companies .row');
	},
	
	getVacancies: function() {
		this.state = 'Zoeken';
		$('h1').html(this.state);
		
		$('.content').html(
					'<section class="rotatingCubeContainer">'+
						'<div id="rotatingCube">' +
							'<div class="front"></div>' +
							'<div class="right"></div>' +
							'<div class="back"></div>' +
							'<div class="left"></div>' +
							'<div class="top"></div>' +
							'<div class="bottom"></div>' +
						'</div>'+
					'</section>');
		var xAngle = 90, yAngle = 90;
		$(".rotatingCubeContainer").on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", '#rotatingCube', function(){ 
			yAngle += 90;
			xAngle += 90;
			$('#rotatingCube').css('-webkit-transform', "rotateX("+xAngle+"deg) rotateY("+yAngle+"deg)");
			$('#rotatingCube').css('-moz-transform', "rotateX("+xAngle+"deg) rotateY("+yAngle+"deg)");
			$('#rotatingCube').css('-o-transform', "rotateX("+xAngle+"deg) rotateY("+yAngle+"deg)");
			$('#rotatingCube').css('transform', "rotateX("+xAngle+"deg) rotateY("+yAngle+"deg)");
		});
		
		// Set a little delay so the functions are registered on the elements
		setTimeout(function(){
			$('#rotatingCube').css('-webkit-transform', "rotateX("+xAngle+"deg) rotateY("+yAngle+"deg)");
			$('#rotatingCube').css('-moz-transform', "rotateX("+xAngle+"deg) rotateY("+yAngle+"deg)");
			$('#rotatingCube').css('-o-transform', "rotateX("+xAngle+"deg) rotateY("+yAngle+"deg)");
			$('#rotatingCube').css('transform', "rotateX("+xAngle+"deg) rotateY("+yAngle+"deg)");}, 1000);
		
		
		var vacancyRequest = $.ajax({
			type: "GET",
			url: "/site/vacancies",
			data: {'linkedinUserID': _app.linkedinUserID},
			dataType: "json"
		});
		
		vacancyRequest.done(function(vacancies){
			this.state = 'Vacatures';
			$('h1').html(this.state);
			$('.content').html('<div class="vacancies"></div>');
			content = $('.vacancies');
			content.append('<div class="resultTitle"><div class="jobsTitle">Jobs</div><div class="vacancyLength">1-'+ vacancies.length +' van de '+ vacancies.length +' vacatures</div></div>');			
			
			$.each(vacancies, function(i, vacancy) {
				content.append(
					'<div class="vacancy" data-url='+ vacancy.url +' id='+ i +'>'+
						'<div class="title">'+ vacancy.title +'</div>'+
						'<div class="info">'+ vacancy.company +'<br />'+ vacancy.location +'</div>'+
						'<div class="moreInfo"></div>'+
						'<div class="extraInfo"><b>&or;</b> Meer informatie <b>&or;</b></div>'+ 
					'</div>'
				);
			});
			
			$('.vacancy').on('click', '.extraInfo', function() {
				self = this;
				if(!$(self).hasClass('hide')) {
					console.log($(this).parent().attr('data-url'));
					var moreInfoRequest = $.ajax({
						type: "GET",
						url: "/site/getMoreInfo",
						data: {'url': $(self).parent().attr('data-url')},
						dataType: "json"
					});
					moreInfoRequest.done(function(data) {
						$(self).prev('.moreInfo').html(data.advanced);
						$(self).prev('.moreInfo').slideDown(1000);
						$(self).prev('.moreInfo').css("display", 'inline-block');
					});
					$(self).addClass('hide');
					$(self).html('<b>&and;</b> Meer informatie <b>&and;</b>');
				} else {
					$(self).prev('.moreInfo').slideUp(1000, 0, function() {						
						$(self).removeClass('hide');
						$(self).html('<b>&or;</b> Meer informatie <b>&or;</b>');					
					});
					
					location.hash = "#" + $(self).parent().attr('id');
				}
			});
		});
	},
	
	/**
	 * Load an empty cube
	 */
	loadEmptyCube: function() {
		side = _app.cube.getSide('Skills');
		for(i = 0; i < 6; i++) {
			side.addContent(new Skill().draw());
		}
		side.display();
		side = _app.cube.getSide('Companies');
		for(i = 0; i < 6; i++) {
			side.addContent(new Company().draw());
		}
		side.display();
		
		_app.enableNext();
	},
	
	/**
	 * Go to the next part of the application
	 */
	next: function(e) {
		self = e.data.self;
		if(self.cube.sideIndex < 2){
			self.cube.nextSide();
			self.updateState();
			self.updateSuggestions();
		} else {
			self.getVacancies();
		}
	},
	
	/**
	 * Go to the previous part of the application
	 */
	prev: function(e) {
		self = e.data.self;
		self.cube.prevSide();
		self.updateState();
		self.updateSuggestions();
	},
	
	addSkillLayout: function(e){
		_app = e.data.self;
		_app.inputLength = 0;
		$('<div class="suggestion insert"><input type="text" name="newSkill" id="newSkill" /></div>')
												.insertBefore('.skill.suggestions .add')
												.on('keypress', {self:_app}, _app.addSkill);	
	},
	
	addCompanyLayout: function(e) {
		_app = e.data.self;
		_app.inputLength = 0;
		$('<div class="suggestion insert"><input type="text" name="newCompany" id="newCompany" /></div>')
												.insertBefore('.company.suggestions .add')
												.on('keypress', {self:_app}, _app.addCompany);
	},
	
	addSkill: function(e) {
		_app = e.data.self;
		inputElement = $('.insert input'); 
		
		// If enter is pressed the skill needs to be added
		if(e.which == 13) {
			_app.skillPosition++;
			skill = new Skill(_app, 0, inputElement.val(), _app.skillPosition);
			skill.create(_app.skillCreated);
			return;
		}
		
		// Change the input field it's size
		_app.inputLength = inputElement.val().length;
		if(inputElement.val().length > 3) {
			$('.insert').width((parseInt(_app.inputLength) * 8.4)+ 10);
			inputElement.width(parseInt(_app.inputLength) * 8.5);
		}
	},
	
	skillCreated: function(skill) {
		_app.skills.push(skill);
		$(skill.drawSuggestion()).insertAfter('.insert');
		$('.insert').remove();
	},
	
	addCompany: function(e) {
		_app = e.data.self;
		inputElement = $('.insert input');
		// If enter is pressed the skill needs to be added
		if(e.which == 13) {
			_app.companyPosition++;
			company = new Company(_app, 0, inputElement.val(), _app.companyPosition);
			company.create(_app.companyCreated);
			return;
		}
		
		// Change the input field it's size
		_app.inputLength = inputElement.val().length;
		if(inputElement.val().length > 3) {
			$('.insert').width((parseInt(_app.inputLength) * 8.4)+ 10);
			inputElement.width(parseInt(_app.inputLength) * 8.5);
		}
	},
	
	companyCreated: function(company) {
		_app.companies.push(company);
		$(company.drawSuggestion()).insertAfter('.insert');
		$('.insert').remove();
	},
	
	/************************************************************************************************
	 * Layout methods																				*
	 ************************************************************************************************/
	/**
	 * Display the close button on a suggestion
	 */
	showClose: function() {
		$(this).append('<img src="../layout/close.png" class="close" alt="close" />');
	},
	
	/**
	 * Hide the close button on a suggestion
	 */
	hideClose: function() {
		$(this).children('.close').remove();
	},
	
	/**
	 * Update the suggestions layout
	 */
	updateSuggestions: function() {
		if(this.state == "Skills") {
			$(".company.suggestions").hide();
			$(".skill.suggestions").show();
		} else if(this.state == "Companies") {
			$(".skill.suggestions").hide();
			$(".company.suggestions").show();
		} else {
			$(".company.suggestions").hide();
			$(".skill.suggestions").hide();
		}
		
	},
	
	/**
	 * Update the state of the application
	 * Set the state as the page title
	 */
	updateState: function() {
		this.state = this.cube.getCurrentSideName();
		$('h1').html(this.state);
	},
	
	/**
	 * Show the next button to go to the next part of the application
	 */
	enableNext: function() {
		$('.arrowRight').show();
	},
	
	/**
	 * Delete a skill from the application
	 * Hide the skill
	 * Send a remove request to the server
	 */
	deleteSkill: function(e) {
		_app = e.data.self;
		$(this).parent().hide(1000);
		var skillID = $(this).parent().attr('id');
		skill = _app.findSkill(skillID);
		skill.remove(_app.skillDeleted);
	},
	
	/**
	 * Callback function for when a skill is deleted
	 * Remove the html from the dom
	 * Remove the element from the dom
	 */
	skillDeleted: function(skill) {
		_app = skill.parent;
		$('.skill.suggestions #'+ skill.skillID).remove(); // Remove the html from the dom
		_app.skills.splice(_app.skills.indexOf(skill), 1); // Remove the element from the dom
	},
	
	/**
	 * Delete a company from the application
	 * Hide the company
	 * Send a remove request to the server
	 */
	deleteCompany: function(e) {
		_app = e.data.self;
		$(this).parent().hide(1000);
		var companyID = $(this).parent().attr('id');
		company = _app.findCompany(companyID);
		company.remove(_app.companyDeleted);
	},
	
	/**
	 * Callback function for when a skill is deleted
	 * Remove the html from the dom
	 * Remove the element from the dom
	 */
	companyDeleted: function(company) {
		_app = company.parent;
		$('.company.suggestions #'+ company.companyID).remove(); // Remove the html from the dom
		//ToDo: check if element html is deleted from dom
		_app.companies.splice(_app.companies.indexOf(company), 1); // remove the element from the dom
	},
	
	/**
	 * Find a skill in the complete skill set of the application
	 */
	findSkill: function(skillID) {
		var foundSkill = null;
		$.each(this.skills, function(i, skill) {
			if(skill.skillID == skillID) {
				foundSkill = skill;
			}
		});
		return foundSkill;
	},
	
	/**
	 * Find a company in the complete set of companies in the application
	 */
	findCompany: function(companyID) {
		var foundCompany = null;
		$.each(this.companies, function(i, company) {
			if(company.companyID == companyID) {
				foundCompany = company;
			}
		});
		return foundCompany;
	},
	
	
	/**
	 * Add event handlers to the suggestions
	 * @params selector: string					Selector for the event handler list
	 */
	addSuggestionEventHandlers: function(selector) {
		_app = this;
		
		jQuery.event.props.push('dataTransfer');
		$(document).on('dragstart', selector, {self: this}, _app.handleDragStart);
		$(document).on('dragend', selector, {self: this}, _app.handleDragEnd);
	},
	
	/**
	 * Add event handlers to the dropzones
	 * @params selector: string					Selector for the event handler list
	 */
	addDropzoneEventHandlers: function(selector){
		_app = this;
		var dropzones = document.querySelectorAll(selector);
		[].forEach.call(dropzones, function(dropzone) {
			dropzone.addEventListener('dragenter', function(event) { _app.handleDragEnter(event, this, _app)}, false)
		  	dropzone.addEventListener('dragover', function(event) { _app.handleDragOver(event, _app)}, false);
		  	dropzone.addEventListener('dragleave', function(event) { _app.handleDragLeave(event, this, _app)}, false);
		  	dropzone.addEventListener('drop', function(event) { _app.handleDrop(event, this, _app)}, false);
		});		
	},
	
	/**
	 * Handle the drag start
	 */
	handleDragStart: function(e) {
		_obj = this;
		self = e.data.self;
		// Target (this) element is the source node.
		$(_obj).css('opacity', '0.4');
		
	  	self.dragSrcEl = $(_obj);
	
	  	e.dataTransfer.effectAllowed = 'move';
	  	e.dataTransfer.setData('text/html', $(_obj).html());
	},
	
	/**
	 * Handle the just before drop event
	 */
	handleDragOver: function(e, self) {
		if (e.preventDefault) {
			e.preventDefault(); // Necessary. Allows us to drop.
		}
		e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
		return false;
	},
	
	/**
	 * Handle the mouse over an element where can be dropped
	 */
	handleDragEnter: function(e, _obj, self) {
	 	if (e.preventDefault) {
			e.preventDefault(); // Necessary. Allows us to drop.
		}
		e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
		if($(_obj).attr('id') != self.dragSrcEl.attr('id')) {
			$(_obj).css('opacity', '0.8');
		}
	},
	
	/**
	 * handle the mouse leave over an element where can be dropped
	 */
	handleDragLeave: function(e, _obj, self) {
		if($(_obj).attr('id') != self.dragSrcEl.attr('id')) {
			$(_obj).css('opacity', '1');
		}
	},
	
	/**
	 * Handle the drop of an element
	 * Place the element on that position in the waitline
	 * Move all elements up or down a place between drag source and drop element
	 * Set the changes in the database
	 */
	handleDrop: function(e, _obj, self) {
		if (e.stopPropagation) {
			e.stopPropagation(); // Stops some browsers from redirecting.
		}
		
		// Don't do anything if dropping the same column we're dragging.
		if (self.dragSrcEl.attr('id') != $(_obj).attr('id')) {
			// Element dropped that is dropped on
			var dropSrcEl = $(_obj);
			var dragElement;
			var dropElement;
			// Get the drag and drop elements (skill or company)
			if(self.dragSrcEl.parent().hasClass('skill') || self.dragSrcEl.parent().hasClass('Skills')) {
				dragElement = self.findSkill(self.dragSrcEl.attr('id'));
				dropElement = self.findSkill(dropSrcEl.attr('id'));
			} else if(self.dragSrcEl.parent().hasClass('company') || self.dragSrcEl.parent().hasClass('Companies')) {
				dragElement = self.findCompany(self.dragSrcEl.attr('id'));
				dropElement = self.findCompany(dropSrcEl.attr('id'));
			}
			if(dropElement !== undefined && dropElement !== null) {
				// Set the object attributes to what they are supposed to be
				var tempPosition = dragElement.position;
				dragElement.position = dropElement.position;
				dropElement.position = tempPosition;
				dragElement.save();
				dropElement.save();
				// Change the layout
				var tempID = self.dragSrcEl.attr('id');
				var tempHtml = self.dragSrcEl.html();
				self.dragSrcEl.attr('id', dropSrcEl.attr('id'));
				self.dragSrcEl.html(dropSrcEl.html());
				dropSrcEl.attr('id', tempID);
				dropSrcEl.html(tempHtml);
			} else {
				dragElement.position = parseInt(dropSrcEl.index()) + 1;
				dragElement.save();
				dropSrcEl.attr('id', self.dragSrcEl.attr('id'));
				dropSrcEl.html(self.dragSrcEl.html());
				self.dragSrcEl.remove();
				$('.row').css('opacity', '1'); // Layout fix
			}
		}
		return false;
	},
	
	/**
	 * Handle when a drag and drop event ended
	 */
	handleDragEnd: function(e) {
		// this/e.target is the source node.
		$('.suggestion').css('opacity', '1');
		$('.row').css('opacity', '1');
	}

}

function App() {
}

App.prototype = AppPrototype;