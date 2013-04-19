var CubePrototype = {
	parent: null,
	sides: Array(),
	sideIndex: 0,
	
	init: function() {
		$("#cube").bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", this.transitioned); 
	},
	
	nextSide: function() {		
		if($("#cube").hasClass("show-front")) {
			$('.front').show();
			$('.right').show();
			$("#cube").removeClass("show-front").addClass("show-right");
		} else if($("#cube").hasClass("show-right")) {
			$('.right').show();
			$('.back').show();
			$("#cube").removeClass("show-right").addClass("show-back");
		}
		if(this.sideIndex < (this.sides.length-1)) {
			this.sideIndex++;
		}
	},
	
	prevSide: function() {
		if($("#cube").hasClass("show-back")) {
			$('.back').show();
			$('.right').show();
			$("#cube").removeClass("show-back").addClass("show-right");
		} else if($("#cube").hasClass("show-right")) {
			$('.right').show();
			$('.front').show();
			$("#cube").removeClass("show-right").addClass("show-front");
		}
		// Change the index
		if(this.sideIndex > 0) {
			this.sideIndex--;
		}
	},
	
	showall: function() {
		$('.front').show();
		$('.right').show();
	},
	
	addSide: function(side) {
		this.sides.push(side);
	},
	
	getSide: function(sideName) {
		_cube = this;
		side = null;
		$.each(_cube.sides, function(i, val) {
			if(val.name == sideName) {
				side = _cube.sides[i];
			}
		});
		return side;
	},
	
	logSides: function() {
		for(i = 0; i < this.sides.length; i++) {
			console.log(this.sides[i]);
		}
	},
	
	transitioned: function() {
		if($("#cube").hasClass("show-front")) {
			$('.right').hide();
			$('.back').hide();
			$('.arrowLeft').hide();
			$('.arrowRight').show();
		}
		else if($("#cube").hasClass("show-right")){
			$('.front').hide();
			$('.back').hide();
			$('.arrowLeft').show();
			$('.arrowRight').show();
		}
		else if($("#cube").hasClass("show-back")){
			$('.front').hide();
			$('.right').hide();
			$('.arrowLeft').show();
			$('.arrowRight').show();
		}
	},
	
	getCurrentSideName: function() {
		return this.sides[this.sideIndex].name;
	}
}

function Cube(parent) {
	this.parent = parent;
}

Cube.prototype = CubePrototype;
Cube.prototype.constructor = Cube;

/**
 userID bijhouden over volledige app
 */