var distances = require("./distance");

var CLUSTER_KEY = '$__cluster';

function KMeans(centroids) {
   this.centroids = centroids || [];
}

KMeans.prototype.randomCentroids = function(points, k) {
   // shallow copy points array
   var centroids = points.slice(0);
   // Shuffle data
   centroids.sort(function() {
      return (Math.round(Math.random()) - 0.5);
   });
   return centroids.slice(0, k);
}

KMeans.prototype.classify = function(point, distance, keys) {
   var min = Infinity;
   var index = 0;
   keys = keys || point.map(function(x, i) { return i; });

   distance = distance || "euclidean";
   if (typeof distance === "string") {
      distance = distances[distance];
   }

   for (var i = 0; i < this.centroids.length; i++) {
      var dist = distance(point, this.centroids[i], keys);
      if (dist < min) {
         min = dist;
         index = i;
      }
   }

   return index;
}

/**
 * @typedef {ClusterOpts}
 * @property {Number}          [k]              Number of clusters
 * @property {string[]}         [keys]          Point access keys, in order
 * @property {string|Function} [distance]       Distance calculation (default=euclidean)
 * @property {Number}          [snapshotPeriod] How often to give progress update
 * @property {Function}        [snapshotCb]     What to do to give snapshot
 */

/**
 * Run clustering algorithm on points
 * @param  {mixed[]} points Points. Optionally pass access keys in opts.
 * @param  {ClusterOpts} opts   Options
 * @return {mixed[][]}        Clusters
 */
KMeans.prototype.cluster = function(points, opts) {
   opts = opts || {};
   var snapshotPeriod = opts.snapshotPeriod;
   var snapshotCb = opts.snapshotCb;
   // Use index 0:n as keys if none are specifically provided
   var keys = opts.keys || (points[0] ? points[0].map(function(x, i) { return i; }) : []);
   var dimensions = keys ? keys.length : 0;
   var cardinality = points.length;
   var areDataRows = Object.prototype.toString.call(points && points[0]) === '[object Object]';

   var k = opts.k || Math.max(2, Math.ceil(Math.sqrt(points.length / 2)));

   var distance = distance || "euclidean";
   if (typeof distance === "string") {
      distance = distances[distance];
   }

   this.centroids = this.randomCentroids(points, k);

   var assignment = new Array(points.length);
   var clusters = new Array(k);

   var iterations = 0;
   var movement = true;

   while (movement) {
      // update point-to-centroid assignments
      for (var i = 0; i < cardinality; i++) {
         var point = points[i];
         var cluster = this.classify(point, distance, keys);
         assignment[i] = cluster;
         if (areDataRows) {
            point[CLUSTER_KEY] = cluster;
         }
      }

      // update location of each centroid
      movement = false;
      for (var j = 0; j < k; j++) {
         var assigned = [];
         for (var i = 0; i < cardinality; i++) {
            if (assignment[i] === j) {
               assigned.push(points[i]);
            }
         }

         if (!assigned.length) {
            continue;
         }

         var centroid = this.centroids[j];
         var newCentroid = {};

         for (var g = 0; g < keys.length; g++) {
            var sum = 0;
            var key = keys[g];
            for (var i = 0; i < assigned.length; i++) {
               sum += assigned[i][key];
            }
            newCentroid[key] = sum / assigned.length;

            if (newCentroid[key] !== centroid[key]) {
               movement = true;
            }
         }
         this.centroids[j] = newCentroid;
         clusters[j] = assigned;
      }

      if (snapshotCb && (iterations++ % snapshotPeriod === 0)) {
         snapshotCb(clusters);
      }
   }

   return clusters;
}

KMeans.prototype.toJSON = function() {
   return JSON.stringify(this.centroids);
}

KMeans.prototype.fromJSON = function(json) {
   this.centroids = JSON.parse(json);
   return this;
}

module.exports = KMeans;

module.exports.kmeans = function(vectors, k) {
   return (new KMeans()).cluster(vectors, k);
}
