var Photo = Backbone.Model.extend({});

var PhotoCollection = Backbone.Collection.extend({
    model: Photo,
    comparator: function(item) {
        return item.get('pid');
    }
});

var AlbumItem = Backbone.Model.extend({
    update: function(amount) {
    }
});


var Album = Backbone.Collection.extend({
    model: AlbumItem,
    getByPid: function(pid) {
        return this.detect(function(obj) { return (obj.get('photo').cid == pid); });
    },
});



var AlbumView = Backbone.View.extend({
    el: $('.album-info'),
    initialize: function() {
        this.model.bind('change', _.bind(this.render, this));
    },
    render: function() {
    
            var sum = this.model.reduce(function(m, n) { return 0; }, 0);
    }
});


var PhotoView = Backbone.View.extend({
    el: $('#main'),
    itemTemplate: $("#itemTmpl").template(),


    events: {
        "keypress .item-detail" : "updateOnEnter",
        "click .uq"     : "update"
    },
    

    initialize: function(options) {
        this.album = options.album;
        
        /*hack to fix the back-button on photo view*/
        $(document).bind('keypress', function(e) {
           if(e.keyCode == 8){
               window.history.go(-1);
           }
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

    index: function() {
        this._index.render();

    },
	
	subindex:function(id){
		
		
	  	var properindex = id.replace('c','');	
	  	this._currentsub = properindex;
		this._subphotos = new PhotoCollection(this._data[properindex].subalbum);
		this._subalbums = new SubalbumView({model: this._subphotos});
		this._subalbums.render();
		
	},
	

	directphoto: function(id){
		if(this._currentsub !== null){
			window.location.hash +=  this._currentsub;
		}
	    
	},


    hashphoto: function(id, num){
	
	     this._currentsub = num;
		 
		 if(this._subphotos == undefined){
		 	this._subphotos = new PhotoCollection(this._data[this._currentsub].subalbum);
		 }
		 
	     this._subphotos.at(id)._view = new PhotoView({model: this._subphotos.at(id), album: this._album});
	     this._subphotos.at(id)._view.render();
  
	    
	  }
});


workspace = new Workspace();
Backbone.history.start();

