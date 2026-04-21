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
   $html = $Parsedown->text($markdownContent);

    $thisPage = $data['page'][$page];
    if (!isset($thisPage)) {
        $thisPage = [
            "title" => "Page Not Found",
            "section" => [
                "001" => [
                    "content" => "I can't find **${page}**."
                ]
            ]
        ];
    }

    $pageTemplate = $templates['page'];
    $pageTemplate = str_replace("{{siteName}}", $data['site-name'], $pageTemplate);
    $pageTemplate = str_replace("{{pageName}}", $data['page'][$page]['title'], $pageTemplate);

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

    $pageTemplate = str_replace("{{content}}", $content, $pageTemplate);

    echo $pageTemplate;
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
