module.exports = {

  euclidean: function(v1, v2, keys) {
      var total = 0;

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        total += Math.pow(v2[key] - v1[key], 2);
      }

      return Math.sqrt(total);
   },

   manhattan: function(v1, v2, keys) {
    var total = 0;

    for (var i = 0; i < keys.length ; i++) {
      var key = keys[i];
      total += Math.abs(v2[key] - v1[key]);
    }

    return total;
   },

   max: function(v1, v2, keys) {
    var max = 0;

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      max = Math.max(max , Math.abs(v2[key] - v1[key]));
    }

    return max;
  }

};
