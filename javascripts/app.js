var App = Em.Application.create({
  ready: function() {
  }
});

/********
 * Data *
 ********/

App.Movie = DS.Model.extend({
  title: DS.attr('string'),
  people: DS.hasMany('App.Person')
});

App.Person = DS.Model.extend({
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

App.MovieController = Em.ObjectController.extend({});
App.MovieView = Em.View.extend({
  templateName: 'movie'
});

App.PeopleController = Em.ArrayController.extend({});


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
      list: Em.Route.extend({
        route: '/',
        connectOutlets: function(router) {
          router.get('applicationController').connectOutlet('movies', App.Movie.find());
        }
      }),
      showMovie: Em.Route.transitionTo('movie'),
      movie: Em.Route.extend({
        route: '/:movie_id',
        connectOutlets: function(router, movie) {
          router.get('applicationController').connectOutlet('movie', movie);
        }
      })
    })
  })
})

App.initialize();