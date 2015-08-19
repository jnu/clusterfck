var distances = require("./distance");

var CLUSTER_KEY = '$__cluster';

function KMeans(centroids) {
   this.centroids = centroids || [];
}

KMeans.prototype.randomCentroids = function(points, k) {
   var centroids = points.slice(0); // copy
   centroids.sort(function() {
      return (Math.round(Math.random()) - 0.5);
   });
   return centroids.slice(0, k);
}

KMeans.prototype.classify = function(point, distance, accessors) {
   var min = Infinity;
   var index = 0;

   distance = distance || "euclidean";
   if (typeof distance === "string") {
      distance = distances[distance];
   }

   for (var i = 0; i < this.centroids.length; i++) {
      var dist = distance(point, this.centroids[i], accessors);
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
 * @property {Function[]}      [accessors]      Point data accessors, in order
 * @property {string|Function} [distance]       Distance calculation (default=euclidean)
 * @property {Number}          [snapshotPeriod] How often to give progress update
 * @property {Function}        [snapshotCb]     What to do to give snapshot
 */

/**
 * Run clustering algorithm on points
 * @param  {mixed[]} points Points. Optionally pass accessor in opts.
 * @param  {ClusterOpts} opts   Options
 * @return {mixed[][]}        Clusters
 */
KMeans.prototype.cluster = function(points, opts) {
   opts = opts || {};
   var snapshotPeriod = opts.snapshotPeriod;
   var snapshotCb = opts.snapshotCb;
   var accessors = opts.accessors;
   var dimensions = Math.max(points ? points[0].length : 0, accessors ? accessors.length : 0);
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
         var cluster = this.classify(point, distance, accessors);
         assignment[i] = cluster;
         if (areDataRows) {
            point[CLUSTER_KEY] = cluster;
         }
      }

      // update location of each centroid
      movement = false;
      for (var j = 0; j < k; j++) {
         var assigned = [];
         for (var i = 0; i < assignment.length; i++) {
            if (assignment[i] === j) {
               assigned.push(points[i]);
            }
         }

         if (!assigned.length) {
            continue;
         }

         var centroid = this.centroids[j];
         var newCentroid = new Array(centroid.length);

         for (var g = 0; g < centroid.length; g++) {
            var sum = 0;
            if (!accessors) {
               for (var i = 0; i < assigned.length; i++) {
                  sum += assigned[i][g];
               }
            } else {
               for (var i = 0; i < assigned.length; i++) {
                  sum += accessors[g](assigned[i]);
               }
            }
            newCentroid[g] = sum / assigned.length;

            if (newCentroid[g] != centroid[g]) {
               movement = true;
            }
         }

         this.centroids[j] = newCentroid;
         clusters[j] = assigned;
      }

      if (snapshotCb && (iterations++ % snapshotPeriod == 0)) {
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
