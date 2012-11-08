<?php
// Do not show error messages, for secure purposes
ini_set('display_errors', 0);

include_once('/home/k2maxis/etc/carma-db-config.php');
// include_once('../../carma-db-config.php');

$allowed_db_columns = array("manufacturer", "model", "year"); // "price"

$term_name = $_GET["termName"];
$term_value = $_GET["termValue"];

if (empty($term_name) || empty($term_value) || !in_array($term_name, $allowed_db_columns)) {
    echo "[]";
    exit();
}

$link = mysql_connect($mysql_host, $mysql_user, $mysql_password) or die('mysql_error'); // mysql_error(),

mysql_select_db($mysql_db);

$term_name = mysql_real_escape_string(trim($term_name));
$term_value = mysql_real_escape_string(trim(addCslashes($term_value, "\%_")));

$query = "SELECT distinct($term_name) FROM carma WHERE ($term_name) LIKE '$term_value%'";

$related_name1 = mysql_real_escape_string(trim($_GET["relatedName1"]));
$related_value1 = mysql_real_escape_string(trim($_GET["relatedValue1"]));
if (!empty($related_name1) && !empty($related_value1) && in_array($related_name1, $allowed_db_columns)) {
    $query = $query . " AND $related_name1 = '$related_value1'";
}

$related_name2 = mysql_real_escape_string(trim($_GET["relatedName2"]));
$related_value2 = mysql_real_escape_string(trim($_GET["relatedValue2"]));
if (!empty($related_name2) && !empty($related_value2) && in_array($related_name2, $allowed_db_columns)) {
    $query = $query . " AND $related_name2 = '$related_value2'";
}

$query = $query . " order by $term_name"; // echo $query; die();

$query_result = mysql_query($query) or die('mysql_error');

$rows = array();
while ($query_row = mysql_fetch_assoc($query_result)) {
    $rows[] = $query_row[$term_name];
}

mysql_free_result($query_result);
mysql_close($link);

print json_encode($rows);
?>
