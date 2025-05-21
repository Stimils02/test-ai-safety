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
        // Load the YAML data from the whats-happening.yaml file
        const data = await loadYamlData('whats-happening.yaml');
        if (!data || !data.latest_news || data.latest_news.length === 0) {
            container.innerHTML = '<p>No news articles available at this time.</p>';
            return;
        }

        // Clear loading indicator
        container.innerHTML = '';

        // Render each news item
        data.latest_news.forEach(news => {
            const newsCard = document.createElement('div');
            newsCard.className = 'content-card';
            
            // Format the date nicely
            const newsDate = new Date(news.date);
            const formattedDate = newsDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Create the card HTML
            newsCard.innerHTML = `
                <div class="card-image">
                    <img src="${news.image || 'content/pic_placeholder.jpg'}" alt="${news.title}">
                    <div class="card-date">
                        <span class="month">${newsDate.toLocaleDateString('en-US', {month: 'short'})}</span>
                        <span class="day">${newsDate.getDate()}</span>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${news.title}</h3>
                    <p>${news.description}</p>
                    <a href="${news.link || '#'}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            `;

            container.appendChild(newsCard);
        });
    } catch (error) {
        console.error('Error rendering news:', error);
        container.innerHTML = '<p>Failed to load news articles. Please try again later.</p>';
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
        if (!data || !data.upcoming_seminars || data.upcoming_seminars.length === 0) {
            container.innerHTML = '<p>No upcoming seminars available at this time.</p>';
            return;
        }

        // Clear loading indicator
        container.innerHTML = '';

        // Render each seminar
        data.upcoming_seminars.forEach(seminar => {
            const seminarCard = document.createElement('div');
            seminarCard.className = 'content-card seminar-card';
            
            // Format the date
            const seminarDate = new Date(seminar.date);
            const formattedDate = seminarDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Create the card HTML
            seminarCard.innerHTML = `
                <div class="card-image">
                    <img src="${seminar.image || 'content/pic_placeholder.jpg'}" alt="${seminar.title}">
                    <div class="card-date">
                        <span class="month">${seminarDate.toLocaleDateString('en-US', {month: 'short'})}</span>
                        <span class="day">${seminarDate.getDate()}</span>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${seminar.title}</h3>
                    <p>${seminar.description}</p>
                    <div class="speaker">
                        <i class="fas fa-user"></i> ${seminar.speaker}
                    </div>
                    <div class="seminar-time">
                        <i class="fas fa-clock"></i> ${formattedDate}, ${seminar.time}
                    </div>
                    <div class="seminar-location">
                        <i class="fas fa-map-marker-alt"></i> ${seminar.location}
                    </div>
                    <a href="${seminar.link || '#'}" class="register-btn">Register</a>
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
        if (!data || !data.upcoming_events || data.upcoming_events.length === 0) {
            container.innerHTML = '<p>No upcoming events available at this time.</p>';
            return;
        }

        // Clear loading indicator
        container.innerHTML = '';

        // Render each event
        data.upcoming_events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'content-card event-card upcoming';
            
            // Format the date
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Create multi-day event text if applicable
            let dateText = formattedDate;
            if (event.end_date) {
                const endDate = new Date(event.end_date);
                const formattedEndDate = endDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                dateText = `${formattedDate} - ${formattedEndDate}`;
            }

            // Create the card HTML
            eventCard.innerHTML = `
                <div class="card-image">
                    <img src="${event.image || 'content/pic_placeholder.jpg'}" alt="${event.title}">
                    <div class="card-date">
                        <span class="month">${eventDate.toLocaleDateString('en-US', {month: 'short'})}</span>
                        <span class="day">${eventDate.getDate()}</span>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <div class="event-time">
                        <i class="fas fa-calendar"></i> ${dateText}
                    </div>
                    <div class="event-time">
                        <i class="fas fa-clock"></i> ${event.time}
                    </div>
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt"></i> ${event.location}
                    </div>
                    <a href="${event.link || '#'}" class="register-btn">Learn More</a>
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
