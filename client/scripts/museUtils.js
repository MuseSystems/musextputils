/*************************************************************************
 *************************************************************************
 **
 ** File:        museUtils.js
 ** Project:     Muse Systems xTuple Utilities
 ** Author:      Steven C. Buttgereit
 **
 ** (C) 2016-2017 Lima Buttgereit Holdings LLC d/b/a Muse Systems
 **
 ** Contact:
 ** muse.information@musesystems.com  :: https://muse.systems
 ** 
 ** License: MIT License. See LICENSE.md for complete licensing details.
 **
 *************************************************************************
 ************************************************************************/

//////////////////////////////////////////////////////////////////////////
//  Namespace Definition
//////////////////////////////////////////////////////////////////////////

this.MuseUtils = this.MuseUtils || {};

//////////////////////////////////////////////////////////////////////////
//  Includes
//////////////////////////////////////////////////////////////////////////

// Number formatting and basic math.
if(!this.numbro) {
    include("numbro");
}

if(!MuseUtils.isMuseUtilsJsPolyfillLoaded) {
    include("museUtilsJsPolyfill");
}

if(!MuseUtils.isMuseUtilsExceptionLoaded) {
    include("museUtilsException");
}

if(!MuseUtils.isMuseUtilsConfigLoaded) {
    include("museUtilsConfig");
}

if(!MuseUtils.isMuseUtilsQtLoaded) {
    include("museUtilsQt");
}

if(!MuseUtils.isMuseUtilsUserLoaded) {
    include("museUtilsUser");
}

if(!MuseUtils.isMuseUtilsJsLoaded) {
    include("museUtilsJs");
}

if(!MuseUtils.isMuseUtilsDbLoaded) {
    include("museUtilsDb");
}
