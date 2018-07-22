<?php

class Khronos_Moeda {
	public static function format ($value) {
		return number_format($value, 2, DMG_Translate::_('moeda.decimal'), DMG_Translate::_('moeda.milhar'));
	}
}
?>