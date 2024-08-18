let currentLanguage = 'ko'; // Default language
let translations = {}; // Global translations object
let charactersData = []; // Global characters data array
let currentFilter = 'version'; // Default filter (version or label)

// Predetermined lists of Versions and Labels
const versionList = ['CHUNITHM', 'AIR', 'STAR', 'AMAZON', 'CRYSTAL', 'PARADISE', 'NEW', 'SUN', 'LUMINOUS'];
const labelList = ['stc', 'gmn', 'rlt', 'god', 'mtv', 'anm', 'sbl', 'omn', 'oth'];

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
      updateFilterButtons(); // Update filter buttons
    })
    .catch(error => console.error('Error loading character data:', error));
}

// Update the UI with translations
function updateUIWithTranslations() {
  const languageLabel = document.querySelector('label[for="select-language"]');
  const sortByLabel = document.querySelector('label[for="sort-by"]');

  if (languageLabel) {
    languageLabel.textContent = translations.language || 'Character List';
  }
  if (sortByLabel) {
    sortByLabel.textContent = translations.sort_by || 'Sort By';
  }
}

// Function to get the character name based on the selected language
function getCharacterName(character) {
  return character[`name_${currentLanguage}`] || character.name_ja;
}

// Function to get the translated label
function getTranslatedLabel(labelId) {
  return translations.labels[labelId] || labelId;
}

// Function to sort and display characters based on selected criteria
function sortAndDisplayCharacters() {
  const sortBy = currentFilter; // Use current filter type (version or label)
  const filterValue = document.querySelector('.filter-button.selected')?.dataset.value || '';

  // Sort characters based on selected criteria
  let sortedCharacters = charactersData.slice();

  if (filterValue) {
      sortedCharacters = sortedCharacters.filter(character => character[sortBy] === filterValue);
  }

  sortedCharacters.sort((a, b) => {
      const aValue = sortBy === 'name_en' ? getCharacterName(a) : a[sortBy];
      const bValue = sortBy === 'name_en' ? getCharacterName(b) : b[sortBy];

      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
  });

  displayCharacters(sortedCharacters); // Display sorted characters
}

// Function to display characters
function displayCharacters(sortedCharacters) {
  const characterList = document.getElementById('character-list');
  if (!characterList) return;

  characterList.innerHTML = ''; // Clear previous content

  sortedCharacters.forEach(character => {
      // Get the name and label for the current language
      const characterName = getCharacterName(character);
      const characterLabel = getTranslatedLabel(character.label);

      const characterDiv = document.createElement('div');
      characterDiv.classList.add('character');
      characterDiv.innerHTML = `
          <h2>${characterName}</h2>
          <img src="images/${character.id}_icon.png" alt="${characterName}">
          <p>${translations.version || 'Version'}: ${character.version}</p>
          <p>${translations.episode || 'Episode'}: ${character.episode}</p>
          <p>${translations.label || 'Label'}: ${characterLabel}</p>
          <button onclick="loadStory('${character.id}')">${translations.read_stories || 'Read Stories'}</button>
      `;
      characterList.appendChild(characterDiv);
  });
}

// Function to update filter buttons
function updateFilterButtons() {
  const filterButtonsContainer = document.getElementById('filter-buttons-container');
  if (!filterButtonsContainer) return;

  filterButtonsContainer.innerHTML = ''; // Clear previous buttons

  const filters = currentFilter === 'version' ? versionList : labelList;

  filters.forEach(filter => {
      const button = document.createElement('button');
      button.textContent = currentFilter === 'label' ? getTranslatedLabel(filter) : filter;
      button.classList.add('filter-button');
      button.dataset.value = filter;

      button.addEventListener('click', () => {
          document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('selected'));
          button.classList.add('selected');
          sortAndDisplayCharacters();
      });

      filterButtonsContainer.appendChild(button);
  });
}

// Function to filter characters based on selected filter button
function filterCharacters(filterValue) {
  const characters = document.querySelectorAll('.character');
  characters.forEach(character => {
    if (character.dataset[currentFilter] === filterValue) {
      character.style.display = 'block';
    } else {
      character.style.display = 'none';
    }
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

document.addEventListener('DOMContentLoaded', () => {
  loadTranslations(currentLanguage); // Load default translations and character data

  // Add event listeners for radio buttons
  document.querySelectorAll('input[name="sort"]').forEach(radio => {
    radio.addEventListener('change', (event) => {
      currentFilter = event.target.value;
      console.log("Current filter:", currentFilter); // Debug line
      updateFilterButtons(); // Generate filter buttons based on the selected sort type
      sortAndDisplayCharacters(); // Sort characters based on selected criteria
    });
  });

  // Add event listener for language selection
  const languageSelect = document.getElementById('select-language');
  if (languageSelect) {
    languageSelect.addEventListener('change', (event) => {
      currentLanguage = event.target.value;
      loadTranslations(currentLanguage); // Load selected translations and character data
    });
  }

  // Add event listener for close modal button
  const closeModalButton = document.getElementById('close-modal');
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
