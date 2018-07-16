/*************************************************************************
 *************************************************************************
 **
 ** File:        museUtilsExceptionDialog.js
 ** Project:     Muse Systems xTuple ERP Utilities
 ** Author:      Steven C. Buttgereit
 **
 ** (C) 2017 Lima Buttgereit Holdings LLC d/b/a Muse Systems
 **
 ** Contact:
 ** muse.information@musesystems.com  :: https://muse.systems
 **
 ** License: MIT License. See LICENSE.md for complete licensing details.
 **
 *************************************************************************
 ************************************************************************/

try {
    //////////////////////////////////////////////////////////////////////////
    //  Namespace Definition
    //////////////////////////////////////////////////////////////////////////

    if (typeof MuseUtils === "undefined") {
        MuseUtils = {};
    }

    if (typeof MuseUtils.Exception === "undefined") {
        MuseUtils.Exception = {};
    }
} catch (e) {
    QMessageBox.critical(
        mainwindow,
        "MuseUtils.Exception Script Error",
        "We encountered a script level issue while processing MuseUtils.Exception."
    );
}

//////////////////////////////////////////////////////////////////////////
//  Module Defintion
//////////////////////////////////////////////////////////////////////////

(function(pPublicApi, pGlobal) {
    try {
        //--------------------------------------------------------------------
        //  Constants and Module State
        //--------------------------------------------------------------------

        //--------------------------------------------------------------------
        //  Get Object References From Screen Definitions
        //--------------------------------------------------------------------
        var sysNotificationTextEdit = mywindow.findChild(
            "sysNotificationTextEdit"
        );
        var buttonBox = mywindow.findChild("buttonBox");
        var debugGroupBox = mywindow.findChild("debugGroupBox");
        var debugTextEdit = mywindow.findChild("debugTextEdit");

        //--------------------------------------------------------------------
        //  Custom Screen Objects and Starting GUI Manipulation
        //--------------------------------------------------------------------
        var closeButton = buttonBox.addButton(
            "Close",
            QDialogButtonBox.AcceptRole
        );

        var techDetailsButton = buttonBox.addButton(
            "Show Technical\nDetails",
            QDialogButtonBox.ActionRole
        );

        debugGroupBox.visible = false;

        techDetailsButton.checkable = true;

        //--------------------------------------------------------------------
        //  Private Functional Logic
        //--------------------------------------------------------------------

        //--------------------------------------------------------------------
        //  Public Interface -- Slots
        //--------------------------------------------------------------------
        pPublicApi.sOpenTechDetails = function() {
            debugGroupBox.visible = techDetailsButton.checked;
        };

        pPublicApi.sClose = function() {
            mydialog.accept();
        };

        //--------------------------------------------------------------------
        //  Public Interface -- Functions
        //--------------------------------------------------------------------

        pPublicApi.set = function(pParams) {
            sysNotificationTextEdit.plainText =
                pParams.systemNotification || "(None Provided)";
            debugTextEdit.plainText = pParams.debugData || "(None Provided)";

            //----------------------------------------------------------------
            //  Set Timed Connects/Disconnects
            //----------------------------------------------------------------
        };

        //--------------------------------------------------------------------
        //  Definition Timed Connects/Disconnects
        //--------------------------------------------------------------------
        techDetailsButton.clicked.connect(pPublicApi.sOpenTechDetails);
        closeButton.clicked.connect(pPublicApi.sClose);

        //--------------------------------------------------------------------
        //  Foreign Script "Set" Handling
        //--------------------------------------------------------------------

        // "Set" handling base on suggestion of Gil Moskowitz/xTuple.
        var foreignSetFunc;

        // Lower graded scripts should be loaded prior to our call and as such we
        // should be able to intercept their set functions.
        if (typeof pGlobal.set === "function") {
            foreignSetFunc = pGlobal.set;
        } else {
            foreignSetFunc = function() {};
        }

        pGlobal.set = function(pParams) {
            try {
                foreignSetFunc(pParams);
                pPublicApi.set(pParams);
            } catch (e) {
                QMessageBox.critical(
                    mywindow,
                    "Form Initialization Error",
                    "We encountered a problem initializing the form.\n\n" + e
                );
                mywindow.close();
            }
        };
    } catch (e) {
        QMessageBox.critical(
            mainwindow,
            "MuseUtils.Exception Script Error",
            "We enountered a  MuseUtils.Exception module error that wasn't otherwise caught and handled."
        );
    }
})(MuseUtils.Exception, this);
