
document.addEventListener('DOMContentLoaded', async () => {
  $editor = isEditor();
  if ($editor) {
    // find all sections and attach a click handler to editSection(this)
    document.querySelectorAll('section').forEach(section => {
      section.addEventListener('click', () => editContent(section));
    });
    const page = document.querySelector('.header').dataset.page;
    const addSectionButton = document.querySelector('.add-section');
    if (addSectionButton) {
      const newSection = addSectionButton.innerHTML;
      
      addSectionButton.addEventListener('click', () => addSection(page, newSection));
      addSectionButton.style.display = 'block';
      addSectionButton.innerHTML = "+ Add a new section";
      
    }
    const addPageButton = document.querySelector('.add-page');
    if (addPageButton) {
      addPageButton.addEventListener('click', () => addPage());
      addPageButton.style.display = 'block';
      addPageButton.innerHTML = "+ Add a new page";
    }

    const pageTitle = document.querySelector('.page-name');
    const params = {
      page: document.querySelector('.header').dataset.page,
      title: pageTitle.innerText
    }
    pageTitle.addEventListener('click', () => editPage(params));
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

function editSection(section) {
  let html = `<div class="form">
  <label for="section">Section</label>
  <input type="text" id="section" value="${section.section || ''}">
  <label for="date">Date</label>
  <input type="text" id="date" value="${section.date || ''}">
  <label for="content">Content</label>
  <textarea id="content">${section.content || ''}</textarea>
  <input type="hidden" id="section" value="${section.section}">
  <input type="hidden" id="page" value="${section.page}">
  </div>`;

  showDialog(html);
}

function editPage(params) {
  console.log(params);
  editPage(parma);
}

function addPage() {
  const newPage = {
    page: '',
    title: ''
  };
  editPage(newPage);
}


function editPage(page) {
  let html = `<div class="form">
  <label for="page">Page</label>
  <input type="text" id="page" value="${page.page || ''}">
  <label for="title">Title</label>
  <input type="text" id="title" value="${page.title || ''}">
  </div>`;

  showDialog(html);
}
async function saveForm() {
  // TODO: need to work out why foem we are saving, currently its assuming section
  const formData = {};
  formData.page = document.querySelector('#page').value;

  if (document.querySelector('#title')) {
    formData.title = document.querySelector('#title').value;
  } else {
    formData.date = document.querySelector('#date').value;
    formData.content = document.querySelector('#content').value;
    formData.section = document.querySelector('#section').value;
  }

  const json = JSON.stringify(formData);
  const response = await fetch(`?j=${json}`);
  const result = await response.json();
  window.location.reload();
}

function addSection(page, section) {
  const newSection = {
    page: page,
    section: section,
    date: '',
    content: '',
    template: '',
  }
  editSection(newSection);
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

async function setEditor() {
 const params = {
    code: prompt("Enter your code")
  }
  const json = JSON.stringify(params);
  const response = await fetch(`?j=${json}`);
  const result = await response.json();
  if (result.code == params.code) {
    window.localStorage.setItem('code', params.code);
  }
  window.location.replace('/');
}

function isEditor() {
  const code = window.localStorage.getItem('code');
  return code !== null && code.length > 0;
}