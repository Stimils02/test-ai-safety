document.addEventListener('DOMContentLoaded', function () {
    // Hero Slider Functionality
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');
    let currentSlide = 0;

    // Set first slide as current
    if (slides.length > 0) {
        slides[0].classList.add('current');
    }

    // Function to change slide
    function changeSlide(direction) {
        if (slides.length === 0) return;

        // Remove current class from current slide
        slides[currentSlide].classList.remove('current');

        // Calculate new slide index
        if (direction === 'next') {
            currentSlide = (currentSlide + 1) % slides.length;
        } else {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        }

        // Add current class to new slide
        slides[currentSlide].classList.add('current');
    }

    // Event listeners for buttons
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => changeSlide('prev'));
        nextBtn.addEventListener('click', () => changeSlide('next'));
    }

    // Auto slide change every 5 seconds
    if (slides.length > 0) {
        setInterval(() => changeSlide('next'), 5000);
    }

    // Dropdown menu for mobile
    const dropdowns = document.querySelectorAll('.dropdown');

    // Add click event for mobile devices
    if (window.innerWidth <= 768) {
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('click', function (e) {
                this.querySelector('.dropdown-content').classList.toggle('show');
                e.preventDefault();
            });
        });
    }

    // Sidebar Navigation Functionality
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('.content-section');

    if (sidebarItems.length > 0 && sections.length > 0) {
        // Function to activate sidebar item
        function activateSidebarItem(sectionId) {
            // Remove active class from all sidebar items
            sidebarItems.forEach(item => {
                item.classList.remove('active');
            });

            // Add active class to current section's sidebar item
            const activeItem = document.querySelector(`.sidebar-item[data-section="${sectionId.replace('#', '')}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
        }

        // Handle click on sidebar items
        sidebarItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault(); // Prevent default action first

                const sectionId = this.querySelector('a').getAttribute('href');
                const section = document.querySelector(sectionId);

                console.log('Sidebar item clicked:', sectionId); // Debug log

                if (section) {
                    // Activate the clicked sidebar item
                    sidebarItems.forEach(i => i.classList.remove('active'));
                    this.classList.add('active');

                    // Smooth scroll to section
                    window.scrollTo({
                        top: section.offsetTop - 100,
                        behavior: 'smooth'
                    });

                    // Update URL hash without scrolling
                    if (history.pushState) {
                        history.pushState(null, null, sectionId);
                    }
                }
            });
        });

        // Handle scroll to update active sidebar item
        window.addEventListener('scroll', function () {
            let current = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop - 200; // Adjust threshold
                const sectionHeight = section.offsetHeight;

                if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                    current = '#' + section.getAttribute('id');
                }
            });

            if (current) {
                activateSidebarItem(current);
            }
        });
    }

    // Handle initial page load with hash in URL
    if (window.location.hash) {
        const hash = window.location.hash;
        const section = document.querySelector(hash);

        if (section) {
            setTimeout(() => {
                window.scrollTo({
                    top: section.offsetTop - 100,
                    behavior: 'smooth'
                });

                // If we have sidebar navigation on this page
                const sidebarItem = document.querySelector(`.sidebar-item[data-section="${hash.substring(1)}"]`);
                if (sidebarItem) {
                    document.querySelectorAll('.sidebar-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    sidebarItem.classList.add('active');
                }
            }, 100);
        }
    }

    // Make activateTab function globally available for dropdown navigation
    window.activateTab = function (sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            setTimeout(() => {
                window.scrollTo({
                    top: section.offsetTop - 100,
                    behavior: 'smooth'
                });

                // If we have sidebar navigation
                const sidebarItem = document.querySelector(`.sidebar-item[data-section="${sectionId}"]`);
                if (sidebarItem) {
                    document.querySelectorAll('.sidebar-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    sidebarItem.classList.add('active');
                }
            }, 10);
        }
    };

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
    function getImagePath(imagePath, defaultImage = 'images/pic_placeholder.jpg') {
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
        } else if (imagePath.startsWith('artifacts/')) {
            return `content/images/${imagePath}`;
        } else {
            return `content/images/people/${imagePath}`;
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
        const categoryOrder = ["Leadership", "Faculty", "Postdoctoral Researcher", "Graduate Student", "Research Fellow", "Staff", "Undergraduate Student"];
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

            const imagePath = getImagePath(item.image, 'images/pic_placeholder.jpg');
            
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
            person.id === 'erodriguez' || person.ais_title === 'Education Director');

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
    }

    // Initialize all dynamic content
    initDynamicContent().catch(err => {
        console.error('Error initializing dynamic content:', err);
    });
});