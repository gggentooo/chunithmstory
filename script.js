let currentLanguage = 'en'; // Default language
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
      if (language !== 'en') {
        loadTranslations('en');
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
  document.querySelector('label[for="language-select"]').textContent = translations.character_list || 'Character List';
  document.querySelector('label[for="sort-select"]').textContent = translations.sort_by || 'Sort By';
}

// Function to sort and display characters based on selected criteria
function sortAndDisplayCharacters() {
  const sortBy = document.getElementById('sort-select').value;

  // Sort characters based on selected criteria
  charactersData.sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1;
    if (a[sortBy] > b[sortBy]) return 1;
    return 0;
  });

  displayCharacters(); // Display sorted characters
}

// Function to display characters
function displayCharacters() {
  const characterList = document.getElementById('character-list');
  characterList.innerHTML = ''; // Clear previous content

  charactersData.forEach(character => {
    // Get the name for the current language
    const characterName = character[`name_${currentLanguage}`] || character.name_en;

    const characterDiv = document.createElement('div');
    characterDiv.classList.add('character');
    characterDiv.innerHTML = `
      <h2>${characterName}</h2>
      <p>${translations.version || 'Version'}: ${character.version}</p>
      <p>${translations.episode || 'Episode'}: ${character.episode}</p>
      <p>${translations.label || 'Label'}: ${character.label}</p>
      <img src="${character.image}" alt="${characterName}">
      <button onclick="loadAllStories('${character.story_folder}', ${character.episode_count})">${translations.read_stories || 'Read Stories'}</button>
    `;
    characterList.appendChild(characterDiv);
  });
}

// Function to load and render all story files in a folder
function loadAllStories(folder, episodeCount) {
  const storyContent = document.getElementById('story-content');
  storyContent.innerHTML = ''; // Clear previous content

  for (let i = 1; i <= episodeCount; i++) {
    const file = `${folder}episode_${i}_${currentLanguage}.md`;

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
      })
      .catch(error => {
        console.log(`Error loading story ${file}:`, error.message);
      });
  }
}

// Initialize the site
document.addEventListener('DOMContentLoaded', () => {
  loadTranslations(currentLanguage); // Load default translations and character data

  document.getElementById('language-select').addEventListener('change', (event) => {
    currentLanguage = event.target.value;
    loadTranslations(currentLanguage); // Load selected translations and character data
  });

  document.getElementById('sort-select').addEventListener('change', () => {
    sortAndDisplayCharacters(); // Sort characters based on selected criteria
  });
});
