document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("last-updated");
  if (!el) return; // prevents errors if the element isn't on the page

  const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.",
                  "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

  const now = new Date();
  const formattedDate = `${months[now.getMonth()]} ${String(now.getFullYear())}`;

  el.textContent = formattedDate;
});
