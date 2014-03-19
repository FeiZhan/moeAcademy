<?php
function crawlPage()
{
	$page = $_POST["page"];
	$info = array("link" => $page);
	$dom = file_get_html($page);
	if (null == $dom)
	{
		echo "invalid page " . $page;
		return;
	}
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
	echo json_encode($info);
}
// call corresponding method according to $method
function callMethod ($func)
{
	if(is_null($func) || "" == $func || ! function_exists($func))
	{
		echo "invalid func: " . $func;
		return;
	}
	$func();
}
//call method specified by javascript
callMethod($_POST["func"]);
?>
