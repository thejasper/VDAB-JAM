var CompanyPrototype = {
	/************************************************************************************************
	 * Properties																					*
	 ************************************************************************************************/
	parent: null,
	company: "",
	linkedinCompanyID: -1,
	position: 0,
	
	/* Extra company information */
	industry: "",
	logo: "",
	website: "",
	headquarter: "",
	size: "",
	specialities: "",
	
	/************************************************************************************************
	 * Functional Methods																			*
	 ************************************************************************************************/
	/**
	 * Save the changes of the company to the database
	 */
	save: function() {
		_company = this;
		
		var saveCompany = $.ajax({
			type: "POST",
			url: "/company/update/"+ _company.companyID,
			data: {
				'Company[company]': _company.company,
				'Company[position]': _company.position,
				'Company[userID]': _company.parent.userID,
				'Company[linkedinUserID]': _company.parent.linkedinUserID,
				'Company[linkedinCompanyID]': _company.linkedinCompanyID		
			},
			dataType: "json"
		});
		
		saveCompany.done(function(data) {
			if(data.status == "saved") {
				// Todo: Saving was succesfull
			} else {
				//Todo: An error occured
			}
		});	
	},
	
	create: function(created, failed){
		_company = this;
		
		var createCompany = $.ajax({
			type: "POST",
			url: "/company/create",
			data: { 
				'Company[company]': _company.company,
				'Company[position]': _company.position,
				'Company[userID]': _company.parent.userID,
				'Company[linkedinUserID]': _company.parent.linkedinUserID,
				'Company[linkedinCompanyID]': _company.linkedinCompanyID		
			},
			dataType: "json"
		});
		
		createCompany.done(function(data) {
			if(data.status == "created") {
				_company.companyID = data.companyID;
				created(_company);
			} else {
				//Todo: An error occured
			}
		});	
	},
	
	/**
	 * Remove a company from the database
	 * @params deleted: function				Callback function if the company was deleted successfully
	 * @params failed: function					callback function of an error occured
	 */
	remove: function(deleted, failed) {
		_company = this;
		var removeCompany = $.ajax({
			type: "GET",
			url: "/company/delete",
			data: {id: _company.companyID},
			dataType: "json"
		});
		
		removeCompany.done(function(data) {
			if(data.status == "deleted") {
				deleted(_company);
			}
		});
	},
	
	/************************************************************************************************
	 * Layout Methods																				*
	 ************************************************************************************************/
	/**
	 * Draw an company element as part of the cube
	 */
	draw: function() {
		return '<div class="row" id="'+ this.companyID +'" draggable="true">'+ this.company +'</div>';
	},
	
	/**
	 * Draw a company suggestion element
	 */
	drawSuggestion: function() {
		return '<div class="suggestion" id="'+ this.companyID +'" draggable="true">'+ this.company +'</div>';
	}
}

/************************************************************************************************
 * Constructor																					*
 ************************************************************************************************/
function Company(parent, companyID, company, position, linkedinCompanyID) {
	if(parent !== undefined) {
		this.parent = parent;
	}
	if(companyID !== undefined) {
		this.companyID = companyID;
	}
	if(company !== undefined) {
		this.company = company;
	}
	if(position !== undefined) {
		this.position = position;
	}
	if(linkedinCompanyID !== undefined) {
		this.linkedinCompanyID = linkedinCompanyID;
	}
}

Company.prototype = CompanyPrototype;