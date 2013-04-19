var SidePrototype = {
	/************************************************************************************************
	 * Properties																					*
	 ************************************************************************************************/
	parent: null,
	name: "",
	side: "",
	baseUrl: "/site/",
	content: "",
	loaded: false,
	data: null,
	
	/************************************************************************************************
	 * Functional methods																			*
	 ************************************************************************************************/
	 /**
	  * Get the content for a side of the cube
	  */
	getContent: function(url, callback) {
		_side = this;
		var getSideData = $.ajax({
			type: "GET",
			url: _side.baseUrl + url,
			dataType: "html"
		});
				
		getSideData.done(function(data) {
			_side.content = data;
			_side.display();
			callback(_side.parent);
		});
			
		getSideData.fail(function(jqXHR, textStatus) {
			// Connection error
		});
	},
	
	/**
	 * Add content to the part of a cube
	 */
	addContent: function(content) {
		this.content += content;
	},
	
	/**
	 * Display the side of the cube
	 */
	display: function() {
		$('#cube').append('<div class="'+ this.side +' '+ this.name +'">' + this.content + '</div>');
	}
}

/************************************************************************************************
 * Constructor																					*
 ************************************************************************************************/
function Side(name, parent) {
	this.parent = parent;
	this.name = name;
}

Side.prototype = SidePrototype;
Side.prototype.constructor = Side;