<?php
require 'db_config.php';
$conn = getDB();
$res = $conn->query("SELECT id, name, email, role FROM users");
while($row = $res->fetch_assoc()){
  print_r($row);
}
?>
