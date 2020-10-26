var express = require('express');
var router = express.Router();

var url = require('url');
const fetch = require("node-fetch");

router.get('/api/ping', function(req, res, next) {
  res.json({success: true});
});

router.get('/api/posts', function(req, res, next) {
    if (!req.query.tags) {
        return res.status(400).json({
          error: "​Tags parameter is required"
        });
    }

    const validSortBy = ['id', 'reads', 'likes', 'popularity'];
    const validDirection = ['asc', 'desc'];

    let tags = req.query.tags.split(',');
    let sortBy = 'id';
    let direction = 'asc';

    if (req.query.sortBy) {
        if (!(validSortBy.includes(req.query.sortBy))) {
            return res.status(400).json({
              error: "​sortBy parameter is invalid"
            });
        }
        sortBy = req.query.sortBy;
    }

    if (req.query.direction) {
        if (!(validDirection.includes(req.query.direction))) {
            return res.status(400).json({
              error: "direction parameter is invalid"
            });
        }
        direction = req.query.direction;
    }

    var url = new URL("https://api.hatchways.io/assessment/blog/posts");
    var params = {tag: tags[0], sortBy: sortBy, direction: direction};
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    fetch(url)
    .then(response => response.json())
    .then(data => {
        let compare = function() {};
        function comparator(sortByParam, directionParam) {
            console.log(directionParam);
            if (directionParam == "asc") {
                console.log(sortByParam + ":" + directionParam);
                compare = function(a, b) {
                    if (a[sortByParam] < b[sortByParam]) {
                        return -1;
                    }
                    if (a[sortByParam] > b[sortByParam]) {
                        return 1;
                    }
                    return 0;
                }
            } else {
                console.log();
                compare = function(a, b) {
                    if (a[sortByParam] < b[sortByParam]) {
                        return 1;
                    }
                    if (a[sortByParam] > b[sortByParam]) {
                        return -1;
                    }
                    return 0;
                }
            }
        }

        comparator(params.sortBy, params.direction);

        data.posts.sort(compare);

        return res.send(data);
    });
});

module.exports = router;
