(function () {
  'use strict';

  // ============ ハンバーガーメニュー ============
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  // ============ ヘッダー スクロール影 ============
  window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) {
      header.style.boxShadow = window.scrollY > 10 ? '0 2px 16px rgba(0,0,0,0.12)' : 'none';
    }
  });

  // ============ 求人セレクトにJOBSデータを反映 ============
  const jobSelect = document.getElementById('jobTitle');
  const publishedJobs = (typeof JOBS !== 'undefined') ? JOBS.filter(j => j.publish) : [];

  if (jobSelect) {
    publishedJobs.forEach(job => {
      const opt = document.createElement('option');
      opt.value = job.title;
      opt.textContent = job.title;
      jobSelect.appendChild(opt);
    });

    // URLパラメータから職種を自動選択
    const params = new URLSearchParams(window.location.search);
    const jobParam = params.get('job');
    if (jobParam) {
      for (let i = 0; i < jobSelect.options.length; i++) {
        if (jobSelect.options[i].value === jobParam) {
          jobSelect.selectedIndex = i;
          break;
        }
      }

      // 応募先バナーを表示
      const banner = document.getElementById('applyJobBanner');
      const titleEl = document.getElementById('applyJobTitle');
      if (banner && titleEl) {
        titleEl.textContent = jobParam;
        banner.style.display = 'flex';
      }
    }
  }

  // ============ 応募フォーム送信（Formspree） ============
  const form       = document.getElementById('applyForm');
  const submitBtn  = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const successDiv = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitText.textContent = '送信中…';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.style.display = 'none';
          successDiv.classList.add('show');
          window.scrollTo({ top: 0, behavior: 'smooth' });
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

})();
