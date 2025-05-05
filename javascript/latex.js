const publications = [
    {
        id: "Dax2024",
        authors: ["Dax, Victoria M.", "Li, Jiachen", "Sachdeva, Enna", "Agarwal, Nakul", "Kochenderfer, Mykel J."],
        title: "Disentangled Neural Relational Inference for Interpretable Motion Prediction",
        journal: "IEEE Robotics and Automation Letters",
        year: 2024,
        volume: 9,
        number: 2,
        pages: "1452-1459",
        doi: "10.1109/lra.2023.3342554",
        url: "https://arxiv.org/abs/2401.03599",
        topics: ["interpretability", "motion prediction"]
    },
    {
        id: "Smith2023",
        authors: ["Smith, John", "Johnson, Emily", "Williams, Robert"],
        title: "Robust Alignment Methods for Large Language Models",
        journal: "Conference on Neural Information Processing Systems (NeurIPS)",
        year: 2023,
        pages: "4521-4533",
        url: "https://arxiv.org/abs/2305.12345",
        topics: ["alignment", "language models"]
    },
    {
        id: "Chen2023",
        authors: ["Chen, Sarah", "Rodriguez, Michael", "Wilson, James"],
        title: "Governance Frameworks for Advanced AI Systems",
        journal: "AI Policy and Governance Journal",
        year: 2023,
        volume: 5,
        number: 3,
        pages: "78-95",
        doi: "10.1109/aipg.2023.1234567",
        topics: ["governance", "policy"]
    },
    {
        id: "Johnson2022",
        authors: ["Johnson, Emily", "Brown, Thomas", "Garcia, Maria"],
        title: "Interpretability Techniques for Deep Reinforcement Learning",
        journal: "International Conference on Machine Learning (ICML)",
        year: 2022,
        pages: "2145-2158",
        url: "https://arxiv.org/abs/2201.54321",
        topics: ["interpretability", "reinforcement learning"]
    }
];

function formatAuthors(authors) {
    return authors.join('; ').replace(/; ([^;]*)$/, '; and $1');
}

function renderPublications(containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Determine if we're on the what-we-do page based on the container's parent classes
    const isWhatWeDoPage = container.closest('.featured-publications') &&
        !container.closest('.page-container');

    // Sort by year (newest first)
    const sortedPubs = [...publications].sort((a, b) => b.year - a.year);

    // Apply limit if specified
    const pubsToRender = limit ? sortedPubs.slice(0, limit) : sortedPubs;

    pubsToRender.forEach(pub => {
        const pubElement = document.createElement('div');
        pubElement.className = 'publication-entry';

        // Create citation with standard styling
        const citation = document.createElement('p');
        citation.className = 'publication-citation';
        citation.innerHTML = `
            <span class="publication-authors">${formatAuthors(pub.authors)}</span>
            <span class="publication-title">${pub.title}.</span>
            <span class="publication-journal">${pub.journal}</span>${pub.volume ? `, <span class="publication-volume">${pub.volume}</span>` : ''}${pub.number ? `(<span class="publication-number">${pub.number}</span>)` : ''}: 
            <span class="publication-pages">${pub.pages}</span>.
            <span class="publication-year">${pub.year}</span>.
        `;

        // Create links
        const links = document.createElement('div');
        links.className = 'publication-links';
        links.innerHTML = `
            ${pub.doi ? `<a href="https://doi.org/${pub.doi}" class="publication-link">doi</a>` : ''}
            ${pub.url ? `<a href="${pub.url}" class="publication-link">link</a>` : ''}
            <a href="#" class="publication-link bibtex-toggle" data-target="bibtex-${pub.id}">bibtex</a>
        `;

        // Create BibTeX
        const bibtex = document.createElement('pre');
        bibtex.className = 'bibtex-content';
        bibtex.id = `bibtex-${pub.id}`;
        bibtex.textContent = `@Article{${pub.id},
  author  = {${pub.authors.join(' and ')}},
  journal = {${pub.journal}},
  title   = {${pub.title}},
  year    = {${pub.year}},${pub.number ? `\n  number  = {${pub.number}},` : ''}
  pages   = {${pub.pages}},${pub.volume ? `\n  volume  = {${pub.volume}},` : ''}${pub.doi ? `\n  doi     = {${pub.doi}},` : ''}${pub.url ? `\n  url     = {${pub.url}},` : ''}
}`;

        pubElement.appendChild(citation);
        pubElement.appendChild(links);
        pubElement.appendChild(bibtex);
        container.appendChild(pubElement);
    });
}

// Simple search function for publications
function searchPublications() {
    const searchInput = document.getElementById('publication-search').value.toLowerCase();
    const yearFilter = document.getElementById('year-filter').value;
    const topicFilter = document.getElementById('topic-filter').value;
    const publicationElements = document.querySelectorAll('.publication-entry');

    publicationElements.forEach((pub, index) => {
        const pubData = publications[index];
        const text = pub.textContent.toLowerCase();

        const yearMatch = yearFilter === 'all' || pubData.year.toString() === yearFilter;
        const topicMatch = topicFilter === 'all' || (pubData.topics && pubData.topics.includes(topicFilter));
        const searchMatch = searchInput === '' || text.includes(searchInput);

        if (yearMatch && topicMatch && searchMatch) {
            pub.style.display = 'block';
        } else {
            pub.style.display = 'none';
        }
    });
}

// Add this function to allow exporting all BibTeX entries
function exportAllBibTeX() {
    let bibtexContent = '';
    publications.forEach(pub => {
        bibtexContent += `@Article{${pub.id},
  author  = {${pub.authors.join(' and ')}},
  journal = {${pub.journal}},
  title   = {${pub.title}},
  year    = {${pub.year}},${pub.number ? `\n  number  = {${pub.number}},` : ''}
  pages   = {${pub.pages}},${pub.volume ? `\n  volume  = {${pub.volume}},` : ''}${pub.doi ? `\n  doi     = {${pub.doi}},` : ''}${pub.url ? `\n  url     = {${pub.url}},` : ''}
}\n\n`;
    });

    // Create a downloadable file
    const blob = new Blob([bibtexContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'publications.bib';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Render featured publications (limit to 3) for both the publications page and the what-we-do page
    const featuredContainer = document.getElementById('featured-publications-container');
    if (featuredContainer) {
        renderPublications('featured-publications-container', 3);
    }

    // Render all publications on the publications page
    const allContainer = document.getElementById('all-publications-container');
    if (allContainer) {
        renderPublications('all-publications-container');
    }

    // Add BibTeX toggle functionality
    const bibtexToggles = document.querySelectorAll('.bibtex-toggle');
    bibtexToggles.forEach(toggle => {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            const bibtexContent = document.getElementById(targetId);

            if (bibtexContent.style.display === 'block') {
                bibtexContent.style.display = 'none';
                this.textContent = 'bibtex';
            } else {
                bibtexContent.style.display = 'block';
                this.textContent = 'hide bibtex';
            }
        });
    });

    // Add export button functionality
    const exportButton = document.getElementById('export-bibtex');
    if (exportButton) {
        exportButton.addEventListener('click', exportAllBibTeX);
    }
});