var Photo = Backbone.Model.extend({});

var PhotoCollection = Backbone.Collection.extend({
    model: Photo,
    comparator: function(item) {
        return item.get('title');
    }
});

var AlbumItem = Backbone.Model.extend({

    initialize: function(){
       
        this.set({
            subid : 'sub_' + this.cid
         })
    },
    
    update: function(amount) {
        //this.set({'quantity': this.get('quantity') + amount});
    }
});

//new
var SubalbumItem = Backbone.Model.extend({
    update: function(amount) {
        //this.set({'quantity': this.get('quantity') + amount});
    }
});


var Album = Backbone.Collection.extend({
    model: AlbumItem,
    getByPid: function(pid) {
        return this.detect(function(obj) { return (obj.get('photo').cid == pid); });
    },
});


//this can be removed...
var SubalbumView = Backbone.View.extend({
    el: $('.album-info'),

    initialize: function() {
        this.model.bind('change', _.bind(this.render, this));
        
        
    },

    render: function() {
    
    
	/*
        var sum = this.model.reduce(function(m, n) { return m + n.get('quantity'); }, 0);
        this.el
            .find('.album-items').text(sum).end()
            .animate({paddingTop: '30px'})
            .animate({paddingTop: '10px'});
			*/
    }
});

//this can be removed...
var AlbumView = Backbone.View.extend({
    el: $('.album-info'),

    initialize: function() {
        this.model.bind('change', _.bind(this.render, this));
    },

    render: function() {
    
    
	/*
        var sum = this.model.reduce(function(m, n) { return m + n.get('quantity'); }, 0);
        this.el
            .find('.album-items').text(sum).end()
            .animate({paddingTop: '30px'})
            .animate({paddingTop: '10px'});
			*/
    }
});


var PhotoView = Backbone.View.extend({
    el: $('#main'),
    itemTemplate: $("#itemTmpl").template(),


    events: {
        "keypress .uqf" : "updateOnEnter",
        "click .uq"     : "update",
    },

    initialize: function(options) {
        this.album = options.album;
    },

    update: function(e) {
        e.preventDefault();		
        var album_item = this.album.getByPid(this.model.cid);
        if (_.isUndefined(album_item)) {
            album_item = new AlbumItem({photo: this.model, quantity: 0});
            this.album.add(album_item, {silent: true});
        }
        album_item.update(parseInt($('.uqf').val()));
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


var IndexView = Backbone.View.extend({
    el: $('#main'),
    indexTemplate: $("#indexTmpl").template(),

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

var SubalbumView = Backbone.View.extend({
    el: $('#main'),
    indexTemplate: $("#subindexTmpl").template(),

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



//this is a fake version of photoview which we're trying to hack
//to view subalbums instead. .subalbum needs to be the updated
//data source.
var SubindexView = Backbone.View.extend({
    el: $('#main'),
    //itemTemplate: $("#itemTmpl").template(),
	itemTemplate: $("#subindexTmpl").template(),


    events: {
        "keypress .uqf" : "updateOnEnter",
        "click .uq"     : "update",
    },

    initialize: function(options) {
        this.album = options.album;
    },

    update: function(e) {
        e.preventDefault();		
        var album_item = this.album.getByPid(this.model.cid);
		
        if (_.isUndefined(album_item)) {
            album_item = new AlbumItem({photo: this.model, quantity: 0});
            this.album.add(album_item, {silent: true});
        }
        //album_item.update(parseInt($('.uqf').val()));
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


/*
Backbone.Controller = function(options){
  options || (options = {});
  if(options.routes) this.routes = options.routes;
  this._bindRoutes();
  this.initialize(options);
  
  alert(options);

};
*/


var Workspace = Backbone.Controller.extend({
    _index: null,
    _photos: null,
    _album :null,
	_subalbums:null,
	_subphotos:null,
	_data:null,
	_photosview:null,

    routes: {
        "": "index",
        "subalbum/:id": "subindex",
        "subalbum/:id/pho/:num": "photo"
    },

    initialize: function(options) {

	
        var ws = this;
        var ic = 0;
        if (this._index === null) {
            $.ajax({
                url: 'data/album1.json',
                dataType: 'json',
                data: {},
                success: function(data) {
				    ////
				    ws._data = data;
					///////
                    ws._album = new Album();
                    new AlbumView({model: ws._album});
					
                    ws._photos = new PhotoCollection(ws._data);

                    
                    ws._index = new IndexView({model: ws._photos}); 
                    
                    Backbone.history.loadUrl();
                }
            });
            return this;
        }
        return this;
    },

    index: function() {
        this._index.render();
    },
	
	subindex:function(id){
		
		
		/*
		 a lot of improvements need to be made here wrt caching
		 of variables and collections across all functions.
		
		*/
		
		var properindex = id.replace('c','');	
		
		//if(this._subphotos == undefined)
		{	
		this._subphotos = new PhotoCollection(this._data[properindex].subalbum);
		}	
		
		this._subalbums = new SubalbumView({model: this._subphotos});
		this._subalbums.render();
		
		
	},

    photo: function(id, num){
	
	
	//alert('show me subalbum ' + id  +' and photo number ' + num + ' in there ');
	
	
	 var properindex = id.replace('c','');
	  var cid = id;  //reads any first level thing fine..
	  
	  	  this._subphotos.getByCid(cid)._view = new PhotoView({model: this._subphotos.getByCid(cid), album: this._album});
      this._subphotos.getByCid(cid)._view.render();
      
	  
	  /*
	  this._photos.getByCid(cid)._view = new PhotoView({model: this._photos.getByCid(cid), album: this._album});
      this._photos.getByCid(cid)._view.render();
      */
      
 
      
	/*
	  prolly need to a) get the second ID ie ID of the subalbum, then need to
	  append to hash and load as per subindex rather than indiv off of the photos
	  tree.
	  
	  so...subid and actual imageid...
	  
	  NOT the auto id...
	  
	  
	*/
	
	

	
	/*
	    var subalbumid = 0;
        var imageid    = 1;		
		var subphotos = new PhotoCollection(this._data[subalbumid].subalbum);
		this._subalbums = new SubalbumView({model: subphotos});
		this._subalbums.render();
		
		*/
		


		
		/*
		
	 var properindex = id.replace('c','');
	  var cid = 'c1';
	  this._photos.getByCid(cid)._view = new PhotoView({model: this._photos.getByCid(cid), album: this._album});
      this._photos.getByCid(cid)._view.render();
      */
		
		/*
		var cid = 'c' + imageid;
		
	  subphotos.getByCid(cid)._view = new PhotoView({model: subphotos.getByCid(cid), album: this._album});
      subphotos.getByCid(cid)._view.render();
	  */

	/*
	  var properindex = id.replace('c','');
	  var cid = 'c1';
	  this._photos.getByCid(cid)._view = new PhotoView({model: this._photos.getByCid(cid), album: this._album});
      this._photos.getByCid(cid)._view.render();
	  */
                               
/*
        if (_.isUndefined(this._photos.getByCid(id)._view)) 
		{
            this._photos.getByCid(id)._view = new PhotoView({model: this._photos.getByCid(id), album: this._album});
        }
		
        this._photos.getByCid(id)._view.render();
		*/
    }
});

workspace = new Workspace();
Backbone.history.start();
