<?php

$templateFolder = "template/";
$section = $_GET['section'] ?? '001';

$urlKeys = array_keys($_GET);
$page = $urlKeys[0] ?? 'home';

$data = json_decode(file_get_contents("_data.json"), true);
$pageTemplate = file_get_contents("${templateFolder}page.html");
$sectionTemplate = file_get_contents("${templateFolder}section.html");
$specialTemplate = file_get_contents("${templateFolder}special.html");

$templates = loadTemplates("template");

outputPage($data, $templates, $page);

function outputPage($data, $templates, $page) {
    require_once 'Parsedown.php';
    $Parsedown = new Parsedown();
    
    $thisPage = $data['page'][$page];
    if (!isset($thisPage)) {
        $thisPage = errorPage($page);
    }

    $pageContent = $templates['page'];
    $pageContent = str_replace("{{siteName}}", $data['site-name'], $pageContent);
    $pageContent = str_replace("{{pageName}}", $data['page'][$page]['title'], $pageContent);

    $content = "";
    foreach ($thisPage['section'] as $key => $section) {
        $thisTemplate = empty($section['template']) ? $templates['section'] : $templates['special'];
        $content .= str_replace([
            "{{key}}",
            "{{date}}",
            "{{content}}"
        ], [
            $key,
            $section['date'],
            $Parsedown->text($section['content'])
        ], $thisTemplate);
    }

    $pageContent = str_replace("{{content}}", $content, $pageContent);

    echo $pageContent;
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

function errorPage($page) {
    return [
        "title" => "Page Not Found",
        "section" => [
            "001" => [
                "date" => "",
                "content" => "The page '${page}' does not exist.\n\nReturn to the home page: <a href='?'>Home</a>"
            ]
        ]
    ];
}