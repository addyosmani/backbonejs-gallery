
var cache = new CacheProvider;


/**
 * Model of a Photo used to define the items that appear in a PhotoCollection
 * subalbum returns a reference to the current subalbum being viewed via the gallery.
 * @type Backbone.Model
 */
var Photo = Backbone.Model.extend({
   subalbum: function() { return 'c' + gallery._currentsub; }
});



/**
 * Data collection of Photo items used in index, subalbum and photo views
 * @type Backbone.Collection
 */
var PhotoCollection = Backbone.Collection.extend({
    model: Photo,
    comparator: function(item) {
        return item.get('pid');
    }
});


/**
 * The default view seen when opening up the application for the first time. This
 * contains the first level of images in the JSON store (the level-one albums).
 * @type Backbone.View
 */
var IndexView = Backbone.View.extend({
    el: $('#main'),
    indexTemplate: $("#indexTmpl").template(),

    render: function() {
        $('.jstest,.gallery').remove();
        var sg = this;
        
        this.el.fadeOut('fast', function() {
        sg.el.empty();
        $.tmpl(sg.indexTemplate, sg.model.toArray()).appendTo(sg.el);
        sg.el.fadeIn('fast');
        });
        return this;
    }

});


/**
 * The subalbum view reached when clicking on a level-one album or browsing
 * to a subalbum bookmark. This contains the images found in the 'subalbum'
 * section of an album entry. Clicking on any of the images shown in a subalbum
 * takes you to the PhotoView of that individual image
 * @type Backbone.View
 */
var SubalbumView = Backbone.View.extend({
    el: $('#main'),
    indexTemplate: $("#subindexTmpl").template(),
    
    initialize: function(options){

    },

    render: function() {
        var sg = this;

        this.el.fadeOut('fast', function() {
            sg.el.empty();
            $.tmpl(sg.indexTemplate, sg.model.toArray()).appendTo(sg.el);
            sg.el.fadeIn('fast');
        });
        return this;
    }

});


/**
 * The single-photo view for a single image on the third-level of the application.
 * This is reached either by clicking on an image at the second/subalbum level or 
 * browsing to a bookmarked photo in a subalbum.
 * @type Backbone.View
 */
var PhotoView = Backbone.View.extend({
    el: $('#main'),
    itemTemplate: $("#itemTmpl").template(),


    initialize: function(options) {
        this.album = options.album;
       
    },
    
    render: function() {
        var sg = this;
        
        this.el.fadeOut('fast', function() {
            sg.el.empty();
            $.tmpl(sg.itemTemplate, sg.model).appendTo(sg.el);
            sg.el.fadeIn('fast');
        });
        return this;
    }
});




/**
 * The controller that defines our main application 'gallery'. Here we handle
 * how routes should be interpreted, the basic initialization of the application
 * with data through an $.ajax call to fetch our JSON store and the creation of 
 * collections and views based on the models defined previously.
 * @type Backbone.Controller
 */
var Gallery = Backbone.Controller.extend({
    _index: null,
    _photos: null,
    _album :null,
	_subalbums:null,
	_subphotos:null,
	_data:null,
	_photosview:null,
	_currentsub:null,

    routes: {
        "": "index",
        "subalbum/:id": "subindex",
        "subalbum/:id/" : "directphoto",
        "subalbum/:id/:num" : "hashphoto"
    },

    initialize: function(options) {
    
        var ws = this;
       
        if (this._index === null){
            $.ajax({
                url: 'data/album1.json',
                dataType: 'json',
                data: {},
                success: function(data) {
				    ws._data = data;
                    ws._photos = new PhotoCollection(data);
                    ws._index = new IndexView({model: ws._photos}); 
                    Backbone.history.loadUrl();

                }
            });
            return this;
        }
        return this;
    },


    /**
	 * Handle rendering the initial view for the application
	 * @type function
	*/
    index: function() {
        this._index.render();
    },
	

	/**
	 * Handle rendering basic views of the subalbums. As subalbums are not typically
	 * traversed in the default initialization, here we create a new PhotoCollection 
	 * based on indices passed through the UI and an already cached data-set. We then
	 * create a new SubalbumvView instance and render the subalbums and set the current
	 * subphotos data-array to contain our subphotos.
	 * @type function
	 * @param {String} id An ID specific to a particular subalbum based on CIDs
	 */
	subindex:function(id){
		
	   var properindex = id.replace('c','');	
	   this._currentsub = properindex;
	   this._subphotos = cache.get('pc' + properindex) || cache.set('pc' + properindex, new PhotoCollection(this._data[properindex].subalbum));
	   this._subalbums = cache.get('sv' + properindex) || cache.set('sv' + properindex, new SubalbumView({model: this._subphotos}));
	   this._subalbums.render();

		
	},
	
	directphoto: function(id){

	},

	/**
	 * Handle both direct and indirect attempts to access images within subalbums. This method
	 * continues from where directphoto leaves off (if called) and checks to see if an existing
	 * subphotos object exists. If it doesn't, we generate a new PhotoCollection and finally create
	 * a new PhotoView to display the image that was being queried for. 
	 * @type function
	 * @param {String} num An ID specific to a particular image being accessed
	 * @param {Integer} id An ID specific to a particular subalbum being accessed
	 */
	  hashphoto: function(num, id){
	    this._currentsub = num;
	    
	    num = num.replace('c','');
	    
		if(this._subphotos == undefined){
		   this._subphotos = cache.get('pc' + num) || cache.set('pc' + num, new PhotoCollection(this._data[num].subalbum));
		 }	
	    this._subphotos.at(id)._view = new PhotoView({model: this._subphotos.at(id)});
	    this._subphotos.at(id)._view.render();
	    
	  }
});


gallery = new Gallery();
Backbone.history.start();

