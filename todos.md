# todos

## big

* add facebook support
    * https://developers.facebook.com/docs/authentication/client-side/
    * make this a facebook app. it uses your facebook friends and then when you're done, it publishes a cool graphic to your timeline (and directs other people to make their own and links them). I showed it to some friends and they had a lot of fun playing it but wanted something to do with it when they were done, specifically posting a graphic to their timeline. You should be able to tweet it or instagram it too.
        * http://developers.facebook.com/docs/guides/canvas/
        * http://developers.facebook.com/docs/opengraph/tutorial/
    * and like make a cool lonely sandwich style promo vid showing some people hanging out and playing it. kinda funny and short.
    * maybe it would be more viral if it was smaller? Like, the game is you make one of these for EACH of your facebook friends and post it to their timeline. Instead of "cast your life" it'd be more like, "hey friend, IMO this is your celebrity lookalike". It's easier to imagine what the image/graphic would look like if there's only two side-by-side photos. And it could be scattered all over facebook with links pointing back to our site / app (which can have an ad or two on it)
* unique urls / permalinks
    * zealously generate and redirect upon visit to top-level URL (done)
    * allow forking in place
    * editable through one-time socket connection ONLY (future milestone)
        * live broadcasts to other viewers
* re-craft editing experience
    * type and/or select friend's name to create a member with default actor
    * at most one member is in editing mode at a time
    * search pertains (via visual and functional design) to that member only, during which time if you click on a picture, it's changed
        * might be good to store tmdb image id (if such a thing exists)
        * consider making App.Actor into an ember-data Model, but look up tmdb api structure first to see how much trouble it would be

## small
it's the small things that count *-somebody wise*

* re-size the indicator (done)
    * what indicator?
        * the loading indicator
        * actually, loading should eventually be indicated more precisely
* consider moving some templating to server
    * http://andyet.net/blog/2012/sep/13/stop-sending-template-engines-to-the-browser-a-ret/
* look into why members don't disappear right away when they're deleted

## style

* come up with a visual style for the whole thing and make it happen
* i kinda want to try this
    * cool, do some research and observation or just start experimenting, whatever you want to do
* I'm curious about how developers and designers share responsibilities. Like, if I were the designer and you were the developer, would I ask you to structure the divs in a certain way and give you class names and then get to work? or would i go in and do that?
    * I don't know, but however you feel like doing it, just go for it
