<?php
// Do not show error messages, for secure purposes
ini_set('display_errors', 0);

include_once('/home/k2maxis/etc/carma-db-config.php');
// include_once('../../carma-db-config.php');

$manufacturer = trim($_GET["manufacturer"]);
$model = trim($_GET["model"]);
$year = trim($_GET["year"]);

if (empty($manufacturer) || empty($model) || empty($year) || !intval($year)) {
    print json_encode(array('msg' => "Please fill out all input fields with correct values", 'type' => "warning"));
    exit();
}

$link = mysql_connect($mysql_host, $mysql_user, $mysql_password) or die('mysql_error'); // mysql_error(),

mysql_select_db($mysql_db);

$manufacturer = mysql_real_escape_string($manufacturer);
$model = mysql_real_escape_string($model);
$year = intval(mysql_real_escape_string($year));

$query = "SELECT price, num_cars, price_trend FROM carma WHERE manufacturer='$manufacturer' AND model='$model' AND year=$year ORDER BY price"; // echo $query; die();

$query_result = mysql_query($query) or die('mysql_error');

$rows = array();
while ($query_row = mysql_fetch_assoc($query_result)) {
    $rows[] = array('price' => $query_row["price"], 'num_cars' => $query_row["num_cars"], 'price_trend' => $query_row["price_trend"]);
}

mysql_free_result($query_result);
mysql_close($link);

if (count($rows) == 0) {
	$response = array('msg' => "No cars found, please try again", 'type' => "warning");
} else {
	$response = $rows[0];
	$response['count'] = count($rows);
}

print json_encode($response);
?>
