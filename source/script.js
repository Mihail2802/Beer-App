let appDiv = document.getElementById("render-beers-div");
let row = document.getElementsByClassName("row")[0];
let randomBeerBtn = document.getElementById("getRandomBeer");
let firstPage = document.getElementById("firstPage");
let homeBtn = document.getElementById("startingPage");
let beerPhotoDiv = document.getElementById("photoDiv");
let headerContainer = document.getElementById("headerContainer");
let itemsPerPage = document.getElementById("itemsPerPage");
let footerButtons = document.getElementById("footer");
let sorter = document.getElementById("namesorter");
let nextBtn = document.getElementById("nextBtn");
let previousBtn = document.getElementById("previousBtn");
let loadBeerGrid = document.getElementById("loadBeerGrid");
let pageBoxes = document.getElementById("pageBoxes");

let currentPage = 1;
let showNumberOfItems = 20;
let pageAPI = 1;
let numberOfBoxesToShow = 4;
let itemsPerPageAPI = 80;
let itemsList = [];
let wasLimitReached = false;

window.onload = () => {
  togglePagination(false)
  setToDefault();
}
loadBeerGrid.addEventListener("click", () => {
  headerContainer.remove();
  itemsList = []
  loadBeers()
});

headerContainer.addEventListener("click", () => {
  headerContainer.remove();
  itemsList = []
  loadBeers()
});

function setToDefault(){
  changePage(1)
}

async function loadBeers(){
  console.log("load beers called");
  console.log("previous length:");
  console.log(itemsList.length);
  let apiUrl = `https://api.punkapi.com/v2/beers?page=${pageAPI}&per_page=${itemsPerPageAPI}`;
  console.log("calling api with url:");
  console.log(apiUrl);
  await fetch(apiUrl)
  .then((response) => response.json())
  .then((beers) => {
    console.log("api returned:");
    console.log(beers.length);

    if(beers.length === 0){
      // wasLimitReached = true;
      return;
    }
    if(itemsList.length === 0){
      itemsList = itemsList.concat(beers);
      changePage(currentPage)
      togglePagination(true)
    }else{
      itemsList = itemsList.concat(beers);
    }
  });

  console.log("after api call:")
  console.log(itemsList.length);
}
function renderPageBoxes() {
  // renders +2 extra pages
  // needs to prevent loading pages that arent existing (page 18-19)


  pageBoxes.innerHTML = "";
  let numberOfPages = Math.ceil(itemsList.length / showNumberOfItems);
  console.log("---------");
  console.log(wasLimitReached);
  console.log("---------");

  if(numberOfPages > numberOfBoxesToShow){
    var counter = currentPage-1
    for(let i=counter; i <= currentPage+2; i++){
      pageBoxes.innerHTML += `<a href="#" class="page-link btn ${currentPage == i ? "activePage":""}" onclick="changePage(${i})">${i}</a>`;
    }

    return;
  }

  for(let i=1; i <= numberOfPages; i++){
    pageBoxes.innerHTML += `<a href="#" class="page-link btn ${currentPage == i ? "activePage":""}" onclick="changePage(${i})">${i}</a>`;
  }
}

async function changePage(page){
  currentPage = page
  let starIndex = showNumberOfItems * (page - 1);
  let endIndex = showNumberOfItems * page;
  await checkIfLastPage(endIndex)
  let list = itemsList.slice(starIndex, endIndex);
  if(list.length == 0)
    return;
  //TODO: Add additional check
  renderPageBoxes()
  renderAllProducts(list)
}

async function checkIfLastPage(index){
  if(index >= itemsList.length && !wasLimitReached){
    await loadBeers()
    pageAPI++
  }
}

function togglePagination(flag){
  if(!flag){
    document.getElementById("pagination").style.display = "none"
    return;  
  }
  document.getElementById("pagination").style.display = "block"
}

function renderAllProducts(beers) {
  if (currentPage === 1) {
    previousBtn.classList.add("disabled");
  } else {
    previousBtn.classList.remove("disabled");
  }

  //TODO: Change this.
  if (wasLimitReached && (currentPage == Math.ceil(itemsList.length / showNumberOfItems))) {
    nextBtn.classList.add("disabled");
  } else {
    nextBtn.classList.remove("disabled");
  }

  row.innerHTML = "";
  for (const beer of beers) {
    row.innerHTML += `
    <div class = "col">
    <div class="card" style="width: 18rem;">
        <img src="${beer.image_url}" class="card-img-top img-thumbnail rendered-beers-picture" alt="...">
         <div class="card-body">
             <h5 class="card-title">${beer.name}</h5>
             <p class="card-text text-truncate beer-desrciption">${beer.description}</p>
             <a href="#" class="btn btn-primary">Read more</a>
        </div>
    </div>
    </div>
        `;
  }
}

randomBeerBtn.addEventListener("click", () => {
  togglePagination(false);
  footerButtons.remove();
  headerContainer.remove();
  row.innerHTML = "";
  fetch(`https://api.punkapi.com/v2/beers/random`)
    .then((response) => response.json())
    .then((beers) => {
      row.innerHTML += `
      <div class = "col">
      <div class="card" style="width: 18rem;">
          <img src="${beers[0].image_url}" class="card-img-top img-thumbnail rendered-beers-picture" alt="...">
           <div class="card-body">
               <h5 class="card-title">${beers[0].name}</h5>
               <p class="card-text text-truncate beer-desrciption">${beers[0].description}</p>
               <a href="#" class="btn btn-primary">Read more</a>
          </div>
      </div>
      </div>
          `;
    });
});

homeBtn.addEventListener("click", () => {
  location.reload();
});

nextBtn.addEventListener("click", () => {
  changePage(++currentPage)
});

previousBtn.addEventListener("click", () => {
  changePage(--currentPage)
});

document.querySelectorAll(".dropdown-item").forEach((element) =>
  element.addEventListener("click", () => {
    fetch(`https://api.punkapi.com/v2/beers?page=${page}&per_page=20`)
      .then((response) => response.json())
      .then((beers) => {
        console.log(beers);
        beers.sort(function (a, b) {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
        renderAllProducts(beers);
      });
  })
);

itemsPerPage.addEventListener('change', () => {
  showNumberOfItems = itemsPerPage.value;
  console.log(showNumberOfItems);
  renderPageBoxes()
  setToDefault()
})