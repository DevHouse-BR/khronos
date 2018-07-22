Ext.UpdateManager.defaults.indicatorText = '<?php echo DMG_Translate::_('i18n.loading'); ?>';
if(Ext.View) {
	Ext.View.prototype.emptyText = "";
}
if(Ext.grid.GridPanel) {
	Ext.grid.GridPanel.prototype.ddText = "<?php echo DMG_Translate::_('i18n.ddText'); ?>";
}
if(Ext.TabPanelItem) {
	Ext.TabPanelItem.prototype.closeText = "<?php echo DMG_Translate::_('i18n.closeText'); ?>";
}
if(Ext.form.Field) {
	Ext.form.Field.prototype.invalidText = "<?php echo DMG_Translate::_('i18n.invalidText'); ?>";
}
if(Ext.LoadMask) {
	Ext.LoadMask.prototype.msg = "<?php echo DMG_Translate::_('i18n.loading'); ?>";
}
Date.monthNames = [
	"<?php echo DMG_Translate::_('i18n.monthNames.january'); ?>",
	"<?php echo DMG_Translate::_('i18n.monthNames.february'); ?>",
	"<?php echo DMG_Translate::_('i18n.monthNames.march'); ?>",
	"<?php echo DMG_Translate::_('i18n.monthNames.april'); ?>",
	"<?php echo DMG_Translate::_('i18n.monthNames.may'); ?>",
	"<?php echo DMG_Translate::_('i18n.monthNames.june'); ?>",
	"<?php echo DMG_Translate::_('i18n.monthNames.july'); ?>",
	"<?php echo DMG_Translate::_('i18n.monthNames.august'); ?>",
	"<?php echo DMG_Translate::_('i18n.monthNames.september'); ?>",
	"<?php echo DMG_Translate::_('i18n.monthNames.october'); ?>",
	"<?php echo DMG_Translate::_('i18n.monthNames.november'); ?>",
	"<?php echo DMG_Translate::_('i18n.monthNames.december'); ?>"
];
Date.getShortMonthName = function(month) {
	return Date.monthNames[month].substring(0, 3);
};
Date.monthNumbers = {
	<?php echo DMG_Translate::_('i18n.monthNumbers.jan'); ?>: 0,
	<?php echo DMG_Translate::_('i18n.monthNumbers.feb'); ?>: 1,
	<?php echo DMG_Translate::_('i18n.monthNumbers.mar'); ?>: 2,
	<?php echo DMG_Translate::_('i18n.monthNumbers.apr'); ?>: 3,
	<?php echo DMG_Translate::_('i18n.monthNumbers.may'); ?>: 4,
	<?php echo DMG_Translate::_('i18n.monthNumbers.jun'); ?>: 5,
	<?php echo DMG_Translate::_('i18n.monthNumbers.jul'); ?>: 6,
	<?php echo DMG_Translate::_('i18n.monthNumbers.aug'); ?>: 7,
	<?php echo DMG_Translate::_('i18n.monthNumbers.sep'); ?>: 8,
	<?php echo DMG_Translate::_('i18n.monthNumbers.oct'); ?>: 9,
	<?php echo DMG_Translate::_('i18n.monthNumbers.nov'); ?>: 10,
	<?php echo DMG_Translate::_('i18n.monthNumbers.dec'); ?>: 11
};
Date.getMonthNumber = function(name) {
	return Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
};
Date.dayNames = [
	"<?php echo DMG_Translate::_('i18n.dayNames.sunday'); ?>",
	"<?php echo DMG_Translate::_('i18n.dayNames.monday'); ?>",
	"<?php echo DMG_Translate::_('i18n.dayNames.tuesday'); ?>",
	"<?php echo DMG_Translate::_('i18n.dayNames.wednesday'); ?>",
	"<?php echo DMG_Translate::_('i18n.dayNames.thursday'); ?>",
	"<?php echo DMG_Translate::_('i18n.dayNames.friday'); ?>",
	"<?php echo DMG_Translate::_('i18n.dayNames.saturday'); ?>"
];
if(Ext.MessageBox) {
	Ext.MessageBox.buttonText = {
		ok: "<?php echo DMG_Translate::_('i18n.messageBox.ok'); ?>",
		cancel: "<?php echo DMG_Translate::_('i18n.messageBox.cancel'); ?>",
		yes: "<?php echo DMG_Translate::_('i18n.messageBox.yes'); ?>",
		no: "<?php echo DMG_Translate::_('i18n.messageBox.no'); ?>"
	};
}
if (Ext.util.Format) {
	Ext.util.Format.date = function(v, format) {
		if (!v) return "";
		if (!(v instanceof Date)) v = new Date(Date.parse(v));
		return v.dateFormat(format || "<?php echo DMG_Translate::_('i18n.dateFormat'); ?>");
	};
<?php echo DMG_Translate::_('i18n.FormatDate'); ?>
}
if(Ext.DatePicker) {
	Ext.apply(Ext.DatePicker.prototype, {
		todayText: "<?php echo DMG_Translate::_('i18n.datePicker.todayText'); ?>Hoje",
		minText: "<?php echo DMG_Translate::_('i18n.datePicker.minText'); ?>Esta data &eacute; anterior a menor data",
		maxText: "<?php echo DMG_Translate::_('i18n.datePicker.maxText'); ?>Esta data &eacute; posterior a maior data",
		disabledDaysText: "",
		disabledDatesText: "",
		monthNames: Date.monthNames,
		dayNames: Date.dayNames,
		nextText: '<?php echo DMG_Translate::_('i18n.datePicker.nextText'); ?>',
		prevText: '<?php echo DMG_Translate::_('i18n.datePicker.prevText'); ?>',
		monthYearText: '<?php echo DMG_Translate::_('i18n.datePicker.monthYearText'); ?>',
		todayTip: "<?php echo DMG_Translate::_('i18n.datePicker.todayTip'); ?>",
		format: "<?php echo DMG_Translate::_('i18n.datePicker.format'); ?>",
		okText: "<?php echo DMG_Translate::_('i18n.datePicker.okText'); ?>",
		cancelText: "<?php echo DMG_Translate::_('i18n.datePicker.cancel'); ?>",
		startDay: <?php echo DMG_Translate::_('i18n.datePicker.startDay'); ?>
	});
}
if(Ext.PagingToolbar) {
	Ext.apply(Ext.PagingToolbar.prototype, {
		beforePageText: "<?php echo DMG_Translate::_('i18n.PagingToolbar.beforePageText'); ?>",
		afterPageText: "<?php echo DMG_Translate::_('i18n.PagingToolbar.afterPageText'); ?>",
		firstText: "<?php echo DMG_Translate::_('i18n.PagingToolbar.firstText'); ?>",
		prevText: "<?php echo DMG_Translate::_('i18n.PagingToolbar.prevText'); ?>",
		nextText: "<?php echo DMG_Translate::_('i18n.PagingToolbar.nextText'); ?>",
		lastText: "<?php echo DMG_Translate::_('i18n.PagingToolbar.lastText'); ?>",
		refreshText: "<?php echo DMG_Translate::_('i18n.PagingToolbar.refreshText'); ?>",
		displayMsg: "<?php echo DMG_Translate::_('i18n.PagingToolbar.displayMsg'); ?>",
		emptyMsg: '<?php echo DMG_Translate::_('i18n.PagingToolbar.emptyMsg'); ?>'
	});
}
if(Ext.form.TextField) {
	Ext.apply(Ext.form.TextField.prototype, {
		minLengthText: "<?php echo DMG_Translate::_('i18n.TextField.minLengthText'); ?>",
		maxLengthText: "<?php echo DMG_Translate::_('i18n.TextField.maxLengthText'); ?>",
		blankText: "<?php echo DMG_Translate::_('i18n.TextField.blankText'); ?>",
		regexText: "",
		emptyText: null
	});
}
if(Ext.form.NumberField) {
	Ext.apply(Ext.form.NumberField.prototype, {
		minText : "<?php echo DMG_Translate::_('i18n.NumberField.minText'); ?>",
		maxText : "<?php echo DMG_Translate::_('i18n.NumberField.maxText'); ?>",
		nanText : "<?php echo DMG_Translate::_('i18n.NumberField.nanText'); ?>"
	});
}
if(Ext.form.DateField) {
	Ext.apply(Ext.form.DateField.prototype, {
		disabledDaysText: "<?php echo DMG_Translate::_('i18n.DateField.disabledDaysText'); ?>",
		disabledDatesText: "<?php echo DMG_Translate::_('i18n.DateField.disabledDatesText'); ?>",
		minText: "<?php echo DMG_Translate::_('i18n.DateField.minText'); ?>",
		maxText: "<?php echo DMG_Translate::_('i18n.DateField.maxText'); ?>",
		invalidText: "<?php echo DMG_Translate::_('i18n.DateField.invalidText'); ?>",
		format: "<?php echo DMG_Translate::_('i18n.DateField.format'); ?>"
	});
}
if(Ext.form.ComboBox) {
	Ext.apply(Ext.form.ComboBox.prototype, {
		loadingText: "<?php echo DMG_Translate::_('i18n.ComboBox.loadingText'); ?>",
		valueNotFoundText : undefined
	});
}
if(Ext.form.VTypes) {
	Ext.apply(Ext.form.VTypes, {
		emailText: '<?php echo DMG_Translate::_('i18n.VTypes.emailText'); ?>',
		urlText: '<?php echo DMG_Translate::_('i18n.VTypes.urlText'); ?>',
		alphaText: '<?php echo DMG_Translate::_('i18n.VTypes.alphaText'); ?>',
		alphanumText: '<?php echo DMG_Translate::_('i18n.VTypes.alphanumText'); ?>'
	});
}
if(Ext.form.HtmlEditor) {
	Ext.apply(Ext.form.HtmlEditor.prototype, {
		createLinkText: '<?php echo DMG_Translate::_('i18n.HtmlEditor.createLinkText'); ?>',
		buttonTips: {
			bold: {
				title: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.bold.title'); ?>',
				text: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.bold.text'); ?>',
				cls: 'x-html-editor-tip'
			},
			italic: {
				title: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.italic.title'); ?>',
				text: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.italic.text'); ?>',
				cls: 'x-html-editor-tip'
			},
			underline: {
				title: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.underline.title'); ?>',
				text: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.underline.text'); ?>',
				cls: 'x-html-editor-tip'
			},
			increasefontsize: {
				title: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.increasefontsize.title'); ?>',
				text: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.increasefontsize.text'); ?>',
				cls: 'x-html-editor-tip'
			},
			decreasefontsize: {
				title: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.decreasefontsize.title'); ?>',
				text: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.decreasefontsize.text'); ?>',
				cls: 'x-html-editor-tip'
			},
			backcolor: {
				title: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.backcolor.title'); ?>',
				text: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.backcolor.text'); ?>',
				cls: 'x-html-editor-tip'
			},
			forecolor: {
				title: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.forecolor.title'); ?>',
				text: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.forecolor.text'); ?>',
				cls: 'x-html-editor-tip'
			},
			justifyleft: {
				title: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.justifyleft.title'); ?>',
				text: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.justifyleft.text'); ?>',
				cls: 'x-html-editor-tip'
			},
			justifycenter: {
				title: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.justifycenter.title'); ?>',
				text: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.justifycenter.text'); ?>',
				cls: 'x-html-editor-tip'
			},
			justifyright: {
				title: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.justifyright.title'); ?>',
				text: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.justifyright.text'); ?>',
				cls: 'x-html-editor-tip'
			},
			insertunorderedlist: {
				title: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.insertunorderedlist.title'); ?>',
				text: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.insertunorderedlist.text'); ?>',
				cls: 'x-html-editor-tip'
			},
			insertorderedlist: {
				title: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.insertorderedlist.title'); ?>',
				text: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.insertorderedlist.text'); ?>',
				cls: 'x-html-editor-tip'
			},
			createlink: {
				title: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.createlink.title'); ?>',
				text: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.createlink.text'); ?>',
				cls: 'x-html-editor-tip'
			},
			sourceedit: {
				title: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.sourceedit.title'); ?>',
				text: '<?php echo DMG_Translate::_('i18n.HtmlEditor.buttonTips.sourceedit.text'); ?>',
				cls: 'x-html-editor-tip'
			}
		}
	});
}
if(Ext.grid.GridView) {
	Ext.apply(Ext.grid.GridView.prototype, {
		sortAscText: "<?php echo DMG_Translate::_('i18n.GridView.sortAscText'); ?>",
		sortDescText: "<?php echo DMG_Translate::_('i18n.GridView.sortDescText'); ?>",
		lockText: "<?php echo DMG_Translate::_('i18n.GridView.lockText'); ?>",
		unlockText: "<?php echo DMG_Translate::_('i18n.GridView.unlockText'); ?>",
		columnsText: "<?php echo DMG_Translate::_('i18n.GridView.columnsText'); ?>"
	});
}
if(Ext.grid.PropertyColumnModel) {
	Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
		nameText: "<?php echo DMG_Translate::_('i18n.PropertyColumnModel.nameText'); ?>",
		valueText: "<?php echo DMG_Translate::_('i18n.PropertyColumnModel.valueText'); ?>",
		dateFormat: "<?php echo DMG_Translate::_('i18n.PropertyColumnModel.dateFormat'); ?>"
	});
}
if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion) {
	Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
		splitTip: "<?php echo DMG_Translate::_('i18n.BorderLayout.splitTip'); ?>",
		collapsibleSplitTip: "<?php echo DMG_Translate::_('i18n.BorderLayout.collapsibleSplitTip'); ?>"
	});
}