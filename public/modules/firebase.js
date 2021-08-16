export const firebaseConfig = {
    apiKey: "AIzaSyD6KZ3tVToX8Kc8jwM5afTzQInjaH9DtBE",
    authDomain: "tic-tac-toe-44.firebaseapp.com",
    projectId: "tic-tac-toe-44",
    storageBucket: "tic-tac-toe-44.appspot.com",
    messagingSenderId: "39983334316",
    appId: "1:39983334316:web:d656e83ed26fb656cab009",
    measurementId: "G-R6V8RKEB7Q",
    databaseURL: "https://tic-tac-toe-44-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

export async function signIn(auth, provider){
    let res = await auth.signInWithPopup(provider);
    return res.user;
}

export async function signOut(auth){
    let res = await auth.signOut();
    return true; 
}

export async function dbPush(db, reference, val){
    db.ref(reference).set(val);
}

export async function dbRead(db, reference){
    let check = await db.ref(reference).get();
    return check;
}  

export function dbDel(db, reference){
    db.ref(reference).remove();
}   