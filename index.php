<?php

// send recieve json data
$jsonData = $_REQUEST['j'] ?? '';
if (!empty($jsonData)) {
    $data = json_decode($jsonData, true);
    outputJson(handleData($data));
    exit;
}

// outputting html
$templateFolder = "template/";
$urlKeys = array_keys($_GET);
$section = $_GET['section'] ?? '001';
$page = $urlKeys[0] ?? 'home';

$data = loadData();
$templates = loadTemplates("template");

outputPage($data, $templates, $page);

// end of request handler -----

function outputPage($data, $templates, $page) {
    require_once 'Parsedown.php';
    $Parsedown = new Parsedown();
    $hasCode = isset($_GET['code']) && $_GET['code'] == file_get_contents("_code");
    
    $thisPage = $data['page'][$page];
    if (!isset($thisPage)) {
        $thisPage = errorPage($page);
    }

    $pageContent = $templates['page'];
    $pageContent = str_replace(
        [
        "{{siteName}}", 
        "{{pageName}}",
        "{{page}}",
        "{{footer}}",
        "{{nav}}"
        ],
        [
        $data['site-name'],
        $thisPage['title'],
        $page,
        $data['footer'],
        buildNav($data['nav'])
        ], 
        $pageContent);


    $content = "";
    foreach ($thisPage['section'] as $section => $sectionData) {
        $thisTemplate = empty($section['template']) ? $templates['section'] : $templates['special'];
        $content .= str_replace([
            "{{section}}",
            "{{date}}",
            "{{content}}"
        ], [
            $section,
            $sectionData['date'],
            $Parsedown->text($sectionData['content'])
        ], $thisTemplate);
    }

    $pageContent = str_replace("{{content}}", $content, $pageContent);

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

// $data is a json object with enough info so we know if its loading or saving
// this always returns a json object
function handleData($data) {
    $json = array();
    if (isset($data['content'])) {
        $json = saveContent($data);
    } else {
        $json = loadContent($data['page'], $data['section']);
    }
    return $json;
}

// read either a page or a pages section (even the whole site?) and fed the data to the front end as json
function loadContent($page, $section) {
    $data = loadData();
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

function loadData() {
    return json_decode(file_get_contents("_data.json"), true);
}

function saveContent($new) {
    $json = array();
    $page = cleanString($new['page']);
    $section = cleanString($new['section'] ?? '');
    $template = cleanString($new['template'] ?? '');
    $date = $new['date'] ?? '';
    $content = $new['content'] ?? '';

    logIt("saving {$page}:{$section} with {$date}, {$content}");
    // saving a page and a section
    if (!empty($page)) {
        if (!empty($section)) {
            $data = loadData();
            $data['page'][$page]['section'][$section] = [
                "date" => $date,
                "template" => $template,
                "content" => $content
            ];
        } else {
          // TODO: adding/editing a page heading
        }
    }
    
    file_put_contents("_data.json", json_encode($data, JSON_PRETTY_PRINT));
    return $json;
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

function buildNav($navItems) {
    $html = '<div class="nav">';
    foreach($navItems as $item ) {
        $caption = prettyText($item);
        $html .= "<div class='nav-item'><a href='?{$item}'>{$caption}</a></div>";
    }
    $html .= "</div>";

    return $html;
}

// utilities ------------------------

function prettyText ($snakeCase) {
    return $snakeCase;
}

function logIt($str) {
  $dateTime = date('Ymd H:i:s');
  file_put_contents('_log.txt', "{$dateTime},{$_SERVER['REMOTE_ADDR']},{$str}\n", FILE_APPEND | LOCK_EX);
}

function cleanString($str) {
  $str = preg_replace('/[^a-z0-9]/i', '', $str);
  return substr($str, 0, 30);
}

function outputJson($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
}