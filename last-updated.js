document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('last-updated');
  if (!el) return;

  const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.',
                  'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];

  const now = new Date();
  el.textContent = `${months[now.getMonth()]} ${now.getFullYear()}`;
});
