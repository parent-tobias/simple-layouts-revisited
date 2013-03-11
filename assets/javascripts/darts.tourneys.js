jQuery(function() {
    // Set up the main Events Manager Application
    window.DartsLeague = {
        Controllers: {},
        Models: {},
        Collections: {},
        Views: {},
        UILib: {}
    };
	
	/*********************************************************
	* UI Lib: A set of views that we may need to repurpose. For now, this
	*  will consist of a modal dialog Region, a tabsView and an accordionView.
	*  At some future date, I'd like to abstract this out, but for the
	*  purposes of this tutorial, it'll be in this same file.
	*  NOTE: These three UI tools are dependent on jQueryUI.
	*********************************************************/
	
	// ModalRegion. We'll want to find a div with the modal-dialog ID.
	DartsLeague.UILib.ModalRegion = Backbone.Marionette.Region.extend({
		el: "#modal",
		
		constructor: function(){
			_.bindAll(this);
			Backbone.Marionette.Region.prototype.constructor.apply(this, arguments);
			this.on("view:show", this.showModal, this);
			$(this.el).dialog({autoOpen: false, modal: true});
		},
		
		getEl: function(selector){
			var $el = $(selector);
			$el.on("hidden", this.close);
			return $el;
		},
		
		showModal: function(options, view){
			$(this.el).dialog(options);
			this.show(view);
			view.on("close",this.hideModal, this);
			$(this.el).dialog("open");
		},
		
		hideModal: function(){
			$(this.el).dialog("close");
		}
	});	
	
	DartsLeague.TourneysApp = new Backbone.Marionette.Application({});
	
	DartsLeague.TourneysApp.addRegions({
		appMain: "#mainContent",
		modalDialog: DartsLeague.UILib.ModalRegion
	});
	
	DartsLeague.TourneysApp.on("initialize:after", function(options){
	  if (Backbone.history){
		Backbone.history.start();
	  }
	});
	
	/*************************************************************
	 *
	 *  Models and Collections
	 *
	 *************************************************************/
	
	//-------------------------------------------------------------
	// Member model and collection
	//
	//  The Member model contains the member's identifying info.
	//  Within the context of the Event, the Members collection will
	//    be identified as 'teamMembers'.
	//-------------------------------------------------------------
	DartsLeague.Models.Member = Backbone.Model.extend({

	});
	DartsLeague.Collections.Members = Backbone.Collection.extend({
		model: DartsLeague.Models.Member,

	});
	
	//-------------------------------------------------------------
	// Team model and collection
	//
	//  The Team model contains the details about each team, which at this
	//    point consists of a teamMembers collection and an ID.
	//-------------------------------------------------------------
	DartsLeague.Models.Team = Backbone.Model.extend({
		initialize: function(){
			// Each team is initially containing an array, we need to convert that
			// into a Collection...
			var membersCollection = new DartsLeague.Collections.Members(this.get('teamMembers'));
			this.set('teamMembers', membersCollection);
		},
	});
	DartsLeague.Collections.Teams = Backbone.Collection.extend({
		model: DartsLeague.Models.Team,
	});
	
	//-------------------------------------------------------------
	// Games model (no collection in this context)
	//
	//  The Game model contains information about the specific game
	//    instance. Note that, in the context of our overall Tourneys
	//    collection, we never need the Games collection -- but we will
	//    need to create one anyway, as it's going to be used elsewhere.
	//-------------------------------------------------------------
	DartsLeague.Models.Game = Backbone.Model.extend({

	});

	DartsLeague.Collections.Games = Backbone.Collection.extend({
		model: DartsLeague.Models.Game,
	})

	
	//-------------------------------------------------------------
	// EventGame model and collection
	//
	//  The EventGame model contains a Game model and a collection of
	//    TeamMembers (an instance of the Member collection).
	//-------------------------------------------------------------
	DartsLeague.Models.TourneyGame = Backbone.Model.extend({

		initialize: function(){
			var game = new DartsLeague.Models.Game(this.get('game'));
			var teams = new DartsLeague.Collections.Teams(this.get('teams'));
			this.set('game', game);
			this.set('teams', teams);
		},
	});
	DartsLeague.Collections.TourneyGames = Backbone.Collection.extend({
		model: DartsLeague.Models.TourneyGame,
	});
	
	//-------------------------------------------------------------
	// Event model and collection
	//
	//  The Event model is the top-level model in the event manager.
	//    It contains a collection of EventGames as well as information
	//    about the event itself.
	//-------------------------------------------------------------
	DartsLeague.Models.Tourney = Backbone.Model.extend({

		initialize: function(){
			var tourneyGames = new DartsLeague.Collections.TourneyGames(this.get('eventGames'));
			this.set('tourneyGames', tourneyGames);
		}
	});
	DartsLeague.Collections.Tourneys = Backbone.Collection.extend({
		model: DartsLeague.Models.Tourney,
		url: './assets/json/mock-darts-tourneys.json',
	});
	

		
	/*************************************************************
	 *
	 *  Views
	 *
	 *************************************************************/
	
	DartsLeague.Views.TourneyDialog = Backbone.Marionette.ItemView.extend({
		template: "#tourney-dialog-template",
		events: {
			'click .save-tourney': "saveTourney",
			'click .discard-changes': "discardChanges"
		},

		onRender: function(){
			$(this.el).find(".edit-tourney-button").button();
			$(this.el).tooltip();
		},

		saveTourney: function(){
			var fields = $(this.el).find("form input");
			_.each(fields, function(field){
				var field = $(field);
				if(field.val() !== this.model.get(field.attr("name"))) {
					this.model.set(field.attr("name"), field.val())
				};
			}, this);
			DartsLeague.TourneysApp.vent.trigger("tourney:before:save", this.model);
			// I think I need to remove the nested collections/models to make this work.
			this.model.unset("tourneyGames");
			this.model.unset("eventGames");
			this.model.save();
			this.close();
			DartsLeague.TourneysApp.vent.trigger("tourney:save", this.model);
		},
		
		discardChanges: function(){
			this.close();
		}
		
	});

	DartsLeague.Views.MemberDialog = Backbone.Marionette.ItemView.extend({
		template: "#member-dialog-template",
		events: {
			'click .edit-this-member': "editThis",
			'click .save-member': "saveMember",
			'click .discard-changes': "discardChanges"
		},
		
		onRender: function(){
			$(this.el).find(".edit-member-button").button();
			$(this.el).tooltip();
		},
		editThis: function(){
			$(this.el).find(".display-member-info").hide();
			$(this.el).find(".edit-member-info").show();
		},
		
		saveMember: function(){
			var fields = $(this.el).find("form input");
			_.each(fields, function(field){
				var field = $(field);
				if(field.val() !== this.model.get(field.attr("name"))) {
					this.model.set(field.attr("name"), field.val())
				};
			}, this);
			DartsLeague.TourneysApp.vent.trigger("member:before:save", this.model)
			this.model.save();
			$(this.el).find(".edit-member-info").hide();
			$(this.el).find(".display-member-info").show();
			this.close();
			DartsLeague.TourneysApp.vent.trigger("member:save", this.model);
		},
		
		discardChanges: function(){
			$(this.el).find(".edit-member-info").hide();
			$(this.el).find(".display-member-info").show();
			this.close();
		}
		
	});
	
	DartsLeague.Views.NoMembersView = Backbone.Marionette.ItemView.extend({
		template:  "#no-members-template"
	});
	
	DartsLeague.Views.NoTeamsView = Backbone.Marionette.ItemView.extend({
		template: "#no-teams-template"
	});
	DartsLeague.Views.MemberView = Backbone.Marionette.ItemView.extend({
		template: "#member-view-template",
		tagName: "li",
		events: {
			'click .edit': "showEdit"
		},

		showEdit: function(){
			DartsLeague.TourneysApp.modalDialog.showModal(
				{title: "View/Edit Member",
				 hide: "fade"
				}, 
				new DartsLeague.Views.MemberDialog({model: this.model})
			);
			DartsLeague.TourneysApp.modalDialog.$el.find(".edit-member-info").hide();
		}
	});

	DartsLeague.Views.TeamView = Backbone.Marionette.CompositeView.extend({
		template: "#team-view-template",
		itemView: DartsLeague.Views.MemberView,
		itemViewContainer: "#team-members-listing ul",
		emptyView: DartsLeague.Views.NoMembersView,
		events: {
			"click .add-team-member": "addMember"
		},
		
		collectionEvents: {
			"change": "memberChanged"
		},
		
		initialize: function(options){
			this.collection = this.model.get("teamMembers");
			this.maxPlayers = options.maxPlayers;
		},
		
		onRender: function(){
			if(this.collection.length >= this.maxPlayers){
				this.$el.find(".add-team-member").hide();
			} else {
				this.$el.find(".add-team-member").button();
			}
		},
		
		memberChanged: function(){
			this.collection.trigger("reset");
		},
	
		addMember: function(){
			// Need to figure this. Tasks involved:
			// 1) Display a collectionView, listing all members NOT currently on any team.
			// 2) Allow members in listing to be checked, 
			//          limited to max players - current team length.
			// 3). Once members have been selected and user saves, add members to team,
			//          and close the modal dialog.
		}
	
	});

	// TabsView (a UIView), a layout that contains two regions: tabs and panes	
	DartsLeague.UILib.TabsViewTab = Backbone.Marionette.CompositeView.extend({
		template: "#tab-view-tab-template",
		itemView: DartsLeague.Views.TeamView,
		itemViewContainer: "#teams-listing",
		
		emptyView: DartsLeague.Views.NoTeamsView,

		templateHelpers: {
			getIndex: function(){ return this.index; }
		},
		itemViewOptions: function(){
			var maxPlayers = this.model.get("game").get("team_max");
			return {
				maxPlayers: maxPlayers
			}
		},
			
		initialize: function(options){
			this.$el.prop("id", "all-teams-accordion"),
			this.collection = this.model.get("teams"),
			
			this.$el.prop("id", "tab-"+options.index);
			this.model.set("index", options.index);
			this.model.set("gameName", options.tabName);
			this.model.set("gameUrl", this.model.get("game").get("url"));
		},
		
		appendHtml: function(collectionView, itemView, index) {
			collectionView.$el.find("#teams-listing").append("<span>Team "+(Number(index)+1)+"</span>");
			collectionView.$el.find("#teams-listing").append(itemView.el);
		}
	});
	DartsLeague.UILib.TabsView = Backbone.Marionette.CompositeView.extend({
		className: "myTabsView",
		template: "#tabs-view-template",
		itemView: DartsLeague.UILib.TabsViewTab,
		initialize: function(options){
			this.gamesList = new DartsLeague.Collections.Games(this.collection.pluck("game"));
		},
		itemViewOptions: function(model){
			return {
				index: this.collection.indexOf(model),
				tabName: model.get("game").get("game")
			}
		},
		appendHtml: function(collectionView, itemView, index){
			thisGame = this.gamesList.at(index);
			var thisTabLink = $("<li />").html(
				$("<a />").attr('href', '#tab-'+index).append(thisGame.get("game"))
			);
			collectionView.$el.find("ul.tabs-view-tabs").append(thisTabLink);
			collectionView.$el.append(itemView.el);
		},
					
	})
	
	DartsLeague.Views.TourneyGamesListing = Backbone.Marionette.CompositeView.extend({
		template: "#tab-view-pane-template",
		templateHelpers: {
			gameName: function(){
				return this.game.get("game");
			},
		},
		
	});

	// Main Event Manager layout - defines a listing region, a details region
	//  and a status region.
	DartsLeague.Views.TourneyManagerLayout = Backbone.Marionette.Layout.extend({
		template: '#tourney-manager-layout',
		className: "outer-center",
		
		regions: {
			tourneyListing: '#tourney-manager-listing',
			tourneyDetails: '#tourney-manager-detail',
			status:       '#tourney-manager-status'
		},
		
		initialize: function(){
			DartsLeague.TourneysApp.vent.on("selectedTourney:changed", function(myTourney){
				// set up the collections 
				var myEventGamesCollection = myTourney.get("tourneyGames");
				var myGamesCollection = new DartsLeague.Collections.Games(myEventGamesCollection.pluck("game"));
				// console.log(myGamesCollection);
				
				
				// Establish the views and the layouts
				var TourneyDetailLayout = new DartsLeague.Views.TourneyDetails({model: myTourney});
				var TourneyStatus = new DartsLeague.Views.TourneyStatus({model: myTourney});
				
				var myTourneyDetails = new DartsLeague.Views.TourneySpecificDetails({model: myTourney});
				var gameTabsViewLayout = new DartsLeague.UILib.TabsView({collection: myEventGamesCollection});
				
				DartsLeague.TourneysApp.appMain.currentView.tourneyDetails.show(TourneyDetailLayout);
				DartsLeague.TourneysApp.appMain.currentView.status.show(TourneyStatus);
				
				
				TourneyDetailLayout.tourneySpecificDetails.show(myTourneyDetails);
				TourneyDetailLayout.gameTabs.show(gameTabsViewLayout);
				
				$('.myTabsView').tabs();
				$(".teams-accordion").accordion({collapsible: true, active: false, heightStyle: "content"});
				
				
			});
		},
		
	});
	//-------------------------------------------------------------
	// Event (top-level) views
	//
	//  There are two views for events: the events listing and the
	//   events details.
	//-------------------------------------------------------------	

	DartsLeague.Views.TourneyListing = Backbone.Marionette.ItemView.extend({
		template: "#tourney-listing-template",
		tagName: "li",
		
		initialize: function(){
			_.bindAll(this);
		},
		
		events: {
			"click a": "showDetailedView"
		},
		
		showDetailedView: function(){
			DartsLeague.TourneysApp.vent.trigger("selectedTourney:changed", this.model);
		}
		
	});
	
	DartsLeague.Views.TourneyDetails = Backbone.Marionette.Layout.extend({
		template: "#tourney-details-layout",
		regions: {
			tourneySpecificDetails: "#tourney-details-region",
			gameTabs:       "#games-tabs-region"
		},
																		 
	});
	DartsLeague.Views.TourneySpecificDetails = Backbone.Marionette.CompositeView.extend({
		template: "#tourney-specific-details-template",
		events: {
			"click .edit-this-tourney": "showEdit"
		},
		showEdit: function(){
			DartsLeague.TourneysApp.modalDialog.showModal(
				{title: "Edit this tournament",
				 hide: "fade"
				}, 
				new DartsLeague.Views.TourneyDialog({model: this.model})
			);
			DartsLeague.TourneysApp.modalDialog.$el.find(".edit-tourney-info form").formwizard();
			DartsLeague.TourneysApp.modalDialog.$el.find("#starts").datetimepicker();
			
		}

	});

	DartsLeague.Views.TourneyStatus = Backbone.Marionette.Layout.extend({
		template: "#tourney-status-template",
		
	});

	DartsLeague.Views.TourneysListing = Backbone.Marionette.CompositeView.extend({
		template: "#tourneys-listing-template",
		itemView: DartsLeague.Views.TourneyListing,
		itemViewContainer: "ul",
		
		onRender: function(){
			$("#tourneys-listing ul").menu();
		}
				
	});
    
    /***************************************************************
     * Controllers
     * 
     * TourneysController: This will handle all the mediating for the top-
     *    level tourneys events/views.
     ***************************************************************/
    DartsLeague.Controllers.TourneysController = {};
	
});
