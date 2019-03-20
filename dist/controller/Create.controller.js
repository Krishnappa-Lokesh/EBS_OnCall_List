sap.ui.define([	
		"ebs/controller/BaseController",
		"sap/ui/core/routing/History",
		"sap/m/MessageToast",
		"sap/ui/model/json/JSONModel"
	],	function(BaseController, History, MessageToast, JSONModel) {
		"use strict";

		return BaseController.extend("ebs.controller.Create", {

			onInit: function() {

				this.getRouter().getRoute("create").attachPatternMatched(this._onRouterMatched, this);
				
				this.registerViewWithMessageManager();
				
				// Model to store local view data and  control states
				var oViewModel = new JSONModel({

					saveAsTileTitle: this.getResourceBundle().getText("createViewTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("createViewTitle"),
					
					shareSendEmailAddress: this.getResourceBundle().getText("shareSendEmailAddress"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailcreateSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailcreateMessage", [location.href]),
				});
				this.setModel(oViewModel, "createView");


			},
			
			onNavBack: function() {
				// discard new record from model.
				this.getModel().deleteCreatedEntry(this._oContext);

				var sPreviousHash = History.getInstance().getPreviousHash(),
					oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

				if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
					history.go(-1);
				} else {
					this.getRouter().navTo("worklist", {}, true);
				}
			},

			
			_onRouterMatched: function() {
				var oModel = this.getModel();
				oModel.metadataLoaded().then(this._onMetadataLoaded.bind(this));
			},
			
			_onMetadataLoaded: function() {
				var oProperties = {
					"keyField": ""
				};

				var oContext = this.getModel().createEntry("/OnCallListSet", {
					properties: oProperties,
					success: this._onCreateSuccess.bind(this)
				});

				this.getView().unbindElement();
				this.getView().setBindingContext(oContext);
				


				//-->>  Initialize field values
				// These fields are not bound to oData Model, that is why needs to initialize

				/* @type sap.m.DatePicker */
				var oDate = this.byId("onCallDate");

				/* @type sap.m.ComboBox */
				var oUser = this.byId("userNamesComboBox");
				var oTeam = this.byId("teamComboBox");

				oDate.setMinDate(new Date());
				oUser.setValue("");				
				oUser.setSelectedKey("");
				oUser.setValueState(sap.ui.core.ValueState.None);
				oTeam.setValue("");
				oTeam.setSelectedKey("");
				oTeam.setValueState(sap.ui.core.ValueState.None);

				//-->> Enable save button
				var oSaveButton = this.byId("saveButton");
				oSaveButton.setEnabled(true);


			},
			
			_onCreateSuccess: function(oItem) {
				// create key to navigate
				this.getRouter().navTo("object", {
					objectId: oItem.keyField
				}, true);

				this.getView().unbindObject();
				// Message toast - Success	
				var sMessage = this.getResourceBundle().getText("newObjectCreated", [oItem.onCallWeek]);
				MessageToast.show(sMessage, {
					closeBrowserNavigation: false
				});
			},
			
			onCbSelectionChange: function(oEvent) {
				// Get the Key from Selected Item and bind to oData Model
				var oSource = oEvent.getSource();
				var sSelectedKey = oSource.getSelectedKey();
				var sKeyName = "/" + oSource.getSelectedItem().getBindingInfo('key').parts[0].path;

				var sPath = this.getView().getBindingContext().getPath();

				this.getModel().setProperty(sPath + sKeyName ,sSelectedKey);
				oSource.setValueState(sap.ui.core.ValueState.None);
			
			},
			

			onCancel: function() {
				this.onNavBack();
			},
			
			handleDateChange: function(oEvent) {
				//Validate Date field
				var oSource = oEvent.getSource();
				var bValid = oEvent.getParameter("valid");				
				
				if (bValid) {
					oSource.setValueState(sap.ui.core.ValueState.None);
				} 
				else {
					oSource.setValueState(sap.ui.core.ValueState.Error);
					oSource.focus();

				}			
				
			},

			handleCBDataChange: function(oEvent) {
				//Validate Data input fields
				var oSource = oEvent.getSource();
				if (oSource.getProperty('selectedKey')) {
					oSource.setValueState(sap.ui.core.ValueState.None);
				} 
				else {
					oSource.setValueState(sap.ui.core.ValueState.Error);
				}			
				
			},
			
			onSave: function(oEvent) {
				var oSaveButton = oEvent.getSource();

				// Validate screen elements before save
				/* @type  sap.m.DatePicker */
				var oDate = this.byId("onCallDate");
				
				/* @type sap.m.ComboBox */
				var oUser = this.byId("userNamesComboBox");
				var oTeam = this.byId("teamComboBox");


				if (oDate.getValue() === "" || oDate.getValueState() === "Error" ) {
					oDate.setValueState(sap.ui.core.ValueState.Error);
					MessageToast.show("Please select date for week on Call");
				} else	if (oTeam.getSelectedKey() === "") {
					oTeam.setValueState(sap.ui.core.ValueState.Error);
					MessageToast.show("Please select Team");
				} else if (oUser.getSelectedKey() === "") {
					oUser.setValueState(sap.ui.core.ValueState.Error);
					MessageToast.show("Please select Team member");
				} else

				    {

					//Disable Save button to avoid multiple press by user
					oSaveButton.setEnabled(false);

					// Save data
					this.getModel().submitChanges({
						// Success Message
						success: function() {
							MessageToast.show("Data is saved!", {
								duration: 3000, // default
								width: "15em", // default
								my: sap.ui.core.Popup.Dock.CenterCenter,
								at: sap.ui.core.Popup.Dock.CenterCenter,
								of: window, // default
								offset: "0 0", // default
								collision: "fit fit", // default
								onClose: null, // default
								autoClose: false, // default
								animationTimingFunction: "ease", // default
								animationDuration: 1000, // default
								closeOnBrowserNavigation: true // default
							});
						}
					}, {
						//Error Message
						error: function() {
							MessageToast.show("Error updating record");
						}
					});
				}
			},
			/**
			 * Event handler when the share in JAM button has been clicked
			 * @public
			 */
			onShareInJamPress: function() {
				var oViewModel = this.getModel("createView"),
					oShareDialog = sap.ui.getCore().createComponent({
						name: "sap.collaboration.components.fiori.sharing.dialog",
						settings: {
							object: {
								id: location.href,
								share: oViewModel.getProperty("/shareOnJamTitle")
							}
						}
					});
				oShareDialog.open();
			}
		});
	}
);