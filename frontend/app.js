const API_BASE = 'http://localhost:8080';

// Global state
let state = {
    token: localStorage.getItem('blog_jwt_token') || '',
    username: localStorage.getItem('blog_username') || '',
    currentView: 'home',
    blogs: [],
    searchQuery: ''
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderApp();
});

// Toast System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon selection
    let icon = '';
    if (type === 'success') {
        icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
        icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
        icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }

    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);

    // Fade out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

// Check auth token
function isAuthenticated() {
    return !!state.token;
}

// Configure API headers
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }
    return headers;
}

// Centralized fetch wrapper to handle auth expires
async function apiFetch(endpoint, options = {}) {
    options.headers = {
        ...getHeaders(),
        ...options.headers
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        
        if (response.status === 401) {
            // Token expired or invalid
            handleLogout();
            showToast('Session expired. Please log in again.', 'error');
            return null;
        }
        
        if (response.status === 403) {
            showToast('Access Denied. You do not have permission for this action.', 'error');
            return response;
        }
        
        return response;
    } catch (err) {
        console.error('API Fetch Error:', err);
        showToast('Network error. Is the server running?', 'error');
        throw err;
    }
}

// Navigation bar UI handler
function updateNavbar() {
    const linkCreate = document.getElementById('link-create');
    const linkMyBlogs = document.getElementById('link-myblogs');
    const searchContainer = document.getElementById('search-container');
    const authStatus = document.getElementById('auth-status-container');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${state.currentView}`) {
            link.classList.add('active');
        }
    });

    if (isAuthenticated()) {
        linkCreate.style.display = 'inline-flex';
        linkMyBlogs.style.display = 'inline-flex';
        searchContainer.style.display = 'flex';
        
        authStatus.innerHTML = `
            <div class="user-badge">
                <div class="user-avatar">${state.username.substring(0, 2).toUpperCase()}</div>
                <span class="username-display">${state.username}</span>
                <button id="logout-btn" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;">Logout</button>
            </div>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
    } else {
        linkCreate.style.display = 'none';
        linkMyBlogs.style.display = 'none';
        searchContainer.style.display = 'none';
        
        authStatus.innerHTML = `
            <button id="nav-login-btn" class="btn btn-primary">Login / Sign Up</button>
        `;
        
        document.getElementById('nav-login-btn').addEventListener('click', () => {
            state.currentView = 'auth';
            renderApp();
        });
    }
}

// Init Navigation Click Events
function initNavigation() {
    document.getElementById('logo-home').addEventListener('click', () => {
        state.currentView = isAuthenticated() ? 'home' : 'auth';
        renderApp();
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            
            if (!isAuthenticated() && target !== 'home') {
                state.currentView = 'auth';
            } else {
                state.currentView = target;
            }
            renderApp();
        });
    });

    // Search bar logic
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    const handleSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            state.searchQuery = query;
            state.currentView = 'search';
            renderApp();
        }
    };

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

// View Renderer
function renderApp() {
    updateNavbar();
    
    const appContainer = document.getElementById('app');
    
    // Route guard
    if (!isAuthenticated() && state.currentView !== 'auth') {
        state.currentView = 'auth';
    }

    switch (state.currentView) {
        case 'auth':
            renderAuthView(appContainer);
            break;
        case 'home':
            renderHomeView(appContainer);
            break;
        case 'create':
            renderCreateView(appContainer);
            break;
        case 'myblogs':
            renderMyBlogsView(appContainer);
            break;
        case 'search':
            renderSearchView(appContainer);
            break;
        default:
            renderHomeView(appContainer);
    }
}

// Render Auth View (Login / Signup)
function renderAuthView(container) {
    container.innerHTML = `
        <div class="auth-wrapper glass-card">
            <div class="auth-tabs">
                <button class="auth-tab active" id="tab-login">Login</button>
                <button class="auth-tab" id="tab-signup">Sign Up</button>
                <div class="auth-tab-indicator" id="tab-indicator"></div>
            </div>
            
            <div id="auth-form-container">
                <!-- Login form default -->
                <form id="login-form">
                    <div class="form-group">
                        <label for="login-username">Username</label>
                        <input type="text" id="login-username" class="form-control" placeholder="Enter username" required autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input type="password" id="login-password" class="form-control" placeholder="Enter password" required autocomplete="current-password">
                    </div>
                    <button type="submit" class="btn btn-primary form-submit-btn">Login</button>
                </form>
            </div>
        </div>
    `;

    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const indicator = document.getElementById('tab-indicator');
    const formContainer = document.getElementById('auth-form-container');

    const showLogin = () => {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        indicator.style.left = '0%';
        formContainer.innerHTML = `
            <form id="login-form">
                <div class="form-group">
                    <label for="login-username">Username</label>
                    <input type="text" id="login-username" class="form-control" placeholder="Enter username" required autocomplete="username">
                </div>
                <div class="form-group">
                    <label for="login-password">Password</label>
                    <input type="password" id="login-password" class="form-control" placeholder="Enter password" required autocomplete="current-password">
                </div>
                <button type="submit" class="btn btn-primary form-submit-btn">Login</button>
            </form>
        `;
        bindLoginForm();
    };

    const showSignup = () => {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        indicator.style.left = '50%';
        formContainer.innerHTML = `
            <form id="signup-form">
                <div class="form-group">
                    <label for="signup-username">Username</label>
                    <input type="text" id="signup-username" class="form-control" placeholder="Enter username" required autocomplete="username">
                </div>
                <div class="form-group">
                    <label for="signup-email">Email Address</label>
                    <input type="email" id="signup-email" class="form-control" placeholder="Enter email" required autocomplete="email">
                </div>
                <div class="form-group">
                    <label for="signup-password">Password</label>
                    <input type="password" id="signup-password" class="form-control" placeholder="Create password" required autocomplete="new-password">
                </div>
                <button type="submit" class="btn btn-primary form-submit-btn">Sign Up</button>
            </form>
        `;
        bindSignupForm();
    };

    tabLogin.addEventListener('click', showLogin);
    tabSignup.addEventListener('click', showSignup);

    // Initial binding
    bindLoginForm();

    function bindLoginForm() {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('login-username').value.trim();
            const passwordInput = document.getElementById('login-password').value.trim();

            try {
                const response = await fetch(`${API_BASE}/api/v1/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: usernameInput, password: passwordInput })
                });

                if (response.ok) {
                    const token = await response.text();
                    state.token = token;
                    state.username = usernameInput;
                    localStorage.setItem('blog_jwt_token', token);
                    localStorage.setItem('blog_username', usernameInput);
                    
                    showToast(`Welcome back, ${usernameInput}!`, 'success');
                    state.currentView = 'home';
                    renderApp();
                } else {
                    showToast('Invalid credentials. Please try again.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Server connection failed.', 'error');
            }
        });
    }

    function bindSignupForm() {
        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('signup-username').value.trim();
            const emailInput = document.getElementById('signup-email').value.trim();
            const passwordInput = document.getElementById('signup-password').value.trim();

            try {
                const response = await fetch(`${API_BASE}/api/v1/login/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: usernameInput, email: emailInput, password: passwordInput })
                });

                if (response.ok) {
                    showToast('Signup successful! Please login to proceed.', 'success');
                    // Automatically redirect to login tab
                    showLogin();
                } else {
                    showToast('Signup failed. Username/Email might be taken.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Server connection failed.', 'error');
            }
        });
    }
}

// Render Home View
async function renderHomeView(container) {
    container.innerHTML = `
        <div class="home-header">
            <h2>Recent Blog Posts</h2>
            <button class="btn btn-primary" id="btn-goto-create">Write a Post</button>
        </div>
        <div id="blogs-container" class="blogs-list">
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        </div>
    `;

    document.getElementById('btn-goto-create').addEventListener('click', () => {
        state.currentView = 'create';
        renderApp();
    });

    const blogsContainer = document.getElementById('blogs-container');

    try {
        const response = await apiFetch('/api/v1/user/home');
        if (!response) return; // session expired handled inside apiFetch

        if (response.ok) {
            const blogs = await response.json();
            state.blogs = blogs;
            renderBlogsList(blogsContainer, blogs);
        } else {
            blogsContainer.innerHTML = `<div class="empty-state"><p>Error loading blogs.</p></div>`;
        }
    } catch (e) {
        blogsContainer.innerHTML = `<div class="empty-state"><p>Could not reach the server.</p></div>`;
    }
}

// Render Create View
function renderCreateView(container) {
    container.innerHTML = `
        <div class="glass-card" style="max-width: 700px; margin: 0 auto;">
            <h2 style="margin-bottom: 24px;">Create New Post</h2>
            <form id="create-post-form">
                <div class="form-group">
                    <label for="post-title">Blog Title</label>
                    <input type="text" id="post-title" class="form-control" placeholder="A catchy title..." required>
                </div>
                <div class="form-group">
                    <label for="post-content">Content</label>
                    <textarea id="post-content" class="form-control" placeholder="Share your thoughts (Max characters: ~1 Billion)..." required></textarea>
                </div>
                <div style="display:flex; gap:16px; justify-content: flex-end; margin-top:20px;">
                    <button type="button" class="btn btn-secondary" id="btn-cancel-post">Cancel</button>
                    <button type="submit" class="btn btn-primary">Publish Post</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('btn-cancel-post').addEventListener('click', () => {
        state.currentView = 'home';
        renderApp();
    });

    document.getElementById('create-post-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();

        try {
            const response = await apiFetch('/api/v1/user/newBlog', {
                method: 'POST',
                body: JSON.stringify({ title, content })
            });

            if (!response) return;

            if (response.ok) {
                showToast('Blog published successfully!', 'success');
                state.currentView = 'home';
                renderApp();
            } else {
                showToast('Failed to create post.', 'error');
            }
        } catch (err) {
            console.error(err);
        }
    });
}

// Render My Blogs View
async function renderMyBlogsView(container) {
    container.innerHTML = `
        <div class="home-header">
            <h2>My Published Blogs</h2>
        </div>
        <div id="my-blogs-container" class="blogs-list">
            <div class="skeleton-card"></div>
        </div>
    `;

    const myBlogsContainer = document.getElementById('my-blogs-container');

    try {
        const response = await apiFetch('/api/v1/user/blog/myBlogs');
        if (!response) return;

        if (response.ok) {
            const blogs = await response.json();
            renderBlogsList(myBlogsContainer, blogs, true);
        } else {
            myBlogsContainer.innerHTML = `<div class="empty-state"><p>Error loading your blogs.</p></div>`;
        }
    } catch (e) {
        myBlogsContainer.innerHTML = `<div class="empty-state"><p>Could not reach the server.</p></div>`;
    }
}

// Render Search View
async function renderSearchView(container) {
    container.innerHTML = `
        <div class="home-header">
            <h2>Search Results for "${state.searchQuery}"</h2>
            <button class="btn btn-secondary" id="btn-clear-search">Clear Search</button>
        </div>
        <div id="search-blogs-container" class="blogs-list">
            <div class="skeleton-card"></div>
        </div>
    `;

    document.getElementById('btn-clear-search').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        state.searchQuery = '';
        state.currentView = 'home';
        renderApp();
    });

    const searchContainer = document.getElementById('search-blogs-container');

    try {
        const response = await apiFetch(`/api/v1/user/blog/${encodeURIComponent(state.searchQuery)}`);
        if (!response) return;

        if (response.status === 404) {
            renderEmptySearch(searchContainer);
        } else if (response.ok) {
            const blogs = await response.json();
            renderBlogsList(searchContainer, blogs);
        } else {
            searchContainer.innerHTML = `<div class="empty-state"><p>Error fetching search results.</p></div>`;
        }
    } catch (e) {
        searchContainer.innerHTML = `<div class="empty-state"><p>Could not reach the server.</p></div>`;
    }
}

function renderEmptySearch(container) {
    container.innerHTML = `
        <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3>No matches found</h3>
            <p>We couldn't find any blogs matching "${state.searchQuery}". Try checking the spelling or searching for another keyword.</p>
        </div>
    `;
}

// Helper to render lists of blog cards
function renderBlogsList(container, blogs, showDelete = false) {
    if (blogs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                <h3>No blogs here yet</h3>
                <p>Be the first to share your thoughts and write an article on Antigravity Blog!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    blogs.forEach(blog => {
        // Safe check for blog properties
        const blogId = blog.id;
        const author = blog.username || 'Anonymous';
        const title = blog.title || 'Untitled';
        const content = blog.content || '';
        const likes = blog.likeCount || 0;
        const commentCount = blog.commentCount || 0;
        const comments = blog.comments || [];
        
        const card = document.createElement('article');
        card.className = 'glass-card blog-card';
        card.id = `blog-post-${blogId}`;

        // Truncation check
        const needsTruncate = content.length > 280;
        const isLiked = !!blog.likedByCurrentUser;
        
        // Date creation placeholder
        const dateString = 'Recently published';

        card.innerHTML = `
            <div class="blog-card-header">
                <div class="blog-author-info">
                    <div class="user-avatar">${author.substring(0, 2).toUpperCase()}</div>
                    <div class="blog-author-meta">
                        <span class="blog-author-name">${author}</span>
                        <span class="blog-date">${dateString}</span>
                    </div>
                </div>
                ${(showDelete || author === state.username) ? `
                    <button class="btn btn-danger delete-blog-btn" data-id="${blogId}" style="padding: 6px 12px; font-size: 0.85rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                    </button>
                ` : ''}
            </div>

            <h3 class="blog-title">${title}</h3>
            
            <div class="blog-content-wrapper ${needsTruncate ? 'collapsed' : ''}" id="blog-content-wrapper-${blogId}">
                <div class="blog-content" id="blog-content-${blogId}">${content}</div>
            </div>
            
            ${needsTruncate ? `
                <button class="btn btn-secondary read-more-btn" id="read-more-${blogId}" style="align-self: flex-start; padding: 4px 8px; font-size:0.8rem; margin-top: 10px;">
                    Read More
                </button>
            ` : ''}

            <div class="blog-card-footer">
                <div class="blog-actions">
                    <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" id="like-btn-${blogId}" data-id="${blogId}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span class="like-count" id="like-count-${blogId}">${likes}</span> Likes
                    </button>
                    
                    <button class="action-btn comment-toggle" id="comment-toggle-${blogId}" data-id="${blogId}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span class="comment-count" id="comment-count-${blogId}">${commentCount}</span> Comments
                    </button>
                </div>
            </div>

            <!-- Comments Drawer -->
            <div class="comments-section" id="comments-section-${blogId}">
                <div class="comments-list" id="comments-list-${blogId}">
                    <!-- Comments render -->
                </div>
                <form class="comment-form" id="comment-form-${blogId}">
                    <input type="text" placeholder="Add a public comment..." class="comment-input" id="comment-input-${blogId}" required>
                    <button type="submit" class="btn btn-secondary">Post</button>
                </form>
            </div>
        `;

        container.appendChild(card);

        // Bind Read More
        if (needsTruncate) {
            const readMoreBtn = document.getElementById(`read-more-${blogId}`);
            readMoreBtn.addEventListener('click', () => {
                const wrapper = document.getElementById(`blog-content-wrapper-${blogId}`);
                if (wrapper.classList.contains('collapsed')) {
                    wrapper.classList.remove('collapsed');
                    wrapper.classList.add('expanded');
                    readMoreBtn.innerText = 'Read Less';
                } else {
                    wrapper.classList.remove('expanded');
                    wrapper.classList.add('collapsed');
                    readMoreBtn.innerText = 'Read More';
                }
            });
        }

        // Bind Like click
        const likeBtn = document.getElementById(`like-btn-${blogId}`);
        likeBtn.addEventListener('click', async () => {
            try {
                const response = await apiFetch(`/api/v1/user/blog/${blogId}/like`, { method: 'POST' });
                if (!response) return;

                if (response.status === 201) {
                    const countSpan = document.getElementById(`like-count-${blogId}`);
                    countSpan.innerText = parseInt(countSpan.innerText) + 1;
                    likeBtn.classList.add('liked');
                    showToast('Post liked!', 'success');
                } else if (response.status === 409) {
                    showToast('You have already liked this post.', 'warning');
                } else {
                    showToast('Failed to like post.', 'error');
                }
            } catch (err) {
                console.error(err);
            }
        });

        // Bind Comment Drawer Toggle
        const commentToggle = document.getElementById(`comment-toggle-${blogId}`);
        const commentsSection = document.getElementById(`comments-section-${blogId}`);
        const commentsList = document.getElementById(`comments-list-${blogId}`);
        
        commentToggle.addEventListener('click', () => {
            commentsSection.classList.toggle('active');
            commentToggle.classList.toggle('expanded');
            if (commentsSection.classList.contains('active')) {
                renderCommentsList(commentsList, comments);
            }
        });

        // Bind Comment Submission Form
        const commentForm = document.getElementById(`comment-form-${blogId}`);
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById(`comment-input-${blogId}`);
            const contentText = input.value.trim();
            if (!contentText) return;

            try {
                const response = await apiFetch(`/api/v1/user/blog/${blogId}/comment`, {
                    method: 'POST',
                    body: JSON.stringify({ content: contentText })
                });

                if (!response) return;

                if (response.ok) {
                    const newComment = await response.json();
                    
                    // Add to current in-memory list
                    const commentObj = {
                        id: newComment.id || Date.now(),
                        content: newComment.content,
                        username: state.username,
                        createdAt: new Date().toISOString()
                    };
                    comments.push(commentObj);
                    
                    // Render comments list
                    renderCommentsList(commentsList, comments);
                    
                    // Clear input & increment count
                    input.value = '';
                    const commentCountSpan = document.getElementById(`comment-count-${blogId}`);
                    commentCountSpan.innerText = comments.length;
                    
                    showToast('Comment posted!', 'success');
                } else {
                    showToast('Failed to post comment.', 'error');
                }
            } catch (err) {
                console.error(err);
            }
        });
    });

    // Bind Delete Button Click (using event delegation or individual handlers)
    container.querySelectorAll('.delete-blog-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const blogId = btn.getAttribute('data-id');
            if (!confirm('Are you sure you want to delete this blog post?')) return;

            try {
                const response = await apiFetch(`/api/v1/user/blog/${blogId}/delete`, {
                    method: 'DELETE'
                });

                if (!response) return;

                if (response.ok) {
                    showToast('Blog post deleted successfully.', 'success');
                    // Remove post from UI
                    document.getElementById(`blog-post-${blogId}`).remove();
                } else {
                    showToast('Failed to delete blog post.', 'error');
                }
            } catch (err) {
                console.error(err);
            }
        });
    });
}

// Helper to render comments list inside card drawer
function renderCommentsList(container, comments) {
    if (comments.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem; padding: 10px 0;">No comments on this post yet. Be the first to say something!</p>`;
        return;
    }

    container.innerHTML = '';
    comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        
        let dateText = 'Just now';
        if (comment.createdAt) {
            try {
                const date = new Date(comment.createdAt);
                dateText = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (e) {}
        }

        commentDiv.innerHTML = `
            <div class="comment-header">
                <span class="comment-user">${comment.username}</span>
                <span class="comment-time">${dateText}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        `;
        container.appendChild(commentDiv);
    });

    // Scroll to bottom of comments list
    container.scrollTop = container.scrollHeight;
}

// Handle Log Out
function handleLogout() {
    state.token = '';
    state.username = '';
    localStorage.removeItem('blog_jwt_token');
    localStorage.removeItem('blog_username');
    
    showToast('Logged out successfully.', 'info');
    state.currentView = 'auth';
    renderApp();
}
