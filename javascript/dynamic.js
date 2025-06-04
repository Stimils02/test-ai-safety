// Load YAML data and store cache
const dataCache = {
    people: null,
    artifacts: null
};

// Function to fetch and parse YAML data with caching
async function loadYamlData(fileName) {
    const cacheKey = fileName.replace('.yaml', '').replace('content/', '');
    
    // Return cached data if available
    if (dataCache[cacheKey]) {
        return dataCache[cacheKey];
    }

    try {
        const response = await fetch(`content/${fileName}`);
        if (!response.ok) {
            console.error(`Failed to load YAML file: ${fileName}`, response.statusText);
            return null;
        }
        
        const yamlText = await response.text();
        const data = jsyaml.load(yamlText);
        
        // Store in cache
        dataCache[cacheKey] = data;
        return data;
    } catch (e) {
        console.error(`Error loading or parsing YAML file: ${fileName}`, e);
        return null;
    }
}

// Function to process image paths
function getImagePath(imagePath, defaultImage = 'content/people/images/pic_placeholder.jpg') {
    if (!imagePath) return defaultImage;

    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // Handle various path formats
    if (imagePath.startsWith('/')) {
        return imagePath.substring(1);
    } else if (imagePath.startsWith('content/')) {
        return imagePath;
    } else if (imagePath.startsWith('images/')) {
        return imagePath;
    } else if (imagePath.startsWith('researcher-')) {
        // For featured faculty images that start with researcher-
        return `images/${imagePath}`;
    } else if (imagePath.startsWith('artifacts/')) {
        return `content/images/${imagePath}`;
    } else {
        // For images that already include the images/ prefix in people.yaml
        return imagePath;
    }
}

// Function to parse BibTeX files
async function parseBibTeX(bibText) {
    const entries = [];
    let currentEntry = null;
    let currentField = null;
    let bracketCount = 0;
    let fieldContent = '';


    // Split the file into lines for easier processing
    const lines = bibText.split('\n');

    for (const line of lines) {
        // Skip empty lines
        if (line.trim() === '') continue;

        // Start of a new entry
        if (line.trim().startsWith('@')) {
            if (currentEntry) {
                // Save the previous entry if it exists
                entries.push(currentEntry);
            }

            // Extract the entry type and key
            const match = line.match(/@(\w+)\s*{\s*([^,]+),/);
            if (match) {
                currentEntry = {
                    type: match[1].toLowerCase(),
                    key: match[2],
                    fields: {},
                    tags: [],
                    featured: false
                };
                currentField = null;
                fieldContent = '';
                bracketCount = 0;
            }
            continue;
        }

        // End of an entry
        if (line.trim() === '}' && bracketCount === 0) {
            if (currentField && fieldContent) {
                currentEntry.fields[currentField] = fieldContent.trim();
            }
            // Save the last entry
            if (currentEntry) {
                entries.push(currentEntry);
                currentEntry = null;
            }
            continue;
        }

        // Process field
        if (currentEntry) {
            // Check if this line defines a new field
            const fieldMatch = line.match(/^\s*(\w+)\s*=\s*{(.*)$/);
            if (fieldMatch && bracketCount === 0) {
                // Save the previous field if it exists
                if (currentField && fieldContent) {
                    currentEntry.fields[currentField] = fieldContent.trim();
                    
                    // Process keywords field to extract tags
                    if (currentField === 'keywords') {
                        const keywordsStr = fieldContent.trim();
                        const keywords = keywordsStr
                            .split(',')
                            .map(k => k.trim())
                            .filter(k => k.length > 0);
                        currentEntry.tags = keywords;
                    }
                    
                    // Process featured field
                    if (currentField === 'featured') {
                        const featuredValue = fieldContent.trim().toLowerCase();
                        currentEntry.featured = featuredValue === 'true';
                    }
                }

                // Start a new field
                currentField = fieldMatch[1].toLowerCase();
                fieldContent = fieldMatch[2];

                // Count opening brackets
                bracketCount = (fieldContent.match(/{/g) || []).length;
                bracketCount -= (fieldContent.match(/}/g) || []).length;

                // Check if the field ends on the same line
                if (fieldContent.endsWith('},') || fieldContent.endsWith('}')) {
                    fieldContent = fieldContent.replace(/},?$/, '');
                    currentEntry.fields[currentField] = fieldContent.trim();
                    
                    // Process keywords field to extract tags
                    if (currentField === 'keywords') {
                        const keywordsStr = fieldContent.trim();
                        const keywords = keywordsStr
                            .split(',')
                            .map(k => k.trim())
                            .filter(k => k.length > 0);
                        currentEntry.tags = keywords;
                    }
                    
                    // Process featured field
                    if (currentField === 'featured') {
                        const featuredValue = fieldContent.trim().toLowerCase();
                        currentEntry.featured = featuredValue === 'true';
                    }
                    
                    currentField = null;
                    fieldContent = '';
                    bracketCount = 0;
                }
            } else if (currentField) {
                // Continue the current field
                fieldContent += ' ' + line.trim();

                // Update bracket count
                bracketCount += (line.match(/{/g) || []).length;
                bracketCount -= (line.match(/}/g) || []).length;

                // Check if the field ends on this line
                if (line.trim().endsWith('},') || line.trim().endsWith('}')) {
                    fieldContent = fieldContent.replace(/},?$/, '');
                    currentEntry.fields[currentField] = fieldContent.trim();
                    
                    // Process keywords field to extract tags
                    if (currentField === 'keywords') {
                        const keywordsStr = fieldContent.trim();
                        const keywords = keywordsStr
                            .split(',')
                            .map(k => k.trim())
                            .filter(k => k.length > 0);
                        currentEntry.tags = keywords;
                    }
                    
                    // Process featured field
                    if (currentField === 'featured') {
                        const featuredValue = fieldContent.trim().toLowerCase();
                        currentEntry.featured = featuredValue === 'true';
                    }
                    
                    currentField = null;
                    fieldContent = '';
                    bracketCount = 0;
                }
            }
        }
    }

    // Add the last entry if it wasn't already added
    if (currentEntry) {
        if (currentField && fieldContent) {
            currentEntry.fields[currentField] = fieldContent.trim();
            
            // Process keywords field to extract tags
            if (currentField === 'keywords') {
                const keywordsStr = fieldContent.trim();
                const keywords = keywordsStr
                    .split(',')
                    .map(k => k.trim())
                    .filter(k => k.length > 0);
                currentEntry.tags = keywords;
            }
            
            // Process featured field
            if (currentField === 'featured') {
                const featuredValue = fieldContent.trim().toLowerCase();
                currentEntry.featured = featuredValue === 'true';
            }
        }
        entries.push(currentEntry);
    }

    return entries;
}

// Function to fetch and parse a BibTeX file
async function loadBibTeXFile(personName) {
    // The personName is directly used as the filename
    const fileName = `${personName}.bib`;

    try {
        const response = await fetch(`content/people/bibs/${encodeURIComponent(fileName)}`);
        if (!response.ok) {
            console.error(`Failed to load BibTeX file: ${fileName}`, response.statusText);
            return [];
        }

        const bibText = await response.text();
        return await parseBibTeX(bibText);
    } catch (e) {
        console.error(`Error loading or parsing BibTeX file: ${fileName}`, e);
        return [];
    }
}

// Function to render publications
async function renderPublications(containerId, personName, featuredOnly = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Show loading indicator
    container.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading publications...</p>
        </div>
    `;

    // Load BibTeX entries
    const entries = await loadBibTeXFile(personName);

    // Clear the container
    container.innerHTML = '';

    if (entries.length === 0) {
        container.innerHTML = `<p class="no-publications">No publications found.</p>`;
        return;
    }

    // Filter for featured publications if requested
    let filteredEntries = entries;
    if (featuredOnly) {
        filteredEntries = entries.filter(entry => entry.featured === true);
        
        if (filteredEntries.length === 0) {
            container.innerHTML = `<p class="no-publications">No featured publications found.</p>`;
            return;
        }
    }

    // Sort entries by year (newest first)
    filteredEntries.sort((a, b) => {
        const yearA = parseInt(a.fields.year || '0');
        const yearB = parseInt(b.fields.year || '0');
        return yearB - yearA;
    });

    // Group entries by year
    const entriesByYear = {};
    filteredEntries.forEach(entry => {
        const year = entry.fields.year || 'Unknown';
        if (!entriesByYear[year]) {
            entriesByYear[year] = [];
        }
        entriesByYear[year].push(entry);
    });

    // Create a publication list
    const publicationList = document.createElement('div');
    publicationList.className = 'publications-list';

    // Add publications by year
    Object.keys(entriesByYear)
        .sort((a, b) => b.localeCompare(a)) // Sort years in descending order
        .forEach(year => {
            const yearSection = document.createElement('div');
            yearSection.className = 'publication-year';

            const yearHeading = document.createElement('h3');
            yearHeading.textContent = year;
            yearSection.appendChild(yearHeading);

            const yearList = document.createElement('ul');

            entriesByYear[year].forEach(entry => {
                const item = document.createElement('li');
                item.className = 'publication-item';

                // Set data attributes for filtering using the parsed tags
                if (entry.tags && entry.tags.length > 0) {
                    item.dataset.topics = entry.tags.join(',');
                }

                // Format the publication based on its type
                // Format authors
                let authors = entry.fields.author || '';
                authors = authors.replace(/\\myname{([^}]+)}/g, 'Bagdasarian, Eugene');
                authors = authors.replace(/ and /g, ', ');

                // Highlight the person's name
                // Split the name into parts to look for first and last name
                const nameParts = personName.split(' ');
                const lastName = nameParts[nameParts.length - 1];
                const firstName = nameParts[0];

                // Highlight the author's name in the citation
                authors = authors.replace(new RegExp(`${lastName}(,)?\\s*${firstName}`, 'i'),
                    `<strong>${lastName}$1 ${firstName}</strong>`);

                // Common publication info
                const title = entry.fields.title || 'Unknown Title';
                const venue = entry.fields.booktitle || entry.fields.journal || '';
                const publisher = entry.fields.publisher || '';
                const pages = entry.fields.pages || '';
                const doi = entry.fields.doi || '';
                const url = entry.fields.url || '';
                const year = entry.fields.year || '';

                // Prepare tags HTML if there are tags
                let tagsHTML = '';
                if (entry.tags && entry.tags.length > 0) {
                    tagsHTML = `
                        <div class="publication-tags">
                            ${entry.tags.map(tag => `<span class="publication-tag">${tag}</span>`).join(' ')}
                        </div>
                    `;
                }

                // Create publication entry with more detailed information
                const entryHTML = `
                    <div class="publication-entry ${entry.featured ? 'featured-publication' : ''}">
                        <div class="publication-citation">
                            <span class="publication-authors">${authors}</span>.
                            "<span class="publication-title">${title}</span>".
                            ${venue ? `<span class="publication-journal">${venue}</span>.` : ''}
                            ${publisher ? ` ${publisher}.` : ''}
                            ${pages ? ` Pages ${pages}.` : ''}
                            ${year ? ` ${year}.` : ''}
                        </div>
                        ${tagsHTML}
                        <div class="publication-links">
                            ${doi ? `<a href="https://doi.org/${doi}" class="publication-link" target="_blank"><i class="fas fa-external-link-alt"></i> DOI</a>` : ''}
                            ${url ? `<a href="${url}" class="publication-link" target="_blank"><i class="fas fa-file-pdf"></i> PDF</a>` : ''}
                            <a href="javascript:void(0)" class="publication-link show-bibtex" data-key="${entry.key}"><i class="fas fa-code"></i> BibTeX</a>
                        </div>
                        <div class="bibtex-content" id="bibtex-${entry.key}">
@${entry.type}{${entry.key},
${Object.entries(entry.fields).map(([k, v]) => `  ${k} = {${v}}`).join(',\n')}
}
                        </div>
                    </div>
                `;

                item.innerHTML = entryHTML;
                yearList.appendChild(item);
            });

            yearSection.appendChild(yearList);
            publicationList.appendChild(yearSection);
        });

    container.appendChild(publicationList);

    // Add event listeners for showing/hiding BibTeX
    document.querySelectorAll('.show-bibtex').forEach(button => {
        button.addEventListener('click', function() {
            const key = this.getAttribute('data-key');
            const bibtexElem = document.getElementById(`bibtex-${key}`);
            if (bibtexElem) {
                if (bibtexElem.style.display === 'block') {
                    bibtexElem.style.display = 'none';
                    this.innerHTML = '<i class="fas fa-code"></i> BibTeX';
                } else {
                    bibtexElem.style.display = 'block';
                    this.innerHTML = '<i class="fas fa-times"></i> Hide BibTeX';
                }
            }
        });
    });
}

// Function to search publications
function searchPublications() {
    const searchText = document.getElementById('publication-search')?.value.toLowerCase() || '';
    const yearFilter = document.getElementById('year-filter')?.value || 'all';
    const topicFilter = document.getElementById('topic-filter')?.value || 'all';

    const publicationItems = document.querySelectorAll('.publication-item');
    const yearSections = document.querySelectorAll('.publication-year');

    // Apply filters
    publicationItems.forEach(item => {
        const itemText = item.textContent.toLowerCase();
        const itemYear = item.closest('.publication-year')?.querySelector('h3')?.textContent || '';
        const itemTopics = item.dataset.topics ? item.dataset.topics.split(',') : [];

        // Check if the item matches all filters
        const matchesSearch = !searchText || itemText.includes(searchText);
        const matchesYear = yearFilter === 'all' || itemYear === yearFilter;
        const matchesTopic = topicFilter === 'all' ||
                            (itemTopics.length > 0 && itemTopics.includes(topicFilter));

        // Show or hide based on filters
        item.style.display = (matchesSearch && matchesYear && matchesTopic) ? 'block' : 'none';
    });

    // Hide year sections with no visible items
    yearSections.forEach(section => {
        const visibleItems = section.querySelectorAll('.publication-item[style="display: block"]');
        section.style.display = visibleItems.length > 0 ? 'block' : 'none';
    });
}

// Function to populate topic filter options from publication tags
function populateTopicFilterOptions() {
    const topicFilter = document.getElementById('topic-filter');
    if (!topicFilter) return;
    
    // Get all unique tags from publications
    const tags = new Set();
    document.querySelectorAll('.publication-item').forEach(item => {
        if (item.dataset.topics) {
            const itemTopics = item.dataset.topics.split(',');
            itemTopics.forEach(topic => tags.add(topic.trim()));
        }
    });
    
    // Sort tags alphabetically
    const sortedTags = Array.from(tags).sort();
    
    // Clear existing options except 'all'
    while (topicFilter.options.length > 1) {
        topicFilter.remove(1);
    }
    
    // Add tags as options
    sortedTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1); // Capitalize first letter
        topicFilter.appendChild(option);
    });
}

// Export publications as BibTeX
async function exportBibTeX() {
    try {
        // Fetch the raw BibTeX file
        const response = await fetch('content/people/bibs/Eugene Bagdasarian.bib');
        if (!response.ok) {
            throw new Error(`Failed to load BibTeX file: ${response.statusText}`);
        }

        const bibtexContent = await response.text();

        // Download as file
        const blob = new Blob([bibtexContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'publications.bib';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting BibTeX:', error);
        alert('Failed to export BibTeX file. Please try again later.');
    }
}

// Function to initialize all dynamic content based on current page
async function initDynamicContent() {
    // Load YAML data
    // await Promise.all([
    //     loadYamlData('people.yaml'),
    //     loadYamlData('artifacts.yaml')
    // ]);

    // Detect current page
    // const currentPath = window.location.pathname.split('/').pop() || 'index.html';


    if (document.getElementById('news-grid-container')) {
        renderMixedNewsEvents('news-grid-container');
    }

    if (currentPath === 'publications.html') {
        // Publications page
        if (document.getElementById('all-publications-container')) {
            // Load Eugene's publications as default
            await renderPublications('all-publications-container', 'Eugene Bagdasarian');
            
            // Populate topic filter options after publications are loaded
            populateTopicFilterOptions();
            
            // Set up search functionality
            const searchInput = document.getElementById('publication-search');
            const yearFilter = document.getElementById('year-filter');
            const topicFilter = document.getElementById('topic-filter');
            
            if (searchInput) {
                searchInput.addEventListener('input', searchPublications);
            }
            
            if (yearFilter) {
                yearFilter.addEventListener('change', searchPublications);
            }
            
            if (topicFilter) {
                topicFilter.addEventListener('change', searchPublications);
            }
        }

        if (document.getElementById('featured-publications-container')) {
            // For featured publications section, only display those marked with featured=true
            renderPublications('featured-publications-container', 'Eugene Bagdasarian', true);
        }

        // Set up export button
        const exportButton = document.getElementById('export-bibtex');
        if (exportButton) {
            exportButton.addEventListener('click', exportBibTeX);
        }
    }
}

// Initialize all dynamic content
initDynamicContent().catch(err => {
    console.error('Error initializing dynamic content:', err);
});