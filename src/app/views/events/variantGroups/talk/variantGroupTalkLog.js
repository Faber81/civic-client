(function() {
  'use strict';
  angular.module('civic.events.variantGroups')
    .controller('VariantGroupTalkLogController', VariantGroupTalkLogController)
    .directive('variantGroupTalkLog', variantGroupTalkLogDirective);

  // @ngInject
  function variantGroupTalkLogDirective() {
    return {
      restrict: 'E',
      scope: {},
      controller: 'VariantGroupTalkLogController',
      templateUrl: 'app/views/events/variantGroups/talk/variantGroupTalkLog.tpl.html'
    };
  }

  // @ngInject
  function VariantGroupTalkLogController($scope, _,
                                    VariantGroups,
                                    VariantGroupRevisions,
                                    VariantGroupHistory) {

    var ctrl = $scope.ctrl = {}; // create ctrl here, link function will attach entityTalkView after DOM rendered.
    var comments, revisions, history;

    $scope.comments = VariantGroups.data.comments;
    $scope.revisions = VariantGroupRevisions.data.collection;
    $scope.history = VariantGroupHistory.data.collection;

    $scope.$watchCollection('[comments, revisions, history]', function(collections) {
      comments = _.merge({}, collections[0]);
      revisions = _.merge({}, collections[1]);
      history = _.merge({}, collections[2]);

      comments = _.map(comments, function(comment) {
        comment.type = 'comment';
        return comment;
      });

      revisions = _.map(revisions, function(revision) {
        revision.type = 'revision';
        return revision;
      });

      history = _.map(history, function(change) {
        change.type='history';
        return change;
      });


      // concatenate event arrays, sort by date descending
      ctrl.logItems = comments.concat(revisions, history);
      ctrl.logItems = _.chain(ctrl.logItems)
        .map(function(item) {
          // revisions can have an .user attribute that's just a string
          item.username = typeof item.user === 'object' ? item.user.username : item.user;
          // some items have both created_at and updated_at, we'll favor updated_at
          item.timestamp = _.has(item, 'updated_at') ? item.updated_at : item.created_at;
          return item;
        })
        .sortBy(function(item) {
          return new Date(item.timestamp);
        })
        .reverse()
        .value();
    });
  }
})();
