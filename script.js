(function () {
  'use strict';

  // ============ ハンバーガーメニュー ============
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  hamburger.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  // ============ ヘッダー スクロール影 ============
  window.addEventListener('scroll', () => {
    document.getElementById('header').style.boxShadow =
      window.scrollY > 10 ? '0 2px 16px rgba(0,0,0,0.12)' : 'none';
  });

  // ============ FAQ アコーディオン ============
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ============ 求人情報の描画 ============
  const publishedJobs = (typeof JOBS !== 'undefined') ? JOBS.filter(j => j.publish) : [];

  // 応募フォームの職種セレクトにも反映
  const jobSelect = document.getElementById('jobTitle');
  if (jobSelect) {
    publishedJobs.forEach(job => {
      const opt = document.createElement('option');
      opt.value = job.title;
      opt.textContent = job.title;
      jobSelect.appendChild(opt);
    });
  }

  function getBadgeClass(type) {
    if (!type) return '';
    if (type.includes('パート') || type.includes('アルバイト')) return ' part';
    if (type.includes('契約')) return ' contract';
    return '';
  }

  function renderJobs(jobs) {
    const grid = document.getElementById('jobsGrid');
    if (!grid) return;
    if (!jobs.length) {
      grid.innerHTML = '<p class="no-jobs">現在募集中の求人はありません。</p>';
      return;
    }
    grid.innerHTML = jobs.map(job => `
      <div class="job-card" data-id="${job.id}" role="button" tabindex="0">
        <span class="job-type-badge${getBadgeClass(job.type)}">${esc(job.type)}</span>
        <h3 class="job-title">${esc(job.title)}</h3>
        <div class="job-meta">
          <div class="job-meta-row"><span class="job-meta-label">📍 勤務地</span><span class="job-meta-value">${esc(job.location)}</span></div>
          <div class="job-meta-row"><span class="job-meta-label">💰 給与</span><span class="job-meta-value">${esc(job.salary)}</span></div>
          <div class="job-meta-row"><span class="job-meta-label">🕐 時間</span><span class="job-meta-value">${esc(job.workHours)}</span></div>
          <div class="job-meta-row"><span class="job-meta-label">🏖️ 休日</span><span class="job-meta-value">${esc(job.holiday)}</span></div>
        </div>
        <div class="job-card-footer"><span class="btn-detail">詳細を見る →</span></div>
      </div>`).join('');

    grid.querySelectorAll('.job-card').forEach(card => {
      card.addEventListener('click', () => {
        const job = publishedJobs.find(j => j.id === parseInt(card.dataset.id));
        if (job) openModal(job);
      });
    });
  }

  renderJobs(publishedJobs);

  // ============ フィルター ============
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      renderJobs(f === 'all' ? publishedJobs : publishedJobs.filter(j => j.type && j.type.includes(f)));
    });
  });

  // ============ モーダル ============
  const overlay    = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');

  function openModal(job) {
    document.getElementById('modalContent').innerHTML = `
      <span class="job-type-badge${getBadgeClass(job.type)}" style="margin-bottom:16px;">${esc(job.type)}</span>
      <h2>${esc(job.title)}</h2>
      <div class="modal-section">
        <div class="modal-section-title">仕事内容</div>
        <div class="modal-section-body">${nl2br(esc(job.description))}</div>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">勤務条件</div>
        <div class="modal-section-body">
          📍 勤務地：${esc(job.location)}<br>
          💰 給与：${esc(job.salary)}<br>
          🕐 勤務時間：${esc(job.workHours)}<br>
          🏖️ 休日・休暇：${esc(job.holiday)}<br>
          🎁 福利厚生：${esc(job.welfare)}
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">応募要件</div>
        <div class="modal-section-body">${nl2br(esc(job.requirements))}</div>
      </div>`;

    // モーダルの「応募する」ボタンに職種をURLパラメータで渡す
    const applyBtn = document.getElementById('modalApplyBtn');
    if (applyBtn) {
      applyBtn.href = 'apply.html?job=' + encodeURIComponent(job.title);
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // ============ 応募フォーム（Formspree） ============
  const form       = document.getElementById('applyForm');
  const submitBtn  = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const successDiv = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // ボタンをローディング状態に
      submitBtn.disabled = true;
      submitText.textContent = '送信中…';

      const data = new FormData(form);

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.style.display = 'none';
          successDiv.classList.add('show');
          window.scrollTo({ top: document.getElementById('apply').offsetTop - 80, behavior: 'smooth' });
        } else {
          const json = await res.json();
          alert(json.errors ? json.errors.map(e => e.message).join('\n') : '送信に失敗しました。お電話でお問い合わせください。');
          submitBtn.disabled = false;
          submitText.textContent = '応募する';
        }
      } catch {
        alert('通信エラーが発生しました。お電話でお問い合わせください。');
        submitBtn.disabled = false;
        submitText.textContent = '応募する';
      }
    });
  }

  // ============ ユーティリティ ============
  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function nl2br(str) { return str.replace(/\n/g, '<br>'); }

})();
