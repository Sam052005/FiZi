// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAZmN79iHAdlTVPZuKwM8OS37wprFAhghg",
    authDomain: "fizi-d1452.firebaseapp.com",
    projectId: "fizi-d1452",
    storageBucket: "fizi-d1452.appspot.com",
    messagingSenderId: "79144562610",
    appId: "1:79144562610:web:ee293734e09f92b5137eab",
    measurementId: "G-HKEZ8FFDN8"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Function to show messages
function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function () {
        messageDiv.style.opacity = 0;
    }, 5000);
}

// Get the sign up button
const signUp = document.getElementById('submitSignUp');

// Add event listener to the sign up button
signUp.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const username = document.getElementById('rUsername').value;

    // Get the authentication and database instances
    const auth = getAuth();
    const db = getFirestore();

    // Create a new user with email and password
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userData = {
                email: email,
                username: username
            };

            // Show success message
            showMessage('Account Created Successfully', 'signUpMessage');

            // Create a new document in the users collection
            const docRef = doc(db, "users", user.uid);
            setDoc(docRef, userData)
                .then(() => {
                    // Redirect to index.html
                    window.location.href = 'login.html';
                })
                .catch((error) => {
                    console.error("Error writing document", error);
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode == 'auth/email-already-in-use') {
                showMessage('Email Address Already Exists!!!', 'signUpMessage');
            } else {
                showMessage('Error Creating Account!!!', 'signUpMessage');
            }
        });
});

const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value; // 'email'
    const password = document.getElementById('password').value;
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password) // 'signInWithEmailAndPassword'
        .then((userCredential) => { // Added parentheses
            showMessage('login is successful', 'signInMessage');
            const user = userCredential.user;
            localStorage.setItem('loggedInUserId', user.uid);
            window.location.href = 'personal.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode == 'auth/invalid-email' || errorCode == 'auth/wrong-password') {
                'auth/wrong-password'
                showMessage('Incorrect Email or Password!!!', 'signInMessage');
            }
            else {
                showMessage('Account does not Exist', 'signInMessage')
            }

        })
});