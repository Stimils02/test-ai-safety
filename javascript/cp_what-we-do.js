// Function to render mission section from what-we-do.yaml
async function renderMission() {
    const container = document.getElementById('mission-content');
    if (!container) return;

    // Show loading indicator
    container.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading mission content...</p>
        </div>
    `;

    try {
        // Load the YAML data from the what-we-do.yaml file
        const data = await loadYamlData('what-we-do.yaml');
        if (!data || !data.mission) {
            container.innerHTML = '<p>Mission content not available at this time.</p>';
            return;
        }

        // Clear loading indicator
        container.innerHTML = '';

        const mission = data.mission;

        // Create mission content with preserved text
        const missionContent = document.createElement('div');
        missionContent.className = 'mission-content';

        missionContent.innerHTML = `
            <div class="mission-text">
                <p class="mission-statement">${mission.statement}</p>
                <p>${mission.description}</p>
                <p>${mission.approach}</p>
                <ul class="mission-goals">
                    ${mission.goals.map(goal => `
                        <li>
                            <i class="${goal.icon}"></i>
                            <span>${goal.text}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="mission-image">
                <img src="images/mission-illustration.png" alt="AI Safety Mission Illustration">
            </div>
        `;

        container.appendChild(missionContent);
    } catch (error) {
        console.error('Error rendering mission:', error);
        container.innerHTML = '<p>Failed to load mission content. Please try again later.</p>';
    }
}

// Function to render research areas
async function renderResearch() {
    const container = document.getElementById('research-content');
    if (!container) return;

    // Show loading indicator
    container.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading research areas...</p>
        </div>
    `;

    try {
        // Load the YAML data
        const data = await loadYamlData('what-we-do.yaml');
        if (!data || !data.research) {
            container.innerHTML = '<p>Research content not available at this time.</p>';
            return;
        }

        // Clear loading indicator
        container.innerHTML = '';

        const research = data.research;

        // Create research content with horizontal layout
        const researchContent = document.createElement('div');
        researchContent.className = 'research-content';

        researchContent.innerHTML = `
            <div class="research-intro">
                <p>${research.description}</p>
            </div>
            <div class="research-areas">
                ${research.areas.map(area => `
                    <div class="research-area">
                        <div class="research-icon">
                            <i class="${area.icon}"></i>
                        </div>
                        <h3>${area.title}</h3>
                        <p>${area.description}</p>
                        <a href="${area.link}" class="learn-more">Learn More <i class="fas fa-arrow-right"></i></a>
                    </div>
                `).join('')}
            </div>
        `;

        container.appendChild(researchContent);
    } catch (error) {
        console.error('Error rendering research:', error);
        container.innerHTML = '<p>Failed to load research content. Please try again later.</p>';
    }
}



// Function to highlight active sidebar item based on scroll position
function handleScrollSpy() {
    const sections = document.querySelectorAll('.content-section');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    let currentSectionId = '';
    let maxVisibility = 0;
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        
        let visibleHeight = 0;
        if (rect.top <= 0 && rect.bottom >= 0) {
            visibleHeight = Math.min(rect.bottom, viewportHeight);
        } else if (rect.top >= 0 && rect.top < viewportHeight) {
            visibleHeight = Math.min(viewportHeight - rect.top, rect.height);
        }
        
        const visibilityPercentage = (visibleHeight / rect.height) * 100;
        
        if (visibilityPercentage > maxVisibility) {
            maxVisibility = visibilityPercentage;
            currentSectionId = section.id;
        }
    });
    
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

// Initialize the What We Do page
async function initWhatWeDoPage() {
    // renderMission();
    // renderResearch();
    // Load featured publications with a limit of 5
    if (document.getElementById('featured-publications-container')) {
        await renderFeaturedPublications('featured-publications-container', 'Eugene Bagdasarian', 5);
    }

    // Set up sidebar item click handlers
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Set up scroll spy for sidebar
    window.addEventListener('scroll', handleScrollSpy);
    // Initial check for active section
    setTimeout(handleScrollSpy, 100);
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initWhatWeDoPage);
