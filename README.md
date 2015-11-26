# I/O Content Blog

## A simple HTML, JS and CSS blog backed by [I/O Content](http://www.icontent.com) API driven CMS

This simple blog is the official I/O Content blog code, and an example of how [I/O Content](http://www.icontent.com) can be used to manage content for websites. You can also use this example to run your blog using content in your I/O Content account. The blog includes [Disqus](https://disqus.com/) comments integration


The **[Demo](http://blog.iocontent.com/)** is hosted on Amazon S3 using S3's [static website](http://docs.aws.amazon.com/AmazonS3/latest/dev/website-hosting-custom-domain-walkthrough.html) feature. It could also be hosted on [GitHub pages](https://pages.github.com/) or any other static website hosting.

This blog uses simple HTML, JS and CSS, backed by the I/O Content API which serves content entries in response to a query sent over an HTTP GET request using the [io-content-js](https://github.com/appsoftware/io-content-js) library. 

The required files required to run this blog are the `index.html`, `template.html`, `app.js`, `style.css`  and the `bower_components` folder.

![alternate text](https://cdn.iocontent.com/api/v1.0/assets/rimm2eskcb7fub66hczrfoqcpd/20151118-124147243/bbcj/iocontent-blog-deploy-files.png)

*Note this blog is not available as a bower package, and all dependencies have been copied to the respository so you can simply copy deploy this website on any web server. This will not run from the local file system, so you will need to run via your local web server (e.g. Apache / IIS) to test.*

## Configuring ths blog

This example pulls content hosted in our 'blog-example' sub account. You'll need to set up you're own sub account and content types and edit the sample as appropriate. Full [documentation](https://github.com/appsoftware/io-content-docs)  for I/O Content describes how to manage content, set up content types and query the API.

Once you have an account at I/O Content, open up app.js and edit blogConfig at the top of the file:


// *********************************************
// Edit blog config as required
// *********************************************

	blogConfig = {
		
		// Set ioContentSubAccountKey and ioContentContentType according
		// to the sub account key assigned when you created the sub account that
		// under which this blog article has been published, and ioContentContentType
		// according to the appropriate content type under that sub account 
		
		ioContentSubAccountKey: '<YOUR SUB ACCOUNT KEY>', // e.g. rimm2eskcb7fub66hczrfoqcpd
		ioContentContentType: '<YOUR CONTENT TYPE>',      // e.g. e.g. blog-article
		
		// The content type is expected to have the following property keys, without them
		// additional code will need to be edited to reflect alternate property names
		// on the response JSON
		
		// - title
		// - publicPublishDate
		// - content
	
		// Replace to change blog logo. Below is set to use I/O Content asset CDN using
		// a url generated in I/O content asset management area
		
		logoImageSrc: '<YOUR LOGO URL>'
	
		// Replace to change blog strapline txt
		
		strapLineText:  '<YOUR STRAP LINE>', // e.g. What my blog's all about
		
		// Set null to disable disqus comments
		
		disqusShortName: '<YOUR DISQUSS SHORT NAME>', 
	};



The dependencies for this project are:

- [io-content-js](https://github.com/appsoftware/io-content-js) - for querying the I/O content API
- [AngularJS](https://github.com/angular) - for rendering UI / managing routes
- [gridism](https://github.com/cobyism/gridism) - for a light weight CSS grid
- [github-markdown-css](https://github.com/sindresorhus/github-markdown-css) - simple markdown / html styling

All dependencies are commited to this repository so there will be no need to reinstall from bower.

Note that I/O Content is queried via REST API, and [io-content-js](https://github.com/appsoftware/io-content-js) simply assists with making cross domain requests compatible with all major browsers.

## How content is loaded

### API Query

The core content fetch code is as follows:

**1. Set up the content client**


	var contentClient = new ContentClient();
	
	contentClient.contentClientBaseParameters.subAccountKey = 'nl7bwlc4txh2uvw3s6h4gcclgb';
	contentClient.contentClientBaseParameters.contentType = 'blog-article';


**2. Request a list of content entries and load the first into view**

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

### Content Assets

Content Assets managed in I/O Content are loaded from our CDN using plain HTTPS urls. Where requesting images, our CDN offers 'on the fly' image resizing, specified here using the `?maxHeight=80` query string argument. Resized images are cached in the CDN for fast load times.

Other file types are also served over the CDN in the same manner.


	<div>
		<img src="https://cdn.iocontent.com/api/v1.0/assets/nfm6dwvsmrd6uukgj3rzdugerc/20151113-091052578/tcm1/iocontent-blocks-logo-335-x-1149.png?maxHeight=80" alt="logo" />
	</div>

Which retrieves the following image:

![io content logo](https://cdn.iocontent.com/api/v1.0/assets/nfm6dwvsmrd6uukgj3rzdugerc/20151113-091052578/tcm1/iocontent-blocks-logo-335-x-1149.png?maxHeight=80)
