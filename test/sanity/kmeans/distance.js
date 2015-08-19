var clusterfck = require("../../../lib/clusterfck");
var distance = require("../../../lib/distance");
var equality = require("equality");


var data = [
   [1, 1, 1],
   [5, 1, 1],
   [1, 5, 5],
   [4, 2, 2],
   [5, 5, 10000]
];

var iterations = 20;

var distFunc = function(a, b) {
   return Math.abs(a[0] - b[0]);
}

exports.testDistFunc = function(test) {
   for (var i = 0; i < iterations; i++) {
      var clusters = clusterfck.kmeans(data, { k: 2, distance: distFunc });

      test.ok(equality.members(clusters,[ [[ 1, 1, 1 ], [ 5, 1, 1 ], [ 1, 5, 5 ] ,
              [ 4, 2, 2 ]], [[ 5, 5, 10000 ]] ]
      ), "clustered into correct two clusters");
   }
   test.done();
};

exports.testEuclidean = function(test) {
  var val = distance.euclidean(
    { a: 1, b: 1 },
    { a: 2, b: 2 },
    ['a', 'b']
  );
  test.ok(val === Math.sqrt(2));
  test.done();
};

// [ [ [ 1, 1, 1 ], [ 5, 1, 1 ], [ 1, 5, 5 ], [ 4, 2, 2 ] ],
//  [ [ 5, 5, 10000 ] ] ]
