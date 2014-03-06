<?php
require_once('lib/simplehtmldom/simple_html_dom.php');
$URL_HEAD = 'http://zh.moegirl.org';
$FRONT_PAGE = '/%E5%88%9D%E6%98%A5%E9%A5%B0%E5%88%A9';
$PARSE_NUM = 500;
$page_list = array($FRONT_PAGE);
$all = array();
$count = 0;
function parsePage($page)
{
	global $all;
	$dom = file_get_html($page);
	if (null == $dom)
	{
		return;
	}
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
	unset($dom);
}
function parseLink($page)
{
	global $page_list;
	$dom = file_get_html($page);
	if (null == $dom)
	{
		return;
	}
	$info = array();
	$table = $dom->find('#mw-content-text .navbox');
	foreach ($table as $key => $value)
	{
		$links = $value->find('.navbox-list a');
		foreach ($links as $key2 => $value2)
		{
			$href = $value2->href;
			if ("/index." != substr($href, 0, 7) && ! in_array($href, $page_list))
			{
				array_push($page_list, $href);
			}
		}
	}
	unset($dom);
}
while (count($all) < $PARSE_NUM)
{
	if ($count >= count($page_list))
	{
		break;
	}
	$page = $URL_HEAD . $page_list[$count ++];
	echo "page " . $count . ": " . $page . "\n";
	parsePage($page);
	parseLink($page);
	if (0 != $count && 0 == $count % 500)
	{
		echo "dumping " . ($count / 500 - 1) . "\n";
		file_put_contents("data/raw" . ($count / 500 - 1) . ".json", json_encode($all));
		//$all = array();
	}
	//sleep(2);
}
file_put_contents("data/raw.json", json_encode($all));
echo "done\n";
?>
