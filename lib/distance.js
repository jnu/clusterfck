module.exports = {
  euclidean: function(v1, v2, accessors) {
      var total = 0;
      if (!accessors) {
        for (var i = 0; i < v1.length; i++) {
           total += Math.pow(v2[i] - v1[i], 2);
        }
      } else {
        for (var i = 0; i < v1.length; i++) {
          total += Math.pow(accessors[i](v2[i]) - accessors[i](v1), 2);
        }
      }
      return Math.sqrt(total);
   },
   manhattan: function(v1, v2, accessors) {
    var total = 0;
    if (!accessors) {
      for (var i = 0; i < v1.length ; i++) {
        total += Math.abs(v2[i] - v1[i]);
      }
    } else {
      for (var i = 0; i < v1.length ; i++) {
        total += Math.abs(accessors[i](v2) - accessors[i](v1));
      }
    }
    return total;
   },
   max: function(v1, v2) {
    var max = 0;
    if (!accessors) {
      for (var i = 0; i < v1.length; i++) {
        max = Math.max(max , Math.abs(v2[i] - v1[i]));
      }
    } else {
      for (var i = 0; i < v1.length; i++) {
        max = Math.max(max , Math.abs(accessors[i](v2) - accessors[i](v1)));
      }
    }
    return max;
  }
};
