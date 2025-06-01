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

// Function to render featured publications
async function renderFeaturedPublications() {
    const container = document.getElementById('publications-content');
    if (!container) return;

    // Show loading indicator
    container.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading featured publications...</p>
        </div>
    `;

    try {
        // Load the YAML data
        const data = await loadYamlData('what-we-do.yaml');
        if (!data || !data.featured_publications) {
            container.innerHTML = '<p>Featured publications not available at this time.</p>';
            return;
        }

        // Clear loading indicator
        container.innerHTML = '';

        const publications = data.featured_publications;

        // Create publications content with horizontal layout
        const publicationsContent = document.createElement('div');
        publicationsContent.className = 'featured-publications';

        publicationsContent.innerHTML = `
            <h3>Featured Publications</h3>
            <div class="publications-list">
                ${publications.publications.map(pub => `
                    <div class="publication-item">
                        <div class="publication-content">
                            <h4>${pub.title}</h4>
                            <p class="publication-authors">${pub.authors}</p>
                            <p class="publication-venue">${pub.venue} (${pub.year})</p>
                            <p class="publication-description">${pub.description}</p>
                        </div>
                        <div class="publication-link-container">
                            <a href="${pub.link}" class="publication-link">Read More <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="view-all-container">
                <a href="publications.html" class="view-all-button">View All Publications</a>
            </div>
        `;

        container.appendChild(publicationsContent);
    } catch (error) {
        console.error('Error rendering featured publications:', error);
        container.innerHTML = '<p>Failed to load featured publications. Please try again later.</p>';
    }
}

// Function to render outreach activities
async function renderOutreach() {
    const container = document.getElementById('outreach-content');
    if (!container) return;

    // Show loading indicator
    container.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading outreach activities...</p>
        </div>
    `;

    try {
        // Load the YAML data
        const data = await loadYamlData('what-we-do.yaml');
        if (!data || !data.outreach) {
            container.innerHTML = '<p>Outreach content not available at this time.</p>';
            return;
        }

        // Clear loading indicator
        container.innerHTML = '';

        const outreach = data.outreach;

        // Create outreach content with horizontal layout
        const outreachContent = document.createElement('div');
        outreachContent.className = 'outreach-content';

        outreachContent.innerHTML = `
            <div class="outreach-intro">
                <p>${outreach.description}</p>
            </div>
            <div class="outreach-activities">
                ${outreach.activities.map(activity => `
                    <div class="outreach-activity">
                        <div class="activity-icon">
                            <i class="${activity.icon}"></i>
                        </div>
                        <h3>${activity.title}</h3>
                        <p>${activity.description}</p>
                        <a href="${activity.link}" class="learn-more">${activity.link_text} <i class="fas fa-arrow-right"></i></a>
                    </div>
                `).join('')}
            </div>
        `;
        // <div class="impact-metrics">
        //     ${outreach.metrics.map(metric => `
        //         <div class="metric">
        //             <span class="metric-number">${metric.number}</span>
        //             <span class="metric-label">${metric.label}</span>
        //         </div>
        //     `).join('')}
        // </div>

        container.appendChild(outreachContent);
    } catch (error) {
        console.error('Error rendering outreach:', error);
        container.innerHTML = '<p>Failed to load outreach content. Please try again later.</p>';
    }
}

// Function to render resources
async function renderResources() {
    const container = document.getElementById('resources-content');
    if (!container) return;

    // Show loading indicator
    container.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading resources...</p>
        </div>
    `;

    try {
        // Load the YAML data
        const data = await loadYamlData('what-we-do.yaml');
        if (!data || !data.resources) {
            container.innerHTML = '<p>Resources not available at this time.</p>';
            return;
        }

        // Clear loading indicator
        container.innerHTML = '';

        const resources = data.resources;

        // Create resources content with horizontal grid layout
        const resourcesContent = document.createElement('div');
        resourcesContent.className = 'resources-content';

        resourcesContent.innerHTML = `
            <div class="resources-intro">
                <p>${resources.description}</p>
            </div>
            <div class="resources-grid">
                ${resources.categories.map(category => `
                    <div class="resource-card">
                        <div class="resource-icon">
                            <i class="${category.icon}"></i>
                        </div>
                        <h3>${category.title}</h3>
                        <p>${category.description}</p>
                        <a href="${category.link}" class="resource-link">${category.link_text} <i class="fas fa-arrow-right"></i></a>
                    </div>
                `).join('')}
            </div>
        `;

        container.appendChild(resourcesContent);
    } catch (error) {
        console.error('Error rendering resources:', error);
        container.innerHTML = '<p>Failed to load resources. Please try again later.</p>';
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

// Initialize the What We Do page
function initWhatWeDoPage() {
    // Load all content sections
    renderMission();
    renderResearch();
    renderFeaturedPublications();
    // renderOutreach();
    // renderResources();

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
document.addEventListener('DOMContentLoaded', initWhatWeDoPage);
