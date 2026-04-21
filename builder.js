
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Loading data...');
});

function editSection(element) {
  const raw = JSON.parse(element.getAttribute('data-raw'));
  let html = `
  <label>Date</label>
  <input type="text" name="date" value="${raw.date || ''}">
  <label>Content</label>
  <textarea name="content">${raw.content || ''}</textarea>
  <input type="hidden" name="key" value="${raw.key}">
  <input type="hidden" name="page" value="${raw.page}">`;

  showDialog(html);
}

function saveForm() {
    const formData = new FormData(document.querySelector('.dialog form'));
}

function showDialog(html) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelector('.overlay').classList.add('visible');
  const dialog = document.querySelector('.dialog');
  dialog.innerHTML = `<div class="dialog-close" onclick="closeDialog()"><i class="fas fa-close"></i></div>${html}`;
  dialog.classList.add('visible');

  let deleteButton = html.includes('name="date"') ? `<div class="button" onclick="deleteEvent()">Delete</div>` : '';

  dialog.innerHTML +=`<div class="dialogbuttons">
    ${deleteButton}
    <div class="button" onclick="closeDialog()">Cancel</div>
    <div class="button" onclick="saveForm()">Save</div>
    </div>`;
}

function closeDialog() {
  document.querySelector('.overlay').classList.remove('visible');
  document.querySelector('.dialog').classList.remove('visible');
}
