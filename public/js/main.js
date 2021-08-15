import { checkCurrent } from "../modules/util.js";

let val = "X", cnt=0;
let xo = {
    "top": ["n", "n", "n"],
    "mid": ["n", "n", "n"],
    "bot": ["n", "n", "n"]
};

const boxXO = document.querySelectorAll(".grid__cnt");
const toPlay = document.querySelectorAll(".pl__toplay__ic");
const pl1Score = document.querySelector(".pl1__score");
const pl2Score = document.querySelector(".pl2__score");

function resetAll(){
    val = "X";
    cnt = 0;
    xo = {
        "top": ["n", "n", "n"],
        "mid": ["n", "n", "n"],
        "bot": ["n", "n", "n"]
    };
    resetGrid();
}

function resetGrid(){
    boxXO.forEach(box => {
        box.innerText = "";
        box.classList.remove("grid__clicked");
    });
}

function endGame(){
    let toUpdate = val == "X"? pl1Score : pl2Score;
    toUpdate.innerText = +toUpdate.innerText + 1;
    resetAll();
}

function toggleToPlay(){
    toPlay.forEach(play => {
        play.classList.toggle("none");
    });
}

function updateXO(pos, no){
    xo[pos][no] = val; 
    checkEach();
}

function checkEach(){
    if(checkCurrent(xo, val)){
        endGame();
        return;
    }
    if(cnt==9){
        resetAll();
        return;
    }
    val = val == "X" ? "0" : "X";
    toggleToPlay();
}

function displayXO(elem){
    cnt++;
    elem.classList.add("grid__clicked");
    elem.innerText = val;
    updateXO(elem.dataset.pos, elem.dataset.val);
}

boxXO.forEach(box => {
    box.addEventListener("click", function(){
        if(this.classList.contains("grid__clicked")) return;

        displayXO(this);
    });
});