<?php

class DMG_Date {
	public static function now () {
		return date('Y-m-d H:i:s');
	}
	public static function getDaysInWeek($weekNumber, $year) {
		$time = strtotime($year . '0104 +' . ($weekNumber - 1) . ' weeks');
		
		$mondayTime = strtotime('-' . (date('w', $time) - 1) . ' days', $time);
		
		$dayTimes = array ();
		for($i = 0; $i < 7; ++$i){
			$dayTimes[] = strtotime('+' . $i . ' days', $mondayTime);
		}
		
		return $dayTimes;
	}
}