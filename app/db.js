var async = require('async'),
    pg = require('pg');

var pg_client = new pg.Client('postgres://cast:eleluku@pauldechov.com:5432/cast');
pg_client.connect();


// TODO generate random base62 number (5 digit?) represented with [0-9A-Za-z]
var id_index = 1;
var generateID = function() {
  return 'gen' + (id_index++);
};
var generateUniqueID = function(table_name, callback) {
  var id = null,
      is_unique = false;
  async.until(
    function() { return is_unique; },
    function(callback) {
      id = generateID();
      pg_client.query('SELECT COUNT(*) FROM '+table_name+' WHERE id = $1', [id], function(err, result) {
        if (err) { return callback(err); }
        is_unique = result.rows[0].count === 0;
        return callback();
      });
    },
    function(err) {
      if (err) { return callback(err); }
      return callback(null, id);
    }
  );
};

var reset = function(callback) {
  async.forEachSeries([
    'DROP TABLE IF EXISTS movies, members, movies_to_members',
    'CREATE TABLE movies (id varchar(8) PRIMARY KEY, title varchar(255))',
    'CREATE TABLE members (id varchar(8) PRIMARY KEY, movie_id varchar(8) REFERENCES movies(id), friend_name varchar(255), friend_fb_id integer, actor_name varchar(255), actor_tmdb_id integer, actor_image_url varchar(255))'
  ], function(query_string, callback) {
    pg_client.query(query_string, callback);
  }, callback);
};

var createMovie = function(callback) {
  generateUniqueID('movies', function(err, id) {
    if (err) { return callback(err); }
    console.log('inserting movie:', id);
    pg_client.query('INSERT INTO movies (id) VALUES ($1) RETURNING id', [id], function(err, result) {
      callback(err, result.rows[0]);
    });
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
  generateUniqueID('members', function(err, id) {
    if (err) { return callback(err); }
    console.log('inserting member:', id);
    pg_client.query('INSERT INTO members (id, movie_id, friend_name, actor_name, actor_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, movie_id, friend_name, actor_name, actor_image_url', [id, member.movie_id, member.friend_name, member.actor_name, member.actor_image_url], function(err, result) {
      callback(err, result.rows[0]);
    });
  });
};
var deleteMember = function(id, callback) {
  pg_client.query('DELETE FROM members m WHERE m.id = $1', [id], callback);
};


module.exports = {
  reset: reset,
  getMovie: getMovie,
  createMovie: createMovie,
  updateMovie: updateMovie,
  createMember: createMember,
  deleteMember: deleteMember

}