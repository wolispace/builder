<?php

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
} elseif (isset($_GET['image'])) {
    outputImage();
    exit;    
} else {
    // regular page load, e.g. /?about-us
    $urlKeys = array_keys($_GET);
    $page = $urlKeys[0] ?? 'home';
    $dataFile = !empty($_GET['d']) ? "_backups/_{$_GET['d']}_data.json" : '_data.json';
    $data = loadJson($dataFile);
    outputPage($data, $page);
}

// end of request handler -----

function outputPage($data, $page) {
    $templates = loadTemplates("template");
    require_once 'Parsedown.php';
    $Parsedown = new Parsedown();
    $version = rand(100000, 999999);
    
    $thisPage = $data['page'][$page];
    if (!isset($thisPage)) {
        $thisPage = errorPage($page);
    }
    $thisPage['title'] = empty($thisPage['title']) ? "&nbsp;" : $thisPage['title'];

    $pageTemplate = empty($thisPage['template']) ? 'page' : $thisPage['template'];
    $pageContent = $templates[$pageTemplate];

    if (isset($thisPage['sort'])) {

        if ($thisPage['sort'] == "desc") {
            krsort($thisPage['section']);
        } else {
            ksort($thisPage['section']);
        }
    }

    $nextSection = 0;
    $sections = "";
    foreach ($thisPage['section'] as $section => $sectionData) {
 
        $nextSection++;
        $thisTemplate = empty($sectionData['template']) ? $templates['section'] : $templates[$sectionData['template']];

        $content = $sectionData['content'];
        if ($sectionData['template'] != "section_yt") {
            $content = $Parsedown->text($sectionData['content']);
        }

        $sections .= str_replace([
            "{{page}}",
            "{{section}}",
            "{{template}}",
            "{{date}}",
            "{{content}}",
            "{{image}}"
        ], [
            $page,
            $section,
            $sectionData['template'] ?? 'section',
            $sectionData['date'] ?? '',
            $content,
            buildImage($page, $section, $sectionData['template'], $sectionData['imagedesc'] ?? '')
        ], $thisTemplate);
    }
    $nextSection = sprintf("%03d", ++$nextSection);

    $tagline = '';
    if (!empty($data['tagline'])) {
        $tagline = "<div class='tagline'>{$data['tagline']}</div>";
    }
    if ($pageTemplate == 'revisions') {
        $sections = buildRevisions();
    }

    $revisions = buildRevisions($page);

    $pageContent = str_replace(
        [
            "{{name}}", 
            "{{logotext}}",
            "{{title}}",
            "{{tagline}}",
            "{{page}}",
            "{{sort}}",
            "{{footer}}",
            "{{nav}}",
            "{{sections}}",
            "{{cards}}",
            "{{nextSection}}",
            "{{revisions}}",
            "{{v}}"
        ],
        [
            $data['name'],
            $data['logotext'],
            $thisPage['title'],
            $tagline,
            $page,
            $thisPage['sort'] ?? '',
            $Parsedown->text($data['footer']),
            buildNav($data),
            $sections,
            buildCards($data),
            $nextSection,
            $revisions,
            $version
        ], 
        $pageContent);

    echo $pageContent;
}

function buildImage($page, $section, $template, $imagedesc) {
    $html = '';
    $filename = '';
        if (file_exists("image/_{$page}_{$section}.jpg")) {
            $filename = "image/_{$page}_{$section}.jpg";
        } elseif (file_exists("image/_{$page}_{$section}.png")) {
            $filename = "image/_{$page}_{$section}.png";
        } elseif (file_exists("image/_{$page}.jpg")) {
            $filename = "image/_{$page}.jpg";
        } elseif (file_exists("image/_{$page}.png")) {
            $filename = "image/_{$page}.png";
        }
        if (empty($filename)) {
            return '';
        }

        $html = "<img class='image_{$template}' src='{$filename}' alt='{$imagedesc}' />";
        
    return $html;
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

function buildRevisions($page = '') {
    $html = '';
    $files = scandir('_backups');
    $count = 0;
    foreach ($files as $file) {
        if (in_array($file, [".", ".."])) {
            continue;
        }
        if (!empty($page) && !strpos($file, $page)) {
            continue;
        }
        $count++;
        preg_match('/(\d+)/', $file, $matches);
        $YmdHis = $matches[1];
        $date = DateTime::createFromFormat('YmdHis', $YmdHis);
        $dateString = $date->format('D d M Y H:i:s');
        preg_match('/\d_(\w+)_/', $file, $matches);
        $thisPage = $matches[1];
        if(!empty($thisPage)) {
            $html .= "<div class='revision'><a href='?{$thisPage}&d={$YmdHis}_{$thisPage}' target='_blank'>{$dateString} {$thisPage}</a></div>";
        } else {
            $html .= "<div class='revision'><a href='?home&d={$YmdHis}' target='_blank'>{$dateString} homepage</a></div>";
            
        }
    }
    if ($count > 0) {
        return "<fieldset class='revisions'><legend>Revisions</legend>{$html}</fieldset>";
    }
    return '';
}

function handleFiles($data) {
    if (isset($_FILES['image'])) {
        $tmpPath = $_FILES['image']['tmp_name'];
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        if(!empty($data['section'])) {
            $destination = "image/_{$data['page']}.{$ext}";
        } else {
            $destination = "image/_{$data['page']}_{$data['section']}.{$ext}";
        }
        move_uploaded_file($tmpPath, $destination);
    }
}

// $data is a json object with enough info so we know if its loading or saving
// this always returns a json object
function handleData($data) {
    logIt("handling data: " . json_encode($data));
    $json = array();
    // load data for editing
    if (isset($data['load'])) {
        $json = loadContent($data);   
    } elseif (isset($data['code'])) {
        $json = setEditor($data['code']);
    } else {
        $json = saveContent($data);
    }
    return $json;
}

function validEditor() {
    $valid = loadJson("_editors.json") ?? [];
    return isset($valid[$_SERVER['REMOTE_ADDR']]);
}

// read either a page or a pages section (even the whole site?) and fed the data to the front end as json
function loadContent($params) {
    if (!validEditor()) {
        return ["error" => "Unauthorized"];
    }
    $dataFile = !empty($_GET['d']) ? "_backups/_{$_GET['d']}_data.json" : '_data.json';
    $data = loadJson($dataFile);
    $content = $params;

    if ($params['load'] == 'page') {
        if (empty($data['page'][$params['page']])) {
            $content = array_merge(emptyPage(), $content);
        } else {
            $content = array_merge($data['page'][$params['page']], $content);
            // dont need to send the sections
            unset($content['section']);
        }
    } elseif ($params['load'] == 'section') {
        $content = array_merge($data['page'][$params['page']]['section'][$params['section']], $content);
    } else {
        $content = $data;
        $content['nav'] = implode("\n", $content['nav']);
        // dont need to send the pages
        unset($content['page']);
    }
    return $content;
}

function saveContent($new) {
    if (!validEditor()) {
        return ["error" => "Unauthorized"];
    }
    $data = loadJson();
    $page = cleanString($new['page']) ?? '';
    backup($data, $page);
    $section = cleanString($new['section'] ?? '');
    $template = cleanString($new['template'] ?? '');
    if ($new['save'] == 'site') {
        $data['name'] = $new['name'] ?? '';
        $data['logotext'] = $new['logotext'] ?? '';
        $data['tagline'] = $new['tagline'] ?? '';
        $data['nav'] = stringToArray($new[nav]);
        $data['footer'] = $new['footer'] ?? '';
    } elseif ($new['save'] == 'page') {
        if (empty($data['page'][$page])) {
            $data['page'][$page] = array();
        }
        $data['page'][$page]['title'] = $new['title'] ?? '';
        $data['page'][$page]['template'] = $template;
        $data['page'][$page]['sort'] = cleanString($new['sort'] ?? '');
        $data['page'][$page]['imagedesc'] = $new['imagedesc'] ?? '';
    } elseif ($new['save'] == 'section') {
        if (empty($data['page'][$page]['section'][$section])) {
            $data['page'][$page]['section'][$section] = array();
        }
        $data['page'][$page]['section'][$section]['date'] = $new['date'] ?? '';
        $data['page'][$page]['section'][$section]['template'] = $template; 
        $data['page'][$page]['section'][$section]['content'] = $new['content'] ?? '';
        $data['page'][$page]['section'][$section]['imagedesc'] = $new['imagedesc'] ?? '';
        
    } else {
        // no idea wat we are saving
        logIt('No ideal how to save ' . json_encode($new));
        return array("status" => "Dont know what to save");
    }
    saveJson($data);
    return array("status" => "success");
}

function backup($data, $page = '') {
    $YmdHis = date('YmdHis');
    $filename = "_backups/_{$YmdHis}_data.json";
    if (!empty($page)) {
        $filename = "_backups/_{$YmdHis}_{$page}_data.json";
        $pageData = $data['page'][$page];
        // wipe all other pages as they were not part of this save
        if (!empty($page)) {
            $data['page'] = [];
            $data['page'][$page] = $pageData;
        }
    }
    saveJson($data, $filename);
    // roll off old backups
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
        $html .= "<a class='nav-item' href='?{$item}'>{$caption}</a>";
    }
    return $html;
}

function buildCards($data) {
    $html = '<div class="cards">';
    foreach($data['nav'] as $item ) {
        $item = trim($item);
        if ($item == 'home') {
            continue;
        }

        $imageHtml = buildImage($item, null, null, $data['page'][$item]['imagedesc'] ?? '');
        $title = $data['page'][$item]['title'] ?? prettyText($item);
        $intro = $data['page'][$item]['intro'] ?? '';
        
        $html .= "<a class='card' href='?{$item}'>";
        $html .= "<div class='card-title'>{$title}</div>";
        $html .= "<div class='card-intro'>{$intro}</div>";
        $html .= $imageHtml;
        $html .= "</a>";
    }
    $html .= "</div>";
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

function stringToArray($nlString) {
    $nlString = str_replace("\r", '', $nlString);
    $bits = explode("\n", $nlString);
    return array_map('trim', $bits);
}

function outputJson($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
}

function outputImage() {
    $page = $_GET['image'];
    $section = $_GET['section'] ?? '';
    $extTypes = array('jpg', 'png');
    foreach ($extTypes as $ext) {
        $fileName = "image/_{$page}_.{$ext}";
        if (!empty($section)) {
            $fileName = "image/_{$page}_{$section}.{$ext}"; 
        }
       if (file_exists($fileName)) {
            header("Content-Type: image/{$ext}");
            readfile($fileName);
            return;
       }
    }
    header("Content-Type: image/png");
    readfile('image/blank.png');

}

// manipulating files on disk ----

function loadJson($file = "_data.json") {
    return json_decode(file_get_contents($file), true);
}

function saveJson($data, $file = "_data.json") {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}
