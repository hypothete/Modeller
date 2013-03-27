//////////////CLIENT INTERACTION WITH MODELLER/////////////

//by Duncan Alexander - duncan@hypothete.com

//thanks to Nate Strauser for his X-Editable smart package

/////////////////////////Start subscriptions, Session handlers for login/logout

Meteor.subscribe("directory");

var Models = new Meteor.Collection("models");

Meteor.subscribe("models");

Meteor.startup(function(){
	Session.setDefault("current_model", null);
	Session.setDefault("current_category", null);
	
});

Template._loginButtonsLoggedOutPasswordService.events = {
	'click' : function(){
		Session.set("current_model", null);
		Session.set("current_category", null);		
	}
}

////////////////////////////Workspace

Template.workspace_wrapper.wehaveamodel = function(){
	if(Session.get("current_model") == null || Meteor.user() == null){
		return false;
	}
	return true;
}

Template.workspace_wrapper.events = {
	'click #addcat' : function(){
		var callmodal = Meteor.render(function(){
			return Template.catmodal();
		}); 
		if($('#newcatmodal').length < 1){
			document.body.appendChild(callmodal);
		}
		$('#newcatmodal').modal('show');
	},

	'click #modelrevisetitle' : function(event){
		$(event.currentTarget).editable({
			mode: 'inline',
			name: 'title',
			send : 'never',
			type : 'text',
			url: function(params){
				Meteor.call("updateModel", Session.get("current_model")._id, "title", params.value, function(error, result){
					Session.set("current_model", result);
				});
			}
		});
	}
}

Template.workspace_wrapper.currentmodelname = function(){
	var check_title = Session.get("current_model").title;

	return check_title;
}


Template.workspace_wrapper.cat_div = function(){
	var model_id = Session.get("current_model")._id;
	if(model_id != null){
		var founddoc = Models.findOne({_id:model_id});
		return founddoc.categories;
	}
}


/////////////////////////////Categories


Template.category_view.events = {
	'click #addnode' : function(){
		Session.set("current_category", this);
		var callmodal = Meteor.render(function(){
			return Template.nodemodal();
		});
		if($('#newnodemodal').length < 1){
			document.body.appendChild(callmodal);
		}
		$('#newnodemodal').modal('show');
	},
	'click #title' : function(event){
		var ciq = this;
		$(event.currentTarget).editable({
			mode: 'inline',
			name: 'title',
			send : 'never',
			type : 'text',
			url: function(params){
				Meteor.call("updateCategoryField", Session.get("current_model")._id, ciq, "title", params.value);
				ciq.title = params.value;
				Session.set("current_model", Models.findOne({_id: Session.get("current_model")._id}));
			}
		});
		Session.set("current_category", ciq);
		// Meteor.call returns incorrectly - to be resolved
	},

	'click #catdesc' : function(event){
		var ciq = this;
		$(event.currentTarget).editable({
			mode: 'inline',
			name: 'cattth',
			send : 'never',
			type : 'wysihtml5',
			url: function(params){
				Meteor.call("updateCategoryField", Session.get("current_model")._id, ciq, "description", params.value);
				ciq.description = params.value;
				Session.set("current_model", Models.findOne({_id: Session.get("current_model")._id}));
			}
		});
		Session.set("current_category", ciq);
		// Meteor.call returns incorrectly 
	}
}

Template.category_view.title = function(){
	return this.title;
}

Template.category_view.catdescblock = function(){
	return this.description;
}


Template.category_view.node_div = function(){
	return this.nodes;
}

Template.category_view.arrow = function(){
	if(!_.isEqual(this, _.last(Session.get("current_model").categories))){
		return '<i class="icon-arrow-right right_arrow"></i>';
	}
}


////////////////////////////Models Dropdown

Template.models_dropdown.model_li = function(){
	return Models.find({});
}

Template.models_dropdown.events = {
	'click #newModel' : function(){
		$('#newmodelmodal').modal('show');
	}
}

Template.modeldd.events = {
	'click' : function(){
		Session.set("current_model", this);
		console.log("you set the current model to " + this.title)
	}
}

Template.models_dropdown.events = {
	'click #newModel' : function(){

		//make this check for an existing modal
		var callmodal = Meteor.render(function(){
			return Template.modelmodal();
		}); 
		if($('#newmodelmodal').length < 1){
			document.body.appendChild(callmodal);
		}
		$('#newmodelmodal').modal('show');
	}
}


/////////Model Modal

function submitNewModel(){
	var title = $('#newmodalname').val();
	Meteor.call('addModel', title, function(error, result){
		Session.set("current_model", result);
	});
	$('#newmodalname').val('');
	$('#newmodelmodal').modal('hide');	
}


/////////Category Modal

function submitNewCategory(){
	var name = $('#newcatname').val();
	var newcat = {
		title: name,
		description: 'edit description...',
		nodes: []
	};
	Meteor.call('addCategory', Session.get("current_model")._id, newcat, function(error, result){
		Session.set("current_category", result);
	});
	$('#newcatname').val('');
	$('#newcatmodal').modal('hide');
}

/////////Node Modal

function submitNewNode(){
	var name = $('#newnodename').val();
	var newnode = {
		title: name
	};

	Meteor.call('addNode', Session.get("current_model")._id, Session.get("current_category"), newnode, function(error, result){
		console.log("just added a node in " + Session.get("current_category").title);
	});
	$('#newnodename').val('');
	$('#newnodemodal').modal('hide');

}

////////About Modal

function showAbout(){
	var callmodal = Meteor.render(function(){
		return Template.aboutmodal();
	}); 
	if($('#about_modal').length < 1){
		document.body.appendChild(callmodal);
	}
	$('#about_modal').modal('show');

}

function hideAbout(){
	$('#about_modal').modal('hide');

}


//////placeholder for Backbone once the Session update bug is fixed