import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { getFirestore, setDoc, doc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

// Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);



document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('healthForm');
    const popup = document.getElementById('resultsPopup');
    const closeBtn = document.querySelector('.close-btn');
    const bmiResult = document.getElementById('bmiResult');
    const bmrResult = document.getElementById('bmrResult');
    const bodyFatResult = document.getElementById('bodyFatResult');

    // Check authentication state
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            localStorage.setItem('loggedInUserId', user.uid);
            console.log('User is logged in:', user.uid);
        } else {
            console.log('No user is logged in');
        }
    });


    form.addEventListener('submit', function (event) {
        event.preventDefault();
        calculateResults();
    });

    closeBtn.addEventListener('click', function () {
        const loggedInUserId = localStorage.getItem('loggedInUserId');

        popup.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        const loggedInUserId = localStorage.getItem('loggedInUserId');
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });

    function calculateResults() {
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);
        const age = parseFloat(document.getElementById('age').value);
        const neck = parseFloat(document.getElementById('neck').value);
        const waist = parseFloat(document.getElementById('waist').value);
        const gender = document.querySelector('input[name="gender"]:checked').value;

        const bmi = calculateBMI(weight, height);
        const bmr = calculateBMR(weight, height, age, gender);
        const bodyFat = calculateBodyFat(height, neck, waist, gender);

        displayResults(bmi, bmr, bodyFat);

    }

    function calculateBMI(weight, height) {
        const heightInMeters = height / 100;
        return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    function calculateBMR(weight, height, age, gender) {
        if (gender === 'male') {
            return (88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)).toFixed(0);
        } else {
            return (447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)).toFixed(0);
        }
    }

    function calculateBodyFat(height, neck, waist, gender) {
        const heightInCm = height;
        if (gender === 'male') {
            return (495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(heightInCm)) - 450).toFixed(1);
        } else {
            const hip = waist; // Assuming hip measurement for simplicity
            return (495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(heightInCm)) - 450).toFixed(1);
        }
    }

    function displayResults(bmi, bmr, bodyFat) {
        bmiResult.textContent = bmi;
        bmrResult.textContent = `${bmr} calories/day`;
        bodyFatResult.textContent = `${bodyFat}%`;

        popup.style.display = 'block';
    }



    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const height = document.getElementById('height').value;
        const weight = document.getElementById('weight').value;
        const age = document.getElementById('age').value;
        const neck = document.getElementById('neck').value;
        const waist = document.getElementById('waist').value;

        const loggedInUserId = localStorage.getItem('loggedInUserId');

        if (loggedInUserId) {
            try {
                const userDoc = doc(db, 'users', loggedInUserId);
                await setDoc(userDoc, {
                    age: parseInt(age),
                    height: parseInt(height),
                    weight: parseInt(weight),
                    neck: parseInt(neck),
                    waist: parseInt(waist)
                }, { merge: true });

                status.textContent = 'Data saved successfully!';
            } catch (error) {
                console.error('Error writing document: ', error);
                status.textContent = 'Error saving data. Please try again.';
            }
        } else {
            status.textContent = 'No user is logged in.';
        }
    });
});