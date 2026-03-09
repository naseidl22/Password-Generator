
// Get elements from page
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const passwordInput = document.getElementById('password');
const strengthMeter = document.getElementById('strength-meter');
const plaintext = document.getElementById('plaintext');
const strengthText = document.getElementById('strength-text');
const feedbackList = document.getElementById('feedback-list');
const passwordField = document.getElementById('generated-password');
const lengthSlider = document.getElementById('length');
const copyBtn = document.getElementById('copy-btn');
const genBtn = document.getElementById('generate-btn');
const icon = document.getElementById("visibility-icon");

const modeRadios = document.querySelectorAll('input[name="mode"]');
const passwordOptions = document.getElementById("password-options");
const passphraseOptions = document.getElementById("passphrase-options");
const lengthLabel = document.getElementById("length-label");
const lengthValue = document.getElementById("length-value");

let excludedWords = [];

let passphraseWords = [];

const reverseSubstitutions = {
    '@': 'a',
    '4': 'a',
    '8': 'b',
    '3': 'e',
    '6': 'g',
    '9': 'g',
    '1': 'i',
    'l': 'i',
    '0': 'o',
    '5': 's',
    '$': 's',
    '7': 't',
    '2': 'z'
};

// Get common words from files directory
window.onload = async function() {
    const fileList = await fetch('files.json').then(r => r.json());

    for (const filename of fileList) {
        const data = await fetch(`words/${filename}`).then(r => r.text());
        const lines = data.split('\n');

        for (const line of lines) {
            if (line.trim().length > 2) {
                excludedWords.push(line.trim());
            }
        }
    }

    //mungeWords(excludedWords);

    //console.log(excludedWords);

    //password = generatePassword(16, {uppercase: true, lowercase: true, numbers: true, symbols: true});
    //passwordField.value = password;
    //console.log(password);

    updatePassword();

    passphraseWords = await loadDicewareWords('words/diceware.txt');
    //console.log(passphraseWords);

}

document.getElementById('length').addEventListener('input', function() {
    document.getElementById('length-value').textContent = this.value;
    updatePassword();
});

document.getElementById('uppercase').addEventListener('change', updatePassword);
document.getElementById('numbers').addEventListener('change', updatePassword);
document.getElementById('symbols').addEventListener('change', updatePassword);

const toggleBtn = document.getElementById("toggle-visibility");
//const passwordField = document.getElementById("generated-password");

toggleBtn.addEventListener("click", () => {
    if (passwordField.type === "password") {
        passwordField.type = "text";
        //toggleBtn.textContent = "🙈";
        icon.src = "assets/icon-eye-closed.svg";
    } else {
        passwordField.type = "password";
        //toggleBtn.textContent = "👁";
        icon.src = "assets/icon-eye-open.svg";
    }
});

copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(passwordField.value)
        .then(() => {
            copyBtn.textContent = "Copied!";
            setTimeout(() => {
                copyBtn.textContent = "Copy";
            }, 2000);
        })
        .catch(err => {
            console.error("Failed to copy: ", err);
        });
});

genBtn.addEventListener("click", () => {
    updatePassword();
});

function mungePassword(password){

    passwords = [password];

    let munged =  "";

    for (let i = 0; i < password.length; i++) {
        let char = password[i];
        if (reverseSubstitutions[char]) {
           munged += reverseSubstitutions[char];
        }
        else{
            munged += char;
        }
    }
    passwords.push(munged);
    return passwords;
}

function getPasswordEntropy(password){
    
    // character set size
    let charset = 0;

    let feedback = [];

    // Find character set size
    if (/[a-z]/.test(password))
         charset += 26;
    else
        feedback.push("Add lowercase letters");

    if (/[A-Z]/.test(password)) 
        charset += 26;
    else
        feedback.push("Add uppercase letters");

    if (/[0-9]/.test(password)) 
        charset += 10;
    else
        feedback.push("Add numbers");
    
    if (/[^a-zA-Z0-9]/.test(password)) 
        charset += 32;
    else
        feedback.push("Add special characters");

    // Check for common words and calculate good characters

    let mungedPasswords = mungePassword(password);
    let {flags, matchedWords, completeMatch} = cleanPassword(mungedPasswords);
    console.log(matchedWords);

    // Penalize for characters in word list
    let goodCharacters = 0;
    for (let i = 0; i < flags.length; i++) {
        //goodCharacters += flags[i];
        if(flags[i] === 1){
            goodCharacters++;
        }
        else{
            goodCharacters += 0.25; // 75% penatly for characters in common words
        }
    }

    // If entire password is a common word, score 0, combination of words is penalized but scores
    if (completeMatch) { 
        goodCharacters = 0;
    }

    // Finally calculate entropy
    const entropy = Math.floor(goodCharacters * Math.log2(charset));

    // If no character sets are used, return 0 entropy
    if(charset === 0) return 0;

    // Add feedback for common words
    if (matchedWords.length > 0) {
        feedback.push(`Consider removing common words: ${matchedWords.join(", ")}`);
    }

    return {entropy, feedback};
}

// Search for common words and set flags
function cleanPassword(passwords){


    let length = passwords[0].length;
    let flags = new Array(length).fill(1);
    let matchedWords = [];

    let completeMatch = false;

    let excludedWordsSet = new Set(excludedWords);

    for(let i = 0; i < passwords.length; i++){
        let cleanedPassword  = passwords[i].toLowerCase();


        for (let word of excludedWords) {
            let index = cleanedPassword.indexOf(word);

            if(index !== -1){

                // Add matched word
                if (!matchedWords.includes(word))
                    matchedWords.push(word);

                // Set flags
                for (let i = 0 ; i < word.length; i++) {
                    flags[index + i] = 0;
                }

            }
        }

        if (excludedWordsSet.has(cleanedPassword)) {
            completeMatch = true;
        }

    }

    return {flags, matchedWords, completeMatch};
}

// Search for common words and set flags
function cleanOnePassword(password){

    let matchedWords = [];
    let cleanedPassword = password.toLowerCase();

    //console.log(excludedWords.length);

    for (let word of excludedWords) {
        let index = cleanedPassword.indexOf(word);

        if(index !== -1){
            // Add matched word
            if (!matchedWords.includes(word))
                matchedWords.push(word);
        }
    }

    return matchedWords;
}

// Calculate time to crack in years based on entropy
function timeToCrack(entropy) {
    const attemptsPerSecond = 1e10;
    const totalAttempts = Math.pow(2, entropy - 1); // Attacker using brute force would need to try half of combinations on average (entropy - 1)
    const seconds = totalAttempts / attemptsPerSecond;
    const secondsInYear = 60 * 60 * 24 * 365;
    
    const fiftyYears = 50 * secondsInYear;
    const tenYears = 10 * secondsInYear;

    const timeToCrack = seconds / tenYears;

    return timeToCrack;
}

// Find target entropy for a given time to crack and attempts per second
function entropyTarget(secondsToCrack, attemptsPerSecond){
    return Math.ceil(Math.log2(secondsToCrack * attemptsPerSecond)) + 1; // +1 because average case is half of the total compinations (entropy - 1)
}

// Give score out of 100
function scorePassword(entropy){

    const secondsInYear = 60 * 60 * 24 * 365;
    const attemptsPerSecond = 1e10;
    const hundreadYears = 100 * secondsInYear;
    const fiftyYears = 50 * secondsInYear;
    const tenYears = 10 * secondsInYear;

    const score = 100 * (entropy / entropyTarget(hundreadYears, attemptsPerSecond));
    return Math.min(score, 100);
}

function getOptions(){

    //console.log(document.getElementById('uppercase').checked);
    return {
        uppercase: document.getElementById('uppercase').checked,
        numbers: document.getElementById('numbers').checked,
        symbols: document.getElementById('symbols').checked,
    }
}

// Categorize password strength based on score
function category(entropy){
    if (entropy >= 100)
        return "Very Strong";
    if (entropy >= 80)
        return "Strong";
    if (entropy >= 60)
        return "Fair";
    if (entropy >= 30)
        return "Weak";
    return "Very Weak";
}

function generatePassword(length, options) {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";


    let charset = lowercase; // Lowercase is always included
    if (options.uppercase) charset += uppercase;
    if (options.lowercase) charset += lowercase;
    if (options.numbers) charset += numbers;
    if (options.symbols) charset += symbols;

    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset[secureRandomInt(0, charset.length - 1)];
    }

    return password;
}

function updatePassword(){

    const mode = document.querySelector('input[name="mode"]:checked').value;

    if (mode !== "password") {
        updatePassphrase();
        return;
    }

    let options = getOptions();
    let passwordLength = lengthSlider.value;
    let password = "password";
    while(cleanOnePassword(password).length > 0){
        password = generatePassword(passwordLength, options);
        console.log(cleanOnePassword(password));
        //break;
    }

    //password = generatePassword(passwordLength, options);
    passwordField.value = password;
    console.log(password);

    let {entropy, feedback} = getPasswordEntropy(password);
    let time = timeToCrack(entropy);
    
    // Calculate Score
    let score = scorePassword(entropy);

    // Update UI
    //scoreElement.textContent = `Entropy: ${entropy} bits`;
    //timeElement.textContent = `Password Strength Score: ${score.toFixed(2)}`;
    strengthMeter.value = score;

    if (score >= 100) {
        strengthText.textContent = "Very Strong";
    }
    else if (score >= 80) {
        strengthText.textContent = "Strong";
    }
    else if (score >= 60) {
        strengthText.textContent = "Fair";
    }
    else if (score >= 30) {
        strengthText.textContent = "Weak";
    }
    else { 
        strengthText.textContent = "Very Weak";
    }

}

function updatePassphrase(){
    let numWords = lengthSlider.value;
    const separator = document.querySelector('input[name="separator"]:checked').value;

    let passphrase = generatePassphrase(numWords, separator);

    passwordField.value = passphrase;
    strengthText.textContent = "Very Strong";

}

function secureRandomInt(min, max) {
    if (max <= min) throw new Error("max must be greater than min");

    const range = max - min + 1;
    const maxUint32 = 0xFFFFFFFF;
    const limit = maxUint32 - (maxUint32 % range);

    let rand;
    const arr = new Uint32Array(1);

    do {
        crypto.getRandomValues(arr);
        rand = arr[0];
    } while (rand >= limit);

    return min + (rand % range);
}

modeRadios.forEach(radio => {
    radio.addEventListener("change", updateModeUI);
});


function updateModeUI() {

    const mode = document.querySelector('input[name="mode"]:checked').value;

    if (mode === "password") {

        passwordOptions.classList.remove("hidden");
        passphraseOptions.classList.add("hidden");

        lengthLabel.textContent = "Password Length";

        lengthSlider.min = 8;
        lengthSlider.max = 100;

        if (lengthSlider.value < 8) lengthSlider.value = 20;

    } 
    else { //passphrase

        passwordOptions.classList.add("hidden");
        passphraseOptions.classList.remove("hidden");

        lengthLabel.textContent = "Number of Words";

        lengthSlider.min = 5;
        lengthSlider.max = 9;

        lengthSlider.value = 5;

    }

    lengthValue.textContent = lengthSlider.value;
    updatePassword();
}

async function loadDicewareWords(filePath) {
    const response = await fetch(filePath);
    const text = await response.text();

    const words = [];

    const lines = text.split("\n");

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        const parts = line.split(/\s+/);
        const word = parts[1];

        if (word) {
            words.push(word);
        }
    }

    return words;
}
function generatePassphrase(numWords) {

    const capitalize = document.getElementById("capitalize").checked;
    const includeNumber = document.getElementById("random-number").checked;

    const separator = document.querySelector('input[name="separator"]:checked').value;

    let passphrase = "";

    let selectedWords = [];

    let selectedIndex = -1;
    let randomNum = -1;

    if (includeNumber) {
        selectedIndex = secureRandomInt(0, numWords - 1); // Randomly decide where to insert the number
        randomNum = secureRandomInt(0, 9); // Generate a random number between 0 and 9
    }

    for (let i = 0; i < numWords; i++) {

        let num = secureRandomInt(0, 7775); // 7776 words in the list
        while(selectedWords.includes(num)){ // Ensure no duplicate words
            num = secureRandomInt(0, 7775);
        }

        let selectedWord = passphraseWords[num];

        if (capitalize) {
            selectedWord = selectedWord.charAt(0).toUpperCase() + selectedWord.slice(1);
        }

        passphrase += selectedWord;
        selectedWords.push(num);

        if (i == selectedIndex) {
            passphrase += randomNum;
        }

        if (i != numWords - 1)
            passphrase += separator;



    }

    return passphrase; 
}

passphraseOptions.addEventListener("click", function(event) {

    if (event.target.type === "radio") {
        updatePassword();
        //console.log("Separator changed:", event.target.value);
    }

    if (event.target.id === "capitalize") {
        updatePassword();
        //console.log("Capitalize toggled:", event.target.checked);
    }

    if (event.target.id === "random-number") {
        updatePassword();
        //console.log("Random number toggled:", event.target.checked);
    }

});