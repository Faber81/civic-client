(function() {
  angular.module('civic.common')
    .filter('labelify', labelifyFilter)
    .filter('arrayToList', arrayToListFilter);

  // @ngInject
  function labelifyFilter() {
    return function (input) {
      input = input.replace(/_/g, " ");
      return input.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    }
  }

  // @ngInject
  function arrayToListFilter(_, $log) {
    return function(input, limitTo, terminator, showTotal) {
      limitTo = parseInt(limitTo, 10);
      terminator = terminator ? terminator : "";
      if (_.isArray(input) && parseInt(limitTo, 10)) {
        var output = input.slice(0,limitTo).join(', ').concat(terminator);
        if(showTotal && input.length > limitTo) {
          output = output + '<span class="more"> (' + String(input.length - limitTo) + ' more)</span>';
        }
        return output;
      } else if (_.isArray(input)) {
        return input.join(', ');
      } else {
        return input;
      }
    }
  }
})();