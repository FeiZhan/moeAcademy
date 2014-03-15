<?php
require_once('../lib/simplehtmldom/simple_html_dom.php');
$URL_HEAD = 'http://zh.moegirl.org';
$FRONT_PAGE = '/%E5%88%9D%E6%98%A5%E9%A5%B0%E5%88%A9';
$PARSE_NUM = 500;

$url_done = array();
$url_todo = array($FRONT_PAGE);
$all = array();
$dom = null;
function loadUrls()
{
	global $url_done, $url_todo;
	$filename = "../data/url.json";
	if (file_exists($filename))
	{
		$json = json_decode(file_get_contents($filename), true);
		$url_done = array_unique(array_merge($json, $url_done), SORT_REGULAR);
		echo "loaded " . $filename . " " . count($url_done) . "\n";
	}
	$filename = "../data/url_todo.json";
	if (file_exists($filename))
	{
		$json = json_decode(file_get_contents($filename), true);
		$url_todo = array_unique(array_merge($json, $url_todo), SORT_REGULAR);
		echo "loaded " . $filename . " " . count($url_todo) . "\n";
	}
}
function parsePage($page)
{
	global $all, $dom;
	$info = array("link" => $page);
	// parse heading
	$span = $dom->find('#firstHeading span');
	if (count($span) > 0)
	{
		$info["name"] = $span[0]->innertext;
	}
	// parse first paragraph
	$div = $dom->find('#mw-content-text');
	if (count($div) > 0)
	{
		foreach ($div[0]->children as $key => $value)
		{
			if ("p" != $value->tag)
			{
				continue;
			}
			$info["firstp"] = array();
			$a = $value->find("a");
			foreach ($a as $key => $value)
			{
				array_push($info["firstp"], $value->innertext);
			}
			$bold = $value->find("b");
			foreach ($bold as $key => $value)
			{
				array_push($info["firstp"], $value->innertext);
			}
			break;
		}
	}
	// parse content table
	$table = $dom->find('#mw-content-text table');
	foreach ($table as $key => $value)
	{
		if ("" != $value->class && " " != $value->class)
		{
			continue;
		}
		$img = $value->find('tbody tr td a img');
		foreach($img as $key2 => $value2)
		{
			$src = $value2->src;
			if ("" == $src || " " == $src)
			{
				continue;
			}
			$info["photo"] = $src;
			break;
		}
		$content = $value->find('tr');
		foreach($content as $key2 => $value2)
		{
			$th = $value2->find("th");
			if (0 == count($th) || "" == $th[0]->innertext || " " == $th[0]->innertext || strlen($th[0]->innertext) > 100)
			{
				continue;
			}
			$link = $th[0]->find("a");
			if (count($link) > 0 && "" != $link[0]->innertext && " " != $link[0]->innertext)
			{
				$th = $link;
			}
			$td = $value2->find("td");
			if (0 == count($td) || "" == $td[0]->innertext || " " == $td[0]->innertext)
			{
				continue;
			}
			$link = $td[0]->find("a");
			if (count($link) > 0 && "" != $link[0]->innertext && " " != $link[0]->innertext)
			{
				$td = $link;
			}
			$info[ $th[0]->innertext ] = $td[0]->innertext;
		}
	}
	// parse category links
	$li = $dom->find('#mw-normal-catlinks ul li');
	$info["catlinks"] = array();
	foreach ($li as $key => $value)
	{
		$link = $value->find("a");
		$has_link = false;
		foreach ($link as $key2 => $value2)
		{
			$has_link = true;
			array_push($info["catlinks"], $value2->innertext);
		}
		if (! $has_link)
		{
			array_push($info["catlinks"], $value->innertext);
		}
	}
	array_push($all, $info);
}
function parseLink()
{
	global $url_todo, $dom;
	$info = array();
	$table = $dom->find('#mw-content-text .navbox');
	//$table = $dom->find('#mw-content-text');
	foreach ($table as $key => $value)
	{
		$links = $value->find('.navbox-list a');
		//$links = $value->find('a');
		foreach ($links as $key2 => $value2)
		{
			$href = $value2->href;
			if ("/index" != substr($href, 0, 6) && "#" != substr($href, 0, 1) && "//zh.moegirl.org" != substr($href, 0, 16) && ! in_array($href, $url_todo))
			{
				array_push($url_todo, $href);
			}
		}
	}
}

loadUrls();
$count = -1;
while (count($all) < $PARSE_NUM && count($url_todo) > 0)
{
	++ $count;
	$page = $URL_HEAD . $url_todo[$count];
	echo "crawling page " . $count . ", link " . count($url_todo) . " : " . $page . "\n";
	$dom = file_get_html($page);
	if (null == $dom)
	{
		continue;
	}
	parsePage($page);
	parseLink();
	array_push($url_done, $url_todo[$count]);
	unset($url_todo[$count]);
	//unset($dom);
	//sleep(1);
}
echo "writing back, don't close....\n";
file_put_contents("../data/url.json", json_encode($url_done));
file_put_contents("../data/url_todo.json", json_encode($url_todo));
file_put_contents("../data/raw" . date('Y-m-d H:i:s') . ".json", json_encode($all));
echo "done " . count($url_done) . ", todo " . count($url_todo) . "\n";
?>
