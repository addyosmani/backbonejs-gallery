<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

        <title>Multi-Level Backbone Image Gallery</title>
        <link rel="stylesheet" href="gallery.css" type="text/css" media="screen" charset="utf-8" />
        <link rel="stylesheet" href="shadows.css" type="text/css" media="screen" charset="utf-8" />
		<link rel="stylesheet" href="buttons.css" type="text/css" media="screen" charset="utf-8" />



                
                <script id="indexTmpl" type="text/x-jquery-tmpl">
                <div class="item drop-shadow round">
                 <div class="item-image">
                     <a href="#subalbum/${cid}"><img src="${attributes.image}" alt="${attributes.title}" /></a>
                 </div>
                 <div class="item-artist">${attributes.artist}</div>
                    <div class="item-title">${attributes.title}</div>
                    <div class="item-years">${attributes.years}</div>
                </div>
                </script>
				
			
				<script id="subindexTmpl" type="text/x-jquery-tmpl">
                <div class="item  drop-shadow round">
                 <div class="item-image subalbum">
                     <a href="#subalbum/${subalbum}/${attributes.pid}"><img src="${attributes.image}" alt="${attributes.title}" alt="No images in this folder"/></a> 
                 </div>
                 <div class="item-artist">${attributes.artist}</div>
                    <div class="item-title">${attributes.title}</div>
                    <div class="item-price">$${attributes.price}</div>
                </div>
	
                </script>
				
     
                <script id="itemTmpl" type="text/x-jquery-tmpl">
                <div class="item-detail">
                  <div class="item-image drop-shadow round"><img src="${attributes.large_image}" alt="${attributes.title}" /></div>
                  <div class="item-info">
                    <div class="item-artist">${attributes.artist}</div>
                    <div class="item-title">${attributes.title}</div>
                    <div class="item-price">$${attributes.price}</div>
					<br />
                    <div class="item-link"><a href="${attributes.url}" class="button">Buy this item</a></div>
                    <div class="back-link"><a href="#" class="button">&laquo; Back to Albums</a></div>
                  </div>
                </div>
                </script>

    </head>
    <body>
        <div id="container">
            <div id="header">
                <h1>
                    <a href="index.php">Multi-Level Backbone Gallery</a>
                </h1>
                <h3>Created by Addy Osmani for 'Building Single-page Apps With jQuery's Best Friends'</h3>
            </div>

            <div id="main">
                 <div class="jstest">This application is running with JavaScript turned off.</div>
            </div>
        </div>
        <script src="LAB.min.js" type="text/javascript"></script>

        
<?


//PHP fallback to enable graceful degredation


//feel free to substitute with a more secure read-in method
$json = file_get_contents("data/album1.json");
$json_a=json_decode($json,true);
$folderType = $_GET['view'];
$index = $_GET['ind'];
$subal = $_GET['subalbum'];
$subalbums = array();
$i =0; $j =0;
error_reporting(0);

//expose convenient access to subalbums
foreach ($json_a as $p => $k){
    foreach($k["subalbum"] as $sub){ 
		 $subalbums[$i][$j] = $sub;
         $j++;
	}
	$i++;
} 

//handle 'view' switching
switch($folderType){
	case "subalbum":
		echo "<ul class='gallery'>";
		 foreach($subalbums[$index] as $sub){
		  echo "<li class='item drop-shadow round'><a href='"  . $sub['large_image'] . "'><img src='" . $sub['image'] . "'></img>" .  $sub['title']  . "</a> " . $sub['artist'] ." </li>";
	 
		  } 
		echo "</ul>";	    
	break;
	
	default:
	    $ind = 0;
		echo "<ul class='gallery'>";
		foreach($json_a as $p => $k){
		   echo "<li class='item drop-shadow round'><a href='index.php?view=subalbum&ind=$ind'><img src='" . $k['image'] . "'></img>" .  $k['title']  . "</a> " . $k['years'] ." </li>";
		   $ind++;
		}
		echo "</ul>";
	break;
}


?>
        <script type="text/javascript">
		   $LAB
		   .script("jquery-1.4.4.min.js").wait()
		   .script("jquery.tmpl.min.js")
		   .script("underscore-min.js")
		   .script("backbone-min.js")
		   .script("cacheprovider.js").wait()
		   .script("gallery.js");      
        </script>
    </body>
</html>
