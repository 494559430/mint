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
        
        li.onclick = () => {
            copyToClipboard(song.name);
            // 增加点击反馈效果
            li.style.backgroundColor = 'var(--hover-bg)';
            setTimeout(() => {
                li.style.backgroundColor = '';
            }, 200);
        };
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

// 优化的复制到剪贴板功能
function copyToClipboard(songName) {
    const textToCopy = `点歌 ${songName}`;
    
    // 内部通用复制方法
    const attemptCopy = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        // 确保 textarea 不可见但可操作
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        let successful = false;
        try {
            successful = document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textArea);
        return successful;
    };

    // 优先使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => showToast(`已复制: ${textToCopy}`))
            .catch(err => {
                console.warn('Clipboard API failed, trying fallback:', err);
                if (attemptCopy(textToCopy)) {
                    showToast(`已复制: ${textToCopy}`);
                }
            });
    } else {
        // 环境不支持时直接使用 fallback
        if (attemptCopy(textToCopy)) {
            showToast(`已复制: ${textToCopy}`);
        } else {
            alert('复制失败，请手动选择复制');
        }
    }
}

let toastTimer = null;
// Show toast notification
function showToast(message) {
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    // 清除之前的定时器，防止快速点击时提示闪烁消失
    if (toastTimer) clearTimeout(toastTimer);
    
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
        toastTimer = null;
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
