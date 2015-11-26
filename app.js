
// *********************************************
// Edit blog config as required
// *********************************************

blogConfig = {
	
	// Set ioContentSubAccountKey and ioContentContentType according
	// to the sub account key assigned when you created the sub account that
	// under which this blog article has been published, and ioContentContentType
	// according to the appropriate content type under that sub account 
	
	ioContentSubAccountKey: 'rimm2eskcb7fub66hczrfoqcpd',
	ioContentContentType: 'blog-article',
	
	// The content type is expected to have the following property keys, without them
	// additional code will need to be edited to reflect alternate property names
	// on the response JSON
	
	// - title
	// - publicPublishDate
	// - content
	
	// Replace to change blog logo. Below is set to use I/O Content asset CDN using
	// a url generated in I/O content asset management area
	
	logoImageSrc: 'https://cdn.iocontent.com/api/v1.0/assets/nfm6dwvsmrd6uukgj3rzdugerc/20151113-091052578/tcm1/iocontent-blocks-logo-335-x-1149.png?maxHeight=80',
	
	// Replace to change blog strapline txt
	
	strapLineText: 'For I/O Content news and tips for managing content in your applications',
	
	// Set null to disable disqus comments
	
	disqusShortName: 'iocontent', 
};
		
// *********************************************
// No need to edit below this line
// *********************************************
(function () {

	'use strict';
	
	angular
	
	.module('appMain', ['ng', 'ngRoute', 'ngSanitize', 'ngDisqus'])
	.config(['$routeProvider', '$locationProvider', '$disqusProvider', function ($routeProvider, $locationProvider, $disqusProvider) {

		$routeProvider
		.when('/', {
			templateUrl: 'template.html',
			controller: 'blogController'
		})
		.when('/blog/:contentKey/:contentSeoTitle', {
			templateUrl: 'template.html',
			controller: 'blogController'
		})
		.otherwise({
			redirectTo: '/'
		});

		// html5Mode required for querystring parameter search ($location)

		$locationProvider.html5Mode(false).hashPrefix('!');
		
		if(blogConfig.disqusShortName)
		{
			$disqusProvider.setShortname(blogConfig.disqusShortName)
		}
	}]);
})();

(function () {

	'use strict';

	angular.module('appMain')

		.controller('blogController', ['$scope', '$routeParams', function ($scope, $routeParams) {
			
			// Helper function for creating pretty seo text in url
			
			var toHypenCase = function (str) {
				
				return str.replace(/\W+/g, '-').toLowerCase();
			}
			
			// Common url string generation from blog entry properties
			
			var getBlogUrl = function (contentKey, contentTitle) {
				
				return '/#!/blog/' + contentKey + '/' + toHypenCase(contentTitle);
			}

			var contentKey = $routeParams.contentKey; 

			$scope.blogConfig = blogConfig;

			// Set up I/O Content ContentClient and configure sub account and 
			// content type.

			var contentClient = new ContentClient();

			contentClient.contentClientBaseParameters.subAccountKey = blogConfig.ioContentSubAccountKey;
			contentClient.contentClientBaseParameters.contentType = blogConfig.ioContentContentType;

			$scope.articleCurrent = {};

			$scope.blog = {

				articleCurrent: {},

				articleNavList: [],
				
				loadSingleArticle: function (contentKey) {

					var blog = this;

					// Load full content for a single blog article

					var apiCallBack = function (responseJson) {

						var contentApiResponse = JSON.parse(responseJson);

						// In JS api, an array of content objects is always returned, even
						// where the query would always limit the result set to a single content entity
						
						var articleCurrent = contentApiResponse.data[0];

						blog.articleCurrent = articleCurrent;
						
						console.log(blog.articleCurrent)
						
						// Scope apply as this callback as async event
						// not monitored by Angular
						
						$scope.$apply();
						
						// Doc title needs to be set in plain JS as is out of scope of
						// view controller
						
						if(articleCurrent && articleCurrent.title)
						{
							document.title = articleCurrent.title;
						}
					}
					
					// Construct single blog entry query and fetch
					
					var query = 'key.equals=' + contentKey + '&markdownToHtml=true';

					contentClient.get(query, apiCallBack);
				},
				loadArticleNavList: function() {
					
					// Load a list of blog artciles to allow user to navigate
					
					var blog = this;
					
					var apiCallBack = function (responseJson) {

						var contentApiResponse = JSON.parse(responseJson);

						blog.articleNavList = contentApiResponse.data;

						for(var i= 0; i < blog.articleNavList.length; i++)
						{
							blog.articleNavList[i].blogUrl = getBlogUrl(blog.articleNavList[i].key, toHypenCase(blog.articleNavList[i].title));
						}
						
						// If content key is not loaded on the route, load the most recent
						// blog entry from the list
						
						if(!$scope.contentKey)
						{
							var loadKey = contentKey != null ? contentKey : blog.articleNavList[0].key;

							blog.loadSingleArticle(loadKey);
						}
						
						// Scope apply as this callback as async event
						// not monitored by Angular
						
						$scope.$apply();
					}

					// Query specifies get content entries in descending order (by custom publicPublishDate field)
					// limit to the 20 most recent entries, and restrict the properties (select) to key and title, as
					// we don't need the full content entry for a navigation list
					
					var query = 'orderByDescending=publicPublishDate&pageNumber=1&pageSize=30&select=key+title';

					contentClient.get(query, apiCallBack);
				}
			}

			// Init

			$scope.blog.loadArticleNavList();
			
			if($scope.contentKey)
			{
				$scope.blog.loadSingleArticle($scope.contentKey);
			}
		}]);

})();