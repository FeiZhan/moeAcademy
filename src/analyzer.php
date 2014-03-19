<?php
$all_data = array();
$moegirls = array();
$count = 0;
function mergeData()
{
	global $all_data, $count;
	$DIR = '../data/';
    if ($handle = opendir($DIR))
    {
		$BLACKLIST = array(".", "..", "url.json", "url_todo.json", "test.json", "raw.json");
        while (false !== ($entry = readdir($handle)))
        {
            if (in_array($entry, $BLACKLIST))
            {
				continue;
            }
            $filename = $DIR . $entry;
			if (file_exists($filename))
			{
				$json = json_decode(file_get_contents($filename), true);
				$all_data = array_unique(array_merge($json, $all_data), SORT_REGULAR);
				//$all_data = array_merge($json, $all_data);
				echo "loaded " . $filename . " " . count($json) . "\n";
			}
            ++ $count;
        }
        closedir($handle);
   }
}
function cleanUpData($arr)
{
	if (gettype($arr) == "string")
	{
		return rtrim(ltrim($arr));
	}
	else if (gettype($arr) == "array")
	{
		$clean = array();
		foreach ($arr as $index => $value)
		{
			$clean[cleanUpData($index)] = $value;
		}
		return $clean;
	}else
	{
		return $arr;
	}
}
function cleanUpAll()
{
	global $all_data;
	$all_clean = array();
	foreach ($all_data as $index => $value)
	{
		$clean = array();
		foreach ($value as $i => $v)
		{
			$clean[cleanUpData($i)] = $v;
		}
		array_push($all_clean, $clean);
	}
	$all_data = array_unique($all_clean, SORT_REGULAR);
}
function segmentKeywords($raw)
{
	$tmp_all = array();
	$tmp = explode('、', $raw);
	foreach ($tmp as $value)
	{
		$tmp3 = explode('；', $value);
		$tmp_all = array_merge($tmp3, $tmp_all);
	}
	if (0 == count($tmp_all))
	{
		array_push($tmp_all, $raw);
	}
	return $tmp_all;
}
function checkMoegirl($json)
{
	if (! array_key_exists('声优', $json) && ! array_key_exists('身高', $json) && ! array_key_exists('年龄', $json))
	{
		return;
	}
	if (array_key_exists('别号', $json) && gettype($json['别号']) == "string")
	{
		$tmp_all = segmentKeywords($json['别号']);
		$json['别号'] = array_unique($tmp_all, SORT_REGULAR);
	}
	if (array_key_exists('萌点', $json) && gettype($json['萌点']) == "string")
	{
		$tmp_all = segmentKeywords($json['萌点']);
		$json['萌点'] = array_unique($tmp_all, SORT_REGULAR);
	}
	global $moegirls;
	array_push($moegirls, $json);
	//echo "find moegirl " . $json["本名"] . "\n";
}

mergeData();
echo "find files ". $count . " , jsons " . count($all_data) . "\n";
cleanUpAll();
echo "saving data, don't close...\n";
file_put_contents("../data/raw.json", json_encode($all_data));
echo "find files ". $count . " , jsons " . count($all_data) . "\n";
foreach ($all_data as $index => $value)
{
	checkMoegirl($value);
}
echo "saving data, don't close...\n";
file_put_contents("../data/moegirls.json", json_encode($moegirls));
echo "find moegirls " . count($moegirls) . "\n";
?>
