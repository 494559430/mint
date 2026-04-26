let playlist = [];
let filteredPlaylist = [];
let activeTag = '';

const searchInput = document.getElementById('searchInput');
const tagsContainer = document.getElementById('tagsContainer');
const songList = document.getElementById('songList');
const toast = document.getElementById('toast');

// Load playlist data
function loadPlaylist() {
    playlist = PLAYLIST_DATA;
    filteredPlaylist = [...playlist];
    
    renderTags();
    renderSongs();
}

// Generate unique tags
function getUniqueTags() {
    const tags = new Set();
    playlist.forEach(song => {
        song.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
}

// Render tag buttons
function renderTags() {
    const tags = getUniqueTags();
    tagsContainer.innerHTML = '';
    
    // Add "All" tag
    const allBtn = createTagBtn('全部', '');
    if (!activeTag) allBtn.classList.add('active');
    tagsContainer.appendChild(allBtn);
    
    tags.forEach(tag => {
        const btn = createTagBtn(tag, tag);
        if (activeTag === tag) btn.classList.add('active');
        tagsContainer.appendChild(btn);
    });
}

function createTagBtn(label, value) {
    const btn = document.createElement('button');
    btn.className = 'tag-btn';
    btn.textContent = label;
    btn.onclick = () => {
        activeTag = value;
        searchInput.value = ''; // Clear search input when tag is selected
        filterPlaylist();
        renderTags();
    };
    return btn;
}

// Render song list
function renderSongs() {
    songList.innerHTML = '';
    
    if (filteredPlaylist.length === 0) {
        songList.innerHTML = '<li class="no-results">未找到匹配的歌曲</li>';
        return;
    }

    filteredPlaylist.forEach(song => {
        const li = document.createElement('li');
        li.className = 'song-item';
        
        const tagsHtml = song.tags.map(tag => `<span class="mini-tag">${tag}</span>`).join('');
        
        li.innerHTML = `
            <div class="song-name" data-name="${song.name}">${song.name}</div>
            <div class="song-author">${song.author}</div>
            <div class="song-tags">${tagsHtml}</div>
        `;
        
        li.onclick = () => copyToClipboard(song.name);
        songList.appendChild(li);
    });
}

// Filter playlist by search input and active tag
function filterPlaylist() {
    const query = searchInput.value.toLowerCase();
    
    filteredPlaylist = playlist.filter(song => {
        const matchesQuery = !query || 
            song.name.toLowerCase().includes(query) || 
            song.author.toLowerCase().includes(query) || 
            song.tags.some(tag => tag.toLowerCase().includes(query));
            
        const matchesTag = !activeTag || song.tags.includes(activeTag);
        
        return matchesQuery && matchesTag;
    });
    
    renderSongs();
}

// Copy to clipboard function
async function copyToClipboard(songName) {
    const textToCopy = `点歌 ${songName}`;
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        showToast(`已复制: ${textToCopy}`);
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast(`已复制: ${textToCopy}`);
        } catch (copyErr) {
            console.error('Copy failed:', copyErr);
        }
        document.body.removeChild(textArea);
    }
}

// Show toast notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Event Listeners
searchInput.addEventListener('input', () => {
    // If user starts typing, clear active tag filter unless it matches
    // But usually better to combine them.
    filterPlaylist();
});

// Initialize
loadPlaylist();
