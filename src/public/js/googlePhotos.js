/**
 * Google Photos 页面增强功能
 */
document.addEventListener('DOMContentLoaded', function() {
  // 添加搜索功能
  addSearchFunctionality();
  
  // 添加过滤功能
  addFilterFunctionality();
  
  // 添加下载功能
  addDownloadFunctionality();
  
  // 添加键盘导航
  addKeyboardNavigation();
});

/**
 * 添加搜索功能
 */
function addSearchFunctionality() {
  // 创建搜索表单
  const searchForm = document.createElement('form');
  searchForm.className = 'mb-4';
  searchForm.id = 'photo-search-form';
  
  const inputGroup = document.createElement('div');
  inputGroup.className = 'input-group';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'form-control';
  searchInput.placeholder = '搜索照片...';
  searchInput.id = 'photo-search-input';
  
  const searchButton = document.createElement('button');
  searchButton.type = 'submit';
  searchButton.className = 'btn btn-primary';
  searchButton.innerHTML = '<i class="fa fa-search"></i> 搜索';
  
  inputGroup.appendChild(searchInput);
  inputGroup.appendChild(searchButton);
  searchForm.appendChild(inputGroup);
  
  // 将搜索表单添加到页面
  const photosHeading = document.querySelector('h2:nth-of-type(2)');
  if (photosHeading) {
    photosHeading.parentNode.insertBefore(searchForm, photosHeading.nextSibling);
  }
  
  // 添加搜索事件监听器
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
      return;
    }
    
    // 获取所有照片卡片
    const photoCards = document.querySelectorAll('#media-container .card');
    
    // 过滤照片
    photoCards.forEach(card => {
      const filename = card.querySelector('.card-text').textContent.toLowerCase();
      const matchesSearch = filename.includes(searchTerm);
      
      // 显示或隐藏照片卡片
      card.closest('.col').style.display = matchesSearch ? '' : 'none';
    });
    
    // 显示搜索结果信息
    const visibleCount = document.querySelectorAll('#media-container .col[style=""]').length;
    
    let resultInfo = document.getElementById('search-result-info');
    if (!resultInfo) {
      resultInfo = document.createElement('div');
      resultInfo.id = 'search-result-info';
      resultInfo.className = 'alert alert-info mt-2';
      searchForm.after(resultInfo);
    }
    
    resultInfo.textContent = `找到 ${visibleCount} 张匹配的照片`;
    resultInfo.style.display = 'block';
  });
}

/**
 * 添加过滤功能
 */
function addFilterFunctionality() {
  // 创建过滤器下拉菜单
  const filterDropdown = document.createElement('div');
  filterDropdown.className = 'dropdown mb-3';
  
  const filterButton = document.createElement('button');
  filterButton.className = 'btn btn-outline-secondary dropdown-toggle';
  filterButton.type = 'button';
  filterButton.id = 'photoFilterDropdown';
  filterButton.setAttribute('data-bs-toggle', 'dropdown');
  filterButton.setAttribute('aria-expanded', 'false');
  filterButton.textContent = '过滤选项';
  
  const dropdownMenu = document.createElement('ul');
  dropdownMenu.className = 'dropdown-menu';
  dropdownMenu.setAttribute('aria-labelledby', 'photoFilterDropdown');
  
  // 添加过滤选项
  const filterOptions = [
    { id: 'filter-all', text: '显示全部' },
    { id: 'filter-photos', text: '仅显示照片' },
    { id: 'filter-videos', text: '仅显示视频' }
  ];
  
  filterOptions.forEach(option => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'dropdown-item';
    a.href = '#';
    a.id = option.id;
    a.textContent = option.text;
    
    a.addEventListener('click', function(e) {
      e.preventDefault();
      filterButton.textContent = option.text;
      
      // 实现过滤逻辑
      const photoCards = document.querySelectorAll('#media-container .card');
      
      photoCards.forEach(card => {
        const filename = card.querySelector('.card-text').textContent.toLowerCase();
        const isVideo = /\.(mp4|mov|avi|wmv|flv|mkv)$/i.test(filename);
        
        const col = card.closest('.col');
        
        if (option.id === 'filter-all') {
          col.style.display = '';
        } else if (option.id === 'filter-photos' && !isVideo) {
          col.style.display = '';
        } else if (option.id === 'filter-videos' && isVideo) {
          col.style.display = '';
        } else {
          col.style.display = 'none';
        }
      });
    });
    
    li.appendChild(a);
    dropdownMenu.appendChild(li);
  });
  
  filterDropdown.appendChild(filterButton);
  filterDropdown.appendChild(dropdownMenu);
  
  // 将过滤器添加到页面
  const mediaContainer = document.getElementById('media-container');
  if (mediaContainer) {
    mediaContainer.parentNode.insertBefore(filterDropdown, mediaContainer);
  }
}

/**
 * 添加下载功能
 */
function addDownloadFunctionality() {
  // 监听照片模态框显示事件
  const photoModal = document.getElementById('photoModal');
  if (photoModal) {
    photoModal.addEventListener('shown.bs.modal', function() {
      // 检查是否已添加下载按钮
      if (!document.getElementById('download-photo-btn')) {
        const modalFooter = photoModal.querySelector('.modal-footer');
        const downloadBtn = document.createElement('a');
        downloadBtn.id = 'download-photo-btn';
        downloadBtn.className = 'btn btn-success';
        downloadBtn.innerHTML = '<i class="fa fa-download"></i> 下载';
        downloadBtn.target = '_blank';
        
        // 设置下载链接
        const modalImage = document.getElementById('modalImage');
        if (modalImage) {
          downloadBtn.href = modalImage.src;
          downloadBtn.download = document.getElementById('photoModalLabel').textContent || 'photo';
        }
        
        // 添加到模态框底部
        modalFooter.insertBefore(downloadBtn, modalFooter.firstChild);
      }
    });
  }
}

/**
 * 添加键盘导航
 */
function addKeyboardNavigation() {
  document.addEventListener('keydown', function(e) {
    // 检查是否有模态框打开
    const modalOpen = document.querySelector('.modal.show');
    if (!modalOpen) return;
    
    // 左右箭头键导航
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      
      // 获取所有可见的照片缩略图
      const thumbnails = Array.from(document.querySelectorAll('#media-container .photo-thumbnail'));
      if (thumbnails.length === 0) return;
      
      // 获取当前显示的照片
      const currentImage = document.getElementById('modalImage');
      const currentSrc = currentImage.src.split('=')[0];
      
      // 找到当前照片的索引
      const currentIndex = thumbnails.findIndex(thumb => {
        const thumbSrc = thumb.getAttribute('data-full-url');
        return thumbSrc === currentSrc;
      });
      
      if (currentIndex === -1) return;
      
      // 计算下一个或上一个照片的索引
      let nextIndex;
      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % thumbnails.length;
      } else {
        nextIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
      }
      
      // 显示下一个或上一个照片
      const nextThumb = thumbnails[nextIndex];
      const fullUrl = nextThumb.getAttribute('data-full-url') + '=w1200-h1200';
      const filename = nextThumb.getAttribute('data-filename');
      
      currentImage.src = fullUrl;
      document.getElementById('photoModalLabel').textContent = filename;
      
      // 更新下载按钮
      const downloadBtn = document.getElementById('download-photo-btn');
      if (downloadBtn) {
        downloadBtn.href = fullUrl;
        downloadBtn.download = filename;
      }
    }
  });
}