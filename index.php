<?php
logIt("GET: " . json_encode($_GET));
logIt("_REQUEST: " . json_encode($_REQUEST));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = $_REQUEST;
    if (!empty($_REQUEST['j'])) {
        $data = json_decode($_REQUEST['j'], true);
    }
    if (!empty($_FILES)) {
        handleFiles($data);
    }
    outputJson(handleData($data));
    exit;
} elseif (isset($_GET['j'])) {
    $data = json_decode($_REQUEST['j'], true);
    outputJson(handleData($data));
    exit;
} else {
    // regular page load, e.g. /?about-us
    $urlKeys = array_keys($_GET);
    $page = $urlKeys[0] ?? 'home';
    $templateFolder = "template/";
    $data = loadJson();
    $templates = loadTemplates("template");
    outputPage($data, $templates, $page);
}

// end of request handler -----

function outputPage($data, $templates, $page) {
    require_once 'Parsedown.php';
    $Parsedown = new Parsedown();
    $version = rand(100000, 999999);
    
    $thisPage = $data['page'][$page];
    if (!isset($thisPage)) {
        $thisPage = errorPage($page);
    }
    $thisPage['title'] = empty($thisPage['title']) ? "&nbsp;" : $thisPage['title'];

    $pageContent = $templates['page'];
   
    $nextSection = 0;
    $content = "";
    foreach ($thisPage['section'] as $section => $sectionData) {
 
        $nextSection++;
        $thisTemplate = empty($sectionData['template']) ? $templates['section'] : $templates[$sectionData['template']];

        $imageHtml = "";
        if (file_exists("image/_{$page}_{$section}.jpg")) {
            $imageHtml = "<img class='section-image' src='image/_{$page}_{$section}.jpg' />";
        } elseif (file_exists("image/_{$page}_{$section}.png")) {
            $imageHtml = "<img class='section-image' src='image/_{$page}_{$section}.png' />";
        }
        $content .= str_replace([
            "{{section}}",
            "{{date}}",
            "{{content}}",
            "{{image}}"
        ], [
            $section,
            $sectionData['date'] ?? '',
            $Parsedown->text($sectionData['content']),
            $imageHtml
        ], $thisTemplate);
    }
    $nextSection = sprintf("%03d", ++$nextSection);

    $pageContent = str_replace(
        [
            "{{siteName}}", 
            "{{pageName}}",
            "{{page}}",
            "{{footer}}",
            "{{nav}}",
            "{{content}}",
            "{{nextSection}}",
            "{{v}}"
        ],
        [
            $data['site-name'],
            $thisPage['title'],
            $page,
            $data['footer'],
            buildNav($data),
            $content,
            $nextSection,
            $version
        ], 
        $pageContent);

    echo $pageContent;
}


// TODO: thiss should just be another page in json like login and other hidden but editable using a sspecific template if needed
function errorPage($page) {
    return [
        "title" => "Page Not Found",
        "section" => [
            "001" => [
                "content" => "The page '${page}' does not exist.\n\nReturn to the home page: <a href='?'>Home</a>"
            ]
        ]
    ];
}

function emptyPage() {
    return [
        "title" => "New Page",
        "section" => [
            "001" => [
                "content" => "This is a new page. Edit this content and save to create a new page."
            ]
        ]
    ];
}

function handleFiles($data) {
    if (isset($_FILES['image'])) {
        $tmpPath = $_FILES['image']['tmp_name'];
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        // $filename = basename($_FILES['image']['name']);
        $destination = "image/_{$data['page']}_{$data['section']}.{$ext}";
        // $destination = 'image/' . $filename;
        move_uploaded_file($tmpPath, $destination);
    }
}

// $data is a json object with enough info so we know if its loading or saving
// this always returns a json object
function handleData($data) {
    logIt("handling data: " . json_encode($data));
    $json = array();
    if (isset($data['content']) || isset($data['title']) || isset($data['nav'])) {
        $json = saveContent($data);
    } elseif (isset($data['code'])) {
        $json = setEditor($data['code']);
    } elseif (isset($data['edit'])) {
        $json = editSite();        
    } else {
        $json = loadContent($data['page'], $data['section']);
    }
    return $json;
}

function validEditor() {
    $valid = loadJson("_editors.json") ?? [];
    return isset($valid[$_SERVER['REMOTE_ADDR']]);
}

function editSite() {
    $data = loadJson();
    return [
        "siteName" => $data['site-name'],
        "nav" => implode("\n", $data['nav']),
        "footer" => $data['footer']
    ];
}

// read either a page or a pages section (even the whole site?) and fed the data to the front end as json
function loadContent($page, $section) {
    if (!validEditor()) {
        return ["error" => "Unauthorized"];
    }
    $data = loadJson();
    $content = array();
    if (empty($data['page'][$page])) {
        $content = emptyPage();
    }
    $content = $data['page'][$page]['section'][$section] ?? null;
    $content['page'] = $page;
    $content['section'] = $section;
    return $content;
}

// manipulating files on disk ----

function loadJson($file = "_data.json") {
    return json_decode(file_get_contents($file), true);
}

function saveJson($data, $file = "_data.json") {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

function saveContent($new) {
    if (!validEditor()) {
        return ["error" => "Unauthorized"];
    }
    $json = array();
    $page = cleanString($new['page']);
    $title = $new['title'] ?? '';
    $section = cleanString($new['section'] ?? '');
    $template = cleanString($new['template'] ?? '');
    $date = $new['date'] ?? '';
    $content = $new['content'] ?? '';
    $siteName = $new['siteName'] ?? '';
        $nav = $new['nav'] ?? '';
            $footer = $new['footer'] ?? '';
    logIt("saving {$siteName}, {$nav}, {$footer}, {$page}, {$title}, {$section}, {$template}, {$date}, {$content}");
    // saving a page and a section
    $data = loadJson();
    if (!empty($page)) {
        if (!empty($section)) {
            logIt("saving {$page}:{$section} with {$date}, {$content}");
            $data['page'][$page]['section'][$section] = [
                "date" => $date,
                "template" => $template,
                "content" => $content
            ];
        } else {
          logIt("saving {$page} {$title}");
          $data = loadJson();
          $data['page'][$page]['title'] = $title;
        }
    } elseif (!empty($siteName)) {
        $data['site-name'] = $siteName;
        $data['nav'] = explode("\n", trim($nav));
        $data['footer'] = $footer;
    }

    saveJson($data);
    return array("status" => "success");
}

function loadTemplates($folder) {
    $files = scandir($folder);
    $templates = [];
    foreach ($files as $file) {
        if (in_array($file, [".", ".."])) {
            continue;
        }
        $fileName = str_replace(".html", "", $file);
        $templates[$fileName] = file_get_contents("${folder}/${file}");
    }
    return $templates;
}

// manipulate data ---

function buildNav($data) {
    $html = '';
    $icons = array("home" => '<i class="fas fa-home"></i>');
    foreach($data['nav'] as $item ) {
        $item = trim($item);
        $caption = $icons[$item] ?? "";
        if (empty($caption)) {
            $caption = $data['page'][$item]['title'] ?? prettyText($item);
        }
        $html .= "<div class='nav-item'><a href='?{$item}'>{$caption}</a></div>";
    }
    return $html;
}

function setEditor($newCode) {
    $code = file_get_contents("_code.txt");

    if ($newCode == $code) {
        $valid = loadJson("_editors.json") ?? [];
        $valid[$_SERVER['REMOTE_ADDR']] = true;
        saveJson($valid, "_editors.json");
        return ["code" => $code];
    } else {
        return array("error" => "Code [${newCode}] is not quite right. Think about your favourite thing to eat.");
    }
}


// utilities ------------------------

function prettyText ($snakeCase) {
    return ucfirst(str_replace('-', ' ', $snakeCase));
}

function logIt($str) {
  $dateTime = date('Ymd H:i:s');
  file_put_contents('_log.txt', "{$dateTime},{$_SERVER['REMOTE_ADDR']},{$str}\n", FILE_APPEND | LOCK_EX);
}

function cleanString($str) {
  $str = preg_replace('/[^a-z0-9-_]/i', '', $str);
  return substr($str, 0, 30);
}

function outputJson($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
}