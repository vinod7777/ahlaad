<?php
require 'db_config.php';
$c = getDB();
$c->query("UPDATE events_timeline SET day=1 WHERE day IS NULL OR day=0");
$res = $c->query("SELECT count(*) as cnt FROM events_timeline WHERE day=2");
if ($res->fetch_assoc()['cnt'] == 0) {
    $c->query("INSERT INTO events_timeline (day, name, category, status, time_slot, venue) VALUES (2, 'Short Films Screening', 'Media', 'upcoming', '10:00 AM', 'Mini Auditorium'),(2, 'Dance — Western Group', 'Dance', 'upcoming', '1:00 PM', 'Main Stage'),(2, 'Valedictory & Prize Distribution', 'Main Event', 'upcoming', '4:30 PM', 'Open Air Theater')");
}
echo "Done";
?>
