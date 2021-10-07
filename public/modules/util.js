let top = "top", mid = "mid", bot="bot";
export function checkCurrent(xo, val) {
    //Check row
    if((xo[top][0] == val && xo[top][1] == val && xo[top][2] == val)){
        return [0, 1, 2];
    }
    else if((xo[mid][0] == val && xo[mid][1] == val && xo[mid][2] == val)){
        return [3, 4, 5];
    }
    else if((xo[bot][0] == val && xo[bot][1] == val && xo[bot][2] == val)){
        return [6, 7, 8];
    }
    
    //check column
    if((xo[top][0] == val && xo[mid][0] == val && xo[bot][0] == val)){
        return [0, 3, 6];
    }
    else if((xo[top][1] == val && xo[mid][1] == val && xo[bot][1] == val)){
        return [1, 4, 7];
    }
    else if((xo[top][2] == val && xo[mid][2] == val && xo[bot][2] == val)){
        return [2, 5, 8];
    }

    //check diagonal
    if((xo[top][0] == val && xo[mid][1] == val && xo[bot][2] == val)){
        return [0, 4, 8];
    }
    else if((xo[top][2] == val && xo[mid][1] == val && xo[bot][0] == val)){
        return [2, 4, 6];
    }
    return false;
}


export function rand(){
    return Math.floor(Math.random() * (9999999 - 1000000) + 1000000);
} 