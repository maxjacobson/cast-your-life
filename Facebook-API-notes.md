# facebook API

## notes

* every object has an ID and to fetch that object, you query <https://graph.facebook.com/ID>
* the ID can be replaced with their facebook username, aka 'platon' or 'jacobson'
* objects include stuff like people, pages, events, photos, photo albums, statuses, etc...

we'll need an access token to get non public information on behalf of people

this can look like:

    https://graph.facebook.com/btaylor?access_token=AAAAAAITEghMBAEUMd6ZBG8kZCENq5RZBYBcpwpBlqJ26GryjV1mqPH1ujflyDrWyoevoM5eHt91ZAVwEWsWjEvzPHihtAbUnhwdYg64qngZDZD

this uses OAuth 2.0. I understand OAuth from a user's permission. It's nice because users will never need to give *us* their facebook credentials. they'll click a button, go to facebook, click another button, and come back. if they're not logged in to facebook, they'll log in *there*.

there are SDKs for us, both client-side and server-side. I'm assuming we want [the client-side / javascript one](https://developers.facebook.com/docs/authentication/client-side/).

>In addition to managing the standard login and logout flows, the JS SDK automatically manages the validity of access tokens and ensures as long as the user is present in your app and is logged into Facebook, you always have a valid user access token. In addition, if the user is logged into Facebook, the SDK can automatically return a fresh user session when the user returns to your application - this can be used to automatically log the user in to your application.

now I'm registering as a developer...

On [this page](https://developers.facebook.com/apps/). I said I'm a Product Manager, filled out some other survey questions, and got myself registered.

Now I need to get an app ID so we can use OAuth.

It offers us some web hosting, apparently [they partnered with Heroku](https://developers.facebook.com/blog/post/558/).

I put:

* App Name: Cast Your Life
* App Namespace: castyourlife

Our App ID is 361984737219038

I added you as a developer. It says it's pending. Pending your approval, I suppose. This feels like a friend request now. I changed you to an admin actually.

* * *

There's this thing called the [Graph API Explorer](https://developers.facebook.com/tools/explorer) that seems like a console for experimenting with the API.

So to get a token we need to define the permissions we require the user to give. What exactly do we need access to? It will ask the user if they're okay with it.

We might need:

* user_photos
* friends_photos
* publish_stream -- permission to publish stuff
 
* * *

Ok I'm looking at [the javascript SDK](https://developers.facebook.com/docs/reference/javascript/) now and maybe I'll be able to use it now that I have an app id to plug in.

OK so to load the code we put this in. It says to substitute in our appId which I can do, but I'm not 100% sure what to replace `WWW.YOUR_DOMAIN.COM` with.

    <div id="fb-root"></div>
    <script>
      window.fbAsyncInit = function() {
        FB.init({
          appId      : '361984737219038', // App ID
          channelUrl : '//maxjacobson.net/channel.html', // Channel File
          status     : true, // check login status
          cookie     : true, // enable cookies to allow the server to access the session
          xfbml      : true  // parse XFBML
        });
    
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
    </script>

That `fb-root` div is necessary and will have stuff put in it and we shouldn't try to hide it or remove it.

The SDK is being loaded asynchronously which they recommend but they say for debugging you can do it this way to load synchronously:

    <div id="fb-root"></div>
    <script src="//connect.facebook.net/en_US/all.js"></script>
    <script>
      FB.init({
        appId      : '361984737219038',
        channelUrl : '//maxjacobson.net/channel.html', // Channel File
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true  // parse XFBML
      });
    </script>

For now I've uploaded the channel file to <http://maxjacobson.net/channel.html> because why not I guess. It's one line, calling some javascript. It's important. Maybe you can explain it to me. It calls a good chunk of javascript: <http://connect.facebook.net/en_US/all.js>. I think this is the SDK?

I added some more info in our settings:

* Site URL: <http://pauldechov.com/cast/>
* App domain: `pauldechov.com`

So now we can do some OAuth stuff I think.

It gives us some examples of methods from the JS SDK for this.

[`FB.login`](https://developers.facebook.com/docs/reference/javascript/FB.login/) looks like this:

    FB.login(function(response) {
    if (response.authResponse) {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
        console.log('Good to see you, ' + response.name + '.');
        });
    } else {
        console.log('User cancelled login or did not fully authorize.');
    }
    });

And should be used like this:

>Calling FB.login prompts the user to authenticate your application using the OAuth Dialog.
>
>Calling FB.login results in the JS SDK attempting to open a popup window. As such, this method should only be called after a user click event, otherwise the popup window will be blocked by most browsers.

By default it gets the basic permissions (which are really basic, it's just the stuff at <https://graph.facebook.com/platon>, I think, although that is basically telling it *who you are* so I shouldn't take it for granted) but you can pass the additional requested permissions as arguments for this method like so:

    FB.login(function(response) {
    // handle the response
    }, {scope: 'email,user_likes'});

BUT *BE CAREFUL* BECAUSE:

>Asking for more permissions decreases the number of users who will choose to authenticate your application. As such, you should ask for as few permissions as possible the first time you want a user to authenticate your app.

That is interesting that we might ask more than once though. For our small app I don't think that makes sense though. Actually. It does. More on this later.

There are some others that let the user log out or let us check if they're logged in too. But lets look at how to make API calls once someone is logged in.

So there are Graph API queries and FQL queries via the legacy REST API. Lets just focus on Graph right? for future-proofing.

An example (again, this is Graph):

    FB.api('/me', function(response) {
      alert('Your name is ' + response.name);
    });

That's the only example on the main SDK page but there's more [here](https://developers.facebook.com/docs/reference/javascript/FB.api/).

For example here's how to load the 3 most recent post objects (of the Facebook Platform Page, which has the username "platform") (I imagine we can do something similar to pull up recent photos of someone?):

    FB.api('/platform/posts', { limit: 3 }, function(response) {
      for (var i=0, l=response.length; i<l; i++) {
        var post = response[i];
        if (post.message) {
          alert('Message: ' + post.message);
        } else if (post.attachment && post.attachment.name) {
          alert('Attachment: ' + post.attachment.name);
        }
      }
    });

And here's how to post something (requires the `publish_stream` permission): 

    var body = 'Reading JS SDK documentation';
    FB.api('/me/feed', 'post', { message: body }, function(response) {
      if (!response || response.error) {
        alert('Error occured');
      } else {
        alert('Post ID: ' + response.id);
      }
    });

So like here's the API reference page for getting photos: <https://developers.facebook.com/docs/reference/api/photo/>

We photo object fields that might be of interest to us:

* `id` -- photo id
* `tags` -- who's in the photo, and their position in the photo
* `picture` -- thumbnail of the photo
* `source` -- larger photo
* `height` and `width` of photo

So I guess the flow would be:

* they log in to facebook, giving us permission to look at their photos and their friends' photos
* they search a friend's name, we pull in a dropdown list of names that match the search, and prob thumbnails of their photo
* they select a friend
* we pull up x recent photos that person is tagged in. they can choose one for the casting list, or click a "more" button to load more, until they find one
* when they're done with the casting list and click the share/publish button, we ask for an additional permission, to publish to their timeline. bifurcating the permission requests makes sense I think, because not everyone will want to publish, and people are uncomfortable with giving write-permission to stuff. so don't ask for permission to do that until they've expressed interest by pressing the publish button

The publish dialog can be done with [`FB.ui`](https://developers.facebook.com/docs/reference/javascript/FB.ui/), a tool in the JS SDK for making FB dialogs.

### [Open Graph](https://developers.facebook.com/docs/opengraph/keyconcepts/)

This is how we will share stuff when we're done I think. Not sure if we use this if we're a self-hosted app. Not sure if we need to be a self-hosted app?