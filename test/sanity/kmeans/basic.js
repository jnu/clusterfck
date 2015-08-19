var clusterfck = require("../../../lib/clusterfck");
var equality = require("equality");
var _ = require('underscore');

var data = [
   [1, 1, 1],
   [2, 2, 2],
   [3, 3, 3],
   [4, 4, 4],
   [5, 5, 5],
   [20, 20, 20],
   [200, 200, 200]
];

var objData = data.map(function(point) {
   return {
      a: point[0],
      b: point[1],
      c: point[2]
   };
});

function withClusterKey(clusterIdx, row) {
   return _.extend({}, row, {
      '$__cluster': clusterIdx
   });
}

var iterations = 20;

exports.testTwoClusters = function(test) {
   for (var i = 0; i < iterations; i++) {
      var clusters = clusterfck.kmeans(data, { k: 2 });
      test.ok(equality.members(clusters, [
         [
            [1, 1, 1],
            [2, 2, 2],
            [3, 3, 3],
            [4, 4, 4],
            [5, 5, 5],
            [20, 20, 20]
         ],
         [
            [200, 200, 200]
         ]
      ]), "clustered into correct two clusters");
   }
   test.done();
}

exports.testThreeClusters = function(test) {
   for (var i = 0; i < iterations; i++) {
      var clusters = clusterfck.kmeans(data, { k: 3 });
      test.ok(equality.members(clusters, [
         [
            [1, 1, 1],
            [2, 2, 2],
            [3, 3, 3],
            [4, 4, 4],
            [5, 5, 5],
         ],
         [
            [20, 20, 20]
         ],
         [
            [200, 200, 200]
         ]
      ]), "clustered into correct three clusters");
   }
   test.done();
}

exports.testClusterKeys = function(test) {
   for (var i = 0; i < iterations; i++) {
      var clusters = clusterfck.kmeans(objData, {
         k: 3,
         keys: ['a', 'b', 'c']
      });

      var expected = [
         objData.slice(0, 5),
         objData.slice(5, 6),
         objData.slice(6, 7)
      ];

      clusters = clusters.sort(function(X, Y) {
         return X[0].a < Y[0].a ? -1 : 1;
      });

      test.ok(
         _.every(clusters, function(c, i) {
            var e = expected[i];
            var clusterId = c[0] && c[0]['$__cluster'];
            return _.every(c, function(d, j) {
               return (
                  d.a === e[j].a &&
                  d.b === e[j].b &&
                  d.c === e[j].c &&
                  d['$__cluster'] === clusterId
               );
            });
         }),
         "clustered into correct three clusters"
      );
   }
   test.done();
};
