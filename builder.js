
document.addEventListener('DOMContentLoaded', async () => {
  $editor = isEditor();
  if ($editor) {
    // add universal edit button to editable
    document.querySelectorAll('.editable').forEach(section => {
      section.insertAdjacentHTML('beforeend',`<span class="editButton button rounded" onclick="editable(this.parentElement)"><i class="fas fa-pencil"></i></span>`);
    });

    const addSectionButton = document.querySelector('.add-section');
    if (addSectionButton) {
      const page = document.querySelector('.header').dataset.page;
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
  } else {
    document.querySelector('.header h1').style.display = "none";
  }
});

async function editable(element) {
  const params = {};

  if (element.dataset.load == "site") {
     params.load = 'site';
  }
  
  if (['section','page'].includes(element.dataset.load)) {
    params.load = 'page';
    params.page = element.dataset.page;
  } 
  if (['section'].includes(element.dataset.load)) {
    params.load = 'section';
    params.section = element.dataset.section;
  } 

  const jsonData = encodeURIComponent(JSON.stringify(params));
  const response = await fetch(`?j=${jsonData}`);
  const result = await response.json();
  if (element.dataset.load == "site") {
    editSite(result);
  } else if(element.dataset.load == 'page') {
    editPage(result);
  } else {
    editSection(result);
  };
}

function editSection(params) {
  let html = `<form class="form">
  <input type="hidden" name="save" value="section" />
  <label for="section">Section</label>
  <input type="text" id="section" name="section" value="${params.section || ''}">
  <label for="template">Template</label>
  <select id="template" name="template">
   <option value="">With background</option>
   <option value="section_nb" ${params.template == 'section_nb' ? 'selected' : ''}>Without background</option>
   <option value="section_nb_wrap" ${params.template == 'section_nb_wrap' ? 'selected' : ''}>Wrapped image without background</option>
   <option value="section_yt" ${params.template == 'section_yt' ? 'selected' : ''}>Embedded YouTube</option>
  </select>
  <label for="date">Date</label>
  <input type="text" id="date" name="date" value="${params.date || ''}">
  <label for="content">Content</label>
  <textarea id="content" name="content">${params.content || ''}</textarea>
  <label for="image">Image</label>
  <input type="file" id="image" name="image" accept="image/*">
  <img class="image-thumbnail" src="?image=${params.page}&section=${params.section}" />
  <input type="hidden" id="section" name="section" value="${params.section}">
  <input type="hidden" id="page" name="page" value="${params.page}">
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

function editPage(params) {
  let html = `<form class="form">
  <input type="hidden" name="save" value="page" />
  <label for="page">Page</label>
  <input type="text" id="page" name="page" value="${params.page || ''}">
  <label for="title">Title</label>
  <input type="text" id="title" name="title" value="${params.title || ''}">
  <label for="template">Template</label>
  <select id="template" name="template">
   <option value="">Standard page layout</option>
   <option value="home" ${params.template == 'home' ? 'selected' : ''}>Home page layout</option>
  </select> 
  <label for="sort">Sort sections</label>
  <select id="sort" name="sort">
   <option value="">Oldest first</option>
   <option value="desc" ${params.sort == 'desc' ? 'selected' : ''}>Newest first</option>
  </select>
  </form>`;

  showDialog(html);
}

async function editSite(params) {
  let html = `<form class="form">
  <input type="hidden" name="save" value="site" />
  <label for="name">Site name</label>
  <input type="text" id="name" name="name" value="${params.name || ''}">
  <label for="logotext">Logo sub-text</label>
  <input type="text" id="logotext" name="logotext" value="${params.logotext || ''}">
  <label for="tagline">Tag line</label>
  <input type="text" id="tagline" name="tagline" value="${params.tagline || ''}">
  <label for="nav">Menu</label>
  <textarea id="nav" name="nav">${params.nav || ''}</textarea>
  <label for="footer">Footer</label>
  <textarea id="footer" name="footer">${params.footer || ''}</textarea>
  </form>`;
  showDialog(html);
}


async function saveForm() {
  const form = document.querySelector('form.form');
  const formData = new FormData(form);
  await fetch('', { method: 'POST', body: formData });
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