var App = Em.Application.create({
  ready: function() {
  }
});

/********
 * Data *
 ********/

App.Movie = DS.Model.extend({
  title: DS.attr('string'),
  people: DS.hasMany('App.Person', { embedded: true })
});

App.Man = DS.Model.extend({
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
    title: 'Max Jacobson and the Horrible Lights',
    mans: [
      {
        id: 1,
        name: 'Dad',
        actor_name: 'Brad',
        actor_image: 'http://cf2.imgobject.com/t/p/w185/w8zJQuN7tzlm6FY9mfGKihxp3Cb.jpg'
      }
    ]
  }
];

// App.Adapter = DS.RESTAdapter.extend({

// });

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

App.MovieController = Em.ObjectController.extend({});
App.MovieView = Em.View.extend({
  templateName: 'movie',
  getImages: function() {
    // var url_prefix = 'http://api.themoviedb.org/3/'
    var url_prefix = '/tmdb?request='
    $.get(url_prefix + 'search/person', {
      api_key: '',
      query: App.get('played_by')
    }, function(search_res) {
      App.get('tmdbPeople').clear();
      search_res.results.forEach(function(person) {
        var tmdbPerson = App.TMDBPerson.create({
          id: person.id,
          name: person.name
        });
        App.get('tmdbPeople').pushObject(tmdbPerson);
        $.get(url_prefix + 'person/%@/images'.fmt(person.id), {
          api_key: ''
        }, function(images_res) {
          var images = images_res.profiles.map(function(profile) {
            return profile.file_path;
          });
          tmdbPerson.set('images', images);
        });
      });
    });
  }.observes('App.played_by')
});

App.SelectionView = Em.View.extend({
  templateName: 'selection'
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
        selectImage: function(router, context) {
          // App.Person.createRecord();
          // App.store.commit();
        },
        eventTransitions: {
          selectImage: 'show'
        }
      })
    })
  })
})

App.initialize();