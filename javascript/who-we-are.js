// Function to render team members from who-we-are.yaml
async function renderTeamMembers() {
    const container = document.getElementById('team-container');
    if (!container) return;

    // Show loading indicator
    container.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading team members...</p>
        </div>
    `;

    try {
        // Load the YAML data from the who-we-are.yaml file
        const data = await loadYamlData('who-we-are.yaml');
        if (!data || !data.people || data.people.length === 0) {
            container.innerHTML = '<p>No team members available at this time.</p>';
            return;
        }

        // Clear loading indicator
        container.innerHTML = '';

        // Get unique categories and sort them by importance
        const categoryOrder = ["Leadership", "Faculty", "Postdoctoral Researcher", "Graduate Student", "Research Fellow", "Staff", "Undergraduate Student"];
        let categories = [];
        
        // Build all categories from the people data
        data.people.forEach(person => {
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

        // Render each category section
        categories.forEach(category => {
            // Filter people in this category
            const categoryPeople = data.people.filter(person => {
                return person.categories && person.categories.includes(category);
            });

            if (categoryPeople.length === 0) return;

            // Create category section heading
            const categoryHeading = document.createElement('h3');
            categoryHeading.className = 'team-category';
            categoryHeading.textContent = category;
            container.appendChild(categoryHeading);

            // Create grid for this category
            const categoryGrid = document.createElement('div');
            categoryGrid.className = 'team-grid';

            // Render each person in this category
            categoryPeople.forEach(person => {
                const personCard = document.createElement('div');
                personCard.className = 'team-member';

                const imagePath = person.image || 'content/people/images/pic_placeholder.jpg';

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
    } catch (error) {
        console.error('Error rendering team members:', error);
        container.innerHTML = '<p>Failed to load team members. Please try again later.</p>';
    }
}

// Function to render advisory board members
async function renderAdvisoryBoard() {
    const container = document.querySelector('.advisors-grid');
    if (!container) return;

    // Show loading indicator
    container.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading advisory board members...</p>
        </div>
    `;

    try {
        // Load the YAML data
        const data = await loadYamlData('who-we-are.yaml');
        if (!data || !data.people || data.people.length === 0) {
            container.innerHTML = '<p>No advisory board members available at this time.</p>';
            return;
        }

        // Filter for advisory board members
        const advisoryMembers = data.people.filter(person =>
            person.categories && person.categories.includes('Advisory Board'));

        if (advisoryMembers.length === 0) {
            container.innerHTML = '<p>No advisory board members available at this time.</p>';
            return;
        }

        // Clear loading indicator
        container.innerHTML = '';

        // Render each advisory board member
        advisoryMembers.forEach(advisor => {
            const advisorCard = document.createElement('div');
            advisorCard.className = 'advisor';

            const imagePath = advisor.image || 'content/people/images/pic_placeholder.jpg';

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

            container.appendChild(advisorCard);
        });
    } catch (error) {
        console.error('Error rendering advisory board:', error);
        container.innerHTML = '<p>Failed to load advisory board members. Please try again later.</p>';
    }
}

// Function to render funding information
async function renderFundingInfo() {
    const majorGrantsContainer = document.querySelector('.grants-list');
    const industryPartnersContainer = document.querySelector('.partners-grid');
    const foundationsContainer = document.querySelector('.foundations-list');
    
    if (!majorGrantsContainer && !industryPartnersContainer && !foundationsContainer) return;

    try {
        // Load the YAML data
        const data = await loadYamlData('who-we-are.yaml');
        if (!data) {
            console.error('Failed to load funding data');
            return;
        }

        // Render major grants if data exists
        if (data.major_grants && majorGrantsContainer) {
            majorGrantsContainer.innerHTML = ''; // Clear existing content
            
            data.major_grants.forEach(grant => {
                const grantElement = document.createElement('div');
                grantElement.className = 'grant';
                
                grantElement.innerHTML = `
                    <div class="grant-logo">
                        <img src="${grant.logo || 'content/artifacts/images/aisec_generic.svg'}" alt="${grant.organization}">
                    </div>
                    <div class="grant-info">
                        <h4>${grant.organization}</h4>
                        <p class="grant-title">${grant.title}</p>
                        <p class="grant-amount">${grant.amount} | ${grant.period}</p>
                        <p class="grant-desc">${grant.description}</p>
                    </div>
                `;
                
                majorGrantsContainer.appendChild(grantElement);
            });
        }
        
        // Render industry partners if data exists
        if (data.industry_partners && industryPartnersContainer) {
            industryPartnersContainer.innerHTML = ''; // Clear existing content
            
            data.industry_partners.forEach(partner => {
                const partnerElement = document.createElement('div');
                partnerElement.className = 'partner';
                
                partnerElement.innerHTML = `
                    <img src="${partner.logo || 'content/artifacts/images/aisec_generic.svg'}" alt="${partner.name}">
                    <h4>${partner.name}</h4>
                `;
                
                industryPartnersContainer.appendChild(partnerElement);
            });
        }
        
        // Render foundations if data exists
        if (data.foundations && foundationsContainer) {
            foundationsContainer.innerHTML = ''; // Clear existing content
            
            data.foundations.forEach(foundation => {
                const foundationElement = document.createElement('div');
                foundationElement.className = 'foundation';
                
                foundationElement.innerHTML = `
                    <img src="${foundation.logo || 'content/artifacts/images/aisec_generic.svg'}" alt="${foundation.name}">
                    <h4>${foundation.name}</h4>
                `;
                
                foundationsContainer.appendChild(foundationElement);
            });
        }
    } catch (error) {
        console.error('Error rendering funding information:', error);
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

// Initialize the Who We Are page
function initWhoWeArePage() {
    // Load all content sections
    renderTeamMembers();
    renderFundingInfo();
    
    // If the advisory board section is present, render it
    const advisorySection = document.getElementById('advisory');
    if (advisorySection) {
        renderAdvisoryBoard();
    }

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
document.addEventListener('DOMContentLoaded', initWhoWeArePage);
