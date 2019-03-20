jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"ebs/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"ebs/test/integration/pages/Worklist",
		"ebs/test/integration/pages/Object",
		"ebs/test/integration/pages/NotFound",
		"ebs/test/integration/pages/Browser",
		"ebs/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "ebs.view."
	});

	sap.ui.require([
		"ebs/test/integration/WorklistJourney",
		"ebs/test/integration/ObjectJourney",
		"ebs/test/integration/NavigationJourney",
		"ebs/test/integration/NotFoundJourney",
		"ebs/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});
