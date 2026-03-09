let storedPasswords = JSON.parse(localStorage.getItem('passwords') || '[]');

const container = document.querySelector('#password-list');
const searchInput = document.querySelector('#search-input');
const clearBtn = document.querySelector('#clear-btn');

function renderPasswords(filter = '') {
    container.innerHTML = '';

    const filtered = storedPasswords
        .map((entry, index) => ({ entry, index })) // keep original index
        .filter(obj =>
            obj.entry.site.toLowerCase().includes(filter.toLowerCase())
        );

    if (filtered.length === 0) {
        container.textContent = "No saved passwords.";
        return;
    }

    filtered.forEach(({ entry, index }) => {

        const div = document.createElement('div');
        div.className = 'password-entry';

        div.innerHTML = `
            <strong>${entry.site}</strong> (${entry.username})
            <button class="reveal-btn">Reveal</button>
            <span class="hidden password-text"></span>
            <button class="copy-btn-list">Copy</button>
            <button class="delete-btn">Delete</button>
        `;

        const revealBtn = div.querySelector('.reveal-btn');
        const passwordText = div.querySelector('.password-text');
        const copyBtn = div.querySelector('.copy-btn-list');
        const deleteBtn = div.querySelector('.delete-btn');

        // Reveal / Hide
        revealBtn.addEventListener('click', async () => {
        
            if (passwordText.classList.contains('hidden')) {
            
                const decrypted = await decryptText(entry.password, entry.iv);
            
                passwordText.textContent = decrypted;
            
                passwordText.classList.remove('hidden');
                revealBtn.textContent = 'Hide';
            
            } else {
            
                passwordText.classList.add('hidden');
                passwordText.textContent = "";
                revealBtn.textContent = 'Reveal';
            
            }
        
        });

        // Copy
        copyBtn.addEventListener('click', async () => {
        
            const decrypted = await decryptText(entry.password, entry.iv);
        
            navigator.clipboard.writeText(decrypted)
                .then(() => alert('Password copied!'));
        
        });

        // Delete specific password
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Delete password for ${entry.site}?`)) {

                storedPasswords.splice(index, 1);

                localStorage.setItem(
                    'passwords',
                    JSON.stringify(storedPasswords)
                );

                renderPasswords(searchInput.value);
            }
        });

        container.appendChild(div);
    });
}

// Initial render
renderPasswords();

// Search filter
searchInput.addEventListener('input', () => {
    renderPasswords(searchInput.value);
});

// Clear all
clearBtn.addEventListener('click', () => {
    if (confirm("Delete ALL saved passwords?")) {
        localStorage.removeItem('passwords');
        storedPasswords = [];
        renderPasswords();
    }
});