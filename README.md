# Password Keeper

Password Keeper is a simple web-based password generator and manager
built with **HTML, CSS, and JavaScript**.\
The application allows users to generate strong passwords or
passphrases, save them with associated websites and usernames, and
manage them through a searchable password list.

This project demonstrates front-end development concepts such as DOM
manipulation, local storage, event handling, and UI design.

------------------------------------------------------------------------

# Features

## Password Generator

-   Generate secure random passwords
-   Adjustable password length (8--100 characters)
-   Optional character sets:
    -   Uppercase letters
    -   Numbers
    -   Symbols

## Passphrase Generator

-   Generate multi-word passphrases
-   Optional features:
    -   Capitalized words
    -   Random numbers
-   Selectable separators:
    -   `-`
    -   `.`
    -   `_`
    -   `!`
    -   `?`
    -   Space

## Password Strength Meter

-   Displays a strength indicator for generated passwords
-   Provides visual feedback on password quality

## Clipboard Copy

-   Copy generated passwords to the clipboard with one click
-   Copy saved passwords directly from the password list

## Password Storage

-   Save generated passwords with:
    -   Website
    -   Username
-   Passwords are stored locally in the browser using **localStorage**

## Password Manager Page

-   View all saved passwords
-   Reveal or hide stored passwords
-   Copy passwords to clipboard
-   Delete individual passwords
-   Clear all saved passwords

## Search

-   Filter saved passwords by website name in real time

------------------------------------------------------------------------

# Project Structure

    PasswordKeeper/
    │
    ├── index.html          # Main password generator interface
    ├── passwords.html      # Saved password manager page
    │
    ├── keeper.js           # Generator logic and saving passwords
    ├── passwords.js        # Password list management and search
    │
    ├── style.css           # Application styling
    │
    ├── assets/
    │   ├── icon-eye-open.svg
    │   ├── icon-eye-closed.svg
    │   └── icon-dice.svg
    │
    └── README.md

------------------------------------------------------------------------

# How It Works

1.  The user generates a password or passphrase using the generator
    controls.
2.  The generated password can be copied or saved.
3.  When saving, the user enters a **website name** and **username**.
4.  Passwords are stored in the browser using **localStorage**.
5.  The **Saved Passwords page** displays stored credentials.
6.  Users can search, reveal, copy, or delete stored passwords.

------------------------------------------------------------------------

# Running the Project

## VS Code Live Server

1.  Open the project folder in VS Code
2.  Install the **Live Server extension**
3.  Right-click `index.html`
4.  Select **Open with Live Server**

------------------------------------------------------------------------

# Technologies Used

-   HTML5
-   CSS3
-   JavaScript (ES6)
-   Browser Local Storage API
