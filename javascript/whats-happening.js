// Function to render news items from whats-happening.yaml
async function renderLatestNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    // Show loading indicator
    container.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading news articles...</p>
        </div>
    `;

    try {
        // Load the YAML data
        const data = await loadYamlData('whats-happening.yaml');
        if (!data || !data.latest_news) {
            container.innerHTML = '<p>No news available at this time.</p>';
            return;
        }

        // Clear loading indicator
        container.innerHTML = '';

        // Render news items
        data.latest_news.forEach(newsItem => {
            const newsCard = document.createElement('div');
            newsCard.className = 'content-card';

            const date = new Date(newsItem.date);
            const formattedDate = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            newsCard.innerHTML = `
                <div class="card-image">
                    <img src="${newsItem.image}" alt="${newsItem.title}">
                    <div class="card-date">
                        <span class="month">${date.toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span class="day">${date.getDate()}</span>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${newsItem.title}</h3>
                    <p>${newsItem.description}</p>
                    <a href="${newsItem.link}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            `;

            container.appendChild(newsCard);
        });
    } catch (error) {
        console.error('Error rendering news:', error);
        container.innerHTML = '<p>Failed to load news. Please try again later.</p>';
    }
}

// Function to render upcoming seminars
async function renderUpcomingSeminars() {
    const container = document.getElementById('seminars-container');
    if (!container) return;

    // Show loading indicator
    container.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading seminars...</p>
        </div>
    `;

    try {
        // Load the YAML data
        const data = await loadYamlData('whats-happening.yaml');
        if (!data || !data.upcoming_seminars) {
            container.innerHTML = '<p>No seminars available at this time.</p>';
            return;
        }

        // Clear loading indicator
        container.innerHTML = '';

        // Render seminar items
        data.upcoming_seminars.forEach(seminar => {
            const seminarCard = document.createElement('div');
            seminarCard.className = 'content-card seminar-card';

            const date = new Date(seminar.date);

            seminarCard.innerHTML = `
                <div class="card-image">
                    <img src="${seminar.image}" alt="${seminar.title}">
                    <div class="card-date">
                        <span class="month">${date.toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span class="day">${date.getDate()}</span>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${seminar.title}</h3>
                    <div class="speaker">
                        <i class="fas fa-user"></i>
                        ${seminar.speaker}
                    </div>
                    <div class="seminar-time">
                        <i class="fas fa-clock"></i>
                        ${seminar.time}
                    </div>
                    <div class="seminar-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${seminar.location}
                    </div>
                    <p>${seminar.description}</p>
                    <a href="${seminar.link}" class="register-btn">Register</a>
                </div>
            `;

            container.appendChild(seminarCard);
        });
    } catch (error) {
        console.error('Error rendering seminars:', error);
        container.innerHTML = '<p>Failed to load seminars. Please try again later.</p>';
    }
}

// Function to render upcoming events
async function renderUpcomingEvents() {
    const container = document.getElementById('events-container');
    if (!container) return;

    // Show loading indicator
    container.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading events...</p>
        </div>
    `;

    try {
        // Load the YAML data
        const data = await loadYamlData('whats-happening.yaml');
        if (!data || !data.upcoming_events) {
            container.innerHTML = '<p>No events available at this time.</p>';
            return;
        }

        // Clear loading indicator
        container.innerHTML = '';

        // Render event items
        data.upcoming_events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'content-card event-card';

            const date = new Date(event.date);

            eventCard.innerHTML = `
                <div class="card-image">
                    <img src="${event.image}" alt="${event.title}">
                    <div class="card-date">
                        <span class="month">${date.toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span class="day">${date.getDate()}</span>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${event.title}</h3>
                    <div class="event-time">
                        <i class="fas fa-clock"></i>
                        ${event.time}
                    </div>
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${event.location}
                    </div>
                    <p>${event.description}</p>
                    <a href="${event.link}" class="read-more">Learn More <i class="fas fa-arrow-right"></i></a>
                </div>
            `;

            container.appendChild(eventCard);
        });
    } catch (error) {
        console.error('Error rendering events:', error);
        container.innerHTML = '<p>Failed to load events. Please try again later.</p>';
    }
}

// Function to highlight active sidebar item based on scroll position
function handleScrollSpy() {
    const sections = document.querySelectorAll('.content-section');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    // Find which section is currently most visible in the viewport
    let currentSectionId = '';
    let maxVisibility = 0;
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        
        // Calculate how much of the section is visible (as a percentage)
        let visibleHeight = 0;
        if (rect.top <= 0 && rect.bottom >= 0) {
            // Section top is above viewport top and bottom is in viewport
            visibleHeight = Math.min(rect.bottom, viewportHeight);
        } else if (rect.top >= 0 && rect.top < viewportHeight) {
            // Section top is in viewport
            visibleHeight = Math.min(viewportHeight - rect.top, rect.height);
        }
        
        const visibilityPercentage = (visibleHeight / rect.height) * 100;
        
        if (visibilityPercentage > maxVisibility) {
            maxVisibility = visibilityPercentage;
            currentSectionId = section.id;
        }
    });
    
    // Update active sidebar item
    if (currentSectionId) {
        sidebarItems.forEach(item => {
            const sectionId = item.getAttribute('data-section');
            if (sectionId === currentSectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// Initialize whats-happening page functionality
function initWhatsHappeningPage() {
    // Load all content sections
    renderLatestNews();
    renderUpcomingSeminars();
    renderUpcomingEvents();

    // Set up sidebar item click handlers
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Set up scroll spy for sidebar
    window.addEventListener('scroll', handleScrollSpy);
    // Initial check for active section
    setTimeout(handleScrollSpy, 100);
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initWhatsHappeningPage);
