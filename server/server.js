////////////////SERVER CODE FOR MODELLER//////////////////

	Meteor.publish("directory", function() {
		return Meteor.users.find({}, {fields: {emails:1, profile:1, username:1}});
	});

	var Models = new Meteor.Collection("models");
	//returns models where one is either a collaborator or the creator
	Meteor.publish("models",function(){
		return Models.find({$or:[{creatorId:this.userId},{collaborators:this.userId}]});
	});

///////Collection permissions - user accounts

	Meteor.users.allow({
		update: function (userId, fields) {
			var allowed = ["emails", "password", "profile", "username"];
			if(_.difference(fields, allowed) || userId != this.userId){
				return false;
			}
			else{
				return true;
			}
		}
	});

////////Collection permissions - models

/*
	Models.allow({
		insert: function(model){
			if(this.userId != null){
				console.log("added model");
				return true;
			}
			else{
				console.log("failed to add model");
				return false;
			}
		},

		update: function(userId, model){
			if(userId != model.creatorId || !(_.contains(model.collaborators, userId))){
				console.log('could not update field');
				return false;
			}
			else{
				return true;
			}
		},

		remove: function(userId, model){
			if(userId != model.creatorId){
				console.log('could not remove record');
				return false;
			}
			else{
				return true;
			}
		}

	}); */

/////////Server methods for updating collections

	Meteor.methods({
		updateName: function(id, new_username){
			return Meteor.users.update({_id: id}, {$set: {username: new_username}});
		},

		addModel: function(name){
			if(!this.userId){
				throw new Meteor.Error(403, "you must be logged in");
			}
			var adding_model = {
				creatorId: this.userId,
				title: name,
				date_modified: new Date().getTime(),
				collaborators:[],
				categories:[]
			};
			Models.insert(adding_model, function(error, result){
				return Models.findOne({_id: result});
			});
		},

		updateModel: function(modelId, field, data){
			var helper = {};
			helper[field] = data;
			Models.update({_id: modelId}, {$set: helper});
			//thanks jan-glx
		},

		removeModel: function(modelId){
			Models.remove({_id: modelId});
		},

		addCategory: function(modelId, data){
			Models.update({_id: modelId}, {$push: {categories: data}});
			var position = Models.findOne({_id: modelId}).categories.length - 1;
		},

		updateCategoryField: function(modelId, cattitle, field, data){
			Models.find({_id: modelId}).forEach(function(model){
				model.categories.forEach(function(category){
					if(_.isEqual(category.title, cattitle)){
						category[field] = data;
						Models.update({_id: modelId},{$set:{categories: model.categories}});
					}
				});
			});
		},

		addNode: function(modelId, cattitle, data){
			//iterate through the categories until the right one is identified, push a node
			Models.find({_id: modelId}).forEach(function(model){
				model.categories.forEach(function(category){
					if(_.isEqual(category.title, cattitle)){
						category.nodes.push(data);
					}
				});
				Models.update({_id: modelId}, {$set:{categories: model.categories}});
			});
		}
	});