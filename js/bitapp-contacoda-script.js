/* BitApp Contacoda JS is licensed under the 3-Clause BSD License. Full text of license: https://github.com/openbitapp/bitapp-contacoda/LICENSE.txt */
mapboxgl.accessToken = 'pk.eyJ1IjoiYml0YXBwIiwiYSI6ImNrYTZza2c1azBhYWEyeG8zZHgydTNpdzgifQ.Y0XcExbAY8TxUu2rRVIueQ';
var map = new mapboxgl.Map({
  container: 'map',
  //style: 'mapbox://styles/mapbox/streets-v11',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [11.343, 44.496],
  zoom: 13
});

// carico i dati
$.getJSON('geojson/domicilio.geojson').done(function (data) {
  // crea la splide
  var splide = new Splide('.splide', {
    type: 'loop',
    heightRatio: '0.8',
    cover: true,
    breakpoints: {
      640: {
        height: '6rem',
      }
    }
  }).mount();
  splide.on('moved', function (num) {
  });


  map.on('load', function () {
    map.loadImage(
      'assets/map/contacoda_marker_empty@2x.png',
      function (error, image) {
        if (error) throw error;
        map.addImage('shop', image);
        map.addSource('points', {
          "type": "geojson",
          "data": data
        });
        map.addLayer({
          'id': 'points',
          'type': 'circle',
          'source': 'points',
          'paint': {
            // make circles larger as the user zooms from z12 to z22
            'circle-radius': {
              'base': 5,
              'stops': [
                [12, 5],
                [22, 180]
              ]
            },
            // color circles by ethnicity, using a match expression
            // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
            'circle-color': '#7D14A6'
          }

        });


      });
    buildLocationList(data);
  });


  map.addControl(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      localGeocoder: forwardGeocoder,
      localGeocoderOnly: true,
      zoom: 14,
      placeholder: 'Cerca il nome di un negozio',
      marker: {
        'color': '#FF3699'
      },
      mapboxgl: mapboxgl
    })
  );

  map.on('click', 'points', function (e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var properties = e.features[0].properties;

    $('.shop-name-container').empty().append('<h4 class="shop-name">' + properties.Azienda + '</h4>');
    $('.shop-name-container').append('<span class="shop-type">' + properties.Tipologia + '</span>');

    $('.slots').empty();

    for (var i = 8; i < 19; i++) {
      $('.slots').append('<div class="slot"><p>' + i + ':30 ' + (i + 1) + ':00</p><p class="info-slot">n° posti rimanenti</p></div>');
    }
    //createPopUp(e.features[0]);
  });

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', 'points', function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'points', function () {
    map.getCanvas().style.cursor = '';
  });





  function forwardGeocoder(query) {
    console.log(query)
    var matchingFeatures = [];

    for (var i = 0; i < data.features.length; i++) {
      var feature = data.features[i];
      console.log(feature);
      // handle queries with different capitalization than the source data by calling toLowerCase()
      if (feature.properties.Azienda &&
        feature.properties.Azienda
          .toLowerCase()
          .search(query.toLowerCase()) !== -1
      ) {
        feature['place_name'] = feature.properties.Azienda;
        feature['center'] = feature.geometry.coordinates;
        feature['address'] = feature.properties.Indirizzo;
        matchingFeatures.push(feature);
      }
    }
    return matchingFeatures;
  }


  /**
     * Add a listing for each store to the sidebar.
    **/
  function buildLocationList(data) {
    data.features.forEach(function (feature, i) {
      /**
       * Create a shortcut for `store.properties`,
       * which will be used several times below.
      **/
      var prop = feature.properties;
      if (!prop.name) {
        return;
      }

      /* Add a new listing section to the sidebar. */
      var listings = document.getElementById('listings');
      var listing = listings.appendChild(document.createElement('div'));
      /* Assign a unique `id` to the listing. */
      listing.id = "listing-" + feature.id;
      /* Assign the `item` class to each listing for styling. */
      listing.className = 'item';

      /* Add the link to the individual listing created above. */
      var link = listing.appendChild(document.createElement('a'));
      link.href = '#';
      link.className = 'title';
      link.id = "link-" + feature.id;
      link.innerHTML = prop.name;

      /* Add details to the individual listing. */
      var details = listing.appendChild(document.createElement('div'));
      details.innerHTML = prop.shop;
      if (prop.phone) {
        details.innerHTML += ' · ' + prop.phoneFormatted;
      }

      /**
       * Listen to the element and when it is clicked, do four things:
       * 1. Update the `currentFeature` to the store associated with the clicked link
       * 2. Fly to the point
       * 3. Close all other popups and display popup for clicked store
       * 4. Highlight listing in sidebar (and remove highlight for all other listings)
      **/
      link.addEventListener('click', function (e) {
        for (var i = 0; i < data.features.length; i++) {
          if (this.id === "link-" + data.features[i].id) {
            var clickedListing = data.features[i];
            flyToStore(clickedListing);
            //createPopUp(clickedListing);
          }
        }
        var activeItem = document.getElementsByClassName('active');
        if (activeItem[0]) {
          activeItem[0].classList.remove('active');
        }
        this.parentNode.classList.add('active');
      });
    });
  }

  /**
   * Use Mapbox GL JS's `flyTo` to move the camera smoothly
   * a given center point.
  **/
  function flyToStore(currentFeature) {
    map.flyTo({
      center: currentFeature.geometry.coordinates,
      zoom: 15
    });
  }

  /**
   * Create a Mapbox GL JS `Popup`.
  **/
  function createPopUp(currentFeature) {
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) popUps[0].remove();
    var popup = new mapboxgl.Popup()
      .setLngLat(currentFeature.geometry.coordinates)
      .setHTML('<h4>' + currentFeature.properties.name + '</h4>' +
        '<h5>' + currentFeature.properties.shop + '</h5>' +
        '<div class="slots">' +
        '<div class="slot"><p>8:30 9:00</p><p class="info-slot">n° posti rimanenti</p></div>' +
        '<div class="slot"><p>9:00 9:30</p><p class="info-slot">n° posti rimanenti</p></div>' +
        '<div class="slot"><p>9:30 10:00</p><p class="info-slot">n° posti rimanenti</p></div>' +
        '<div class="slot"><p>10:00 10:30</p><p class="info-slot">n° posti rimanenti</p></div>' +
        '<div class="slot"><p>10:30 11:00</p><p class="info-slot">n° posti rimanenti</p></div>' +
        '<div class="slot"><p>11:30 12:00</p><p class="info-slot">n° posti rimanenti</p></div>' +
        '<div class="slot"><p>12:30 13:00</p><p class="info-slot">n° posti rimanenti</p></div>' +
        '</div>' +
        '<a class="btn btn-md btn-success display-4" href="#">PRENOTA</a>'


      )
      .addTo(map);
  }

});



