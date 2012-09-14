var async = require('async'),
    pg = require('pg');

var pg_client = new pg.Client('postgres://cast:eleluku@pauldechov.com:5432/cast');
pg_client.connect();

var generateID = function() {
  // generate 5 digit base62 string and convert to [0-9A-Za-z]
  // use as movie and member ids instead of serial columns
};

var resetTables = function(callback) {
  async.forEachSeries([
    'DROP TABLE IF EXISTS movies, members, movies_to_members',
    'CREATE TABLE movies (id serial PRIMARY KEY, title varchar(255))',
    'CREATE TABLE members (id serial PRIMARY KEY, movie_id integer REFERENCES movies(id), friend_name varchar(255), friend_fb_id integer, actor_name varchar(255), actor_tmdb_id integer, actor_image_url varchar(255))'
  ], function(query_string, callback) {
    pg_client.query(query_string, callback);
  }, callback);
};

var createMovie = function(callback) {
  pg_client.query('INSERT INTO movies DEFAULT VALUES RETURNING id', function(err, result) {
    callback(err, result.rows[0]);
  });
};
var createMovieFromTitle = function(title, callback) {
  pg_client.query('INSERT INTO movies (title) VALUES ($1) RETURNING id, title', [title], function(err, result) {
    callback(err, result.rows[0]);
  });
};

var updateMovie = function(movie, callback) {
  pg_client.query('UPDATE movies SET title = $1 WHERE id = $2', [movie.title, movie.id], callback);
};

var getMovie = function(id, callback) {
  pg_client.query('SELECT * FROM movies m WHERE m.id = $1', [id], function(err, result) {
    if (err) { return callback(err); }
    var movie = result.rows[0];
    if (movie === undefined) { return callback(null) }
    pg_client.query('SELECT * FROM members m WHERE m.movie_id = $1', [id], function(err, result) {
      if (err) { return callback(err); }
      movie.members = result.rows;
      callback(null, movie);
    });
  });
};

var createMember = function(member, callback) {
  pg_client.query('INSERT INTO members (movie_id, friend_name, actor_name, actor_image_url) VALUES ($1, $2, $3, $4) RETURNING id, movie_id, friend_name, actor_name, actor_image_url', [member.movie_id, member.friend_name, member.actor_name, member.actor_image_url], function(err, result) {
    callback(err, result.rows[0]);
  });
};
var deleteMember = function(id, callback) {
  pg_client.query('DELETE FROM members m WHERE m.id = $1', [id], callback);
};


var initialize = function() {
  resetTables(function(err) {
    if (err) { return console.error(err); }
    console.log('tables reset.');
    async.forEachSeries([
      'Soul Train',
      'Max Jacobson and the Horrible Lights',
      'The Jacobson Family'
    ], createMovieFromTitle, function(err) {
      if (err) { return console.error(err); }
      console.log('fixtures loaded.');
    });
  });
};


module.exports = {
  initialize: initialize,
  getMovie: getMovie,
  createMovie: createMovie,
  updateMovie: updateMovie,
  createMember: createMember,
  deleteMember: deleteMember

}