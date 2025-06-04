// Function to render mixed news and events for landing page
async function renderMixedNewsEvents(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Show loading indicator
    container.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading news and events...</p>
        </div>
    `;

    const artifactsData = await loadYamlData('artifacts.yaml');
    if (!artifactsData || !artifactsData.artifacts || artifactsData.artifacts.length === 0) {
        console.error('Artifacts data not found or empty');
        container.innerHTML = '<p>No news or events available at this time.</p>';
        return;
    }

    // Filter for news and events only
    const newsItems = artifactsData.artifacts.filter(item => item.category === 'news');
    const eventItems = artifactsData.artifacts.filter(item => item.category === 'event');

    // Sort each category by date (newest first)
    newsItems.sort((a, b) => {
        if (!a.start_datetime) return 1;
        if (!b.start_datetime) return -1;
        return new Date(b.start_datetime) - new Date(a.start_datetime);
    });

    eventItems.sort((a, b) => {
        if (!a.start_datetime) return 1;
        if (!b.start_datetime) return -1;
        return new Date(b.start_datetime) - new Date(a.start_datetime);
    });

    // Take the 2 latest from each category
    const latestNews = newsItems.slice(0, 2);
    const latestEvents = eventItems.slice(0, 2);

    // Combine and sort by date again
    const combinedItems = [...latestNews, ...latestEvents];
    combinedItems.sort((a, b) => {
        if (!a.start_datetime) return 1;
        if (!b.start_datetime) return -1;
        return new Date(b.start_datetime) - new Date(a.start_datetime);
    });

    // Clear existing content
    container.innerHTML = '';

    // Render each item
    combinedItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'news-card';
        itemCard.dataset.id = item.id || '';
        itemCard.dataset.category = item.category || '';

        const imagePath = getImagePath(item.image, 'content/artifacts/images/aisec_generic.svg');
        
        // Format date nicely
        let formattedDate = '';
        if (item.start_datetime) {
            const startDate = new Date(item.start_datetime);
            formattedDate = startDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }

        itemCard.innerHTML = `
            <div class="news-image">
                <img src="${imagePath}" alt="${item.name}">
                <div class="news-date">
                    <span class="category-tag ${item.category}">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                </div>
            </div>
            <div class="news-content">
                <h3 class="news-title">${item.name}</h3>
                <p class="news-meta">
                    <i class="fas fa-calendar-alt"></i> ${formattedDate}
                    ${item.location ? `<br><i class="fas fa-map-marker-alt"></i> ${item.location}` : ''}
                </p>
                <p class="news-description">${item.description.substring(0, 120)}${item.description.length > 120 ? '...' : ''}</p>
                <a href="${item.website || `whats-happening.html#${item.category === 'news' ? 'news' : 'events'}`}" class="news-link">
                    ${item.category === 'event' ? 'Learn More' : 'Read More'} <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

        container.appendChild(itemCard);
    });
}