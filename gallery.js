
var cache = new CacheProvider;


/**
 * Model of a Photo used to define the items that appear in a PhotoCollection
 * @type Backbone.Model
 */
var Photo = Backbone.Model.extend({});

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
 * Model for an Items contained in an Album
 * @type Backbone.Model
 */
var AlbumItem = Backbone.Model.extend({
    update: function(amount) {
    }
});

/**
 * Data collection of AlbumItem items
 * @type Backbone.Collection
 */
var Album = Backbone.Collection.extend({
    model: AlbumItem,
    getByPid: function(pid) {
        return this.detect(function(obj) { return (obj.get('photo').cid == pid); });
    },
});


/**
 * A view for displaying album items
 * @type Backbone.Collection
 */
var AlbumView = Backbone.View.extend({
    el: $('.album-info'),
    initialize: function() {
        this.model.bind('change', _.bind(this.render, this));
    },
    render: function() {
            var sum = this.model.reduce(function(m, n) { return 0; }, 0);
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
        $('.jstest').remove();
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
    
    /*bad hack to prevent internal keypress handling on sub view */
     $(document).unbind('keypress');
       
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


    events: {
        "keypress .item-detail" : "updateOnEnter",
        "click .uq"     : "update"
    },
    

    initialize: function(options) {
        this.album = options.album;
          
         /**
		 * Bind keypress hack to handle level-three navigation via keypress
		 */ 
	     $(document).bind('keypress', function(e){
	 	   (e.keyCode == 8) ? (window.history.go(-1)) : this.unbind('keypress');
	     });
       
    },
    
    update: function(e) {
        e.preventDefault();		
        var album_item = this.album.getByPid(this.model.cid);
        if (_.isUndefined(album_item)) {
            album_item = new AlbumItem({photo: this.model});
            this.album.add(album_item, {silent: true});
        }
    },

    updateOnEnter: function(e) {

        if (e.keyCode == 13) {
            return this.update(e);
        }
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
 * The controller that defines our main application 'workspace'. Here we handle
 * how routes should be interpreted, the basic initialization of the application
 * with data through an $.ajax call to fetch our JSON store and the creation of 
 * collections and views based on the models defined previously.
 * @type Backbone.Controller
 */
var Workspace = Backbone.Controller.extend({
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
        "imageid/:id/subalbum/": "directphoto",
        "imageid/:id/subalbum/:num": "hashphoto"
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
                    ws._album = new Album();
                    new AlbumView({model: ws._album});
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
	
	/**
	 * Bookmark fix: Handle direct attempts to access particular images within subalbums. When browsing
	 * through the application, we cache references to the subalbums being viewed and use
	 * this to update the window's location hash to correctly point at the subalbum an image
	 * is within (ie. this._currentsub). This is a hack used to ensure that when bookmarking,
	 * the final photoview is aware of the subalbum which it originated from. If this wasn't
	 * done, a photo could be traversed to, however you would not be able to bookmark and access
	 * it directly outside of the application.
	 * @type function
	 * @param {String} id An ID specific to a particular subalbum based on CIDs
	 */
	directphoto: function(id){
		if(this._currentsub !== null){
			window.location.hash +=  this._currentsub;
		}
	    
	},

	/**
	 * Handle both direct and indirect attempts to access images within subalbums. This method
	 * continues from where directphoto leaves off (if called) and checks to see if an existing
	 * subphotos object exists. If it doesn't, we generate a new PhotoCollection and finally create
	 * a new PhotoView to display the image that was being queried for. 
	 * @type function
	 * @param {String} id An ID specific to a particular image being accessed
	 * @param {num} id An ID specific to a particular subalbum being accessed
	 */
    hashphoto: function(id, num){
	
	    this._currentsub = num;
	    
		if(this._subphotos == undefined){
		   this._subphotos = cache.get('pc' + num) || cache.set('pc' + num, new PhotoCollection(this._data[num].subalbum));
		 }	
	    this._subphotos.at(id)._view = new PhotoView({model: this._subphotos.at(id), album: this._album});
	    this._subphotos.at(id)._view.render();
	    
	  }
});


workspace = new Workspace();
Backbone.history.start();

