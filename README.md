# Casting Director #

Cast your life.


## Node API ##
REST API for "movies" and (cast) "members".

## SQL DB schema ##
- movies: id, title
- members: id, movie_id, friend_name, friend_fb_id, actor_name, actor_tmdb_id, actor_image_url


## Server app hosting instructions ##

* a2enmod proxy proxy_http
* vim /etc/apache2/sites-enabled/000-default
  * add `ProxyPass /api http://localhost:3000`
* service apache2 restart
* git clone [repo URL]
* ln -s [repo dir]/web /var/www/cast
* apt-get install libpq-dev
* npm install async pg express
* node main.js

## Tools ##

### Tech Components ###
* compass + sass + bootstrap
* ember.js
* express.js
* postgresql

### Dev Tools ###
* node-supervisor
* Sublime Text 2
* tmux