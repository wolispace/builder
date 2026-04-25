
document.addEventListener('DOMContentLoaded', async () => {
  $editor = isEditor();
  if ($editor) {
    // add universal edit button to editable
    document.querySelectorAll('.editable').forEach(section => {
      section.insertAdjacentHTML('beforeend',`<div class="editButton" onclick="editable(this.parentElement)"><i class="fas fa-pencil"></i></div>`);
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
      title: pageTitle.innerText,
      sort: document.querySelector('.header').dataset.sort,
    }
    pageTitle.addEventListener('click', () => editPage(params));

    const siteName = document.querySelector('.site-name');
    siteName.addEventListener('click', () => editSite());

  } else {
    document.querySelector('.header h1').style.display = "none";
  }
});

async function editable(element) {
    const params = {
    page: element.dataset.page,
    section: element.dataset.section
  };

  const jsonData = encodeURIComponent(JSON.stringify(params));
  const response = await fetch(`?j=${jsonData}`);
  const result = await response.json();
  editSection(result);
}

function editSection(section) {
  let html = `<form method="post" class="form">
  <label for="section">Section</label>
  <input type="text" id="section" name="section" value="${section.section || ''}">
  <label for="template">Template</label>
  <select id="template" name="template">
   <option value="">With background</option>
   <option value="section_nb" ${section.template == 'section_nb' ? 'selected' : ''}>Without background</option>
  </select>
  <label for="date">Date</label>
  <input type="text" id="date" name="date" value="${section.date || ''}">
  <label for="content">Content</label>
  <textarea id="content" name="content">${section.content || ''}</textarea>
  <label for="image">Image</label>
  <input type="file" id="image" name="image" accept="image/*">
  <input type="hidden" id="section" name="section" value="${section.section}">
  <input type="hidden" id="page" name="page" value="${section.page}">
  </form>`;

  showDialog(html);
}

function editPage(params) {
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
  let html = `<form class="form">
  <label for="page">Page</label>
  <input type="text" id="page" name="page" value="${page.page || ''}">
  <label for="title">Title</label>
  <input type="text" id="title" name="title" value="${page.title || ''}">
  <label for="sort">Sort sections</label>
  <select id="sort" name="sort">
   <option value="">Oldest first</option>
   <option value="desc" ${page.sort == 'desc' ? 'selected' : ''}>Newest first</option>
  <select>
  </form>`;

  showDialog(html);
}

async function editSite() {
  const params = {edit: 'site'};
  const json = JSON.stringify(params);
  const result = await fetch(`?j=${json}`);
  const site = await result.json();

  let html = `<form class="form">
  <label for="site-name">Site name</label>
  <input type="text" id="site-name" name="siteName" value="${site.siteName || ''}">
  <label for="nav">Menu</label>
  <textarea id="nav" name="nav">${site.nav || ''}</textarea>
  <label for="footer">Footer</label>
  <textarea id="footer" name="footer">${site.footer || ''}</textarea>
  </form>`;
  showDialog(html);
}


async function saveForm() {

  const form = document.querySelector('form.form');
  const formData = new FormData(form);
  await fetch('', { method: 'POST', body: formData });
  window.location.reload();
/*
  // TODO: need to work out why foem we are saving, currently its assuming section
  const formData = {};
  if (document.querySelector('#page')) {
    formData.page = document.querySelector('#page').value;
  }

  if (document.querySelector('#title')) {
    formData.title = document.querySelector('#title').value;
  } 

  if (formData.content = document.querySelector('#content')) {
    formData.date = document.querySelector('#date').value;
    formData.content = document.querySelector('#content').value;
    formData.section = document.querySelector('#section').value;
  }

  if (document.querySelector('#nav')) {
    formData.siteName = document.querySelector('#site-name').value;
    formData.nav = document.querySelector('#nav').value;
    formData.footer = document.querySelector('#footer').value;
  } 
  
  const imageInput = document.querySelector('#image');
  if (imageInput && imageInput.files[0]) {
    formData.append('image', imageInput.files[0]);
  }

  const response = await fetch('', {
    method: 'POST',
    body: formData   // no Content-Type header — browser sets multipart/form-data automatically
  });
  window.location.reload();
  */
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
    window.location.replace('/');
  } else {
    alert(result.error);
  }
}

function clearEditor() {
  window.localStorage.clear('code');
  window.location.replace('/');
}

function isEditor() {
  const code = window.localStorage.getItem('code');
  return code !== null && code.length > 0;
}

function toggleNav() {
  const nav = document.querySelector('.nav');
  // eve though css appears to set 'none' its initially blank
  nav.style.display = (!nav.style.display || nav.style.display == 'none') ? 'flex' : 'none';
}