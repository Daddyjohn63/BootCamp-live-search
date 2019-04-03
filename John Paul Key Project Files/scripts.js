  class Search {
    // 1. Describe and create/initiate the object. Create the properties which describes the Object.
    constructor() {
      //needs to run first as it has the ids and classes needed for other functions to run.
      this.addSearchHTML();
      //create property where the search results will be rendered.
      this.resultsDiv = document.getElementById("search-overlay__results");
      //creates the property for the element that will be clicked to trigger the search.
      this.openButton = document.getElementById("menu-item-269");
      //delete the commented out code below later.
      // this.openButton = document.getElementById("et_top_search");
      //the element/ icon that will trigger the close of the overlay. Fontawesome is used in the HTML. See also functions.php
      this.closeButton = document.getElementsByClassName(
        "search-overlay__close"
      )[0];
      //this is where the main body of the overlay is created.
      this.searchOverlay = document.getElementsByClassName("search-overlay")[0];
      //this is where the users search terms will be added. we will get the value of this to find and render
      //our search results.Also used to manage our requests to the server.
      this.searchField = document.getElementById("search-term");
      // gets the events so the event listeners get loaded to the page straight away.
      this.events();
      // creates a property so we can detect if the overlay is open or closed in our methods.
      this.isOverlayOpen = false;
      // creates a property so we can detect if the spinner is open or closed in our methods. Or else the spinner
      // will want to keep loading on each key stroke, which will make it look choppy.
      this.isSpinnerVisible = false;
      // to keep track of the search value.
      this.previousValue;
      //property used to track time , so that requests to the server are not every time someone hits a key.
      this.typingTime;
    }

    // 2. Event listeners.. connect the Properties with the Methods.
    // .bind(this) has to be used as without it 'this' will link to the element and not the objectproperty created in the
    // constructor function.
    events = function events() {
      this.openButton.addEventListener(
        "click",
        this.openOverlay.bind(this),
        false
      );
      this.closeButton.addEventListener(
        "click",
        this.closeOverlay.bind(this),
        false
      );
      //event listener so we can add keyboard shortcuts 's' and 'esc' for opening and closing the overlay.
      document.addEventListener("keyup", this.keyPressIt.bind(this), false);
      // this event targets the search field, so we can run an event listener 'keyup' which calls the function typingLogic.
      this.searchField.addEventListener(
        "keyup",
        this.typingLogic.bind(this),
        false
      );
    };

    //3. Methods (function...)
    // method to ensure we wait a reasonable amount of time before sending a request to the database AND ensure
    // keys such as arrow keys do not keep the spinner turning. Final backstroke should kill timer.
    // in this.typingTime we use the js setTimeout method which calls our function getResults. We bind it to 'this'
    // so that we are able to access the properties and methods of the getResults function.
    //
    typingLogic = function typingLogic() {
      if (this.searchField.value != this.previousValue) {
        clearTimeout(this.typingTime);
        if (this.searchField.value) {
          if (!this.isSpinnerVisible) {
            this.resultsDiv.innerHTML = '<div class="spinner-loader"></div>';
            this.isSpinnerVisible = true;
          }

          this.typingTime = setTimeout(this.getResults.bind(this), 750);
        } else {
          this.resultsDiv.innerHTML = "";
          this.isSpinnerVisible = false;
        }
      }
      this.previousValue = this.searchField.value;
    };
    //
    //use of => to keep reference to 'this'. Use of template literal backticks and ternary operators instead of 'if'
    //
    getResults() {
      let searchTerm = this.searchField.value;
      //structured so that I can add additional urls if I want. Will place results into combinedResults.
      // use Promise.all for asynchronous operation. combinedResults will have three arrays of objects
      let urls = [
        `${
          cookingschooldata.root_url
        }/wp-json/cooking/v1/search?term=${searchTerm}`
      ];
      let combinedResults = [];
      // use fetch
      let requests = urls.map(url =>
        fetch(url)
          .then(res => res.json())
          .catch(
            err =>
              (this.resultsDiv.innerHTML = `<p>unexpected error; please try again</p>`)
          )
      );

      Promise.all(requests).then(results => {
        combinedResults = results.flat();

        //console.log(combinedResults);
        //
        // .generalInfo.length used to determine if any results were returned.Use ternary operator to instruct what
        //to do.
        //teneray operator used to display authorName only when we have a 'post' or we will get undefined
        //for pages, events and chefs.

        this.resultsDiv.innerHTML = `
            <div class="row">
              <div class="one-third">
                <h2 class="search-overlay__section-title">General Information</h2>
          ${
            combinedResults[0].generalInfo.length
              ? '<ul class="link-list min-list">'
              : "<p>No general information matches that search.</p>"
          }
             ${combinedResults[0].generalInfo
               .map(
                 item =>
                   `<li><a href="${item.permalink}">${item.title}</a> ${
                     item.postType == "post" ? `by ${item.authorName}` : ""
                   }</li>`
               )
               .join("")}
              ${combinedResults[0].generalInfo.length ? "</ul>" : ""}  
              </div>
              <div class="one-third">
              <h2 class="search-overlay__section-title">Chefs</h2>
              ${
                combinedResults[0].chefs.length
                  ? '<ul class="link-list min-list">'
                  : `<p>No Chefs match that search. <a href="${
                      cookingschooldata.root_url
                    }/chefs">View our Chefs</a></p>`
              }
                ${combinedResults[0].chefs
                  .map(
                    item =>
                      `<li><img class="chef-card__image" src="${
                        item.image
                      }"><a href="${item.permalink}">${item.title}</a></li>`
                  )
                  .join("")}
                 ${combinedResults[0].chefs.length ? "</ul>" : ""}  
              </div>
              <div class="one-third">
              <h2 class="search-overlay__section-title">Events</h2>
              ${
                combinedResults[0].events.length
                  ? '<ul class="link-list min-list">'
                  : `<p>No Chefs match that search. <a href="${
                      cookingschooldata.root_url
                    }/events">View our events</a></p>`
              }
                ${combinedResults[0].events
                  .map(
                    item =>
                      `<li><img class="chef-card__image" src="${
                        item.image
                      }"><span class="event-summary__month">${item.month}</span>
                      <span class="event-summary__day">${
                        item.day
                      }</span><a href="${item.permalink}">${
                        item.title
                      }</a></li><p>${item.description} <a href="${
                        item.permalink
                      }" class="nu gray">Learn more</a></p>`
                  )
                  .join("")}
                 ${combinedResults[0].events.length ? "</ul>" : ""}  
              </div>
            </div>
          `;
        this.isSpinnerVisible = false;
      });
    }

    keyPressIt(e) {
      // S Key && document.querySelector('input textarea').activeElement
      //need to add a parameter (in this case have used 'e') to receive the information the browser will send
      //using the 'keyup' method. We can then access the property 'keyCode' that will be sent by the browser.
      // s key
      if (e.keyCode === 83 && !this.isOverlayOpen) {
        this.openOverlay();
        this.isOverlayOpen = true;
      }
      // esc Key
      if (e.keyCode === 27 && this.isOverlayOpen) {
        this.closeOverlay();
        this.isOverlayOpen = false;
      }
    }

    openOverlay() {
      this.searchOverlay.classList.add("search-overlay--active");
      // adds css property overflow:hidden
      document.body.classList.add("body-no-scroll");
      // clears search field on overlay open
      this.searchField.value = "";
      // clears search results on overlay open
      // this.resultsDiv.innerHTML = "";
      // waits for overlay to fade in before focusing cursur in input field.
      setTimeout(() => this.searchField.focus(), 500);
      this.isOverlayOpen = true;
    }

    closeOverlay = function closeOverlay() {
      this.searchOverlay.classList.remove("search-overlay--active");
      //ensure content is removed on close
      this.resultsDiv.innerHTML = "";
      this.isOverlayOpen = false;
    };

    addSearchHTML() {
      document.body.innerHTML += `
          <div class="search-overlay">
     
          <div class="search-overlay__top">
     
            <div class="container">
              <i class="fa fa-search search-overlay__icon" aria-hidden="true"></i>
              <input type="text" id="search-term" class="search-term" placeholder="What are you looking for?">
              <i class="fa fa-window-close search-overlay__close" aria-hidden="true"></i>
            </div>
     
          </div>
     
          <div class="container">
            <div id="search-overlay__results">
            </div>
          </div>
     
        </div>
        `;
    }
  }

  var bootSearch = new Search();
