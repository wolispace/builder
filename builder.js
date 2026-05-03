
document.addEventListener('DOMContentLoaded', async () => {
  $editor = isEditor();
  if ($editor) {
    // add universal edit button to editable
    document.querySelectorAll('.editable').forEach(section => {
      section.insertAdjacentHTML('beforeend',`<span class="editButton button rounded" onclick="editable(this.parentElement)"><i class="fas fa-pencil"></i></span>`);
    });

    const publishButton = document.querySelector('.publish');
    if (publishButton) {
      publishButton.addEventListener('click', () => publishSite());
      publishButton.style.display = 'block';
      publishButton.innerHTML = "Publish";
    }

    const exportButton = document.querySelector('.export');
    if (exportButton) {
      exportButton.addEventListener('click', () => exportData());
      exportButton.style.display = 'block';
      exportButton.innerHTML = "Export";
    }

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

    // hide blog content
    document.querySelectorAll('.hidable').forEach(hidable => {

    });

    // hide blog content
    document.querySelectorAll('.date').forEach(date => {
        if (!date.textContent.trim()) return;
        const hidable = date.parentElement.querySelector('.hidable');
        if (!hidable) return;
        hidable.insertAdjacentHTML('beforebegin', `<div class="more" onclick="expandMe(this)">More ▾</div>`);
    });
  } else {
    document.querySelector('.header h1').style.display = "none";
  }
});

async function publishSite() {
  if (!confirm('Are you ready to publish these changes to the live site for the world to see?')) {
    return;
  }
  const json = JSON.stringify({publish: 1});
  const response = await fetch(`?j=${json}`);
  const result = await response.json();
  alert('Done');
}

async function exportData() {
  const json = JSON.stringify({export: 1});
  const response = await fetch(`?j=${json}`);
  const result = await response.json();

  const $html = `<textarea class="export">${JSON.stringify(result, null, 2)}</textarea>`;
  showDialog($html, {save:0, delete:0, close:1});
}

function expandMe(btn) {
    btn.nextElementSibling.classList.toggle('expanded');
}


async function editable(element) {
  // extrat the d= param from the url and includ it in the json requests
  const urlParams = new URLSearchParams(window.location.search);
  let d = (urlParams.get('d') || '').match(/^\d+.*/)?.[0];
  
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
  d = d ? `&d=${d}` : '';
  const response = await fetch(`?j=${jsonData}${d}`);
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
  <div class="row">
    <select id="template" name="template">
    <option value="">Banner image</option>
    <option value="section_wrap_square" ${params.template == 'section_wrap_square' ? 'selected' : ''}>Wrapped square image</option>
    <option value="section_wrap_vertical" ${params.template == 'section_wrap_vertical' ? 'selected' : ''}>Wrapped vertical image</option>
    <option value="section_big_image" ${params.template == 'section_big_image' ? 'selected' : ''}>Full size image</option>
    <option value="section_yt" ${params.template == 'section_yt' ? 'selected' : ''}>Embedded YouTube</option>
    </select>
    <div class="checkbox">
      <label for="background">Background</label>
      <input type="checkbox" name="background" id="background" data-v='${params.background}' ${params.background == 'on' ? 'checked' : ''} </input>
    </div>
  </div>
  <label for="date">Date</label>
  <input type="text" id="date" name="date" value="${params.date || ''}">
  <label for="intro">Intro</label>
  <input type="text" id="intro" name="intro" value="${params.intro || ''}">
  <label for="content">Content</label>
  <textarea id="content" name="content">${params.content || ''}</textarea>
  <label for="image">Image</label>
  <input type="file" id="image" name="image" accept="image/*">
  <img class="image-thumbnail" src="?image=${params.page}&section=${params.section}" />
  <label for="imagedesc">Image description</label>
  <input type="text" id="imagedesc" name="imagedesc" value="${params.imagedesc || ''}">
  <input type="hidden" id="section" name="section" value="${params.section}">
  <input type="hidden" id="page" name="page" value="${params.page}">
  </form>`;

  showDialog(html, {delete:1});
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
  <label for="intro">Intro</label>
  <input type="text" id="intro" name="intro" value="${params.intro || ''}">
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
  <label for="image">Image</label>
  <input type="file" id="image" name="image" accept="image/*">
  <img class="image-thumbnail" src="?image=${params.page}" />
  <label for="imagedesc">Image description</label>
  <input type="text" id="imagedesc" name="imagedesc" value="${params.imagedesc || ''}">
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
  // strip off the d= param before reloading
  const search = window.location.search.replace(/&d=[^&]*/,'');
  window.location.replace(window.location.pathname + search);
}

async function deleteForm() {
  const page = document.querySelector('#page').value;
  const section = document.querySelector('#section').value;
  if (confirm(`Are you sure you want to delete section ${section} from ${page}`)) {
    const params = {
      delete: 1,
      page: page,
      section: section
    }
    const json = JSON.stringify(params);
    const response = await fetch(`?j=${json}`);
    const result = await response.json();
  }
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

function showDialog(html, params) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelector('.overlay').classList.add('visible');
  const dialog = document.querySelector('.dialog');

  let buttons = `<div class="dialogbuttons">`;
  if (params?.delete == 1) {
    buttons += `<div class="button" onclick="deleteForm()">Delete</div>`;
  }
  if (params?.close == 1) {
    buttons += `<div class="button" onclick="closeDialog()">Close</div>`;
  } else {
    buttons += `<div class="button" onclick="closeDialog()">Cancel</div>`;
  }
  if (params?.save != 0) {
    buttons += `<div class="button" onclick="saveForm()">Save</div>`;
  }
  buttons += '</div>';

  dialog.innerHTML = `<div class="dialog-close" onclick="closeDialog()"><i class="fas fa-close"></i></div>
  ${html}${buttons}`;
  dialog.classList.add('visible');

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