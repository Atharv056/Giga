document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // --- MOUSE TRACKING SPOTLIGHT EFFECT ---
  const cursorLight = document.getElementById('cursorLight');
  window.addEventListener('mousemove', (e) => {
    if (cursorLight) {
      cursorLight.style.left = `${e.clientX}px`;
      cursorLight.style.top = `${e.clientY}px`;
    }
  });

  // Track cursor position locally inside each glass card for border hover glows & professional 3D tilt
  const cards = document.querySelectorAll('.feature-card, .agent-card, .pricing-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Dynamic cursor glow position
      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);
      
      // Calculate normalized mouse positions (-0.5 to 0.5)
      const normalizeX = (x / rect.width) - 0.5;
      const normalizeY = (y / rect.height) - 0.5;
      
      // Max tilt degrees (8 deg for professional subtle look)
      const maxRotate = 8;
      const rotateX = -normalizeY * maxRotate;
      const rotateY = normalizeX * maxRotate;
      
      // Apply professional 3D transform with depth Translation
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px) scale(1.01)`;
      
      // Shift shadows opposite to cursor tilt for depth realism
      card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 35px rgba(0, 0, 0, 0.4), var(--shadow-glow)`;
    });

    card.addEventListener('mouseleave', () => {
      // Smooth reset
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
      card.style.boxShadow = '0 10px 40px -10px rgba(0, 0, 0, 0.7)';
    });
  });



  // --- INTERSECTION OBSERVER FOR SCROLL REVEALS ---
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
        
        // Trigger stat counters if stats section was revealed
        if (entry.target.classList.contains('stats-grid') || entry.target.querySelector('.stat-number')) {
          animateStats();
        }
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(reveal => revealObserver.observe(reveal));


  // --- STATISTICS COUNTERS ANIMATION ---
  let statsAnimated = false;
  function animateStats() {
    if (statsAnimated) return;
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
      const targetVal = parseFloat(stat.getAttribute('data-target'));
      const suffix = stat.parentElement.querySelector('.stat-label').innerText;
      let startVal = 0;
      const duration = 2000; // 2 seconds
      const startTime = performance.now();
      
      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quadratic
        const easeProgress = progress * (2 - progress);
        const currentVal = startVal + easeProgress * (targetVal - startVal);
        
        if (targetVal % 1 !== 0) {
          // Decimal counter (uptime SLA)
          stat.innerText = currentVal.toFixed(1) + '%';
        } else {
          // Standard integer counters
          if (currentVal >= 1000000) {
            stat.innerText = Math.floor(currentVal / 1000000) + 'M+';
          } else if (currentVal >= 1000) {
            stat.innerText = Math.floor(currentVal / 1000) + 'K+';
          } else {
            stat.innerText = Math.floor(currentVal) + '+';
          }
        }
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          // Set exact target representation
          if (targetVal === 99.9) stat.innerText = '99.9%';
          else if (targetVal === 100000) stat.innerText = '100K+';
          else if (targetVal === 20000000) stat.innerText = '20M+';
          else if (targetVal === 500) stat.innerText = '500+';
        }
      };
      
      requestAnimationFrame(updateCounter);
    });
    statsAnimated = true;
  }

  // Fallback trigger for stats in viewport
  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateStats();
      }
    }, { threshold: 0.2 });
    statsObserver.observe(statsSection);
  }


  // --- TESTIMONIALS CAROUSEL MANAGEMENT ---
  const track = document.getElementById('carouselTrack');
  const slides = Array.from(track ? track.children : []);
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  const dotsContainer = document.getElementById('carouselDots');
  let currentSlideIndex = 0;
  let carouselInterval;

  if (track && slides.length > 0) {
    // Generate page indicators
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    const goToSlide = (index) => {
      currentSlideIndex = index;
      if (currentSlideIndex < 0) currentSlideIndex = slides.length - 1;
      if (currentSlideIndex >= slides.length) currentSlideIndex = 0;
      
      track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
      
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlideIndex);
      });
    };

    const nextSlide = () => goToSlide(currentSlideIndex + 1);
    const prevSlide = () => goToSlide(currentSlideIndex - 1);

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Auto-advance
    const startAutoAdvance = () => {
      carouselInterval = setInterval(nextSlide, 5000);
    };
    const stopAutoAdvance = () => {
      clearInterval(carouselInterval);
    };

    startAutoAdvance();
    track.addEventListener('mouseenter', stopAutoAdvance);
    track.addEventListener('mouseleave', startAutoAdvance);
  }


  // --- FAQ ACCORDION TRANSITIONS ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close other accordion items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-answer').style.height = '0px';
      });
      
      if (!isActive) {
        item.classList.add('active');
        answer.style.height = `${answer.scrollHeight}px`;
      }
    });
  });


  // --- COMMAND PALETTE (MODAL) CONTROLS ---
  const cmdPalette = document.getElementById('cmdPalette');
  const cmdOverlay = document.getElementById('cmdOverlay');
  const searchInput = document.getElementById('cmdSearchInput');
  const cmdItems = document.querySelectorAll('.cmd-item');
  let selectedIndex = 0;

  const toggleCommandPalette = (show) => {
    if (show) {
      cmdPalette.classList.add('open');
      cmdOverlay.classList.add('open');
      searchInput.value = '';
      searchInput.focus();
      selectCmdItem(0);
    } else {
      cmdPalette.classList.remove('open');
      cmdOverlay.classList.remove('open');
    }
  };

  const selectCmdItem = (index) => {
    selectedIndex = index;
    cmdItems.forEach((item, idx) => {
      item.classList.toggle('selected', idx === selectedIndex);
    });
  };

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const isOpen = cmdPalette.classList.contains('open');
      toggleCommandPalette(!isOpen);
    }
    
    // Command Palette navigating controls
    if (cmdPalette.classList.contains('open')) {
      if (e.key === 'Escape') {
        toggleCommandPalette(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        let nextIndex = selectedIndex + 1;
        if (nextIndex >= cmdItems.length) nextIndex = 0;
        selectCmdItem(nextIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        let prevIndex = selectedIndex - 1;
        if (prevIndex < 0) prevIndex = cmdItems.length - 1;
        selectCmdItem(prevIndex);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        cmdItems[selectedIndex].click();
      }
    }
  });

  // Attach search triggers
  const docSearchBtn = document.getElementById('navbarSearchBtn');
  if (docSearchBtn) docSearchBtn.addEventListener('click', () => toggleCommandPalette(true));
  if (cmdOverlay) cmdOverlay.addEventListener('click', () => toggleCommandPalette(false));

  // Simple palette filter logic
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      let firstMatchIdx = -1;
      
      cmdItems.forEach((item, idx) => {
        const text = item.textContent.toLowerCase();
        const matches = text.includes(term);
        item.style.display = matches ? 'flex' : 'none';
        
        if (matches && firstMatchIdx === -1) {
          firstMatchIdx = idx;
        }
      });
      
      if (firstMatchIdx !== -1) {
        selectCmdItem(firstMatchIdx);
      }
    });
  }


  // --- CHAT PLAYGROUND SIMULATOR ---
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const emojiToggleBtn = document.getElementById('emojiToggleBtn');
  const emojiPicker = document.getElementById('emojiPicker');
  const attachmentBtn = document.getElementById('attachmentBtn');
  const fileInput = document.getElementById('hiddenFileInput');
  const attachmentPreview = document.getElementById('attachmentPreview');
  const voiceRecBtn = document.getElementById('voiceRecBtn');
  const thinkingIndicator = document.getElementById('thinkingIndicator');
  
  const currentAgentName = document.getElementById('currentAgentName');
  const currentAgentAvatar = document.getElementById('currentAgentAvatar');

  // Simulated conversations log library
  const simulatedChats = [
    [
      { sender: 'user', content: 'Sync our PostgreSQL schema and verify changes.' },
      { sender: 'ai', content: 'Database synchronizer loaded. Querying metadata...\n\n```sql\nALTER TABLE users ADD COLUMN api_token VARCHAR(255);\nCREATE INDEX idx_users_api_token ON users(api_token);\n```\n\nSchema migration executed successfully on production replicas. Uptime remained unaffected.' }
    ],
    [
      { sender: 'user', content: 'Refactor index.css variables for better glassmorphism contrast.' },
      { sender: 'ai', content: 'Design System analyzer loaded. Refactored the core translucent borders:\n\n```css\n:root {\n  --border-color: rgba(255, 255, 255, 0.08);\n  --bg-card: rgba(10, 8, 28, 0.4);\n  backdrop-filter: blur(12px);\n}\n```\n\nApplied background filters to all dashboard layouts. Contrast accessibility score raised to AA.' }
    ],
    [
      { sender: 'user', content: 'Identify why Slack OAuth endpoint triggers a 401 error.' },
      { sender: 'ai', content: 'Slack Auth client loaded. Inspected callback traces. The auth header was missing the Bearer prefix.\n\n```javascript\n// Refactored header call\nheaders: {\n  Authorization: `Bearer ${token}`\n}\n```\n\nValidated mock exchange. Redirect completes safely now.' }
    ]
  ];

  // Global functions exposed to window
  window.loadAgent = (name, icon, badge) => {
    currentAgentName.innerText = name;
    currentAgentAvatar.innerText = icon;
    
    // Clear chat and add system welcome bubble
    chatMessages.innerHTML = '';
    const welcome = document.createElement('div');
    welcome.className = 'message ai';
    welcome.innerHTML = `
      <div class="message-avatar">${icon}</div>
      <div class="message-content">
        <p>Hello! I am your <strong>${name}</strong> agent. I have successfully integrated with your pipeline.</p>
        <p>Ask me anything regarding my <strong>${badge}</strong> credentials or trigger a task execution.</p>
      </div>
    `;
    chatMessages.appendChild(welcome);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    showToast(`Loaded ${name}`);
  };

  window.loadChat = (chatIndex) => {
    const listItems = document.querySelectorAll('.chat-sidebar .sidebar-item');
    listItems.forEach((item, idx) => {
      item.classList.toggle('active', idx === chatIndex);
    });

    chatMessages.innerHTML = '';
    const logs = simulatedChats[chatIndex];
    
    logs.forEach(log => {
      const bubble = document.createElement('div');
      bubble.className = `message ${log.sender}`;
      
      const avatarIcon = log.sender === 'user' ? '👤' : currentAgentAvatar.innerText;
      
      // Basic markdown/code block parser for template logs
      let parsedContent = log.content;
      if (parsedContent.includes('```')) {
        parsedContent = parseMarkdown(parsedContent);
      } else {
        parsedContent = `<p>${parsedContent}</p>`;
      }

      bubble.innerHTML = `
        <div class="message-avatar">${avatarIcon}</div>
        <div class="message-content">${parsedContent}</div>
      `;
      chatMessages.appendChild(bubble);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    showToast(`Loaded recent chat history`);
  };

  // Helper markdown syntax parser
  function parseMarkdown(text) {
    // Code blocks regex matching
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let html = text.replace(codeRegex, (_, lang, code) => {
      return `
        <div class="code-block-wrapper">
          <div class="code-header">
            <span>${lang || 'code'}</span>
            <button class="copy-btn" onclick="copyCode(this)">
              <i data-lucide="clipboard" style="width: 12px; height: 12px;"></i>
              <span>Copy</span>
            </button>
          </div>
          <div class="code-content">${escapeHTML(code.trim())}</div>
        </div>
      `;
    });

    // Replace paragraphs
    html = html.split('\n\n').map(p => {
      if (p.trim().startsWith('<div')) return p;
      return `<p>${p}</p>`;
    }).join('');

    return html;
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  window.copyCode = (btn) => {
    const codeText = btn.closest('.code-block-wrapper').querySelector('.code-content').innerText;
    navigator.clipboard.writeText(codeText).then(() => {
      const label = btn.querySelector('span');
      const icon = btn.querySelector('i');
      label.innerText = 'Copied!';
      setTimeout(() => {
        label.innerText = 'Copy';
      }, 2000);
    });
  };

  // Handle message send submit
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      const filesCount = attachmentPreview.children.length;
      
      if (!text && filesCount === 0) return;

      // Add user message bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'message user';
      
      let attachmentText = '';
      if (filesCount > 0) {
        // Collect attachment chips html
        const chips = Array.from(attachmentPreview.children).map(chip => {
          const name = chip.querySelector('span').innerText;
          return `<div class="attachment-chip"><i data-lucide="file" style="width: 12px; height: 12px;"></i><span>${name}</span></div>`;
        }).join('');
        attachmentText = `<div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap;">${chips}</div>`;
      }

      userBubble.innerHTML = `
        <div class="message-avatar">👤</div>
        <div class="message-content">
          ${attachmentText}
          <p>${escapeHTML(text)}</p>
        </div>
      `;
      chatMessages.appendChild(userBubble);
      chatInput.value = '';
      
      // Clear attachments
      attachmentPreview.style.display = 'none';
      attachmentPreview.innerHTML = '';
      
      chatMessages.scrollTop = chatMessages.scrollHeight;
      if (typeof lucide !== 'undefined') lucide.createIcons();

      // Trigger thinking indicator
      thinkingIndicator.style.display = 'flex';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Simulate streaming response after delay
      setTimeout(() => {
        thinkingIndicator.style.display = 'none';
        
        const aiBubble = document.createElement('div');
        aiBubble.className = 'message ai';
        const avatar = currentAgentAvatar.innerText;
        aiBubble.innerHTML = `
          <div class="message-avatar">${avatar}</div>
          <div class="message-content" id="tempStreamingContent"></div>
        `;
        chatMessages.appendChild(aiBubble);
        
        const responseText = generateSmartResponse(text, currentAgentName.innerText);
        streamResponse(document.getElementById('tempStreamingContent'), responseText);
      }, 1500);
    });
  }

  // Answer response logic based on input keywords
  function generateSmartResponse(prompt, agent) {
    const p = prompt.toLowerCase();
    
    if (p.includes('code') || p.includes('css') || p.includes('javascript') || p.includes('html')) {
      return `I analyzed your design context. Here is an optimized script structure: \n\n\`\`\`javascript\n// Active viewport Intersection Observer\nconst observer = new IntersectionObserver((entries) => {\n  entries.forEach(entry => {\n    if (entry.isIntersecting) {\n      entry.target.classList.add('visible');\n    }\n  });\n});\n\`\`\`\n\nWould you like me to deploy this to production?`;
    }
    if (p.includes('pdf') || p.includes('file') || p.includes('document')) {
      return `Ingested document payload. I extracted **3 core action items**:\n1. Update deployment API credentials.\n2. Add responsive layouts for tablet view.\n3. Secure CORS policy guidelines.`;
    }
    if (p.includes('pricing') || p.includes('plan')) {
      return `Our pricing models are optimized for developer workflows. Standard Developer Pro package triggers a 14-day free trial on checkout, including unlimited concurrent prompt token streams.`;
    }
    
    return `Active Agent **${agent}** confirmed request. Ingesting query variables. Pipeline checks completed successfully. All dependencies are online. Let me know if you want me to compile code or run diagnostics.`;
  }

  // Stream characters like ChatGPT
  function streamResponse(container, text) {
    let index = 0;
    const speed = 15; // ms per char
    
    // Parse formatting templates
    const finalHtml = parseMarkdown(text);
    
    // Temporary text-only buffer, then switch to rich HTML once finished
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = finalHtml;
    
    const plainText = tempDiv.innerText;
    
    const interval = setInterval(() => {
      if (index < plainText.length) {
        // Appending text
        container.innerText = plainText.substring(0, index + 1);
        index++;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      } else {
        clearInterval(interval);
        // Switch to parsed HTML formatting
        container.innerHTML = finalHtml;
        container.removeAttribute('id');
        chatMessages.scrollTop = chatMessages.scrollHeight;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }, speed);
  }

  // Emoji picker click actions
  if (emojiToggleBtn && emojiPicker) {
    emojiToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const show = emojiPicker.style.display === 'none';
      emojiPicker.style.display = show ? 'grid' : 'none';
    });
    
    document.addEventListener('click', () => {
      emojiPicker.style.display = 'none';
    });
  }

  window.insertEmoji = (emoji) => {
    chatInput.value += emoji;
    chatInput.focus();
    emojiPicker.style.display = 'none';
  };

  // Attachment upload triggers
  if (attachmentBtn && fileInput) {
    attachmentBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      attachmentPreview.style.display = 'flex';
      
      files.forEach(file => {
        const chip = document.createElement('div');
        chip.className = 'attachment-chip';
        chip.innerHTML = `
          <i data-lucide="file" style="width: 12px; height: 12px;"></i>
          <span>${file.name}</span>
          <button type="button" onclick="this.parentElement.remove(); checkEmptyChips();">&times;</button>
        `;
        attachmentPreview.appendChild(chip);
      });

      if (typeof lucide !== 'undefined') lucide.createIcons();
      showToast(`Attached ${files.length} document(s)`);
    });
  }

  window.checkEmptyChips = () => {
    if (attachmentPreview.children.length === 0) {
      attachmentPreview.style.display = 'none';
    }
  };

  // Drag & drop file simulation
  const chatContainer = document.querySelector('.chat-container');
  if (chatContainer) {
    chatContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      chatContainer.style.borderColor = 'rgba(139, 92, 246, 0.6)';
    });

    chatContainer.addEventListener('dragleave', () => {
      chatContainer.style.borderColor = 'var(--border-color)';
    });

    chatContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      chatContainer.style.borderColor = 'var(--border-color)';
      
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        attachmentPreview.style.display = 'flex';
        files.forEach(file => {
          const chip = document.createElement('div');
          chip.className = 'attachment-chip';
          chip.innerHTML = `
            <i data-lucide="file" style="width: 12px; height: 12px;"></i>
            <span>${file.name}</span>
            <button type="button" onclick="this.parentElement.remove(); checkEmptyChips();">&times;</button>
          `;
          attachmentPreview.appendChild(chip);
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
        showToast(`Dropped ${files.length} file(s) into workspace`);
      }
    });
  }

  // Voice recording button simulation
  if (voiceRecBtn) {
    let voiceRecording = false;
    voiceRecBtn.addEventListener('click', () => {
      if (voiceRecording) return;
      voiceRecording = true;
      voiceRecBtn.style.color = '#ef4444'; // Red alert
      voiceRecBtn.classList.add('pulse');
      chatInput.value = 'Listening...';
      chatInput.disabled = true;
      showToast('Recording voice input (simulated)...');

      setTimeout(() => {
        chatInput.disabled = false;
        chatInput.value = 'Deploy database sync nodes to production replica';
        voiceRecBtn.style.color = 'var(--text-muted)';
        voiceRecBtn.classList.remove('pulse');
        voiceRecording = false;
        showToast('Speech compiled successfully');
      }, 3000);
    });
  }


  // --- TOAST NOTIFICATIONS SYSTEM ---
  window.showToast = (message) => {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i data-lucide="check-circle" style="width: 16px; height: 16px; stroke: var(--accent-success);"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Auto-remove toast after 4s
    setTimeout(() => {
      toast.style.animation = 'slide-in-right 0.3s ease-in reverse forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  };


  // --- COMMAND RUN ACTIONS ---
  window.cmdRun = (action) => {
    toggleCommandPalette(false);
    
    switch (action) {
      case 'deploy-agent':
        document.getElementById('agents').scrollIntoView({behavior: 'smooth'});
        showToast('Displaying agent workspace templates');
        break;
      case 'toggle-model':
        const modelSelector = document.getElementById('modelSelector');
        if (modelSelector) {
          modelSelector.focus();
          showToast('Select workspace model provider');
        }
        break;
      case 'view-docs':
        showToast('Opening developer documentation portal');
        break;
      case 'clear-chat':
        chatMessages.innerHTML = '';
        showToast('Cleared active chat history log');
        break;
      case 'settings':
        showToast('Opening workspace system settings');
        break;
    }
  };

  // --- MOBILE NAV TOGGLE ---
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const show = navLinks.style.display === 'flex';
      navLinks.style.display = show ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '70px';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.background = 'rgba(3, 0, 20, 0.95)';
      navLinks.style.padding = '2rem';
      navLinks.style.gap = '1.5rem';
    });
  }
});
