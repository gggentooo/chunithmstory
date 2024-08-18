let currentLanguage = 'ja'; // Default language
let translations = {}; // Global translations object
let charactersData = []; // Global characters data array

// Load translations for the selected language
function loadTranslations(language) {
  fetch(`translations/${language}.json`)
    .then(response => response.json())
    .then(data => {
      translations = data; // Update global translations
      updateUIWithTranslations(); // Update the UI with new translations
      loadCharacterData(); // Reload characters with new data
    })
    .catch(error => {
      console.error('Error loading translations:', error);
      // Fallback to default language if there's an error
      if (language !== 'ja') {
        loadTranslations('ja');
      }
    });
}

// Load character data from the single JSON file
function loadCharacterData() {
  fetch('characters.json')
    .then(response => response.json())
    .then(data => {
      charactersData = data; // Update global characters data
      sortAndDisplayCharacters(); // Sort and display characters
    })
    .catch(error => console.error('Error loading character data:', error));
}

// Update the UI with translations
function updateUIWithTranslations() {
  const languageLabel = document.querySelector('label[for="language-select"]');
  const sortByLabel = document.querySelector('label[for="sort-select"]');

  if (languageLabel) {
    languageLabel.textContent = translations.character_list || 'Character List';
  }
  if (sortByLabel) {
    sortByLabel.textContent = translations.sort_by || 'Sort By';
  }
}

// Function to get the character name based on the selected language
function getCharacterName(character) {
  return character[`name_${currentLanguage}`] || character.name_en;
}

// Function to sort and display characters based on selected criteria
function sortAndDisplayCharacters() {
  const sortBy = document.getElementById('sort-select')?.value || 'name_en';

  // Sort characters based on selected criteria
  charactersData.sort((a, b) => {
    const aValue = sortBy === 'name_en' ? getCharacterName(a) : a[sortBy];
    const bValue = sortBy === 'name_en' ? getCharacterName(b) : b[sortBy];

    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
    return 0;
  });

  displayCharacters(); // Display sorted characters
}

// Function to display characters
function displayCharacters() {
  const characterList = document.getElementById('character-list');
  if (!characterList) return;

  characterList.innerHTML = ''; // Clear previous content

  charactersData.forEach(character => {
    // Get the name for the current language
    const characterName = getCharacterName(character);

    const characterDiv = document.createElement('div');
    characterDiv.classList.add('character');
    characterDiv.innerHTML = `
      <h2>${characterName}</h2>
      <img src="images/${character.id}_icon.png" alt="${characterName}">
      <p>${translations.version || 'Version'}: ${character.version}</p>
      <p>${translations.episode || 'Episode'}: ${character.episode}</p>
      <p>${translations.label || 'Label'}: ${character.label}</p>
      <button onclick="loadStory('${character.id}')">${translations.read_stories || 'Read Stories'}</button>
    `;
    characterList.appendChild(characterDiv);
  });
}

// Function to load and render a single story file for a character
function loadStory(characterId) {
  const storyContent = document.getElementById('story-content');
  if (!storyContent) return;

  storyContent.innerHTML = ''; // Clear previous content

  const file = `story/${characterId}/${characterId}_${currentLanguage}.md`;

  fetch(file)
    .then(response => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error('File not found');
      }
    })
    .then(markdown => {
      const episodeDiv = document.createElement('div');
      episodeDiv.innerHTML = marked(markdown); // Convert Markdown to HTML using Marked.js
      storyContent.appendChild(episodeDiv);

      // Open the modal after content is loaded
      document.getElementById('story-modal').style.display = 'block';
    })
    .catch(error => {
      console.log(`Error loading story ${file}:`, error.message);
    });
}

// Function to close the modal
function closeModal() {
  const modal = document.getElementById('story-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Initialize the site
document.addEventListener('DOMContentLoaded', () => {
  loadTranslations(currentLanguage); // Load default translations and character data

  const languageSelect = document.getElementById('language-select');
  const sortSelect = document.getElementById('sort-select');
  const closeModalButton = document.getElementById('close-modal');

  if (languageSelect) {
    languageSelect.addEventListener('change', (event) => {
      currentLanguage = event.target.value;
      loadTranslations(currentLanguage); // Load selected translations and character data
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      sortAndDisplayCharacters(); // Sort characters based on selected criteria
    });
  }

  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModal);
  }

  // Close modal when user clicks outside of the modal
  window.addEventListener('click', (event) => {
    const modal = document.getElementById('story-modal');
    if (modal && event.target === modal) {
      closeModal();
    }
  });
});
