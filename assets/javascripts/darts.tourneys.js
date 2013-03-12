jQuery(function() {
    // Set up the main Events Manager Application
    window.DartsLeague = {
        Routers: {},
        Models: {},
        Collections: {},
        Views: {},
        UILib: {},
        Controllers: {}
    };
	
	DartsLeague.TourneysApp = new Backbone.Marionette.Application({});
	
	DartsLeague.TourneysApp.addRegions({
		appMain: "#main-content",
        modalRegion: "#modal-dialog"
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
	//    instance.
	//-------------------------------------------------------------
	DartsLeague.Models.Game = Backbone.Model.extend({

	});
	
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
    
    /**************************************************************
     * DartsLeague Tourney App Views
     * 
     *************************************************************/
     
    // TourneyManagerLayout -- a layout containing all the sub-regions we'll
    //    create at the topmost level of this particular app.
    DartsLeague.Views.TourneyManagerLayout = Backbone.Marionette.Layout.extend({
        template: "#tourney-manager-layout",
        className: "outer-center",
        
        regions: {
            tourneyListing: "#tourney-manager-listing",
            tourneyDetails: "#tourney-manager-detail",
            status: "#tourney-manager-status"
        },
    	
		initialize: function(){
    		var that=this;
			
			DartsLeague.TourneysApp.vent.on("selectedTourney:changed", function(myTourney){
				var myTourneyDetails = new DartsLeague.Views.TourneyDetails({model: myTourney});
				that.tourneyDetails.show(myTourneyDetails);
			});
		}
    });
     
    DartsLeague.Views.TourneyListing = Backbone.Marionette.ItemView.extend({
        tagName: "li",
        template: "#tourney-listing-template", 
     			
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
    
    DartsLeague.Views.TourneysListing = Backbone.Marionette.CollectionView.extend({
        tagName: "ul",
        itemView: DartsLeague.Views.TourneyListing,
    });
        
	DartsLeague.Views.TourneyDetails = Backbone.Marionette.ItemView.extend({
		template: "#tourney-details-template"
	});

    /***************************************************************
     * Controllers
     * 
     * TourneysController: This will handle all the mediating for the top-
     *    level tourneys events/views.
     ***************************************************************/
    DartsLeague.Controllers.TourneysController = {};
    
    
    /***************************************************************
     * Routers
     * 
     * TourneysRouter: This will listen to URL changes, and route them to
     *    the appropriate function.
     ***************************************************************/
    DartsLeague.Routers.TourneysRouter = Backbone.Marionette.AppRouter.extend({
        controller: DartsLeague.Controllers.TourneysController,
    });    
    
});
