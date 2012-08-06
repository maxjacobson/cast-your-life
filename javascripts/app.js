var App = Em.Application.create({});


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
    title: 'Soul Train'
  },
  {
    id: 2,
    title: 'Max Jacobson and the Horrible Lights'
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
  templateName: 'movie',

});


App.TMDBPerson = Em.Object.extend({
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

App.tmdbPeople = Em.ArrayController.create({
  content: []
});

App.CreateMemberView = Em.View.extend({
  templateName: 'create-member',
  createMember: function(event) {
    this.get('members').createRecord({
      name: this.get('member_name'),
      actor_name: event.contexts[0],
      actor_image: event.contexts[1]
    });
    App.store.commit();
  },
  getImages: function() {
    var api = {
      //url_prefix: 'http://api.themoviedb.org/3/',
      url_prefix: '/tmdb?request=',
      key: ''
    };
    $.get(api.url_prefix + 'search/person', {
      api_key: api.key,
      query: this.get('actor_name')
    }, function(search_res) {
      App.get('tmdbPeople').clear();
      search_res.results.forEach(function(person) {
        var tmdbPerson = App.TMDBPerson.create({
          id: person.id,
          name: person.name
        });
        App.get('tmdbPeople').pushObject(tmdbPerson);
        $.get(api.url_prefix + 'person/%@/images'.fmt(person.id), {
          api_key: api.key
        }, function(images_res) {
          var images = images_res.profiles.map(function(profile) {
            return profile.file_path;
          });
          tmdbPerson.set('images', images);
        });
      });
    });
  }.observes('actor_name')
});

App.PeopleController = Em.ArrayController.extend({});

App.NameField = Em.TextField.extend({
  contentBinding: ''
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