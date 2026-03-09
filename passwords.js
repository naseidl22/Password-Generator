// Load passwords from localStorage
const storedPasswords = JSON.parse(localStorage.getItem('passwords') || '[]');
const container = document.querySelector('#password-list');
const searchInput = document.querySelector('#search-input');
const clearBtn = document.querySelector('#clear-btn');

// Function to render the password list
function renderPasswords(filter = '') {
    container.innerHTML = '';

    const filtered = storedPasswords.filter(entry => 
        entry.site.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
        container.textContent = "No saved passwords.";
        return;
    }

    filtered.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'password-entry';
        div.innerHTML = `
            <strong>${entry.site}</strong> (${entry.username}) 
            <button class="reveal-btn">Reveal</button>
            <span class="hidden password-text">${entry.password}</span>
            <button class="copy-btn">Copy</button>
        `;

        // Toggle reveal/hide
        const revealBtn = div.querySelector('.reveal-btn');
        const passwordText = div.querySelector('.password-text');
        revealBtn.addEventListener('click', () => {
            if (passwordText.classList.contains('hidden')) {
                passwordText.classList.remove('hidden');
                revealBtn.textContent = 'Hide';
            } else {
                passwordText.classList.add('hidden');
                revealBtn.textContent = 'Reveal';
            }
        });

        // Copy password
        const copyBtn = div.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(entry.password).then(() => {
                alert('Password copied!');
            });
        });

        container.appendChild(div);
    });
}

// Initial render
renderPasswords();

// Filter passwords as user types
searchInput.addEventListener('input', () => {
    renderPasswords(searchInput.value);
});

// Clear all passwords
clearBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to delete all saved passwords?")) {
        localStorage.removeItem('passwords');
        storedPasswords.length = 0;
        renderPasswords();
    }
});