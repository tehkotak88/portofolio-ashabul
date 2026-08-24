// Configuration
const WHATSAPP_NUMBER = "6287777347983"; // Nomor WhatsApp Ashabul (Bisa disesuaikan langsung)
const GITHUB_USERNAME = "tehkotak88";

// Initialize Lucide Icons
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initScrollHeader();
    initMobileNav();
    initCursorGlow();
    initStatsCounter();
    initProjectFilter();
    fetchGitHubRepos();
    initContactForm();
    initSuccessMessage();
});

/* 1. Custom Cursor Glow Effect */
function initCursorGlow() {
    const glow = document.getElementById("cursorGlow");
    if (!glow) return;
    
    document.addEventListener("mousemove", (e) => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
    });
}

/* 2. Scroll Header & Active Navigation Link */
function initScrollHeader() {
    const header = document.getElementById("header");
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");
    
    window.addEventListener("scroll", () => {
        // Sticky Header Class
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        
        // Active Nav Link highlight on Scroll
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute("id");
            }
        });
        
        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href").slice(1) === current) {
                link.classList.add("active");
            }
        });
    });
}

/* 3. Mobile Hamburger Navigation Menu */
function initMobileNav() {
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav-link");
    
    navToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        navToggle.classList.toggle("active");
        
        // Toggle menu icons display
        const isMenuOpen = navMenu.classList.contains("active");
        const menuIcon = navToggle.querySelector(".menu-icon");
        const closeIcon = navToggle.querySelector(".close-icon");
        
        if (isMenuOpen) {
            menuIcon.style.display = "none";
            closeIcon.style.display = "block";
        } else {
            menuIcon.style.display = "block";
            closeIcon.style.display = "none";
        }
    });
    
    // Close nav menu when link is clicked
    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            navToggle.classList.remove("active");
            navToggle.querySelector(".menu-icon").style.display = "block";
            navToggle.querySelector(".close-icon").style.display = "none";
        });
    });
}

/* 4. Stats Counter Animation */
function initStatsCounter() {
    const statsNumbers = document.querySelectorAll(".stat-number");
    
    const countUp = (element) => {
        const target = parseInt(element.getAttribute("data-target"), 10);
        let count = 0;
        const duration = 2000; // 2 seconds
        const stepTime = Math.max(Math.floor(duration / target), 30);
        
        const timer = setInterval(() => {
            count += 1;
            element.textContent = count;
            if (count >= target) {
                element.textContent = target; // Ensure exact final value
                clearInterval(timer);
            }
        }, stepTime);
    };
    
    // Trigger when stats enter the viewport
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statsNumbers.forEach(num => observer.observe(num));
}

/* 5. Project Filtering Logic */
function initProjectFilter() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const projectCards = document.querySelectorAll("#featuredProjectsContainer .project-card");
    
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active class from all buttons
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const filterValue = btn.getAttribute("data-filter");
            
            projectCards.forEach(card => {
                // Fade out animation
                card.style.opacity = "0";
                card.style.transform = "scale(0.95)";
                
                setTimeout(() => {
                    if (filterValue === "all" || card.getAttribute("data-category") === filterValue) {
                        card.style.display = "flex";
                        // Trigger fade in
                        setTimeout(() => {
                            card.style.opacity = "1";
                            card.style.transform = "scale(1)";
                        }, 50);
                    } else {
                        card.style.display = "none";
                    }
                }, 300);
            });
        });
    });
}

/* 6. GitHub API Integration */
let loadedRepos = [];

async function fetchGitHubRepos() {
    const loadingEl = document.getElementById("repoLoading");
    const errorEl = document.getElementById("repoError");
    const containerEl = document.getElementById("reposGridContainer");
    
    // Repository-repository utama yang sudah dionlinekan / ditampilkan di bagian atas,
    // kita blacklist agar tidak terjadi duplikasi tampilan di repositori sekunder.
    const excludedRepos = [
        "arkeus-arsip-keuangan-smart",
        "warkop-sop-saudara-azzahra1",
        "mr-wash-3",
        "nol-3-coffe",
        "game-tetris",
        "fix"
    ];
    
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
        if (!response.ok) throw new Error("Gagal mengambil data");
        
        const data = await response.json();
        
        // Filter out blacklisted repos
        loadedRepos = data.filter(repo => !excludedRepos.includes(repo.name.toLowerCase()));
        
        renderRepos(loadedRepos);
        
        loadingEl.classList.add("hidden");
        containerEl.classList.remove("hidden");
        
        // Enable search bar listener
        initRepoSearch();
        
    } catch (err) {
        console.error(err);
        loadingEl.classList.add("hidden");
        errorEl.classList.remove("hidden");
    }
}

function renderRepos(repos) {
    const containerEl = document.getElementById("reposGridContainer");
    containerEl.innerHTML = "";
    
    if (repos.length === 0) {
        containerEl.innerHTML = `
            <div class="no-results text-center" style="grid-column: 1/-1; padding: 2rem;">
                <i data-lucide="info" style="margin-bottom:1rem; color:var(--text-muted);"></i>
                <p>Tidak ada repositori yang cocok dengan kata kunci Anda.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    repos.forEach(repo => {
        const card = document.createElement("div");
        card.className = "repo-card glass-card";
        
        // Language styling class mapping
        const langClass = repo.language ? repo.language.toLowerCase() : "";
        const formattedDate = new Date(repo.updated_at).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short"
        });
        
        const descText = repo.description || "Tidak ada deskripsi tertulis. Kunjungi repositori untuk melihat detail instruksi pembangunannya.";
        
        card.innerHTML = `
            <div class="repo-header">
                <i data-lucide="folder" class="repo-folder-icon"></i>
                <a href="${repo.html_url}" target="_blank" aria-label="Lihat repositori">
                    <i data-lucide="external-link" class="repo-arrow-icon"></i>
                </a>
            </div>
            <h3>${repo.name}</h3>
            <p class="repo-desc">${descText}</p>
            <div class="repo-footer">
                ${repo.language ? `
                <div class="repo-lang">
                    <span class="lang-dot ${langClass}"></span>
                    <span>${repo.language}</span>
                </div>` : '<div></div>'}
                <div class="repo-date">${formattedDate}</div>
            </div>
        `;
        
        containerEl.appendChild(card);
    });
    
    // Rerender dynamically added icons
    lucide.createIcons();
}

function initRepoSearch() {
    const searchInput = document.getElementById("repoSearchInput");
    
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        const filtered = loadedRepos.filter(repo => {
            const nameMatch = repo.name.toLowerCase().includes(query);
            const descMatch = repo.description && repo.description.toLowerCase().includes(query);
            const langMatch = repo.language && repo.language.toLowerCase().includes(query);
            return nameMatch || descMatch || langMatch;
        });
        
        renderRepos(filtered);
    });
}

/* 7. Contact Form Redirect to WhatsApp or Email */
function initContactForm() {
    const form = document.getElementById("projectContactForm");
    if (!form) return;
    
    // Handler untuk WhatsApp
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const name = document.getElementById("clientName").value.trim();
        const type = document.getElementById("projectType").value;
        const desc = document.getElementById("projectDesc").value.trim();
        
        // Format message template
        const textMessage = `Halo Ashabul, saya *${name}*.\n\nSaya tertarik untuk membuat proyek *${type}* dengan rencana kebutuhan berikut:\n\n"${desc}"\n\nMohon hubungi saya kembali untuk mendiskusikan rencana kerja dan penawaran harganya. Terima kasih!`;
        
        // Encode message for URL
        const encodedText = encodeURIComponent(textMessage);
        
        // WhatsApp API redirect URL
        const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedText}`;
        
        // Open WhatsApp chat in a new tab
        window.open(url, "_blank");
        
        // Reset form inputs after submitting
        form.reset();
    });
}

/* 8. Form Tab Switcher (WA / Email) */
function switchFormTab(tab) {
    const waForm = document.getElementById("projectContactForm");
    const emailForm = document.getElementById("emailContactForm");
    const tabWA = document.getElementById("tabWA");
    const tabEmail = document.getElementById("tabEmail");

    if (tab === 'wa') {
        waForm.style.display = "block";
        emailForm.style.display = "none";
        tabWA.classList.add("active");
        tabEmail.classList.remove("active");
    } else {
        waForm.style.display = "none";
        emailForm.style.display = "block";
        tabWA.classList.remove("active");
        tabEmail.classList.add("active");
    }

    lucide.createIcons();
}

/* 9. Show success message if redirected back from Formsubmit */
function initSuccessMessage() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pesan') === 'terkirim') {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            const banner = document.createElement('div');
            banner.style.cssText = `
                background: linear-gradient(135deg, #10b981, #06b6d4);
                color: #fff;
                text-align: center;
                padding: 1rem 2rem;
                border-radius: 12px;
                font-weight: 600;
                margin-bottom: 1.5rem;
                font-size: 1rem;
            `;
            banner.textContent = '✅ Email Anda berhasil terkirim! Kami akan membalas segera.';
            contactSection.querySelector('.contact-container').prepend(banner);
            setTimeout(() => banner.remove(), 8000);
        }
    }
}
