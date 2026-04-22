
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
  console.log({jsonData});
  const response = await fetch(`?j=${jsonData}`);
  const result = await response.json();
  editSection(result);
}

function editSection(result) {
  console.log('Editing section', result);
  let html = `<div class="form">
  <label for="date">Date</label>
  <input type="text" id="date" value="${result.date || ''}">
  <label for="content">Content</label>
  <textarea id="content">${result.content || ''}</textarea>
  <input type="hidden" id="key" value="${result.key}">
  <input type="hidden" id="page" value="${result.page}">
  </div>`;

  showDialog(html);
}

function saveForm() {
  const formData = {
    date: document.querySelector('#date').value,
    content:  document.querySelector('#content').value,
    page: document.querySelector('#page').value,
    key: document.querySelector('#key').value
  }
  console.log(formData);
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
