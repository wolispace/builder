
document.addEventListener('DOMContentLoaded', async () => {
  $editor = true;
  if ($editor) {
    // find all sections and attach a click handler to editSection(this)
    document.querySelectorAll('section').forEach(section => {
      section.addEventListener('click', () => editContent(section));
    });
  }
});

async function editContent(element) {

  const params = {
    page: document.querySelector('.header').dataset.page,
    section: element.getAttribute('data-section')
  };

  const jsonData = encodeURIComponent(JSON.stringify(params));
  const response = await fetch(`?j=${jsonData}`);
  const result = await response.json();
  editSection(result);
}

function editSection(result) {
  console.log('Editing section', result);
  let html = `
  <label>Date</label>
  <input type="text" name="date" value="${result.date || ''}">
  <label>Content</label>
  <textarea name="content">${result.content || ''}</textarea>
  <input type="hidden" name="key" value="${result.key}">
  <input type="hidden" name="page" value="${result.page}">`;

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
