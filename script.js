var app = angular.module('Search', []);

app.controller('searchResultController', ['$scope', '$http', function ($scope, $http) {
    let searchApp = this;

    searchApp.numberFound = 0;
    searchApp.query = '';
    searchApp.hasSearchedOnce = false;
    searchApp.selectedExplicit = 'All';

    searchApp.priceCheckboxes = {
        ' Under $5': { selected: false, min: Number.MIN_VALUE, max: 5, counter: 0 },
        ' $5 - $10': { selected: false, min: 5, max: 10, counter: 0 },
        ' $10 - $15': { selected: false, min: 10, max: 15, counter: 0 },
        ' $15 - $20': { selected: false, min: 15, max: 20, counter: 0 },
        ' Over $20': { selected: false, min: 20, max: Number.MAX_VALUE, counter: 0 },
    };

    searchApp.availableSorts = {
        'Lowest Price': 'collectionPrice',
        'Highest Price': '-collectionPrice',
        'Newest to Oldest': '-releaseDate',
        'Oldest to Newest': 'releaseDate',
        'Artist Name': 'artistName',
        'Collection Name': 'collectionName'
    };

    searchApp.explicitness = [
        'All',
        'Explicit',
        'Non-Explicit'
    ];

  searchApp.search = () => {
    searchApp.getArtistSongs();
  };

    searchApp.selectedSort = () => {
        searchApp.chosenSort = searchApp.availableSorts[searchApp.selectedSortFromMenu];
    };

    searchApp.noCheckboxesSelected = (checkBoxes) => {
        for (let checkbox in checkBoxes) {
            if (checkBoxes[checkbox].selected) {
                return false;
            }
        }
        return true;
    };

    searchApp.inPriceRange = (artist) => {
        for (let checkbox in searchApp.priceCheckboxes) {
            if (searchApp.priceCheckboxes[checkbox].selected &&
                artist.collectionPrice > searchApp.priceCheckboxes[checkbox].min &&
                artist.collectionPrice < searchApp.priceCheckboxes[checkbox].max) {
                return true;
            }
        }
        return false;
    };

    searchApp.byExplicit = (artist) => {
        if (searchApp.selectedExplicit === 'Explicit') {
            return artist.collectionExplicitness === 'explicit';
        }
        else if (searchApp.selectedExplicit === 'Non-Explicit') {
            return artist.collectionExplicitness === 'notExplicit';
        }
        return true;
    }

    searchApp.byPriceFilter = (artist) => {
        if (searchApp.noCheckboxesSelected(searchApp.priceCheckboxes)) {
            return true;
        }

        return searchApp.inPriceRange(artist);
    };

  searchApp.getFirstArtistName = (stringToSplitOn, artistName) => {
    return artistName.substring(0, artistName.indexOf(stringToSplitOn));
  };

  searchApp.collectionSongs = (collectionName, index) => {
    let collectionSongs = [];
    for(let i = 0; i < searchApp.allArtists.length; ++i) {
      if(searchApp.allArtists[i].collectionName === collectionName) {
        collectionSongs.push(searchApp.allArtists[i].trackName);
      }
    }
    searchApp.allArtists[index]['collectionSongs'] = collectionSongs.filter((item, pos) => {
      return collectionSongs.indexOf(item) == pos;
  });
  };

  searchApp.getArtistInfo = (artistName, index) => {
    searchApp.allArtists[index].loading = true;
    if(artistName.includes(' and ')) {
      artistName = searchApp.getFirstArtistName(' and ', artistName);
    }
    else if(artistName.includes(' & ')) {
      artistName = searchApp.getFirstArtistName(' & ', artistName);
    }
    else if(artistName.includes(' with ')) {
      artistName = searchApp.getFirstArtistName(' with ', artistName);
    }

    let url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${artistName}&format=json&callback=JSON_CALLBACK`;
    $http.jsonp(url).then((response) => {
      console.log(response.data);

      let description = "";
      if(response.data.query.search === undefined || response.data.query.search.length == 0) {
        description = "Sorry, there is no information for this artist!";
      }
      else {
        description = angular.copy(response.data.query.search[0].snippet.replace(/<\/?span[^>]*>/g,""));

        if(description) {
          if(description.length > 100) {
            description = searchApp.truncateName(description, 100);
          }
        }
        else {
          description = "Sorry, there is no information for this artist!";
        }
      }

      searchApp.allArtists[index]['artistDescription'] = description;
    }).catch(function() {
      searchApp.allArtists[index]['artistDescription'] = "Sorry, there is no information for this artist!";
    }).finally(function() {
      // called no matter success or failure
      searchApp.allArtists[index].loading = false;
    });
  };

  searchApp.anyGenresSelected = () => {
    for(let i in searchApp.allGenres) {
      if(searchApp.allGenres[i].selected) {
        return true;
      }
    }
    return false;
  };

  searchApp.filter = (genre) => {
    searchApp.allGenres[genre].selected = !searchApp.allGenres[genre].selected;
    searchApp.chosenGenre = (searchApp.anyGenresSelected()) ? genre : '';
  };

  searchApp.resetFilter = () => {
    for(let i in searchApp.allGenres) {
      searchApp.allGenres[i].selected = false;
    }
    searchApp.chosenGenre = '';
  };

    searchApp.getArtistSongs = () => {
    let url = `https://itunes.apple.com/search?term=${searchApp.query}&callback=JSON_CALLBACK`;
    $http.jsonp(url).then((response) => {
      console.log(response.data);
      let data = angular.copy(response.data);
      if(!data.resultCount) {
        alert("No artist were found with the keyword "+searchApp.query);
      }
      else {
        searchApp.hasSearchedOnce = true;
        searchApp.chosenGenre = '';
          searchApp.chosenSort = '';
          searchApp.selectedSortFromMenu = '';
          searchApp.resetCheckboxes(searchApp.priceCheckboxes);
          searchApp.resetCheckboxes(searchApp.artistNames);
          searchApp.selectedExplicit = 'All';
        searchApp.numberFound = data.resultCount;
        searchApp.allArtists = searchApp.modifyArtistInfo(data.results, data.resultCount);
        searchApp.artistNames= searchApp.getAllByArtistName(data.results, data.resultCount);
        searchApp.allGenres = searchApp.getAllByGenre(data.results, data.resultCount);
        searchApp.incrementCounters(data.results, data.resultCount);
      }
    });
  };

  searchApp.incrementCounters = (results, length) => {
    for (let i = 0; i < length; i++) {
      searchApp.incrementPriceCheckboxCounters(results[i]);
      searchApp.incrementArtistNameCounters(results[i]);
    };
  };

    searchApp.resetCheckboxes = (checkBoxes) => {
        for (let i in checkBoxes) {
          checkBoxes[i].selected = false;
          checkBoxes[i].counter = 0;
        }
    };

  searchApp.getAllByGenre = (results, length) => {
    let allGenres = {};
    for (let i = 0; i < length; i++) { allGenres[results[i]['primaryGenreName']] = {selected: false};  }
    return allGenres;
  };

  searchApp.getAllByArtistName = (results, length) => {
    let allArtistNames = {};
    for (let i = 0; i < length; i++) { allArtistNames[results[i]['artistName']] = {selected: false, counter: 0};  }
    return allArtistNames
  };

  searchApp.filterArtists = (artist) => {
    for (let checkbox in searchApp.artistNames) {
        if (searchApp.artistNames[checkbox].selected && checkbox === artist.artistName) {
            return true;
        }
    }
    return false;
  };

  searchApp.byArtistFilter = (artist) => {
    if (searchApp.noCheckboxesSelected(searchApp.artistNames)) {
      return true;
  }

  return searchApp.filterArtists(artist);
  };

  searchApp.truncateName = (name, max) => {
    return name.substring(0,max) + "...";
  };

  searchApp.incrementPriceCheckboxCounters = (artist) => {
    for (checkbox in searchApp.priceCheckboxes) {
      if (artist.collectionPrice > searchApp.priceCheckboxes[checkbox].min &&
          artist.collectionPrice < searchApp.priceCheckboxes[checkbox].max) {
          searchApp.priceCheckboxes[checkbox].counter++;
      }
  }
  };

  searchApp.incrementArtistNameCounters = (artist) => {
    for (checkbox in searchApp.artistNames) {
      if (artist.artistName === checkbox) {
          searchApp.artistNames[checkbox].counter++;
      }
  }
  };

  searchApp.modifyArtistInfo = (results, length) => {
    for (let i = 0; i < length; i++) {
      if(!('artworkUrl100' in results[i])) {
        results[i].artworkUrl100 = "noimage.jpg";
      }
      if('artistName' in results[i] && results[i].artistName.length > 25) {
        results[i].artistName = searchApp.truncateName(results[i].artistName, 25);
      }
      if('collectionName' in results[i] && results[i].collectionName.length > 25) {
        results[i].collectionName = searchApp.truncateName(results[i].collectionName, 25);
      }
      results[i].artworkUrl100 = results[i].artworkUrl100.replace("100x100bb", "200x200bb");
      results[i]['loading'] = false;
      results[i]['index'] = i;
  }
    return results;
  };
}]);
