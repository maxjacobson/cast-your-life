var http = require('http');

var responses = {
  search: {
    "page": 1, 
    "results": [
        {
            "adult": false, 
            "id": 287, 
            "name": "Brad Pitt", 
            "profile_path": "/w8zJQuN7tzlm6FY9mfGKihxp3Cb.jpg"
        }
    ], 
    "total_pages": 1, 
    "total_results": 1
  },
  images: {
    "id": 287, 
    "profiles": [
        {
            "aspect_ratio": 0.66, 
            "file_path": "/w8zJQuN7tzlm6FY9mfGKihxp3Cb.jpg", 
            "height": 1969, 
            "iso_639_1": null, 
            "width": 1295
        }, 
        {
            "aspect_ratio": 0.67, 
            "file_path": "/cLUacutO7dOMksQK8Zg0q2Gybsx.jpg", 
            "height": 1230, 
            "iso_639_1": null, 
            "width": 820
        }, 
        {
            "aspect_ratio": 0.67, 
            "file_path": "/jqarc2L4Hp5nGP5Jym4ptLXpPIo.jpg", 
            "height": 1400, 
            "iso_639_1": null, 
            "width": 934
        }
    ]
  }
};

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  var response;
  if (req.url.indexOf('search') >= 0) {
    response = responses.search;
  }
  else if (req.url.indexOf('images') >= 0) {
    response = responses.images;
  }
  res.end(JSON.stringify(response));
//  res.end(JSON.stringify({ url: req.url }));
}).listen(3000, '127.0.0.1');

