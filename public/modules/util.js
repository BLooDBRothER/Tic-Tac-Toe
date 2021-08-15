let top = "top", mid = "mid", bot="bot";
export function checkCurrent(xo, val) {
    //Check row
    if(
        (xo[top][0] == val && xo[top][1] == val && xo[top][2] == val) ||
        (xo[mid][0] == val && xo[mid][1] == val && xo[mid][2] == val) ||
        (xo[bot][0] == val && xo[bot][1] == val && xo[bot][2] == val)
    ){
        return true;
    }
    if(
        (xo[top][0] == val && xo[mid][0] == val && xo[bot][0] == val) ||
        (xo[top][1] == val && xo[mid][1] == val && xo[bot][1] == val) ||
        (xo[top][2] == val && xo[mid][2] == val && xo[bot][2] == val)
    ){
        return true;
    }
    if(
        (xo[top][0] == val && xo[mid][1] == val && xo[bot][2] == val) ||
        (xo[top][2] == val && xo[mid][1] == val && xo[bot][0] == val) 
    ){
        return true;
    }
    return false;
}
