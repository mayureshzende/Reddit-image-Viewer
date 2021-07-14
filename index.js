const nextButton = document.getElementById("next");
const backButton = document.getElementById("back");
const subSelect = document.getElementById("sub");
const img = document.getElementById("img");
const loading = document.getElementById("loading");

const LOADING_ERROR_URL =
  "https://jhusain.github.io/reddit-image-viewer/error.png";

const Observable = Rx.Observable;

// function which returns an array of image URLs for a given reddit sub
// getSubImages("pics") ->
// [
//   "https://upload.wikimedia.org/wikipedia/commons/3/36/Hopetoun_falls.jpg",
//   "https://upload.wikimedia.org/wikipedia/commons/3/38/4-Nature-Wallpapers-2014-1_ukaavUI.jpg",
//   ...
// ]

function getSubImages(sub) {
  const cachedImages = localStorage.getItem(sub);

  if (cachedImages) {
    return Observable.of(JSON.parse(cachedImages));
  } else {
    const url = `https://www.reddit.com/r/${sub}/.json?limit=200&show=all`;

    // defer ensure new Observable (and therefore) promise gets created
    // for each subscription. This ensures functions like retry will
    // issue additional requests.

    return Observable.defer(() =>
      Observable.fromPromise(
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            const images = data.data.children.map((image) => image.data.url);
            localStorage.setItem(sub, JSON.stringify(images));
            return images;
          })
      )
    );
  }
}

// ---------------------- INSERT CODE  HERE ---------------------------
// This "images" Observable is a dummy. Replace it with a stream of each
// image in the current sub which is navigated by the user.

const subs = Observable.concat(
  Observable.of(subSelect.value),
  Observable.fromEvent(subSelect, "change").map((ev) => ev.target.value)
);

const nexts = Observable.fromEvent(nextButton, "click");
const backs = Observable.fromEvent(backButton, "click");

const offsets = Observable.merge(
  nexts.map(() => 1),
  backs.map(() => -1)
);

const indices = Observable.concat(
  Observable.of(0),
  offsets.scan((acc, curr) => acc + curr, 0)
);

/* function preload(src) {
  const image = new Image(src);

  const success = Observable.fromEvent(img, "load").map(() => src);

  const failure = Observable.fromEvent(img, "error").map(
    () => LOADING_ERROR_URL
  );

  return Observable.merge((success, failure));
} */

// This "actions" Observable is a placeholder. Replace it with an
// observable that notfies whenever a user performs an action,
// like changing the sub or navigating the images
// const actions = Observable.empty();

// instead of using the concat we use the merge to do the action when some event happens
const actions = Observable.merge(subs, nexts, backs);

actions.subscribe(() => (loading.style.display = "block"));

const images = subs
  .map((sub) =>
    getSubImages(sub)
      .map((images) =>
        indices
          .filter((index) => index >= 0 && index < images.length)
          .map((index) => images[index])
      )
      .switch()
      .map(preload)
      .switch()
  )
  .switch();

// images.subscribe((images) => console.log(images));
// const value = subSelect.value;
// const images = Observable.of(
//   "https://upload.wikimedia.org/wikipedia/commons/3/36/Hopetoun_falls.jpg"
// );

images.subscribe({
  next(url) {
    // hide the loading image
    loading.style.display = "none";

    // set Image source to URL
    img.src = url;
  },
  error(e) {
    // alert(
    //   "I'm having trouble loading the images for that sub. Please wait a while, reload, and then try again later."
    // );
    console.log(e);
  },
});

function preload(src) {
  return Observable.defer(() => {
    const img = new Image(src);
    const success = Observable.fromEvent(img, "load").map(() => src);

    const failure = Observable.fromEvent(img, "error").map(
      () => LOADING_ERROR_URL
    );

    img.src = src;

    return Observable.merge(success, failure);
  });
}

/*
---------------
creating our own observables

class Observable{
  constructor(subscribe){
    this._subscribe = subscribe;
  }

  subscribe(observer){
      return this._subscribe(observer);
  }

  static timeOut(time){
    return new Observable(function subscribe(observer){
      const handle = setTimeout(function() {
        observer.next();
        observer.complete();
      } ,time);

      return {
              unsubscribe(){
                clearTimeout(handle);
              }
      }
    });
  }

  static fromEvent(dom, eventName){
    return new Observable(function subscribe(observer){
      const handler = ev => {
        observer.next(ev);
      }
      
       dom.addEventListener( eventName , handler );


      return {
        unsubscribe(){
          dom.removeEventListner(eventName, handler );
        }
      }
    })
  }

  map(projection){
    const self = this ; 
    return new Observable(function subscribe(observer){
     const subscription =  self.subscribe({
        next(ev){
          observer.next(projection(ev));
        },
        error(err){
          observer.error(err);
        },
        complete(){
          observer.complete();
        }
      });

      return subscription;
    })
  }

  filter(predicate){
    const self = this ; 
    return new Observable(function subscribe(observer){
     const subscription = self.subscribe({
       next(ev){
         if(predicate(ev))
         observer.next(ev);
       },
       error(err){
         observer.error(err);
       },
       complete(){
         observer.complete();
       }
     })
     return subscription;
    })
  }
}


const button = document.getElementById("button");

const obs = Observable.fromEvent(button , "click");

// const obs = Observable.timeOut(500);



obs.map(ev => ev.offsetX)
.filter( offsetX => offsetX > 10 )
  .subscribe({
  next(ev){
    console.log("cordinate X "+ ev);
  },
  complete(){
    console.log("done-1");
  }
});

// obs.subscribe({
//   next(v){
//     console.log("next-2");
//   },
//   complete(){
//     console.log("done-2");
//   }
// });


[.0..1.....2....3...4..5]
scan( (x,y) => x+1);




arr = [....1.....2....3...4..5]

obj = { 
  name : "mayur"
}


const newArr = [...arr , 2, 3, ...obj];

.slice(-1)



const arrfun = [function1(){} , 
  function2(){}]

  function addfunc(...arrfun);


*/
