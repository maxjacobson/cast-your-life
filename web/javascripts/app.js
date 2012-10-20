var App = Em.Application.create({
  ready: function() {
    $(document)
      .ajaxStart(function() {
        App.set('waiting_for_ajax', true);
      })
      .ajaxStop(function() {
        App.set('waiting_for_ajax', false);
      });


    window.fbAsyncInit = function() {
      FB.init({
        appId      : '361984737219038', // App ID
        channelUrl : '//maxjacobson.net/channel.html', // Channel File
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true  // parse XFBML
      });
      FB.login(function(response) {
        if (response.authResponse) {
          console.log('logged into FB');

          FB.api('me/friends', function(response) {
            App.friends.set('content', response.data);
          });
          FB.api('jacobson/photos', function(response) {
            console.log(response);
          });
          FB.api('10100733303091525/picture', function(response) {
            console.log(response);
          });

        }
        else {
          console.error('couldn\'t log into FB');
        }
      }, { scope: 'user_photos,friends_photos' })
      // Additional initialization code here
    };
    // Load the SDK Asynchronously
    (function(d){
       var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement('script'); js.id = id; js.async = true;
       js.src = "//connect.facebook.net/en_US/all.js";
       ref.parentNode.insertBefore(js, ref);
     }(document));

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
  movie: DS.belongsTo('App.Movie'),
  friend_name: DS.attr('string'),
  actor_name: DS.attr('string'),
  actor_image_url: DS.attr('string')
});

// App.adapter = DS.RESTAdapter.create({
// });

App.store = DS.Store.create({
  revision: 4,
  adapter: DS.RESTAdapter.create({
    namespace: 'api'
  })
});


/***********************
 * Controllers & Views *
 ***********************/

App.ApplicationController = Em.Controller.extend({});
App.ApplicationView = Em.View.extend({
  templateName: 'application'
});

App.MovieController = Em.ObjectController.extend({});
App.MovieView = Em.View.extend({
  templateName: 'movie',
  changeTitle: function(event) {
    var new_title = prompt('New title?', event.context.get('title'));
    if (new_title) {
      this.set('controller.title', new_title);
      App.store.commit();
    }
  },
  checkTitle: function() {
    if (this.get('controller.isLoaded') && !this.get('controller.title')) {
      var event = $.Event('changeTitle', { context: this.get('controller') });
      this.trigger('changeTitle', event);
    }
  }.observes('controller.isLoaded')
});

App.MemberItemView = Em.View.extend({
  deleteMember: function(event) {
    var member = event.context;
    member.deleteRecord();
    App.store.commit();
  }
});


App.Actor = Em.Object.extend({
  id: null,
  name: null,
  init: function() {
    this._super();
    this.set('images', []);
  },
  fullImagePaths: function() {
    return this.get('images').map(function(image) {
      return "http://cf2.imgobject.com/t/p/w185%@".fmt(image);
    });
  }.property('images')
});

App.CreateMemberView = Em.View.extend({
  templateName: 'create-member',
  lacks_friend_name: function() {
    return !this.get('friend_name');
  }.property('friend_name'),
  tmdb_api: {
    url_prefix: 'http://api.themoviedb.org/3',
    key: '212c19296f5ae6b2648ae1ef16da54a2'
  },
  createMember: function(event) {
    if(! this.get('friend_name'))
      return;
    this.get('members').createRecord({
      movie: App.get('router.movieController.id'),
      friend_name: this.get('friend_name'),
      actor_name: event.contexts[0],
      actor_image_url: event.contexts[1]
    });
    App.store.commit();
  },

  getActors: function() {
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

App.friends = Em.ArrayController.create({
  content: []
});
App.FriendField = Em.TextField.extend({
  friendsBinding: 'App.friends.content',

  // TODO App.friends.filter(function(friend) { return friend.name.toLowerCase().indexOf('ja') >= 0; })
  

  attributeBindings: 'data-provide'.w(),
  'data-provide': 'typeahead',
  initTypeahead: function() {
    var names = this.get('friends').map(function(friend) {
      return friend.name; 
    });
    this.$().typeahead({
      source: names,
      matcher: function(item) {
        a=this.query;
        console.log(a);
        return item.toLowerCase().indexOf(this.query) >= 0;
      }
    });
  }.observes('friends')
})

// App.FriendsView = Em.View.extend({
//   templateName: 'friends'
// });

App.actors = Em.ArrayController.create({
  content: []
});
// App.ActorsController = Em.ArrayController.extend({});
App.PickerView = Em.View.extend({
  templateName: 'picker',
  tagName: 'ul',
  classNames: 'unstyled'
});

/**********
 * Router *
 **********/

App.Router = Em.Router.extend({
  enableLogging: true,
  location: 'hash',

  root: Em.Route.extend({

    movie: Em.Route.extend({
      route: '/',
      newMovie: Em.Route.transitionTo('generate'),
      generate: Em.Route.extend({
        route: '/',
        enter: function(router) {
          var movie = App.Movie.createRecord();
          movie.reopen({
            didCreate: function() {
              router.transitionTo('show', movie);
            }
          });
          App.store.commit();
        }
      }),
      show: Em.Route.extend({
        route: '/:movie_id',
        connectOutlets: function(router, movie) {
          router.get('applicationController').connectOutlet('movie', movie);
        }        
      })
    })
  })
})

App.initialize();