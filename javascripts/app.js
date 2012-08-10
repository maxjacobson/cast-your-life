var App = Em.Application.create({
  ready: function() {
    $(document)
      .ajaxStart(function() {
        App.set('waiting_for_ajax', true);
      })
      .ajaxStop(function() {
        App.set('waiting_for_ajax', false);
      });
  }
});


/********
 * Data *
 ********/

App.Movie = DS.Model.extend({
  title: DS.attr('string'),
  members: DS.hasMany('App.Member', { embedded: true })
});

App.Member = DS.Model.extend({
  name: DS.attr('string'),
  actor_name: DS.attr('string'),
  actor_image: DS.attr('string')
});

App.Movie.FIXTURES = [
  {
    id: 1,
    title: 'Soul Train',
  },
  {
    id: 2,
    title: 'Max Jacobson and the Horrible Lights'
  },
  {
    id: 3,
    title: 'The Jacobson Family'
  }
];


App.store = DS.Store.create({
  revision: 4,
  adapter: DS.FixtureAdapter.create()
});


/***********************
 * Controllers & Views *
 ***********************/

App.ApplicationController = Em.Controller.extend({});
App.ApplicationView = Em.View.extend({
  templateName: 'application'
});

App.MoviesController = Em.ArrayController.extend({});
App.MoviesView = Em.View.extend({
  templateName: 'movies'
});

App.MovieController = Em.ObjectController.extend({});
App.MovieView = Em.View.extend({
  templateName: 'movie'
});

App.MemberItemView = Em.View.extend({
  is_hidden: false,
  hideMemberItem: function(event) {
    this.set('is_hidden', true);
  }
  //deleteMemberItem: function(event) {
  //
  //console.log(this.get('controller.members'));
  // var member = App.store.find(App.Member, event.context.get('id'));
  // console.log(member);
  // App.store.deleteRecord(member);
  // //member.deleteRecord();
  // App.store.commit();
  //}
})


App.Actor = Em.Object.extend({
  id: null,
  name: null,
  init: function() {
    this._super();
    this.set('images', []);
  },
  fullImagePaths: function() {
    return this.get('images').map(function (image) {
      return "http://cf2.imgobject.com/t/p/w185%@".fmt(image);
    });
  }.property('images')
});

App.CreateMemberView = Em.View.extend({
  templateName: 'create-member',
  lacks_member_name: function() {
    return !this.get('member_name');
  }.property('member_name'),
  tmdb_api: {
    url_prefix: 'http://api.themoviedb.org/3',
    key: '212c19296f5ae6b2648ae1ef16da54a2'
  },
  createMember: function(event) {
    if(! this.get('member_name'))
      return;
    this.get('members').createRecord({
      name: this.get('member_name'),
      actor_name: event.contexts[0],
      actor_image: event.contexts[1]
    });
    App.store.commit();
  },
  getImages: function() {
    var self = this;
    this.get('request') && this.get('request').abort();
    if (!this.get('actor_name')) {
      App.get('actors').clear();
      return;
    }
    var url_prefix = self.get('tmdb_api').url_prefix;
    var request = $.get(url_prefix + '/search/person', {
      api_key: self.get('tmdb_api').key,
      query: this.get('actor_name')
    }, function(search_res) {
      App.get('actors').clear();
      search_res.results.forEach(function(person) {
        self.set('request', null);
        var actor = App.Actor.create({
          id: person.id,
          name: person.name
        });
        App.get('actors').pushObject(actor);
		console.log(actor);
        $.get(url_prefix + '/person/%@/images'.fmt(person.id), {
          api_key: self.get('tmdb_api').key
        }, function(images_res) {
          var images = images_res.profiles.map(function(profile) {
            return profile.file_path;
          });
          actor.set('images', images);
        });
      });
    });
    this.set('request', request);
  }.observes('actor_name')
});

App.NameField = Em.TextField.extend({
  contentBinding: ''
});

App.FriendsController = Em.ArrayController.extend({});
App.FriendsView = Em.View.extend({
  templateName: 'friends'
});

App.actors = Em.ArrayController.create({
	content: []
});

// App.ActorsController = Em.ArrayController.extend({});
App.ActorsView = Em.View.extend({
  templateName: 'actors'
});

/**********
 * Router *
 **********/

App.Router = Em.Router.extend({
  enableLogging: true,
  location: 'hash',

  root: Em.Route.extend({

    index: Em.Route.extend({
      route: '/',
      redirectsTo: 'movies.list'
    }),

    movies: Em.Route.extend({
      route: '/movies',
      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('movies', App.Movie.find());
      },
      list: Em.Route.extend({
        route: '/',
        connectOutlets: function(router) {
          router.get('applicationController').connectOutlet('movies', App.Movie.find());
        }
      }),
      showMovie: Em.Route.transitionTo('movie.show'),
      movie: Em.Route.extend({
        route: '/:movie_id',
        connectOutlets: function(router, movie) {
          router.get('applicationController').connectOutlet('movie', movie);
        },
        show: Em.Route.extend({
          route: '/'
        }),
        
      })
    })
  })
})

App.initialize();