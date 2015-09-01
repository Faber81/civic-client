(function() {
  'use strict';
  angular.module('civic.services')
    .factory('VariantRevisionsResource', VariantRevisionsResource)
    .factory('VariantRevisions', VariantRevisionsService);

  function VariantRevisionsResource($resource, $cacheFactory) {
    var cache = $cacheFactory.get('$http');

    // adding this interceptor to a route will remove cached record
    var cacheResponseInterceptor = function(response) {
      cache.remove(response.config.url);
      return response.$promise;
    };

    return $resource('/api/variants/:variantId/suggested_changes/:revisionId',
      {
        variantId: '@variantId',
        revisionId: '@revisionId'
      },
      {
        // Base Variant Revisions Resources
        query: {
          method: 'GET',
          isArray: true,
          cache: cache
        },
        get: {
          method: 'GET',
          isArray: false,
          cache: cache
        },
        submitRevision: {
          method: 'POST',
          cache: false
        },
        acceptRevision: {
          method: 'POST',
          url: '/api/variants/:variantId/suggested_changes/:revisionId/accept',
          params: {
            variantId: '@variantId',
            revisionId: '@revisionId'
          },
          cache: false
        },
        rejectRevision: {
          method: 'POST',
          url: '/api/variants/:variantId/suggested_changes/:revisionId/reject',
          params: {
            variantId: '@variantId',
            revisionId: '@revisionId'
          },
          cache: cache
        },

        // Variant Revisions Comments Resources
        submitComment: {
          method: 'POST',
          url: '/api/variants/:variantId/suggested_changes/:revisionId/comments',
          params: {
            variantId: '@variantId',
            revisionId: '@revisionId'
          },
          cache: false
        },
        updateComment: {
          method: 'PATCH',
          url: '/api/variants/:variantId/suggested_changes/:revisionId/comments/:commentId',
          params: {
            variantId: '@variantId',
            revisionId: '@revisionId',
            commentId: '@commentId'
          },
          interceptor: {
            response: cacheResponseInterceptor
          }
        },
        queryComments: {
          method: 'GET',
          url: '/api/variants/:variantId/suggested_changes/:revisionId/comments',
          params: {
            variantId: '@variantId',
            revisionId: '@revisionId'
          },
          isArray: true,
          cache: cache
        },
        getComment: {
          method: 'GET',
          url: '/api/variants/:variantId/suggested_changes/:revisionId/comments/:commentId',
          params: {
            variantId: '@variantId',
            revisionId: '@revisionId',
            commentId: '@commentId'
          },
          isArray: false,
          cache: cache
        },
        deleteComment: {
          method: 'DELETE',
          url: '/api/variants/:variantId/suggested_changes/:revisionId/comments/:commentId',
          params: {
            variantId: '@variantId',
            revisionId: '@revisionId',
            commentId: '@commentId'
          },
          cache: false
        }
      }
    );
  }

  function VariantRevisionsService(VariantRevisionsResource, Variants, $cacheFactory, $q) {
    // fetch variants cache, need to delete variant record when revision is submitted
    var cache = $cacheFactory.get('$http');

    // Base Variant Revision and Variant Revisions Collection
    var item = {};
    var parent = Variants.data.item;
    var collection = [];

    // Variant Revisions Comments
    var comment = {};
    var comments = [];

    return {
      initBase: initBase,
      initRevisions: initRevisions,
      initComments: initComments,
      data: {
        item: item,
        parent: parent,
        collection: collection,
        comment: comment,
        comments: comments
      },

      // Variant Revisions Base
      query: query,
      get: get,
      submitRevision: submitRevision,
      acceptRevision: acceptRevision,
      rejectRevision: rejectRevision,

      // Variant Revisions Comments
      queryComments: queryComments,
      getComment: getComment,
      submitComment: submitComment,
      updateComment: updateComment,
      deleteComment: deleteComment
    };

    function initBase(variantId, revisionId) {
      return $q.all([
        query(variantId, revisionId)
      ]);
    }

    function initRevisions(variantId) {
      return $q.all([
        query(variantId)
      ]);
    }

    function initComments(variantId, revisionId) {
      return $q.all([
        query(variantId, revisionId)
      ]);
    }

    // Variant Revisions Base
    function query(variantId) {
      return VariantRevisionsResource.query({ variantId: variantId }).$promise
        .then(function(response) {
          angular.copy(response, collection);
          return response.$promise;
        });
    }
    function get(variantId, revisionId) {
      return VariantRevisionsResource.get({ variantId: variantId, revisionId: revisionId }).$promise
        .then(function(response) {
          angular.copy(response, item);
          return response.$promise;
        });
    }

    function submitRevision(reqObj) {
      return VariantRevisionsResource.submitRevision(reqObj).$promise.then(
        function(response) { // success
          cache.remove('/api/variants/' + reqObj.id + '/suggested_changes');
          return $q.when(response);
        },
        function(error) { //fail
          return $q.reject(error);
        });
    }

    function acceptRevision(variantId, revisionId) {
      return VariantRevisionsResource.acceptRevision({ variantId: variantId, revisionId: revisionId }).$promise.then(
        function(response) {
          cache.remove('/api/variants/' + variantId + '/suggested_changes');
          query(variantId);
          cache.remove('/api/variants/' + variantId + '/suggested_changes/' + revisionId);
          get(variantId, revisionId);
          cache.remove('/api/variants/' + variantId );
          Variants.get(variantId);
          return $q.when(response);
        },
        function(error) {
          return $q.reject(error);
        });
    }

    function rejectRevision(variantId, revisionId) {
      return VariantRevisionsResource.rejectRevision({ variantId: variantId, revisionId: revisionId }).$promise.then(
        function(response) {
          cache.remove('/api/variants/' + response.id + '/suggested_changes');
          query(variantId);
          cache.remove('/api/variants/' + response.id + '/suggested_changes/' + revisionId);
          get(variantId, revisionId);
          return $q.when(response);
        },
        function(error) {
          return $q.reject(error);
        });
    }

    // Variant Revisions Comments
    function queryComments(variantId, revisionId) {
      return VariantRevisionsResource.queryComments({ variantId: variantId, revisionId: revisionId }).$promise
        .then(function(response) {
          angular.copy(response, comments);
          return response.$promise;
        });
    }
    function getComment(variantId, revisionId, commentId) {
      return VariantRevisionsResource.getComment({ variantId: variantId, revisionId: revisionId, commentId: commentId }).$promise
        .then(function(response) {
          return response.$promise;
        });
    }
    function submitComment(reqObj) {
      return VariantRevisionsResource.submitComment(reqObj).$promise
        .then(function(response) {
          cache.remove('/api/variants/' + reqObj.variantId + '/suggested_changes/' + reqObj.revisionId + '/comments');
          queryComments(reqObj.variantId, reqObj.revisionId);
          return response.$promise;
        });
    }
    function updateComment(reqObj) {
      return VariantRevisionsResource.updateComment(reqObj).$promise
        .then(function(response) {
          cache.remove('/api/variants/' + reqObj.variantId + '/suggested_changes/' + reqObj.revisionId + '/comments/' + reqObj.commentId );
          queryComments(reqObj.variantId, reqObj.revisionId);
          return response.$promise;
        });
    }
    function deleteComment(commentId) {
      return VariantRevisionsResource.deleteComment({ variantId: parent.id, revisionId: item.id, commentId: commentId }).$promise
        .then(function(response) {
          cache.remove('/api/variants/' + parent.id + '/suggested_changes/' + item.id + '/comments');
          queryComments(parent.id, item.id);
          return response.$promise;
        });
    }
  }
})();
