const loader = document.getElementById('loader');
const resultDiv = document.getElementById('result');
const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const characterInput = document.getElementById('characterInput');
const taxModal = document.getElementById('taxModal');
const closeModal = document.getElementById('closeModal');
const triviaBtn = document.getElementById('triviaBtn');
const triviaModal = document.getElementById('triviaModal');
const closeTrivia = document.getElementById('closeTrivia');
const triviaLoading = document.getElementById('triviaLoading');
const triviaGame = document.getElementById('triviaGame');
const triviaImg = document.getElementById('triviaImg');
const triviaName = document.getElementById('triviaName');
const triviaOptions = document.getElementById('triviaOptions');
const triviaResult = document.getElementById('triviaResult');
const triviaVerdict = document.getElementById('triviaVerdict');
const nextTriviaBtn = document.getElementById('nextTriviaBtn');

let allFetchedCharacters = [];
let currentlyDisplayedCount = 0;
let nextPageUrl = null;
let currentTriviaStatus = ''; 

closeModal.addEventListener('click', () => taxModal.classList.add('hidden'));
closeTrivia.addEventListener('click', () => triviaModal.classList.add('hidden'));

function createCharacterCard(character) {
    let statusClass = 'unknown';
    if (character.status === 'Alive') statusClass = 'alive';
    if (character.status === 'Dead') statusClass = 'dead';
    
    return `
        <div class="card">
            <img src="${character.image}" alt="${character.name}">
            <div class="card-info">
                <h3>${character.name}</h3>
                <p>Status: <span class="status ${statusClass}">${character.status}</span></p>
                <p>Species: ${character.species}</p>
                <p>Location: ${character.location.name}</p>
            </div>
        </div>
    `;
}

async function showNextBatch() {
    if (currentlyDisplayedCount + 6 > allFetchedCharacters.length && nextPageUrl) {
        try {
            loadMoreBtn.textContent = 'Loading...';
            loadMoreBtn.disabled = true;
            const response = await fetch(nextPageUrl);
            const data = await response.json();
            allFetchedCharacters = allFetchedCharacters.concat(data.results);
            nextPageUrl = data.info.next; 
        } catch (error) {
            console.error(error);
        } finally {
            loadMoreBtn.textContent = 'Load more';
            loadMoreBtn.disabled = false;
        }
    }

    const nextBatch = allFetchedCharacters.slice(currentlyDisplayedCount, currentlyDisplayedCount + 6);
    let html = '';
    nextBatch.forEach(character => { html += createCharacterCard(character); });
    
    resultDiv.innerHTML += html;
    currentlyDisplayedCount += nextBatch.length;

    if (currentlyDisplayedCount >= allFetchedCharacters.length && !nextPageUrl) {
        loadMoreBtn.classList.add('hidden');
    } else {
        loadMoreBtn.classList.remove('hidden');
    }
}

loadMoreBtn.addEventListener('click', showNextBatch);

document.getElementById('rmForm').addEventListener('submit', async function(e) {
    e.preventDefault(); 
    const searchInput = characterInput.value.trim();
    
    allFetchedCharacters = [];
    currentlyDisplayedCount = 0;
    nextPageUrl = null;
    resultDiv.innerHTML = '';
    loadMoreBtn.classList.add('hidden');
    loader.classList.remove('hidden');
    searchBtn.disabled = true;
    randomBtn.disabled = true;
    triviaBtn.disabled = true;
    
    try {
        const response = await fetch(`https://rickandmortyapi.com/api/character/?name=${searchInput}`);
        if (!response.ok) {
            if (response.status === 404) throw new Error('No character found with this name!');
            throw new Error('Error connecting to the server.');
        }
        const data = await response.json();
        allFetchedCharacters = data.results;
        nextPageUrl = data.info.next;
        await showNextBatch();
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: #ff5555; text-align: center; width: 100%;">${error.message}</p>`;
    } finally {
        loader.classList.add('hidden');
        searchBtn.disabled = false;
        randomBtn.disabled = false;
        triviaBtn.disabled = false;
    }
});

randomBtn.addEventListener('click', async function() {
    if (Math.random() < 0.10) {
        taxModal.classList.remove('hidden');
        return;
    }

    const randomId = Math.floor(Math.random() * 826) + 1;
    characterInput.value = '';
    allFetchedCharacters = []; 
    currentlyDisplayedCount = 0; 
    nextPageUrl = null;
    resultDiv.innerHTML = ''; 
    loadMoreBtn.classList.add('hidden');
    loader.classList.remove('hidden');
    searchBtn.disabled = true; 
    randomBtn.disabled = true; 
    triviaBtn.disabled = true;
    
    try {
        const response = await fetch(`https://rickandmortyapi.com/api/character/${randomId}`);
        if (!response.ok) throw new Error('Failed to open portal. Try again!');
        const character = await response.json();
        resultDiv.innerHTML = createCharacterCard(character);
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: #ff5555; text-align: center; width: 100%;">${error.message}</p>`;
    } finally {
        loader.classList.add('hidden');
        searchBtn.disabled = false; 
        randomBtn.disabled = false; 
        triviaBtn.disabled = false;
    }
});

async function loadTriviaCharacter() {
    triviaGame.classList.add('hidden');
    triviaResult.classList.add('hidden');
    triviaOptions.classList.remove('hidden');
    triviaLoading.classList.remove('hidden');
    
    const randomId = Math.floor(Math.random() * 826) + 1;
    
    try {
        const response = await fetch(`https://rickandmortyapi.com/api/character/${randomId}`);
        const character = await response.json();
        
        triviaImg.src = character.image;
        triviaName.textContent = character.name;
        currentTriviaStatus = character.status; 
        
        triviaLoading.classList.add('hidden');
        triviaGame.classList.remove('hidden');
    } catch (error) {
        triviaLoading.textContent = "Error loading character. Try again.";
    }
}

triviaBtn.addEventListener('click', () => {
    triviaModal.classList.remove('hidden');
    loadTriviaCharacter();
});

nextTriviaBtn.addEventListener('click', loadTriviaCharacter);

document.querySelectorAll('.guess-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const guessedStatus = this.getAttribute('data-status');
        
        triviaOptions.classList.add('hidden');
        triviaResult.classList.remove('hidden');
        
        if (guessedStatus.toLowerCase() === currentTriviaStatus.toLowerCase()) {
            triviaVerdict.innerHTML = `<span style="color: #55cc44;">Correct!</span> They are ${currentTriviaStatus}.`;
        } else {
            triviaVerdict.innerHTML = `<span style="color: #d63d2e;">Wrong!</span> They are actually ${currentTriviaStatus}.`;
        }
    });
});