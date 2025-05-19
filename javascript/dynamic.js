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

// Function to render researchers for various pages
async function renderPeople(containerId, filter = {}, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const peopleData = await loadYamlData('people.yaml');
    if (!peopleData || !peopleData.people || peopleData.people.length === 0) {
        console.error('People data not found or empty');
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Filter people based on provided criteria
    let filteredPeople = [...peopleData.people];

    if (filter.categories) {
        filteredPeople = filteredPeople.filter(person => {
            return person.categories &&
                person.categories.some(cat => filter.categories.includes(cat));
        });
    }

    if (filter.id) {
        filteredPeople = filteredPeople.filter(person => person.id === filter.id);
    }

    // Apply limit if specified
    if (limit && limit > 0) {
        filteredPeople = filteredPeople.slice(0, limit);
    }

    // Render each person
    filteredPeople.forEach(person => {
        const personCard = document.createElement('div');
        personCard.className = 'researcher-card';

        const imagePath = getImagePath(person.image);

        personCard.innerHTML = `
                <div class="researcher-photo">
                    <img src="${imagePath}" alt="${person.name}" class="researcher-image">
                </div>
                <h3>${person.name}</h3>
                <p class="researcher-title">${person.ais_title || person.position}</p>
                <p class="researcher-bio">${person.description.substring(0, 100)}${person.description.length > 100 ? '...' : ''}</p>
                ${person.website ? `<a href="${person.website}" class="researcher-link" target="_blank">Profile</a>` : ''}
            `;
        container.appendChild(personCard);
    });
}

// Function to render team members with more detailed information
async function renderTeamMembers(containerId, categorySection) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const peopleData = await loadYamlData('people.yaml');
    if (!peopleData || !peopleData.people || peopleData.people.length === 0) {
        console.error('People data not found or empty');
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Get unique categories and sort them by importance
    const categoryOrder = ["Leadership", "Faculty", "Postdoctoral Researcher", "Graduate Student", "Research Fellow", "Staff", "Undergraduate Student"]; // "Advisory Board"
    let categories = [];

    if (categorySection) {
        // If a specific category section is requested
        categories = [categorySection];
    } else {
        // Otherwise build all categories
        peopleData.people.forEach(person => {
            if (person.categories) {
                person.categories.forEach(cat => {
                    if (!categories.includes(cat)) {
                        categories.push(cat);
                    }
                });
            }
        });

        // Sort categories according to preferred order
        categories.sort((a, b) => {
            return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
        });
    }

    // Render each category section
    categories.forEach(category => {
        // Filter people in this category
        const categoryPeople = peopleData.people.filter(person => {
            return person.categories && person.categories.includes(category);
        });

        if (categoryPeople.length === 0) return;

        // Create category section heading if showing all categories
        if (!categorySection) {
            const categoryHeading = document.createElement('h3');
            categoryHeading.className = 'team-category';
            categoryHeading.textContent = category;
            container.appendChild(categoryHeading);
        }

        // Create grid for this category
        const categoryGrid = document.createElement('div');
        categoryGrid.className = 'team-grid';

        // Render each person in this category
        categoryPeople.forEach(person => {
            const personCard = document.createElement('div');
            personCard.className = 'team-member';

            const imagePath = getImagePath(person.image);

            personCard.innerHTML = `
                    <div class="member-photo">
                        <img src="${imagePath}" alt="${person.name}">
                    </div>
                    <div class="member-info">
                        <h4>${person.name}</h4>
                        <p class="member-title">${person.ais_title || person.position}</p>
                        <p class="member-bio">${person.description}</p>
                        <div class="member-links">
                            ${person.email ? `<a href="mailto:${person.email}" class="member-link"><i class="fas fa-envelope"></i> Email</a>` : ''}
                            ${person.website ? `<a href="${person.website}" class="member-link" target="_blank"><i class="fas fa-globe"></i> Website</a>` : ''}
                        </div>
                        ${person.interests && person.interests.length > 0 ?
                    `<div class="member-interests">
                                <span class="interests-label">Research Interests: </span>
                                ${person.interests.map(interest => `<span class="interest-tag">${interest}</span>`).join(' ')}
                            </div>` : ''}
                    </div>
                `;
            categoryGrid.appendChild(personCard);
        });

        container.appendChild(categoryGrid);
    });
}

// Function to render artifacts (news, events, etc.)
async function renderArtifacts(containerId, filter = {}, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const artifactsData = await loadYamlData('artifacts.yaml');
    if (!artifactsData || !artifactsData.artifacts || artifactsData.artifacts.length === 0) {
        console.error('Artifacts data not found or empty');
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Filter artifacts based on provided criteria
    let filteredArtifacts = [...artifactsData.artifacts];

    if (filter.category) {
        filteredArtifacts = filteredArtifacts.filter(item =>
            item.category === filter.category);
    }

    if (filter.status) {
        filteredArtifacts = filteredArtifacts.filter(item =>
            item.status === filter.status);
    }

    if (filter.id) {
        filteredArtifacts = filteredArtifacts.filter(item =>
            item.id === filter.id);
    }

    // Sort artifacts by start_datetime, newest first
    filteredArtifacts.sort((a, b) => {
        // Handle missing dates
        if (!a.start_datetime) return 1;
        if (!b.start_datetime) return -1;
        return new Date(b.start_datetime) - new Date(a.start_datetime);
    });

    // Apply limit if specified
    if (limit && limit > 0) {
        filteredArtifacts = filteredArtifacts.slice(0, limit);
    }

    // Determine if we're on the landing page
    const isLandingPage = container.classList.contains('news-grid');

    // Render each artifact
    filteredArtifacts.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = isLandingPage ? 'news-card' : 'artifact-card';
        itemCard.dataset.id = item.id || '';
        itemCard.dataset.category = item.category || '';

        const imagePath = getImagePath(item.image, 'content/pic_placeholder.jpg');

        // Format date nicely
        let formattedDate = '';
        if (item.start_datetime) {
            const startDate = new Date(item.start_datetime);
            formattedDate = startDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        if (isLandingPage) {
            // Landing page style
            itemCard.innerHTML = `
                    <img src="${imagePath}" alt="${item.name}" class="news-image">
                    <div class="news-content">
                        <h3 class="news-title">${item.name}</h3>
                        <p class="news-date">${formattedDate}</p>
                        <p class="news-description">${item.description.substring(0, 100)}...</p>
                        <a href="${item.website || `whats-happening.html#${item.category === 'news' ? 'news' : item.category === 'event' ? 'events' : 'seminars'}`}" class="news-link">Read More <i class="fas fa-arrow-right"></i></a>
                    </div>
                `;
        } else {
            // Whats-happening page style
            itemCard.innerHTML = `
                    <div class="artifact-image">
                        <img src="${imagePath}" alt="${item.name}">
                        ${formattedDate ? `<div class="artifact-date">${formattedDate}</div>` : ''}
                    </div>
                    <div class="artifact-content">
                        <span class="artifact-tag">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        ${item.location ? `<p class="artifact-location"><i class="fas fa-map-marker-alt"></i> ${item.location}</p>` : ''}
                        ${item.website ? `<a href="${item.website}" class="artifact-link">Learn More</a>` : ''}
                    </div>
                `;
        }

        container.appendChild(itemCard);
    });
}

// Function to render courses
async function renderCourses(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const artifactsData = await loadYamlData('artifacts.yaml');
    if (!artifactsData || !artifactsData.artifacts || artifactsData.artifacts.length === 0) {
        console.error('Artifacts data not found or empty');
        return;
    }

    // Filter for courses
    const courses = artifactsData.artifacts.filter(item => item.category === 'course');
    if (courses.length === 0) {
        console.error('No courses found in artifacts data');
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Create a list for courses
    const coursesList = document.createElement('ul');
    coursesList.className = 'program-list';

    // Add each course to the list
    courses.forEach(course => {
        const courseItem = document.createElement('li');
        courseItem.textContent = course.name;
        coursesList.appendChild(courseItem);
    });

    container.appendChild(coursesList);
}

// Function to render graduate program director for the join page
async function renderGradProgramDirector(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const peopleData = await loadYamlData('people.yaml');
    if (!peopleData || !peopleData.people || peopleData.people.length === 0) {
        console.error('People data not found or empty');
        return;
    }

    // Find Michael Chen or any person with Associate Director title
    const director = peopleData.people.find(person =>
        person.id === 'mchen' || person.ais_title === 'Associate Director');

    if (!director) {
        console.error('Graduate Program Director not found in people data');
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Create the advisor info structure
    const advisorContent = document.createElement('div');
    advisorContent.className = 'contact-advisor';

    const imagePath = getImagePath(director.image);

    advisorContent.innerHTML = `
            <div class="advisor-photo">
                <img src="${imagePath}" alt="${director.name}">
            </div>
            <div class="advisor-info">
                <h3>Questions About Graduate Programs?</h3>
                <p>Contact our Graduate Program Director:</p>
                <h4>${director.name}</h4>
                <p><i class="fas fa-envelope"></i> ${director.email}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${director.office || 'CS Building'}</p>
                <p><i class="fas fa-clock"></i> Office Hours: Tuesdays and Thursdays, 2-4 PM</p>
            </div>
        `;

    container.appendChild(advisorContent);
}

// Function to render undergraduate program coordinator for the join page
async function renderUndergradProgramCoordinator(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const peopleData = await loadYamlData('people.yaml');
    if (!peopleData || !peopleData.people || peopleData.people.length === 0) {
        console.error('People data not found or empty');
        return;
    }

    // Find Emily Rodriguez or any person with Education Director title
    const coordinator = peopleData.people.find(person =>
        person.ais_title === 'Education Director');

    if (!coordinator) {
        console.error('Undergraduate Program Coordinator not found in people data');
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Create the advisor info structure
    const advisorContent = document.createElement('div');
    advisorContent.className = 'contact-advisor';

    const imagePath = getImagePath(coordinator.image);

    advisorContent.innerHTML = `
            <div class="advisor-photo">
                <img src="${imagePath}" alt="${coordinator.name}">
            </div>
            <div class="advisor-info">
                <h3>Questions About Undergraduate Opportunities?</h3>
                <p>Contact our Undergraduate Program Coordinator:</p>
                <h4>${coordinator.name}</h4>
                <p><i class="fas fa-envelope"></i> ${coordinator.email}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${coordinator.office || 'CS Building'}</p>
                <p><i class="fas fa-clock"></i> Office Hours: Mondays and Wednesdays, 1-3 PM</p>
            </div>
        `;

    container.appendChild(advisorContent);
}

// Function to render advisory board members
async function renderAdvisoryBoard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const peopleData = await loadYamlData('people.yaml');
    if (!peopleData || !peopleData.people || peopleData.people.length === 0) {
        console.error('People data not found or empty');
        return;
    }

    // Filter for advisory board members
    const advisoryMembers = peopleData.people.filter(person =>
        person.categories && person.categories.includes('Advisory Board'));

    if (advisoryMembers.length === 0) {
        console.error('No advisory board members found in people data');
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Create the advisors grid
    const advisorsGrid = document.createElement('div');
    advisorsGrid.className = 'advisors-grid';

    // Render each advisory board member
    advisoryMembers.forEach(advisor => {
        const advisorCard = document.createElement('div');
        advisorCard.className = 'advisor';

        const imagePath = getImagePath(advisor.image);

        advisorCard.innerHTML = `
                <div class="advisor-photo">
                    <img src="${imagePath}" alt="${advisor.name}">
                </div>
                <div class="advisor-info">
                    <h4>${advisor.name}</h4>
                    <p class="advisor-title">${advisor.position}</p>
                    <p class="advisor-bio">${advisor.description}</p>
                    ${advisor.interests && advisor.interests.length > 0 ?
                `<div class="advisor-interests">
                            ${advisor.interests.map(interest => `<span class="interest-tag">${interest}</span>`).join(' ')}
                        </div>` : ''}
                </div>
            `;

        advisorsGrid.appendChild(advisorCard);
    });

    container.appendChild(advisorsGrid);
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
        button.addEventListener('click', function () {
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
    await Promise.all([
        loadYamlData('people.yaml'),
        loadYamlData('artifacts.yaml')
    ]);

    // Detect current page
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    // Handle different pages
    if (currentPath === 'index.html' || currentPath === '') {
        // Landing page
        if (document.getElementById('researchers-grid-container')) {
            // Get a mix of Leadership, Faculty, Postdocs, and PhD Students for featured researchers
            const peopleData = await loadYamlData('people.yaml');
            if (peopleData && peopleData.people) {
                // Order people according to our priorities
                const orderedCategories = ["Leadership", "Faculty", "Postdoctoral Researcher", "Graduate Student"];
                const orderedPeople = [];

                // Add people in the specified order of categories
                orderedCategories.forEach(category => {
                    const categoryPeople = peopleData.people.filter(person =>
                        person.categories && person.categories.includes(category));
                    orderedPeople.push(...categoryPeople);
                });

                // Replace the people array with our ordered version
                peopleData.people = orderedPeople;

                // Store back in cache to ensure renderPeople uses this ordered data
                dataCache.people = peopleData;
            }

            // Now render the top 4 people from our ordered list
            renderPeople('researchers-grid-container', {}, 4);
        }

        if (document.getElementById('news-grid-container')) {
            renderArtifacts('news-grid-container', {}, 3);
        }
    }
    else if (currentPath === 'who-we-are.html') {
        // Who We Are page
        if (document.getElementById('team-container')) {
            renderTeamMembers('team-container');
        }

        // Render the advisory board section
        const advisoryContainer = document.querySelector('#advisory .advisors-grid');
        if (advisoryContainer) {
            renderAdvisoryBoard('advisory .advisors-grid');
        }
    }
    else if (currentPath === 'whats-happening.html') {
        // What's Happening page
        if (document.getElementById('news-container')) {
            renderArtifacts('news-container', { category: 'news' });
        }

        if (document.getElementById('events-container')) {
            renderArtifacts('events-container', { category: 'event' });
        }

        if (document.getElementById('seminars-container')) {
            renderArtifacts('seminars-container', { category: 'seminar' });
        }
    }
    else if (currentPath === 'what-we-do.html') {
        // What We Do page
        if (document.getElementById('projects-container')) {
            renderArtifacts('projects-container', { category: 'project' });
        }

        if (document.getElementById('courses-container')) {
            renderCourses('courses-container');
        }
    }
    else if (currentPath === 'join.html') {
        // Join Us page
        if (document.getElementById('grad-program-director-container')) {
            renderGradProgramDirector('grad-program-director-container');
        }

        if (document.getElementById('undergrad-program-coordinator-container')) {
            renderUndergradProgramCoordinator('undergrad-program-coordinator-container');
        }
    }
    else if (currentPath === 'publications.html') {
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