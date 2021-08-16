import {
  firebaseConfig,
  signIn,
  signOut,
  dbPush,
  dbRead,
  dbDel,
} from "../modules/firebase.js";
import { checkCurrent, rand } from "../modules/util.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Firebase necessary
let user;
const auth = firebase.auth();
const db = firebase.database();

let curr, userHasRoom, rno;
let val = "X",
  cnt = 0;
let xo = {
  top: ["n", "n", "n"],
  mid: ["n", "n", "n"],
  bot: ["n", "n", "n"],
};

let win;

let logout;
const loginBtn = document.querySelector(".login__btn");
const loginDet = document.querySelector(".login__detail");
const loginImg = loginDet.querySelector("img");
const loginP = loginDet.querySelector("p");
const boxXO = document.querySelectorAll(".grid__cnt");
const toPlay = document.querySelectorAll(".pl__toplay__ic");
const pl1Score = document.querySelector(".pl1__score");
const pl2Score = document.querySelector(".pl2__score");
const plName = document.querySelectorAll(".pl__name");
const plProf = document.querySelectorAll(".pl__prof");
const createRoom = document.querySelector(".activate__create");
const dispID = document.querySelector(".activate__id");
const joinRoom = document.querySelector(".activate__join__input");

let delay = 0;
function showWinner(ID) {
  ID.forEach((id) => {
    setTimeout(() => {
      document
        .querySelector(`.grid__cnt[data-no="${id}"]`)
        .classList.add("glow");
    }, delay);
    delay += 20;
  });
  setTimeout(endGame, 1500);
}
function showDraw() {
  boxXO.forEach((box) => {
    setTimeout(() => {
      box.classList.add("glow");
    }, delay);
    delay += 20;
  });
  setTimeout(resetAll, 1500);
}

function resetAll() {
  val = "X";
  cnt = 0;
  xo = {
    top: ["n", "n", "n"],
    mid: ["n", "n", "n"],
    bot: ["n", "n", "n"],
  };
  delay = 0;
  resetGrid();
  toPlay[0].classList.remove("none");
  toPlay[1].classList.add("none");
}

function resetGrid() {
  boxXO.forEach((box) => {
    box.innerText = "";
    box.classList.remove("grid__clicked");
    box.classList.remove("glow");
  });
}

function endGame() {
  let toUpdate = val == "X" ? pl1Score : pl2Score;
  toUpdate.innerText = +toUpdate.innerText + 1;
  resetAll();
}

function toggleToPlay() {
  toPlay.forEach((play) => {
    play.classList.toggle("none");
  });
}

function updateXO(pos, no) {
  xo[pos][no] = val;
  checkEach();
}

function checkEach() {
  let wonID = checkCurrent(xo, val);
  if (wonID) {
    showWinner(wonID);
    return;
  }
  if (cnt == 9) {
    showDraw();
    return;
  }
  val = val == "X" ? "o" : "X";
  toggleToPlay();
}

function displayXO(elem) {
  cnt++;
  elem.classList.add("grid__clicked");
  elem.innerText = val;
  updateXO(elem.dataset.pos, elem.dataset.val);
}

async function signOutUtil() {
  await signOut(auth);
}

function fillUser(user) {
  loginBtn.classList.add("none");
  loginDet.classList.remove("none");

  loginImg.src = user.photoURL;
  loginP.innerText = user.displayName;
}

async function signInUtil() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try{
    user = await signIn(auth, provider);
  }
  catch(e){
    console.log(e.message);
  }
}

function displayID(no) {
  createRoom.classList.add("none");
  dispID.classList.remove("none");
  dispID.innerText = no;
}

function connectionUtil() {
  if (!user) return;

  let no = rand();
  rno = no;
  let uid = user.uid;
  let val = {
    p1: ["active", uid, user.photoURL, user.displayName],
    p2: ["inactive", "null", "null", "null"],
  };

  updateUserRoom(no);

  let conn = `connection/${no}`;
  dbPush(db, conn, val);
  displayID(no);
  dbListener(conn, activateOpp);
  curr = "X";
}

function updateUserRoom(no){
  let conn = `roomlink/${user.uid}`;
  let val = {
    rid: no
  };
  console.log(no)
  dbPush(db, conn, val);
}

function deleteRoom(){
  if(!userHasRoom) return;
  let conn = `connection/${userHasRoom.rid}`;

  dbDel(db, conn);
}

async function checkUserRoom(){
  let conn = `roomlink/${user.uid}`;
  let inComming = await dbRead(db, conn);
  userHasRoom = inComming.val();
  deleteRoom();
}

// firebase auth status
firebase.auth().onAuthStateChanged((insuser) => {
  if (insuser) {
    user = insuser;
    fillUser(insuser);
    checkUserRoom();
  } else {
    loginBtn.classList.remove("none");
    loginDet.classList.add("none");
    deleteRoom();
  }
});

let status;
async function updateStatus(){
  let conn = `connection/${rno}`;
  let inComming = await dbRead(db, conn);
  status = inComming.val();
}

async function activateOpp(){
  await updateStatus();
  console.log(status, curr)
  if(! status) return;
  console.log(curr)
  // if( (curr === "X" && status.p2[0] === "inactive") || (curr === "O" && status.p1[0] === "inactive") ) return;
  if(curr === "X"){
    console.log(status.p2[0]);
    if(status.p2[0] === "active"){
      plName[0].innerText = status.p1[3]; 
    plName[1].innerText = status.p2[3];
    plProf[0].src = status.p1[2]; 
    plProf[1].src = status.p2[2]; 
    }
  }
  if(curr === "O"){
    console.log(status.p1[0]);
    if(status.p1[0] === "active"){
      plName[0].innerText = status.p1[3]; 
    plName[1].innerText = status.p2[3];
    plProf[0].src = status.p1[2]; 
    plProf[1].src = status.p2[2]; 
    }
  }
  // if(status.p1[0] === "inactive" || status.p2[0] === "inactive") return;
  // console.log("ins");
  // plName[0].innerText = status.p1[3]; 
  // plName[1].innerText = status.p2[3];
  // plProf[0].src = status.p1[2]; 
  // plProf[1].src = status.p2[2]; 
  // console.log(status);
}

//firebase add event listener
async function dbListener(reference, cback){
  console.log(reference);
  let dbRef = db.ref(reference);
  dbRef.on("value", cback);
}

loginBtn.addEventListener("click", signInUtil);
loginImg.addEventListener("click", signOutUtil);

boxXO.forEach((box) => {
  box.addEventListener("click", function () {
    if (this.classList.contains("grid__clicked")) return;

    displayXO(this);
  });
});

createRoom.addEventListener("click", connectionUtil);

// function Room Present
async function roomPresent(conn){
  let inComming = await dbRead(db, conn);
  return inComming.val();
}

joinRoom.addEventListener("keypress", async (e) => {
  if(e.key != "Enter") return;
  curr = "O";
  let conn = `connection/${e.target.value}`;
  let roomVal = await roomPresent(conn);
  if(!roomVal) return;
  rno = e.target.value;
  roomVal.p2[0] = "active";
  roomVal.p2[1] = user.uid;
  roomVal.p2[2] = user.photoURL;
  roomVal.p2[3] = user.displayName;
  console.log(roomVal);
  dbPush(db, conn, roomVal);
  dbListener(conn, activateOpp);
})


// window.addEventListener("load", (e) => {

// });