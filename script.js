document.addEventListener('DOMContentLoaded', () => {
    
    // Preloader
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }, 1000);

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggle.querySelector('i');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        htmlElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.classList.remove('ph-moon');
            themeIcon.classList.add('ph-sun');
        } else {
            themeIcon.classList.remove('ph-sun');
            themeIcon.classList.add('ph-moon');
        }
    }

    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Sticky Navbar & Active Link & Scroll To Top
    const navbar = document.querySelector('.navbar');
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id') || current;
            }
        });
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').substring(1) === current) {
                item.classList.add('active');
            }
        });
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Typing Animation
    const typingText = document.querySelector('.typing-text');
    const textArray = [
        "HTML | CSS | JavaScript",
        "React.js | Node.js | Express.js",
        "MongoDB | Full Stack Dev",
        "Creative Web Developer"
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentText = textArray[textIndex];
        if (isDeleting) {
            typingText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }
        let typeSpeed = 100;
        if (isDeleting) typeSpeed /= 2;
        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % textArray.length;
            typeSpeed = 500;
        }
        setTimeout(type, typeSpeed);
    }

    if (typingText) {
        setTimeout(type, 1000);
    }

    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.section-reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    revealElements.forEach(el => revealObserver.observe(el));

    // Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-spinner spinner-icon" style="animation: spin 1s linear infinite;"></i> Sending...';
            setTimeout(() => {
                btn.innerHTML = '<i class="ph ph-check-circle"></i> Sent Successfully!';
                btn.style.background = '#10b981';
                contactForm.reset();
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                }, 3000);
            }, 2000);
        });
    }

    // Kick off GitHub projects fetch
    fetchGithubProjects();
});


// --- GitHub Projects Configuration -------------------------------------------
const GITHUB_USERNAME = 'krisnehakri-alt';
const REPOS_PER_PAGE  = 100;
const SHOW_INITIAL    = 6;
const CACHE_KEY       = 'gh_repos_cache';
const CACHE_TTL_MS    = 10 * 60 * 1000;

const LANG_COLORS = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'HTML':       '#e34c26',
    'CSS':        '#563d7c',
    'SCSS':       '#c6538c',
    'Python':     '#3572A5',
    'Java':       '#b07219',
    'C++':        '#f34b7d',
    'C':          '#555555',
    'PHP':        '#4F5D95',
    'Ruby':       '#701516',
    'Go':         '#00ADD8',
    'Rust':       '#dea584',
    'Swift':      '#F05138',
    'Kotlin':     '#A97BFF',
    'Shell':      '#89e051',
    'Vue':        '#41b883',
};

async function fetchGithubProjects(forceRefresh = false) {
    const loadingEl = document.getElementById('projects-loading');
    const errorEl   = document.getElementById('projects-error');
    const gridEl    = document.getElementById('projects-grid');
    const viewAllEl = document.getElementById('view-all-wrapper');

    if (!loadingEl || !errorEl || !gridEl || !viewAllEl) return;

    loadingEl.style.display = 'flex';
    errorEl.style.display   = 'none';
    gridEl.style.display    = 'none';
    viewAllEl.style.display = 'none';
    gridEl.innerHTML        = '';

    try {
        let repos = null;

        if (!forceRefresh) {
            try {
                const cached = sessionStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, ts } = JSON.parse(cached);
                    if (Date.now() - ts < CACHE_TTL_MS) repos = data;
                }
            } catch (_) {}
        }

        if (!repos) {
            const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=${REPOS_PER_PAGE}&type=public`;
            const res = await fetch(url, {
                headers: { 'Accept': 'application/vnd.github.v3+json' }
            });
            if (!res.ok) throw new Error(`GitHub API ${res.status}`);
            repos = await res.json();
            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: repos, ts: Date.now() }));
            } catch (_) {}
        }

        repos = repos
            .filter(r => !r.fork)
            .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

        renderProjects(repos, gridEl, viewAllEl);

        loadingEl.style.display = 'none';
        gridEl.style.display    = 'grid';

    } catch (err) {
        console.error('GitHub fetch error:', err);
        loadingEl.style.display = 'none';
        errorEl.style.display   = 'block';
    }
}

function renderProjects(repos, gridEl, viewAllEl) {
    if (!repos.length) {
        gridEl.innerHTML = '<p style="color:var(--text-light);text-align:center;grid-column:1/-1;padding:2rem;">No public repositories found.</p>';
        return;
    }
    repos.forEach((repo, index) => {
        const card = createProjectCard(repo, index);
        if (index >= SHOW_INITIAL) card.style.display = 'none';
        gridEl.appendChild(card);
    });
    if (repos.length > SHOW_INITIAL) {
        viewAllEl.style.display = 'flex';
    }
}

function createProjectCard(repo, index) {
    const card = document.createElement('div');
    card.className = 'project-card glass-card';
    card.style.animationDelay = `${(index % SHOW_INITIAL) * 0.08}s`;

    const lang      = repo.language || null;
    const langColor = lang ? (LANG_COLORS[lang] || '#06B6D4') : '#06B6D4';
    const desc      = repo.description
        ? escapeHtml(repo.description)
        : '<span style="font-style:italic;opacity:0.55;">No description available.</span>';

    const starsBadge = repo.stargazers_count > 0
        ? `<span class="stars-badge"><i class="ph-fill ph-star"></i> ${repo.stargazers_count}</span>`
        : '';

    const langBadge = lang
        ? `<span class="lang-badge"><span class="lang-dot" style="background:${langColor};"></span>${escapeHtml(lang)}</span>`
        : '';

    const liveBtn = (repo.homepage && repo.homepage.trim() && repo.homepage.startsWith('http'))
        ? `<a href="${escapeHtml(repo.homepage)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary"><i class="ph ph-arrow-square-out"></i> Live Demo</a>`
        : '';

    card.innerHTML = `
        <div class="project-lang-banner" style="background:linear-gradient(90deg,${langColor} 0%,#14B8A6 100%);"></div>
        <div class="project-info">
            <h3>${formatRepoName(repo.name)}</h3>
            <p class="project-desc">${desc}</p>
            <div class="project-meta">
                ${langBadge}
                ${starsBadge}
            </div>
            <div class="project-links">
                <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline">
                    <i class="ph-fill ph-github-logo"></i> View on GitHub
                </a>
                ${liveBtn}
            </div>
        </div>`;

    return card;
}

function formatRepoName(name) {
    return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
