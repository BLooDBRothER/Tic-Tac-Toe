import {
  firebaseConfig,
  signIn,
  signOut,
  dbPush,
  dbRead,
  dbDel,
  dbUpdate,
} from "../modules/firebase.js";
import { checkCurrent, rand } from "../modules/util.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Firebase necessary
let user;
const auth = firebase.auth();
const db = firebase.database();

let curr="na", userHasRoom, rno=null;
let val = "X",
  cnt = 0,
  isEnd = false;
let xo = {
  top: ["n", "n", "n"],
  mid: ["n", "n", "n"],
  bot: ["n", "n", "n"],
};

// let win, type;

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
const joinRoomIc = document.querySelector(".activate__enter__ic");
const exit = document.querySelector(".exit__btn");
const toHide = document.querySelectorAll(".to_hide")

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
  isEnd = false;
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
  // console.log(curr);
  let wonID = checkCurrent(xo, val);
  if (wonID) {
    isEnd = true;
    showWinner(wonID);
    return;
  }
  if (cnt == 9) {
    showDraw();
    return;
  }
  val = val == "X" ? "O" : "X";
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
  try {
    user = await signIn(auth, provider);
  } catch (e) {
    // console.log(e.message);
  }
}

function displayID(no) {
  createRoom.classList.add("none");
  dispID.classList.remove("none");
  dispID.innerText = no;
}

let localRoomValue;
async function connectionUtil() {
  if (!user) return;

  // type = "host";
  // console.log("he");
  await checkUserRoom();
  // console.log("fi");
  let no = rand();
  rno = no;
  localRoomValue = no;
  let uid = user.uid;
  let val = {
    p1: ["active", uid, user.photoURL, user.displayName],
    p2: ["inactive", "null", "null", "null"],
    currStatus: "open",
    host: uid,
    join: "null"
  };

  updateUserRoom(no);

  let conn = `connection/${no}`;
  dbPush(db, conn, val);
  displayID(no);
  dbListener(conn, activateOpp);
  curr = "X";
  setDBListener();
  removeDBListener();
  setUpDisconnect();
}

function updateUserRoom(no) {
  let conn = `roomlink/${user.uid}`;
  let val = {
    rid: no,
  };
  dbPush(db, conn, val);
}

function deleteRoom() {
  if (!userHasRoom) return;
  let conn = `connection/${userHasRoom.rid}`;
  let readRef = `move/${userHasRoom.rid}`;
  // console.log(userHasRoom);
  dbDel(db, conn);
  dbDel(db, readRef);
}

async function checkUserRoom() {
  let conn = `roomlink/${user.uid}`;
  let inComming = await dbRead(db, conn);
  userHasRoom = inComming.val();
  // console.log(userHasRoom);
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
async function updateStatus() {
  let conn = `connection/${rno}`;
  let inComming = await dbRead(db, conn);
  status = inComming.val();
}

async function activateOpp() {
  await updateStatus();
  if (!status) return;
  if ((status.p2[0] === "inactive") || (status.p1[0] === "inactive")) return;
  plName[0].innerText = status.p1[3];
  plName[1].innerText = status.p2[3];
  plProf[0].src = status.p1[2];
  plProf[1].src = status.p2[2];
  pl1Score.innerText = pl2Score.innerText = "0";
  let readRef = `move/${rno}`;
  resetAll();
  dbPush(db, readRef, {currMove: -1});
  dbListener(readRef, updateClickEvent);
  toHide.forEach(hide => {
    hide.classList.add("none");
  });
  exit.classList.remove("none");
}

//firebase add event listener
async function dbListener(reference, cback) {
  let dbRef = db.ref(reference);
  dbRef.on("value", cback);
}

// function 
function updateClickEvent(snapshot){
  if(!snapshot.val()) return;
  let val = snapshot.val().currMove;
  if(val == -1) return;
  displayXO(boxXO[val]);
}

loginBtn.addEventListener("click", signInUtil);
loginImg.addEventListener("click", signOutUtil);

boxXO.forEach((box) => {
  box.addEventListener("click", function () {
    // console.log(curr, val);
    if(curr === "na"){
      if (this.classList.contains("grid__clicked") || isEnd) return;
      displayXO(this);
    }
    if (curr != val || this.classList.contains("grid__clicked") || isEnd) return;
    // console.log(curr, val);

    let readRef = `move/${rno}`;
    let move = {currMove: this.dataset.no};
    dbPush(db, readRef, move);
  });
});

createRoom.addEventListener("click", connectionUtil);

// function Room Present
async function roomPresent(conn) {
  let inComming = await dbRead(db, conn);
  return inComming.val();
}

async function enterRoom(){
  let conn = `connection/${joinRoom.value}`;
  let roomVal = await roomPresent(conn);
  // console.log(roomVal, roomVal.currStatus, localRoomValue, joinRoom.value);
  if ((+joinRoom.value) === localRoomValue || !roomVal || roomVal.currStatus === "close") {
    Err.innerText = "Invalid Room"
    setTimeout(() => {
      Err.innerText = ""
    }, 1000)
    return
  }
  // type = "join";
  curr = "O";
  rno = joinRoom.value;
  roomVal.p2[0] = "active";
  roomVal.p2[1] = user.uid;
  roomVal.p2[2] = user.photoURL;
  roomVal.p2[3] = user.displayName;
  roomVal.join = user.uid;
  roomVal.currStatus = "close";
  pl1Score.innerText = pl2Score.innerText = "0";
  dbPush(db, conn, roomVal);
  dbListener(conn, activateOpp);
  // console.log("helo");
  setDBListener();
  removeDBListener();
  setUpDisconnect();
} 

const Err = document.querySelector(".activate__join__err");
joinRoom.addEventListener("keypress", async (e) => {
  if (e.key != "Enter") return;
  enterRoom();
});

joinRoomIc.addEventListener("click", enterRoom);

exit.addEventListener("click", () =>{
  // console.log(rno);
  dbUpdate(db, `connection/${rno}`, {currStatus: "delete"});
  // let conns = [`connection/${rno}`, `move/${rno}`];
  // conns.forEach(conn => {
  //   db.ref(conn).off();
  //   dbDel(db, conn);
  // });
});

function setDBListener(){
  // console.log(rno);
  let conn = `connection/${rno}`;
  // console.log("hleo");
  db.ref(conn).on("child_changed", clearGame);
  db.ref(conn).on("child_removed", clearGame);
}

function removeDBListener(){
  let conn = `connection`
  db.ref(conn).on("child_removed", clearGameUtil);
}

function clearGameUtil(data){
  console.log(data.key, rno);
  if(+rno === +data.key){
    console.log("hello");
    deleteTest();
    console.log("hi")
    toHide.forEach(hide => {
      hide.classList.remove("none");
    });
    exit.classList.add("none");
    createRoom.classList.remove("none");
    dispID.classList.add("none");
    dispID.innerText = "";
    // console.log(plName);
    plName[0].innerText = "Player 1";
    plName[1].innerText = "Player 2";
    plProf[0].src = "./Assests/user.svg";
    plProf[1].src = "./Assests/user.svg";
    toPlay[0].classList.remove("none");
    toPlay[1].classList.add("none");
    // curr = type = "na";
    curr = "na";
    pl1Score.innerText = pl2Score.innerText = "0";
    joinRoom.value = '';
    resetAll();
  }
}

function deleteTest(){
  // console.log(rno);
  let conn = `connection/${rno}`;
  let readRef = `move/${rno}`;
  dbDel(db, readRef);
  dbDel(db, conn);
}

function clearGame(data){
  // console.log("232")
  if(data.val() !== "delete") return;
  // console.log(data.val());
  deleteTest();
  // console.log("hi")
  toHide.forEach(hide => {
    hide.classList.remove("none");
  });
  exit.classList.add("none");
  createRoom.classList.remove("none");
  dispID.classList.add("none");
  dispID.innerText = "";
  // console.log(plName);
  plName[0].innerText = "Player 1";
  plName[1].innerText = "Player 2";
  plProf[0].src = "./Assests/user.svg";
  plProf[1].src = "./Assests/user.svg";
  toPlay[0].classList.remove("none");
  toPlay[1].classList.add("none");
  // curr = type = "na";
  curr = "na";
  pl1Score.innerText = pl2Score.innerText = "0";
  joinRoom.value = '';
  resetAll();
}

function setUpDisconnect(){
  if(!rno) return;
  // console.log("enabled");
  const disconnectRef = db.ref(`connection/${rno}`);
  const disconnectRef2 = db.ref(`move/${rno}`);
  disconnectRef.onDisconnect().remove();
  disconnectRef2.onDisconnect().remove();
}