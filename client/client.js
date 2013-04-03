/*
CLIENT INTERACTION WITH MODELLER

by Duncan Alexander - duncan@hypothete.com

thanks to Nate Strauser for his X-Editable smart package
*/

///////////////////////////////Sessions: what is going on
/*
Session keys are:

"id" - current model id

"cattitle" - current category title

"nodetitle"
*/

Session.setDefault("id", null);

Session.setDefault("cattitle", null);

Session.setDefault("nodetitle", null);

/////////////////////////Start subscriptions

Meteor.subscribe("directory");

var Models = new Meteor.Collection("models");

Meteor.subscribe("models", function(){
	/*
	if(!Session.get("id")){
		var firstModel = Models.findOne({}, {sort: {title: 1}});
		if(firstModel){
			Router.setModel(firstModel._id);
		}
	}*/
});


////////////////////////////Workspace

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
				Meteor.call("updateModel", Session.get("id"), "title", params.value);
			}
		});
	}
}


Template.workspace_wrapper.helpers({
	wehaveamodel : function(){
		if(Session.get("id") == null || Meteor.user() == null){
			return false;
		}
		return true;
	},

	currentmodelname : function(){
		return Models.findOne({ _id : Session.get("id") }).title;
	},

	cat_div : function(){
		return Models.findOne({ _id : Session.get("id") }).categories;
	}
});


/////////////////////////////Categories

Template.category_view.events = {
	'click #addnode' : function(){
		Session.set("cattitle", this.title);
		var callmodal = Meteor.render(function(){
			return Template.nodemodal();
		});
		if($('#newnodemodal').length < 1){
			document.body.appendChild(callmodal);
		}
		$('#newnodemodal').modal('show');
	},

	'click #title' : function(event){
		Session.set("cattitle", this.title);
		$(event.currentTarget).editable({
			mode: 'inline',
			name: 'title',
			send : 'never',
			type : 'text',
			url: function(params){
				Meteor.call("updateCategoryField", Session.get("id"), Session.get("cattitle"), "title", params.value);
				Session.set("cattitle", this.title);
			}
		});
	},

	'click #catdesc' : function(event){
		Session.set("cattitle", this.title);
		$(event.currentTarget).editable({
			mode: 'inline',
			name: 'cattth',
			send : 'never',
			type : 'wysihtml5',
			url: function(params){
				Meteor.call("updateCategoryField", Session.get("id"), Session.get("cattitle"), "description", params.value);
			}
		});
	}
}

Template.category_view.helpers({
	title : function(){
		return this.title;
	},

	catdescblock : function(){
		return this.description;
	},

	node_div : function(){
		return this.nodes;
	},

	arrow : function(){
		if(!_.isEqual(this, _.last(Models.findOne({ _id : Session.get("id") }).categories))){
			return '<i class="icon-arrow-right right_arrow"></i>';
		}
	}

});


////////////////////////////Models Dropdown

Template.modeldd.events = {
	'click' : function(){
		//Router.setModel(this._id);
		Session.set("id", this._id);
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
	},

	'click #delModel' : function(){
		var callmodal = Meteor.render(function(){
			return Template.delmodal();
		}); 
		if($('#delmodelmodal').length < 1){
			document.body.appendChild(callmodal);
		}
		$('#delmodelmodal').modal('show');
	}

}

Template.models_dropdown.model_li = function(){
	return Models.find({});
}

Template.delme.events = {
	'click' : function(){
		Session.set("id", this._id);
		$("dellabel").innerHTML = this.title;
	}
}

/////////Model Modals

function submitNewModel(){
	var title = $('#newmodalname').val();
	var canIDoThis = Meteor.call('addModel', title);
	$('#newmodalname').val('');
	$('#newmodelmodal').modal('hide');
}

function deleteModel(){
	Meteor.call("removeModel", Session.get("id"));
	Session.set("id", Models.findOne()._id);
	$('#delmodelmodal').modal('hide');
}

Template.delmodal.del_li = function(){
	return Models.find({});
}


/////////Category Modal

function submitNewCategory(){
	var name = $('#newcatname').val();
	var newcat = {
		title: name,
		description: 'edit description...',
		nodes: []
	};
	Meteor.call('addCategory', Session.get("id"), newcat);
	$('#newcatname').val('');
	$('#newcatmodal').modal('hide');
}

/////////Node Modal

function submitNewNode(){
	var name = $('#newnodename').val();
	var newnode = {
		title: name
	};

	Meteor.call('addNode', Session.get("id"), Session.get("cattitle"), newnode);
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

////////////Router!

/*

var ModelsRouter = Backbone.Router.extend({
	routes : {
		":id" : "main"
	},

	main : function(id){
		var oldId = Session.get("id");
		if(oldId != id){
			Session.set("id", id);
		}
	},

	setModel: function(id){
		this.navigate(id, true);
	}

});

Router = new ModelsRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
}); */